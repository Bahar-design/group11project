const request = require('supertest');
const app = require('../app');

describe('User Profile API', () => {
  it('GET /api/user-profile returns user profile', async () => {
    const res = await request(app).get('/api/user-profile');
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
    const res = await request(app).post('/api/user-profile').send(update);
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
