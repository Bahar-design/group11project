// loginController.test.js
const request = require('supertest');
const express = require('express');
jest.mock('../db');

const pool = require('../db');
const { login } = require('../controllers/loginController');

const app = express();
app.use(express.json());
app.post('/api/login', login);

describe('Login API (mocked DB)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('logs in successfully with correct credentials', async () => {
    pool.query.mockResolvedValueOnce({
      rows: [{ user_id: 1, user_email: 'sarah.j@email.com', user_password: '1234', user_type: 'volunteer' }]
    });

    const res = await request(app)
      .post('/api/login')
      .send({ email: 'sarah.j@email.com', password: '1234' });

    expect(res.statusCode).toBe(200);
    expect(res.body.user.email).toBe('sarah.j@email.com');
    expect(res.body.user.type).toBe('volunteer');
  });

  it('fails when email not found', async () => {
    pool.query.mockResolvedValueOnce({ rows: [] });

    const res = await request(app)
      .post('/api/login')
      .send({ email: 'wrong@email.com', password: '1234' });

    expect(res.statusCode).toBe(401);
    expect(res.body.message).toBe('Invalid email or password');
  });

  it('fails when password is incorrect', async () => {
    pool.query.mockResolvedValueOnce({
      rows: [{ user_id: 1, user_email: 'test@email.com', user_password: 'correct', user_type: 'volunteer' }]
    });

    const res = await request(app)
      .post('/api/login')
      .send({ email: 'test@email.com', password: 'wrong' });

    expect(res.statusCode).toBe(401);
    expect(res.body.message).toBe('Invalid email or password');
  });

  it('handles database errors gracefully', async () => {
    pool.query.mockRejectedValueOnce(new Error('Database connection failed'));

    const res = await request(app)
      .post('/api/login')
      .send({ email: 'test@email.com', password: '1234' });

    expect(res.statusCode).toBe(500);
    expect(res.body.message).toBe('Server error');
  });

  it('returns 400 if email or password is missing', async () => {
    let res = await request(app).post('/api/login').send({ password: '1234' });
    expect(res.statusCode).toBe(400);
    expect(res.body.message).toMatch(/email/i);

    res = await request(app).post('/api/login').send({ email: 'test@email.com' });
    expect(res.statusCode).toBe(400);
    expect(res.body.message).toMatch(/password/i);
  });
});

