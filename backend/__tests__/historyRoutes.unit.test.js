const request = require("supertest");
const express = require("express");

/***************************************************************
 * Helper to build a fresh app each time with new mocks
 ***************************************************************/
function buildApp() {
  jest.resetModules(); // important: clears module cache

  // Mock SSE FIRST
  jest.doMock("../utils/sse", () => {
    const clients = new Set();
    let last = null;
    return {
      clients,
      broadcast: jest.fn((p) => (last = p)),
      getLastBroadcast: jest.fn(() => last),
    };
  });

  // Mock volunteerHistory controller (default: NO inspectVolunteerMapping)
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
  }));

  // Now load the router AFTER mocks
  const historyRoutes = require("../routes/historyRoutes");
  const sse = require("../utils/sse");

  const app = express();
  app.use(express.json());
  app.use("/api/volunteer-history", historyRoutes);

  return { app, sse };
}

describe("historyRoutes FINAL FIX (100% branch coverage)", () => {

  /***************************************************************
   * 1) Test SSE /stream (test close)
   ***************************************************************/
  test("GET /stream closes immediately when header sent", async () => {
    const { app, sse } = buildApp();

    const res = await request(app)
      .get("/api/volunteer-history/stream")
      .set("x-test-sse-close", "1");

    expect(res.status).toBe(200);
    expect(res.header["content-type"]).toContain("text/event-stream");
    expect(sse.clients.size).toBe(0);
  });

  /***************************************************************
   * 2) Test SSE normal open + close
   ***************************************************************/
  test("GET /stream registers and removes client", async () => {
    const { app, sse } = buildApp();

    const server = app.listen();
    const res = await request(server).get("/api/volunteer-history/stream");

    expect(res.status).toBe(200);
    expect(sse.clients.size).toBe(1);

    const client = [...sse.clients][0];
    client.res.emit("close");

    expect(sse.clients.size).toBe(0);

    server.close();
  });

  /***************************************************************
   * 3) Debug endpoint — success
   ***************************************************************/
  test("GET /debug/last-broadcast returns payload", async () => {
    const { app, sse } = buildApp();

    sse.broadcast({ x: 1 });

    const res = await request(app).get(
      "/api/volunteer-history/debug/last-broadcast"
    );

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ lastBroadcast: { x: 1 } });
  });

  /***************************************************************
   * 4) Debug endpoint — failure branch
   ***************************************************************/
  test("GET /debug/last-broadcast handles internal error", async () => {
    const { app, sse } = buildApp();

    const old = sse.getLastBroadcast;
    sse.getLastBroadcast = jest.fn(() => {
      throw new Error("fail");
    });

    const res = await request(app).get(
      "/api/volunteer-history/debug/last-broadcast"
    );

    expect(res.status).toBe(500);

    sse.getLastBroadcast = old;
  });

  /***************************************************************
   * 5) /inspect/:id — fallback branch
   ***************************************************************/
  test("GET /inspect/:id returns fallback when function not defined", async () => {
    const { app } = buildApp();

    const res = await request(app).get(
      "/api/volunteer-history/inspect/50"
    );

    expect(res.status).toBe(404);
    expect(res.body).toEqual({
      error: "inspectVolunteerMapping not available",
    });
  });

  /***************************************************************
   * 6) /inspect/:id — inspectVolunteerMapping branch
   ***************************************************************/
  test("GET /inspect/:id uses real inspectVolunteerMapping", async () => {

    // Rebuild app with inspectVolunteerMapping INCLUDED
    jest.resetModules();

    jest.doMock("../utils/sse", () => {
      const clients = new Set();
      let last = null;
      return {
        clients,
        broadcast: jest.fn((p) => (last = p)),
        getLastBroadcast: jest.fn(() => last),
      };
    });

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

      inspectVolunteerMapping: jest.fn((req, res) =>
        res.status(200).json({ inspected: req.params.id })
      ),
    }));

    const historyRoutes = require("../routes/historyRoutes");
    const app = express();
    app.use(express.json());
    app.use("/api/volunteer-history", historyRoutes);

    const res = await request(app).get(
      "/api/volunteer-history/inspect/123"
    );

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ inspected: "123" });
  });

  /***************************************************************
   * BASIC ROUTES
   ***************************************************************/
  test("GET / returns all history", async () => {
    const { app } = buildApp();
    const res = await request(app).get("/api/volunteer-history");
    expect(res.status).toBe(200);
  });

  test("GET /my/:id returns history", async () => {
    const { app } = buildApp();
    const res = await request(app).get("/api/volunteer-history/my/55");
    expect(res.status).toBe(200);
  });

  test("POST / creates a record", async () => {
    const { app } = buildApp();
    const res = await request(app)
      .post("/api/volunteer-history")
      .send({ event_id: 1, volunteer_id: 2 });
    expect(res.status).toBe(201);
  });

  test("PUT /:id updates a record", async () => {
    const { app } = buildApp();
    const res = await request(app)
      .put("/api/volunteer-history/10")
      .send({ volunteer_id: 99 });
    expect(res.status).toBe(200);
  });

  test("DELETE /:id deletes a record", async () => {
    const { app } = buildApp();
    const res = await request(app).delete("/api/volunteer-history/22");
    expect(res.status).toBe(200);
  });

  test("GET /inspect/:id uses real inspectVolunteerMapping (function branch)", async () => {
  jest.resetModules();

  // 1. Mock volunteerHistory including inspectVolunteerMapping
  jest.doMock("../controllers/volunteerHistory", () => ({
    getVolunteerHistory: jest.fn((req, res) => res.status(200).json({ ok: true })),
    getVolunteerHistoryByVolunteer: jest.fn((req, res) =>
      res.status(200).json({ id: req.params.volunteer_id })
    ),
    createVolunteerRecord: jest.fn((req, res) => res.status(201).json({ created: true })),
    updateVolunteerRecord: jest.fn((req, res) => res.status(200).json({ updated: req.params.id })),
    deleteVolunteerRecord: jest.fn((req, res) => res.status(200).json({ deleted: req.params.id })),
    inspectVolunteerMapping: jest.fn((req, res) =>
      res.status(200).json({ inspected: req.params.id })   // ★ THIS branch
    ),
  }));

  // 2. Also mock SSE for fresh router load
  jest.doMock("../utils/sse", () => ({
    clients: new Set(),
    broadcast: jest.fn(),
    getLastBroadcast: jest.fn(() => null),
  }));

  // 3. Now reload the router AFTER mocks
  const express = require("express");
  const freshRoutes = require("../routes/historyRoutes");

  const app = express();
  app.use(express.json());
  app.use("/api/volunteer-history", freshRoutes);

  // 4. Perform request
  const res = await request(app).get("/api/volunteer-history/inspect/123");

  expect(res.status).toBe(200);
  expect(res.body).toEqual({ inspected: "123" });
});

});
