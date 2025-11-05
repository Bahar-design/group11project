const pool = require('../db'); // adjust path as needed

// GET all events
exports.getAllEvents = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM calendar ORDER BY event_date ASC');
    res.status(200).json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch events.' });
  }
};

// POST create new event
exports.createEvent = async (req, res) => {
  try {
    const { event_name, event_date, location, description, max_volunteers } = req.body;

    if (!event_name || !event_date) {
      return res.status(400).json({ error: 'Event name and date are required.' });
    }

    const result = await pool.query(
      `INSERT INTO calendar (event_name, event_date, location, description, max_volunteers)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [event_name, event_date, location, description, max_volunteers]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create event.' });
  }
};

// PUT update an event
exports.updateEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const { event_name, event_date, location, description, max_volunteers } = req.body;

    const result = await pool.query(
      `UPDATE calendar
       SET event_name = COALESCE($1, event_name),
           event_date = COALESCE($2, event_date),
           location = COALESCE($3, location),
           description = COALESCE($4, description),
           max_volunteers = COALESCE($5, max_volunteers)
       WHERE event_id = $6
       RETURNING *`,
      [event_name, event_date, location, description, max_volunteers, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Event not found.' });
    }

    res.status(200).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update event.' });
  }
};

// DELETE an event
exports.deleteEvent = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query('DELETE FROM calendar WHERE event_id = $1 RETURNING *', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Event not found.' });
    }

    res.status(200).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete event.' });
  }
};
