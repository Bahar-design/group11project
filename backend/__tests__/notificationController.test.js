// __tests__/notifications.test.js
const request = require('supertest');
const express = require('express');
const bodyParser = require('body-parser');
const { getUserNotifications, deleteNotification, addNotification } = require('../controllers/notificationController');

const app = express();
app.use(bodyParser.json());

// Mock routes
app.get('/api/notifications/:userId', getUserNotifications);
app.delete('/api/notifications/:id', deleteNotification);
app.post('/api/notifications', addNotification);

describe('Notification Controller API', () => {

  beforeEach(() => {
    // Reset the notifications array in the controller
    const controller = require('../controllers/notificationController');
    controller.notifications = [
      { id: 1, userId: 1, title: 'New Event Assignments', text: 'You are assigned to the Clothing Drive on Sep 19, 2025.' },
      { id: 2, userId: 1, title: 'Event Update', text: 'Event update: The Monday Madness donation event time has changed to 11:00 AM.' },
      { id: 3, userId: 1, title: 'Reminder', text: 'Reminder to submit your volunteer report by this Friday.' },
    ];
  });

  it('GET /api/notifications/:userId returns notifications for user', async () => {
    const res = await request(app).get('/api/notifications/1');
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveLength(3);
    expect(res.body[0]).toHaveProperty('title', 'New Event Assignments');
  });

  it('DELETE /api/notifications/:id deletes a notification', async () => {
    const res = await request(app).delete('/api/notifications/2');
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('message', 'Notification deleted');
    expect(res.body.notification).toHaveProperty('id', 2);

    // Confirm deletion
    const getRes = await request(app).get('/api/notifications/1');
    expect(getRes.body).toHaveLength(2);
    expect(getRes.body.find(n => n.id === 2)).toBeUndefined();
  });

  it('DELETE /api/notifications/:id returns 404 if notification not found', async () => {
    const res = await request(app).delete('/api/notifications/999');
    expect(res.statusCode).toBe(404);
    expect(res.body).toHaveProperty('message', 'Notification not found');
  });

  it('POST /api/notifications adds a new notification', async () => {
    const newNotification = { userId: 1, title: 'New Test', text: 'This is a test notification' };
    const res = await request(app).post('/api/notifications').send(newNotification);
    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('message', 'Notification added');
    expect(res.body.notification).toMatchObject(newNotification);

    // Confirm addition by checking existence instead of relying on ID/length
    const getRes = await request(app).get('/api/notifications/1');
    const added = getRes.body.find(n => n.title === 'New Test' && n.text === 'This is a test notification');
    expect(added).toBeDefined();
  });

  it('POST /api/notifications returns 400 if missing fields', async () => {
    const res = await request(app).post('/api/notifications').send({ userId: 1, title: 'Missing text' });
    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty('message', 'Missing fields');
  });
});
