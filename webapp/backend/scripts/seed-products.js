/**
 * Seed script to populate products table with flavor variants.
 * Run with: node scripts/seed-products.js
 * 
 * Security: This script should only run in development or via authenticated admin endpoint.
 * In production, use migrations or admin panel instead.
 */

const pool = require('../src/db/connection');
const logger = require('../src/utils/logger');

const FLAVOR_PRODUCTS = [
  {
    slug: 'cherry-single',
    name: 'Lowkey Cherry',
    description: 'Smooth cherry flavor with balanced sweetness',
    price_cents: 3499,
    type: 'single',
    obj_model_path: '/flavors/cherry.obj',
  },
  {
    slug: 'lime-single',
    name: 'Lowkey Lime',
    description: 'Zesty lime with a refreshing finish',
    price_cents: 3499,
    type: 'single',
    obj_model_path: '/flavors/lime.obj',
  },
  {
    slug: 'orange-single',
    name: 'Lowkey Orange',
    description: 'Bright orange citrus for sustained energy',
    price_cents: 3499,
    type: 'single',
    obj_model_path: '/flavors/orange.obj',
  },
  {
    slug: 'purple-single',
    name: 'Lowkey Purple',
    description: 'Rich blend of berries and tropical notes',
    price_cents: 3499,
    type: 'single',
    obj_model_path: '/flavors/purple.obj',
  },
  {
    slug: 'variety-sprint',
    name: 'Variety Sprint (Monthly)',
    description: '4 different flavors delivered each month · Set your cadence anytime',
    price_cents: 12999,
    type: 'subscription',
    obj_model_path: '/flavors/purple.obj', // Use purple as default for subscription
  },
];

async function seedProducts() {
  const client = await pool.connect();
  
  try {
    logger.info('Starting product seed...');
    
    await client.query('BEGIN');

    // Check if products already exist
    const { rows: existing } = await client.query(
      'SELECT COUNT(*) as count FROM products'
    );

    if (existing[0].count > 0) {
      logger.info(`Database already contains ${existing[0].count} products, skipping seed`);
      await client.query('ROLLBACK');
      return;
    }

    // Insert each product
    for (const product of FLAVOR_PRODUCTS) {
      const { rows } = await client.query(
        `INSERT INTO products (slug, name, description, price_cents, type, obj_model_path, active)
         VALUES ($1, $2, $3, $4, $5, $6, true)
         RETURNING id, slug, name, price_cents`,
        [product.slug, product.name, product.description, product.price_cents, product.type, product.obj_model_path]
      );

      const productId = rows[0].id;

      // Create inventory record for the product
      await client.query(
        `INSERT INTO inventory (product_id, quantity_on_hand, quantity_reserved)
         VALUES ($1, 1000, 0)`,
        [productId]
      );

      logger.info('Product created', {
        id: productId,
        name: rows[0].name,
        slug: rows[0].slug,
      });
    }

    await client.query('COMMIT');
    logger.info(`Successfully seeded ${FLAVOR_PRODUCTS.length} products`);
    
  } catch (error) {
    await client.query('ROLLBACK');
    logger.error('Seed failed', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

// Run seed
seedProducts().then(() => {
  console.log('✓ Product seed completed');
  process.exit(0);
}).catch((error) => {
  console.error('✗ Product seed failed:', error.message);
  process.exit(1);
});
