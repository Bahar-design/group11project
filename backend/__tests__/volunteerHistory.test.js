const request = require('supertest');
const app = require('../app');

describe('Volunteer History API', () => {
  
  it('GET /api/volunteer-history returns all volunteer history records', async () => {
    const res = await request(app).get('/api/volunteer-history');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('POST /api/volunteer-history creates a new volunteer record', async () => {
    const volunteerRecord = {
      volunteer_id: 1,
      event_id: 1
    };
  
    const res = await request(app)
      .post('/api/volunteer-history')
      .send(volunteerRecord);
  
    expect(res.statusCode).toBe(201);
    expect(res.body.history_id).toBeDefined();
    expect(res.body.volunteer_id).toBe(1);
    expect(res.body.event_id).toBe(1);
  });

  it('POST /api/volunteer-history fails on invalid data', async () => {
    const invalid = { volunteer_id: "", event_id: "" };

    const res = await request(app)
      .post('/api/volunteer-history')
      .send(invalid);

    expect(res.statusCode).toBe(400);
    expect(res.body.error).toMatch(/required/i);
  });

  it('PUT /api/volunteer-history/:id updates a record', async () => {
    // First create a new record
    const create = await request(app)
      .post('/api/volunteer-history')
      .send({ volunteer_id: 1, event_id: 1 });

    const id = create.body.history_id;

    const updateRes = await request(app)
      .put(`/api/volunteer-history/${id}`)
      .send({ volunteer_id: 2 }); 

    expect(updateRes.statusCode).toBe(200);
    expect(updateRes.body.volunteer_id).toBe(2);
  });

  it('DELETE /api/volunteer-history/:id deletes a record', async () => {
    const create = await request(app)
      .post('/api/volunteer-history')
      .send({ volunteer_id: 1, event_id: 1 });

    const id = create.body.history_id;

    const res = await request(app).delete(`/api/volunteer-history/${id}`);
    
    expect(res.statusCode).toBe(200);
    expect(res.body.history_id).toBe(id);

    // second delete should return 404
    const second = await request(app).delete(`/api/volunteer-history/${id}`);
    expect(second.statusCode).toBe(404);
  });

});
