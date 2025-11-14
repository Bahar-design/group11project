const request = require('supertest');
const express = require('express');

// Use the real router but mock the DB pool module used by it
const mockDb = { query: jest.fn(), connect: jest.fn() };
jest.mock('../db', () => mockDb);

const eventRouter = require('../routes/eventRoutes');
const app = express();
app.use(express.json());
// inject a fake authenticated user so POST /api/events succeeds in tests
app.use((req, res, next) => { req.user = { user_id: 1, id: 1 }; next(); });
app.use('/api/events', eventRouter);

beforeEach(() => jest.clearAllMocks());

describe('eventRoutes basic flows', () => {
  it('GET /api/events returns seeded events from mock when pool has rows', async () => {
    // Explicitly return an empty list from DB - caller should receive an empty array
    mockDb.query.mockResolvedValueOnce({ rows: [] });
    const res = await request(app).get('/api/events');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBe(0);
  });

  it('POST /api/events with missing fields returns 400', async () => {
    const res = await request(app).post('/api/events').send({ name: 'x' });
    expect(res.status).toBe(400);
  });

  it('fallback POST creates in-memory event when DB fails', async () => {
  // cause DB insert to throw
  mockDb.query.mockRejectedValueOnce(new Error('DB down'));
  const payload = { name: 'F', description: 'd', location: '100 Main St, Houston, TX', requiredSkills: ['A'], urgency: 'Low', date: '2025-12-01' };
  const res = await request(app).post('/api/events').send(payload);
    // No in-memory fallback anymore — server should return 500 on DB insert failure
    expect(res.status).toBe(500);
    expect(res.body).toHaveProperty('error');
  });

  it('GET /api/events returns DB events when pool returns rows', async () => {
  const eventRow = { event_id: 10, event_name: 'DB Event', description: 'd', location: '321 Elm St, Cypress, TX', urgency: 2, event_date: new Date('2025-12-01'), volunteers: 5, skill_id: [7] };
    mockDb.query.mockResolvedValueOnce({ rows: [eventRow] }) // select * from eventdetails
      .mockResolvedValueOnce({ rows: [{ skill_name: 'Sewing' }] }) // skillNamesForIds
      .mockResolvedValueOnce({ rows: [{ full_name: 'Vol A', user_email: 'a@v' }] }); // volunteers select

    const res = await request(app).get('/api/events');
    expect(res.status).toBe(200);
    expect(res.body.length).toBeGreaterThan(0);
    expect(res.body[0].requiredSkills).toContain('Sewing');
    expect(res.body[0].volunteersList.length).toBeGreaterThan(0);
  });

  it('GET /api/events/:id returns 404 when not found', async () => {
    mockDb.query.mockResolvedValueOnce({ rows: [] });
    const res = await request(app).get('/api/events/9999');
    expect(res.status).toBe(404);
  });

  it('GET /api/events/:id returns event when found', async () => {
  const row = { event_id: 11, event_name: 'Single', description: 'd', location: '55 Katy Mills Blvd, Katy, TX', urgency: 1, event_date: new Date('2025-11-11'), volunteers: 0, skill_id: [9] };
    mockDb.query.mockResolvedValueOnce({ rows: [row] }) // select by id
      .mockResolvedValueOnce({ rows: [{ skill_name: 'Driving' }] }); // skillNamesForIds
    const res = await request(app).get('/api/events/11');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('id', 11);
    expect(res.body.requiredSkills).toContain('Driving');
  });

  it('POST /api/events with DB success returns 201', async () => {
    // sequence: ensureSkillIds -> select skill (none) then insert skill, then insert eventdetails, then delete/insert event_skills, then skillNamesForIds
    mockDb.query
      .mockResolvedValueOnce({ rows: [] }) // select skill by name -> none
      .mockResolvedValueOnce({ rows: [{ skill_id: 77 }] }) // insert skill returning id
      .mockResolvedValueOnce({ rows: [{ admin_id: 1 }] }) // adminprofile lookup for req.user
      .mockResolvedValueOnce({ rows: [{ event_id: 21, event_name: 'Created', description: 'd', location: '100 Main St, Houston, TX', urgency: 1, event_date: new Date('2025-12-01'), volunteers: 0, skill_id: [77] }] }) // insert eventdetails
      .mockResolvedValueOnce({ rows: [] }) // delete event_skills
      .mockResolvedValueOnce({ rows: [] }) // insert event_skills
      .mockResolvedValueOnce({ rows: [{ skill_name: 'NewSkill' }] }); // skillNamesForIds

  const payload = { name: 'Created', description: 'd', location: '1802 Market St, The Woodlands, TX', requiredSkills: ['NewSkill'], urgency: 'Low', date: '2025-12-01' };
    const res = await request(app).post('/api/events').send(payload);
    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('id');
  });

  it('PUT /api/events/:id updates successfully when DB available', async () => {
    mockDb.query
      .mockResolvedValueOnce({ rows: [{ event_id: 20 }] }) // exists
      .mockResolvedValueOnce({ rows: [] }) // select skill by name
      .mockResolvedValueOnce({ rows: [{ skill_id: 88 }] }) // insert skill
  .mockResolvedValueOnce({ rows: [{ event_id: 20, event_name: 'Updated', description: 'd', location: '7000 FM 1960, Tomball, TX', urgency: 1, event_date: new Date('2025-12-01'), volunteers: 0, skill_id: [88] }] }) // update returning
      .mockResolvedValueOnce({ rows: [] }) // delete event_skills
      .mockResolvedValueOnce({ rows: [{ skill_name: 'Added' }] }); // skillNamesForIds

  const payload = { name: 'Updated', description: 'd', location: '7000 FM 1960, Tomball, TX', requiredSkills: ['Added'], urgency: 'Low', date: '2025-12-01' };
    const res = await request(app).put('/api/events/20').send(payload);
    expect(res.status).toBe(200);
    expect(res.body.name).toBe('Updated');
  });

  it('DELETE /api/events/:id deletes successfully when DB available', async () => {
    mockDb.query.mockResolvedValueOnce({ rows: [] }) // delete event_skills
      .mockResolvedValueOnce({ rows: [{ event_id: 30, event_name: 'To Delete' }] }); // delete returning
    const res = await request(app).delete('/api/events/30');
    expect(res.status).toBe(200);
    expect(res.body.name).toBe('To Delete');
  });

  it('GET /api/events handles skillNamesForIds failure and still returns events', async () => {
  const eventRow = { event_id: 40, event_name: 'Bad Skills', description: 'd', location: '900 Galveston Ave, Galveston, TX', urgency: 2, event_date: new Date('2025-12-01'), time_slots: null, volunteers: 0, skill_id: [7] };
    mockDb.query.mockResolvedValueOnce({ rows: [eventRow] }) // select * from eventdetails
      .mockRejectedValueOnce(new Error('skills query failure')) // skillNamesForIds will reject
      .mockResolvedValueOnce({ rows: [] }); // volunteer select
    const res = await request(app).get('/api/events');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('GET /api/events returns 500 when DB fails', async () => {
    mockDb.query.mockRejectedValueOnce(new Error('DB down'));
    const res = await request(app).get('/api/events');
    expect(res.status).toBe(500);
    expect(res.body).toHaveProperty('error');
  });

  it('GET /api/events/:id/volunteers returns [] when DB errors', async () => {
    mockDb.query.mockRejectedValueOnce(new Error('DB error on volunteers'));
    const res = await request(app).get('/api/events/1/volunteers');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('PUT returns 500 when DB update fails', async () => {
    mockDb.query.mockRejectedValueOnce(new Error('DB down for update'));
    const res = await request(app).put('/api/events/1').send({ name: 'Fallback Updated' });
    expect(res.status).toBe(500);
    expect(res.body).toHaveProperty('error');
  });

  it('DELETE returns 500 when DB delete fails', async () => {
    mockDb.query.mockRejectedValueOnce(new Error('DB delete down'));
    const res = await request(app).delete('/api/events/2');
    expect(res.status).toBe(500);
    expect(res.body).toHaveProperty('error');
  });

  it('POST uses existing skill when SELECT finds it (no insert path)', async () => {
    // SELECT skill found -> no insert
    mockDb.query
      .mockResolvedValueOnce({ rows: [{ skill_id: 77 }] }) // select skill
      .mockResolvedValueOnce({ rows: [{ admin_id: 1 }] }) // adminprofile lookup for req.user
      .mockResolvedValueOnce({ rows: [{ event_id: 99, event_name: 'HaveSkill', description: 'd', location: '1500 Canal St, Houston, TX', urgency: 1, event_date: new Date('2025-12-01'), volunteers: 0, skill_id: [77] }] }) // insert eventdetails
      .mockResolvedValueOnce({ rows: [] }) // delete event_skills
      .mockResolvedValueOnce({ rows: [] }) // insert event_skills
      .mockResolvedValueOnce({ rows: [{ skill_name: 'ExistingSkill' }] }); // skillNamesForIds
  const payload = { name: 'HaveSkill', description: 'd', location: '1500 Canal St, Houston, TX', requiredSkills: ['ExistingSkill'], urgency: 'Low', date: '2025-12-01' };
    const res = await request(app).post('/api/events').send(payload);
    expect(res.status).toBe(201);
    expect(res.body.requiredSkills).toContain('ExistingSkill');
  });
});
