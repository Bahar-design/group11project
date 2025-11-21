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
const { validateEvent } = require('../validators/eventValidator');

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
// NOTE: removed in-memory hardcoded fallback events. Data must come from the DB.

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

// GET available skills (for frontend dropdowns)
router.get('/skills', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT skill_id, skill_name FROM skills ORDER BY skill_name ASC');
    // return as simple array of { value, label }
    const out = rows.map(r => ({ value: r.skill_name, label: r.skill_name, id: r.skill_id }));
    res.json(out);
  } catch (err) {
    console.error('GET /api/events/skills error:', err.message || err);
    res.status(500).json({ error: 'Failed to fetch skills' });
  }
});

// Helper: resolve an input value to an admin_id.
// The input may be an admin_id or a user_id; prefer existing admin_id, then try user_id.
async function resolveAdminId(inputVal) {
  if (!inputVal) return null;
  try {
    // First try to find adminprofile where admin_id matches (some records may store admin_id directly)
    let q = await pool.query('SELECT admin_id FROM adminprofile WHERE admin_id = $1 LIMIT 1', [inputVal]);
    if (q && q.rows.length > 0) return q.rows[0].admin_id;
    // Then try to find adminprofile by user_id
    q = await pool.query('SELECT admin_id FROM adminprofile WHERE user_id = $1 LIMIT 1', [inputVal]);
    if (q && q.rows.length > 0) return q.rows[0].admin_id;
    // Not found; as a last resort attempt to create a minimal adminprofile using inputVal as both ids
    try {
      await pool.query('INSERT INTO adminprofile (admin_id, user_id) VALUES ($1, $2)', [inputVal, inputVal]);
      return inputVal;
    } catch (createErr) {
      // If creation fails, try to lookup again by admin_id
      const lookup = await pool.query('SELECT admin_id FROM adminprofile WHERE admin_id = $1 LIMIT 1', [inputVal]);
      if (lookup && lookup.rows.length > 0) return lookup.rows[0].admin_id;
    }
  } catch (e) {
    console.error('resolveAdminId error:', e.message || e);
  }
  return null;
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

      // lookup creator name if available
      let createdByName = null;
      try {
        if (r.created_by) {
          // Try admin_id then user_id when resolving creator name
          const adminId = await resolveAdminId(r.created_by);
          if (adminId) {
            const cr = await pool.query('SELECT full_name FROM adminprofile WHERE admin_id = $1', [adminId]);
            if (cr.rows.length > 0) createdByName = cr.rows[0].full_name;
          }
        }
      } catch (e) { /* ignore */ }

      out.push({
        id: r.event_id,
        name: r.event_name,
        description: r.description,
        location: r.location,
        urgency: URGENCY_MAP_REVERSE[r.urgency] || r.urgency,
        date: r.event_date ? r.event_date.toISOString().slice(0, 10) : null,
        volunteers: Number(r.volunteers) || (volunteersList.length),
        volunteersList,
        skillIds,
        requiredSkills: skills,
        createdBy: r.created_by,
        createdByName
      });
    }
    res.json(out);
  } catch (err) {
    // DB failed — return 500 (no in-memory fallback)
    console.error('Events GET error:', err.message || err);
    return res.status(500).json({ error: 'Failed to fetch events', detail: err.message || String(err) });
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
    // resolve creator name
    let createdByName = null;
    try {
      if (r.created_by) {
        const adminId = await resolveAdminId(r.created_by);
        if (adminId) {
          const cr = await pool.query('SELECT full_name FROM adminprofile WHERE admin_id = $1', [adminId]);
          if (cr.rows.length) createdByName = cr.rows[0].full_name;
        }
      }
    } catch (e) {}
    res.json({
      id: r.event_id,
      name: r.event_name,
      description: r.description,
      location: r.location,
      urgency: URGENCY_MAP_REVERSE[r.urgency] || r.urgency,
      date: r.event_date ? r.event_date.toISOString().slice(0,10) : null,
      volunteers: Number(r.volunteers) || 0,
      requiredSkills: skills,
      skillIds: r.skill_id || [],
      createdBy: r.created_by,
      createdByName
    });
  } catch (err) {
    console.error('GET event by id error:', err.message || err);
    return res.status(500).json({ error: 'Failed to fetch event', detail: err.message || String(err) });
  }
});


