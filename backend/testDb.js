// testDb.js  for testing database connection
const pool = require('./db');

async function testConnection() {
  try {
    const res = await pool.query('SELECT NOW()');  // simple query
    console.log('Connected! Server time:', res.rows[0].now);
    process.exit(0);
  } catch (err) {
    console.error('Connection failed:', err);
    process.exit(1);
  }
}

testConnection();


//to test the connection to the database, run `node testDb.js` in the backend directory
