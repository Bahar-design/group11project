// GET /api/notifications/admins
/*
function getAdmins(req, res) {
  res.status(200).json(getAdminsList());
}
// backend/controllers/notificationController.js
let notifications = [
  { id: 1, userId: 1, title: 'New Event Assignments', text: 'You are assigned to the Clothing Drive on Sep 19, 2025.' },
  { id: 2, userId: 1, title: 'Event Update', text: 'Event update: The Monday Madness donation event time has changed to 11:00 AM.' },
  { id: 3, userId: 1, title: 'Reminder', text: 'Reminder to submit your volunteer report by this Friday.' },
];

// Get users from loginController.js
const { users } = require('./loginController');

function getVolunteersList() {
  return users
    .map((u, idx) => ({ id: idx + 1, name: u.name, email: u.email }))
    .filter(u => {
      const user = users.find(x => x.email === u.email);
      return user && user.type === 'volunteer';
    });
}

function getAdminsList() {
  return users
    .map((u, idx) => ({ id: idx + 1, name: u.name, email: u.email }))
    .filter(u => {
      const user = users.find(x => x.email === u.email);
      return user && user.type === 'admin';
    });
}

// In-memory messages (simulate DB)
let messages = [
  // { id, from, to: [email], message, timestamp }
];

// GET /api/notifications/volunteers
function getVolunteers(req, res) {
  res.status(200).json(getVolunteersList());
}

// POST /api/notifications/message
function sendMessage(req, res) {
  const { from, to, message } = req.body;

  if (!from || typeof from !== 'string' || !/^\S+@\S+\.\S+$/.test(from)) {
    return res.status(400).json({ message: 'Invalid or missing sender email.' });
  }
  if (!Array.isArray(to) || to.length === 0 || !to.every(e => typeof e === 'string' && /^\S+@\S+\.\S+$/.test(e))) {
    return res.status(400).json({ message: 'Invalid or missing recipient emails.' });
  }
  if (!message || typeof message !== 'string' || message.length < 1 || message.length > 1000) {
    return res.status(400).json({ message: 'Message must be 1-1000 characters.' });
  }

  const msg = {
    id: messages.length + 1,
    from,
    to,
    message,
    timestamp: new Date().toISOString()
  };
  messages.push(msg);
  res.status(201).json({ message: 'Message sent', msg });
}

// GET /api/notifications/messages/admin/:adminId
function getAdminInbox(req, res) {
  const adminId = parseInt(req.params.adminId);
  const admins = getAdminsList();
  const admin = admins.find(a => a.id === adminId);
  if (!admin) return res.status(404).json({ message: 'Admin not found' });
  const inbox = messages.filter(m => m.to.includes(admin.email));
  res.status(200).json(inbox);
}

// GET /api/notifications/messages/volunteer/:volunteerId
function getVolunteerInbox(req, res) {
  const volunteerId = parseInt(req.params.volunteerId);
  const volunteers = getVolunteersList();
  const volunteer = volunteers.find(v => v.id === volunteerId);
  if (!volunteer) return res.status(404).json({ message: 'Volunteer not found' });
  const inbox = messages.filter(m => m.to.includes(volunteer.email));
  res.status(200).json(inbox);
}

// User notifications
function getUserNotifications(req, res) {
  const userId = parseInt(req.params.userId);
  const userNotifications = notifications.filter(n => n.userId === userId);
  res.status(200).json(userNotifications);
}

function deleteNotification(req, res) {
  const { id } = req.params;
  const idx = notifications.findIndex(n => n.id === parseInt(id));
  if (idx === -1) return res.status(404).json({ message: 'Notification not found' });
  const deleted = notifications.splice(idx, 1);
  res.status(200).json({ message: 'Notification deleted', notification: deleted[0] });
}

function addNotification(req, res) {
  const { userId, title, text } = req.body;
  if (!userId || !title || !text) return res.status(400).json({ message: 'Missing fields' });
  const newNotification = { id: notifications.length + 1, userId, title, text };
  notifications.push(newNotification);
  res.status(201).json({ message: 'Notification added', notification: newNotification });
}

// GET /api/notifications/messages/admin/email/:email
function getAdminInboxByEmail(req, res) {
  const email = req.params.email;
  const admins = getAdminsList();
  const admin = admins.find(a => a.email === email);
  if (!admin) return res.status(404).json({ message: 'Admin not found' });
  const inbox = messages.filter(m => m.to.includes(admin.email));
  res.status(200).json(inbox);
}

// GET /api/notifications/messages/volunteer/email/:email
function getVolunteerInboxByEmail(req, res) {
  const email = req.params.email;
  const volunteers = getVolunteersList();
  const volunteer = volunteers.find(v => v.email === email);
  if (!volunteer) return res.status(404).json({ message: 'Volunteer not found' });
  const inbox = messages.filter(m => m.to.includes(volunteer.email));
  res.status(200).json(inbox);
}

module.exports = {
  getUserNotifications,
  deleteNotification,
  addNotification,
  getVolunteers,
  getAdmins,
  sendMessage,
  getAdminInbox,
  getVolunteerInbox,
  getAdminInboxByEmail,
  getVolunteerInboxByEmail
};
*/

// controllers/notificationController.js
const pool = require('../db');

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
    return res.status(400).json({ message: 'Missing required fields (from, to, message)' });
  }

  try {
    const result = await pool.query(
      `INSERT INTO notifications (message_from, message_to, message_text, message_sent)
       VALUES ($1, $2, $3, TRUE)
       RETURNING *`,
      [from, to, message]
    );

    res.status(201).json({ message: 'Message sent', notification: result.rows[0] });
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
    res.status(200).json(result.rows);
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
    res.status(200).json(result.rows);
  } catch (err) {
    console.error('Error fetching admins:', err);
    res.status(500).json({ message: 'Server error fetching admins' });
  }
}

module.exports = {
  getUserNotifications,
  sendMessage,
  deleteNotification,
  getAllNotifications,
  markMessageAsSent,
  getVolunteers,
  getAdmins
};


