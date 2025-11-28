const request = require('supertest');

describe('App-level CORS and Health checks', () => {
  let originalDb;
  beforeAll(() => {
    // Save original db module cache so we can restore later
    originalDb = require.cache[require.resolve('../db')];
  });

  afterAll(() => {
    // Restore original db module cache
    if (originalDb) {
      require.cache[require.resolve('../db')] = originalDb;
    }
  });

  test('CORS rejects unknown origin and triggers error handler', async () => {
    // Use actual app but send Origin header not in allowed list
    const app = require('../app');
    const res = await request(app).get('/api/health').set('Origin', 'http://malicious.example.com');

    // When CORS blocks, Express should respond with our error handler status (400)
    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty('error');
  });

  test('Health route returns 500 when DB query fails', async () => {
    // Mock the db module to throw from query
    const fakePool = { query: jest.fn().mockRejectedValue(new Error('DB down')) };
    // Replace the cached module for '../db'
    jest.resetModules();
    jest.doMock('../db', () => fakePool, { virtual: false });

    const app = require('../app');
    const res = await request(app).get('/api/health');

    expect(res.statusCode).toBe(500);
    expect(res.body).toMatchObject({ status: expect.stringContaining('Backend running') });
  });

  test('Health route returns 200 when DB query succeeds', async () => {
    // Mock successful db.query
    const fakePool = { query: jest.fn().mockResolvedValueOnce({ rows: [{ now: '2025-01-01T00:00:00Z' }] }) };
    jest.resetModules();
    jest.doMock('../db', () => fakePool, { virtual: false });

    const app = require('../app');
    const res = await request(app).get('/api/health').set('Origin', 'http://localhost:5173');

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('status', 'Backend running!');
    expect(res.body).toHaveProperty('dbTime');
  });

  test('FRONTEND_ORIGIN parsing accepts comma-separated origins', async () => {
    // Provide a comma-separated FRONTEND_ORIGIN and ensure one of them is accepted
    jest.resetModules();
    process.env.FRONTEND_ORIGIN = 'https://alpha.example.com, https://beta.example.com';

    const fakePool = { query: jest.fn().mockResolvedValueOnce({ rows: [{ now: '2025-01-01T00:00:00Z' }] }) };
    jest.doMock('../db', () => fakePool, { virtual: false });

    const app = require('../app');
    const res = await request(app).get('/api/health').set('Origin', 'https://beta.example.com');

    expect(res.statusCode).toBe(200);
    expect(fakePool.query).toHaveBeenCalled();
  });

  test('No Origin header is accepted by CORS (no-origin branch)', async () => {
    jest.resetModules();
    const fakePool = { query: jest.fn().mockResolvedValueOnce({ rows: [{ now: '2025-01-01T00:00:00Z' }] }) };
    jest.doMock('../db', () => fakePool, { virtual: false });

    const app = require('../app');
    // Do not set Origin header
    const res = await request(app).get('/api/health');

    expect(res.statusCode).toBe(200);
    expect(fakePool.query).toHaveBeenCalled();
  });
});
