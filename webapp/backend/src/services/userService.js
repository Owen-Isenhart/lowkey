const pool = require('../db/connection');
const { NotFoundError, ConflictError, ValidationError } = require('../utils/errors');
const logger = require('../utils/logger');

const userService = {
  async getUserById(userId) {
    const { rows: users } = await pool.query(
      'SELECT id, email, first_name, last_name, picture_url, is_admin, created_at FROM users WHERE id = $1',
      [userId]
    );

    if (users.length === 0) {
      throw new NotFoundError('User');
    }

    return users[0];
  },

  async setUserAsAdmin(userId) {
    const { rows: users } = await pool.query(
      'SELECT id FROM users WHERE id = $1',
      [userId]
    );

    if (users.length === 0) {
      throw new NotFoundError('User');
    }

    const { rows: updated } = await pool.query(
      'UPDATE users SET is_admin = true, updated_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING *',
      [userId]
    );

    logger.info('User promoted to admin', { userId });
    return updated[0];
  },

  async removeAdminFromUser(userId) {
    const { rows: users } = await pool.query(
      'SELECT id FROM users WHERE id = $1',
      [userId]
    );

    if (users.length === 0) {
      throw new NotFoundError('User');
    }

    const { rows: updated } = await pool.query(
      'UPDATE users SET is_admin = false, updated_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING *',
      [userId]
    );

    logger.info('User removed from admin', { userId });
    return updated[0];
  },

  async getAllUsers() {
    const { rows } = await pool.query(
      'SELECT id, email, first_name, last_name, is_admin, created_at FROM users ORDER BY created_at DESC'
    );
    return rows;
  },

  async getUserProfile(userId) {
    return this.getUserById(userId);
  },
};

module.exports = userService;
