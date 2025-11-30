const pool = require("../db");

exports.sendEventDayReminders = async (daysAhead = 1) => {
  try {
    // Use SQL date arithmetic so DB handles timezone differences
    const targetDateQuery = `CURRENT_DATE + $1::int`;
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
      WHERE DATE(ed.event_date) = (${targetDateQuery})::date
      `,
      [daysAhead]
    );

    console.log('Reminders: found', result.rows.length, 'rows for daysAhead=', daysAhead);

    let sentCount = 0;
    for (const row of result.rows) {
      const { full_name, user_email, event_name, location, event_date } = row;

      // normalize event_date to ISO-safe string
      let eventDateStr;
      if (event_date instanceof Date) {
        eventDateStr = event_date.toISOString().slice(0, 10);
      } else {
        // try parsing if DB returned a string
        const d = new Date(event_date);
        eventDateStr = isNaN(d) ? String(event_date) : d.toISOString().slice(0, 10);
      }

      await pool.query(
        `
        INSERT INTO notifications (message_from, message_to, message_text, message_sent)
        VALUES ($1, $2, $3, TRUE)
        `,
        [
          'Event Reminder',
          user_email,
          `Hello ${full_name},\nThis is a reminder for your event on ${eventDateStr}:\n"${event_name}"\nLocation: ${location}`
        ]
      );
      sentCount++;
    }

    console.log(`✔ Event reminders sent: ${sentCount} for target daysAhead=${daysAhead}`);
  } catch (err) {
    console.error('Error sending reminders:', err);
  }
};
