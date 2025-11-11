// controllers/registrationController.js

const pool = require('../db');

async function registerUser(req, res) {
  const { email, password, admin_id } = req.body; // match column name

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required" });
  }

  try {
    console.log('Register request', { email, admin_id });

    // Check if user already exists
    const existingUser = await pool.query('SELECT * FROM user_table WHERE user_email = $1', [email]);
    if (existingUser.rows.length > 0) {
      console.log('Registration failed: user exists', email);
      return res.status(400).json({ message: 'User already exists' });
    }

    // Determine user type
    const userType = admin_id ? 'admin' : 'volunteer';

    // Insert user into user_table
    const userResult = await pool.query(
      'INSERT INTO user_table (user_email, user_password, user_type) VALUES ($1, $2, $3) RETURNING user_id, user_email',
      [email, password, userType]
    );
    const newUserId = userResult.rows[0].user_id;

    // Insert into appropriate profile table
    if (userType === 'admin') {
      // admin_id is required for admin registration
      if (!admin_id || String(admin_id).trim() === '') {
        await pool.query('DELETE FROM user_table WHERE user_id = $1', [newUserId]);
        return res.status(400).json({ message: 'admin_id is required for admin registration' });
      }
      // Try to insert the adminprofile. If admin_id is already used, DB will raise unique violation.
      try {
        await pool.query('INSERT INTO adminprofile (admin_id, user_id) VALUES ($1, $2)', [admin_id, newUserId]);
      } catch (insertErr) {
        // If unique violation on admin_id, return friendly error after cleanup
        await pool.query('DELETE FROM user_table WHERE user_id = $1', [newUserId]);
        if (insertErr && insertErr.code === '23505') {
          return res.status(400).json({ message: 'admin_id already in use' });
        }
        throw insertErr;
      }
    } else {
      await pool.query('INSERT INTO volunteerprofile (user_id) VALUES ($1)', [newUserId]);
    }

    console.log('Registered user', { newUserId, userType });
    return res.status(201).json({
      message: userType === 'admin' ? 'Admin registered successfully' : 'Volunteer registered successfully',
      user: { id: newUserId, email, type: userType, admin_id: admin_id || null }
    });

  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ message: 'Server error' });
  }
}

module.exports = { registerUser };



