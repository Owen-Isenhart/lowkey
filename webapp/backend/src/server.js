require('dotenv').config();
const express = require('express');
const cors = require('cors');
const pool = require('./db/connection');
const logger = require('./utils/logger');
const { errorHandler, notFound } = require('./middleware/errorHandler');

const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');
const eventRoutes = require('./routes/events');
const bannerRoutes = require('./routes/banners');
const batchRoutes = require('./routes/batches');
const recipeRoutes = require('./routes/recipes');
const orderRoutes = require('./routes/orders');

const app = express();

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
}));

// JSON parser with size limit
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/banners', bannerRoutes);
app.use('/api/batches', batchRoutes);
app.use('/api/recipes', recipeRoutes);
app.use('/api/orders', orderRoutes);

// 404 handler
app.use(notFound);

// Error handler (must be last)
app.use(errorHandler);

// Database connection test
const testConnection = async () => {
  try {
    const result = await pool.query('SELECT NOW()');
    logger.info('Database connected', { timestamp: result.rows[0].now });
  } catch (error) {
    logger.error('Database connection failed', error.message);
    process.exit(1);
  }
};

const PORT = process.env.PORT || 3001;

// Start server
const startServer = async () => {
  await testConnection();

  app.listen(PORT, () => {
    logger.info(`Server running on http://localhost:${PORT}`);
    logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
  });
};

startServer().catch((error) => {
  logger.error('Failed to start server', error);
  process.exit(1);
});

// Graceful shutdown
process.on('SIGINT', async () => {
  logger.info('Server shutting down...');
  await pool.end();
  process.exit(0);
});
