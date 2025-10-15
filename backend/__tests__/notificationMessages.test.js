// __tests__/notificationMessages.test.js
const request = require('supertest');
const express = require('express');
const bodyParser = require('body-parser');
const notificationController = require('../controllers/notificationController');
const { users } = require('../controllers/loginController');

const app = express();
app.use(bodyParser.json());

// Mock routes
app.get('/api/notifications/volunteers', notificationController.getVolunteers);
app.post('/api/notifications/message', notificationController.sendMessage);
app.get('/api/notifications/messages/admin/:adminId', notificationController.getAdminInbox);

describe('Notification Messaging API', () => {
  beforeEach(() => {
    // Reset messages array (must match variable name in notificationController.js)
    if (notificationController.__getMessages) {
      notificationController.__getMessages().length = 0;
    } else if (notificationController.messages) {
      notificationController.messages.length = 0;
    }
  });

  it('GET /api/notifications/volunteers returns volunteers', async () => {
    const res = await request(app).get('/api/notifications/volunteers');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body[0]).toHaveProperty('email');
    // Should match the volunteer from loginController.js
    expect(res.body.find(v => v.email === users[0].email)).toBeDefined();
  });

  it('POST /api/notifications/message sends a message', async () => {
    const msg = {
      from: users[1].email, // admin
      to: [users[0].email], // volunteer
      message: 'Test message'
    };
    const res = await request(app).post('/api/notifications/message').send(msg);
    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('message', 'Message sent');
    expect(res.body.msg).toMatchObject({ from: msg.from, message: msg.message });
  });

  it('POST /api/notifications/message validates input', async () => {
    const bad = { from: '', to: [], message: '' };
    const res = await request(app).post('/api/notifications/message').send(bad);
    expect(res.statusCode).toBe(400);
    expect(res.body.message).toMatch(/Invalid|missing/);
  });

  it('GET /api/notifications/messages/admin/:adminId returns admin inbox', async () => {
    // Send a message to admin
    await request(app).post('/api/notifications/message').send({
      from: users[0].email, // volunteer
      to: [users[1].email], // admin
      message: 'Hello admin!'
    });
    const res = await request(app).get('/api/notifications/messages/admin/2');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body[0]).toHaveProperty('from', users[0].email);
  });

  it('GET /api/notifications/messages/admin/:adminId 404 for bad admin', async () => {
    const res = await request(app).get('/api/notifications/messages/admin/999');
    expect(res.statusCode).toBe(404);
    expect(res.body.message).toMatch(/Admin not found/);
  });
});
