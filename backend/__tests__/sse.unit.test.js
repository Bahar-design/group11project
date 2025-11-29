const sse = require('../utils/sse');

describe('SSE helper', () => {
  beforeEach(() => {
    // clear clients and last broadcast
    sse.clients.clear();
    // reset lastBroadcast via internal broadcast call
  });

  test('broadcast writes to connected clients and stores lastBroadcast', () => {
    const writes = [];
    const res = { write: (payload) => writes.push(payload), finished: false };
    const client = { id: 'c1', res };
    sse.clients.add(client);

    sse.broadcast({ hello: 'world' });

    expect(writes.length).toBeGreaterThan(0);
    expect(writes[0]).toContain('"hello":"world"');
    expect(sse.getLastBroadcast()).toEqual({ hello: 'world' });
  });

  test('finished clients are removed on broadcast', () => {
    const res = { write: () => {}, finished: true };
    const client = { id: 'c2', res };
    sse.clients.add(client);

    sse.broadcast({ ok: true });

    // client should be removed
    expect(Array.from(sse.clients).some(c => c.id === 'c2')).toBe(false);
  });
});
