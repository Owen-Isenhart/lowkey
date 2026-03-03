const express = require('express');
const productService = require('../services/productService');
const { authenticate, requireAdmin, optionalAuth } = require('../middleware/auth');
const logger = require('../utils/logger');

const router = express.Router();

// Get all active products
router.get('/', optionalAuth, async (req, res, next) => {
  try {
    const products = await productService.getAllProducts(false);
    res.json(products);
  } catch (error) {
    next(error);
  }
});

// Get product by ID with inventory
router.get('/:productId', optionalAuth, async (req, res, next) => {
  try {
    const product = await productService.getProduct(req.params.productId);
    res.json(product);
  } catch (error) {
    next(error);
  }
});

// Get product by name
router.get('/name/:name', optionalAuth, async (req, res, next) => {
  try {
    const product = await productService.getProductByName(req.params.name);
    res.json(product);
  } catch (error) {
    next(error);
  }
});

// Admin: Create product
router.post('/', authenticate, requireAdmin, async (req, res, next) => {
  try {
    const { name, description, priceCents, objModelPath } = req.body;

    const product = await productService.createProduct(
      name,
      description,
      priceCents,
      objModelPath
    );

    res.status(201).json(product);
  } catch (error) {
    next(error);
  }
});

// Admin: Update product
router.patch('/:productId', authenticate, requireAdmin, async (req, res, next) => {
  try {
    const product = await productService.updateProduct(req.params.productId, req.body);
    res.json(product);
  } catch (error) {
    next(error);
  }
});

// Admin: Get inventory for product
router.get('/:productId/inventory', authenticate, requireAdmin, async (req, res, next) => {
  try {
    const inventory = await productService.getInventory(req.params.productId);
    res.json(inventory);
  } catch (error) {
    next(error);
  }
});

// Admin: Update inventory
router.post('/:productId/inventory', authenticate, requireAdmin, async (req, res, next) => {
  try {
    const { quantityOnHand, quantityReserved } = req.body;

    const inventory = await productService.updateInventory(
      req.params.productId,
      quantityOnHand,
      quantityReserved
    );

    logger.info('Inventory updated', { productId: req.params.productId });
    res.json(inventory);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
