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

  test('uses DATABASE_URL when provided', () => {
    process.env.DATABASE_URL = 'postgres://user:pass@host/db';
    process.env.PGSSL = 'true';
    const pool = require('../db');
    expect(pool).toBeDefined();
    expect(require('pg').Pool).toHaveBeenCalledWith(expect.objectContaining({ connectionString: process.env.DATABASE_URL }));
  });

  test('uses individual env vars when DATABASE_URL not set', () => {
    delete process.env.DATABASE_URL;
    process.env.PGUSER = 'u';
    process.env.PGHOST = 'h';
    process.env.PGDATABASE = 'd';
    process.env.PGPASSWORD = 'p';
    process.env.PGPORT = '5432';
    process.env.PGSSL = 'false';
    const pool = require('../db');
    expect(pool).toBeDefined();
    expect(require('pg').Pool).toHaveBeenCalledWith(expect.objectContaining({ user: 'u', host: 'h' }));
  });
});
