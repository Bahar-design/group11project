// backend/test-db.js
const pool = require("./db");

(async () => {
  try {
    const { rows } = await pool.query("SELECT NOW()");
    console.log("✅ Connected:", rows[0]);
  } catch (err) {
    console.error("❌ DB error:", err);
  } finally {
    process.exit(0);
  }
})();