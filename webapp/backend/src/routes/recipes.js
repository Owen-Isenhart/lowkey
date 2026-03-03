const express = require('express');
const recipeService = require('../services/recipeService');
const { authenticate, requireAdmin, optionalAuth } = require('../middleware/auth');
const logger = require('../utils/logger');

const router = express.Router();

// Public: Get recipe versions for a product
router.get('/product/:productId', optionalAuth, async (req, res, next) => {
  try {
    const recipes = await recipeService.getAllRecipeVersions(req.params.productId);
    res.json(recipes);
  } catch (error) {
    next(error);
  }
});

// Public: Get all recipe versions with full details
router.get('/product/:productId/full', optionalAuth, async (req, res, next) => {
  try {
    const recipes = await recipeService.getFullRecipeVersions(req.params.productId);
    res.json(recipes);
  } catch (error) {
    next(error);
  }
});

// Public: Get stable (latest) recipe for a product
router.get('/product/:productId/stable', optionalAuth, async (req, res, next) => {
  try {
    const recipe = await recipeService.getStableRecipeByProduct(req.params.productId);
    res.json(recipe);
  } catch (error) {
    next(error);
  }
});

// Public: Get recipe changelog with diffs
router.get('/product/:productId/changelog', optionalAuth, async (req, res, next) => {
  try {
    const changelog = await recipeService.getRecipeChangelog(req.params.productId);
    res.json(changelog);
  } catch (error) {
    next(error);
  }
});

// Public: Get specific recipe version
router.get('/:recipeId', optionalAuth, async (req, res, next) => {
  try {
    const recipe = await recipeService.getRecipeVersion(req.params.recipeId);
    res.json(recipe);
  } catch (error) {
    next(error);
  }
});

// Admin: Create recipe version
router.post('/', authenticate, requireAdmin, async (req, res, next) => {
  try {
    const { productId, versionNumber, recipeData } = req.body;

    const recipe = await recipeService.createRecipeVersion(
      productId,
      versionNumber,
      recipeData,
      req.user.userId
    );

    logger.info('Recipe version created', { productId, versionNumber });
    res.status(201).json(recipe);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
