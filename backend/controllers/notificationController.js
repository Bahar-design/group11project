// backend/controllers/notificationController.js
let notifications = [
  { id: 1, userId: 1, title: 'New Event Assignments', text: 'You are assigned to the Clothing Drive on Sep 19, 2025.' },
  { id: 2, userId: 1, title: 'Event Update', text: 'Event update: The Monday Madness donation event time has changed to 11:00 AM.' },
  { id: 3, userId: 1, title: 'Reminder', text: 'Reminder to submit your volunteer report by this Friday.' },
];

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

module.exports = { getUserNotifications, deleteNotification, addNotification };
