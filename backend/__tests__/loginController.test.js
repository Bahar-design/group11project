const request = require('supertest');
const express = require('express');
const { login } = require('../controllers/loginController');

const app = express();
app.use(express.json());

// Mock route for login
app.post('/api/login', login);

describe('Login API', () => {

  it('POST /api/login logs in successfully with correct credentials', async () => {
    const res = await request(app)
      .post('/api/login')
      .send({ email: 'sarah.j@email.com', password: '1234' });

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('user');
    expect(res.body.user.name).toBe('Sarah Johnson');
    expect(res.body.user.email).toBe('sarah.j@email.com');
  });

  it('POST /api/login fails with wrong email', async () => {
    const res = await request(app)
      .post('/api/login')
      .send({ email: 'wrong@email.com', password: '1234' });

    expect(res.statusCode).toBe(401);
    expect(res.body.message).toBe('Invalid email or password');
  });

  it('POST /api/login fails with wrong password', async () => {
    const res = await request(app)
      .post('/api/login')
      .send({ email: 'sarah.j@email.com', password: 'wrongpass' });

    expect(res.statusCode).toBe(401);
    expect(res.body.message).toBe('Invalid email or password');
  });

  it('POST /api/login fails if email or password is missing', async () => {
    // Missing password
    let res = await request(app)
      .post('/api/login')
      .send({ email: 'sarah.j@email.com' });

    expect(res.statusCode).toBe(401);
    expect(res.body.message).toBe('Invalid email or password');

    // Missing email
    res = await request(app)
      .post('/api/login')
      .send({ password: '1234' });

    expect(res.statusCode).toBe(401);
    expect(res.body.message).toBe('Invalid email or password');
  });
});
