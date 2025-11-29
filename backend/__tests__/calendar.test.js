const request = require("supertest");
const app = require("../app");
const pool = require("../db");

//Mock DB errors for error-path tests
jest.mock("../db", () => ({
  query: jest.fn()
}));

describe("Calendar API", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  //GET /api/calendar success
  it("GET /api/calendar returns all events", async () => {
    pool.query.mockResolvedValue({
      rows: [{ id: 1, event_name: "Test", event_date: "2025-01-01" }]
    });

    const res = await request(app).get("/api/calendar");

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  //GET /api/calendar fails (DB error)
  it("GET /api/calendar handles DB error", async () => {
    pool.query.mockRejectedValue(new Error("DB failure"));

    const res = await request(app).get("/api/calendar");

    expect(res.statusCode).toBe(500);
    expect(res.body.error).toMatch(/failed to fetch/i);
  });

  //POST /api/calendar success
  it("POST /api/calendar creates a new event", async () => {
    const newEvent = {
      event_name: "Community Meeting",
      description: "Discuss upcoming events",
      event_date: "2025-10-20",
      location: "Community Center",
      max_volunteers: 50
    };

    pool.query.mockResolvedValue({ rows: [newEvent] });

    const res = await request(app).post("/api/calendar").send(newEvent);

    expect(res.statusCode).toBe(201);
    expect(res.body.event_name).toBe("Community Meeting");
  });

  //POST missing fields (hits 400 path)
  it("POST /api/calendar fails when missing required fields", async () => {
    const res = await request(app)
      .post("/api/calendar")
      .send({ description: "bad event" });

    expect(res.statusCode).toBe(400);
    expect(res.body.error).toMatch(/required/i);
  });

  //POST DB error path
  it("POST /api/calendar handles DB error", async () => {
    pool.query.mockRejectedValue(new Error("Insert failed"));

    const event = {
      event_name: "Faulty Event",
      event_date: "2025-10-20",
      location: "Nowhere",
      description: "test",
      max_volunteers: 1
    };

    const res = await request(app).post("/api/calendar").send(event);

    expect(res.statusCode).toBe(500);
  });

  //PUT success
  it("PUT /api/calendar/:id updates event", async () => {
    pool.query.mockResolvedValue({
      rows: [{ id: 1, event_name: "Updated Name" }]
    });

    const res = await request(app)
      .put("/api/calendar/1")
      .send({ event_name: "Updated Name" });

    expect(res.statusCode).toBe(200);
    expect(res.body.event_name).toBe("Updated Name");
  });

  //PUT event not found (hits 404)
  it("PUT /api/calendar/:id handles event not found", async () => {
    pool.query.mockResolvedValue({ rows: [] });

    const res = await request(app)
      .put("/api/calendar/999")
      .send({ event_name: "Nothing" });

    expect(res.statusCode).toBe(404);
  });

  //DELETE success
  it("DELETE /api/calendar/:id deletes event", async () => {
    pool.query.mockResolvedValue({
      rows: [{ id: 1, event_name: "To Delete" }]
    });

    const res = await request(app).delete("/api/calendar/1");

    expect(res.statusCode).toBe(200);
    expect(res.body.event_name).toBe("To Delete");
  });

  //DELETE not found (hits 404)
  it("DELETE /api/calendar/:id handles not found", async () => {
    pool.query.mockResolvedValue({ rows: [] });

    const res = await request(app).delete("/api/calendar/999");

    expect(res.statusCode).toBe(404);
  });

  //POST /api/calendar/attend success
  it("POST /api/calendar/attend registers attendance", async () => {
    pool.query.mockResolvedValue({ rowCount: 1 });

    const res = await request(app)
      .post("/api/calendar/attend")
      .send({ volunteer_id: 1, event_id: 2 });

    expect(res.statusCode).toBe(201);
    expect(res.body.message).toMatch(/attending/i);
  });

  //POST attend missing fields (400 path)
  it("POST /api/calendar/attend fails when missing fields", async () => {
    const res = await request(app)
      .post("/api/calendar/attend")
      .send({ });

    expect(res.statusCode).toBe(400);
  });

  //POST attend duplicate (rowCount 0 path)
  it("POST /api/calendar/attend handles conflict (already attending)", async () => {
    pool.query.mockResolvedValue({ rowCount: 0 });

    const res = await request(app)
      .post("/api/calendar/attend")
      .send({ volunteer_id: 1, event_id: 2 });

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toMatch(/already/i);
  });

  //POST attend DB error path
  it("POST /api/calendar/attend handles DB error", async () => {
    pool.query.mockRejectedValue(new Error("DB error"));

    const res = await request(app)
      .post("/api/calendar/attend")
      .send({ volunteer_id: 1, event_id: 2 });

    expect(res.statusCode).toBe(500);
  });
});
