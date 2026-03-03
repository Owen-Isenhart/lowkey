const logger = require('../utils/logger');
const { AppError } = require('../utils/errors');

// Global error handler middleware - must be last
const errorHandler = (err, req, res, next) => {
  logger.error('Error', {
    name: err.name,
    message: err.message,
    statusCode: err.statusCode || 500,
  });

  if (err instanceof AppError) {
    return res.status(err.statusCode).json(err.toJSON());
  }

  // Unexpected error
  res.status(500).json({
    message: 'Internal server error',
    statusCode: 500,
    timestamp: new Date().toISOString(),
    ...(process.env.NODE_ENV === 'development' && { error: err.message }),
  });
};

// 404 middleware - catches unmatched routes
const notFound = (req, res) => {
  res.status(404).json({
    message: `Cannot ${req.method} ${req.path}`,
    statusCode: 404,
    timestamp: new Date().toISOString(),
  });
};

module.exports = {
  errorHandler,
  notFound,
};
