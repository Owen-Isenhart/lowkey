const express = require('express');
const eventService = require('../services/eventService');
const { authenticate, requireAdmin, optionalAuth } = require('../middleware/auth');
const logger = require('../utils/logger');

const router = express.Router();

// Get all events
router.get('/', optionalAuth, async (req, res, next) => {
  try {
    const events = await eventService.getAllEvents();
    res.json(events);
  } catch (error) {
    next(error);
  }
});

// Get upcoming events
router.get('/upcoming', optionalAuth, async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const events = await eventService.getUpcomingEvents(limit);
    res.json(events);
  } catch (error) {
    next(error);
  }
});

// Get event by ID
router.get('/:eventId', optionalAuth, async (req, res, next) => {
  try {
    const event = await eventService.getEvent(req.params.eventId);
    res.json(event);
  } catch (error) {
    next(error);
  }
});

// Admin or authenticated user: Create event
router.post('/', authenticate, async (req, res, next) => {
  try {
    const { title, description, eventDate, location, imageUrl } = req.body;

    const event = await eventService.createEvent(
      title,
      description,
      eventDate,
      location,
      imageUrl,
      req.user.userId
    );

    res.status(201).json(event);
  } catch (error) {
    next(error);
  }
});

// Admin or event creator: Update event
router.patch('/:eventId', authenticate, async (req, res, next) => {
  try {
    const event = await eventService.updateEvent(req.params.eventId, req.body, req.user.userId);
    res.json(event);
  } catch (error) {
    next(error);
  }
});

// Admin or event creator: Delete event
router.delete('/:eventId', authenticate, async (req, res, next) => {
  try {
    await eventService.deleteEvent(req.params.eventId, req.user.userId);
    res.json({ success: true });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
