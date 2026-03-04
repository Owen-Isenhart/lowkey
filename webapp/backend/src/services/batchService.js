const pool = require('../db/connection');
const { NotFoundError, ValidationError } = require('../utils/errors');
const logger = require('../utils/logger');

const batchService = {
  async getBatchById(id) {
    const { rows: batches } = await pool.query(
      `SELECT
         b.id,
         b.recipe_version,
         b.mixed_at,
         b.ph_level,
         b.notes,
         b.image_url,
         COALESCE(
           json_agg(json_build_object(
             'ingredient_name', src.ingredient_name,
             'supplier',        src.supplier,
             'lot_number',      src.lot_number
           )) FILTER (WHERE src.ingredient_name IS NOT NULL), 
           '[]'
         ) AS ingredient_sources
       FROM batches b
       LEFT JOIN batch_ingredient_sources src ON src.batch_id = b.id
       WHERE b.id = $1
       GROUP BY b.id`,
      [id]
    );

    if (batches.length === 0) return null;
    return batches[0];
  },

  async createBatch({ id, recipe_version, mixed_at, ph_level, notes, image_url }) {
    if (!id || !recipe_version || !mixed_at) {
      throw new ValidationError('Missing required fields for batch');
    }

    const { rows: existing } = await pool.query('SELECT id FROM batches WHERE id = $1', [id]);
    if (existing.length > 0) {
      const err = new ValidationError('Batch ID already exists');
      err.statusCode = 409;
      throw err;
    }

    const { rows: result } = await pool.query(
      `INSERT INTO batches (id, recipe_version, mixed_at, ph_level, notes, image_url)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id`,
      [id, recipe_version, mixed_at, ph_level || null, notes || null, image_url || null]
    );

    logger.info('Batch created', { batchId: result[0].id });
    return result[0];
  },

  async updateBatch(id, updates) {
    const allowed = ['recipe_version', 'ph_level', 'notes', 'image_url'];
    const updateKeys = Object.keys(updates).filter((k) => allowed.includes(k));

    if (updateKeys.length === 0) {
      throw new ValidationError('No valid fields to update');
    }

    const setClause = updateKeys
      .map((key, i) => `${key} = $${i + 1}`)
      .join(', ');
    const values = updateKeys.map((key) => updates[key]);

    const { rows: result } = await pool.query(
      `UPDATE batches SET ${setClause}
       WHERE id = $${updateKeys.length + 1}
       RETURNING id, recipe_version, mixed_at, ph_level, notes, image_url`,
      [...values, id]
    );

    if (result.length === 0) {
      throw new NotFoundError('Batch');
    }

    logger.info('Batch updated', { batchId: id });
    return result[0];
  },

  async deleteBatch(id) {
    const { rows: result } = await pool.query('DELETE FROM batches WHERE id = $1 RETURNING id', [id]);
    if (result.length === 0) {
      throw new NotFoundError('Batch');
    }
    logger.info('Batch deleted', { batchId: id });
    return { success: true };
  },

  async addBatchSource(batchId, { ingredient_name, supplier, lot_number }) {
    if (!ingredient_name || !supplier || !lot_number) {
      throw new ValidationError('Missing source fields');
    }

    await pool.query(
      `INSERT INTO batch_ingredient_sources (batch_id, ingredient_name, supplier, lot_number)
       VALUES ($1, $2, $3, $4)`,
      [batchId, ingredient_name, supplier, lot_number]
    );

    logger.info('Batch source added', { batchId });
    return { success: true };
  }
};

module.exports = batchService;
