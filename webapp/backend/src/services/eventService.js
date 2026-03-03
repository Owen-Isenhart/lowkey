const pool = require('../db/connection');
const { NotFoundError, ValidationError } = require('../utils/errors');
const logger = require('../utils/logger');

const eventService = {
  async createEvent(title, description, eventDate, location, imageUrl, userId) {
    // Validate inputs
    if (!title || typeof title !== 'string' || title.length === 0 || title.length > 255) {
      throw new ValidationError('Invalid event title');
    }
    if (!location || typeof location !== 'string' || location.length === 0 || location.length > 255) {
      throw new ValidationError('Invalid event location');
    }
    if (!eventDate || new Date(eventDate) <= new Date()) {
      throw new ValidationError('Event date must be in the future');
    }

    const { rows: result } = await pool.query(
      `INSERT INTO events (title, description, event_date, location, image_url, created_by)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, title, description, event_date, location, image_url, created_by, created_at, updated_at`,
      [title, description || null, eventDate, location, imageUrl || null, userId]
    );

    logger.info('Event created', { eventId: result[0].id, title });
    return result[0];
  },

  async getEvent(eventId) {
    const { rows: events } = await pool.query(
      `SELECT e.*, u.email, u.first_name, u.last_name
       FROM events e
       LEFT JOIN users u ON e.created_by = u.id
       WHERE e.id = $1`,
      [eventId]
    );

    if (events.length === 0) {
      throw new NotFoundError('Event');
    }

    return events[0];
  },

  async getAllEvents() {
    const { rows: events } = await pool.query(
      `SELECT e.*, u.email, u.first_name, u.last_name
       FROM events e
       LEFT JOIN users u ON e.created_by = u.id
       ORDER BY e.event_date ASC`
    );
    return events;
  },

  async getUpcomingEvents(limit = 10) {
    const { rows: events } = await pool.query(
      `SELECT e.*, u.email, u.first_name, u.last_name
       FROM events e
       LEFT JOIN users u ON e.created_by = u.id
       WHERE e.event_date >= CURRENT_TIMESTAMP
       ORDER BY e.event_date ASC LIMIT $1`,
      [limit]
    );
    return events;
  },

  async updateEvent(eventId, updates, userId) {
    // Verify user owns event
    const { rows: existing } = await pool.query(
      'SELECT created_by FROM events WHERE id = $1',
      [eventId]
    );

    if (existing.length === 0) {
      throw new NotFoundError('Event');
    }

    if (existing[0].created_by !== userId) {
      throw new ValidationError('Can only update your own events');
    }

    const allowed = ['title', 'description', 'event_date', 'location', 'image_url'];
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
       RETURNING id, title, description, event_date, location, image_url, created_by, created_at, updated_at`,
      [...values, eventId]
    );

    logger.info('Event updated', { eventId, userId });
    return result[0];
  },

  async deleteEvent(eventId, userId) {
    // Verify user owns event
    const { rows: existing } = await pool.query(
      'SELECT created_by FROM events WHERE id = $1',
      [eventId]
    );

    if (existing.length === 0) {
      throw new NotFoundError('Event');
    }

    if (existing[0].created_by !== userId) {
      throw new ValidationError('Can only delete your own events');
    }

    const { rows: result } = await pool.query(
      'DELETE FROM events WHERE id = $1 RETURNING id',
      [eventId]
    );

    logger.info('Event deleted', { eventId, userId });
    return { success: true };
  },
};

module.exports = eventService;
