const mockDb = { query: jest.fn(), connect: jest.fn() };
jest.mock('../db', () => mockDb);

const { getUserProfile } = require('../controllers/userProfileController');

function makeReqRes(query = {}, body = {}) {
  const req = { query, body };
  const res = { status: jest.fn().mockReturnThis(), json: jest.fn().mockReturnThis() };
  return [req, res];
}

describe('userProfileController success paths', () => {
  beforeEach(() => jest.clearAllMocks());

  it('returns empty volunteer profile when user exists but no volunteerprofile row', async () => {
    mockDb.query
      .mockResolvedValueOnce({ rows: [{ user_id: 99, user_type: 'volunteer' }] }) // user lookup
      .mockResolvedValueOnce({ rows: [] }); // volunteerprofile select

    const [req, res] = makeReqRes({ email: 'noProfile@x.test', type: 'volunteer' });
    await getUserProfile(req, res);
    expect(res.json).toHaveBeenCalled();
    expect(res.json.mock.calls[0][0]).toHaveProperty('userType', 'volunteer');
  });

  it('returns admin profile when admin exists', async () => {
    mockDb.query
      .mockResolvedValueOnce({ rows: [{ user_id: 101, user_type: 'admin' }] }) // user lookup
      .mockResolvedValueOnce({ rows: [{ admin_id: 500, user_email: 'a@x', full_name: 'Admin' }] }); // adminprofile select

    const [req, res] = makeReqRes({ email: 'admin@x', type: 'admin' });
    await getUserProfile(req, res);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ userType: 'admin' }));
  });
});
