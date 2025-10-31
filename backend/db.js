// backend/db.js
require('dotenv').config();

const { Pool } = require('pg');

// Support either a single DATABASE_URL (common in managed platforms like Azure)
// or individual PGUSER/PGPASSWORD/PGHOST/PGDATABASE/PGPORT environment variables.
// SSL is required for Azure DB; allow toggling via PGSSL env var (default true).

const useDatabaseUrl = !!process.env.DATABASE_URL;
const sslEnabled = process.env.PGSSL !== 'false';

const poolConfig = useDatabaseUrl
  ? {
      connectionString: process.env.DATABASE_URL,
      ssl: sslEnabled ? { rejectUnauthorized: false } : false
    }
  : {
      user: process.env.PGUSER,
      host: process.env.PGHOST,
      database: process.env.PGDATABASE,
      password: process.env.PGPASSWORD,
      port: process.env.PGPORT ? parseInt(process.env.PGPORT, 10) : undefined,
      ssl: sslEnabled ? { rejectUnauthorized: false } : false
    };

const pool = new Pool(poolConfig);

// Avoid noisy async console output when running tests (jest may exit before these resolve).
pool.connect()
  .then(() => {
    if (process.env.NODE_ENV !== 'test') console.log('Connected to PostgreSQL!');
  })
  .catch(err => {
    if (process.env.NODE_ENV !== 'test') console.error('Connection error', err);
  });

module.exports = pool;

