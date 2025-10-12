const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');

router.get('/:userId', notificationController.getUserNotifications);
router.delete('/:id', notificationController.deleteNotification);
router.post('/', notificationController.addNotification);

module.exports = router;
