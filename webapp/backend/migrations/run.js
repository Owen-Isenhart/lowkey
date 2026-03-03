/**
 * Database migration runner
 * Reads SQL files from migrations directory and executes them
 */

require('dotenv').config();
const fs = require('fs');
const pool = require('../src/db/connection');
const logger = require('../src/utils/logger');

const migrationsDir = __dirname;

const runMigrations = async () => {
  const migrations = fs
    .readdirSync(migrationsDir)
    .filter((file) => file.endsWith('.sql'))
    .sort();

  if (migrations.length === 0) {
    logger.warn('No migrations found');
    return;
  }

  // Create migrations table if it doesn't exist
  await pool.query(`
    CREATE TABLE IF NOT EXISTS migrations (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL UNIQUE,
      executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  for (const migration of migrations) {
    const { rows: executed } = await pool.query(
      'SELECT * FROM migrations WHERE name = $1',
      [migration]
    );

    if (executed.length > 0) {
      logger.info(`Skipping migration (already executed): ${migration}`);
      continue;
    }

    try {
      const sql = fs.readFileSync(`${migrationsDir}/${migration}`, 'utf8');

      logger.info(`Running migration: ${migration}`);
      await pool.query(sql);

      await pool.query('INSERT INTO migrations (name) VALUES ($1)', [migration]);

      logger.info(`Migration completed: ${migration}`);
    } catch (error) {
      logger.error(`Migration failed: ${migration}`, error.message);
      throw error;
    }
  }

  logger.info('All migrations completed successfully');
};

runMigrations()
  .then(async () => {
    await pool.end();
    process.exit(0);
  })
  .catch((error) => {
    logger.error('Migration process failed', error.message);
    process.exit(1);
  });