// POST create event
router.post('/', async (req, res) => {
  // destructure outside try so fallback catch can reference values
  const { name, description, location, requiredSkills = [], urgency, date } = req.body || {};
  try {
      // validate payload using validator (also enforces Houston-area city requirement)
      const { error, value } = validateEvent({ name, description, location, requiredSkills, urgency, date });
      if (error) return res.status(400).json({ error: error.message });
      const urgencyNum = URGENCY_MAP[value.urgency] || URGENCY_MAP['Low'];

  const skillIds = await ensureSkillIds(value.requiredSkills);

    // Prefer authenticated user (req.user) but allow a client-provided createdBy as a fallback
    // Frontend SHOULD rely on server-side auth; accepting client-supplied creator is a fallback for deployments
    // where auth middleware is not installed. We log a warning when this fallback is used.
    const userIdFromReq = req.user && (req.user.id || req.user.user_id);
    const providedCreatedBy = req.body && (req.body.createdBy || req.body.created_by);
    if (!userIdFromReq && !providedCreatedBy) {
      return res.status(401).json({ error: 'Authentication required: events must be created by an admin' });
    }

    const userId = userIdFromReq || providedCreatedBy;
    if (!userIdFromReq && providedCreatedBy) {
      console.warn('No req.user present; using client-provided createdBy as fallback for event creation.');
    }
    let creator = null;
    try {
      // Prefer to find an adminprofile by user_id
      const ap = await pool.query('SELECT admin_id FROM adminprofile WHERE user_id = $1 LIMIT 1', [userId]);
      if (ap && ap.rows.length > 0) {
        creator = ap.rows[0].admin_id;
      } else {
        // Create a minimal adminprofile with admin_id = userId
        try {
          await pool.query('INSERT INTO adminprofile (admin_id, user_id) VALUES ($1, $2)', [userId, userId]);
          creator = userId;
        } catch (createErr) {
          // If insert fails, try to lookup by admin_id
          const lookup = await pool.query('SELECT admin_id FROM adminprofile WHERE admin_id = $1 LIMIT 1', [userId]);
          if (lookup && lookup.rows.length > 0) creator = lookup.rows[0].admin_id;
        }
      }
    } catch (e) {
      console.error('Error mapping req.user to adminprofile:', e.message || e);
      return res.status(500).json({ error: 'Server error mapping authenticated user to admin profile' });
    }

    if (!creator) {
      return res.status(400).json({ error: 'Unable to resolve admin profile for authenticated user' });
    }

    const insertQ = `INSERT INTO ${TABLE} (event_name, description, location, urgency, event_date, created_by, volunteers, skill_id) VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`;
  const { rows } = await pool.query(insertQ, [value.name, value.description, value.location, urgencyNum, value.date, creator, 0, skillIds]);
    const r = rows[0];

    // maintain event_skills join table if it exists
    try {
      await pool.query('DELETE FROM event_skills WHERE event_id = $1', [r.event_id]);
      for (const sid of skillIds) {
        await pool.query('INSERT INTO event_skills (event_id, skill_id) VALUES ($1,$2) ON CONFLICT DO NOTHING', [r.event_id, sid]);
      }
    } catch (ignore) {}

  const skills = await skillNamesForIds(skillIds);
  res.status(201).json({ id: r.event_id, name: r.event_name, description: r.description, location: r.location, urgency: value.urgency, date: r.event_date.toISOString().slice(0,10), requiredSkills: skills, volunteers: 0, createdBy: r.created_by });
  } catch (err) {
    // If DB insert fails, return an error (do not fallback to in-memory store)
    console.error('Create event error:', err.message || err);
    // If the error is a foreign key violation on created_by, surface a clearer message
    if (err.code === '23503' && err.constraint && err.constraint.includes('created_by')) {
      return res.status(400).json({ error: 'Invalid created_by (referenced admin not found)' });
    }
    return res.status(500).json({ error: 'Failed to create event', detail: err.message || String(err) });
  }
});

