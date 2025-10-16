const request = require('supertest');
const app = require('../app');

describe('Volunteer History API', () => {
  it('GET /api/volunteer-history returns all volunteer history records', async () => {
    const res = await request(app).get('/api/volunteer-history');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThanOrEqual(0);
  });

  it('POST /api/volunteer-history creates a new volunteer record', async () => {
    const volunteerRecord = {
      volunteerName: 'Jane Doe',
      eventName: 'Community Clean-up',
      hoursServed: 5,
      skillsUsed: ['Teamwork', 'Organization'],
      date: '2025-09-10'
    };
    const res = await request(app)
      .post('/api/volunteer-history')
      .send(volunteerRecord);
    expect(res.statusCode).toBe(201);
    expect(res.body.volunteerName).toBe('Jane Doe');
    expect(res.body.skillsUsed).toContain('Teamwork');
  });

  it('POST /api/volunteer-history fails on invalid data', async () => {
    const invalidRecord = {
      volunteerName: '',
      eventName: '',
      hoursServed: '',
      skillsUsed: [],
      date: ''
    };
    const res = await request(app)
      .post('/api/volunteer-history')
      .send(invalidRecord);
    expect(res.statusCode).toBe(400);
    expect(res.body.error).toMatch(/required/i);
  });

  it('PUT /api/volunteer-history/:id updates a record', async () => {
    // Create a record first
    const record = {
      volunteerName: 'John Doe',
      eventName: 'Beach Cleanup',
      hoursServed: 4,
      skillsUsed: ['Leadership'],
      date: '2025-10-01'
    };
    const createRes = await request(app)
      .post('/api/volunteer-history')
      .send(record);
    const id = createRes.body.id;

    // Update the record
    const updated = { ...record, hoursServed: 6 };
    const res = await request(app)
      .put(`/api/volunteer-history/${id}`)
      .send(updated);
    expect(res.statusCode).toBe(200);
    expect(res.body.hoursServed).toBe(6);
  });
 
  it('DELETE /api/volunteer-history/:id deletes a record', async () => {
    // Create a record to delete
    const record = {
      volunteerName: 'To Delete',
      eventName: 'Food Drive',
      hoursServed: 3,
      skillsUsed: ['Cooking'],
      date: '2025-11-20'
    };
    const createRes = await request(app)
      .post('/api/volunteer-history')
      .send(record);
    const id = createRes.body.id;

    // Delete it
    const res = await request(app).delete(`/api/volunteer-history/${id}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.volunteerName).toBe('To Delete');
  });
});
