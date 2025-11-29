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


  //getVolunteerHistory DB error (direct)
  test("getVolunteerHistory returns 500 on DB error", async () => {
    pool.query.mockRejectedValueOnce(new Error("DB fail"));

    const [req, res] = mockReqRes();
    await vh.getVolunteerHistory(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
  });


  //getVolunteerHistoryByVolunteer: FIRST QUERY successful 
  test("getVolunteerHistoryByVolunteer returns rows without fallback", async () => {
    // 1) main select from volunteer_history JOIN eventdetails
    pool.query
      .mockResolvedValueOnce({ rows: [{ history_id: 1, volunteer_id: 5, event_skill_ids: [1,2] }] }) // main select
      // 2) volunteer_skills select
      .mockResolvedValueOnce({ rows: [{ skill_id: 2 }] })
      // 3) skills select for matched ids
      .mockResolvedValueOnce({ rows: [{ skill_id: 2, skill_name: 'CPR' }] })
      // 4) volunteerprofile fetch for full name
      .mockResolvedValueOnce({ rows: [{ full_name: 'Test V' }] });

    const [req, res] = mockReqRes({ params: { volunteer_id: "5" } });
    await vh.getVolunteerHistoryByVolunteer(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    // check shape: object with rows and volunteer_full_name
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      rows: expect.any(Array),
      volunteer_full_name: 'Test V'
    }));
  });


  //createVolunteerRecord: branch where volunteer_id missing but user_id exists
  test("createVolunteerRecord uses user_id fallback", async () => {

    pool.query
      //duplicate check
      .mockResolvedValueOnce({ rows: [] })
      //insert record
      .mockResolvedValueOnce({ rows: [{ history_id: 123 }] })
      //eventdetails update
      .mockResolvedValueOnce({})
      //volunteer profile lookup
      .mockResolvedValueOnce({
        rows: [{ full_name: "Test V", user_email: "v@test.com" }]
      });

    const [req, res] = mockReqRes({
      body: { user_id: 7, event_id: 2 }  // NO volunteer_id
    });

    await vh.createVolunteerRecord(req, res);

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ history_id: 123 })
    );
  });


  //createVolunteerRecord: duplicate branch (409)
  test("createVolunteerRecord returns 409 for duplicate", async () => {
    pool.query.mockResolvedValueOnce({
      rows: [{ exists: true }]
    }); // existing rows → duplicate

    const [req, res] = mockReqRes({
      body: { volunteer_id: 2, event_id: 3 }
    });

    await vh.createVolunteerRecord(req, res);

    expect(res.status).toHaveBeenCalledWith(409);
  });


  //updateVolunteerRecord error branch
  test("updateVolunteerRecord returns 500 on DB error", async () => {
    pool.query.mockRejectedValueOnce(new Error("DB broke"));

    const [req, res] = mockReqRes({
      params: { id: "11" },
      body: { volunteer_id: 9 }
    });

    await vh.updateVolunteerRecord(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
  });

});
