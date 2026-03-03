const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET;
const ACCESS_TOKEN_EXPIRY = '1h';
const REFRESH_TOKEN_EXPIRY = '7d';

const tokenService = {
  generateAccessToken(userId, isAdmin = false) {
    return jwt.sign(
      { userId, isAdmin },
      JWT_SECRET,
      { expiresIn: ACCESS_TOKEN_EXPIRY }
    );
  },

  generateRefreshToken(userId) {
    return jwt.sign(
      { userId },
      JWT_SECRET,
      { expiresIn: REFRESH_TOKEN_EXPIRY }
    );
  },

  verifyToken(token) {
    try {
      return jwt.verify(token, JWT_SECRET);
    } catch (error) {
      return null;
    }
  },

  decodeToken(token) {
    try {
      return jwt.decode(token);
    } catch (error) {
      return null;
    }
  },

  generateTokenPair(userId, isAdmin = false) {
    return {
      accessToken: this.generateAccessToken(userId, isAdmin),
      refreshToken: this.generateRefreshToken(userId),
    };
  },
};

module.exports = tokenService;
