const express = require('express');
const router = express.Router();
const {
  getAllEvents,
  createEvent,
  updateEvent,
  deleteEvent,
  attendEvent
} = require('../controllers/calendarController');

router.get('/', getAllEvents);
router.post('/', createEvent);
router.put('/:id', updateEvent);
router.delete('/:id', deleteEvent);
router.post("/attend",attendEvent);


module.exports = router;
