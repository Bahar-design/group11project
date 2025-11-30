const pool = require('../db');

//GET ALL volunteer history records
exports.getVolunteerHistory = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT vh.*, vp.full_name AS volunteer_name, ed.event_name
      FROM volunteer_history vh
      JOIN volunteerprofile vp ON vh.volunteer_id = vp.user_id
      JOIN eventdetails ed ON vh.event_id = ed.event_id
      ORDER BY vh.signup_date DESC
    `);

    res.status(200).json(result.rows);
  } catch (err) {
    console.error("getVolunteerHistory error:", err);
    res.status(500).json({ error: "Failed to fetch volunteer history." });
  }
};


//GET history for a SINGLE volunteer
// volunteer_id may be volunteerprofile.volunteer_id OR user_id
exports.getVolunteerHistoryByVolunteer = async (req, res) => {
  try {
    const { volunteer_id } = req.params;

    if (!volunteer_id) {
      return res.status(400).json({ error: "Missing volunteer_id" });
    }

    let result;

    //Try as volunteerprofile.volunteer_id first
    result = await pool.query(
      `
      SELECT
        vh.*,
        vp.full_name AS volunteer_name,
        ed.event_name,
        ed.event_date,
        ed.location
      FROM volunteerprofile vp
      JOIN volunteer_history vh
        ON vh.volunteer_id = vp.user_id
      JOIN eventdetails ed
        ON vh.event_id = ed.event_id
      WHERE vp.volunteer_id = $1
      ORDER BY vh.signup_date DESC
      `,
      [volunteer_id]
    );

    //If no rows 
    if (result.rows.length === 0) {
      result = await pool.query(
        `
        SELECT
          vh.*,
          ed.event_name,
          ed.event_date,
          ed.location
        FROM volunteer_history vh
        JOIN eventdetails ed
          ON vh.event_id = ed.event_id
        WHERE vh.volunteer_id = $1
        ORDER BY vh.signup_date DESC
        `,
        [volunteer_id]
      );
    }

    res.status(200).json(result.rows);
  } catch (err) {
    console.error("getVolunteerHistoryByVolunteer error:", err);
    res.status(500).json({ error: "Failed to fetch volunteer history." });
  }
};

//CREATE volunteer record (JOIN EVENT)
exports.createVolunteerRecord = async (req, res) => {
  try {
    let { volunteer_id, event_id, user_id } = req.body;

    if (!event_id) {
      return res.status(400).json({ error: "event_id is required." });
    }

    // volunteer_id MUST equal user_id
    if (!volunteer_id && user_id) volunteer_id = user_id;

    if (!volunteer_id) {
      return res.status(400).json({ error: "volunteer_id or user_id is required." });
    }

    //Prevent duplicate signups
    const existing = await pool.query(
      `
      SELECT 1
      FROM volunteer_history
      WHERE volunteer_id = $1 AND event_id = $2
      `,
      [volunteer_id, event_id]
    );

    if (existing.rows.length > 0) {
      return res.status(409).json({ error: "You have already joined this event." });
    }

    //INSERT the volunteer_history record
    const insertResult = await pool.query(
      `
      INSERT INTO volunteer_history (volunteer_id, event_id, signup_date)
      VALUES ($1, $2, NOW())
      RETURNING *
      `,
      [volunteer_id, event_id]
    );

    //Update event volunteer count
    await pool.query(
      `
      UPDATE eventdetails
      SET volunteers = COALESCE(volunteers, 0) + 1
      WHERE event_id = $1
      `,
      [event_id]
    );


    //BEGIN NOTIFICATIONS FOR JOIN EVENT
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

    const eventRes = await pool.query(
      `
      SELECT event_name, location, event_date
      FROM eventdetails
      WHERE event_id = $1
      `,
      [event_id]
    );

    const eventName = eventRes.rows[0]?.event_name;
    const eventLoc = eventRes.rows[0]?.location;
    const rawDate = eventRes.rows[0]?.event_date;
    const eventDate = rawDate ? rawDate.toISOString().slice(0, 10) : null;

    const adminRes = await pool.query(
      `SELECT user_email FROM user_table WHERE user_type = 'admin'`
    );
    const adminEmails = adminRes.rows.map(a => a.user_email);

    //Notify all admins
    for (const adminEmail of adminEmails) {
      await pool.query(
        `
        INSERT INTO notifications (message_from, message_to, message_text, message_sent)
        VALUES ($1, $2, $3, TRUE)
        `,
        [
          "Event Update",
          adminEmail,
          `${volunteerName} has joined "${eventName}" scheduled on ${eventDate}.`
        ]
      );
    }

    //Notify volunteer
    if (volunteerEmail) {
      await pool.query(
        `
        INSERT INTO notifications (message_from, message_to, message_text, message_sent)
        VALUES ($1, $2, $3, TRUE)
        `,
        [
          "Event Update",
          volunteerEmail,
          `Congratulations ${volunteerName}! You joined "${eventName}".\nLocation: ${eventLoc}\nDate: ${eventDate}`
        ]
      );
    }

    //END NOTIFICATIONS FOR JOIN EVENT
    res.status(201).json(insertResult.rows[0]);
  } catch (err) {
    console.error("createVolunteerRecord error:", err);
    res.status(500).json({ error: "Failed to create volunteer record." });
  }
};

//UPDATE volunteer record
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
      return res.status(404).json({ error: "Volunteer history record not found." });
    }

    res.status(200).json(result.rows[0]);
  } catch (err) {
    console.error("updateVolunteerRecord error:", err);
    res.status(500).json({ error: "Failed to update volunteer record." });
  }
};

//DELETE volunteer record (UNJOIN EVENT)
exports.deleteVolunteerRecord = async (req, res) => {
  try {
    const { id } = req.params;

    // Get deleted record (to know volunteer + event)
    const historyRes = await pool.query(
      `
      SELECT vh.*, ed.event_name, ed.event_date
      FROM volunteer_history vh
      JOIN eventdetails ed ON vh.event_id = ed.event_id
      WHERE vh.history_id = $1
      `,
      [id]
    );

    if (historyRes.rows.length === 0) {
      return res.status(404).json({ error: "Volunteer record not found." });
    }

    const row = historyRes.rows[0];
    const { volunteer_id, event_id, event_name, event_date } = row;
    const eventDate = event_date ? event_date.toISOString().slice(0, 10) : null;

    //DELETE from table
    await pool.query(
      `
      DELETE FROM volunteer_history
      WHERE history_id = $1
      `,
      [id]
    );

    //Decrease event volunteer count
    await pool.query(
      `
      UPDATE eventdetails
      SET volunteers = GREATEST(COALESCE(volunteers, 1) - 1, 0)
      WHERE event_id = $1
      `,
      [event_id]
    );

    //BEGIN NOTIFICATIONS FOR UNJOIN EVENT (NEW)
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

    const adminRes = await pool.query(
      `SELECT user_email FROM user_table WHERE user_type='admin'`
    );
    const adminEmails = adminRes.rows.map(a => a.user_email);

    //Notify admins about unjoin
    for (const adminEmail of adminEmails) {
      await pool.query(
        `
        INSERT INTO notifications (message_from, message_to, message_text, message_sent)
        VALUES ($1, $2, $3, TRUE)
        `,
        [
          "Event Update",
          adminEmail,
          `${volunteerName} has removed themselves from "${event_name}" (Date: ${eventDate}).`
        ]
      );
    }

    //Notify volunteer
    if (volunteerEmail) {
      await pool.query(
        `
        INSERT INTO notifications (message_from, message_to, message_text, message_sent)
        VALUES ($1, $2, $3, TRUE)
        `,
        [
          "Event Update",
          volunteerEmail,
          `You have been removed from "${event_name}" scheduled on ${eventDate}.`
        ]
      );
    }

    // END NOTIFICATIONS FOR UNJOIN EVENT (NEW)
    res.status(200).json({ message: "Record deleted", deleted: row });
  } catch (err) {
    console.error("deleteVolunteerRecord error:", err);
    res.status(500).json({ error: "Failed to delete volunteer record." });
  }
};
