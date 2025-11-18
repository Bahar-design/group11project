const request = require('supertest');
const app = require('../app');
const pool = require('../db');

jest.mock('../db');

describe('Reports endpoints', () => {
  beforeEach(() => jest.resetAllMocks());

  test('GET /api/reports/volunteer-participation returns rows', async () => {
    pool.query.mockResolvedValueOnce({ rows: [ { volunteer_id: 1, full_name: 'A', email: 'a@x.com', city: 'X', state_code: 'TX', total_events: '2', skills: ['S1'] } ] });
    const res = await request(app).get('/api/reports/volunteer-participation');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body[0].volunteer_id).toBe(1);
  });

  test('GET /api/reports/volunteer-history returns rows', async () => {
    pool.query.mockResolvedValueOnce({ rows: [ { volunteer_id: 1, full_name: 'A', event_id: 10, event_name: 'E', event_date: '2025-10-10' } ] });
    const res = await request(app).get('/api/reports/volunteer-history');
    expect(res.statusCode).toBe(200);
    expect(res.body[0].volunteer_id).toBe(1);
  });

  test('GET /api/reports/event-management returns rows', async () => {
    pool.query.mockResolvedValueOnce({ rows: [ { event_id: 10, event_name: 'E', total_volunteers: '4', required_skills: ['S1'] } ] });
    const res = await request(app).get('/api/reports/event-management');
    expect(res.statusCode).toBe(200);
    expect(res.body[0].total_volunteers).toBe(4);
  });
});
