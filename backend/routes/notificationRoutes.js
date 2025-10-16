const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');


// Notifications
router.get('/volunteers', notificationController.getVolunteers); // must be before parameterized routes
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
