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

  async function login(req, res) {
    const { email, password } = req.body;

    try {
      // Step 1: Look up user by email
      const result = await pool.query(
        'SELECT user_id, user_email, user_password, user_type FROM user_table WHERE user_email = $1',
        [email]
      );

      if (result.rows.length === 0) {
        return res.status(401).json({ message: 'Invalid email or password' });
      }

      const user = result.rows[0];

      // Step 2: Check password
      // If your passwords are not hashed yet:
      const isPasswordValid = password === user.user_password;

      // (If you’re using bcrypt: use await bcrypt.compare(password, user.user_password))
      if (!isPasswordValid) {
        return res.status(401).json({ message: 'Invalid email or password' });
      }

      // Step 3: Send back basic user info
      res.json({
        user: {
          id: user.user_id,
          email: user.user_email,
          type: user.user_type, // 'volunteer' or 'admin'
        },
      });
    } catch (err) {
      console.error('Error during login:', err);
      res.status(500).json({ message: 'Server error' });
    }
  }

  module.exports = { login };


