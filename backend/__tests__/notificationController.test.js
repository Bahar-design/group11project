// tests/notificationController.test.js
const request = require('supertest');
const express = require('express');
const bodyParser = require('body-parser');

jest.mock('../db', () => ({
  query: jest.fn(),
}));

const pool = require('../db');
const notificationController = require('../controllers/notificationController');

const {
  getUserNotifications,
  deleteNotification,
  sendMessage,
  getAllNotifications,
  markMessageAsSent,
  getVolunteers,
  getAdmins,
  searchEmails
} = notificationController;

const app = express();
app.use(bodyParser.json());

// actual routes used in frontend
app.get('/api/notifications', getUserNotifications);
app.delete('/api/notifications/:id', deleteNotification);
app.post('/api/notifications/message', sendMessage);
app.get('/api/notifications/all', getAllNotifications);
app.patch('/api/notifications/sent/:id', markMessageAsSent);
app.get('/api/notifications/volunteers', getVolunteers);
app.get('/api/notifications/admins', getAdmins);
app.get('/api/notifications/emails', searchEmails);

describe('Notification Controller Tests (DB Mocked)', () => {
  beforeEach(() => jest.clearAllMocks());

  it('GET /api/notifications?email=... returns notifications', async () => {
    pool.query.mockResolvedValueOnce({
      rows: [{ message_ID: 1, message_text: 'Hello!' }],
    });

    const res = await request(app).get('/api/notifications?email=test@example.com');

    expect(res.statusCode).toBe(200);
  });

  it('POST /api/notifications/message sends a message', async () => {
    const mockNotification = { message_ID: 1, message_text: 'Hi' };
    pool.query.mockResolvedValueOnce({ rows: [mockNotification] });

    const res = await request(app)
      .post('/api/notifications/message')
      .send({ from: 'a@a.com', to: 'b@b.com', message: 'Hi' });

    expect(res.statusCode).toBe(201);
  });

  it('DELETE /api/notifications/:id deletes a notification', async () => {
    pool.query.mockResolvedValueOnce({ rows: [{ message_ID: 10 }] });

    const res = await request(app).delete('/api/notifications/10');
    expect(res.statusCode).toBe(200);
  });

  it('PATCH /api/notifications/sent/:id marks message as sent', async () => {
    pool.query.mockResolvedValueOnce({
      rowCount: 1,
      rows: [{ message_ID: 2, message_sent: true }],
    });

    const res = await request(app).patch('/api/notifications/sent/2');
    expect(res.statusCode).toBe(200);
  });

  it('GET /api/notifications/all fetches all notifications', async () => {
    pool.query.mockResolvedValueOnce({
      rows: [{ message_ID: 1 }, { message_ID: 2 }],
    });

    const res = await request(app).get('/api/notifications/all');
    expect(res.statusCode).toBe(200);
  });

  it('GET volunteers/admins endpoints work', async () => {
    pool.query.mockResolvedValueOnce({ rows: [{ user_id: 1, email: 'aaa' }] });
    let res = await request(app).get('/api/notifications/volunteers');
    expect(res.statusCode).toBe(200);

    pool.query.mockResolvedValueOnce({ rows: [{ user_id: 2, email: 'bbb' }] });
    res = await request(app).get('/api/notifications/admins');
    expect(res.statusCode).toBe(200);
  });

  it('GET /api/notifications returns 400 if email missing', async () => {
    const res = await request(app).get('/api/notifications');
    expect(res.statusCode).toBe(400);
  });
});
