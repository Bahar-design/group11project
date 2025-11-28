const request = require("supertest");
const app = require("../app");
const pool = require("../db");

const reports = require('../controllers/reportsController');

jest.mock("../db");

describe("Reports Routes (routes/reports.js)", () => {

  beforeEach(() => {
    jest.clearAllMocks();
    process.env.NODE_ENV = "test";   // bypass requireAdmin()
  });

  // -------------------------------------------------------------------
  // 1. volunteer-participation
  // -------------------------------------------------------------------
  test("GET /api/reports/volunteer-participation hits route & passes filters", async () => {
    pool.query.mockResolvedValueOnce({ rows: [] });

    const res = await request(app)
      .get("/api/reports/volunteer-participation?volunteer=john&event=gala&location=katy&skillId=2");

    expect(res.statusCode).toBe(200);
    const sql = pool.query.mock.calls[0][0];

    expect(sql).toMatch(/vp\.full_name|ut\.user_email|EXISTS/);
  expect(sql).toMatch(/ed\.event_name/);
  // volunteer-participation location filter applies to volunteer profile (vp.city)
  expect(sql).toMatch(/LOWER\(vp\.city\)/i);
    expect(sql).toMatch(/s\.skill_id/);
  });

  test("volunteer-participation uses search fallback", async () => {
    pool.query.mockResolvedValueOnce({ rows: [] });

    await request(app)
      .get("/api/reports/volunteer-participation?search=johnny");

    const sql = pool.query.mock.calls[0][0];
    expect(sql).toMatch(/LOWER\(vp\.full_name\)/i);
  });

  // -------------------------------------------------------------------
  // 2. event-management
  // -------------------------------------------------------------------
  test("GET /api/reports/event-management builds all filters", async () => {
    pool.query.mockResolvedValueOnce({ rows: [] });

    await request(app)
      .get("/api/reports/event-management?event=gala&volunteer=mary&location=houston&skillId=3&startDate=2025-01-01&endDate=2025-02-01");

    const sql = pool.query.mock.calls[0][0];

    expect(sql).toMatch(/ed\.event_name/);
    expect(sql).toMatch(/EXISTS/);              // volunteer EXISTS branch
    expect(sql).toMatch(/ed\.location/);
    expect(sql).toMatch(/EXISTS/);              // skillId EXISTS branch
    expect(sql).toMatch(/ed\.event_date >=/);
    expect(sql).toMatch(/ed\.event_date <=/);
  });

  // -------------------------------------------------------------------
  // 3. event-volunteers
  // -------------------------------------------------------------------
  test("GET /api/reports/event-volunteers builds all filters", async () => {
    pool.query.mockResolvedValueOnce({ rows: [] });

    await request(app)
      .get("/api/reports/event-volunteers?event=gala&volunteer=bob&location=houston&skillId=4&startDate=2025-01-05&endDate=2025-02-02");

    const sql = pool.query.mock.calls[0][0];

    expect(sql).toMatch(/ed\.event_name/);
    expect(sql).toMatch(/LOWER\(COALESCE/);     // volunteer filter
    expect(sql).toMatch(/ed\.location/);
    expect(sql).toMatch(/EXISTS/);              // skillId EXISTS
    expect(sql).toMatch(/vh\.signup_date >=/);
    expect(sql).toMatch(/vh\.signup_date <=/);
  });

  test("event-volunteers uses search fallback", async () => {
    pool.query.mockResolvedValueOnce({ rows: [] });

    await request(app)
      .get("/api/reports/event-volunteers?search=amy");

    const sql = pool.query.mock.calls[0][0];
    expect(sql).toMatch(/COALESCE/);
  });

  // -------------------------------------------------------------------
  // 4. GET /skills
  // -------------------------------------------------------------------
  test("GET /api/reports/skills calls controller", async () => {
    pool.query.mockResolvedValueOnce({ rows: [] });
    const res = await request(app).get("/api/reports/skills");

    expect(res.statusCode).toBe(200);
    expect(pool.query).toHaveBeenCalled();
  });

  // -------------------------------------------------------------------
  // 5. GET /skills/:eventId
  // -------------------------------------------------------------------
  test("GET /api/reports/skills/:eventId calls controller", async () => {
    pool.query.mockResolvedValueOnce({ rows: [] });
    const res = await request(app).get("/api/reports/skills/44");

    expect(res.statusCode).toBe(200);
  });

  // -------------------------------------------------------------------
  // 6. GET /locations
  // -------------------------------------------------------------------
  test("GET /api/reports/locations returns array", async () => {
    pool.query.mockResolvedValueOnce({ rows: [{ location: "Houston" }] });

    const res = await request(app).get("/api/reports/locations");

    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual(["Houston"]);
  });

  // -------------------------------------------------------------------
  // 7. requireAdmin — current behavior: GET requests are allowed in production
  // -------------------------------------------------------------------
  test("requireAdmin allows GET in production (middleware permits read-only)", async () => {
    process.env.NODE_ENV = "production";
    // ensure the route's DB call is mocked so the request completes successfully
    pool.query.mockResolvedValueOnce({ rows: [] });

    const res = await request(app)
      .get("/api/reports/volunteer-participation")
      .set('Origin', 'http://localhost:5173');

    expect(res.statusCode).toBe(200);
  });

  // -------------------------------------------------------------------
  // 8. requireAdmin — allows admin header
  // -------------------------------------------------------------------
  test("requireAdmin allows admin via header in production", async () => {
    process.env.NODE_ENV = "production";
    pool.query.mockResolvedValueOnce({ rows: [] });

    const res = await request(app)
      .get("/api/reports/event-management")
      .set("x-user-type", "admin");

    expect(res.statusCode).toBe(200);
  });

  test("requireAdmin accepts lowercase x-usertype header in production", async () => {
    process.env.NODE_ENV = "production";
    pool.query.mockResolvedValueOnce({ rows: [] });

    const res = await request(app)
      .get("/api/reports/event-management")
      .set("x-usertype", "admin");

    expect(res.statusCode).toBe(200);
  });

  // -------------------------------------------------------------------
  // 9. requireAdmin — allows GET automatically
  // -------------------------------------------------------------------
  test("requireAdmin auto-allows GET requests", async () => {
    process.env.NODE_ENV = "production";
    pool.query.mockResolvedValueOnce({ rows: [] });

    const res = await request(app)
      .get("/api/reports/skills");

    expect(res.statusCode).toBe(200);
  });

  // -------------------------------------------------------------------
  // 10. requireAdmin — allows when req.user.userType is admin
  // -------------------------------------------------------------------
  test("requireAdmin allows admin via req.user", async () => {
    process.env.NODE_ENV = "production";

    // inject a fake middleware BEFORE reports
    const fakeApp = require("express")();
    fakeApp.use((req, _res, next) => {
      req.user = { userType: "admin" };
      next();
    });
    fakeApp.use("/api/reports", require("../routes/reports"));

    pool.query.mockResolvedValueOnce({ rows: [] });

    const res = await request(fakeApp)
      .get("/api/reports/locations");

    expect(res.statusCode).toBe(200);
  });

  test("requireAdmin returns 403 for non-GET in production (no admin)", async () => {
    process.env.NODE_ENV = "production";
    // extract the requireAdmin middleware from the router stack
    const reportsRouter = require('../routes/reports');
    const layer = reportsRouter.stack.find(l => l.route && l.route.path === '/volunteer-participation');
    const requireAdmin = layer.route.stack[0].handle;

    const fakeApp = require('express')();
    // mount the middleware on a POST path to exercise non-GET branch
    fakeApp.post('/test-no-admin', requireAdmin, (_req, res) => res.sendStatus(200));

    const res = await request(fakeApp).post('/test-no-admin');
    expect(res.statusCode).toBe(403);
  });

  test("requireAdmin allows non-GET when req.user.userType is admin", async () => {
    process.env.NODE_ENV = "production";
    const reportsRouter = require('../routes/reports');
    const layer = reportsRouter.stack.find(l => l.route && l.route.path === '/volunteer-participation');
    const requireAdmin = layer.route.stack[0].handle;

    const fakeApp = require('express')();
    fakeApp.use((req, _res, next) => { req.user = { userType: 'admin' }; next(); });
    fakeApp.post('/test-user-admin', requireAdmin, (_req, res) => res.sendStatus(200));

    const res = await request(fakeApp).post('/test-user-admin');
    expect(res.statusCode).toBe(200);
  });

  test("requireAdmin allows non-GET when x-user-type header is admin", async () => {
    process.env.NODE_ENV = "production";
    const reportsRouter = require('../routes/reports');
    const layer = reportsRouter.stack.find(l => l.route && l.route.path === '/volunteer-participation');
    const requireAdmin = layer.route.stack[0].handle;

    const fakeApp = require('express')();
    fakeApp.post('/test-header-admin', requireAdmin, (_req, res) => res.sendStatus(200));

    const res = await request(fakeApp).post('/test-header-admin').set('x-user-type', 'admin');
    expect(res.statusCode).toBe(200);
  });

});

describe("buildFilterClauses – branch coverage", () => {

  beforeEach(() => jest.clearAllMocks());

  test("empty filters produces no WHERE clause", async () => {
    pool.query.mockResolvedValueOnce({ rows: [] });

    await reports.getVolunteerParticipation({});

    const sql = pool.query.mock.calls[0][0];
    // Should NOT insert WHERE because no filters applied
    expect(sql).not.toMatch(/WHERE/i);
  });

  test("location=all skips location filter branch", async () => {
    pool.query.mockResolvedValueOnce({ rows: [] });

    await reports.getVolunteerParticipation({ location: "all" });

    const sql = pool.query.mock.calls[0][0];
  // ensure WHERE does not filter by volunteer city when location=all
  expect(sql).not.toMatch(/LOWER\(vp\.city\)/i);
  });

  test("skillId non-numeric triggers alternate branch", async () => {
    pool.query.mockResolvedValueOnce({ rows: [] });

    await reports.getVolunteerParticipation({ skillId: "abc" });

    const sql = pool.query.mock.calls[0][0];
    // volunteer-participation uses s.skill_id = $n in fallback branch
    expect(sql).toMatch(/s\.skill_id\s*=/i);
  });

  test("event-management: no date filters triggers no event_date branch", async () => {
    pool.query.mockResolvedValueOnce({ rows: [] });

    await reports.getEventManagement({});

    const sql = pool.query.mock.calls[0][0];
    expect(sql).not.toMatch(/event_date >=/i);
    expect(sql).not.toMatch(/event_date <=/i);
  });

  test("event-management: both startDate + endDate", async () => {
    pool.query.mockResolvedValueOnce({ rows: [] });

    await reports.getEventManagement({
      startDate: "2025-01-01",
      endDate: "2025-02-01"
    });

    const sql = pool.query.mock.calls[0][0];
    expect(sql).toMatch(/event_date >=/i);
    expect(sql).toMatch(/event_date <=/i);
  });

  test("event-volunteers: missing volunteer triggers branch where only event/date used", async () => {
    pool.query.mockResolvedValueOnce({ rows: [] });

    await reports.getEventVolunteerAssignments({
      event: "gala"
    });

    const sql = pool.query.mock.calls[0][0];
    expect(sql).toMatch(/LOWER\(ed\.event_name\)/i);
  });

  test("event-volunteers: no startDate/endDate triggers signup_date branches skipped", async () => {
    pool.query.mockResolvedValueOnce({ rows: [] });

    await reports.getEventVolunteerAssignments({});

    const sql = pool.query.mock.calls[0][0];
    expect(sql).not.toMatch(/signup_date >=/i);
    expect(sql).not.toMatch(/signup_date <=/i);
  });

  test("default reportType branch (blank string) triggers vp.full_name filter", async () => {
    pool.query.mockResolvedValueOnce({ rows: [] });

    // simulate caller passing reportType = '' (default)
    await reports.getVolunteerParticipation({ volunteer: "sam" });

    const sql = pool.query.mock.calls[0][0];
    expect(sql).toMatch(/vp\.full_name/i);
  });

});

