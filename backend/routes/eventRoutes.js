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

// Table name
const TABLE = 'eventdetails';

// Map urgency label <-> smallint stored in DB
const URGENCY_MAP = { Low: 1, Medium: 2, High: 3, Critical: 4 };
const URGENCY_MAP_REVERSE = Object.fromEntries(Object.entries(URGENCY_MAP).map(([k, v]) => [v, k]));

// Helper: resolve skill names to ids (create missing skills)
async function ensureSkillIds(skillNames = []) {
  if (!Array.isArray(skillNames) || skillNames.length === 0) return [];
  const ids = [];
  for (const raw of skillNames) {
    const name = String(raw).trim();
    if (!name) continue;
    // find existing
    const sel = await pool.query('SELECT skill_id FROM skills WHERE skill_name = $1', [name]);
    if (sel.rows.length > 0) {
      ids.push(sel.rows[0].skill_id);
    } else {
      const ins = await pool.query('INSERT INTO skills (skill_name) VALUES ($1) RETURNING skill_id', [name]);
      ids.push(ins.rows[0].skill_id);
    }
  }
  return ids;
}

// In-memory fallback store used when DB is unavailable or operations fail
let fallbackEvents = [
  {
    id: 1,
    name: 'Holiday Drive',
    description: 'Annual holiday event to distribute gifts and food.',
    location: 'Downtown Houston',
    requiredSkills: ['Organization & Sorting', 'Customer Service'],
    urgency: 'High',
    date: '2025-12-23',
    volunteersList: [{ name: 'James Miller' }, { name: 'Sarah Lee' }],
    volunteers: 2
  },
  {
    id: 2,
    name: 'Food Bank Support',
    description: 'Help sort and distribute food donations.',
    location: 'Sugar Land',
    requiredSkills: ['Organization & Sorting'],
    urgency: 'Medium',
    date: '2025-10-15',
    volunteersList: [{ name: 'Alex Kim' }],
    volunteers: 1
  }
];
let fallbackNextId = 3;

// Helper: get skill names by ids
async function skillNamesForIds(ids = []) {
  if (!Array.isArray(ids) || ids.length === 0) return [];
  try {
    const q = await pool.query('SELECT skill_id, skill_name FROM skills WHERE skill_id = ANY($1::int[])', [ids]);
    return q.rows.map(r => r.skill_name);
  } catch (err) {
    return [];
  }
}

// GET all events (with skill names and volunteers count)
router.get('/', async (req, res) => {
  try {
    const { rows } = await pool.query(`SELECT * FROM ${TABLE} ORDER BY event_date ASC`);
    const out = [];
    for (const r of rows) {
      const skillIds = r.skill_id || [];
      const skills = await skillNamesForIds(skillIds);
      // Try to fetch volunteer names via an "event_signups" table if present
      let volunteersList = [];
      try {
        const vq = await pool.query(
          `SELECT vp.full_name, u.user_email FROM event_signups es JOIN volunteerprofile vp ON es.volunteer_id = vp.volunteer_id JOIN user_table u ON vp.user_id = u.user_id WHERE es.event_id = $1`,
          [r.event_id]
        );
        volunteersList = vq.rows.map(v => ({ name: v.full_name || v.user_email }));
      } catch (err) {
        // event_signups may not exist yet; ignore and fallback to volunteers count column
        volunteersList = [];
      }

      out.push({
        id: r.event_id,
        name: r.event_name,
        description: r.description,
        location: r.location,
        urgency: URGENCY_MAP_REVERSE[r.urgency] || r.urgency,
        date: r.event_date ? r.event_date.toISOString().slice(0, 10) : null,
        timeSlots: r.time_slots || null,
        volunteers: Number(r.volunteers) || (volunteersList.length),
        volunteersList,
        skillIds,
        requiredSkills: skills,
        createdBy: r.created_by
      });
    }
    res.json(out);
  } catch (err) {
    // DB failed — fallback to in-memory store
    console.error('Events GET error, using fallback in-memory events:', err.message || err);
    const out = fallbackEvents.map(r => ({
      id: r.id,
      name: r.name,
      description: r.description,
      location: r.location,
      urgency: r.urgency,
      date: r.date,
      timeSlots: r.timeSlots || null,
      volunteers: r.volunteers || (r.volunteersList ? r.volunteersList.length : 0),
      volunteersList: r.volunteersList || [],
      requiredSkills: r.requiredSkills || [],
      skillIds: r.skillIds || []
    }));
    res.json(out);
  }
});

// GET single event
router.get('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const { rows } = await pool.query(`SELECT * FROM ${TABLE} WHERE event_id = $1`, [id]);
    if (rows.length === 0) return res.status(404).json({ error: 'Event not found' });
    const r = rows[0];
    const skills = await skillNamesForIds(r.skill_id || []);
    res.json({
      id: r.event_id,
      name: r.event_name,
      description: r.description,
      location: r.location,
      urgency: URGENCY_MAP_REVERSE[r.urgency] || r.urgency,
      date: r.event_date ? r.event_date.toISOString().slice(0,10) : null,
      timeSlots: r.time_slots,
      volunteers: Number(r.volunteers) || 0,
      requiredSkills: skills,
      skillIds: r.skill_id || []
    });
  } catch (err) {
    console.error('GET event by id error, falling back:', err.message || err);
    const id = parseInt(req.params.id, 10);
    const ev = fallbackEvents.find(e => e.id === id);
    if (!ev) return res.status(404).json({ error: 'Event not found' });
    res.json(ev);
  }
});

