// backend/db.js
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: "postgresql://postgres:Project_group11@db.zhhqicqeeludwkapymei.supabase.co:5432/postgres",
  ssl: { rejectUnauthorized: false } // required for Supabase
});

module.exports = pool;
