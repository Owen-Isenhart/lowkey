const express = require('express');
const batchService = require('../services/batchService');
const { authenticate, requireAdmin, optionalAuth } = require('../middleware/auth');
const logger = require('../utils/logger');

const router = express.Router();

// Public: Get batch by QR code (for scanning)
router.get('/qr/:qrCode', optionalAuth, async (req, res, next) => {
  try {
    const batch = await batchService.getBatchByQRCode(req.params.qrCode);
    res.json(batch);
  } catch (error) {
    next(error);
  }
});

// Public: Get batch by ID
router.get('/:batchId', optionalAuth, async (req, res, next) => {
  try {
    const batch = await batchService.getBatchById(req.params.batchId);
    res.json(batch);
  } catch (error) {
    next(error);
  }
});

// Public: Get batch by number
router.get('/number/:batchNumber', optionalAuth, async (req, res, next) => {
  try {
    const batch = await batchService.getBatchByNumber(req.params.batchNumber);
    res.json(batch);
  } catch (error) {
    next(error);
  }
});

// Public: Get batches for a product
router.get('/product/:productId', optionalAuth, async (req, res, next) => {
  try {
    const batches = await batchService.getBatchesByProduct(req.params.productId);
    res.json(batches);
  } catch (error) {
    next(error);
  }
});

// Admin: Create batch
router.post('/', authenticate, requireAdmin, async (req, res, next) => {
  try {
    const { productId, batchNumber, productionDate, expiryDate, quantityProduced, batchMetadata, imageUrl } = req.body;

    const batch = await batchService.createBatch(
      productId,
      batchNumber,
      productionDate,
      expiryDate,
      quantityProduced,
      batchMetadata,
      imageUrl,
      req.user.userId
    );

    // Generate QR code
    const qrCode = await batchService.generateQRCode(batch.id);

    logger.info('Batch created', { batchId: batch.id, batchNumber });
    res.status(201).json({ ...batch, qrCode });
  } catch (error) {
    next(error);
  }
});

// Admin: Update batch
router.patch('/:batchId', authenticate, requireAdmin, async (req, res, next) => {
  try {
    const batch = await batchService.updateBatch(req.params.batchId, req.body);
    logger.info('Batch updated', { batchId: batch.id });
    res.json(batch);
  } catch (error) {
    next(error);
  }
});

// Admin: Generate QR code for batch
router.post('/:batchId/qr-code', authenticate, requireAdmin, async (req, res, next) => {
  try {
    const qrCode = await batchService.generateQRCode(req.params.batchId);
    res.json({ qrCode });
  } catch (error) {
    next(error);
  }
});

// Admin: Get all batches
router.get('/', authenticate, requireAdmin, async (req, res, next) => {
  try {
    const batches = await batchService.getAllBatches();
    res.json(batches);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
