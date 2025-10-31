// tests/notificationController.test.js
const request = require('supertest');
const express = require('express');
const bodyParser = require('body-parser');

//mock the database connection
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

//Register test routes
app.get('/api/notifications', getUserNotifications);
app.delete('/api/notifications/:id', deleteNotification);
app.post('/api/notifications/message', sendMessage);
app.get('/api/notifications/all', getAllNotifications);
app.patch('/api/notifications/sent/:id', markMessageAsSent);

describe('Notification Controller Tests (DB Mocked)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  //success scenarios
  it('GET /api/notifications?email=test@example.com → returns notifications', async () => {
    pool.query.mockResolvedValueOnce({
      rows: [{ message_ID: 1, message_text: 'Hello!' }],
    });

    const res = await request(app).get('/api/notifications?email=test@example.com');

    expect(res.statusCode).toBe(200);
    expect(pool.query).toHaveBeenCalledWith(
      'SELECT * FROM notifications WHERE message_to = $1 ORDER BY message_ID DESC',
      ['test@example.com']
    );
    expect(res.body).toEqual([{ message_ID: 1, message_text: 'Hello!' }]);
  });

  it('POST /api/notifications/message → sends a message', async () => {
    const mockNotification = { message_ID: 1, message_text: 'Hi', message_to: 'b@b.com' };
    pool.query.mockResolvedValueOnce({ rows: [mockNotification] });

    const res = await request(app)
      .post('/api/notifications/message')
      .send({ from: 'a@a.com', to: 'b@b.com', message: 'Hi' });

    expect(res.statusCode).toBe(201);
    expect(res.body.message).toBe('Message sent');
    expect(res.body.notification).toEqual(mockNotification);
    expect(pool.query).toHaveBeenCalledWith(
      expect.stringContaining('INSERT INTO notifications'),
      ['a@a.com', 'b@b.com', 'Hi']
    );
  });

  it('DELETE /api/notifications/:id → deletes a notification', async () => {
    pool.query.mockResolvedValueOnce({
      rows: [{ message_ID: 10, message_text: 'deleted' }],
    });

    const res = await request(app).delete('/api/notifications/10');

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe('Notification deleted');
    expect(res.body.notification.message_ID).toBe(10);
    expect(pool.query).toHaveBeenCalledWith(
      'DELETE FROM notifications WHERE message_ID = $1 RETURNING *',
      ['10']
    );
  });

  it('PATCH /api/notifications/sent/:id → marks as sent', async () => {
    pool.query.mockResolvedValueOnce({
      rowCount: 1,
      rows: [{ message_ID: 2, message_sent: true }],
    });

    const res = await request(app).patch('/api/notifications/sent/2');

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe('Notification marked as sent');
    expect(pool.query).toHaveBeenCalledWith(
      'UPDATE notifications SET message_sent = TRUE WHERE message_ID = $1 RETURNING *',
      ['2']
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
      'SELECT * FROM notifications ORDER BY message_ID DESC'
    );
  });

 
  it('GET /api/notifications → returns 400 if no email provided', async () => {
    const res = await request(app).get('/api/notifications');
    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe('Email is required');
  });

  it('POST /api/notifications/message → returns 400 if missing fields', async () => {
    const res = await request(app)
      .post('/api/notifications/message')
      .send({ from: '', message: '' });
    expect(res.statusCode).toBe(400);
    expect(res.body.message).toMatch(/Missing required fields/i);
  });

  it('DELETE /api/notifications/:id → returns 404 if notification not found', async () => {
    pool.query.mockResolvedValueOnce({ rows: [] });
    const res = await request(app).delete('/api/notifications/999');
    expect(res.statusCode).toBe(404);
    expect(res.body.message).toBe('Notification not found');
  });

  it('PATCH /api/notifications/sent/:id → returns 404 if message not found', async () => {
    pool.query.mockResolvedValueOnce({ rowCount: 0, rows: [] });
    const res = await request(app).patch('/api/notifications/sent/99');
    expect(res.statusCode).toBe(404);
    expect(res.body.message).toBe('Notification not found');
  });

  it('handles DB errors gracefully (getUserNotifications)', async () => {
    pool.query.mockRejectedValueOnce(new Error('DB failure'));
    const res = await request(app).get('/api/notifications?email=test@example.com');
    expect(res.statusCode).toBe(500);
    expect(res.body.message).toBe('Server error fetching notifications');
  });

  it('handles DB errors gracefully (sendMessage)', async () => {
    pool.query.mockRejectedValueOnce(new Error('DB error'));
    const res = await request(app)
      .post('/api/notifications/message')
      .send({ from: 'a@a.com', to: 'b@b.com', message: 'Hi' });
    expect(res.statusCode).toBe(500);
    expect(res.body.message).toBe('Server error sending message');
  });
});
