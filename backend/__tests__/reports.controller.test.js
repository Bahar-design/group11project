// __tests__/reportsController.test.js
const reports = require("../controllers/reportsController");
const pool = require("../db");

jest.mock("../db");

describe("reportsController", () => {
  beforeEach(() => jest.clearAllMocks());


  //getVolunteerParticipation()
  test("getVolunteerParticipation returns mapped fields correctly", async () => {
    pool.query.mockResolvedValueOnce({
      rows: [
        {
          volunteer_id: 1,
          full_name: "John Doe",
          email: "john@email.com",
          city: "Houston",
          state_code: "TX",
          skills: ["CPR", "Leadership"],
          events_worked: ["Gala", "Food Drive"],
          total_events: "3"
        }
      ]
    });

    const res = await reports.getVolunteerParticipation({});


    expect(pool.query).toHaveBeenCalled();

    //Correct mapping
    expect(res[0].total_events).toBe(3);
    expect(Array.isArray(res[0].skills)).toBe(true);
    expect(Array.isArray(res[0].events_worked)).toBe(true);
  });

  test("getVolunteerParticipation builds WHERE clause for volunteer filter", async () => {
    pool.query.mockResolvedValueOnce({ rows: [] });
    await reports.getVolunteerParticipation({ volunteer: "john" });

    const last = pool.query.mock.calls[pool.query.mock.calls.length - 1];
    const sql = last ? last[0] : '';
    expect(sql).toMatch(/WHERE/i);
    // Accept either direct vp.full_name match or user_email or an EXISTS(...) subquery
    expect(sql).toMatch(/LOWER\(vp\.full_name\)|LOWER\(ut\.user_email\)|EXISTS\s*\(/i);
  });


  //getEventVolunteerAssignments()
  test("getEventVolunteerAssignments formats fields correctly", async () => {
    pool.query.mockResolvedValueOnce({
      rows: [
        {
          event_id: 10,
          event_name: "Food Bank",
          event_location: "Houston",
          event_date: "2025-02-01",
          volunteer_profile_id: 3,
          user_id: 3,
          full_name: "Alice",
          email: "alice@email.com",
          volunteer_city: "Katy",
          skills: ["Cooking"],
          signup_date: "2025-01-20"
        }
      ]
    });

    const res = await reports.getEventVolunteerAssignments({});

    expect(res[0].event_date).toBe("2025-02-01");
    expect(res[0].signup_date).toBe("2025-01-20");
    expect(Array.isArray(res[0].skills)).toBe(true);
  });

  test("getEventVolunteerAssignments builds WHERE clause for event filter", async () => {
    pool.query.mockResolvedValueOnce({ rows: [] });
    await reports.getEventVolunteerAssignments({ event: "gala" });

    const last = pool.query.mock.calls[pool.query.mock.calls.length - 1];
    const sql = last ? last[0] : '';
    expect(sql).toMatch(/WHERE/i);
    // Accept either direct event_name match or EXISTS subquery (for volunteer participation queries)
    expect(sql).toMatch(/LOWER\(ed\.event_name\)|EXISTS\s*\(/i);
  });


  //getEventManagement()
  test("getEventManagement maps totals & skills", async () => {
    pool.query.mockResolvedValueOnce({
      rows: [
        {
          event_id: 5,
          event_name: "Gala",
          description: "Big event",
          location: "Houston",
          event_date: "2025-03-05",
          urgency: 3,
          total_volunteers: "7",
          required_skills: ["CPR"],
          volunteers: ["John", "Mary"]
        }
      ]
    });

    const res = await reports.getEventManagement({});

    expect(res[0].total_volunteers).toBe(7);
    expect(res[0].required_skills).toEqual(["CPR"]);
    expect(res[0].urgency).toBe("High");
    expect(res[0].event_date).toBe("2025-03-05");
  });

  test("getEventManagement builds WHERE clause for date filter", async () => {
    pool.query.mockResolvedValueOnce({ rows: [] });

    await reports.getEventManagement({ date: "2025-01-01" });
    const last = pool.query.mock.calls[pool.query.mock.calls.length - 1];
    const sql = last ? last[0] : '';
    expect(sql).toMatch(/event_date/i);
    expect(sql).toMatch(/WHERE/i);
  });


  //getSkills()
  test("getSkills returns all skills", async () => {
    pool.query.mockResolvedValueOnce({
      rows: [{ skill_id: 1, skill_name: "CPR" }]
    });

    const res = await reports.getSkills();

    expect(pool.query).toHaveBeenCalled();
    expect(res[0].skill_name).toBe("CPR");
  });

  test("getSkills filters by eventId when provided", async () => {
    pool.query.mockResolvedValueOnce({ rows: [] });

    await reports.getSkills(10);

    const sql = pool.query.mock.calls[0][0];
    expect(sql).toMatch(/WHERE es\.event_id/i);
  });

  test("event-management: volunteer filter uses EXISTS volunteer_history subquery", async () => {
    pool.query.mockResolvedValueOnce({ rows: [] });

    await reports.getEventManagement({ volunteer: 'mary' });

    const last = pool.query.mock.calls[pool.query.mock.calls.length - 1];
    const sql = last ? last[0] : '';
    expect(sql).toMatch(/EXISTS\s*\(SELECT 1 FROM volunteer_history vh2/i);
  });

  test("event-volunteers: volunteer filter uses COALESCE volunteer name/email", async () => {
    pool.query.mockResolvedValueOnce({ rows: [] });

    await reports.getEventVolunteerAssignments({ volunteer: 'amy' });

    const last = pool.query.mock.calls[pool.query.mock.calls.length - 1];
    const sql = last ? last[0] : '';
    expect(sql).toMatch(/LOWER\(COALESCE\(vp\.full_name, ut\.user_email\)\)/i);
  });

  test("volunteer-participation: event filter builds EXISTS event_history subquery", async () => {
    pool.query.mockResolvedValueOnce({ rows: [] });

    await reports.getVolunteerParticipation({ event: 'gala' });

    const last = pool.query.mock.calls[pool.query.mock.calls.length - 1];
    const sql = last ? last[0] : '';
    expect(sql).toMatch(/EXISTS\s*\(SELECT 1 FROM volunteer_history vh2 JOIN eventdetails ed2/i);
  });

  test("event-management: startDate and endDate add event_date clauses", async () => {
    pool.query.mockResolvedValueOnce({ rows: [] });

    await reports.getEventManagement({ startDate: '2025-01-01', endDate: '2025-01-31' });

    const last = pool.query.mock.calls[pool.query.mock.calls.length - 1];
    const sql = last ? last[0] : '';
    expect(sql).toMatch(/ed\.event_date >=/i);
    expect(sql).toMatch(/ed\.event_date <=/i);
  });

  test("volunteer-participation: non-empty location applies vp.city filter", async () => {
    pool.query.mockResolvedValueOnce({ rows: [] });

    await reports.getVolunteerParticipation({ location: 'Houston' });

    const last = pool.query.mock.calls[pool.query.mock.calls.length - 1];
    const sql = last ? last[0] : '';
    expect(sql).toMatch(/LOWER\(vp\.city\)/i);
  });
});
  test("filter: volunteer only", async () => {
    pool.query.mockResolvedValueOnce({ rows: [] });

    await reports.getVolunteerParticipation({ volunteer: "john" });

  const lastCall = pool.query.mock.calls[pool.query.mock.calls.length - 1];
  const sql = lastCall ? lastCall[0] : '';
  expect(sql).toMatch(/LOWER\(vp\.full_name\)/i);
  });


  test("filter: event only", async () => {
    pool.query.mockResolvedValueOnce({ rows: [] });

    await reports.getEventManagement({ event: "cleanup" });

  const lastCall2 = pool.query.mock.calls[pool.query.mock.calls.length - 1];
  const sql2 = lastCall2 ? lastCall2[0] : '';
  expect(sql2).toMatch(/LOWER\(ed\.event_name\)/i);
  });


  test("skillId non-numeric in volunteer-participation uses volunteer skills branch (s.skill_id)", async () => {
    pool.query.mockResolvedValueOnce({ rows: [] });

    await reports.getVolunteerParticipation({ skillId: 'abc' });

    const last = pool.query.mock.calls[pool.query.mock.calls.length - 1];
    const sql = last ? last[0] : '';
    expect(sql).toMatch(/s\.skill_id\s*=\s*\$/i);
  });

  test("skillId numeric in event-management uses event_skills EXISTS branch", async () => {
    pool.query.mockResolvedValueOnce({ rows: [] });

    await reports.getEventManagement({ skillId: '4' });

    const last = pool.query.mock.calls[pool.query.mock.calls.length - 1];
    const sql = last ? last[0] : '';
    expect(sql).toMatch(/EXISTS\s*\(SELECT 1 FROM event_skills/i);
  });

  test("location='all' skips location filter for volunteer-participation", async () => {
    pool.query.mockResolvedValueOnce({ rows: [] });

    await reports.getVolunteerParticipation({ location: 'all' });

    const last = pool.query.mock.calls[pool.query.mock.calls.length - 1];
    const sql = last ? last[0] : '';
    expect(sql).not.toMatch(/LOWER\(vp\.city\)/i);
  });

  test("event-volunteers startDate/endDate produce signup_date clauses", async () => {
    pool.query.mockResolvedValueOnce({ rows: [] });

    await reports.getEventVolunteerAssignments({ startDate: '2025-01-01', endDate: '2025-02-01' });

    const last = pool.query.mock.calls[pool.query.mock.calls.length - 1];
    const sql = last ? last[0] : '';
    expect(sql).toMatch(/vh\.signup_date >=/i);
    expect(sql).toMatch(/vh\.signup_date <=/i);
  });

  test("getLocations returns array of strings", async () => {
    pool.query.mockResolvedValueOnce({ rows: [{ location: 'Austin' }, { location: 'Katy' }] });

    const res = await reports.getLocations();
    expect(Array.isArray(res)).toBe(true);
    expect(res).toEqual(['Austin', 'Katy']);
  });

  test("buildFilterClauses default branch for volunteer (no reportType)", () => {
    // Load the controller source, replace the db require with a dummy pool to avoid side effects,
    // then evaluate only the buildFilterClauses function so we can test the default branch.
    const fs = require('fs');
    const path = require('path');

    const srcPath = path.resolve(__dirname, '../controllers/reportsController.js');
    let src = fs.readFileSync(srcPath, 'utf8');
    // replace the top-level require('../db') with a dummy pool so require won't fail
    src = src.replace("const pool = require('../db');", "const pool = { query: () => ({ rows: [] }) }; ");

    // extract the buildFilterClauses function text
    const fnMatch = src.match(/function buildFilterClauses\([\s\S]*?\n}\n/);
    expect(fnMatch).toBeTruthy();
    // eslint-disable-next-line no-eval
    const buildFilterClauses = eval('(' + fnMatch[0] + ')');

    const params = [];
    const sql = buildFilterClauses({ volunteer: 'Bob' }, params, '');
    expect(sql).toMatch(/LOWER\(vp\.full_name\)/i);
  });

  test("event-volunteers: date equality produces vh.signup_date = clause", async () => {
    pool.query.mockResolvedValueOnce({ rows: [] });

    await reports.getEventVolunteerAssignments({ date: '2025-01-05' });

    const last = pool.query.mock.calls[pool.query.mock.calls.length - 1];
    const sql = last ? last[0] : '';
    expect(sql).toMatch(/vh\.signup_date\s*=\s*\$/i);
  });
