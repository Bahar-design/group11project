/*
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
// GET history for a single volunteer
exports.getVolunteerHistoryByVolunteer = async (req, res) => {
  try {
    const { volunteer_id } = req.params;

    if (!volunteer_id) {
      return res.status(400).json({ error: "Missing volunteer_id" });
    }

    // 1️⃣ First, treat volunteer_id as volunteerprofile.volunteer_id
    //    vh.volunteer_id stores user_id (from user_table)
    let result = await pool.query(
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

    if (result.rows.length === 0) {
      // 2️⃣ Fallback: treat param as user_id directly
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
*/

const pool = require('../db');
const { broadcast } = require('../utils/sse');

// ------------------------------------------------------
// GET all volunteer history records
// ------------------------------------------------------
exports.getVolunteerHistory = async (req, res) => {
  try {
    const result = await pool.query(
      `
      SELECT 
        vh.*, 
        COALESCE(vp.full_name, 'Unknown') AS volunteer_name, 
        ed.event_name,
        ed.description,
        ed.location,
        ed.skill_id AS event_skill_ids,
        ed.urgency,
        ed.event_date
      FROM volunteer_history vh
      LEFT JOIN volunteerprofile vp 
        ON vp.user_id = vh.volunteer_id     
      JOIN eventdetails ed 
        ON vh.event_id = ed.event_id
      ORDER BY vh.signup_date DESC
      `
    );

    // For each row, compute matched skills by comparing event skill_ids to volunteer_skills
    const rows = result.rows;
    const enhanced = await Promise.all(rows.map(async (r) => {
      const eventSkillIds = r.event_skill_ids || [];
      // fetch volunteer skills (skill_id numbers) via volunteer_skills table
      const volSkillsRes = await pool.query(
        `SELECT skill_id FROM volunteer_skills WHERE volunteer_id = $1`,
        [r.volunteer_id]
      );
      const volSkillIds = volSkillsRes.rows.map(rr => rr.skill_id);
      const matchedIds = eventSkillIds.filter(id => volSkillIds.includes(id));

      // fetch skill names
      let matchedSkills = [];
      if (matchedIds.length > 0) {
        const skillsRes = await pool.query(
          `SELECT skill_id, skill_name FROM skills WHERE skill_id = ANY($1::int[])`,
          [matchedIds]
        );
        matchedSkills = skillsRes.rows.map(s => s.skill_name);
      }

      return {
        ...r,
        matched_skills: matchedSkills,
        event_skill_ids: eventSkillIds
      };
    }));

    res.status(200).json(enhanced);
  } catch (err) {
    console.error("getVolunteerHistory error:", err);
    res.status(500).json({ error: "Failed to fetch volunteer history." });
  }
};


// ------------------------------------------------------
// GET history for ONE volunteer
// volunteer_id IS ACTUALLY THE user_id
// ------------------------------------------------------
exports.getVolunteerHistoryByVolunteer = async (req, res) => {
  try {
    const { volunteer_id } = req.params;

    if (!volunteer_id) {
      return res.status(400).json({ error: "Missing volunteer_id" });
    }

    let result;
    try {
      result = await pool.query(
        `
        SELECT
          vh.*,
          COALESCE(vp.full_name, 'Unknown') AS volunteer_name,
          ed.event_name,
          ed.description,
          ed.location,
          ed.skill_id AS event_skill_ids,
          ed.urgency,
          ed.event_date
        FROM volunteer_history vh
        LEFT JOIN volunteerprofile vp 
          ON vp.user_id = vh.volunteer_id     
        JOIN eventdetails ed
          ON vh.event_id = ed.event_id
        WHERE vh.volunteer_id = $1           
        ORDER BY vh.signup_date DESC
        `,
        [volunteer_id]
      );
    } catch (primaryErr) {
      // Primary query failed (maybe due to treating param as volunteerprofile.volunteer_id).
      // Attempt fallback: treat the param as user_id stored in vh.volunteer_id
      console.error('Primary volunteer query failed, attempting fallback:', primaryErr);
      result = await pool.query(
        `
        SELECT
          vh.*,
          ed.event_name,
          ed.description,
          ed.location,
          ed.skill_id AS event_skill_ids,
          ed.urgency,
          ed.event_date
        FROM volunteer_history vh
        JOIN eventdetails ed
          ON vh.event_id = ed.event_id
        WHERE vh.volunteer_id = $1
        ORDER BY vh.signup_date DESC
        `,
        [volunteer_id]
      );
    }

    const rows = result.rows;
    const enhanced = await Promise.all(rows.map(async (r) => {
      const eventSkillIds = r.event_skill_ids || [];
      const volSkillsRes = await pool.query(
        `SELECT skill_id FROM volunteer_skills WHERE volunteer_id = $1`,
        [r.volunteer_id]
      );
      const volSkillIds = volSkillsRes.rows.map(rr => rr.skill_id);
      const matchedIds = eventSkillIds.filter(id => volSkillIds.includes(id));
      let matchedSkills = [];
      if (matchedIds.length > 0) {
        const skillsRes = await pool.query(
          `SELECT skill_id, skill_name FROM skills WHERE skill_id = ANY($1::int[])`,
          [matchedIds]
        );
        matchedSkills = skillsRes.rows.map(s => s.skill_name);
      }
      return {
        ...r,
        matched_skills: matchedSkills,
        event_skill_ids: eventSkillIds
      };
    }));

    // Also fetch volunteer full_name for header display
    let volunteer_full_name = null;
    try {
      const vpRes = await pool.query(
        `SELECT full_name FROM volunteerprofile WHERE user_id = $1`,
        [volunteer_id]
      );
      if (vpRes && Array.isArray(vpRes.rows) && vpRes.rows[0]) {
        volunteer_full_name = vpRes.rows[0].full_name || null;
      }
    } catch (e) {
      // ignore errors fetching profile name; return null instead
      volunteer_full_name = null;
    }

    res.status(200).json({ rows: enhanced, volunteer_full_name });
  } catch (err) {
    console.error("getVolunteerHistoryByVolunteer error:", err);
    res.status(500).json({ error: "Failed to fetch volunteer history." });
  }
};


