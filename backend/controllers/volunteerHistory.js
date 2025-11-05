const pool = require('../db'); // adjust the path if needed

// GET all volunteer history records
exports.getVolunteerHistory = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT vh.*, vp.full_name AS volunteer_name, c.event_name
      FROM volunteer_history vh
      JOIN volunteerprofile vp ON vh.volunteer_id = vp.volunteer_id
      JOIN calendar c ON vh.event_id = c.event_id
      ORDER BY vh.signup_date DESC
    `);

    res.status(200).json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch volunteer history.' });
  }
};

// POST create a new volunteer record
exports.createVolunteerRecord = async (req, res) => {
  try {
    const { volunteer_id, event_id, hours_worked, notes } = req.body;

    if (!volunteer_id || !event_id || hours_worked === undefined) {
      return res.status(400).json({ error: 'volunteer_id, event_id, and hours_worked are required.' });
    }

    const result = await pool.query(
      `INSERT INTO volunteer_history (volunteer_id, event_id, hours_worked, notes)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [volunteer_id, event_id, hours_worked, notes]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create volunteer record.' });
  }
};

// PUT update an existing record
exports.updateVolunteerRecord = async (req, res) => {
  try {
    const { id } = req.params;
    const { volunteer_id, event_id, hours_worked, notes } = req.body;

    const result = await pool.query(
      `UPDATE volunteer_history
       SET volunteer_id = COALESCE($1, volunteer_id),
           event_id = COALESCE($2, event_id),
           hours_worked = COALESCE($3, hours_worked),
           notes = COALESCE($4, notes)
       WHERE history_id = $5
       RETURNING *`,
      [volunteer_id, event_id, hours_worked, notes, id]
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

// DELETE a volunteer record
exports.deleteVolunteerRecord = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      'DELETE FROM volunteer_history WHERE history_id = $1 RETURNING *',
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
