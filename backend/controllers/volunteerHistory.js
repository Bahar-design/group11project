const pool = require('../db');

// -------------------------------------------------------------
// GET ALL VOLUNTEER HISTORY (fixed JOIN that actually returns rows)
// -------------------------------------------------------------
exports.getVolunteerHistory = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        vh.*,
        vp.full_name AS volunteer_name,
        ed.event_name,
        ed.location,
        ed.event_date
      FROM volunteer_history vh
      JOIN user_table ut ON vh.volunteer_id = ut.user_id
      JOIN volunteerprofile vp ON vp.user_id = ut.user_id
      JOIN eventdetails ed ON vh.event_id = ed.event_id
      ORDER BY vh.signup_date DESC
    `);

    res.status(200).json(result.rows);
  } catch (err) {
    console.error("getVolunteerHistory error:", err);
    res.status(500).json({ error: 'Failed to fetch volunteer history.' });
  }
};


// -------------------------------------------------------------
// GET HISTORY FOR A SINGLE VOLUNTEER
// volunteer_id === user_table.user_id
// -------------------------------------------------------------
exports.getVolunteerHistoryByVolunteer = async (req, res) => {
  try {
    const { volunteer_id } = req.params;

    if (!volunteer_id) {
      return res.status(400).json({ error: "Missing volunteer_id" });
    }

    const q = `
      SELECT 
        vh.*,
        vp.full_name AS volunteer_name,
        ed.event_name,
        ed.location,
        ed.event_date
      FROM volunteer_history vh
      JOIN user_table ut ON vh.volunteer_id = ut.user_id
      JOIN volunteerprofile vp ON vp.user_id = ut.user_id
      JOIN eventdetails ed ON vh.event_id = ed.event_id
      WHERE vh.volunteer_id = $1
      ORDER BY vh.signup_date DESC
    `;

    const result = await pool.query(q, [volunteer_id]);

    res.status(200).json(result.rows);

  } catch (err) {
    console.error("getVolunteerHistoryByVolunteer error:", err);
    res.status(500).json({ error: "Failed to fetch volunteer history." });
  }
};


// -------------------------------------------------------------
// CREATE VOLUNTEER RECORD
// -------------------------------------------------------------
exports.createVolunteerRecord = async (req, res) => {
  try {
    let { volunteer_id, event_id, user_id } = req.body;

    if (!event_id) {
      return res.status(400).json({ error: "event_id is required." });
    }

    // volunteer_id should equal user_id
    if (!volunteer_id && user_id) volunteer_id = user_id;
    if (!volunteer_id) {
      return res.status(400).json({ error: "volunteer_id or user_id is required." });
    }

    // Prevent duplicate signup
    const existing = await pool.query(
      `SELECT 1 FROM volunteer_history WHERE volunteer_id = $1 AND event_id = $2`,
      [volunteer_id, event_id]
    );

    if (existing.rows.length > 0) {
      return res.status(409).json({ error: "You have already joined this event." });
    }

    // INSERT record
    const insertResult = await pool.query(
      `INSERT INTO volunteer_history (volunteer_id, event_id, signup_date)
       VALUES ($1, $2, NOW())
       RETURNING *`,
      [volunteer_id, event_id]
    );

    // increment volunteer count
    await pool.query(
      `UPDATE eventdetails 
       SET volunteers = COALESCE(volunteers, 0) + 1
       WHERE event_id = $1`,
      [event_id]
    );

    res.status(201).json(insertResult.rows[0]);

  } catch (err) {
    console.error("createVolunteerRecord error:", err);
    res.status(500).json({ error: "Failed to create volunteer record." });
  }
};


// -------------------------------------------------------------
// UPDATE
// -------------------------------------------------------------
exports.updateVolunteerRecord = async (req, res) => {
  try {
    const { id } = req.params;
    const { volunteer_id, event_id } = req.body;

    const result = await pool.query(
      `UPDATE volunteer_history
       SET volunteer_id = COALESCE($1, volunteer_id),
           event_id = COALESCE($2, event_id)
       WHERE history_id = $3
       RETURNING *`,
      [volunteer_id, event_id, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Volunteer history record not found." });
    }

    res.status(200).json(result.rows[0]);

  } catch (err) {
    console.error("updateVolunteerRecord error:", err);
    res.status(500).json({ error: "Failed to update volunteer record." });
  }
};


// -------------------------------------------------------------
// DELETE
// -------------------------------------------------------------
exports.deleteVolunteerRecord = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `DELETE FROM volunteer_history WHERE history_id = $1 RETURNING *`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Volunteer record not found." });
    }

    res.status(200).json(result.rows[0]);

  } catch (err) {
    console.error("deleteVolunteerRecord error:", err);
    res.status(500).json({ error: 'Failed to delete volunteer record.' });
  }
};
