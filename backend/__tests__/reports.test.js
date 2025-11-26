//reports.test.js
const request = require('supertest');
const app = require('../app');
const pool = require('../db');

jest.mock('../db');

describe("Reports API Routes", () => {

  beforeEach(() => jest.resetAllMocks());


  //Volunteer Participation
  test("GET /api/reports/volunteer-participation returns rows", async () => {
    pool.query.mockResolvedValueOnce({ rows: [
      { volunteer_id: 1, full_name: "A", email: "a@x.com", city: "X", state_code: "TX",
        total_events: "2", skills: ["S1"], events_worked: ["Event 1"] }
    ]});

    const res = await request(app).get("/api/reports/volunteer-participation");
    expect(res.statusCode).toBe(200);
    expect(res.body[0].volunteer_id).toBe(1);
  });


  //Event Volunteers
  test("GET /api/reports/event-volunteers returns rows", async () => {
    pool.query.mockResolvedValueOnce({ rows: [
      { event_id: 10, event_name: "E", event_location: "Houston", user_id: 4,
        volunteer_profile_id: 4, full_name: "John", email: "j@x.com",
        volunteer_city: "Houston", skills: ["SkillA"], signup_date: "2025-01-01" }
    ]});

    const res = await request(app).get("/api/reports/event-volunteers");
    expect(res.statusCode).toBe(200);
    expect(res.body[0].event_id).toBe(10);
  });


  //Event Management
  test("GET /api/reports/event-management returns rows", async () => {
    pool.query.mockResolvedValueOnce({ rows: [
      { event_id: 10, event_name: "E", total_volunteers: "4", required_skills: ["S1"] }
    ]});

    const res = await request(app).get("/api/reports/event-management");
    expect(res.statusCode).toBe(200);
    expect(res.body[0].total_volunteers).toBe(4);
  });


  //Skills (All)
  test("GET /api/reports/skills returns skills list", async () => {
    pool.query.mockResolvedValueOnce({ rows: [
      { skill_id: 1, skill_name: "Leadership" }
    ]});

    const res = await request(app).get("/api/reports/skills");

    expect(res.statusCode).toBe(200);
    expect(res.body[0].skill_name).toBe("Leadership");
  });


  //Skills (By eventId)
  test("GET /api/reports/skills/:eventId returns rows", async () => {
    pool.query.mockResolvedValueOnce({ rows: [
      { skill_id: 2, skill_name: "Cooking" }
    ]});

    const res = await request(app).get("/api/reports/skills/5");

    expect(res.statusCode).toBe(200);
    expect(res.body[0].skill_id).toBe(2);
  });

  //404 case (missing branch)
  test("GET unknown /api/reports returns 404", async () => {
    const res = await request(app).get("/api/reports/unknown-endpoint");
    expect(res.statusCode).toBe(404);
  });
});
