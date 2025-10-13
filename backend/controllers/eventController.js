const { validateEvent } = require('../validators/eventValidator');

// Hardcoded events array (simulate DB)
let events = [
  {
    id: 1,
    name: 'Holiday Drive',
    description: 'Annual holiday event to distribute gifts and food.',
    location: 'Downtown Houston',
    requiredSkills: ['Organization & Sorting', 'Customer Service'],
    urgency: 'High',
    date: '2025-12-23',
    volunteers: [],
    status: '6/12 volunteers signed up'
  },
  {
    id: 2,
    name: 'Food Bank Support',
    description: 'Help sort and distribute food donations.',
    location: 'Sugar Land',
    requiredSkills: ['Organization & Sorting'],
    urgency: 'Medium',
    date: '2025-10-15',
    volunteers: [],
    status: '3/8 volunteers signed up'
  }
];

function getEvents(req, res) {
  res.json(events);
}

function createEvent(req, res, next) {
  const { error, value } = validateEvent(req.body);
  if (error) {
    error.status = 400;
    return next(error);
  }
  const newEvent = { ...value, id: Date.now(), volunteers: [], status: '0/10 volunteers signed up' };
  events.push(newEvent);
  res.status(201).json(newEvent);
}

function updateEvent(req, res, next) {
  const eventId = parseInt(req.params.id, 10);
  const idx = events.findIndex(e => e.id === eventId);
  if (idx === -1) {
    return res.status(404).json({ error: 'Event not found' });
  }
  const { error, value } = validateEvent(req.body);
  if (error) {
    error.status = 400;
    return next(error);
  }
  events[idx] = { ...events[idx], ...value };
  res.json(events[idx]);
}

function deleteEvent(req, res) {
  const eventId = parseInt(req.params.id, 10);
  const idx = events.findIndex(e => e.id === eventId);
  if (idx === -1) {
    return res.status(404).json({ error: 'Event not found' });
  }
  const deleted = events.splice(idx, 1);
  res.json(deleted[0]);
}

module.exports = { getEvents, createEvent, updateEvent, deleteEvent };
