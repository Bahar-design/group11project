const request = require('supertest');
// Mock the DB pool used by the app so tests don't rely on runtime fixtures
jest.mock('../db', () => ({ query: jest.fn(), connect: jest.fn() }));
const pool = require('../db');
const app = require('../app');

describe('Event API (DB mocked)', () => {
  beforeEach(() => jest.clearAllMocks());

  it('GET /api/events returns all events', async () => {
    const eventRow = { event_id: 10, event_name: 'DB Event', description: 'd', location: 'L', urgency: 2, event_date: new Date('2025-12-01'), volunteers: 5, skill_id: [7], created_by: null };
    // SELECT * FROM eventdetails
    pool.query.mockResolvedValueOnce({ rows: [eventRow] })
      // skillNamesForIds
      .mockResolvedValueOnce({ rows: [{ skill_name: 'Sewing' }] })
      // volunteers select
      .mockResolvedValueOnce({ rows: [{ full_name: 'Vol A', user_email: 'a@v' }] });

    const res = await request(app).get('/api/events');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
    expect(res.body[0].requiredSkills).toContain('Sewing');
  });

  it('POST /api/events creates a new event', async () => {
    // ensureSkillIds -> select skill (none) then insert skill, then insert eventdetails, then delete/insert event_skills, then skillNamesForIds
    pool.query
      .mockResolvedValueOnce({ rows: [] }) // select skill by name -> none
      .mockResolvedValueOnce({ rows: [{ skill_id: 77 }] }) // insert skill returning id
      .mockResolvedValueOnce({ rows: [{ event_id: 21, event_name: 'Created', description: 'd', location: 'L', urgency: 1, event_date: new Date('2025-12-01'), volunteers: 0, skill_id: [77], created_by: null }] }) // insert eventdetails
      .mockResolvedValueOnce({ rows: [] }) // delete event_skills
      .mockResolvedValueOnce({ rows: [] }) // insert event_skills
      .mockResolvedValueOnce({ rows: [{ skill_name: 'NewSkill' }] }); // skillNamesForIds

    const payload = { name: 'Created', description: 'd', location: 'L', requiredSkills: ['NewSkill'], urgency: 'Low', date: '2025-12-01' };
    const res = await request(app).post('/api/events').send(payload);
    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('id');
    expect(res.body.requiredSkills).toContain('NewSkill');
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
    expect(res.body.error).toMatch(/Missing required fields|required/);
  });

  it('PUT /api/events/:id updates an event', async () => {
    const id = 20;
    pool.query
      .mockResolvedValueOnce({ rows: [{ event_id: id }] }) // exists
      .mockResolvedValueOnce({ rows: [] }) // select skill by name
      .mockResolvedValueOnce({ rows: [{ skill_id: 88 }] }) // insert skill
      .mockResolvedValueOnce({ rows: [{ event_id: id, event_name: 'Updated', description: 'd', location: 'L', urgency: 1, event_date: new Date('2025-12-01'), volunteers: 0, skill_id: [88], created_by: null }] }) // update returning
      .mockResolvedValueOnce({ rows: [] }) // delete event_skills
      .mockResolvedValueOnce({ rows: [{ skill_name: 'Added' }] }); // skillNamesForIds

    const payload = { name: 'Updated', description: 'd', location: 'L', requiredSkills: ['Added'], urgency: 'Low', date: '2025-12-01' };
    const res = await request(app).put(`/api/events/${id}`).send(payload);
    expect(res.statusCode).toBe(200);
    expect(res.body.name).toBe('Updated');
  });

  it('DELETE /api/events/:id deletes an event', async () => {
    pool.query.mockResolvedValueOnce({ rows: [] }) // delete event_skills
      .mockResolvedValueOnce({ rows: [{ event_id: 30, event_name: 'To Delete' }] }); // delete returning
    const res = await request(app).delete('/api/events/30');
    expect(res.statusCode).toBe(200);
    expect(res.body.name).toBe('To Delete');
  });

  it('GET /api/events/:id/volunteers returns volunteer list (may be empty)', async () => {
    const id = 50;
    // volunteers select returns empty
    pool.query.mockResolvedValueOnce({ rows: [] });
    const res = await request(app).get(`/api/events/${id}/volunteers`);
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });
});
