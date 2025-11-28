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

    const sql = pool.query.mock.calls[0][0];
    expect(sql).toMatch(/WHERE/i);
    expect(sql).toMatch(/LOWER\(vp\.full_name\)/i);
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

    const sql = pool.query.mock.calls[0][0];
    expect(sql).toMatch(/WHERE/i);
    expect(sql).toMatch(/LOWER\(ed\.event_name\)/i);
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

    const sql = pool.query.mock.calls[0][0];
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
