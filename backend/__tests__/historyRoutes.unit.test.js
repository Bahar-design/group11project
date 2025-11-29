/**
 * High-coverage tests for historyRoutes.js
 */

const request = require("supertest");
const express = require("express");

jest.mock("../utils/sse", () => {
  const clients = new Set();
  let last = null;

  return {
    clients,
    broadcast: jest.fn((payload) => { last = payload; }),
    getLastBroadcast: jest.fn(() => last),
  };
});

jest.mock("../controllers/volunteerHistory", () => ({
  getVolunteerHistory: jest.fn((req, res) =>
    res.status(200).json({ ok: true })
  ),

  getVolunteerHistoryByVolunteer: jest.fn((req, res) =>
    res.status(200).json({ id: req.params.volunteer_id })
  ),

  createVolunteerRecord: jest.fn((req, res) =>
    res.status(201).json({ created: true })
  ),

  updateVolunteerRecord: jest.fn((req, res) =>
    res.status(200).json({ updated: req.params.id })
  ),

  deleteVolunteerRecord: jest.fn((req, res) =>
    res.status(200).json({ deleted: req.params.id })
  ),
}));

const historyRoutes = require("../routes/historyRoutes");
const sse = require("../utils/sse");

describe("historyRoutes.js — HIGH COVERAGE", () => {
  let app;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use("/api/volunteer-history", historyRoutes);
    sse.clients.clear();
    jest.clearAllMocks();
  });

  // --------------------------------------------------
  // 1) SSE — TEST CLOSE
  // --------------------------------------------------
  test("GET /stream — sets SSE headers and closes when x-test-sse-close is set", async () => {
    const res = await request(app)
      .get("/api/volunteer-history/stream")
      .set("x-test-sse-close", "1");

    expect(res.status).toBe(200);
    expect(res.header["content-type"]).toContain("text/event-stream");
    expect(sse.clients.size).toBe(0);
  });

  // --------------------------------------------------
  // 2) SSE normal open + cleanup on close
  // --------------------------------------------------
  test("GET /stream — registers client & removes on close", async () => {
    const server = app.listen();

    const req = request(server).get(
      "/api/volunteer-history/stream"
    );

    const res = await req;

    expect(res.status).toBe(200);
    expect(sse.clients.size).toBe(1);

    // simulate "close" event on SSE client
    const client = [...sse.clients][0];
    client.res.emit("close");

    expect(sse.clients.size).toBe(0);
    server.close();
  });

  // --------------------------------------------------
  // 3) GET /debug/last-broadcast — success
  // --------------------------------------------------
  test("GET /debug/last-broadcast returns last broadcast payload", async () => {
    sse.broadcast({ debug: "X" });

    const res = await request(app).get(
      "/api/volunteer-history/debug/last-broadcast"
    );

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ lastBroadcast: { debug: "X" } });
  });

  // --------------------------------------------------
  // 4) GET /debug/last-broadcast — error branch
  // --------------------------------------------------
  test("GET /debug/last-broadcast handles internal error", async () => {
    const old = sse.getLastBroadcast;
    sse.getLastBroadcast = jest.fn(() => {
      throw new Error("fail");
    });

    const res = await request(app).get(
      "/api/volunteer-history/debug/last-broadcast"
    );

    expect(res.status).toBe(500);

    sse.getLastBroadcast = old; // restore
  });

  // --------------------------------------------------
  // 5) /inspect/:id fallback
  // --------------------------------------------------
  test("GET /inspect/:id uses fallback since inspectVolunteerMapping not exported", async () => {
    const res = await request(app).get(
      "/api/volunteer-history/inspect/77"
    );

    expect(res.status).toBe(404);
    expect(res.body).toEqual({
      error: "inspectVolunteerMapping not available",
    });
  });

  // --------------------------------------------------
  // 6) GET /
  // --------------------------------------------------
  test("GET / returns all volunteer history", async () => {
    const res = await request(app).get("/api/volunteer-history");
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ ok: true });
  });

  // --------------------------------------------------
  // 7) GET /my/:volunteer_id
  // --------------------------------------------------
  test("GET /my/:volunteer_id returns specific volunteer history", async () => {
    const res = await request(app).get("/api/volunteer-history/my/55");
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ id: "55" });
  });

  // --------------------------------------------------
  // 8) POST /
  // --------------------------------------------------
  test("POST / creates a new volunteer history record", async () => {
    const res = await request(app)
      .post("/api/volunteer-history")
      .send({ event_id: 1, volunteer_id: 2 });

    expect(res.status).toBe(201);
    expect(res.body).toEqual({ created: true });
  });

  // --------------------------------------------------
  // 9) PUT /:id
  // --------------------------------------------------
  test("PUT /:id updates a volunteer history record", async () => {
    const res = await request(app)
      .put("/api/volunteer-history/10")
      .send({ volunteer_id: 999 });

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ updated: "10" });
  });

  // --------------------------------------------------
  // 10) DELETE /:id
  // --------------------------------------------------
  test("DELETE /:id deletes a volunteer history record", async () => {
    const res = await request(app).delete(
      "/api/volunteer-history/22"
    );

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ deleted: "22" });
  });
test("GET /inspect/:id uses real inspectVolunteerMapping when present", async () => {
  // 1) Modify mock BEFORE loading router
  jest.resetModules();
  jest.doMock("../controllers/volunteerHistory", () => ({
    getVolunteerHistory: jest.fn((req, res) =>
      res.status(200).json({ ok: true })
    ),
    getVolunteerHistoryByVolunteer: jest.fn((req, res) =>
      res.status(200).json({ id: req.params.volunteer_id })
    ),
    createVolunteerRecord: jest.fn((req, res) =>
      res.status(201).json({ created: true })
    ),
    updateVolunteerRecord: jest.fn((req, res) =>
      res.status(200).json({ updated: req.params.id })
    ),
    deleteVolunteerRecord: jest.fn((req, res) =>
      res.status(200).json({ deleted: req.params.id })
    ),

    // ★★ The missing branch
    inspectVolunteerMapping: jest.fn((req, res) =>
      res.status(200).json({ inspected: req.params.id })
    )
  }));

  // 2) Rebuild the app & router AFTER adding the mock
  const freshRoutes = require("../routes/historyRoutes");
  const freshApp = express();
  freshApp.use(express.json());
  freshApp.use("/api/volunteer-history", freshRoutes);

  // 3) Test
  const res = await request(freshApp).get("/api/volunteer-history/inspect/123");
  expect(res.status).toBe(200);
  expect(res.body).toEqual({ inspected: "123" });
});


});
