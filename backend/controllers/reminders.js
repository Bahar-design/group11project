const pool = require("../db");

exports.sendEventDayReminders = async () => {
  try {
    const today = new Date().toISOString().slice(0, 10);

    const result = await pool.query(
      `
      SELECT vh.volunteer_id, vp.full_name, ut.user_email, 
             ed.event_name, ed.location
      FROM volunteer_history vh
      JOIN volunteerprofile vp ON vh.volunteer_id = vp.user_id
      JOIN user_table ut ON vp.user_id = ut.user_id
      JOIN eventdetails ed ON vh.event_id = ed.event_id
      WHERE ed.event_date = $1
      `,
      [today]
    );

    for (const row of result.rows) {
      const { full_name, user_email, event_name, location } = row;

      await pool.query(
        `
        INSERT INTO notifications (message_from, message_to, message_text, message_sent)
        VALUES ($1, $2, $3, TRUE)
        `,
        [
          "Event Reminder",
          user_email,
          `Hello ${full_name},\nThis is a reminder for your event today:\n"${event_name}"\nLocation: ${location}`
        ]
      );
    }

    console.log("✔ Event reminders sent for:", today);

  } catch (err) {
    console.error("Error sending reminders:", err);
  }
};


//In your backend folder, run:  npm install node-cron
