const pool = require("../db");

exports.sendEventDayReminders = async () => {
  try {
    // Get tomorrow's date (YYYY-MM-DD)
    const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000)
      .toISOString()
      .slice(0, 10);

    const result = await pool.query(
      `
      SELECT 
        vh.volunteer_id, 
        vp.full_name, 
        ut.user_email, 
        ed.event_name, 
        ed.location,
        ed.event_date
      FROM volunteer_history vh
      JOIN volunteerprofile vp ON vh.volunteer_id = vp.user_id
      JOIN user_table ut ON vp.user_id = ut.user_id
      JOIN eventdetails ed ON vh.event_id = ed.event_id
      WHERE DATE(ed.event_date) = $1
      `,
      [tomorrow]
    );

    for (const row of result.rows) {
      const { full_name, user_email, event_name, location, event_date } = row;

      await pool.query(
        `
        INSERT INTO notifications (message_from, message_to, message_text, message_sent)
        VALUES ($1, $2, $3, TRUE)
        `,
        [
          "Event Reminder",
          user_email,
          `Hello ${full_name},\nThis is a reminder for your event tomorrow:\n"${event_name}"\nLocation: ${location}\nDate: ${event_date.toISOString().slice(0,10)}`
        ]
      );
    }

    console.log("✔ Event reminders sent for events on:", tomorrow);

  } catch (err) {
    console.error("Error sending reminders:", err);
  }
};