// ------------------------------------------------------
// CREATE volunteer record
// volunteer_id MUST equal user_id
// ------------------------------------------------------
exports.createVolunteerRecord = async (req, res) => {
  try {
    let { volunteer_id, event_id, user_id } = req.body;

    if (!event_id) {
      return res.status(400).json({ error: "event_id is required." });
    }

    // volunteer_id should ALWAYS be user_id
    if (!volunteer_id && user_id) volunteer_id = user_id;

    if (!volunteer_id) {
      return res.status(400).json({
        error: "volunteer_id or user_id is required.",
      });
    }

    // Prevent duplicate signup
    const existing = await pool.query(
      `SELECT 1 FROM volunteer_history 
       WHERE volunteer_id = $1 AND event_id = $2`,
      [volunteer_id, event_id]
    );

    if (existing.rows.length > 0) {
      return res.status(409).json({ error: "You have already joined this event." });
    }

    // Insert row
    const insertResult = await pool.query(
      `
      INSERT INTO volunteer_history (volunteer_id, event_id, signup_date)
      VALUES ($1, $2, NOW())
      RETURNING *
      `,
      [volunteer_id, event_id]
    );

    // Increase event volunteer count
    await pool.query(
      `UPDATE eventdetails 
       SET volunteers = COALESCE(volunteers,0) + 1 
       WHERE event_id = $1`,
      [event_id]
    );

    // Broadcast SSE to connected clients about new volunteer history
    try {
      const newRow = insertResult.rows[0];

      // Enrich: fetch event details
      let eventInfo = {};
      try {
        const ev = await pool.query(
          `SELECT event_id, event_name, description, location, skill_id AS event_skill_ids, urgency, event_date FROM eventdetails WHERE event_id = $1`,
          [event_id]
        );
        if (ev && ev.rows && ev.rows[0]) eventInfo = ev.rows[0];
      } catch (e) {
        console.error('Failed to fetch event details for SSE enrichment', e);
      }

      // Enrich: compute matched skills names
      let matchedSkills = [];
      try {
        const eventSkillIds = eventInfo.event_skill_ids || [];
        const volSkillsRes = await pool.query(
          `SELECT skill_id FROM volunteer_skills WHERE volunteer_id = $1`,
          [volunteer_id]
        );
        const volSkillIds = (volSkillsRes.rows || []).map(r => r.skill_id);
        const matchedIds = (eventSkillIds || []).filter(id => volSkillIds.includes(id));
        if (matchedIds.length > 0) {
          const skillsRes = await pool.query(
            `SELECT skill_id, skill_name FROM skills WHERE skill_id = ANY($1::int[])`,
            [matchedIds]
          );
          matchedSkills = (skillsRes.rows || []).map(s => s.skill_name);
        }
      } catch (e) {
        console.error('Failed to compute matched skills for SSE enrichment', e);
      }

      // Enrich: volunteer full name
      let volunteer_full_name = null;
      try {
        const vpRes = await pool.query(
          `SELECT full_name FROM volunteerprofile WHERE user_id = $1`,
          [volunteer_id]
        );
        if (vpRes && vpRes.rows && vpRes.rows[0]) volunteer_full_name = vpRes.rows[0].full_name;
      } catch (e) {
        // ignore
      }

      const enriched = {
        ...newRow,
        ...eventInfo,
        matched_skills: matchedSkills,
        volunteer_full_name,
        event_skill_ids: eventInfo.event_skill_ids || []
      };

      broadcast(enriched);
    } catch (e) {
      console.error('SSE broadcast failed', e);
    }

    res.status(201).json(insertResult.rows[0]);
  } catch (err) {
    console.error("createVolunteerRecord error:", err);
    res.status(500).json({ error: "Failed to create volunteer record." });
  }
};


// ------------------------------------------------------
// UPDATE volunteer record
// ------------------------------------------------------
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


// ------------------------------------------------------
// DELETE record
// ------------------------------------------------------
exports.deleteVolunteerRecord = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `DELETE FROM volunteer_history 
       WHERE history_id = $1 
       RETURNING *`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Volunteer record not found." });
    }

    res.status(200).json(result.rows[0]);
  } catch (err) {
    console.error("deleteVolunteerRecord error:", err);
    res.status(500).json({ error: "Failed to delete volunteer record." });
  }
};
