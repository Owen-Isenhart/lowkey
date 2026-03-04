const express = require('express');
const eventService = require('../services/eventService');
const { authenticate, requireAdmin, optionalAuth } = require('../middleware/auth');
const logger = require('../utils/logger');

const router = express.Router();

// Get all events (admin) or upcoming (public)
router.get('/', optionalAuth, async (req, res, next) => {
  try {
    // If admin, return all events; otherwise return upcoming
    if (req.user?.isAdmin) {
      logger.info('[GET /] Admin user detected, returning all events');
      const events = await eventService.getAllEvents();
      logger.info('[GET /] Returning events:', events.length);
      return res.json(events);
    }
    
    logger.info('[GET /] Non-admin user, returning all non-hidden events');
    const events = await eventService.getAllPublicEvents();
    logger.info('[GET /] Returning all public events:', events.length);
    res.json(events);
  } catch (error) {
    next(error);
  }
});

// Get upcoming events
router.get('/upcoming', optionalAuth, async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    logger.info('[GET /upcoming] Fetching upcoming events, limit:', limit);
    const events = await eventService.getUpcomingEvents(limit);
    logger.info('[GET /upcoming] Returning events:', events.length, events);
    res.json(events);
  } catch (error) {
    next(error);
  }
});

// Get event by ID
router.get('/:eventId', optionalAuth, async (req, res, next) => {
  try {
    const event = await eventService.getEvent(req.params.eventId);
    
    // If not admin and event is hidden, return 404
    if (!req.user?.isAdmin && event.is_hidden) {
      return res.status(404).json({ error: 'Event not found' });
    }
    
    res.json(event);
  } catch (error) {
    next(error);
  }
});

// Admin: Create event
router.post('/', authenticate, requireAdmin, async (req, res, next) => {
  try {
    const { title, description, location, city, lat, lng, date, end_date, image_url } = req.body;

    logger.info('[POST /] Creating event:', { title, city, date });

    const event = await eventService.createEvent({
      title, description, location, city, lat, lng, date, end_date, image_url
    });

    logger.info('[POST /] Event created successfully:', { id: event.id, title, date: event.date });
    res.status(201).json(event);
  } catch (error) {
    logger.error('[POST /] Error creating event:', error.message);
    next(error);
  }
});

// Admin: Update event
router.patch('/:eventId', authenticate, requireAdmin, async (req, res, next) => {
  try {
    const event = await eventService.updateEvent(req.params.eventId, req.body);
    res.json(event);
  } catch (error) {
    next(error);
  }
});

// Admin: Delete event
router.delete('/:eventId', authenticate, requireAdmin, async (req, res, next) => {
  try {
    await eventService.deleteEvent(req.params.eventId);
    res.json({ success: true });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
