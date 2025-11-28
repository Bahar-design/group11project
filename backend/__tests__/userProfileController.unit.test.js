
const mockDb = { query: jest.fn(), connect: jest.fn() };
jest.mock('../db', () => mockDb);

const mockValidator = jest.fn();
jest.mock('../validators/userProfileValidator', () => ({
  validateUserProfile: (...args) => mockValidator(...args)
}));

const { getUserProfile, updateUserProfile } = require('../controllers/userProfileController');

function makeReqRes(query = {}, body = {}) {
  const req = { query, body };
  const res = { status: jest.fn().mockReturnThis(), json: jest.fn().mockReturnThis() };
  const next = jest.fn();
  return [req, res, next];
}

beforeEach(() => {
  jest.clearAllMocks();
});

describe('getUserProfile unit tests', () => {
  it('returns 400 when no email provided', async () => {
    const [req, res] = makeReqRes({}, {});
    await getUserProfile(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: expect.stringMatching(/email/i) }));
  });

  it('returns 404 when user not found', async () => {
    mockDb.query.mockResolvedValueOnce({ rows: [] });
    const [req, res] = makeReqRes({ email: 'none@x.com' });
    await getUserProfile(req, res);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: 'User not found' }));
  });

  it('returns 400 when profile type mismatch', async () => {
    mockDb.query.mockResolvedValueOnce({ rows: [{ user_id: 5, user_type: 'admin' }] });
    const [req, res] = makeReqRes({ type: 'volunteer', email: 'admin@x.com' });
    await getUserProfile(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: expect.stringMatching(/does not match/) }));
  });

  it('handles DB failure gracefully', async () => {
    mockDb.query.mockRejectedValueOnce(new Error('DB broke'));
    const [req, res] = makeReqRes({ email: 'err@x.com' });
    await getUserProfile(req, res);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: 'Server error fetching profile' }));
  });
});

