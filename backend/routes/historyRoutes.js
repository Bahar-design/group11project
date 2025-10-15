const express = require('express');
const {
  getVolunteerHistory,
  createVolunteerRecord,
  updateVolunteerRecord,
  deleteVolunteerRecord
} = require('../controllers/volunteerHistoryController');

const router = express.Router();

// GET all volunteer history
router.get('/', getVolunteerHistory);

// POST create new record
router.post('/', createVolunteerRecord);

// PUT update record by ID
router.put('/:id', updateVolunteerRecord);

// DELETE record by ID
router.delete('/:id', deleteVolunteerRecord);

module.exports = router;
