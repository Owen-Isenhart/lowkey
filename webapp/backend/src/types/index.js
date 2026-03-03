/**
 * User entity with authentication and roles
 * @typedef {Object} User
 * @property {string} id - UUID
 * @property {string} email - Google email
 * @property {string} name - User name
 * @property {string} picture - Profile picture URL
 * @property {string} google_id - Google OAuth ID
 * @property {boolean} is_admin - Admin status
 * @property {Date} created_at
 * @property {Date} updated_at
 */

/**
 * Product/Flavor entity
 * @typedef {Object} Product
 * @property {string} id - UUID
 * @property {string} name - Flavor name (e.g., "Cherry", "Key Lime")
 * @property {string} description
 * @property {number} price_cents - Price in cents
 * @property {number} stock - Available inventory
 * @property {string} flavor_slug - URL slug
 * @property {Date} created_at
 * @property {Date} updated_at
 */

/**
 * Batch entity for production tracking
 * @typedef {Object} Batch
 * @property {string} id - UUID
 * @property {string} product_id - Reference to Product
 * @property {Date} production_date
 * @property {Date} expiry_date
 * @property {string} qr_code_data - Encrypted or plain UUID
 * @property {Object} ingredients - Recipe snapshot
 * @property {string} easter_egg - Fun message
 * @property {Date} created_at
 */

/**
 * Event entity
 * @typedef {Object} Event
 * @property {string} id - UUID
 * @property {string} title
 * @property {string} description
 * @property {Date} event_date
 * @property {string} location
 * @property {string[]} image_urls - Array of image URLs
 * @property {Date} created_at
 * @property {Date} updated_at
 */

/**
 * Banner entity for alerts and announcements
 * @typedef {Object} Banner
 * @property {string} id - UUID
 * @property {string} message
 * @property {string} type - 'info', 'warning', 'success', 'error'
 * @property {Date} start_date
 * @property {Date} end_date - Can be NULL for manual cancellation
 * @property {boolean} is_active
 * @property {Date} created_at
 */

/**
 * Order entity for Stripe checkout
 * @typedef {Object} Order
 * @property {string} id - UUID
 * @property {string} user_id - NULL if guest
 * @property {string} stripe_payment_intent_id
 * @property {number} total_amount_cents
 * @property {string} status - 'pending', 'completed', 'failed', 'refunded'
 * @property {Object} items - [{product_id, quantity, price_cents}]
 * @property {string} shipping_address
 * @property {string} shipping_state - US state code
 * @property {number} shipping_cost_cents
 * @property {number} tax_amount_cents
 * @property {Date} created_at
 * @property {Date} updated_at
 */

/**
 * Recipe version for ingredient tracking
 * @typedef {Object} RecipeVersion
 * @property {string} id - UUID
 * @property {string} product_id
 * @property {string} version - e.g., "v1.0.0"
 * @property {Object} ingredients - Full recipe JSON
 * @property {boolean} is_stable
 * @property {Date} created_at
 */

module.exports = {};
