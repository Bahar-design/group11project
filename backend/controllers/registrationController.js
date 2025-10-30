// controllers/registrationController.js
/*
// Hardcoded users for testing
let users = [
  { email: "amy@example.com", password: "1234" },
  { email: "bob@example.com", password: "abcd" },
  { email: "carol@example.com", password: "pass", adminID: "#ab" },
];

function registerUser(req, res) {
  const { email, password, adminID } = req.body;

  // Validate email and password
  if (!email || !password) {
    return res.status(400).json({ message: "Please type email and password" });
  }

  // Check if user already exists
  const existingUser = users.find(user => user.email === email);
  if (existingUser) {
    return res.status(400).json({ message: "User already exists" });
  }

  // Add new user (adminID is optional)
  const newUser = { email, password };
  if (adminID && adminID.trim() !== "") {
    newUser.adminID = adminID;
  }

  users.push(newUser);

  // Customize response message
  const userTypeMessage = adminID && adminID.trim() !== ""
    ? "Admin User registered successfully"
    : "Volunteer registered successfully";

  res.status(201).json({ message: userTypeMessage, user: newUser });
}

module.exports = { registerUser };
*/

const pool = require('../db');

async function registerUser(req, res) {
  const { email, password, admin_ID } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required" });
  }

  try {
    // Check if user already exists
    const existingUser = await pool.query(
      'SELECT * FROM user_table WHERE user_email = $1',
      [email]
    );
    if (existingUser.rows.length > 0) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Determine user type
    const userType = admin_ID ? 'admin' : 'volunteer';

    // Insert user into user_table
    const userResult = await pool.query(
      'INSERT INTO user_table (user_email, user_password, user_type) VALUES ($1, $2, $3) RETURNING user_id',
      [email, password, userType]
    );
    const newUserId = userResult.rows[0].user_id;

    // Insert into appropriate profile table
    if (userType === 'admin') {
      if (!admin_ID) {
        return res.status(400).json({ message: "Admin ID is required for admins" });
      }
      await pool.query(
        'INSERT INTO admin_profile (admin_ID, user_ID) VALUES ($1, $2)',
        [admin_ID, newUserId]
      );
    } else {
      // Volunteer
      await pool.query(
        'INSERT INTO volunteer_profile (user_ID) VALUES ($1)',
        [newUserId]
      );
    }

    res.status(201).json({
      message: userType === 'admin' 
              ? 'Admin registered successfully' 
              : 'Volunteer registered successfully',
      user: { id: newUserId, email, type: userType, admin_ID: admin_ID || null }
    });


  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ message: 'Server error' });
  }
}

module.exports = { registerUser };


