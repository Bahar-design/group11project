// loginController.test.js
const request = require('supertest');
const express = require('express');
jest.mock('../db');  //Mock the db connection

const pool = require('../db');
const { login } = require('../controllers/loginController');

const app = express();
app.use(express.json());
app.post('/api/login', login);

describe('Login API (mocked DB)', () => {
  beforeEach(() => {
    pool.query.mockReset();    // clear previous mocks
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
});
