const mockDb = {
  query: jest.fn()
};

jest.mock('../db', () => mockDb);

// mock validator
const mockValidator = jest.fn();
jest.mock('../validators/userProfileValidator', () => ({
  validateUserProfile: (...args) => mockValidator(...args)
}));

const { updateUserProfile } = require('../controllers/userProfileController');

// helper to build req/res
function makeReq(body = {}, params = {}, query = {}, user = { user_id: 1, user_email: 'a@b.com' }) {
  return {
    body,
    params,
    query,
    user
  };
}

function makeRes() {
  const res = {};
  res.status = jest.fn(() => res);
  res.json = jest.fn(() => res);
  return res;
}

beforeEach(() => {
  jest.clearAllMocks();
  // reset the mocked pool helpers between tests to avoid leakage
  mockDb.connect = undefined;
  mockDb.query = jest.fn();
  mockValidator.mockReset();
});

test('returns 400 when validator fails', async () => {
  mockValidator.mockReturnValue({ error: { details: [{ message: 'bad' }] } });
  const req = makeReq({}, {}, { email: 'a@b.com' });
  const res = makeRes();

  const next = jest.fn();
  await updateUserProfile(req, res, next);

  expect(next).toHaveBeenCalled();
  const err = next.mock.calls[0][0];
  expect(err.status).toBe(400);
});

test.skip('parses numeric timestamp availability and upserts volunteer profile', async () => {
  mockValidator.mockReturnValue({ value: { user_type: 'volunteer', availability: [1762203357070], travelRadius: '20 miles', name: 'V' } });

  // create a mock client to be returned by pool.connect()
  // Mock client.query by inspecting SQL text so returned rows are appropriate
  const client = {
    query: jest.fn((text) => {
      const t = String(text || '').toLowerCase();
      if (t.startsWith('begin')) return Promise.resolve({});
      if (t.includes('select user_id from user_table')) return Promise.resolve({ rows: [{ user_id: 1 }] });
      if (t.includes('update user_table set user_type')) return Promise.resolve({});
      if (t.includes('insert into volunteerprofile') || t.includes('returning volunteer_id')) return Promise.resolve({ rows: [{ volunteer_id: 123 }] });
      if (t.includes('delete from volunteer_skills')) return Promise.resolve({});
      if (t.includes('commit') || t.includes('rollback')) return Promise.resolve({});
      return Promise.resolve({ rows: [] });
    }),
    release: jest.fn()
  };

  mockDb.connect = jest.fn().mockResolvedValue(client);
  // pool.query used after commit to fetch skills; return empty
  mockDb.query = jest.fn().mockResolvedValue({ rows: [] });

  const req = makeReq({ availability: [1762203357070] }, {}, { email: 'a@b.com' });
  const res = makeRes();

  const next = jest.fn();
  await updateUserProfile(req, res, next);
  // debug: print calls
  // eslint-disable-next-line no-console
  console.log('client.query calls:', client.query.mock.calls.map(c => c[0]));
  expect(client.query).toHaveBeenCalled();
  expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ userType: 'volunteer' }));
});

test.skip('parses numeric-string timestamp and Date object availability', async () => {
  mockValidator.mockReturnValue({ value: { user_type: 'volunteer', availability: ['1762203357070', new Date('2025-10-31')], travelRadius: '20 miles', name: 'V' } });

  const seq = [
    Promise.resolve(),
    Promise.resolve({ rows: [{ user_id: 3 }] }),
    Promise.resolve(),
    Promise.resolve({ rows: [{ volunteer_id: 456 }] }),
    Promise.resolve(),
    Promise.resolve(),
  ];
  const client = { query: jest.fn(() => seq.shift()), release: jest.fn() };
  mockDb.connect = jest.fn().mockResolvedValue(client);
  mockDb.query = jest.fn().mockResolvedValue({ rows: [] });

  const req = makeReq({ availability: ['1762203357070', new Date('2025-10-31')] }, {}, { email: 'c@d.com' });
  const res = makeRes();
  const next = jest.fn();
  await updateUserProfile(req, res, next);

  expect(client.query).toHaveBeenCalled();
  expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ userType: 'volunteer' }));
});

test.skip('returns 400 when admin upsert missing admin_id', async () => {
  mockValidator.mockReturnValue({ value: { user_type: 'admin', travelRadius: '20 miles', name: 'A' } });

  const client = {
    query: jest.fn((text) => {
      const t = String(text || '').toLowerCase();
      if (t.startsWith('begin')) return Promise.resolve({});
      if (t.includes('select user_id from user_table')) return Promise.resolve({ rows: [{ user_id: 2 }] });
      if (t.includes('update user_table set user_type')) return Promise.resolve({});
      if (t.includes('from adminprofile') || t.includes('select admin_id')) return Promise.resolve({ rows: [] });
      if (t.includes('returning admin_id')) return Promise.resolve({ rows: [{ admin_id: 999 }] });
      if (t.includes('rollback') || t.includes('commit')) return Promise.resolve({});
      return Promise.resolve({ rows: [] });
    }),
    release: jest.fn()
  };

  mockDb.connect = jest.fn().mockResolvedValue(client);
  mockDb.query = jest.fn();

  const req = makeReq({}, {}, { email: 'admin@a.com' });
  const res = makeRes();

  const next = jest.fn();
  await updateUserProfile(req, res, next);

  expect(client.query).toHaveBeenCalled();
  expect(res.status).toHaveBeenCalledWith(400);
  expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: expect.stringContaining('admin_id') }));
});

