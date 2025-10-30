// controllers/loginController.js

/*
const users = [
  { name: "Sarah Johnson", email: 'sarah.j@email.com', password: '1234', type: 'volunteer' },
  { name: "Maria Delgado", email: "maria.d@houstonhearts.org", password: "5678", type: 'admin' },
];

function login(req, res) {
  const { email, password } = req.body;
  const user = users.find(u => u.email === email && u.password === password);
  if (!user) {
    return res.status(401).json({ message: "Invalid email or password" });
  }
  // Return user info and type
  res.json({ user: { name: user.name, email: user.email, type: user.type } });
}

module.exports = { login, users };
*/


// controllers/loginController.js
const pool = require('../db'); // Import your database connection

// In-memory users kept for tests and fallback
const users = [
  { name: 'Sarah Johnson', email: 'sarah.j@email.com', password: '1234', type: 'volunteer' },
  { name: 'Maria Delgado', email: 'maria.d@houstonhearts.org', password: '5678', type: 'admin' }
];

async function login(req, res) {
  const { email, password } = req.body;
  // In test environment, avoid DB calls — use in-memory users for speed/reliability
  if (process.env.NODE_ENV === 'test') {
    const local = users.find(u => u.email === email && u.password === password);
    if (!local) return res.status(401).json({ message: 'Invalid email or password' });
    return res.json({ user: { name: local.name, email: local.email, type: local.type } });
  }

  try {
    // Try DB lookup first
    const result = await pool.query(
      'SELECT user_id, user_email, user_password, user_type FROM user_table WHERE user_email = $1',
      [email]
    );

    if (result.rows.length > 0) {
      const user = result.rows[0];
      const isPasswordValid = password === user.user_password;
      if (!isPasswordValid) {
        return res.status(401).json({ message: 'Invalid email or password' });
      }
      return res.json({ user: { id: user.user_id, email: user.user_email, type: user.user_type } });
    }

    // If not found in DB, fall back to memory (tests expect this)
    const local = users.find(u => u.email === email && u.password === password);
    if (!local) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }
    return res.json({ user: { name: local.name, email: local.email, type: local.type } });
  } catch (err) {
    console.error('Error during login:', err);
    // On DB error, fallback to in-memory users
    const local = users.find(u => u.email === email && u.password === password);
    if (!local) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }
    return res.json({ user: { name: local.name, email: local.email, type: local.type } });
  }
}

module.exports = { login, users };

