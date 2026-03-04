const express = require('express');
const storeService = require('../services/storeService');

const router = express.Router();

router.get('/', async (req, res, next) => {
    try {
        const stores = await storeService.getAllStores();
        res.json(stores);
    } catch (error) {
        next(error);
    }
});

module.exports = router;
