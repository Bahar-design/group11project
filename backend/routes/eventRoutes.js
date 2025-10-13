const express = require('express');
const { getEvents, createEvent, updateEvent, deleteEvent } = require('../controllers/eventController');

const router = express.Router();

// GET all events
router.get('/', getEvents);

// POST create event
router.post('/', createEvent);

// PUT update event
router.put('/:id', updateEvent);

// DELETE event
router.delete('/:id', deleteEvent);

module.exports = router;
