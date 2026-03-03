const express = require('express');
const orderService = require('../services/orderService');
const { authenticate, requireAdmin, optionalAuth } = require('../middleware/auth');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const logger = require('../utils/logger');

const router = express.Router();

// Create order (anonymous or authenticated)
router.post('/', optionalAuth, async (req, res, next) => {
  try {
    const { items, userEmail, shippingAddress, shippingCity, shippingState, shippingZip } = req.body;

    const { order, clientSecret, items: orderItems } = await orderService.createOrder(
      items,
      userEmail,
      shippingAddress,
      shippingCity,
      shippingState,
      shippingZip,
      req.user?.userId || null
    );

    logger.info('Order created', { orderId: order.id, totalCents: order.total_amount_cents });

    res.status(201).json({
      orderId: order.id,
      orderNumber: order.order_number,
      clientSecret,
      totalAmountCents: order.total_amount_cents,
      shippingCostCents: order.shipping_cost_cents,
      taxAmountCents: order.tax_amount_cents,
      items: orderItems,
    });
  } catch (error) {
    next(error);
  }
});

// Get order by ID
router.get('/:orderId', optionalAuth, async (req, res, next) => {
  try {
    const order = await orderService.getOrder(req.params.orderId);

    // Check authorization
    if (order.user_id && req.user?.userId !== order.user_id && !req.user?.isAdmin) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    res.json(order);
  } catch (error) {
    next(error);
  }
});

// Get order by order number (for email/verification)
router.get('/number/:orderNumber', optionalAuth, async (req, res, next) => {
  try {
    const order = await orderService.getOrderByNumber(req.params.orderNumber);

    // Check authorization
    if (order.user_id && req.user?.userId !== order.user_id && !req.user?.isAdmin) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    res.json(order);
  } catch (error) {
    next(error);
  }
});

// Get user's orders
router.get('/', authenticate, async (req, res, next) => {
  try {
    const orders = await orderService.getUserOrders(req.user.userId);
    res.json(orders);
  } catch (error) {
    next(error);
  }
});

// Admin: Get all orders
router.get('/admin/all', authenticate, requireAdmin, async (req, res, next) => {
  try {
    // This would need a dedicated service method to list all orders
    // For now, we'll return empty. Implement full order list in orderService
    res.json([]);
  } catch (error) {
    next(error);
  }
});

// Admin: Update order status
router.patch('/:orderId/status', authenticate, requireAdmin, async (req, res, next) => {
  try {
    const { status } = req.body;
    const order = await orderService.updateOrderStatus(req.params.orderId, status);
    logger.info('Order status updated', { orderId: req.params.orderId, status });
    res.json(order);
  } catch (error) {
    next(error);
  }
});

// Webhook: Handle Stripe payment success/failure
router.post('/webhook/stripe', express.raw({ type: 'application/json' }), async (req, res, next) => {
  try {
    const sig = req.headers['stripe-signature'];
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    let event;

    try {
      event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
    } catch (err) {
      logger.error('Webhook signature verification failed', err.message);
      return res.sendStatus(400);
    }

    if (event.type === 'payment_intent.succeeded') {
      await orderService.handlePaymentSuccess(event.data.object.id);
      logger.info('Payment succeeded', { paymentIntentId: event.data.object.id });
    } else if (event.type === 'payment_intent.payment_failed') {
      await orderService.handlePaymentFailure(
        event.data.object.id,
        event.data.object.last_payment_error?.message
      );
      logger.info('Payment failed', { paymentIntentId: event.data.object.id });
    }

    res.json({ received: true });
  } catch (error) {
    logger.error('Webhook error', error.message);
    next(error);
  }
});

module.exports = router;
