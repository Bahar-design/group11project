const request = require('supertest');
const app = require('../app');

describe('Event API', () => {
  it('GET /api/events returns all events', async () => {
    const res = await request(app).get('/api/events');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
  });

  it('POST /api/events creates a new event', async () => {
    const event = {
      name: 'Test Event',
      description: 'A test event',
      location: 'Houston',
      requiredSkills: ['Sewing'],
      urgency: 'High',
      date: '2025-12-01'
    };
    const res = await request(app).post('/api/events').send(event);
    expect(res.statusCode).toBe(201);
    expect(res.body.name).toBe('Test Event');
    expect(res.body.requiredSkills).toContain('Sewing');
  });

  it('POST /api/events fails on invalid data', async () => {
    const event = {
      name: '',
      description: '',
      location: '',
      requiredSkills: [],
      urgency: '',
      date: ''
    };
    const res = await request(app).post('/api/events').send(event);
    expect(res.statusCode).toBe(400);
    expect(res.body.error).toMatch(/required/);
  });

  it('PUT /api/events/:id updates an event', async () => {
    // First, create an event
    const event = {
      name: 'To Update',
      description: 'desc',
      location: 'loc',
      requiredSkills: ['Sewing'],
      urgency: 'Low',
      date: '2025-12-01'
    };
    const createRes = await request(app).post('/api/events').send(event);
    const id = createRes.body.id;
    const update = { ...event, name: 'Updated Event' };
    const res = await request(app).put(`/api/events/${id}`).send(update);
    expect(res.statusCode).toBe(200);
    expect(res.body.name).toBe('Updated Event');
  });

  it('DELETE /api/events/:id deletes an event', async () => {
    // First, create an event
    const event = {
      name: 'To Delete',
      description: 'desc',
      location: 'loc',
      requiredSkills: ['Sewing'],
      urgency: 'Low',
      date: '2025-12-01'
    };
    const createRes = await request(app).post('/api/events').send(event);
    const id = createRes.body.id;
    const res = await request(app).delete(`/api/events/${id}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.name).toBe('To Delete');
  });
});
