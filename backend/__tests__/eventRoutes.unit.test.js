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
  const eventRow = { event_id: 10, event_name: 'DB Event', description: 'd', location: '321 Elm St, Cypress, TX', urgency: 2, event_date: new Date('2025-12-01'), volunteer_count: 5, skill_id: [7] };
    mockDb.query.mockResolvedValueOnce({ rows: [eventRow] }) // select * from eventdetails (with aggregated volunteer_count)
      .mockResolvedValueOnce({ rows: [{ skill_name: 'Sewing' }] }); // skillNamesForIds

    const res = await request(app).get('/api/events');
    expect(res.status).toBe(200);
    expect(res.body.length).toBeGreaterThan(0);
    expect(res.body[0].requiredSkills).toContain('Sewing');
    // volunteers now come from the aggregated volunteer_count in the events response
    expect(res.body[0].volunteers).toBeGreaterThan(0);
  });

  it('POST accepts client-provided createdBy when no req.user', async () => {
    // Remove req.user by mounting a fresh app instance without the auth middleware for this test
    const expressApp = express();
    jest.resetModules();
    const mockDb2 = { query: jest.fn(), connect: jest.fn() };
    jest.mock('../db', () => mockDb2);
    const router2 = require('../routes/eventRoutes');
    expressApp.use(express.json());
    expressApp.use('/api/events', router2);

    // sequence: ensureSkillIds -> select skill none -> insert skill -> adminprofile lookup (none) -> create adminprofile insert -> insert eventdetails -> delete event_skills -> insert event_skills -> skillNamesForIds
    mockDb2.query
      .mockResolvedValueOnce({ rows: [] }) // select skill by name -> none
      .mockResolvedValueOnce({ rows: [{ skill_id: 123 }] }) // insert skill returning id
      .mockResolvedValueOnce({ rows: [] }) // adminprofile lookup returns none
      .mockResolvedValueOnce({ rows: [] }) // insert adminprofile
      .mockResolvedValueOnce({ rows: [{ event_id: 55, event_name: 'CreatedByClient', description: 'd', location: '100 Main St, Houston, TX', urgency: 1, event_date: new Date('2025-12-01'), volunteers: 0, skill_id: [123], created_by: 5 }] }) // insert eventdetails
      .mockResolvedValueOnce({ rows: [] }) // delete event_skills
      .mockResolvedValueOnce({ rows: [] }) // insert event_skills
      .mockResolvedValueOnce({ rows: [{ skill_name: 'ClientSkill' }] }); // skillNamesForIds

    const payload = { name: 'CreatedByClient', description: 'd', location: '1802 Market St, The Woodlands, TX', requiredSkills: ['ClientSkill'], urgency: 'Low', date: '2025-12-01', createdBy: 5 };
    const res = await request(expressApp).post('/api/events').send(payload);
    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('id');
    expect(res.body.requiredSkills).toContain('ClientSkill');
  });

  it('PUT returns 404 when event does not exist', async () => {
    mockDb.query.mockResolvedValueOnce({ rows: [] }); // SELECT exists -> none
    const res = await request(app).put('/api/events/9999').send({ name: 'X' });
    expect(res.status).toBe(404);
  });

  it('DELETE returns 404 when event not found', async () => {
    mockDb.query
      .mockResolvedValueOnce({ rows: [] }) // pre-select -> none
      .mockResolvedValueOnce({ rows: [] }) // delete event_skills (ignored) -> returns []
      .mockResolvedValueOnce({ rows: [] }); // delete returning -> none
    const res = await request(app).delete('/api/events/9999');
    expect(res.status).toBe(404);
  });

  it('GET /api/events/:id/volunteers returns 400 for invalid id', async () => {
    const res = await request(app).get('/api/events/not-a-number/volunteers');
    expect(res.status).toBe(400);
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
    mockDb.query
      .mockResolvedValueOnce({ rows: [{ event_name: 'To Delete' }] }) // pre-select event_name
      .mockResolvedValueOnce({ rows: [] }) // delete event_skills
      .mockResolvedValueOnce({ rows: [{ event_id: 30, event_name: 'To Delete' }] }); // delete returning
    const res = await request(app).delete('/api/events/30');
    expect(res.status).toBe(200);
    expect(res.body.name).toBe('To Delete');
  });

  it('GET /api/events handles skillNamesForIds failure and still returns events', async () => {
  const eventRow = { event_id: 40, event_name: 'Bad Skills', description: 'd', location: '900 Galveston Ave, Galveston, TX', urgency: 2, event_date: new Date('2025-12-01'), time_slots: null, volunteer_count: 0, skill_id: [7] };
    mockDb.query.mockResolvedValueOnce({ rows: [eventRow] }) // select * from eventdetails
      .mockRejectedValueOnce(new Error('skills query failure')) // skillNamesForIds will reject
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

  it('GET /api/events/:id/volunteers returns joined volunteer rows when DB returns data', async () => {
    // simulate volunteer_history join rows
    const rows = [
      { history_id: 5, signup_date: new Date('2025-11-01T10:00:00Z'), user_id: 42, user_email: 'v1@example.com', volunteer_profile_id: 100, full_name: 'Volunteer One', city: 'Houston' },
      { history_id: 6, signup_date: new Date('2025-11-02T12:00:00Z'), user_id: 43, user_email: 'v2@example.com', volunteer_profile_id: null, full_name: null, city: null },
    ];
    mockDb.query.mockResolvedValueOnce({ rows });
    const res = await request(app).get('/api/events/10/volunteers');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body[0]).toHaveProperty('history_id', 5);
    expect(res.body[0]).toHaveProperty('user_id', 42);
    expect(res.body[0]).toHaveProperty('volunteer_profile_id', 100);
    expect(res.body[0]).toHaveProperty('full_name', 'Volunteer One');
    expect(res.body[1]).toHaveProperty('full_name', 'v2@example.com'); // fallback to email
  });

  it('GET /api/events/:id/volunteers?countOnly=true returns count', async () => {
    mockDb.query.mockResolvedValueOnce({ rows: [{ count: 2 }] });
    const res = await request(app).get('/api/events/10/volunteers?countOnly=true');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('count', 2);
  });

  it('GET /api/events/counts/all returns counts for events', async () => {
    // simulate DB returning two rows
    mockDb.query.mockResolvedValueOnce({ rows: [{ event_id: 10, count: 2 }, { event_id: 11, count: 0 }] });
    const res = await request(app).get('/api/events/counts/all');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body[0]).toHaveProperty('event_id', 10);
    expect(res.body[0]).toHaveProperty('count', 2);
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

  it('POST creates adminprofile when none exists (resolveAdminId insert branch)', async () => {
    // Simulate adminprofile select none, insert succeeds, then event insert
    mockDb.query
      .mockResolvedValueOnce({ rows: [] }) // select skill by name -> none
      .mockResolvedValueOnce({ rows: [{ skill_id: 77 }] }) // insert skill returning id
      .mockResolvedValueOnce({ rows: [] }) // adminprofile lookup for req.user -> none
      .mockResolvedValueOnce({ rows: [] }) // insert adminprofile success
      .mockResolvedValueOnce({ rows: [{ event_id: 200, event_name: 'AdminCreated', description: 'd', location: '1500 Canal St', urgency: 1, event_date: new Date('2025-12-01'), volunteers: 0, skill_id: [77] }] }) // insert eventdetails
      .mockResolvedValueOnce({ rows: [] }) // delete event_skills
      .mockResolvedValueOnce({ rows: [] }) // insert event_skills
      .mockResolvedValueOnce({ rows: [{ skill_name: 'NewSkill' }] }); // skillNamesForIds

    const payload = { name: 'AdminCreated', description: 'd', location: '1500 Canal St, Houston, TX', requiredSkills: ['NewSkill'], urgency: 'Low', date: '2025-12-01' };
    const res = await request(app).post('/api/events').send(payload);
    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('id');
  });

  it('GET /api/events handles skillNamesForIds rejection gracefully', async () => {
    const eventRow = { event_id: 300, event_name: 'BadSkills2', description: 'd', location: '900 Galveston Ave, Galveston, TX', urgency: 2, event_date: new Date('2025-12-01'), time_slots: null, volunteer_count: 0, skill_id: [7] };
    mockDb.query.mockResolvedValueOnce({ rows: [eventRow] }) // select * from eventdetails
      .mockRejectedValueOnce(new Error('skills query failure again'));
    const res = await request(app).get('/api/events');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('DELETE returns name from prior SELECT when delete returns row without name', async () => {
    // Simulate SELECT before delete returning name, and DELETE returning a row missing event_name
    mockDb.query.mockResolvedValueOnce({ rows: [{ event_name: 'PreSelectName' }] }); // select pre-delete
    mockDb.query.mockResolvedValueOnce({ rows: [] }); // delete event_skills
    mockDb.query.mockResolvedValueOnce({ rows: [{ event_id: 400 }] }); // delete returning with no event_name
    const res = await request(app).delete('/api/events/400');
    expect(res.status).toBe(200);
    expect(res.body.name).toBe('PreSelectName');
  });

  it('GET /api/events/skills returns skill list', async () => {
    mockDb.query.mockResolvedValueOnce({ rows: [{ skill_id: 1, skill_name: 'First' }, { skill_id: 2, skill_name: 'Second' }] });
    const res = await request(app).get('/api/events/skills');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body[0]).toHaveProperty('label', 'First');
  });

  it('GET /api/events/skills returns 500 when DB fails', async () => {
    mockDb.query.mockRejectedValueOnce(new Error('skills down'));
    const res = await request(app).get('/api/events/skills');
    expect(res.status).toBe(500);
    expect(res.body).toHaveProperty('error');
  });

  it('GET /api/events resolves creator by user_id when admin_id not found', async () => {
    const ev = { event_id: 501, event_name: 'UserCreator', description: 'd', location: 'X', urgency: 1, event_date: new Date('2025-12-01'), volunteer_count: 0, volunteers_list: [], skill_id: [11], created_by: 77 };
    mockDb.query
      .mockResolvedValueOnce({ rows: [ev] }) // select events
      .mockResolvedValueOnce({ rows: [{ skill_name: 'Helping' }] }) // skillNamesForIds
      .mockResolvedValueOnce({ rows: [] }) // resolveAdminId: admin_id select -> none
      .mockResolvedValueOnce({ rows: [{ admin_id: 77 }] }) // resolveAdminId: user_id select -> found
      .mockResolvedValueOnce({ rows: [{ full_name: 'User Admin' }] }); // select full_name

    const res = await request(app).get('/api/events');
    expect(res.status).toBe(200);
    expect(res.body[0]).toHaveProperty('createdByName', 'User Admin');
  });

  it('GET /api/events handles resolveAdminId throwing and continues', async () => {
    const ev = { event_id: 502, event_name: 'ResolveError', description: 'd', location: 'X', urgency: 1, event_date: new Date('2025-12-01'), volunteer_count: 0, volunteers_list: [], skill_id: [12], created_by: 99 };
    // sequence: select events -> skillNamesForIds -> resolveAdminId first select throws
    mockDb.query
      .mockResolvedValueOnce({ rows: [ev] })
      .mockResolvedValueOnce({ rows: [{ skill_name: 'Helping' }] })
      .mockRejectedValueOnce(new Error('admin select failed'));

    const res = await request(app).get('/api/events');
    expect(res.status).toBe(200);
    expect(res.body[0]).toHaveProperty('createdBy', 99);
    // createdByName is included but will be null when resolveAdminId fails
    expect(res.body[0]).toHaveProperty('createdByName', null);
  });

  it('POST returns 400 when adminprofile cannot be resolved', async () => {
    // ensureSkillIds selects then inserts
    mockDb.query
      .mockResolvedValueOnce({ rows: [] }) // select skill -> none
      .mockResolvedValueOnce({ rows: [{ skill_id: 77 }] }) // insert skill
      .mockResolvedValueOnce({ rows: [] }) // adminprofile lookup for req.user -> none
      .mockRejectedValueOnce(new Error('insert admin failed')) // insert adminprofile -> throws
      .mockResolvedValueOnce({ rows: [] }); // lookup by admin_id -> none

    const payload = { name: 'Created', description: 'd', location: '1802 Market St, The Woodlands, TX', requiredSkills: ['NewSkill'], urgency: 'Low', date: '2025-12-01' };
    const res = await request(app).post('/api/events').send(payload);
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error');
  });

  it('GET /api/events/:id/volunteers?countOnly=true returns 0 when count query fails', async () => {
    mockDb.query.mockRejectedValueOnce(new Error('count query failed'));
    const res = await request(app).get('/api/events/20/volunteers?countOnly=true');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('count', 0);
  });

  it('GET /api/events/:id returns createdByName when resolveAdminId finds admin', async () => {
    // Build a fresh app to control mock ordering
    const expressApp = express();
    jest.resetModules();
    const mockDb2 = { query: jest.fn(), connect: jest.fn() };
    jest.mock('../db', () => mockDb2);
    const router2 = require('../routes/eventRoutes');
    expressApp.use(express.json());
    expressApp.use('/api/events', router2);

    // sequence: select by id -> skillNamesForIds -> resolveAdminId admin_id select -> select full_name
    mockDb2.query
      .mockResolvedValueOnce({ rows: [{ event_id: 600, event_name: 'SingleWithCreator', description: 'd', location: 'X', urgency: 1, event_date: new Date('2025-12-01'), volunteers: 0, skill_id: [15], created_by: 77 }] })
      .mockResolvedValueOnce({ rows: [{ skill_name: 'Skill15' }] })
      .mockResolvedValueOnce({ rows: [{ admin_id: 77 }] })
      .mockResolvedValueOnce({ rows: [{ full_name: 'Found Admin' }] });

    const res = await request(expressApp).get('/api/events/600');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('createdByName', 'Found Admin');
  });

  it('GET /api/events creates adminprofile when resolveAdminId insert fallback succeeds and returns createdByName', async () => {
    const ev = { event_id: 601, event_name: 'InsertFallback', description: 'd', location: 'X', urgency: 1, event_date: new Date('2025-12-01'), volunteer_count: 0, volunteers_list: [], skill_id: [16], created_by: 88 };
    mockDb.query
      .mockResolvedValueOnce({ rows: [ev] }) // select events
      .mockResolvedValueOnce({ rows: [{ skill_name: 'Skill16' }] }) // skillNamesForIds
      .mockResolvedValueOnce({ rows: [] }) // resolveAdminId admin_id select -> none
      .mockResolvedValueOnce({ rows: [] }) // resolveAdminId user_id select -> none
      .mockResolvedValueOnce({ rows: [] }) // resolveAdminId insert -> success (no rows)
      .mockResolvedValueOnce({ rows: [{ full_name: 'Inserted Admin' }] }); // select full_name after insertion

    const res = await request(app).get('/api/events');
    expect(res.status).toBe(200);
    // should include createdByName from the post-insert lookup
    const found = res.body.find(e => e.id === 601);
    expect(found).toBeDefined();
    expect(found).toHaveProperty('createdByName', 'Inserted Admin');
  });

  it('POST returns 400 when INSERT fails with created_by foreign key violation', async () => {
    // ensureSkillIds selects then inserts
    mockDb.query
      .mockResolvedValueOnce({ rows: [] }) // select skill -> none
      .mockResolvedValueOnce({ rows: [{ skill_id: 77 }] }) // insert skill
      .mockResolvedValueOnce({ rows: [{ admin_id: 1 }] }) // adminprofile lookup for req.user
      .mockRejectedValueOnce({ code: '23503', constraint: 'fk_created_by', message: 'foreign key' }); // insert eventdetails fails

    const payload = { name: 'CreatedFK', description: 'd', location: '1802 Market St, The Woodlands, TX', requiredSkills: ['NewSkill'], urgency: 'Low', date: '2025-12-01' };
    const res = await request(app).post('/api/events').send(payload);
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error');
  });

  it('GET /api/events handles resolveAdminId insert failing then lookup succeeding', async () => {
    const ev = { event_id: 700, event_name: 'InsertThenLookup', description: 'd', location: 'X', urgency: 1, event_date: new Date('2025-12-01'), volunteer_count: 0, volunteers_list: [], skill_id: [20], created_by: 123 };
    // select events -> skillNamesForIds -> resolveAdminId admin_id select none -> user_id select none -> insert admin throws -> lookup returns admin -> select full_name
    mockDb.query
      .mockResolvedValueOnce({ rows: [ev] })
      .mockResolvedValueOnce({ rows: [{ skill_name: 'Skill20' }] })
      .mockResolvedValueOnce({ rows: [] }) // admin_id select none
      .mockResolvedValueOnce({ rows: [] }) // user_id select none
      .mockRejectedValueOnce(new Error('insert admin failed')) // insert throws
      .mockResolvedValueOnce({ rows: [{ admin_id: 123 }] }) // lookup by admin_id after insert failure
      .mockResolvedValueOnce({ rows: [{ full_name: 'Lookup Admin' }] }); // select full_name

    const res = await request(app).get('/api/events');
    expect(res.status).toBe(200);
    const found = res.body.find(e => e.id === 700);
    expect(found).toBeDefined();
    expect(found).toHaveProperty('createdByName', 'Lookup Admin');
  });

  it('GET /api/events/:id returns createdByName null when resolveAdminId returns null', async () => {
    // select by id -> skillNamesForIds -> resolveAdminId admin_id select none -> user_id select none -> insert admin fails and lookup none
    mockDb.query
      .mockResolvedValueOnce({ rows: [{ event_id: 800, event_name: 'NoCreatorName', description: 'd', location: 'X', urgency: 1, event_date: new Date('2025-12-01'), volunteers: 0, skill_id: [21], created_by: 999 }] })
      .mockResolvedValueOnce({ rows: [{ skill_name: 'Skill21' }] })
      .mockResolvedValueOnce({ rows: [] })
      .mockResolvedValueOnce({ rows: [] })
      .mockRejectedValueOnce(new Error('insert admin failed'))
      .mockResolvedValueOnce({ rows: [] });

    const res = await request(app).get('/api/events/800');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('createdBy', 999);
    expect(res.body).toHaveProperty('createdByName', null);
  });

  it('GET /api/events/:id returns 500 when DB errors', async () => {
    mockDb.query.mockRejectedValueOnce(new Error('db fail on single'));
    const res = await request(app).get('/api/events/12345');
    expect(res.status).toBe(500);
    expect(res.body).toHaveProperty('error');
  });

  it('PUT /api/events/:id returns 400 for invalid payload (validation failure)', async () => {
    // simulate exists
    mockDb.query
      .mockResolvedValueOnce({ rows: [{ event_id: 900 }] }); // exists check
    const res = await request(app).put('/api/events/900').send({ name: '', description: '', location: '', requiredSkills: [], urgency: 'Low', date: 'not-a-date' });
    expect(res.status).toBe(400);
  });

  it('POST returns 201 with id 0 when INSERT returns no rows', async () => {
    // ensureSkillIds selects then inserts; adminprofile lookup returns admin; insert eventdetails returns no rows
    mockDb.query
      .mockResolvedValueOnce({ rows: [] }) // select skill -> none
      .mockResolvedValueOnce({ rows: [{ skill_id: 777 }] }) // insert skill
      .mockResolvedValueOnce({ rows: [{ admin_id: 1 }] }) // adminprofile lookup for req.user
      .mockResolvedValueOnce({ rows: [] }) // insert eventdetails returns empty rows
      .mockResolvedValueOnce({ rows: [] }) // delete event_skills
      .mockResolvedValueOnce({ rows: [] }) // insert event_skills
      .mockResolvedValueOnce({ rows: [{ skill_name: 'GhostSkill' }] }); // skillNamesForIds

    const payload = { name: 'GhostInsert', description: 'd', location: '1802 Market St, The Woodlands, TX', requiredSkills: ['GhostSkill'], urgency: 'Low', date: '2025-12-01' };
    const res = await request(app).post('/api/events').send(payload);
    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('id', 0);
  });

  it('POST returns 500 when adminprofile lookup throws', async () => {
    // ensureSkillIds selects then inserts
    mockDb.query
      .mockResolvedValueOnce({ rows: [] }) // select skill -> none
      .mockResolvedValueOnce({ rows: [{ skill_id: 77 }] }) // insert skill
      .mockRejectedValueOnce(new Error('admin lookup failure')); // adminprofile lookup throws

    const payload = { name: 'Created', description: 'd', location: '1802 Market St, The Woodlands, TX', requiredSkills: ['NewSkill'], urgency: 'Low', date: '2025-12-01' };
    const res = await request(app).post('/api/events').send(payload);
    expect(res.status).toBe(500);
    expect(res.body).toHaveProperty('error');
  });

  it('POST without req.user and without createdBy returns 401', async () => {
    // mount an app without the auth middleware
    const expressApp = express();
    jest.resetModules();
    const mockDb2 = { query: jest.fn(), connect: jest.fn() };
    jest.mock('../db', () => mockDb2);
    const router2 = require('../routes/eventRoutes');
    expressApp.use(express.json());
    expressApp.use('/api/events', router2);

    const payload = { name: 'NoAuth', description: 'd', location: '100 Main St, Houston, TX', requiredSkills: ['A'], urgency: 'Low', date: '2025-12-01' };
    // ensureSkillIds will call SELECT for skill existence first and then INSERT when not found; mock both calls
    mockDb2.query
      .mockResolvedValueOnce({ rows: [] })
      .mockResolvedValueOnce({ rows: [{ skill_id: 555 }] });
    const res = await request(expressApp).post('/api/events').send(payload);
    expect(res.status).toBe(401);
  });

  it('GET /api/events returns createdByName and volunteersList when present', async () => {
    const ev = { event_id: 500, event_name: 'WithCreator', description: 'd', location: 'X', urgency: 1, event_date: new Date('2025-12-01'), volunteer_count: 2, volunteers_list: ['Alice'], skill_id: [10], created_by: 77 };
    // sequence: select events -> skillNamesForIds -> resolveAdminId select adminprofile by admin_id -> select full_name
    mockDb.query
      .mockResolvedValueOnce({ rows: [ev] })
      .mockResolvedValueOnce({ rows: [{ skill_name: 'Helping' }] })
      .mockResolvedValueOnce({ rows: [{ admin_id: 77 }] })
      .mockResolvedValueOnce({ rows: [{ full_name: 'Admin Person' }] });

    const res = await request(app).get('/api/events');
    expect(res.status).toBe(200);
    expect(res.body.length).toBeGreaterThan(0);
    expect(res.body[0]).toHaveProperty('createdByName', 'Admin Person');
    expect(res.body[0]).toHaveProperty('volunteersList');
  });

  it('GET /api/events/counts/all returns 500 when DB fails', async () => {
    mockDb.query.mockRejectedValueOnce(new Error('counts query down'));
    const res = await request(app).get('/api/events/counts/all');
    expect(res.status).toBe(500);
    expect(res.body).toHaveProperty('error');
  });
});