// POST create event
router.post('/', async (req, res) => {
  // destructure outside try so fallback catch can reference values
  const { name, description, location, requiredSkills = [], urgency, date, timeSlots = null, createdBy = null } = req.body || {};
  try {
    // basic validation
    if (!name || !description || !location || !Array.isArray(requiredSkills) || requiredSkills.length === 0 || !urgency || !date) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    const urgencyNum = URGENCY_MAP[urgency] || URGENCY_MAP['Low'];

    const skillIds = await ensureSkillIds(requiredSkills);

    const insertQ = `INSERT INTO ${TABLE} (event_name, description, location, urgency, event_date, created_by, time_slots, volunteers, skill_id) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *`;
    const { rows } = await pool.query(insertQ, [name, description, location, urgencyNum, date, createdBy, timeSlots, 0, skillIds]);
    const r = rows[0];

    // maintain event_skills join table if it exists
    try {
      await pool.query('DELETE FROM event_skills WHERE event_id = $1', [r.event_id]);
      for (const sid of skillIds) {
        await pool.query('INSERT INTO event_skills (event_id, skill_id) VALUES ($1,$2) ON CONFLICT DO NOTHING', [r.event_id, sid]);
      }
    } catch (ignore) {}

    const skills = await skillNamesForIds(skillIds);
    res.status(201).json({ id: r.event_id, name: r.event_name, description: r.description, location: r.location, urgency, date: r.event_date.toISOString().slice(0,10), requiredSkills: skills, volunteers: 0 });
  } catch (err) {
    // If DB is not available or insert fails, fallback to in-memory
    console.error('Create event error, falling back to in-memory:', err.message || err);
    const newEv = { id: fallbackNextId++, name: name || 'Untitled', description: description || '', location: location || '', urgency: urgency || 'Low', date: date || null, timeSlots, volunteers: 0, requiredSkills: requiredSkills || [], volunteersList: [] };
    fallbackEvents.push(newEv);
    return res.status(201).json(newEv);
  }
});

// PUT update event
router.put('/:id', async (req, res) => {
  const id = parseInt(req.params.id, 10);
  const { name, description, location, requiredSkills = [], urgency, date, timeSlots = null } = req.body || {};
  try {
    const { rows: exists } = await pool.query(`SELECT * FROM ${TABLE} WHERE event_id = $1`, [id]);
    if (exists.length === 0) return res.status(404).json({ error: 'Event not found' });

    const urgencyNum = URGENCY_MAP[urgency] || URGENCY_MAP['Low'];
    const skillIds = await ensureSkillIds(requiredSkills);

    const updateQ = `UPDATE ${TABLE} SET event_name=$1, description=$2, location=$3, urgency=$4, event_date=$5, time_slots=$6, skill_id=$7 WHERE event_id=$8 RETURNING *`;
    const { rows } = await pool.query(updateQ, [name, description, location, urgencyNum, date, timeSlots, skillIds, id]);
    const r = rows[0];

    // update event_skills join table
    try {
      await pool.query('DELETE FROM event_skills WHERE event_id = $1', [id]);
      for (const sid of skillIds) {
        await pool.query('INSERT INTO event_skills (event_id, skill_id) VALUES ($1,$2) ON CONFLICT DO NOTHING', [id, sid]);
      }
    } catch (ignore) {}

    const skills = await skillNamesForIds(skillIds);
    res.json({ id: r.event_id, name: r.event_name, description: r.description, location: r.location, urgency, date: r.event_date.toISOString().slice(0,10), requiredSkills: skills });
  } catch (err) {
    console.error('Update event error, falling back to in-memory:', err.message || err);
    // Fallback: update in-memory
    const idx = fallbackEvents.findIndex(e => e.id === id);
    if (idx === -1) return res.status(404).json({ error: 'Event not found' });
    fallbackEvents[idx] = { ...fallbackEvents[idx], name: name || fallbackEvents[idx].name, description: description || fallbackEvents[idx].description, location: location || fallbackEvents[idx].location, urgency: urgency || fallbackEvents[idx].urgency, date: date || fallbackEvents[idx].date, timeSlots: timeSlots || fallbackEvents[idx].timeSlots, requiredSkills: requiredSkills.length ? requiredSkills : fallbackEvents[idx].requiredSkills };
    return res.json(fallbackEvents[idx]);
  }
});

// DELETE event
router.delete('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    // remove join rows first
    try { await pool.query('DELETE FROM event_skills WHERE event_id = $1', [id]); } catch (ignore) {}
    const { rows } = await pool.query(`DELETE FROM ${TABLE} WHERE event_id = $1 RETURNING *`, [id]);
    if (rows.length === 0) return res.status(404).json({ error: 'Event not found' });
    res.json({ id: rows[0].event_id, name: rows[0].event_name });
  } catch (err) {
    console.error('Delete event error, falling back to in-memory:', err.message || err);
    const id = parseInt(req.params.id, 10);
    const idx = fallbackEvents.findIndex(e => e.id === id);
    if (idx === -1) return res.status(404).json({ error: 'Event not found' });
    const deleted = fallbackEvents.splice(idx, 1)[0];
    return res.json(deleted);
  }
});

// GET volunteers for an event (requires event_signups table and volunteerprofile/user_table)
router.get('/:id/volunteers', async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const q = await pool.query(
      `SELECT vp.volunteer_id, vp.full_name, u.user_email FROM event_signups es JOIN volunteerprofile vp ON es.volunteer_id = vp.volunteer_id JOIN user_table u ON vp.user_id = u.user_id WHERE es.event_id = $1`,
      [id]
    );
    const list = q.rows.map(r => ({ id: r.volunteer_id, name: r.full_name || r.user_email }));
    res.json(list);
  } catch (err) {
    // if table doesn't exist or other error, return empty list to frontend
    console.error('Get event volunteers error (may be missing table):', err.message);
    res.json([]);
  }
});

module.exports = router;