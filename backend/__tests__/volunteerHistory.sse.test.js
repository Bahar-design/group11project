jest.mock('../db', () => ({
  query: jest.fn()
}));

jest.mock('../utils/sse', () => ({
  broadcast: jest.fn()
}));

const pool = require('../db');
const { broadcast } = require('../utils/sse');
const vh = require('../controllers/volunteerHistory');

function mockReqRes({ params = {}, body = {} } = {}) {
  const req = { params, body };
  const res = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis()
  };
  return [req, res];
}

describe('SSE enrichment on createVolunteerRecord', () => {
  beforeEach(() => jest.resetAllMocks());

  test('createVolunteerRecord broadcasts enriched object', async () => {
    // Use a implementation that returns different rows depending on SQL text so order doesn't matter
    pool.query.mockImplementation((text, params) => {
      if (text.includes('SELECT 1 FROM volunteer_history')) {
        return Promise.resolve({ rows: [] });
      }
      if (text.includes('INSERT INTO volunteer_history')) {
        return Promise.resolve({ rows: [{ history_id: 999, volunteer_id: 10, event_id: 55, signup_date: '2025-11-29' }] });
      }
      if (text.trim().startsWith('UPDATE eventdetails')) {
        return Promise.resolve({});
      }
      if (text.includes('FROM volunteerprofile vp JOIN user_table')) {
        return Promise.resolve({ rows: [{ full_name: 'Tester', user_email: 't@test.com' }] });
      }
      if (text.includes('FROM eventdetails WHERE event_id')) {
        return Promise.resolve({ rows: [{ event_id: 55, event_name: 'Food Drive', description: 'Help', location: 'Park', event_skill_ids: [1,2], urgency: 'HIGH', event_date: '2025-12-01' }] });
      }
      if (text.includes('FROM volunteer_skills')) {
        return Promise.resolve({ rows: [{ skill_id: 2 }] });
      }
      if (text.includes('FROM skills')) {
        return Promise.resolve({ rows: [{ skill_id: 2, skill_name: 'CPR' }] });
      }
      if (text.includes('SELECT full_name FROM volunteerprofile WHERE user_id')) {
        return Promise.resolve({ rows: [{ full_name: 'Tester' }] });
      }
      return Promise.resolve({ rows: [] });
    });

    const [req, res] = mockReqRes({ body: { user_id: 10, event_id: 55 } });

    await vh.createVolunteerRecord(req, res);

    // HTTP response still returns the insert row
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ history_id: 999 }));

    // broadcast should have been called with enriched object containing matched_skills and volunteer name
    expect(broadcast).toHaveBeenCalledTimes(1);
    const arg = broadcast.mock.calls[0][0];
    expect(arg).toEqual(expect.objectContaining({
      history_id: 999,
      event_id: 55,
      matched_skills: expect.any(Array),
      volunteer_full_name: 'Tester'
    }));
    expect(arg.matched_skills).toContain('CPR');
  });
});
