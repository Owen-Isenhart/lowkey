const pool = require('../db/connection');
const { NotFoundError, ValidationError } = require('../utils/errors');
const logger = require('../utils/logger');

const recipeService = {
  async createRecipeVersion(productId, versionNumber, recipeData, userId) {
    if (!productId || !versionNumber || !recipeData) {
      throw new ValidationError('Missing required fields');
    }

    // Verify product exists
    const { rows: products } = await pool.query(
      'SELECT id FROM products WHERE id = $1',
      [productId]
    );

    if (products.length === 0) {
      throw new NotFoundError('Product');
    }

    // Check for duplicate version
    const { rows: existing } = await pool.query(
      'SELECT id FROM recipes WHERE product_id = $1 AND version_number = $2',
      [productId, versionNumber]
    );

    if (existing.length > 0) {
      throw new ValidationError('Recipe version already exists');
    }

    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // Create recipe version
      const { rows: recipes } = await client.query(
        `INSERT INTO recipes (product_id, version_number, recipe_data, created_by)
         VALUES ($1, $2, $3, $4)
         RETURNING id, product_id, version_number, recipe_data, created_by, created_at`,
        [productId, versionNumber, JSON.stringify(recipeData), userId]
      );

      const recipe = recipes[0];

      // Insert ingredients for this recipe
      if (recipeData.ingredients && Array.isArray(recipeData.ingredients)) {
        for (const ing of recipeData.ingredients) {
          await client.query(
            `INSERT INTO recipe_ingredients 
             (recipe_id, ingredient_name, amount, unit, category, description, study_url)
             VALUES ($1, $2, $3, $4, $5, $6, $7)`,
            [
              recipe.id,
              ing.name || '',
              ing.amount || 0,
              ing.unit || '',
              ing.category || null,
              ing.description || null,
              ing.study_url || null,
            ]
          );
        }
      }

      await client.query('COMMIT');
      logger.info('Recipe version created', { productId, versionNumber });
      return recipe;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  },

  async getRecipeVersion(recipeId) {
    const { rows: recipes } = await pool.query(
      'SELECT * FROM recipes WHERE id = $1',
      [recipeId]
    );

    if (recipes.length === 0) {
      throw new NotFoundError('Recipe');
    }

    const recipe = recipes[0];

    // Get ingredients for this recipe
    const { rows: ingredients } = await pool.query(
      'SELECT ingredient_name, amount, unit, category, description, study_url FROM recipe_ingredients WHERE recipe_id = $1',
      [recipeId]
    );

    recipe.recipe_data = JSON.parse(recipe.recipe_data);
    recipe.ingredients = ingredients;

    return recipe;
  },

  async getStableRecipeByProduct(productId) {
    // Get latest recipe for product (assuming most recent is stable)
    const { rows: recipes } = await pool.query(
      `SELECT * FROM recipes 
       WHERE product_id = $1 
       ORDER BY created_at DESC LIMIT 1`,
      [productId]
    );

    if (recipes.length === 0) {
      throw new NotFoundError('Recipe for this product');
    }

    const recipe = recipes[0];

    // Get ingredients
    const { rows: ingredients } = await pool.query(
      'SELECT ingredient_name, amount, unit, category, description, study_url FROM recipe_ingredients WHERE recipe_id = $1',
      [recipe.id]
    );

    recipe.recipe_data = JSON.parse(recipe.recipe_data);
    recipe.ingredients = ingredients;

    return recipe;
  },

  async getAllRecipeVersions(productId) {
    const { rows: recipes } = await pool.query(
      `SELECT id, product_id, version_number, created_at FROM recipes 
       WHERE product_id = $1 
       ORDER BY created_at DESC`,
      [productId]
    );

    return recipes;
  },

  async getFullRecipeVersions(productId) {
    const { rows: recipes } = await pool.query(
      `SELECT * FROM recipes 
       WHERE product_id = $1 
       ORDER BY created_at DESC`,
      [productId]
    );

    const result = [];
    for (const recipe of recipes) {
      const { rows: ingredients } = await pool.query(
        'SELECT ingredient_name, amount, unit, category, description, study_url FROM recipe_ingredients WHERE recipe_id = $1',
        [recipe.id]
      );

      result.push({
        ...recipe,
        recipe_data: JSON.parse(recipe.recipe_data),
        ingredients,
      });
    }

    return result;
  },

  // Calculate diffs between ingredient lists
  calculateDiff(oldIngredients, newIngredients) {
    const diff = {
      added: [],
      removed: [],
      modified: [],
    };

    const oldMap = new Map(oldIngredients.map((ing) => [ing.ingredient_name, ing]));
    const newMap = new Map(newIngredients.map((ing) => [ing.ingredient_name, ing]));

    // Find removed and modified
    for (const [name, oldIng] of oldMap) {
      if (!newMap.has(name)) {
        diff.removed.push(oldIng);
      } else {
        const newIng = newMap.get(name);
        // Check if amount or unit changed
        if (oldIng.amount !== newIng.amount || oldIng.unit !== newIng.unit) {
          diff.modified.push({ before: oldIng, after: newIng });
        }
      }
    }

    // Find added
    for (const [name, newIng] of newMap) {
      if (!oldMap.has(name)) {
        diff.added.push(newIng);
      }
    }

    return diff;
  },

  async getRecipeChangelog(productId) {
    const { rows: recipes } = await pool.query(
      `SELECT id FROM recipes 
       WHERE product_id = $1 
       ORDER BY created_at DESC`,
      [productId]
    );

    if (recipes.length === 0) {
      throw new NotFoundError('Recipes for this product');
    }

    const changelog = [];

    for (let i = 0; i < recipes.length; i++) {
      const current = recipes[i];

      // Get ingredients for current version
      const { rows: currentIngredients } = await pool.query(
        'SELECT ingredient_name, amount, unit, category, description, study_url FROM recipe_ingredients WHERE recipe_id = $1 ORDER BY ingredient_name',
        [current.id]
      );

      if (i < recipes.length - 1) {
        // Get ingredients for previous version
        const { rows: previousIngredients } = await pool.query(
          'SELECT ingredient_name, amount, unit, category, description, study_url FROM recipe_ingredients WHERE recipe_id = $1 ORDER BY ingredient_name',
          [recipes[i + 1].id]
        );

        const diff = this.calculateDiff(previousIngredients, currentIngredients);
        changelog.push({
          versionId: current.id,
          versionNumber: recipes[i].version_number || 'unknown',
          createdAt: current.created_at,
          diff,
        });
      } else {
        // Last version - all ingredients are added
        changelog.push({
          versionId: current.id,
          versionNumber: recipes[i].version_number || 'unknown',
          createdAt: current.created_at,
          diff: {
            added: currentIngredients,
            removed: [],
            modified: [],
          },
        });
      }
    }

    return changelog;
  },
};

module.exports = recipeService;
