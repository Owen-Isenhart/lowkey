const pool = require('../db/connection');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { NotFoundError, ValidationError } = require('../utils/errors');
const logger = require('../utils/logger');
const productService = require('./productService');

// US state tax rates (simplified - use TaxJar for production)
const TAX_RATES = {
  AL: 0.04, CA: 0.0725, CO: 0.029, CT: 0.0635, DE: 0,
  FL: 0.06, GA: 0.04, HI: 0.04, ID: 0.06, IL: 0.0625,
  IN: 0.07, IA: 0.06, KS: 0.054, KY: 0.06, LA: 0.045,
  ME: 0.055, MD: 0.06, MA: 0.0625, MI: 0.06, MN: 0.06875,
  MS: 0.07, MO: 0.0725, MT: 0, NE: 0.055, NV: 0.0685,
  NH: 0, NJ: 0.0625, NM: 0.05625, NY: 0.08, NC: 0.07,
  ND: 0.05, OH: 0.0575, OK: 0.045, OR: 0, PA: 0.06,
  RI: 0.07, SC: 0.07, SD: 0.06, TN: 0.09525, TX: 0.0625,
  UT: 0.0595, VT: 0.06, VA: 0.0575, WA: 0.065, WV: 0.06,
  WI: 0.05, WY: 0.04,
  default: 0.06,
};

// Shipping rates by state (flat rate for simplicity)
const SHIPPING_RATES = {
  HI: 3000, // $30.00
  AK: 3500, // $35.00
  default: 1000, // $10.00
};

