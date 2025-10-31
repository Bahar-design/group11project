// backend/server.js
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const pool = require("./db");

const app = express();
app.use(cors());
app.use(express.json());

// ✅ Test route to confirm DB connection
app.get("/api/db-check", async (req, res) => {
  try {
    const { rows } = await pool.query("SELECT NOW()");
    res.json({ ok: true, dbTime: rows[0].now });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, error: err.message });
  }
});

// ✅ Main route for events
app.use("/api/events", require("./routes/eventRoutes.js"));

// ✅ Start server
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log("API running on", PORT));