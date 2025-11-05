const request = require('supertest');
let app;

describe('app health endpoint', () => {
  afterEach(() => jest.resetModules());

  it('returns 200 and db time when DB responds', async () => {
    // mock db to succeed
    const mockDb = { query: jest.fn().mockResolvedValueOnce({ rows: [{ now: '2025-11-04T00:00:00Z' }] }) };
    jest.mock('../db', () => mockDb, { virtual: true });
    app = require('../app');
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('dbTime');
  });

  it('returns 500 when DB query fails', async () => {
    const mockDb = { query: jest.fn().mockRejectedValueOnce(new Error('DB down')) };
    jest.mock('../db', () => mockDb, { virtual: true });
    app = require('../app');
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(500);
    expect(res.body).toHaveProperty('error');
  });

  it('returns 400 when CORS origin not allowed', async () => {
    // Mock DB so app can initialize; CORS should reject before route handler runs
    const mockDb = { query: jest.fn().mockResolvedValueOnce({ rows: [{ now: '2025-11-04T00:00:00Z' }] }) };
    jest.mock('../db', () => mockDb, { virtual: true });
    app = require('../app');
    const res = await request(app).get('/api/health').set('Origin', 'https://evil.com');
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error');
    expect(res.body.error).toMatch(/Not allowed by CORS/);
  });
});