describe('updateUserProfile unit tests', () => {
  it('returns 400 when validation fails', async () => {
    mockValidator.mockReturnValue({ error: { message: 'bad input' } });
    const [req, res, next] = makeReqRes({ email: 'a@b.com' }, {});
    await updateUserProfile(req, res, next);
    expect(next).toHaveBeenCalledWith(expect.objectContaining({ status: 400 }));
  });

  it('returns 400 when no email in query/body', async () => {
    mockValidator.mockReturnValue({ value: { name: 'x' } });
    const [req, res, next] = makeReqRes({}, {});
    await updateUserProfile(req, res, next);
    expect(next).toHaveBeenCalledWith(expect.objectContaining({ status: 400 }));
  });

  it('handles DB rollback on user not found', async () => {
    const mockClient = {
      query: jest.fn()
        .mockResolvedValueOnce() 
        .mockResolvedValueOnce({ rows: [] }) 
        .mockResolvedValueOnce(), 
      release: jest.fn()
    };
    mockDb.connect.mockResolvedValue(mockClient);
    mockValidator.mockReturnValue({ value: { name: 'v', availability: [] } });
    const [req, res] = makeReqRes({ email: 'notfound@x.com' });
    await updateUserProfile(req, res, jest.fn());
    expect(res.status).toHaveBeenCalledWith(404);
  });

  it('handles DB error during transaction', async () => {
    const mockClient = {
      query: jest.fn()
        .mockResolvedValueOnce() 
        .mockRejectedValueOnce(new Error('DB exploded')),
      release: jest.fn()
    };
    mockDb.connect.mockResolvedValue(mockClient);
    mockValidator.mockReturnValue({ value: { name: 'v', availability: [] } });
    const [req, res] = makeReqRes({ email: 'boom@x.com' });
    await updateUserProfile(req, res, jest.fn());
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: 'Server error updating profile' }));
  });

  it('returns 400 for unknown profile type', async () => {
    const mockClient = { query: jest.fn(), release: jest.fn() };
    mockDb.connect.mockResolvedValue(mockClient);
    mockValidator.mockReturnValue({ value: { user_type: 'unknown', availability: [] } });
    const [req, res] = makeReqRes({ email: 'z@x.com', type: 'alien' });
    await updateUserProfile(req, res, jest.fn());
    expect(res.status).toHaveBeenCalledWith(400);
  });

  it('getUserProfile returns empty volunteer profile when no volunteer row exists', async () => {
    // user exists as volunteer but no volunteerprofile rows
    mockDb.query.mockResolvedValueOnce({ rows: [{ user_id: 10, user_type: 'volunteer' }] }) // user lookup
      .mockResolvedValueOnce({ rows: [] }); // vp lookup
    const [req, res] = makeReqRes({ email: 'v@x.com', type: 'volunteer' });
    // call the controller directly
    const { getUserProfile } = require('../controllers/userProfileController');
    await getUserProfile(req, res);
    expect(res.json).toHaveBeenCalled();
    const sent = res.json.mock.calls[0][0];
    expect(sent).toHaveProperty('userType', 'volunteer');
    expect(sent).toHaveProperty('name', '');
  });

  it('getUserProfile returns populated volunteer profile when DB has rows', async () => {
    mockDb.query.mockResolvedValueOnce({ rows: [{ user_id: 11, user_type: 'volunteer' }] }) // user
      .mockResolvedValueOnce({ rows: [{ volunteer_id: 55, full_name: 'Jon Doe', phone: '123', address1: 'A', city: 'C', state_code: 'S', zip_code: 'Z', preferences: 'pref', availability: [], has_transportation: true, emergency_contact: 'E' }] }) // vp
      .mockResolvedValueOnce({ rows: [{ skill_name: 'Cooking' }, { skill_name: 'Driving' }] }); // skills
    const [req, res] = makeReqRes({ email: 'j@x.com', type: 'volunteer' });
    const { getUserProfile } = require('../controllers/userProfileController');
    await getUserProfile(req, res);
    expect(res.json).toHaveBeenCalled();
    const sent = res.json.mock.calls[0][0];
    expect(sent).toHaveProperty('userType', 'volunteer');
    expect(sent).toHaveProperty('name', 'Jon Doe');
    expect(Array.isArray(sent.skills)).toBe(true);
    expect(sent.skills.length).toBe(2);
  });

  it('getUserProfile returns empty admin profile when admin row missing', async () => {
    mockDb.query.mockResolvedValueOnce({ rows: [{ user_id: 12, user_type: 'admin' }] })
      .mockResolvedValueOnce({ rows: [] }); // ap lookup
    const [req, res] = makeReqRes({ email: 'a@x.com', type: 'admin' });
    const { getUserProfile } = require('../controllers/userProfileController');
    await getUserProfile(req, res);
    expect(res.json).toHaveBeenCalled();
    const sent = res.json.mock.calls[0][0];
    expect(sent).toHaveProperty('userType', 'admin');
    expect(sent).toHaveProperty('name', '');
  });

  it('getUserProfile formats admin start date correctly when present', async () => {
    const start = new Date('2020-01-02T00:00:00Z');
    mockDb.query.mockResolvedValueOnce({ rows: [{ user_id: 13, user_type: 'admin' }] })
      .mockResolvedValueOnce({ rows: [{ admin_id: 88, start_date: start, full_name: 'Admin One' }] });
    const [req, res] = makeReqRes({ email: 'admin@x.com', type: 'admin' });
    const { getUserProfile } = require('../controllers/userProfileController');
    await getUserProfile(req, res);
    expect(res.json).toHaveBeenCalled();
    const sent = res.json.mock.calls[0][0];
    expect(sent).toHaveProperty('userType', 'admin');
    expect(sent.startDate).toBe('2020-01-02');
  });

  it('updateUserProfile successful volunteer flow returns profile', async () => {
    // set up validator to accept
    mockValidator.mockReturnValue({ value: { name: 'V', address1: 'A', city: 'C', state: 'S', zipCode: 'Z', availability: [], skills: [] } });
    // mock a client with expected query sequence
    const mockClient = {
      query: jest.fn()
        .mockResolvedValueOnce() // BEGIN
        .mockResolvedValueOnce({ rows: [{ user_id: 101 }] }) // SELECT user_id
        .mockResolvedValueOnce() // UPDATE user_table
        .mockResolvedValueOnce({ rows: [{ volunteer_id: 201 }] }) // upsertVP RETURNING volunteer_id
        .mockResolvedValueOnce() // DELETE volunteer_skills
        .mockResolvedValueOnce({ rows: [] }) // SELECT skills
        .mockResolvedValueOnce() // COMMIT
      ,
      release: jest.fn()
    };
    mockDb.connect.mockResolvedValue(mockClient);
    // pool.query (used after commit to fetch skills) should return empty
    mockDb.query.mockResolvedValueOnce({ rows: [] });

    const [req, res] = makeReqRes({ email: 'u@x.com', type: 'volunteer' }, { name: 'V', address1: 'A', city: 'C', state: 'S', zipCode: 'Z', availability: [], skills: [] });
    const { updateUserProfile } = require('../controllers/userProfileController');
    await updateUserProfile(req, res, jest.fn());
    expect(res.json).toHaveBeenCalled();
    const sent = res.json.mock.calls[0][0];
    expect(sent).toHaveProperty('userType', 'volunteer');
    expect(sent).toHaveProperty('name', 'V');
  });

  it('updateUserProfile updates user_table email when changed', async () => {
    // validator returns a different email than query email
    mockValidator.mockReturnValue({ value: { name: 'V', address1: 'A', city: 'C', state: 'S', zipCode: 'Z', availability: [], skills: [], email: 'new-email@example.test' } });
    const mockClient = {
      query: jest.fn()
        .mockResolvedValueOnce() // BEGIN
        .mockResolvedValueOnce({ rows: [{ user_id: 202, user_email: 'old@example.test' }] }) // SELECT user_id, user_email
        .mockResolvedValueOnce() // UPDATE user_table SET user_type
        .mockResolvedValueOnce() // UPDATE user_table SET user_email
        .mockResolvedValueOnce({ rows: [{ volunteer_id: 202 }] }) // upsertVP RETURNING volunteer_id
        .mockResolvedValueOnce() // DELETE volunteer_skills
        .mockResolvedValueOnce({ rows: [] }) // SELECT skills
        .mockResolvedValueOnce() // COMMIT
      , release: jest.fn()
    };
    mockDb.connect.mockResolvedValue(mockClient);
    mockDb.query.mockResolvedValueOnce({ rows: [] });

    const [req, res] = makeReqRes({ email: 'old@example.test', type: 'volunteer' }, { name: 'V', address1: 'A', city: 'C', state: 'S', zipCode: 'Z', availability: [], skills: [], email: 'new-email@example.test' });
    const { updateUserProfile } = require('../controllers/userProfileController');
    await updateUserProfile(req, res, jest.fn());
    expect(mockClient.query).toHaveBeenCalled();
    // the 4th call is the email update in our mock sequence
    expect(mockClient.query.mock.calls[3][0]).toMatch(/UPDATE user_table SET user_email/);
    expect(res.json).toHaveBeenCalled();
    const sent = res.json.mock.calls[0][0];
    expect(sent.email).toBe('new-email@example.test');
  });

  it('updateUserProfile admin flow creates missing adminprofile and returns admin profile', async () => {
    mockValidator.mockReturnValue({ value: { name: 'Admin', address1: 'A', city: 'C', state: 'S', zipCode: 'Z' } });
    const mockClient = {
      query: jest.fn()
        .mockResolvedValueOnce() // BEGIN
        .mockResolvedValueOnce({ rows: [{ user_id: 300 }] }) // SELECT user_id
        .mockResolvedValueOnce() // UPDATE user_table
        .mockResolvedValueOnce({ rows: [] }) // SELECT adminprofile -> none
        .mockResolvedValueOnce() // INSERT adminprofile
        .mockResolvedValueOnce({ rows: [{ admin_id: 300, start_date: null }] }) // reselect adminprofile
        .mockResolvedValueOnce({ rows: [{ admin_id: 300 }] }) // upsertAP RETURNING
        .mockResolvedValueOnce() // COMMIT
      ,
      release: jest.fn()
    };
    mockDb.connect.mockResolvedValue(mockClient);

    const [req, res] = makeReqRes({ email: 'admincreate@x.com', type: 'admin' }, { name: 'Admin', address1: 'A', city: 'C', state: 'S', zipCode: 'Z' });
    const { updateUserProfile } = require('../controllers/userProfileController');
    await updateUserProfile(req, res, jest.fn());
    expect(res.json).toHaveBeenCalled();
    const sent = res.json.mock.calls[0][0];
    expect(sent).toHaveProperty('userType', 'admin');
    expect(sent).toHaveProperty('name', 'Admin');
  });

  it('updateUserProfile admin flow returns 500 when creating adminprofile fails', async () => {
    mockValidator.mockReturnValue({ value: { name: 'Admin', address1: 'A' } });
    const mockClient = {
      query: jest.fn()
        .mockResolvedValueOnce() // BEGIN
        .mockResolvedValueOnce({ rows: [{ user_id: 400 }] }) // SELECT user_id
        .mockResolvedValueOnce() // UPDATE user_table
        .mockResolvedValueOnce({ rows: [] }) // SELECT adminprofile -> none
        .mockRejectedValueOnce(new Error('INSERT failed')) // INSERT adminprofile throws
      ,
      release: jest.fn()
    };
    mockDb.connect.mockResolvedValue(mockClient);

    const [req, res] = makeReqRes({ email: 'adminfail@x.com', type: 'admin' }, { name: 'Admin' });
    const { updateUserProfile } = require('../controllers/userProfileController');
    await updateUserProfile(req, res, jest.fn());
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: expect.stringContaining('Server error') }));
  });

  it('getUserProfile uses default type=volunteer when type omitted', async () => {
    // user exists as volunteer and should be fetched when no type provided
    mockDb.query.mockResolvedValueOnce({ rows: [{ user_id: 99, user_type: 'volunteer' }] }) // user lookup
      .mockResolvedValueOnce({ rows: [{ volunteer_id: 999, full_name: 'Default Vol' }] }) // vp
      .mockResolvedValueOnce({ rows: [] }); // skills
    const [req, res] = makeReqRes({ email: 'default@x.com' });
    await getUserProfile(req, res);
    expect(res.json).toHaveBeenCalled();
    const out = res.json.mock.calls[0][0];
    expect(out).toHaveProperty('userType', 'volunteer');
    expect(out.name).toBe('Default Vol');
  });

  it('updateUserProfile warns and skips unknown skills', async () => {
    // setup validator to accept and include an unknown skill name
    mockValidator.mockReturnValue({ value: { name: 'S', address1: 'A', city: 'C', state: 'S', zipCode: 'Z', availability: [], skills: ['Leadership'] } });
    const mockClient = {
      query: jest.fn()
        .mockResolvedValueOnce() // BEGIN
        .mockResolvedValueOnce({ rows: [{ user_id: 123 }] }) // SELECT user_id
        .mockResolvedValueOnce() // UPDATE user_table
        .mockResolvedValueOnce({ rows: [{ volunteer_id: 321 }] }) // upsertVP
        .mockResolvedValueOnce() // DELETE volunteer_skills
        // next SELECT skills returns empty indicating unknown skill
        .mockResolvedValueOnce({ rows: [] })
        .mockResolvedValueOnce() // COMMIT
      , release: jest.fn()
    };
    mockDb.connect.mockResolvedValue(mockClient);
    // spy on console.warn
    const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});

    const [req, res] = makeReqRes({ email: 's@x.com', type: 'volunteer' }, { name: 'S', address1: 'A', city: 'C', state: 'S', zipCode: 'Z', availability: [], skills: ['Leadership'] });
    const { updateUserProfile } = require('../controllers/userProfileController');
    await updateUserProfile(req, res, jest.fn());
    expect(warnSpy).toHaveBeenCalled();
    warnSpy.mockRestore();
  });

  it('availability normalization handles many input types and skill insert errors are caught', async () => {
    // validator returns a mix of availability types and skills (one known, one unknown)
    mockValidator.mockReturnValue({ value: {
      name: 'Norm', address1: 'A', city: 'C', state: 'S', zipCode: 'Z',
      availability: [1622505600000, '1622505600000', '2025-11-28T12:00:00Z', new Date('2025-11-28'), { year: 2025, month: { number: 11 }, day: 28 }, { format: () => '2025-11-28' }, null, '2025-11-28'],
      skills: ['Cooking', 'UnknownSkill']
    } });

    const mockClient = {
      query: jest.fn((sql, params) => {
        if (/BEGIN/i.test(sql)) return Promise.resolve();
        if (/SELECT user_id, user_email FROM user_table/i.test(sql)) return Promise.resolve({ rows: [{ user_id: 700, user_email: 'norm@example.test' }] });
        if (/UPDATE user_table SET user_type/i.test(sql)) return Promise.resolve();
        if (/INSERT INTO volunteerprofile/i.test(sql)) return Promise.resolve({ rows: [{ volunteer_id: 800 }] });
        if (/DELETE FROM volunteer_skills/i.test(sql)) return Promise.resolve();
        if (/SELECT skill_id, skill_name FROM skills/i.test(sql)) return Promise.resolve({ rows: [{ skill_id: 1, skill_name: 'Cooking' }] });
        if (/INSERT INTO volunteer_skills/i.test(sql)) {
          // simulate an error when inserting the known skill to exercise the catch branch
          return Promise.reject(new Error('insert failed'));
        }
        if (/COMMIT/i.test(sql)) return Promise.resolve();
        return Promise.resolve();
      }),
      release: jest.fn()
    };

    mockDb.connect.mockResolvedValue(mockClient);
    // pool.query used after commit to fetch skills should return empty so code falls back to value.skills
    mockDb.query.mockResolvedValueOnce({ rows: [] });

    const errSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    const [req, res] = makeReqRes({ email: 'norm@example.test', type: 'volunteer' }, { name: 'Norm' });
    const { updateUserProfile } = require('../controllers/userProfileController');
    await updateUserProfile(req, res, jest.fn());

    expect(errSpy).toHaveBeenCalled();
    errSpy.mockRestore();

    // availability should be normalized to YYYY-MM-DD strings in the response
    const sent = res.json.mock.calls[0][0];
    expect(Array.isArray(sent.availability)).toBe(true);
    expect(sent.availability.length).toBeGreaterThan(0);
    // fallback skills should equal provided skills because DB inserts failed
    expect(sent.skills).toEqual(expect.arrayContaining(['Cooking', 'UnknownSkill']));
  });

  it('updateUserProfile returns 400 when updating email fails (unique constraint)', async () => {
    mockValidator.mockReturnValue({ value: { name: 'E', address1: 'A', city: 'C', state: 'S', zipCode: 'Z', email: 'new-email@test' } });
    const mockClient = {
      query: jest.fn((sql) => {
        if (/BEGIN/i.test(sql)) return Promise.resolve();
        if (/SELECT user_id, user_email FROM user_table/i.test(sql)) return Promise.resolve({ rows: [{ user_id: 900, user_email: 'old@test' }] });
        if (/UPDATE user_table SET user_type/i.test(sql)) return Promise.resolve();
        if (/UPDATE user_table SET user_email/i.test(sql)) return Promise.reject(new Error('duplicate key'));
        return Promise.resolve();
      }),
      release: jest.fn()
    };

    mockDb.connect.mockResolvedValue(mockClient);
    const [req, res] = makeReqRes({ email: 'old@test', type: 'volunteer' }, { name: 'E', email: 'new-email@test' });
    const { updateUserProfile } = require('../controllers/userProfileController');
    await updateUserProfile(req, res, jest.fn());
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: expect.stringContaining('Failed to update email') }));
  });
});
