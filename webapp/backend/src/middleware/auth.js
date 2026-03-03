const tokenService = require('../utils/tokenService');
const { AuthenticationError, AuthorizationError } = require('../utils/errors');

// Authentication middleware - verifies JWT tokens
const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next(new AuthenticationError('Missing or invalid authorization header'));
  }

  const token = authHeader.slice(7); // Remove "Bearer "
  const decoded = tokenService.verifyToken(token);

  if (!decoded) {
    return next(new AuthenticationError('Invalid or expired token'));
  }

  req.user = decoded;
  next();
};

// Admin-only middleware - must be authenticated and have admin role
const requireAdmin = (req, res, next) => {
  if (!req.user) {
    return next(new AuthenticationError('Authentication required'));
  }

  if (!req.user.isAdmin) {
    return next(new AuthorizationError('Admin access required'));
  }

  next();
};

// Optional authentication - attach user info if token is valid, continue if not
const optionalAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.slice(7);
    const decoded = tokenService.verifyToken(token);
    if (decoded) {
      req.user = decoded;
    }
  }

  next();
};

module.exports = {
  authenticate,
  requireAdmin,
  optionalAuth,
};
