const express = require('express');
const router = express.Router();
const reports = require('../controllers/reportsController');

// Admin check middleware: enforce admin-only in non-test environments
function requireAdmin(req, res, next) {
  if (process.env.NODE_ENV === 'test') return next();
  // expect authentication middleware to have set req.user
  if (req && req.user && req.user.userType === 'admin') return next();
  return res.status(403).json({ message: 'Forbidden: admin access required' });
}

// GET volunteer participation
router.get('/volunteer-participation', requireAdmin, async (req, res, next) => {
  try {
    const filters = {
      search: req.query.search || null,
      location: req.query.location || null,
      skill: req.query.skill || null,
      skillId: req.query.skillId || null,
      startDate: req.query.startDate || null,
      endDate: req.query.endDate || null
    };
    const rows = await reports.getVolunteerParticipation(filters);
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

// GET volunteer history
router.get('/volunteer-history', requireAdmin, async (req, res, next) => {
  try {
    const filters = {
      search: req.query.search || null,
      location: req.query.location || null,
      skill: req.query.skill || null,
      startDate: req.query.startDate || null,
      endDate: req.query.endDate || null
    };
    const rows = await reports.getVolunteerHistory(filters);
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

// GET event management
router.get('/event-management', requireAdmin, async (req, res, next) => {
  try {
    const filters = {
      search: req.query.search || null,
      location: req.query.location || null,
      skill: req.query.skill || null,
      startDate: req.query.startDate || null,
      endDate: req.query.endDate || null
    };
    const rows = await reports.getEventManagement(filters);
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

// GET skills (optionally for an event: ?eventId=123)
router.get('/skills', requireAdmin, async (req, res, next) => {
  try {
    const eventId = req.query.eventId || null;
    const rows = await reports.getSkills(eventId);
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
