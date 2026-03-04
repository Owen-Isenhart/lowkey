const pool = require('../db/connection');

const storeService = {
    async getAllStores() {
        const { rows: stores } = await pool.query(
            `SELECT id, name, address, city, state, lat, lng, type
       FROM store_locations
       ORDER BY name ASC`
        );
        return stores;
    }
};

module.exports = storeService;
