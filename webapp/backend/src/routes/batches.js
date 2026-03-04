const express = require('express');
const batchService = require('../services/batchService');
const { authenticate, requireAdmin, optionalAuth } = require('../middleware/auth');

const router = express.Router();

router.get('/:batchId', optionalAuth, async (req, res, next) => {
  try {
    const batch = await batchService.getBatchById(req.params.batchId);
    if (!batch) return res.status(404).json({ error: 'Batch not found' });
    res.json(batch);
  } catch (error) {
    next(error);
  }
});

router.post('/', authenticate, requireAdmin, async (req, res, next) => {
  try {
    const { id, recipe_version, mixed_at, ph_level, notes, image_url } = req.body;
    const batch = await batchService.createBatch({ id, recipe_version, mixed_at, ph_level, notes, image_url });
    res.status(201).json(batch);
  } catch (error) {
    if (error.statusCode === 409) return res.status(409).json({ error: error.message });
    next(error);
  }
});

router.patch('/:batchId', authenticate, requireAdmin, async (req, res, next) => {
  try {
    const batch = await batchService.updateBatch(req.params.batchId, req.body);
    res.json(batch);
  } catch (error) {
    next(error);
  }
});

router.delete('/:batchId', authenticate, requireAdmin, async (req, res, next) => {
  try {
    await batchService.deleteBatch(req.params.batchId);
    res.json({ success: true });
  } catch (error) {
    next(error);
  }
});

router.post('/:batchId/sources', authenticate, requireAdmin, async (req, res, next) => {
  try {
    const { ingredient_name, supplier, lot_number } = req.body;
    await batchService.addBatchSource(req.params.batchId, { ingredient_name, supplier, lot_number });
    res.status(201).json({ success: true });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
