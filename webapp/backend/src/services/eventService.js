const pool = require('../db/connection');
const { NotFoundError, ValidationError } = require('../utils/errors');
const logger = require('../utils/logger');

const eventService = {
  async createEvent({ title, description, location, city, lat, lng, date, end_date, image_url }) {
    if (!title || typeof title !== 'string' || title.length === 0 || title.length > 255) {
      throw new ValidationError('Invalid event title');
    }
    if (!location || typeof location !== 'string' || location.length === 0 || location.length > 255) {
      throw new ValidationError('Invalid event location');
    }
    if (!date) {
      throw new ValidationError('Event date is required');
    }

    const { rows: result } = await pool.query(
      `INSERT INTO events (title, description, location, city, lat, lng, date, end_date, image_url, is_hidden)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, FALSE)
       RETURNING id, title, description, location, city, lat, lng, date, end_date, image_url, is_hidden`,
      [title, description || null, location, city || null, lat || null, lng || null, date, end_date || null, image_url || null]
    );

    logger.info('Event created', { eventId: result[0].id, title });
    return result[0];
  },

  async getEvent(eventId) {
    const { rows: events } = await pool.query(
      `SELECT id, title, description, location, city, lat, lng, date, end_date, image_url, is_hidden, created_at, updated_at
       FROM events
       WHERE id = $1`,
      [eventId]
    );

    if (events.length === 0) {
      throw new NotFoundError('Event');
    }

    return events[0];
  },

  async getUpcomingEvents(limit = 10) {
    logger.info('[getUpcomingEvents] Querying events WHERE date >= NOW() AND is_hidden = FALSE, limit:', limit);
    logger.info('[getUpcomingEvents] Current time:', new Date().toISOString());
    
    const { rows: events } = await pool.query(
      `SELECT id, title, description, location, city, lat, lng, date, end_date, image_url, is_hidden
       FROM events
       WHERE date >= NOW() AND is_hidden = FALSE
       ORDER BY date ASC
       LIMIT $1`,
      [limit]
    );
    
    logger.info('[getUpcomingEvents] Query returned events:', events.length, events.map(e => ({ id: e.id, title: e.title, date: e.date })));
    return events;
  },

  async getAllEvents() {
    logger.info('[getAllEvents] Fetching all events (for admin use)');
    const { rows: events } = await pool.query(
      `SELECT id, title, description, location, city, lat, lng, date, end_date, image_url, is_hidden
       FROM events
       ORDER BY date DESC`
    );
    logger.info('[getAllEvents] Returned events:', events.length);
    return events;
  },

  async getAllPublicEvents() {
    logger.info('[getAllPublicEvents] Fetching all non-hidden events for public page');
    const { rows: events } = await pool.query(
      `SELECT id, title, description, location, city, lat, lng, date, end_date, image_url, is_hidden
       FROM events
       WHERE is_hidden = FALSE
       ORDER BY date DESC`
    );
    logger.info('[getAllPublicEvents] Returned events:', events.length);
    return events;
  },

  async updateEvent(eventId, updates) {
    const allowed = ['title', 'description', 'location', 'city', 'lat', 'lng', 'date', 'end_date', 'image_url', 'is_hidden'];
    const updateKeys = Object.keys(updates).filter((k) => allowed.includes(k));

    if (updateKeys.length === 0) {
      throw new ValidationError('No valid fields to update');
    }

    const setClause = updateKeys
      .map((key, i) => `${key} = $${i + 1}`)
      .join(', ');
    const values = updateKeys.map((key) => updates[key]);

    const { rows: result } = await pool.query(
      `UPDATE events SET ${setClause}, updated_at = CURRENT_TIMESTAMP
       WHERE id = $${updateKeys.length + 1}
       RETURNING id, title, description, location, city, lat, lng, date, end_date, image_url, is_hidden`,
      [...values, eventId]
    );

    if (result.length === 0) {
      throw new NotFoundError('Event');
    }

    logger.info('Event updated', { eventId });
    return result[0];
  },

  async deleteEvent(eventId) {
    const { rows: result } = await pool.query(
      'DELETE FROM events WHERE id = $1 RETURNING id',
      [eventId]
    );

    if (result.length === 0) {
      throw new NotFoundError('Event');
    }

    logger.info('Event deleted', { eventId });
    return { success: true };
  },
};

module.exports = eventService;
