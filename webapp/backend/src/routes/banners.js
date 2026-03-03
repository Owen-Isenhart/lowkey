const express = require('express');
const bannerService = require('../services/bannerService');
const { authenticate, requireAdmin, optionalAuth } = require('../middleware/auth');
const logger = require('../utils/logger');

const router = express.Router();

// Get active banners (public  - no auth needed)
router.get('/active', optionalAuth, async (req, res, next) => {
  try {
    const banners = await bannerService.getActiveBanners();
    res.json(banners);
  } catch (error) {
    next(error);
  }
});

// Admin: Get all banners
router.get('/', authenticate, requireAdmin, async (req, res, next) => {
  try {
    const banners = await bannerService.getAllBanners();
    res.json(banners);
  } catch (error) {
    next(error);
  }
});

// Admin: Get banner by ID
router.get('/:bannerId', authenticate, requireAdmin, async (req, res, next) => {
  try {
    const banner = await bannerService.getBanner(req.params.bannerId);
    res.json(banner);
  } catch (error) {
    next(error);
  }
});

// Admin: Create banner
router.post('/', authenticate, requireAdmin, async (req, res, next) => {
  try {
    const { title, content, bannerType, expiresAt } = req.body;

    const banner = await bannerService.createBanner(
      title,
      content,
      bannerType,
      expiresAt,
      req.user.userId
    );

    logger.info('Banner created', { bannerId: banner.id, bannerType });
    res.status(201).json(banner);
  } catch (error) {
    next(error);
  }
});

// Admin: Update banner
router.patch('/:bannerId', authenticate, requireAdmin, async (req, res, next) => {
  try {
    const banner = await bannerService.updateBanner(req.params.bannerId, req.body);
    logger.info('Banner updated', { bannerId: banner.id });
    res.json(banner);
  } catch (error) {
    next(error);
  }
});

// Admin: Deactivate banner
router.post('/:bannerId/deactivate', authenticate, requireAdmin, async (req, res, next) => {
  try {
    const banner = await bannerService.deactivateBanner(req.params.bannerId);
    logger.info('Banner deactivated', { bannerId: banner.id });
    res.json(banner);
  } catch (error) {
    next(error);
  }
});

// Admin: Delete banner
router.delete('/:bannerId', authenticate, requireAdmin, async (req, res, next) => {
  try {
    await bannerService.deleteBanner(req.params.bannerId);
    logger.info('Banner deleted', { bannerId: req.params.bannerId });
    res.json({ success: true });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
