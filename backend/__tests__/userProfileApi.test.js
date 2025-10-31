const request = require('supertest');
const app = require('../app');
const pool = require('../db');

describe('User Profile API', () => {
  let testUserId;
  const testEmail = `test-user-${Date.now()}@example.test`;
  beforeAll(async () => {
    // create user row for tests
    const r = await pool.query('INSERT INTO user_table (user_email,user_password,user_type) VALUES ($1,$2,$3) RETURNING user_id', [testEmail, 'pw', 'volunteer']);
    testUserId = r.rows[0].user_id;
  });

  afterAll(async () => {
    if (testUserId) {
      await pool.query('DELETE FROM volunteer_skills WHERE volunteer_id IN (SELECT volunteer_id FROM volunteerprofile WHERE user_id = $1)', [testUserId]);
      await pool.query('DELETE FROM volunteerprofile WHERE user_id = $1', [testUserId]);
      await pool.query('DELETE FROM user_table WHERE user_id = $1', [testUserId]);
    }
  });

  it('GET /api/user-profile returns user profile', async () => {
    const res = await request(app).get(`/api/user-profile?type=volunteer&email=${encodeURIComponent(testEmail)}`);
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('name');
    expect(res.body).toHaveProperty('email');
  });

  it('POST /api/user-profile updates and returns user profile', async () => {
    const update = {
      name: 'Updated Name',
      email: 'updated@email.com',
      phone: '123-456-7890',
      address1: '456 New St',
      city: 'Katy',
      state: 'TX',
      zipCode: '77450',
      skills: ['Leadership'],
      availability: ['2025-10-20'],
      hasTransportation: false
    };
    const res = await request(app).post(`/api/user-profile?type=volunteer&email=${encodeURIComponent(testEmail)}`).send(update);
    expect(res.statusCode).toBe(200);
    expect(res.body.name).toBe('Updated Name');
    expect(res.body.skills).toContain('Leadership');
  });

  it('POST /api/user-profile fails on invalid data', async () => {
    const update = {
      name: '',
      email: 'bademail',
      phone: 'badphone',
      address1: '',
      city: '',
      state: 'ZZ',
      zipCode: 'abcde'
    };
    const res = await request(app).post('/api/user-profile').send(update);
    expect(res.statusCode).toBe(400);
    expect(res.body.error).toMatch(/required|Invalid|format|State|Zip/);
  });
});
