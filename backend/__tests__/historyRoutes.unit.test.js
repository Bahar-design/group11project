const request = require('supertest');
const express = require('express');

const historyRoutes = require('../routes/historyRoutes');
const sse = require('../utils/sse');

describe('historyRoutes', () => {
  let app;
  beforeEach(() => {
    app = express();
    app.use('/api/volunteer-history', historyRoutes);
    sse.clients.clear();
  });

  test('GET /stream sets SSE headers and registers client (test close)', async () => {
    // send special header to tell server to close immediately in test context
    const res = await request(app).get('/api/volunteer-history/stream').set('x-test-sse-close', '1');
    expect(res.status).toBe(200);
    expect(res.header['content-type']).toContain('text/event-stream');
    // because the test header asks server to close immediately, client should be removed
    expect(sse.clients.size).toBe(0);
  });

  test('GET /debug/last-broadcast returns last broadcast payload', async () => {
    sse.broadcast({ debug: 'x' });
    const res = await request(app).get('/api/volunteer-history/debug/last-broadcast');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('lastBroadcast');
    expect(res.body.lastBroadcast).toEqual({ debug: 'x' });
  });
});
