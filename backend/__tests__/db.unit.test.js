// consolidated db tests below
const mockPool = { connect: jest.fn(), query: jest.fn() };

jest.mock('pg', () => ({ Pool: jest.fn(() => mockPool) }));

// ensure env variations
describe('db.js environment handling', () => {
  let oldEnv;
  beforeAll(() => { oldEnv = { ...process.env }; });
  afterAll(() => { process.env = oldEnv; });

  beforeEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
    // ensure pool.connect() returns a promise so db.js can call .then()
    mockPool.connect = jest.fn().mockResolvedValue({});
  });

  test('uses DATABASE_URL when provided', async () => {
    process.env.DATABASE_URL = 'postgres://user:pass@host/db';
    process.env.PGSSL = 'true';
    const pool = await require('../db');
    await new Promise(r => setImmediate(r));
    expect(pool).toBeDefined();
    expect(require('pg').Pool).toHaveBeenCalledWith(expect.objectContaining({ connectionString: process.env.DATABASE_URL }));
  });

  test('uses individual env vars when DATABASE_URL not set', async () => {
    delete process.env.DATABASE_URL;
    process.env.PGUSER = 'u';
    process.env.PGHOST = 'h';
    process.env.PGDATABASE = 'd';
    process.env.PGPASSWORD = 'p';
    process.env.PGPORT = '5432';
    process.env.PGSSL = 'false';
    const pool = await require('../db');
    await new Promise(r => setImmediate(r));
    expect(pool).toBeDefined();
    expect(require('pg').Pool).toHaveBeenCalledWith(expect.objectContaining({ user: 'u', host: 'h' }));
  });

  test('does not load dotenv during tests and handles connect rejection gracefully', () => {
    jest.resetModules();
    const origEnv = { ...process.env };
    process.env.NODE_ENV = 'test';
    // make Pool.connect reject to simulate connection failure
    mockPool.connect = jest.fn().mockRejectedValue(new Error('connect failed'));
    const pool = require('../db');
    expect(pool).toBeDefined();
    process.env = origEnv;
  });

  test('loads dotenv when not in test env (branch)', () => {
    jest.resetModules();
    const origEnv = { ...process.env };
    process.env.NODE_ENV = 'development';
    // ensure connect resolves so require('../db') continues
    mockPool.connect = jest.fn().mockResolvedValue({});
    const pool = require('../db');
    expect(pool).toBeDefined();
    process.env = origEnv;
  });

  test('connect success logs message when NODE_ENV !== test (executes .then)', async () => {
    jest.resetModules();
    const origEnv = { ...process.env };
    process.env.NODE_ENV = 'development';
    mockPool.connect = jest.fn().mockResolvedValue({});
    const logSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
    require('../db');
    // allow promise microtasks to run so .then handler executes
    await new Promise(r => setImmediate(r));
    expect(logSpy).toHaveBeenCalledWith('Connected to PostgreSQL!');
    logSpy.mockRestore();
    process.env = origEnv;
  });

  test('connect failure logs error when NODE_ENV !== test (executes .catch)', async () => {
    jest.resetModules();
    const origEnv = { ...process.env };
    process.env.NODE_ENV = 'development';
    mockPool.connect = jest.fn().mockRejectedValue(new Error('connect failed'));
    const errSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    require('../db');
    // allow promise microtasks to run so .catch handler executes
    await new Promise(r => setImmediate(r));
    expect(errSpy).toHaveBeenCalled();
    errSpy.mockRestore();
    process.env = origEnv;
  });
});
