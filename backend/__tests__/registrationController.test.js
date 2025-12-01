// registrationController.test.js
const request = require('supertest');
const express = require('express');

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

  // ---------------------------
  // SUCCESS – VOLUNTEER
  // ---------------------------
  it('registers a new volunteer successfully', async () => {
    pool.query
      .mockResolvedValueOnce({ rows: [] })            // SELECT user_table
      .mockResolvedValueOnce({ rows: [{ user_id: 101 }] }) // INSERT user_table
      .mockResolvedValueOnce({});                          // INSERT volunteerprofile

    const res = await request(app)
      .post('/api/register')
      .send({ email: 'dave@example.com', password: 'xyz' });

    expect(res.statusCode).toBe(201);
    expect(res.body.user.type).toBe('volunteer');
  });

  // ---------------------------
  // SUCCESS – ADMIN
  // ---------------------------
  it('registers a new admin successfully when admin_id is provided', async () => {
    pool.query
      .mockResolvedValueOnce({ rows: [] })             // SELECT user_table
      .mockResolvedValueOnce({ rows: [{ user_id: 202 }] }) // INSERT user_table
      .mockResolvedValueOnce({});                           // INSERT adminprofile

    const res = await request(app)
      .post('/api/register')
      .send({ email: 'admin@example.com', password: 'admin123', admin_id: 77 });

    expect(res.statusCode).toBe(201);
    expect(res.body.user.type).toBe('admin');
  });

  // ---------------------------
  // FAILURE – MISSING FIELDS
  // ---------------------------
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

  // ---------------------------
  // FAILURE – USER ALREADY EXISTS
  // ---------------------------
  it('fails if user already exists', async () => {
    pool.query
      .mockResolvedValueOnce({ rows: [{ user_id: 1 }] }); // SELECT user_table finds existing

    const res = await request(app)
      .post('/api/register')
      .send({ email: 'amy@example.com', password: '1234' });

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe('User already exists');
  });

  // ---------------------------
  // ADMIN WITH MISSING admin_id SHOULD STILL REGISTER AS VOLUNTEER
  // ---------------------------
  it('admin_id missing → treated as volunteer', async () => {
    pool.query
      .mockResolvedValueOnce({ rows: [] })               // SELECT
      .mockResolvedValueOnce({ rows: [{ user_id: 303 }] }) // INSERT user_table
      .mockResolvedValueOnce({});                            // INSERT volunteerprofile

    const res = await request(app)
      .post('/api/register')
      .send({ email: 'badadmin@example.com', password: 'pw' });

    expect(res.statusCode).toBe(201);
    expect(res.body.user.type).toBe('volunteer');
  });

  // ---------------------------
  // FAILURE – admin_id UNIQUE VIOLATION
  // ---------------------------
  it('handles unique violation when admin_id already used', async () => {
    const uniqueErr = new Error('duplicate');
    uniqueErr.code = '23505';

    pool.query
      .mockResolvedValueOnce({ rows: [] })               // SELECT no existing user
      .mockResolvedValueOnce({ rows: [{ user_id: 404 }] }) // INSERT user_table
      .mockRejectedValueOnce(uniqueErr)                    // INSERT adminprofile fails
      .mockResolvedValueOnce({});                          // DELETE rollback

    const res = await request(app)
      .post('/api/register')
      .send({ email: 'admin2@example.com', password: 'pw', admin_id: 'exists' });

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe('admin_id already in use');
  });
});
