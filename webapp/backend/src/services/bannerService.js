const pool = require('../db/connection');
const { NotFoundError, ValidationError } = require('../utils/errors');
const logger = require('../utils/logger');

const bannerService = {
  async createBanner(title, content, bannerType, expiresAt, userId) {
    // Validate inputs
    if (!title || typeof title !== 'string' || title.length === 0 || title.length > 255) {
      throw new ValidationError('Invalid banner title');
    }
    if (!content || typeof content !== 'string' || content.length === 0) {
      throw new ValidationError('Invalid banner content');
    }
    if (!bannerType || typeof bannerType !== 'string') {
      throw new ValidationError('Invalid banner type');
    }

    // If expiresAt is provided, validate it's in the future
    if (expiresAt && new Date(expiresAt) <= new Date()) {
      throw new ValidationError('Expiration date must be in the future');
    }

    const { rows: result } = await pool.query(
      `INSERT INTO banners (title, content, banner_type, expires_at, is_active, created_by)
       VALUES ($1, $2, $3, $4, true, $5)
       RETURNING id, title, content, banner_type, expires_at, is_active, created_by, created_at, updated_at`,
      [title, content, bannerType, expiresAt || null, userId]
    );

    logger.info('Banner created', { bannerId: result[0].id, title });
    return result[0];
  },

  async getBanner(bannerId) {
    const { rows: banners } = await pool.query(
      `SELECT b.*, u.email, u.first_name, u.last_name
       FROM banners b
       LEFT JOIN users u ON b.created_by = u.id
       WHERE b.id = $1`,
      [bannerId]
    );

    if (banners.length === 0) {
      throw new NotFoundError('Banner');
    }

    return banners[0];
  },

  async getActiveBanners() {
    const { rows: banners } = await pool.query(
      `SELECT b.*, u.email, u.first_name, u.last_name
       FROM banners b
       LEFT JOIN users u ON b.created_by = u.id
       WHERE b.is_active = true
       AND (b.expires_at IS NULL OR b.expires_at > CURRENT_TIMESTAMP)
       ORDER BY b.created_at DESC`
    );
    return banners;
  },

  async getAllBanners() {
    const { rows: banners } = await pool.query(
      `SELECT b.*, u.email, u.first_name, u.last_name
       FROM banners b
       LEFT JOIN users u ON b.created_by = u.id
       ORDER BY b.created_at DESC`
    );
    return banners;
  },

  async updateBanner(bannerId, updates) {
    const allowed = ['title', 'content', 'banner_type', 'expires_at', 'is_active'];
    const updateKeys = Object.keys(updates).filter((k) => allowed.includes(k));

    if (updateKeys.length === 0) {
      throw new ValidationError('No valid fields to update');
    }

    // Validate expiresAt if being updated
    if (updates.expires_at && new Date(updates.expires_at) <= new Date()) {
      throw new ValidationError('Expiration date must be in the future');
    }

    const setClause = updateKeys
      .map((key, i) => `${key} = $${i + 1}`)
      .join(', ');
    const values = updateKeys.map((key) => updates[key]);

    const { rows: result } = await pool.query(
      `UPDATE banners SET ${setClause}, updated_at = CURRENT_TIMESTAMP
       WHERE id = $${updateKeys.length + 1}
       RETURNING id, title, content, banner_type, expires_at, is_active, created_by, created_at, updated_at`,
      [...values, bannerId]
    );

    if (result.length === 0) {
      throw new NotFoundError('Banner');
    }

    logger.info('Banner updated', { bannerId });
    return result[0];
  },

  async deactivateBanner(bannerId) {
    const { rows: result } = await pool.query(
      `UPDATE banners SET is_active = false, updated_at = CURRENT_TIMESTAMP
       WHERE id = $1
       RETURNING id, title, content, banner_type, expires_at, is_active, created_by, created_at, updated_at`,
      [bannerId]
    );

    if (result.length === 0) {
      throw new NotFoundError('Banner');
    }

    logger.info('Banner deactivated', { bannerId });
    return result[0];
  },

  async deleteBanner(bannerId) {
    const { rows: result } = await pool.query(
      'DELETE FROM banners WHERE id = $1 RETURNING id',
      [bannerId]
    );

    if (result.length === 0) {
      throw new NotFoundError('Banner');
    }

    logger.info('Banner deleted', { bannerId });
    return { success: true };
  },

  async cleanupExpiredBanners() {
    const { rows: result } = await pool.query(
      `UPDATE banners SET is_active = false, updated_at = CURRENT_TIMESTAMP
       WHERE is_active = true AND expires_at <= CURRENT_TIMESTAMP
       RETURNING id`
    );

    if (result.length > 0) {
      logger.info('Expired banners deactivated', { count: result.length });
    }

    return result;
  },
};

module.exports = bannerService;
