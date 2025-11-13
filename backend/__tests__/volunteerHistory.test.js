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
      volunteer_name: 'Jane Doe',
      event_name: 'Community Clean-up',
      hours_served: 5,
      skills_used: ['Teamwork', 'Organization'],
      date: '2025-09-10'
    };
    const res = await request(app)
      .post('/api/volunteer-history')
      .send(volunteerRecord);
  
    expect(res.statusCode).toBe(201);
    expect(res.body.id).toBeDefined(); // dynamic ID
    expect(res.body.volunteer_name).toBe('Jane Doe');
    expect(res.body.hours_served).toBe(5);
  });
  

  it('POST /api/volunteer-history fails on invalid data', async () => {
    const invalidRecord = {
      volunteer_id: '',
      event_id: '',
      hours_worked: '',
      notes: ''
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
      volunteer_id: 1,
      event_id: 1,
      hours_worked: 4,
      notes: 'Initial note.'
    };

    const createRes = await request(app)
      .post('/api/volunteer-history')
      .send(record);

    const id = createRes.body.history_id || createRes.body.id;

    // Update the record
    const updated = { hours_worked: 6, notes: 'Updated note.' };
    const res = await request(app)
      .put(`/api/volunteer-history/${id}`)
      .send(updated);

    expect(res.statusCode).toBe(200);
    expect(res.body.hours_worked).toBe(6);
    expect(res.body.notes).toBe('Updated note.');
  });

  it('DELETE /api/volunteer-history/:id deletes a record', async () => {
    // Create a record to delete
    const record = {
      volunteer_id: 1,
      event_id: 1,
      hours_worked: 3,
      notes: 'Temporary record to delete.'
    };

    const createRes = await request(app)
      .post('/api/volunteer-history')
      .send(record);

    const id = createRes.body.history_id || createRes.body.id;

    // Delete it
    const res = await request(app).delete(`/api/volunteer-history/${id}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.hours_worked).toBe(3);
  });
});
