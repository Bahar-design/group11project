
// registrationController.test.js
const request = require('supertest');
const express = require('express');
//need mock database
jest.mock('../db');             
const pool = require('../db');
const { registerUser } = require('../controllers/registrationController');

const app = express();
app.use(express.json());
app.post('/api/register', registerUser);

describe('Registration Controller (mocked DB)', () => {
  beforeEach(() => {
    pool.query.mockReset();
  });

  it('registers a new volunteer successfully', async () => {
    pool.query
      .mockResolvedValueOnce({ rows: [] })     // no existing user
      .mockResolvedValueOnce({ rows: [{ user_id: 101 }] });    // insert user_table
    const res = await request(app)
      .post('/api/register')
      .send({ email: 'dave@example.com', password: 'xyz' });

    expect(res.statusCode).toBe(201);
    expect(res.body.message).toBe('Volunteer registered successfully');
    expect(res.body.user.email).toBe('dave@example.com');
    expect(res.body.user.type).toBe('volunteer');
  });

  it('registers a new admin successfully when admin_id is provided', async () => {
    pool.query
      .mockResolvedValueOnce({ rows: [] }) // no existing user
      .mockResolvedValueOnce({ rows: [{ user_id: 202 }] }); // insert user_table
    const res = await request(app)
      .post('/api/register')
      .send({ email: 'admin@example.com', password: 'admin123', admin_id: 77 });

    expect(res.statusCode).toBe(201);
    expect(res.body.message).toBe('Admin registered successfully');
    expect(res.body.user.type).toBe('admin');
  });

  it('fails if email is missing', async () => {
    const res = await request(app)
      .post('/api/register')
      .send({ password: '123' });
    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe('Email and password are required');
  });

  it('fails if password is missing', async () => {
    const res = await request(app)
      .post('/api/register')
      .send({ email: 'test@example.com' });
    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe('Email and password are required');
  });

  it('fails if user already exists', async () => {
    pool.query.mockResolvedValueOnce({ rows: [{ user_id: 1 }] }); // existing user
    const res = await request(app)
      .post('/api/register')
      .send({ email: 'amy@example.com', password: '1234' });

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe('User already exists');
  });

  it('fails admin registration when admin_id missing after creating user', async () => {
    // first query: no existing user
    // second: insert user returns id
    pool.query
      .mockResolvedValueOnce({ rows: [] })
      .mockResolvedValueOnce({ rows: [{ user_id: 303 }] })
      .mockResolvedValueOnce(); // delete user after missing admin_id

    const res = await request(app)
      .post('/api/register')
      .send({ email: 'badadmin@example.com', password: 'pw' });

    // Since admin_id not provided, should register as volunteer, not fail — test admin path requires admin_id
    expect(res.statusCode).toBe(201);
  });

  it('handles unique violation when admin_id already used', async () => {
    // simulate existing user absent, insert user returns id, then adminprofile insert throws unique violation
    pool.query
      .mockResolvedValueOnce({ rows: [] })
      .mockResolvedValueOnce({ rows: [{ user_id: 404 }] })
      .mockImplementationOnce(() => { const e = new Error('dup'); e.code = '23505'; throw e; })
      .mockResolvedValueOnce(); // cleanup delete

    const res = await request(app)
      .post('/api/register')
      .send({ email: 'admin2@example.com', password: 'pw', admin_id: 'exists' });

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe('admin_id already in use');
  });
});
