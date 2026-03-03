const pool = require('../db/connection');
const { NotFoundError, ValidationError } = require('../utils/errors');
const validators = require('../utils/validators');
const logger = require('../utils/logger');

const productService = {
  async createProduct(name, description, priceCents, objModelPath = null) {
    // Validate inputs
    if (!name || typeof name !== 'string' || name.length === 0 || name.length > 255) {
      throw new ValidationError('Invalid product name', { field: 'name' });
    }

    if (priceCents < 0 || !Number.isInteger(priceCents)) {
      throw new ValidationError('Invalid price', { field: 'priceCents' });
    }

    // Check for duplicates
    const { rows: existing } = await pool.query(
      'SELECT id FROM products WHERE name = $1',
      [name]
    );

    if (existing.length > 0) {
      throw new ValidationError('Product already exists', { field: 'name' });
    }

    // Create product and inventory record in a transaction
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      const { rows: products } = await client.query(
        `INSERT INTO products (name, description, price_cents, obj_model_path, is_active)
         VALUES ($1, $2, $3, $4, true)
         RETURNING id, name, description, price_cents, obj_model_path, is_active, created_at`,
        [name, description || null, priceCents, objModelPath || null]
      );

      const product = products[0];

      // Create inventory record
      await client.query(
        'INSERT INTO inventory (product_id, quantity_on_hand, quantity_reserved) VALUES ($1, 0, 0)',
        [product.id]
      );

      await client.query('COMMIT');
      logger.info('Product created', { productId: product.id, name });
      return product;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  },

  async getProduct(productId) {
    const { rows: products } = await pool.query(
      `SELECT p.*, i.quantity_on_hand, i.quantity_reserved, i.quantity_available
       FROM products p
       LEFT JOIN inventory i ON p.id = i.product_id
       WHERE p.id = $1`,
      [productId]
    );

    if (products.length === 0) {
      throw new NotFoundError('Product');
    }

    return products[0];
  },

  async getProductByName(name) {
    const { rows: products } = await pool.query(
      `SELECT p.*, i.quantity_on_hand, i.quantity_reserved, i.quantity_available
       FROM products p
       LEFT JOIN inventory i ON p.id = i.product_id
       WHERE p.name = $1`,
      [name]
    );

    if (products.length === 0) {
      throw new NotFoundError('Product');
    }

    return products[0];
  },

  async getAllProducts(includeInactive = false) {
    const query = `
      SELECT p.*, i.quantity_on_hand, i.quantity_reserved, i.quantity_available
      FROM products p
      LEFT JOIN inventory i ON p.id = i.product_id
      ${includeInactive ? '' : 'WHERE p.is_active = true'}
      ORDER BY p.name ASC
    `;

    const { rows } = await pool.query(query);
    return rows;
  },

  async updateProduct(productId, updates) {
    const allowed = ['name', 'description', 'price_cents', 'image_url', 'obj_model_path', 'is_active'];
    const updateKeys = Object.keys(updates).filter((k) => allowed.includes(k));

    if (updateKeys.length === 0) {
      throw new ValidationError('No valid fields to update');
    }

    // Check for duplicate name if updating
    if (updates.name) {
      const { rows: existing } = await pool.query(
        'SELECT id FROM products WHERE name = $1 AND id != $2',
        [updates.name, productId]
      );
      if (existing.length > 0) {
        throw new ValidationError('Product name already exists');
      }
    }

    const setClause = updateKeys
      .map((key, i) => `${key} = $${i + 1}`)
      .join(', ');
    const values = updateKeys.map((key) => updates[key]);

    const { rows: result } = await pool.query(
      `UPDATE products SET ${setClause}, updated_at = CURRENT_TIMESTAMP
       WHERE id = $${updateKeys.length + 1}
       RETURNING id, name, description, price_cents, obj_model_path, is_active, created_at, updated_at`,
      [...values, productId]
    );

    if (result.length === 0) {
      throw new NotFoundError('Product');
    }

    return result[0];
  },

  async updateInventory(productId, quantityOnHand, quantityReserved = 0) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // Verify product exists
      const { rows: products } = await client.query(
        'SELECT id FROM products WHERE id = $1',
        [productId]
      );

      if (products.length === 0) {
        throw new NotFoundError('Product');
      }

      // Update inventory
      const { rows: inventory } = await client.query(
        `UPDATE inventory
         SET quantity_on_hand = $1, quantity_reserved = $2, updated_at = CURRENT_TIMESTAMP
         WHERE product_id = $3
         RETURNING *`,
        [quantityOnHand, quantityReserved, productId]
      );

      await client.query('COMMIT');
      logger.info('Inventory updated', { productId, quantityOnHand, quantityReserved });
      return inventory[0];
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  },

  async getInventory(productId) {
    const { rows: inventory } = await pool.query(
      'SELECT * FROM inventory WHERE product_id = $1',
      [productId]
    );

    if (inventory.length === 0) {
      throw new NotFoundError('Inventory');
    }

    return inventory[0];
  },

  async decrementInventory(productId, quantity) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // Lock and check inventory
      const { rows: inventory } = await client.query(
        'SELECT * FROM inventory WHERE product_id = $1 FOR UPDATE',
        [productId]
      );

      if (inventory.length === 0) {
        throw new NotFoundError('Inventory');
      }

      const inv = inventory[0];
      const available = inv.quantity_on_hand - inv.quantity_reserved;

      if (available < quantity) {
        throw new ValidationError('Insufficient inventory', { available, requested: quantity });
      }

      // Increment reserved quantity
      const { rows: updated } = await client.query(
        `UPDATE inventory
         SET quantity_reserved = quantity_reserved + $1, updated_at = CURRENT_TIMESTAMP
         WHERE product_id = $2
         RETURNING *`,
        [quantity, productId]
      );

      await client.query('COMMIT');
      return updated[0];
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  },

  async releaseInventory(productId, quantity) {
    const { rows: updated } = await pool.query(
      `UPDATE inventory
       SET quantity_reserved = GREATEST(quantity_reserved - $1, 0), updated_at = CURRENT_TIMESTAMP
       WHERE product_id = $2
       RETURNING *`,
      [quantity, productId]
    );

    if (updated.length === 0) {
      throw new NotFoundError('Inventory');
    }

    return updated[0];
  },
};

module.exports = productService;
