const request = require('supertest');
const app = require('../app');

describe('Calendar API', () => {
  it('GET /api/calendar returns all events', async () => {
    const res = await request(app).get('/api/calendar');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('POST /api/calendar creates a new event', async () => {
    const event = {
      event_name: 'Community Meeting',
      description: 'Discuss upcoming events',
      event_date: '2025-10-20',
      location: 'Community Center',
      max_volunteers: 50
    };

    const res = await request(app)
      .post('/api/calendar')
      .send(event);

    expect(res.statusCode).toBe(201);
    expect(res.body.event_name).toBe('Community Meeting');
    expect(res.body.location).toBe('Community Center');
  });

  it('POST /api/calendar fails when missing required fields', async () => {
    const invalidEvent = {
      description: 'No name or date'
    };

    const res = await request(app)
      .post('/api/calendar')
      .send(invalidEvent);

    expect(res.statusCode).toBe(400);
    expect(res.body.error).toMatch(/required/i);
  });

  it('PUT /api/calendar/:id updates an event', async () => {
    // Create an event to update
    const event = {
      event_name: 'Beach Cleanup',
      description: 'Volunteer cleanup event',
      event_date: '2025-10-25',
      location: 'Santa Monica Beach',
      max_volunteers: 20
    };

    const createRes = await request(app)
      .post('/api/calendar')
      .send(event);

    const id = createRes.body.id;

    // Now update it
    const updatedData = { event_name: 'Beach Cleanup (Updated)' };

    const res = await request(app)
      .put(`/api/calendar/${id}`)
      .send(updatedData);

    expect(res.statusCode).toBe(200);
    expect(res.body.event_name).toBe('Beach Cleanup (Updated)');
  });

  it('DELETE /api/calendar/:id deletes an event', async () => {
    const event = {
      event_name: 'To Delete',
      description: 'Test deletion event',
      event_date: '2025-11-15',
      location: 'Library Hall',
      max_volunteers: 10
    };

    const createRes = await request(app)
      .post('/api/calendar')
      .send(event);

    const id = createRes.body.id;

    const res = await request(app).delete(`/api/calendar/${id}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.event_name).toBe('To Delete');
  });
});
