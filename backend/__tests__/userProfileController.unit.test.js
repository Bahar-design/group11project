
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
});
