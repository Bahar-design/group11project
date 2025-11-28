const pool = require('../db'); // adjust the path if needed

// GET all volunteer history records
exports.getVolunteerHistory = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT vh.*, vp.full_name AS volunteer_name, ed.event_name
      FROM volunteer_history vh
      JOIN volunteerprofile vp ON vh.volunteer_id = vp.volunteer_id
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

    const result = await pool.query(
      `
      SELECT
        vh.*,
        vp.full_name AS volunteer_name,
        ed.event_name,
        ed.event_date,
        ed.location
      FROM volunteerprofile vp
      JOIN volunteer_history vh
        ON vh.volunteer_id = vp.user_id            -- 🔴 vh.volunteer_id is user_id
      JOIN eventdetails ed
        ON vh.event_id = ed.event_id
      WHERE vp.volunteer_id = $1                   -- 🔴 param is volunteerprofile.volunteer_id
      ORDER BY vh.signup_date DESC
      `,
      [volunteer_id]
    )
    res.status(200).json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch volunteer history." });
  }
};

// POST create a new volunteer record
// POST create a new volunteer record
exports.createVolunteerRecord = async (req, res) => {
  try {
    let { volunteer_id, event_id, user_id } = req.body;

    console.log("createVolunteerRecord body:", req.body);

    if (!event_id) {
      return res.status(400).json({ error: "event_id is required." });
    }

    // 🧠 In your schema, volunteer_history.volunteer_id REFERENCES user_table(user_id)
    // So we want volunteer_id === user_id.
    if (!volunteer_id && user_id) {
      volunteer_id = user_id;
    }

    if (!volunteer_id) {
      return res
        .status(400)
        .json({ error: "volunteer_id or user_id is required." });
    }

    // OPTIONAL: prevent duplicate signup for same event
    const existing = await pool.query(
      `
      SELECT 1
      FROM volunteer_history
      WHERE volunteer_id = $1 AND event_id = $2
      `,
      [volunteer_id, event_id]
    );
    if (existing.rows.length > 0) {
      return res
        .status(409)
        .json({ error: "You have already joined this event." });
    }

    // 1) Insert volunteer history record (volunteer_id is actually user_id here)
    const insertResult = await pool.query(
      `
      INSERT INTO volunteer_history (volunteer_id, event_id, signup_date)
      VALUES ($1, $2, NOW())
      RETURNING *
      `,
      [volunteer_id, event_id]
    );

    // 2) Increment event volunteer count
    await pool.query(
      `
      UPDATE eventdetails
      SET volunteers = COALESCE(volunteers, 0) + 1
      WHERE event_id = $1
      `,
      [event_id]
    );

    // 3) Fetch volunteer name + email using user_id (volunteer_id)
    const volRes = await pool.query(
      `
      SELECT vp.full_name, ut.user_email
      FROM volunteerprofile vp
      JOIN user_table ut ON vp.user_id = ut.user_id
      WHERE ut.user_id = $1
      `,
      [volunteer_id]
    );

    const volunteerName = volRes.rows[0]?.full_name || "Volunteer";
    const volunteerEmail = volRes.rows[0]?.user_email;

    //  To keep things simple while we stabilize, you can COMMENT OUT notifications for now.
    //    If they were working before, you can leave them — they don't affect the FK issue.
    //
    // // 4) Get event info
    // const eventRes = await pool.query(
    //   `
    //   SELECT event_name, location, event_date
    //   FROM eventdetails
    //   WHERE event_id = $1
    //   `,
    //   [event_id]
    // );
    //
    // const eventName = eventRes.rows[0]?.event_name;
    // const eventLocation = eventRes.rows[0]?.location;
    // const rawDate = eventRes.rows[0]?.event_date;
    // const eventDate = rawDate ? rawDate.toISOString().slice(0, 10) : null;
    //
    // // 5) Get admin emails
    // const adminRes = await pool.query(
    //   `
    //   SELECT user_email
    //   FROM user_table
    //   WHERE user_type = 'admin'
    //   `
    // );
    //
    // const adminEmails = adminRes.rows.map((a) => a.user_email);
    //
    // // 6) Notify admins
    // for (const adminEmail of adminEmails) {
    //   await pool.query(
    //     `
    //     INSERT INTO notifications (message_from, message_to, message_text, message_sent)
    //     VALUES ($1, $2, $3, TRUE)
    //     `,
    //     [
    //       "system",
    //       adminEmail,
    //       `${volunteerName} has volunteered for ${eventName} scheduled on ${eventDate}.`,
    //     ]
    //   );
    // }
    //
    // // 7) Notify volunteer
    // if (volunteerEmail) {
    //   await pool.query(
    //     `
    //     INSERT INTO notifications (message_from, message_to, message_text, message_sent)
    //     VALUES ($1, $2, $3, TRUE)
    //     `,
    //     [
    //       "system",
    //       volunteerEmail,
    //       `Congratulations ${volunteerName}! You have successfully volunteered for ${eventName}.
    // Location of event: ${eventLocation}
    // Date of event: ${eventDate}`,
    //     ]
    //   );
    // }

    res.status(201).json(insertResult.rows[0]);
  } catch (err) {
    console.error("createVolunteerRecord error:", err);
    res.status(500).json({ error: "Failed to create volunteer record." });
  }
};



//PUT update an existing record
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
