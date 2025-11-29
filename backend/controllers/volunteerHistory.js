const pool = require('../db');

// GET all volunteer history records
exports.getVolunteerHistory = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT vh.*, vp.full_name AS volunteer_name, ed.event_name
      FROM volunteer_history vh
      JOIN volunteerprofile vp ON vp.user_id = vh.volunteer_id
      JOIN eventdetails ed ON vh.event_id = ed.event_id
      ORDER BY vh.signup_date DESC
    `);

    res.status(200).json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch volunteer history.' });
  }
};

// GET history for a single volunteer
exports.getVolunteerHistoryByVolunteer = async (req, res) => {
  try {
    const { volunteer_id } = req.params;

    if (!volunteer_id) {
      return res.status(400).json({ error: "Missing volunteer_id" });
    }

    // volunteer_id IS user_id
    let result = await pool.query(
      `
      SELECT
        vh.*,
        vp.full_name AS volunteer_name,
        ed.event_name,
        ed.event_date,
        ed.location
      FROM volunteer_history vh
      LEFT JOIN volunteerprofile vp ON vp.user_id = vh.volunteer_id
      JOIN eventdetails ed ON vh.event_id = ed.event_id
      WHERE vh.volunteer_id = $1
      ORDER BY vh.signup_date DESC
      `,
      [volunteer_id]   // THIS IS USER_ID
    );

    res.status(200).json(result.rows);
  } catch (err) {
    console.error("getVolunteerHistoryByVolunteer error:", err);
    res.status(500).json({ error: "Failed to fetch volunteer history." });
  }
};

// POST create a new volunteer record
exports.createVolunteerRecord = async (req, res) => {
  try {
    let { volunteer_id, event_id, user_id } = req.body;

    if (!event_id) {
      return res.status(400).json({ error: "event_id is required." });
    }

    // volunteer_history.volunteer_id stores USER_ID
    if (!volunteer_id && user_id) volunteer_id = user_id;

    if (!volunteer_id) {
      return res.status(400).json({ error: "volunteer_id or user_id is required." });
    }

    // prevent duplicate
    const existing = await pool.query(
      `SELECT 1 FROM volunteer_history WHERE volunteer_id=$1 AND event_id=$2`,
      [volunteer_id, event_id]
    );

    if (existing.rows.length > 0) {
      return res.status(409).json({ error: "You have already joined this event." });
    }

    const insertResult = await pool.query(
      `
      INSERT INTO volunteer_history (volunteer_id, event_id, signup_date)
      VALUES ($1, $2, NOW())
      RETURNING *
      `,
      [volunteer_id, event_id]
    );

    res.status(201).json(insertResult.rows[0]);
  } catch (err) {
    console.error("createVolunteerRecord error:", err);
    res.status(500).json({ error: "Failed to create volunteer record." });
  }
};

// UPDATE record
exports.updateVolunteerRecord = async (req, res) => {
  try {
    const { id } = req.params;
    const { volunteer_id, event_id } = req.body;

    const result = await pool.query(
      `
      UPDATE volunteer_history
      SET volunteer_id = COALESCE($1, volunteer_id),
          event_id = COALESCE($2, event_id)
      WHERE history_id = $3
      RETURNING *
      `,
      [volunteer_id, event_id, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Volunteer history record not found.' });
    }

    res.status(200).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update volunteer record.' });
  }
};

// DELETE a record
exports.deleteVolunteerRecord = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      'DELETE FROM volunteer_history WHERE history_id=$1 RETURNING *',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Volunteer record not found.' });
    }

    res.status(200).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete volunteer record.' });
  }
};
