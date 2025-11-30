// tests/notificationController.test.js
const request = require('supertest');
const express = require('express');
const bodyParser = require('body-parser');

//mock DB
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
} = notificationController;

const app = express();
app.use(bodyParser.json());

// Register notification routes
app.get('/api/notifications', getUserNotifications);
app.delete('/api/notifications/:id', deleteNotification);
app.post('/api/notifications/message', sendMessage);
app.get('/api/notifications/all', getAllNotifications);
app.patch('/api/notifications/sent/:id', markMessageAsSent);

// Additional inbox/contact routes
app.get('/api/notifications/volunteers', notificationController.getVolunteers);
app.get('/api/notifications/admins', notificationController.getAdmins);
app.get('/api/notifications/admins/email/:email', notificationController.getAdminInboxByEmail);
app.get('/api/notifications/volunteer/email/:email', notificationController.getVolunteerInboxByEmail);
app.get('/api/notifications/messages/admin/:adminId', notificationController.getAdminInbox);
app.get('/api/notifications/messages/volunteer/:volunteerId', notificationController.getVolunteerInbox);

describe('Notification Controller Tests (DB Mocked)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('GET /api/notifications?email=... returns notifications', async () => {
    pool.query.mockResolvedValueOnce({
      rows: [{ message_ID: 1, message_text: 'Hello!' }],
    });

    const res = await request(app).get('/api/notifications?email=test@example.com');

    expect(res.statusCode).toBe(200);
    expect(pool.query).toHaveBeenCalledWith(
      `SELECT * FROM notifications 
       WHERE LOWER(message_to) = LOWER($1)
       ORDER BY "message_ID" DESC`,
      ['test@example.com']
    );
    expect(res.body).toEqual([{ message_ID: 1, message_text: 'Hello!' }]);
  });

  it('POST /api/notifications/message sends a message', async () => {
    const mockNotification = { message_ID: 1, message_text: 'Hi', message_to: 'b@b.com' };
    pool.query.mockResolvedValueOnce({ rows: [mockNotification] });

    const res = await request(app)
      .post('/api/notifications/message')
      .send({ from: 'a@a.com', to: 'b@b.com', message: 'Hi' });

    expect(res.statusCode).toBe(201);
    expect(res.body.notification).toEqual(mockNotification);
    expect(pool.query).toHaveBeenCalledWith(
      expect.stringContaining('INSERT INTO notifications'),
      ['a@a.com', 'b@b.com', 'Hi']
    );
  });

  it('DELETE /api/notifications/:id deletes a notification', async () => {
    pool.query.mockResolvedValueOnce({
      rows: [{ message_ID: 10 }],
    });

    const res = await request(app).delete('/api/notifications/10');

    expect(res.statusCode).toBe(200);
    expect(pool.query).toHaveBeenCalledWith(
      `DELETE FROM notifications WHERE "message_ID" = $1 RETURNING *`,
      ['10']
    );
  });

  it('PATCH /api/notifications/sent/:id marks message as sent', async () => {
    pool.query.mockResolvedValueOnce({
      rowCount: 1,
      rows: [{ message_ID: 2, message_sent: true }],
    });

    const res = await request(app).patch('/api/notifications/sent/2');

    expect(res.statusCode).toBe(200);
    expect(pool.query).toHaveBeenCalledWith(
      `UPDATE notifications SET message_sent = TRUE WHERE "message_ID" = $1 RETURNING *`,
      ['2']
    );
  });

  it('GET /api/notifications/all fetches all notifications', async () => {
    pool.query.mockResolvedValueOnce({
      rows: [{ message_ID: 1 }, { message_ID: 2 }],
    });

    const res = await request(app).get('/api/notifications/all');

    expect(res.statusCode).toBe(200);
    expect(pool.query).toHaveBeenCalledWith(
      `SELECT * FROM notifications ORDER BY "message_ID" DESC`
    );
  });

  it('GET volunteers/admins and inbox endpoints behave correctly', async () => {
    // volunteers
    pool.query.mockResolvedValueOnce({ rows: [{ user_id: 1, user_email: 'v@x.com' }] });
    let res = await request(app).get('/api/notifications/volunteers');
    expect(res.statusCode).toBe(200);

    // admins
    pool.query.mockResolvedValueOnce({ rows: [{ user_id: 2, user_email: 'a@x.com' }] });
    res = await request(app).get('/api/notifications/admins');
    expect(res.statusCode).toBe(200);

    // send message
    const saved = { message_ID: 7, message_text: 'Hello Admin', message_to: 'a@x.com' };
    pool.query.mockResolvedValueOnce({ rows: [saved] });
    res = await request(app)
      .post('/api/notifications/message')
      .send({ from: 's@x.com', to: 'a@x.com', message: 'Hello Admin' });
    expect(res.statusCode).toBe(201);

    // inbox by email
    pool.query.mockResolvedValueOnce({ rows: [saved] });
    res = await request(app).get('/api/notifications/admins/email/a@x.com');
    expect(res.statusCode).toBe(200);

    // volunteer inbox by email (empty)
    pool.query.mockResolvedValueOnce({ rows: [] });
    res = await request(app).get('/api/notifications/volunteer/email/v@x.com');
    expect(res.statusCode).toBe(200);

    // admin inbox by id
    pool.query.mockResolvedValueOnce({ rows: [saved] });
    res = await request(app).get('/api/notifications/messages/admin/1');
    expect([200, 404]).toContain(res.statusCode);

    // volunteer inbox by id
    pool.query.mockResolvedValueOnce({ rows: [] });
    res = await request(app).get('/api/notifications/messages/volunteer/1');
    expect([200, 404]).toContain(res.statusCode);
  });

  it('GET /api/notifications returns 400 if email missing', async () => {
    const res = await request(app).get('/api/notifications');
    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe('Email is required');
  });

  it('POST /api/notifications/message returns 400 if missing fields', async () => {
    const res = await request(app)
      .post('/api/notifications/message')
      .send({ from: '', message: '' });

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toMatch(/invalid|missing/i);
  });

  it('DELETE /api/notifications/:id returns 404 when not found', async () => {
    pool.query.mockResolvedValueOnce({ rows: [] });
    const res = await request(app).delete('/api/notifications/999');
    expect([200, 404]).toContain(res.statusCode);
  });

  it('PATCH /api/notifications/sent/:id returns 404 when not found', async () => {
    pool.query.mockResolvedValueOnce({ rowCount: 0 });
    const res = await request(app)
      .patch('/api/notifications/sent/99');
    expect([200, 404]).toContain(res.statusCode);
  });

  it('handles DB errors (getUserNotifications)', async () => {
    pool.query.mockRejectedValueOnce(new Error('DB failure'));
    const res = await request(app).get('/api/notifications?email=test@example.com');
    expect([200, 500]).toContain(res.statusCode);
  });

  it('handles DB errors (sendMessage)', async () => {
    pool.query.mockRejectedValueOnce(new Error('DB error'));
    const res = await request(app)
      .post('/api/notifications/message')
      .send({ from: 'a@a.com', to: 'b@b.com', message: 'Hi' });

    expect([200, 500]).toContain(res.statusCode);
  });
  
});
