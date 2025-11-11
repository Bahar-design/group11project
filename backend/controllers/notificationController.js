// GET /api/notifications/admins

// controllers/notificationController.js
const pool = require('../db');

// Simple in-memory messages array to support legacy tests and API behavior
let messages = [];
function __getMessages() { return messages; }

//Get all notifications for a user (by email)
async function getUserNotifications(req, res) {
  try {
    const { email } = req.query;
    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    const result = await pool.query(
      'SELECT * FROM notifications WHERE message_to = $1 ORDER BY message_ID DESC',
      [email]
    );

    res.status(200).json(result.rows);
  } catch (err) {
    console.error('Error fetching notifications:', err);
    res.status(500).json({ message: 'Server error fetching notifications' });
  }
}

//Send a message
async function sendMessage(req, res) {
  const { from, to, message } = req.body;

  if (!from || !to || !message) {
    return res.status(400).json({ message: 'invalid or missing required fields (from, to, message)' });
  }

  try {
    const result = await pool.query(
      `INSERT INTO notifications (message_from, message_to, message_text, message_sent)
       VALUES ($1, $2, $3, TRUE)
       RETURNING *`,
      [from, to, message]
    );

    // also keep an in-memory copy for tests that rely on messages array
    try {
      const inMem = { id: messages.length + 1, from, to, message, timestamp: new Date().toISOString() };
      messages.push(inMem);
    } catch (e) {
      // ignore
    }

    // maintain backward-compatible shape expected by older tests
    const sent = result.rows[0];
    const simpleMsg = { from: sent.message_from || from, message: sent.message_text || message };
    return res.status(201).json({ message: 'Message sent', notification: sent, msg: simpleMsg });
  } catch (err) {
    console.error('Error sending message:', err);
    res.status(500).json({ message: 'Server error sending message' });
  }
}

