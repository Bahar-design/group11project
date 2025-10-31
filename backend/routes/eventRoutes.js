// const express = require('express');
// const { getEvents, createEvent, updateEvent, deleteEvent } = require('../controllers/eventController');

// const router = express.Router();

// // GET all events
// router.get('/', getEvents);

// // POST create event
// router.post('/', createEvent);

// // PUT update event
// router.put('/:id', updateEvent);

// // DELETE event
// router.delete('/:id', deleteEvent);

// module.exports = router;



// backend/routes/events.js
const express = require("express");
const router = express.Router();
const pool = require("../db");

// 👇 change this to your real table name/casing
// if in pgAdmin it shows Events (capital E), then do: const TABLE = '"Events"';
const TABLE = "eventdetails";

router.get("/", async (req, res) => {
  try {
    const { rows, fields } = await pool.query(`SELECT * FROM ${TABLE};`);
    res.json(rows);
  } catch (err) {
    console.error("DB error:", err);
    res.status(500).json({ error: "database error" });
  }
});

module.exports = router;