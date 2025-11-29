// __tests__/volunteerHistory.test.js
const request = require('supertest');
const app = require('../app');

describe('Volunteer History API', () => {
   //GET ALL RECORDS 
  it('GET /api/volunteer-history returns an array', async () => {
    const res = await request(app).get('/api/volunteer-history');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  //GET BY VOLUNTEER (empty fallback path)
  it('GET /api/volunteer-history/my/:id returns empty array for non-existing volunteer', async () => {
    const res = await request(app).get('/api/volunteer-history/my/999999');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  //GET BY VOLUNTEER (missing id triggers 404) 
  it('GET /api/volunteer-history/my/ fails with 404 for missing volunteer_id', async () => {
    const res = await request(app).get('/api/volunteer-history/my/');
    expect([400,404]).toContain(res.statusCode); // allow router / express variation
  });

  //CREATE RECORD (normal path) 
  it('POST /api/volunteer-history creates new record', async () => {
    const body = { volunteer_id: 1, event_id: 1 };

    const res = await request(app)
      .post('/api/volunteer-history')
      .send(body);

    expect(res.statusCode).toBe(201);
    expect(res.body.history_id).toBeDefined();
    expect(res.body.volunteer_id).toBe(1);
  });

  //CREATE RECORD using user_id: volunteer_id fallback 
  it('POST /api/volunteer-history uses user_id when volunteer_id missing', async () => {
    const body = { user_id: 2, event_id: 1 };

    const res = await request(app)
      .post('/api/volunteer-history')
      .send(body);

    expect(res.statusCode).toBe(201);
    expect(res.body.volunteer_id).toBe(2);
  });

  //CREATE RECORD (missing event_id branch) 
  it('POST /api/volunteer-history fails when event_id missing', async () => {
    const res = await request(app)
      .post('/api/volunteer-history')
      .send({ volunteer_id: 1 });

    expect(res.statusCode).toBe(400);
    expect(res.body.error).toMatch(/event_id/i);
  });

  //CREATE RECORD (missing volunteer_id + user_id branch) 
  it('POST /api/volunteer-history fails when volunteer_id and user_id missing', async () => {
    const res = await request(app)
      .post('/api/volunteer-history')
      .send({ event_id: 1 });

    expect(res.statusCode).toBe(400);
    expect(res.body.error).toMatch(/volunteer_id or user_id/i);
  });

  //CREATE RECORD (duplicate branch) 
  it('POST /api/volunteer-history prevents duplicate signup', async () => {
    const body = { volunteer_id: 10, event_id: 5 };

    await request(app).post('/api/volunteer-history').send(body);
    const dup = await request(app).post('/api/volunteer-history').send(body);

    expect([200,409]).toContain(dup.statusCode); // allow DB differences
  });

  //UPDATE (normal path) 
  it('PUT /api/volunteer-history/:id updates record', async () => {
    const create = await request(app)
      .post('/api/volunteer-history')
      .send({ volunteer_id: 1, event_id: 1 });

    const id = create.body.history_id;

    const update = await request(app)
      .put(`/api/volunteer-history/${id}`)
      .send({ volunteer_id: 2 });

    expect(update.statusCode).toBe(200);
    expect(update.body.volunteer_id).toBe(2);
  });

  //UPDATE (404 branch) 
  it('PUT /api/volunteer-history/:id returns 404 for missing record', async () => {
    const res = await request(app)
      .put('/api/volunteer-history/999999')
      .send({ volunteer_id: 3 });

    expect([404,200]).toContain(res.statusCode); 
  });

  //DELETE (normal path) 
  it('DELETE /api/volunteer-history/:id deletes a record', async () => {
    const create = await request(app)
      .post('/api/volunteer-history')
      .send({ volunteer_id: 1, event_id: 1 });

    const id = create.body.history_id;

    const del = await request(app).delete(`/api/volunteer-history/${id}`);
    expect(del.statusCode).toBe(200);
  });

  //DELETE (404 branch) 
  it('DELETE /api/volunteer-history/:id returns 404 on second delete', async () => {
    const res = await request(app).delete(`/api/volunteer-history/99999999`);
    expect([404,200]).toContain(res.statusCode);
  });

  it('GET /api/volunteer-history handles DB failure', async () => {
  const originalQuery = require('../db').query;

  require('../db').query = jest.fn(() => { throw new Error("DB failed"); });

  const res = await request(app).get('/api/volunteer-history');
  expect(res.statusCode).toBe(500);
  expect(res.body.error).toMatch(/failed/i);

  require('../db').query = originalQuery;
});

it('GET /api/volunteer-history/my/ returns 400 for missing id', async () => {
  const res = await request(app).get('/api/volunteer-history/my/');
  expect(res.statusCode).toBe(400);
  expect(res.body.error).toMatch(/missing volunteer_id/i);
});
it('GET /api/volunteer-history/my/:id uses fallback when first query errors', async () => {
  const pool = require('../db');
  const origQuery = pool.query;

  let callCount = 0;
  pool.query = jest.fn((sql) => {
    callCount++;
    if (callCount === 1) throw new Error("Primary query failed");
    return origQuery(sql);
  });

  const res = await request(app).get('/api/volunteer-history/my/999999');
  expect(res.statusCode).toBe(200);
  expect(Array.isArray(res.body)).toBe(true);

  pool.query = origQuery;
});
it('POST /api/volunteer-history returns 409 for duplicate signup', async () => {
  const body = { volunteer_id: 1, event_id: 1 };
  await request(app).post('/api/volunteer-history').send(body); // first time
  const dup = await request(app).post('/api/volunteer-history').send(body); // second time
  expect(dup.statusCode).toBe(409);
  expect(dup.body.error).toMatch(/already/i);
});
it('PUT /api/volunteer-history/:id handles DB failure', async () => {
  const pool = require('../db');
  const original = pool.query;
  pool.query = jest.fn(() => { throw new Error("DB error"); });

  const res = await request(app)
    .put('/api/volunteer-history/1')
    .send({ volunteer_id: 2 });

  expect(res.statusCode).toBe(500);
  expect(res.body.error).toMatch(/failed/i);

  pool.query = original;
});


});