const orderService = {
  async createOrder(items, userEmail, shippingAddress, shippingCity, shippingState, shippingZip, userId) {
    // Validate inputs
    if (!Array.isArray(items) || items.length === 0) {
      throw new ValidationError('Must have at least one item');
    }

    if (!userEmail || !shippingAddress || !shippingCity || !shippingState || !shippingZip) {
      throw new ValidationError('Missing shipping information');
    }

    // Validate US state
    if (!TAX_RATES.hasOwnProperty(shippingState)) {
      throw new ValidationError('Invalid US state');
    }

    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // Calculate totals and validate inventory
      let subtotalCents = 0;
      const processedItems = [];

      for (const item of items) {
        const { rows: products } = await client.query(
          'SELECT price_cents FROM products WHERE id = $1',
          [item.product_id]
        );

        if (products.length === 0) {
          throw new NotFoundError('Product');
        }

        const product = products[0];
        const itemTotalCents = product.price_cents * item.quantity;
        subtotalCents += itemTotalCents;

        // Decrement/reserve inventory
        await client.query(
          `UPDATE inventory
           SET quantity_reserved = quantity_reserved + $1
           WHERE product_id = $2 AND (quantity_on_hand - quantity_reserved) >= $1`,
          [item.quantity, item.product_id]
        );

        processedItems.push({
          product_id: item.product_id,
          quantity: item.quantity,
          price_per_unit_cents: product.price_cents,
        });
      }

      // Calculate shipping
      const shippingCostCents = SHIPPING_RATES[shippingState] || SHIPPING_RATES.default;

      // Calculate tax
      const taxRate = TAX_RATES[shippingState] || TAX_RATES.default;
      const taxableCents = subtotalCents + shippingCostCents;
      const taxAmountCents = Math.round(taxableCents * taxRate);

      const totalCents = subtotalCents + shippingCostCents + taxAmountCents;

      // Create Stripe Payment Intent
      const paymentIntent = await stripe.paymentIntents.create({
        amount: totalCents,
        currency: 'usd',
        automatic_payment_methods: { enabled: true },
        metadata: {
          userId: userId || 'anonymous',
          orderEmail: userEmail,
        },
      });

      // Generate order number
      const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 5).toUpperCase()}`;

      // Create order record
      const { rows: orderRows } = await client.query(
        `INSERT INTO orders 
         (order_number, user_id, email, status, total_amount_cents, 
          shipping_address_line1, shipping_city, shipping_state, shipping_zip, shipping_country,
          shipping_cost_cents, tax_amount_cents, stripe_payment_intent_id)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
         RETURNING id, order_number, user_id, email, status, total_amount_cents, 
                   shipping_cost_cents, tax_amount_cents, created_at`,
        [
          orderNumber,
          userId || null,
          userEmail,
          'pending',
          totalCents,
          shippingAddress,
          shippingCity,
          shippingState,
          shippingZip,
          'US',
          shippingCostCents,
          taxAmountCents,
          paymentIntent.id,
        ]
      );

      const order = orderRows[0];

      // Create order items
      for (const item of processedItems) {
        await client.query(
          `INSERT INTO order_items 
           (order_id, product_id, quantity, price_per_unit_cents)
           VALUES ($1, $2, $3, $4)`,
          [order.id, item.product_id, item.quantity, item.price_per_unit_cents]
        );
      }

      await client.query('COMMIT');

      logger.info('Order created', {
        orderId: order.id,
        orderNumber: order.order_number,
        totalCents,
        itemCount: items.length,
      });

      return {
        order,
        clientSecret: paymentIntent.client_secret,
        items: processedItems,
      };
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  },

  async getOrder(orderId) {
    const { rows: orders } = await pool.query(
      'SELECT * FROM orders WHERE id = $1',
      [orderId]
    );

    if (orders.length === 0) {
      throw new NotFoundError('Order');
    }

    const order = orders[0];

    // Get order items
    const { rows: items } = await pool.query(
      `SELECT oi.*, p.name as product_name
       FROM order_items oi
       LEFT JOIN products p ON oi.product_id = p.id
       WHERE oi.order_id = $1`,
      [orderId]
    );

    order.items = items;
    return order;
  },

  async getOrderByNumber(orderNumber) {
    const { rows: orders } = await pool.query(
      'SELECT * FROM orders WHERE order_number = $1',
      [orderNumber]
    );

    if (orders.length === 0) {
      throw new NotFoundError('Order');
    }

    const order = orders[0];

    // Get order items
    const { rows: items } = await pool.query(
      `SELECT oi.*, p.name as product_name
       FROM order_items oi
       LEFT JOIN products p ON oi.product_id = p.id
       WHERE oi.order_id = $1`,
      [order.id]
    );

    order.items = items;
    return order;
  },

  async getUserOrders(userId) {
    const { rows: orders } = await pool.query(
      'SELECT * FROM orders WHERE user_id = $1 ORDER BY created_at DESC',
      [userId]
    );

    return orders;
  },

  async handlePaymentSuccess(paymentIntentId) {
    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      const { rows: orders } = await client.query(
        'SELECT id FROM orders WHERE stripe_payment_intent_id = $1',
        [paymentIntentId]
      );

      if (orders.length === 0) {
        throw new NotFoundError('Order');
      }

      const orderId = orders[0].id;

      // Get order items
      const { rows: items } = await client.query(
        'SELECT product_id, quantity FROM order_items WHERE order_id = $1',
        [orderId]
      );

      // Update order status
      await client.query(
        'UPDATE orders SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
        ['processing', orderId]
      );

      // Update inventory: decrement on_hand, clear reserved
      for (const item of items) {
        await client.query(
          `UPDATE inventory
           SET quantity_on_hand = quantity_on_hand - $1, quantity_reserved = 0
           WHERE product_id = $2`,
          [item.quantity, item.product_id]
        );
      }

      await client.query('COMMIT');

      logger.info('Payment processed and order confirmed', { orderId, status: 'processing' });
      return orderId;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  },

  async handlePaymentFailure(paymentIntentId, reason) {
    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      const { rows: orders } = await client.query(
        'SELECT id FROM orders WHERE stripe_payment_intent_id = $1 FOR UPDATE',
        [paymentIntentId]
      );

      if (orders.length > 0) {
        const orderId = orders[0].id;

        // Get order items to release reservation
        const { rows: items } = await client.query(
          'SELECT product_id, quantity FROM order_items WHERE order_id = $1',
          [orderId]
        );

        // Update order status
        await client.query(
          'UPDATE orders SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
          ['failed', orderId]
        );

        // Release reserved inventory
        for (const item of items) {
          await client.query(
            `UPDATE inventory
             SET quantity_reserved = GREATEST(quantity_reserved - $1, 0)
             WHERE product_id = $2`,
            [item.quantity, item.product_id]
          );
        }

        logger.info('Payment failed and inventory released', { orderId, reason });
      }

      await client.query('COMMIT');
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  },

  async updateOrderStatus(orderId, status) {
    const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
    if (!validStatuses.includes(status)) {
      throw new ValidationError('Invalid order status');
    }

    const { rows: result } = await pool.query(
      'UPDATE orders SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *',
      [status, orderId]
    );

    if (result.length === 0) {
      throw new NotFoundError('Order');
    }

    logger.info('Order status updated', { orderId, status });
    return result[0];
  },
};

module.exports = orderService;