// PUT update event
router.put('/:id', async (req, res) => {
  const id = parseInt(req.params.id, 10);
  const { name, description, location, requiredSkills = [], urgency, date } = req.body || {};
  try {
    const { rows: exists } = await pool.query(`SELECT * FROM ${TABLE} WHERE event_id = $1`, [id]);
    if (exists.length === 0) return res.status(404).json({ error: 'Event not found' });

    // validate payload
    const { error, value } = validateEvent({ name, description, location, requiredSkills, urgency, date });
    if (error) return res.status(400).json({ error: error.message });
    const urgencyNum = URGENCY_MAP[value.urgency] || URGENCY_MAP['Low'];
    const skillIds = await ensureSkillIds(value.requiredSkills);

  // Do not modify created_by on update. Remove time_slots column usage.
  const updateQ = `UPDATE ${TABLE} SET event_name=$1, description=$2, location=$3, urgency=$4, event_date=$5, skill_id=$6 WHERE event_id=$7 RETURNING *`;
  const { rows } = await pool.query(updateQ, [name, description, location, urgencyNum, date, skillIds, id]);
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
    console.error('Update event error:', err.message || err);
    // Return database error details (avoid in-memory fallback)
    return res.status(500).json({ error: 'Failed to update event', detail: err.message || String(err) });
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
    console.error('Delete event error:', err.message || err);
    return res.status(500).json({ error: 'Failed to delete event', detail: err.message || String(err) });
  }
});

// GET volunteers for an event (joins volunteer_history -> user_table -> volunteerprofile)
router.get('/:id/volunteers', async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (Number.isNaN(id)) return res.status(400).json({ error: 'Invalid event id' });
    // support lightweight count-only mode for initial page loads
    if (req.query && (req.query.countOnly === 'true' || req.query.countOnly === '1')) {
      try {
        const cnt = await pool.query('SELECT COUNT(*)::int AS count FROM volunteer_history WHERE event_id = $1', [id]);
        return res.json({ count: cnt.rows[0].count });
      } catch (err) {
        console.error('Volunteer count query failed:', err.message || err);
        return res.json({ count: 0 });
      }
    }

    const q = await pool.query(
      `SELECT vh.history_id, vh.signup_date, ut.user_id, ut.user_email, vp.volunteer_id AS volunteer_profile_id, vp.full_name, vp.city
       FROM volunteer_history vh
       JOIN user_table ut ON vh.volunteer_id = ut.user_id
       LEFT JOIN volunteerprofile vp ON ut.user_id = vp.user_id
       WHERE vh.event_id = $1
       ORDER BY vh.signup_date ASC, COALESCE(vp.full_name, ut.user_email) ASC`,
      [id]
    );

    const list = q.rows.map(r => ({
      history_id: r.history_id,
      user_id: r.user_id,
      volunteer_profile_id: r.volunteer_profile_id || null,
      full_name: r.full_name || r.user_email,
      email: r.user_email,
      city: r.city || null,
      signup_date: r.signup_date ? r.signup_date.toISOString() : null,
    }));

    return res.json(list);
  } catch (err) {
    // Preserve previous frontend/tests behavior: on DB error return empty list (200)
    console.error('Get event volunteers error (DB error) - returning empty list to frontend:', err.message || err);
    return res.json([]);
  }
});

// GET counts for all events (single-query endpoint to optimize initial page loads)
router.get('/counts/all', async (req, res) => {
  try {
    // group counts by event_id
    const q = await pool.query('SELECT event_id, COUNT(*)::int AS count FROM volunteer_history GROUP BY event_id');
    // return as array of { event_id, count }
    res.json(q.rows.map(r => ({ event_id: r.event_id, count: r.count })));
  } catch (err) {
    console.error('GET /api/events/counts error:', err.message || err);
    return res.status(500).json({ error: 'Failed to fetch event counts' });
  }
});

module.exports = router;