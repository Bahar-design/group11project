const request = require('supertest');
const app = require('../app');

describe('Calendar API', () => {
  it('GET /api/calendar returns all calendar events', async () => {
    const res = await request(app).get('/api/calendar');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThanOrEqual(0);
  });

  it('POST /api/calendar creates a new calendar event', async () => {
    const calendarEvent = {
      title: 'Community Meeting',
      description: 'Discuss upcoming events',
      date: '2025-10-20',
      location: 'Community Center',
      attendees: ['Alice', 'Bob']
    };

    const res = await request(app)
      .post('/api/calendar')
      .send(calendarEvent);

    expect(res.statusCode).toBe(201);
    expect(res.body.title).toBe('Community Meeting');
    expect(res.body.attendees).toContain('Alice');
  });

  it('POST /api/calendar fails on invalid data', async () => {
    const invalidEvent = {
      title: '',
      description: '',
      date: '',
      location: '',
      attendees: []
    };

    const res = await request(app)
      .post('/api/calendar')
      .send(invalidEvent);

    expect(res.statusCode).toBe(400);
    expect(res.body.error).toMatch(/required/i);
  });

  it('PUT /api/calendar/:id updates an event', async () => {
    // Create an event first
    const event = {
      title: 'Beach Cleanup',
      description: 'Volunteer cleanup event',
      date: '2025-10-25',
      location: 'Santa Monica Beach',
      attendees: ['John']
    };

    const createRes = await request(app)
      .post('/api/calendar')
      .send(event);

    const id = createRes.body.id;

    // Update the event
    const updated = { ...event, title: 'Beach Cleanup (Updated)' };

    const res = await request(app)
      .put(`/api/calendar/${id}`)
      .send(updated);

    expect(res.statusCode).toBe(200);
    expect(res.body.title).toBe('Beach Cleanup (Updated)');
  });

  it('DELETE /api/calendar/:id deletes an event', async () => {
    // Create an event to delete
    const event = {
      title: 'To Delete',
      description: 'Test deletion event',
      date: '2025-11-15',
      location: 'Library Hall',
      attendees: ['Eve']
    };

    const createRes = await request(app)
      .post('/api/calendar')
      .send(event);

    const id = createRes.body.id;

    // Delete it
    const res = await request(app).delete(`/api/calendar/${id}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.title).toBe('To Delete');
  });
});
