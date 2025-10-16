const request = require('supertest');
const express = require('express');
const bodyParser = require('body-parser');
const notificationController = require('../controllers/notificationController');

const { 
  getUserNotifications, 
  deleteNotification, 
  addNotification 
} = notificationController;

const app = express();
app.use(bodyParser.json());

app.get('/api/notifications/:userId', getUserNotifications);
app.delete('/api/notifications/:id', deleteNotification);
app.post('/api/notifications', addNotification);

describe('Notification Controller Tests', () => {
  beforeEach(() => {
    jest.resetModules();
    const controller = require('../controllers/notificationController');
    controller.notifications = [
      { id: 1, userId: 1, title: 'New Event Assignments', text: 'You are assigned to the Clothing Drive on Sep 19, 2025.' },
      { id: 2, userId: 1, title: 'Event Update', text: 'Event update: The Monday Madness donation event time has changed to 11:00 AM.' },
      { id: 3, userId: 1, title: 'Reminder', text: 'Reminder to submit your volunteer report by this Friday.' },
      { id: 4, userId: 2, title: 'Event C', text: 'Details for Event C' }
    ];
  });

 
  it('GET /api/notifications/:userId should return notifications for user', async () => {
    const res = await request(app).get('/api/notifications/1');
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveLength(3);
    expect(res.body[0]).toHaveProperty('title', 'New Event Assignments');
  });


  it('GET /api/notifications/:userId should return empty array if user has no notifications', async () => {
    const res = await request(app).get('/api/notifications/999');
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual([]);
  });


  it('DELETE /api/notifications/:id should delete a notification', async () => {
    const res = await request(app).delete('/api/notifications/2');
    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe('Notification deleted');
    expect(res.body.notification).toHaveProperty('id', 2);

    const confirmRes = await request(app).get('/api/notifications/1');
    expect(confirmRes.body.find(n => n.id === 2)).toBeUndefined();
  });


  it('DELETE /api/notifications/:id should return 404 if notification not found', async () => {
    const res = await request(app).delete('/api/notifications/999');
    expect(res.statusCode).toBe(404);
    expect(res.body).toHaveProperty('message', 'Notification not found');
  });


  it('POST /api/notifications should add a new notification', async () => {
    const newNotif = { userId: 3, title: 'New Notice', text: 'Test Message' };
    const res = await request(app).post('/api/notifications').send(newNotif);
    expect(res.statusCode).toBe(201);
    expect(res.body.message).toBe('Notification added');
    expect(res.body.notification).toMatchObject(newNotif);

    const check = await request(app).get('/api/notifications/3');
    expect(check.body.find(n => n.title === 'New Notice')).toBeDefined();
  });


  it('POST /api/notifications should return 400 if missing fields', async () => {
    const res = await request(app).post('/api/notifications').send({ title: 'Missing userId/text' });
    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe('Missing fields');
  });


  it('DELETE /api/notifications/:id should return 404 when deleting same ID twice', async () => {
    await request(app).delete('/api/notifications/1'); 
    const res = await request(app).delete('/api/notifications/1'); 
    expect(res.statusCode).toBe(404);
    expect(res.body.message).toBe('Notification not found');
  });
});
