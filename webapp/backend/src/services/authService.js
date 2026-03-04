const axios = require('axios');
const crypto = require('crypto');
const pool = require('../db/connection');
const tokenService = require('../utils/tokenService');
const { AuthenticationError, NotFoundError, ValidationError } = require('../utils/errors');
const logger = require('../utils/logger');

const hashToken = (token) => crypto.createHash('sha256').update(token).digest('hex');

const authService = {
  async getGoogleTokens(code) {
    try {
      const response = await axios.post('https://oauth2.googleapis.com/token', {
        code,
        client_id: process.env.GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
        redirect_uri: process.env.GOOGLE_REDIRECT_URI,
        grant_type: 'authorization_code',
      });

      return response.data;
    } catch (error) {
      logger.error('Failed to exchange Google auth code', error.response?.data || error.message);
      throw new AuthenticationError('Failed to authenticate with Google');
    }
  },

  async getGoogleUserInfo(accessToken) {
    try {
      const response = await axios.get('https://www.googleapis.com/oauth2/v2/userinfo', {
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      return response.data;
    } catch (error) {
      logger.error('Failed to fetch Google user info', error.message);
      throw new AuthenticationError('Failed to fetch user information');
    }
  },

  async handleGoogleCallback(code) {
    try {
      // Exchange code for tokens with Google
      const { access_token } = await this.getGoogleTokens(code);

      // Get user info from Google
      const googleUser = await this.getGoogleUserInfo(access_token);

      // Validate email
      if (!googleUser.email || !googleUser.id) {
        throw new ValidationError('Invalid Google user information');
      }

      // Find or create user in database
      const { rows: users } = await pool.query(
        'SELECT * FROM users WHERE google_id = $1',
        [googleUser.id]
      );

      let user;

      if (users.length > 0) {
        user = users[0];
        // Update user info if available
        if (googleUser.picture) {
          await pool.query(
            'UPDATE users SET picture_url = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
            [googleUser.picture, user.id]
          );
        }
      } else {
        // Create new user
        const nameParts = (googleUser.name || '').split(' ');
        const firstName = nameParts[0] || '';
        const lastName = nameParts.slice(1).join(' ') || '';

        const { rows: newUsers } = await pool.query(
          `INSERT INTO users (email, google_id, first_name, last_name, picture_url, is_admin)
           VALUES ($1, $2, $3, $4, $5, false)
           RETURNING id, email, first_name, last_name, picture_url, is_admin`,
          [googleUser.email, googleUser.id, firstName, lastName, googleUser.picture || null]
        );
        user = newUsers[0];
        logger.info('New user created via OAuth', { email: user.email });
      }

      // Generate JWT tokens for frontend
      const tokens = tokenService.generateTokenPair(user.id, user.is_admin);

      // Store refresh token in database
      const hashedRefreshToken = hashToken(tokens.refreshToken);
      await pool.query(
        `INSERT INTO sessions (user_id, refresh_token, expires_at)
         VALUES ($1, $2, NOW() + INTERVAL '7 days')`,
        [user.id, hashedRefreshToken]
      );

      return {
        user: {
          id: user.id,
          email: user.email,
          firstName: user.first_name,
          lastName: user.last_name,
          pictureUrl: user.picture_url,
          isAdmin: user.is_admin,
        },
        tokens,
      };
    } catch (error) {
      if (error instanceof AuthenticationError || error instanceof ValidationError) {
        throw error;
      }
      logger.error('Error in handleGoogleCallback', error.message);
      throw new AuthenticationError('Failed to complete authentication');
    }
  },

  async handleInternalLogin({ providerId, email, firstName, lastName, picture }) {
    try {
      if (!email || !providerId) {
        throw new ValidationError('Invalid user information');
      }

      const { rows: users } = await pool.query(
        'SELECT * FROM users WHERE google_id = $1 OR email = $2',
        [providerId, email]
      );

      let user;

      if (users.length > 0) {
        user = users[0];
        if (picture && user.picture_url !== picture) {
          await pool.query(
            'UPDATE users SET picture_url = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
            [picture, user.id]
          );
        }
      } else {
        const { rows: newUsers } = await pool.query(
          `INSERT INTO users (email, google_id, first_name, last_name, picture_url, is_admin)
           VALUES ($1, $2, $3, $4, $5, false)
           RETURNING id, email, first_name, last_name, picture_url, is_admin`,
          [email, providerId, firstName, lastName, picture || null]
        );
        user = newUsers[0];
        logger.info('New user created via internal auth proxy', { email: user.email });
      }

      const tokens = tokenService.generateTokenPair(user.id, user.is_admin);
      const hashedRefreshToken = hashToken(tokens.refreshToken);

      await pool.query(
        `INSERT INTO sessions (user_id, refresh_token, expires_at)
         VALUES ($1, $2, NOW() + INTERVAL '7 days')`,
        [user.id, hashedRefreshToken]
      );

      return {
        user: {
          id: user.id,
          email: user.email,
          firstName: user.first_name,
          lastName: user.last_name,
          pictureUrl: user.picture_url,
          isAdmin: user.is_admin,
        },
        tokens,
      };
    } catch (error) {
      if (error instanceof ValidationError) throw error;
      logger.error('Error in handleInternalLogin', error.message);
      throw new AuthenticationError('Failed to complete internal login');
    }
  },

  async refreshAccessToken(refreshToken) {
    try {
      const decoded = tokenService.verifyToken(refreshToken);
      if (!decoded?.userId) {
        throw new AuthenticationError('Invalid refresh token');
      }

      const hashedRefreshToken = hashToken(refreshToken);
      // Verify refresh token exists in database
      const { rows: sessions } = await pool.query(
        'SELECT * FROM sessions WHERE refresh_token = $1 AND expires_at > NOW()',
        [hashedRefreshToken]
      );

      if (sessions.length === 0) {
        throw new AuthenticationError('Refresh token expired or invalid');
      }

      const { rows: users } = await pool.query(
        'SELECT id, is_admin FROM users WHERE id = $1',
        [decoded.userId]
      );

      if (users.length === 0) {
        throw new NotFoundError('User');
      }

      const user = users[0];
      const accessToken = tokenService.generateAccessToken(user.id, user.is_admin);

      return { accessToken };
    } catch (error) {
      if (error instanceof AuthenticationError || error instanceof NotFoundError) {
        throw error;
      }
      throw new AuthenticationError('Failed to refresh token');
    }
  },

  async logout(refreshToken) {
    try {
      const hashedRefreshToken = hashToken(refreshToken);
      await pool.query(
        'DELETE FROM sessions WHERE refresh_token = $1',
        [hashedRefreshToken]
      );
      return { success: true };
    } catch (error) {
      logger.error('Error during logout', error.message);
      throw new Error('Failed to logout');
    }
  },

  async getCurrentUser(userId) {
    const { rows: users } = await pool.query(
      'SELECT id, email, first_name, last_name, picture_url, is_admin, created_at FROM users WHERE id = $1',
      [userId]
    );

    if (users.length === 0) {
      throw new NotFoundError('User');
    }

    const user = users[0];
    return {
      id: user.id,
      email: user.email,
      firstName: user.first_name,
      lastName: user.last_name,
      pictureUrl: user.picture_url,
      isAdmin: user.is_admin,
      createdAt: user.created_at,
    };
  },
};

module.exports = authService;
