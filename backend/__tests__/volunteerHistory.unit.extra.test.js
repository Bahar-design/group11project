const { getVolunteerHistoryByVolunteer, createVolunteerRecord } = require('../controllers/volunteerHistory');
const db = require('../db');
const sse = require('../utils/sse');

// Mock req/res
function mockReq(params = {}, body = {}) {
  return { params, body };
}

function mockRes() {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
}

describe('volunteerHistory controller extra', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    sse.clients.clear();
  });

  test('getVolunteerHistoryByVolunteer uses fallback when primary query fails', async () => {
    // simulate first query throwing, second query returning rows
    const q = db.query = jest.fn()
      .mockImplementationOnce(() => { throw new Error('Primary query failed'); })
      .mockResolvedValueOnce({ rows: [{ history_id: 1, volunteer_id: 1, event_id: 2 }] })
      .mockResolvedValue({ rows: [] });

    const req = mockReq({ volunteer_id: '1' });
    const res = mockRes();
    await getVolunteerHistoryByVolunteer(req, res);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalled();
  });

  test('createVolunteerRecord inserts and causes broadcast', async () => {
    // mock insert and related queries
    const nowRow = { history_id: 99, volunteer_id: 5, event_id: 7, signup_date: new Date().toISOString() };
    db.query = jest.fn()
      // existing check
      .mockResolvedValueOnce({ rows: [] })
      // insert
      .mockResolvedValueOnce({ rows: [nowRow] })
      // update event volunteers
      .mockResolvedValueOnce({})
      // event details fetch
      .mockResolvedValueOnce({ rows: [{ event_id: 7, event_name: 'E', skill_id: [], urgency: 'low', event_date: null, description: '', location: '' }] })
      // volunteer_skills
      .mockResolvedValueOnce({ rows: [] })
      // skills
      .mockResolvedValueOnce({ rows: [] })
      // volunteer profile
      .mockResolvedValueOnce({ rows: [{ full_name: 'Tester' }] });

    const req = mockReq({}, { volunteer_id: 5, event_id: 7 });
    const res = mockRes();

    await createVolunteerRecord(req, res);

    expect(res.status).toHaveBeenCalledWith(201);
    // last broadcast should be set
    expect(sse.getLastBroadcast()).toBeTruthy();
  });
});