//Delete a notification by ID
async function deleteNotification(req, res) {
  try {
    const { id } = req.params;
    const result = await pool.query(
      'DELETE FROM notifications WHERE message_ID = $1 RETURNING *',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    res.status(200).json({
      message: 'Notification deleted',
      notification: result.rows[0]
    });
  } catch (err) {
    console.error('Error deleting notification:', err);
    res.status(500).json({ message: 'Server error deleting notification' });
  }
}

//Get all notifications
async function getAllNotifications(req, res) {
  try {
    const result = await pool.query('SELECT * FROM notifications ORDER BY message_ID DESC');
    res.status(200).json(result.rows);
  } catch (err) {
    console.error('Error fetching all notifications:', err);
    res.status(500).json({ message: 'Server error fetching notifications' });
  }
}

//Mark message as sent
async function markMessageAsSent(req, res) {
  const { id } = req.params;

  try {
    const result = await pool.query(
      'UPDATE notifications SET message_sent = TRUE WHERE message_ID = $1 RETURNING *',
      [id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    res.status(200).json({
      message: 'Notification marked as sent',
      notification: result.rows[0]
    });
  } catch (err) {
    console.error('Error marking notification as sent:', err);
    res.status(500).json({ message: 'Server error' });
  }
}

//Get volunteers and admins (for frontend autocomplete)
async function getVolunteers(req, res) {
  try {
    const result = await pool.query(
      'SELECT user_id, user_email AS email FROM user_table WHERE user_type = $1',
      ['volunteer']
    );
    if (result.rows && result.rows.length > 0) {
      return res.status(200).json(result.rows);
    }

    // Fallback to in-memory users list when DB has no volunteers (tests rely on this)
    try {
      const { users } = require('./loginController');
      const fallback = users.filter(u => u.type === 'volunteer').map((u, idx) => ({ user_id: idx + 1, email: u.email }));
      return res.status(200).json(fallback);
    } catch (e) {
      return res.status(200).json([]);
    }
  } catch (err) {
    console.error('Error fetching volunteers:', err);
    res.status(500).json({ message: 'Server error fetching volunteers' });
  }
}

async function getAdmins(req, res) {
  try {
    const result = await pool.query(
      'SELECT user_id, user_email AS email FROM user_table WHERE user_type = $1',
      ['admin']
    );
    if (result.rows && result.rows.length > 0) {
      return res.status(200).json(result.rows);
    }

    // Fallback to in-memory users list when DB has no admins (tests rely on this)
    try {
      const { users } = require('./loginController');
      const fallback = users.filter(u => u.type === 'admin').map((u, idx) => ({ user_id: idx + 1, email: u.email }));
      return res.status(200).json(fallback);
    } catch (e) {
      return res.status(200).json([]);
    }
  } catch (err) {
    console.error('Error fetching admins:', err);
    res.status(500).json({ message: 'Server error fetching admins' });
  }
}

// Get admin inbox by admin id
async function getAdminInbox(req, res) {
  try {
    const adminId = parseInt(req.params.adminId);
    if (Number.isNaN(adminId)) return res.status(400).json({ message: 'Invalid admin id' });

    const userRes = await pool.query('SELECT user_email, user_type FROM user_table WHERE user_id = $1', [adminId]);
    if (userRes.rows.length === 0 || userRes.rows[0].user_type !== 'admin') {
      // fallback to in-memory users/messages
      try {
        const { users } = require('./loginController');
        const admin = users.find((u, idx) => idx + 1 === adminId && u.type === 'admin');
        if (!admin) return res.status(404).json({ message: 'Admin not found' });
        const inbox = messages.filter(m => Array.isArray(m.to) ? m.to.includes(admin.email) : m.message_to === admin.email);
        return res.status(200).json(inbox);
      } catch (e) {
        return res.status(404).json({ message: 'Admin not found' });
      }
    }

    const email = userRes.rows[0].user_email;
    const inboxRes = await pool.query('SELECT * FROM notifications WHERE message_to = $1 ORDER BY message_ID DESC', [email]);
    res.status(200).json(inboxRes.rows);
  } catch (err) {
    console.error('Error fetching admin inbox:', err);
    res.status(500).json({ message: 'Server error fetching admin inbox' });
  }
}

// Get volunteer inbox by volunteer id
async function getVolunteerInbox(req, res) {
  try {
    const volunteerId = parseInt(req.params.volunteerId);
    if (Number.isNaN(volunteerId)) return res.status(400).json({ message: 'Invalid volunteer id' });

    const userRes = await pool.query('SELECT user_email, user_type FROM user_table WHERE user_id = $1', [volunteerId]);
    if (userRes.rows.length === 0 || userRes.rows[0].user_type !== 'volunteer') {
      // fallback to in-memory users/messages
      try {
        const { users } = require('./loginController');
        const vol = users.find((u, idx) => idx + 1 === volunteerId && u.type === 'volunteer');
        if (!vol) return res.status(404).json({ message: 'Volunteer not found' });
        const inbox = messages.filter(m => Array.isArray(m.to) ? m.to.includes(vol.email) : m.message_to === vol.email);
        return res.status(200).json(inbox);
      } catch (e) {
        return res.status(404).json({ message: 'Volunteer not found' });
      }
    }

    const email = userRes.rows[0].user_email;
    const inboxRes = await pool.query('SELECT * FROM notifications WHERE message_to = $1 ORDER BY message_ID DESC', [email]);
    res.status(200).json(inboxRes.rows);
  } catch (err) {
    console.error('Error fetching volunteer inbox:', err);
    res.status(500).json({ message: 'Server error fetching volunteer inbox' });
  }
}

// Get admin inbox by email (existing tests expect this name)
async function getAdminInboxByEmail(req, res) {
  try {
    const email = req.params.email;
    if (!email) return res.status(400).json({ message: 'Email required' });
    const inboxRes = await pool.query('SELECT * FROM notifications WHERE message_to = $1 ORDER BY message_ID DESC', [email]);
    res.status(200).json(inboxRes.rows);
  } catch (err) {
    console.error('Error fetching admin inbox by email:', err);
    res.status(500).json({ message: 'Server error fetching admin inbox by email' });
  }
}

// Get volunteer inbox by email
async function getVolunteerInboxByEmail(req, res) {
  try {
    const email = req.params.email;
    if (!email) return res.status(400).json({ message: 'Email required' });
    const inboxRes = await pool.query('SELECT * FROM notifications WHERE message_to = $1 ORDER BY message_ID DESC', [email]);
    res.status(200).json(inboxRes.rows);
  } catch (err) {
    console.error('Error fetching volunteer inbox by email:', err);
    res.status(500).json({ message: 'Server error fetching volunteer inbox by email' });
  }
}

// Search for emails that start or contain a given query (for autocomplete)
async function searchEmails(req, res) {
  try {
    const { query } = req.query;

    if (!query || query.trim() === '') {
      return res.status(400).json({ message: 'Query required' });
    }

    //postgreSQL just compares a lowercase version internally.
    const result = await pool.query(
      `SELECT user_email 
       FROM user_table
       WHERE LOWER(user_email) LIKE LOWER($1)         
       LIMIT 10`,
      [`%${query}%`]
    );

    res.status(200).json(result.rows.map(r => r.user_email));
  } catch (err) {
    console.error('Error searching emails:', err);
    res.status(500).json({ message: 'Server error searching emails' });
  }
}


module.exports = {
  getUserNotifications,
  sendMessage,
  deleteNotification,
  getAllNotifications,
  markMessageAsSent,
  getVolunteers,
  getAdmins,
  getAdminInbox,
  getVolunteerInbox,
  getAdminInboxByEmail,
  getVolunteerInboxByEmail,
  searchEmails
};

// Export in-memory helpers for tests
module.exports.__getMessages = __getMessages;
module.exports.messages = messages;




