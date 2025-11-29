jest.mock('../db', () => ({
  query: jest.fn()
}));

jest.mock('../utils/sse', () => ({
  broadcast: jest.fn()
}));

const pool = require('../db');
const vh = require('../controllers/volunteerHistory');

// Helper
function mockReqRes({ params = {}, body = {} } = {}) {
  const req = { params, body };
  const res = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis()
  };
  return [req, res];
}

describe("volunteerHistory controller unit tests", () => {
  beforeEach(() => jest.resetAllMocks());

  //getVolunteerHistory
  test("getVolunteerHistory returns 500 on DB error", async () => {
    pool.query.mockRejectedValueOnce(new Error("DB fail"));
    const [req, res] = mockReqRes();
    await vh.getVolunteerHistory(req, res);
    expect(res.status).toHaveBeenCalledWith(500);
  });

  test("getVolunteerHistory returns 200 with rows", async () => {
    pool.query.mockResolvedValueOnce({ rows: [{ history_id: 1 }] });
    const [req, res] = mockReqRes();
    await vh.getVolunteerHistory(req, res);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith([{ history_id: 1 }]);
  });

  //getVolunteerHistoryByVolunteer
  test("getVolunteerHistoryByVolunteer missing param → 400", async () => {
    const [req, res] = mockReqRes();
    await vh.getVolunteerHistoryByVolunteer(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  test("getVolunteerHistoryByVolunteer uses fallback when first query returns empty", async () => {
    pool.query
      .mockResolvedValueOnce({ rows: [] })                  // first query empty
      .mockResolvedValueOnce({ rows: [{ history_id: 77, event_skill_ids: [] }] })  // fallback rows
      .mockResolvedValueOnce({ rows: [] })                 // volunteer_skills → empty
      .mockResolvedValueOnce({ rows: [] });                // skills lookup → empty

    const [req, res] = mockReqRes({ params: { volunteer_id: "5" } });
    await vh.getVolunteerHistoryByVolunteer(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith([
      expect.objectContaining({ history_id: 77 })
    ]);
  });

  test("getVolunteerHistoryByVolunteer returns 500 on DB error", async () => {
    pool.query.mockRejectedValueOnce(new Error("bad"));
    const [req, res] = mockReqRes({ params: { volunteer_id: "9" } });
    await vh.getVolunteerHistoryByVolunteer(req, res);
    expect(res.status).toHaveBeenCalledWith(500);
  });

  //createVolunteerRecord
  test("createVolunteerRecord missing event_id → 400", async () => {
    const [req, res] = mockReqRes({
      body: { volunteer_id: 1 } // no event_id
    });
    await vh.createVolunteerRecord(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  test("createVolunteerRecord missing volunteer_id but has user_id → fallback", async () => {
    pool.query
      .mockResolvedValueOnce({ rows: [] }) // duplicate check
      .mockResolvedValueOnce({ rows: [{ history_id: 11 }] }) // insert
      .mockResolvedValueOnce({ rows: [] }) // update eventdetails
      .mockResolvedValueOnce({ rows: [{ full_name: "Test V", user_email: "v@test.com" }] }) // volunteer lookup
      .mockResolvedValueOnce({ rows: [{ event_name: "EventX", location: "Loc", event_date: new Date() }] }) // event details
      .mockResolvedValueOnce({ rows: [{ user_email: "admin@test.com" }] }) // admins
      .mockResolvedValueOnce({ rows: [] }) // notify admin
      .mockResolvedValueOnce({ rows: [] }); // notify volunteer

    const [req, res] = mockReqRes({
      body: { user_id: 5, event_id: 10 }
    });

    await vh.createVolunteerRecord(req, res);

    expect(res.status).toHaveBeenCalledWith(201);
  });

  test("createVolunteerRecord duplicate → 409", async () => {
    pool.query.mockResolvedValueOnce({ rows: [{}] });
    const [req, res] = mockReqRes({
      body: { volunteer_id: 2, event_id: 9 }
    });
    await vh.createVolunteerRecord(req, res);
    expect(res.status).toHaveBeenCalledWith(409);
  });

  test("createVolunteerRecord DB error → 500", async () => {
    pool.query.mockRejectedValueOnce(new Error("broken"));
    const [req, res] = mockReqRes({
      body: { volunteer_id: 3, event_id: 9 }
    });
    await vh.createVolunteerRecord(req, res);
    expect(res.status).toHaveBeenCalledWith(500);
  });


  //updateVolunteerRecord
  test("updateVolunteerRecord returns 404 if no rows", async () => {
    pool.query.mockResolvedValueOnce({ rows: [] });
    const [req, res] = mockReqRes({
      params: { id: "5" },
      body: {}
    });
    await vh.updateVolunteerRecord(req, res);
    expect(res.status).toHaveBeenCalledWith(404);
  });

  test("updateVolunteerRecord returns 200 on success", async () => {
    pool.query.mockResolvedValueOnce({ rows: [{ history_id: 10 }] });
    const [req, res] = mockReqRes({
      params: { id: "10" },
      body: {}
    });
    await vh.updateVolunteerRecord(req, res);
    expect(res.status).toHaveBeenCalledWith(200);
  });


  //deleteVolunteerRecord
  test("deleteVolunteerRecord returns 404 if not found", async () => {
    pool.query.mockResolvedValueOnce({ rows: [] });
    const [req, res] = mockReqRes({ params: { id: "99" } });
    await vh.deleteVolunteerRecord(req, res);
    expect(res.status).toHaveBeenCalledWith(404);
  });

  test("deleteVolunteerRecord success", async () => {
    pool.query.mockResolvedValueOnce({ rows: [{ history_id: 5 }] });
    const [req, res] = mockReqRes({ params: { id: "5" } });
    await vh.deleteVolunteerRecord(req, res);
    expect(res.status).toHaveBeenCalledWith(200);
  });

  test("deleteVolunteerRecord DB error → 500", async () => {
    pool.query.mockRejectedValueOnce(new Error("broken"));
    const [req, res] = mockReqRes({ params: { id: "7" } });
    await vh.deleteVolunteerRecord(req, res);
    expect(res.status).toHaveBeenCalledWith(500);
  });
});
