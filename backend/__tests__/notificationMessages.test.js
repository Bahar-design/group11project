// __tests__/notificationMessages.test.js
const request = require('supertest');
const express = require('express');
const bodyParser = require('body-parser');

// Mock DB
jest.mock('../db', () => ({
  query: jest.fn(),
}));

const pool = require('../db');
const notificationController = require('../controllers/notificationController');

const {
  sendMessage,
  getVolunteers,
  getAdmins,
  getAllNotifications,
  markMessageAsSent,
} = notificationController;

const app = express();
app.use(bodyParser.json());

// Routes
app.post('/api/notifications/message', sendMessage);
app.get('/api/notifications/volunteers', getVolunteers);
app.get('/api/notifications/admins', getAdmins);
app.get('/api/notifications/all', getAllNotifications);
app.patch('/api/notifications/sent/:id', markMessageAsSent);

describe('Notification Messaging API (DB Mocked)', () => {
  beforeEach(() => jest.clearAllMocks());

  it('GET /api/notifications/volunteers → returns volunteer list', async () => {
    pool.query.mockResolvedValueOnce({
      rows: [
        { user_id: 1, email: 'volunteer@example.com' },
        { user_id: 2, email: 'test@example.com' },
      ],
    });

    const res = await request(app).get('/api/notifications/volunteers');

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(pool.query).toHaveBeenCalledWith(
      'SELECT user_id, user_email AS email FROM user_table WHERE user_type = $1',
      ['volunteer']
    );
  });

  it('GET /api/notifications/admins → returns admin list', async () => {
    pool.query.mockResolvedValueOnce({
      rows: [{ user_id: 1, email: 'admin@example.com' }],
    });

    const res = await request(app).get('/api/notifications/admins');

    expect(res.statusCode).toBe(200);
    expect(res.body[0]).toHaveProperty('email', 'admin@example.com');
    expect(pool.query).toHaveBeenCalledWith(
      'SELECT user_id, user_email AS email FROM user_table WHERE user_type = $1',
      ['admin']
    );
  });

  it('GET /api/notifications/volunteers → handles DB error', async () => {
    pool.query.mockRejectedValueOnce(new Error("DB explosion"));
    const res = await request(app).get('/api/notifications/volunteers');

    expect(res.statusCode).toBe(500);
    expect(res.body.message).toMatch(/server error/i);
  });

  it('GET /api/notifications/admins → handles DB error', async () => {
    pool.query.mockRejectedValueOnce(new Error("admins broken"));

    const res = await request(app).get('/api/notifications/admins');

    expect(res.statusCode).toBe(500);
    expect(res.body.message).toMatch(/server error/i);
  });

  it('POST /api/notifications/message → sends a message', async () => {
    const mockNotif = {
      message_ID: 1,
      message_from: 'a@a.com',
      message_to: 'b@b.com',
      message_text: 'Hi!',
    };

    pool.query.mockResolvedValueOnce({ rows: [mockNotif] });

    const res = await request(app)
      .post('/api/notifications/message')
      .send({ from: 'a@a.com', to: 'b@b.com', message: 'Hi!' });

    expect(res.statusCode).toBe(201);
    expect(res.body.notification).toEqual(mockNotif);
    expect(pool.query).toHaveBeenCalledWith(
      expect.stringContaining('INSERT INTO notifications'),
      ['a@a.com', 'b@b.com', 'Hi!']
    );
  });

  it('GET /api/notifications/all → fetches all notifications', async () => {
    pool.query.mockResolvedValueOnce({
      rows: [{ message_ID: 1 }, { message_ID: 2 }],
    });

    const res = await request(app).get('/api/notifications/all');

    expect(res.statusCode).toBe(200);
    expect(res.body.length).toBe(2);
    expect(pool.query).toHaveBeenCalledWith(
      'SELECT * FROM notifications ORDER BY "message_ID" DESC'
    );
  });

  it('PATCH /api/notifications/sent/:id → marks message as sent', async () => {
    pool.query.mockResolvedValueOnce({
      rowCount: 1,
      rows: [{ message_ID: 2, message_sent: true }],
    });

    const res = await request(app).patch('/api/notifications/sent/2');

    expect(res.statusCode).toBe(200);
    expect(res.body.notification.message_sent).toBe(true);
    expect(pool.query).toHaveBeenCalledWith(
      'UPDATE notifications SET message_sent = TRUE WHERE "message_ID" = $1 RETURNING *',
      ['2']
    );
  });
});
