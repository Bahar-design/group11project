/*
const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');


// Notifications
router.get('/volunteers', notificationController.getVolunteers); // must be before parameterized routes
router.get('/admins', notificationController.getAdmins);
router.get('/:userId', notificationController.getUserNotifications);
router.delete('/:id', notificationController.deleteNotification);
router.post('/', notificationController.addNotification);

// Messaging
router.post('/message', notificationController.sendMessage);
router.get('/messages/admin/:adminId', notificationController.getAdminInbox);
router.get('/messages/admin/email/:email', notificationController.getAdminInboxByEmail);
router.get('/messages/volunteer/:volunteerId', notificationController.getVolunteerInbox);
router.get('/messages/volunteer/email/:email', notificationController.getVolunteerInboxByEmail);

module.exports = router;
*/

const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');

//Destructure after importing
const {
  getUserNotifications,
  sendMessage,
  deleteNotification,
  getAllNotifications,
  markMessageAsSent,
  getVolunteers,
  getAdmins
} = notificationController;

// Get volunteers list
router.get('/volunteers', getVolunteers);
router.get('/admins', getAdmins);

// Get notifications for a user (?email=)
router.get('/', getUserNotifications);

// Admin can view all notifications
router.get('/all', getAllNotifications);

// Send a message
router.post('/message', sendMessage);

// Mark a message as sent (sets message_sent = true)
router.patch('/sent/:id', markMessageAsSent);

// Delete a specific notification
router.delete('/:id', deleteNotification);

module.exports = router;

