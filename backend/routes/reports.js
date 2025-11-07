const express = require('express');
const router = express.Router();
const reports = require('../controllers/reportsController');

// GET volunteer participation
router.get('/volunteer-participation', async (req, res, next) => {
  try {
    const filters = {
      search: req.query.search || null,
      location: req.query.location || null,
      skill: req.query.skill || null,
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
router.get('/volunteer-history', async (req, res, next) => {
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
router.get('/event-management', async (req, res, next) => {
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

module.exports = router;
