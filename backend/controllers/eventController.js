const { validateEvent } = require('../validators/eventValidator');

// Removed hardcoded event data - event routes now use database-backed router implementation.
function getEvents(req, res) {
  // Not used - prefer database-backed routes in routes/eventRoutes.js
  return res.status(501).json({ error: 'Not implemented. Use /api/events route.' });
}

function createEvent(req, res) {
  return res.status(501).json({ error: 'Not implemented. Use /api/events route.' });
}

function updateEvent(req, res) {
  return res.status(501).json({ error: 'Not implemented. Use /api/events/:id route.' });
}

function deleteEvent(req, res) {
  return res.status(501).json({ error: 'Not implemented. Use /api/events/:id route.' });
}

module.exports = { getEvents, createEvent, updateEvent, deleteEvent };
