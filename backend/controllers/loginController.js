// controllers/loginController.js

/*
const users = [
  { name: "Sarah Johnson", email: '', password: '1234', type: 'volunteer' },
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

    // Basic validation to satisfy unit tests and avoid unnecessary DB calls
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

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

// Export a small in-memory users list for tests that import it directly
const users = [
  { name: 'Sarah Johnson', email: 'sarah.j@email.com', password: '1234', type: 'volunteer' },
  { name: 'Maria Delgado', email: 'maria.d@houstonhearts.org', password: '5678', type: 'admin' },
];

// CHANGE PASSWORD
async function changePassword(req, res) {
  const { email, oldPassword, newPassword } = req.body;

  if (!email || !oldPassword || !newPassword) {
    return res.status(400).json({ message: "All fields are required." });
  }

  try {
    // 1. Find the user
    const result = await pool.query(
      `SELECT user_id, user_password FROM user_table WHERE user_email = $1`,
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(400).json({ message: "Email does not exist." });
    }

    const user = result.rows[0];

    // 2. Verify old password matches
    if (oldPassword !== user.user_password) {
      return res.status(401).json({ message: "Old password is incorrect." });
    }

    // 3. Update password
    const update = await pool.query(
      `UPDATE user_table 
       SET user_password = $1 
       WHERE user_email = $2 
       RETURNING user_id, user_email`,
      [newPassword, email]
    );

    return res.status(200).json({
      message: "Password updated successfully.",
      user: update.rows[0]
    });

  } catch (err) {
    console.error("Change password error:", err);
    res.status(500).json({ message: "Server error updating password" });
  }
}



module.exports = { login, changePassword, users };



