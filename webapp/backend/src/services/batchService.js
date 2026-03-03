const pool = require('../db/connection');
const { v4: uuidv4 } = require('uuid');
const qrcode = require('qrcode');
const { NotFoundError, ValidationError } = require('../utils/errors');
const logger = require('../utils/logger');

const batchService = {
  async createBatch(productId, batchNumber, productionDate, expiryDate, quantityProduced, batchMetadata, imageUrl, userId) {
    // Validate inputs
    if (!productId || typeof productId !== 'string') {
      throw new ValidationError('Invalid product ID');
    }
    if (!batchNumber || typeof batchNumber !== 'string') {
      throw new ValidationError('Invalid batch number');
    }
    if (!productionDate || new Date(productionDate) > new Date()) {
      throw new ValidationError('Production date must be in the past');
    }
    if (!expiryDate || new Date(expiryDate) <= new Date(productionDate)) {
      throw new ValidationError('Expiry date must be after production date');
    }
    if (!quantityProduced || quantityProduced <= 0) {
      throw new ValidationError('Quantity produced must be positive');
    }

    // Verify product exists
    const { rows: products } = await pool.query(
      'SELECT id FROM products WHERE id = $1',
      [productId]
    );

    if (products.length === 0) {
      throw new NotFoundError('Product');
    }

    // Check for duplicate batch number
    const { rows: existing } = await pool.query(
      'SELECT id FROM batches WHERE batch_number = $1',
      [batchNumber]
    );

    if (existing.length > 0) {
      throw new ValidationError('Batch number already exists');
    }

    const batchId = uuidv4();
    const qrCodeData = batchId; // Encode UUID as QR code

    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // Create batch
      const { rows: batch } = await client.query(
        `INSERT INTO batches 
         (id, batch_number, product_id, production_date, expiry_date, quantity_produced, 
          qr_code_data, batch_metadata, image_url, created_by)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
         RETURNING id, batch_number, product_id, production_date, expiry_date, 
                   quantity_produced, qr_code_data, batch_metadata, image_url, created_by, created_at`,
        [
          batchId,
          batchNumber,
          productId,
          productionDate,
          expiryDate,
          quantityProduced,
          qrCodeData,
          batchMetadata ? JSON.stringify(batchMetadata) : null,
          imageUrl || null,
          userId,
        ]
      );

      // Update product inventory with batch quantity
      await client.query(
        `UPDATE inventory SET quantity_on_hand = quantity_on_hand + $1
         WHERE product_id = $2`,
        [quantityProduced, productId]
      );

      await client.query('COMMIT');
      logger.info('Batch created', { batchId, batchNumber, productId, quantityProduced });
      return batch[0];
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  },

  async getBatchById(batchId) {
    const { rows: batches } = await pool.query(
      `SELECT b.*, p.name as product_name, u.email, u.first_name, u.last_name
       FROM batches b
       LEFT JOIN products p ON b.product_id = p.id
       LEFT JOIN users u ON b.created_by = u.id
       WHERE b.id = $1`,
      [batchId]
    );

    if (batches.length === 0) {
      throw new NotFoundError('Batch');
    }

    const batch = batches[0];
    if (batch.batch_metadata) {
      batch.batch_metadata = JSON.parse(batch.batch_metadata);
    }
    return batch;
  },

  async getBatchByNumber(batchNumber) {
    const { rows: batches } = await pool.query(
      `SELECT b.*, p.name as product_name, u.email, u.first_name, u.last_name
       FROM batches b
       LEFT JOIN products p ON b.product_id = p.id
       LEFT JOIN users u ON b.created_by = u.id
       WHERE b.batch_number = $1`,
      [batchNumber]
    );

    if (batches.length === 0) {
      throw new NotFoundError('Batch');
    }

    const batch = batches[0];
    if (batch.batch_metadata) {
      batch.batch_metadata = JSON.parse(batch.batch_metadata);
    }
    return batch;
  },

  async getBatchByQRCode(qrCodeData) {
    const { rows: batches } = await pool.query(
      `SELECT b.*, p.name as product_name, u.email, u.first_name, u.last_name
       FROM batches b
       LEFT JOIN products p ON b.product_id = p.id
       LEFT JOIN users u ON b.created_by = u.id
       WHERE b.qr_code_data = $1`,
      [qrCodeData]
    );

    if (batches.length === 0) {
      throw new NotFoundError('Batch');
    }

    const batch = batches[0];
    if (batch.batch_metadata) {
      batch.batch_metadata = JSON.parse(batch.batch_metadata);
    }
    return batch;
  },

  async generateQRCode(batchId) {
    try {
      const qrCode = await qrcode.toDataURL(batchId);
      return qrCode;
    } catch (error) {
      logger.error('Failed to generate QR code', error.message);
      throw new Error('Failed to generate QR code');
    }
  },

  async getBatchesByProduct(productId) {
    const { rows: batches } = await pool.query(
      `SELECT b.*, p.name as product_name, u.email, u.first_name, u.last_name
       FROM batches b
       LEFT JOIN products p ON b.product_id = p.id
       LEFT JOIN users u ON b.created_by = u.id
       WHERE b.product_id = $1
       ORDER BY b.production_date DESC`,
      [productId]
    );

    return batches.map((batch) => ({
      ...batch,
      batch_metadata: batch.batch_metadata ? JSON.parse(batch.batch_metadata) : null,
    }));
  },

  async updateBatch(batchId, updates) {
    const allowed = ['batch_metadata', 'image_url'];
    const updateKeys = Object.keys(updates).filter((k) => allowed.includes(k));

    if (updateKeys.length === 0) {
      throw new ValidationError('No valid fields to update');
    }

    const setClause = updateKeys
      .map((key, i) => {
        if (key === 'batch_metadata' && updates[key]) {
          return `${key} = $${i + 1}::jsonb`;
        }
        return `${key} = $${i + 1}`;
      })
      .join(', ');

    const values = updateKeys.map((key) => {
      if (key === 'batch_metadata' && updates[key]) {
        return JSON.stringify(updates[key]);
      }
      return updates[key];
    });

    const { rows: result } = await pool.query(
      `UPDATE batches SET ${setClause}, updated_at = CURRENT_TIMESTAMP
       WHERE id = $${updateKeys.length + 1}
       RETURNING id, batch_number, product_id, production_date, expiry_date, 
                 quantity_produced, qr_code_data, batch_metadata, image_url, created_at, updated_at`,
      [...values, batchId]
    );

    if (result.length === 0) {
      throw new NotFoundError('Batch');
    }

    return result[0];
  },

  async getAllBatches() {
    const { rows: batches } = await pool.query(
      `SELECT b.*, p.name as product_name, u.email, u.first_name, u.last_name
       FROM batches b
       LEFT JOIN products p ON b.product_id = p.id
       LEFT JOIN users u ON b.created_by = u.id
       ORDER BY b.production_date DESC`
    );

    return batches.map((batch) => ({
      ...batch,
      batch_metadata: batch.batch_metadata ? JSON.parse(batch.batch_metadata) : null,
    }));
  },
};

module.exports = batchService;
