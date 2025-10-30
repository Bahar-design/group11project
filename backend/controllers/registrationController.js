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

// controllers/registrationController.js
const pool = require('../db'); // PostgreSQL connection

async function registerUser(req, res) {
  const { email, password, type } = req.body;

  if (!email || !password || !type) {
    return res.status(400).json({ message: "Email, password, and user type are required" });
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

    // Insert user into user_table
    const result = await pool.query(
      'INSERT INTO user_table (user_email, user_password, user_type) VALUES ($1, $2, $3) RETURNING user_id',
      [email, password, type]
    );

    const newUserId = result.rows[0].user_id;

    // Insert into corresponding table based on user_type
    if (type.toLowerCase() === 'volunteer') {
      await pool.query(
        'INSERT INTO volunteerprofile (user_id) VALUES ($1)',
        [newUserId]
      );
    } else if (type.toLowerCase() === 'admin') {
      await pool.query(
        'INSERT INTO adminprofile (user_id) VALUES ($1)',
        [newUserId]
      );
    }

    res.status(201).json({
      message: `${type} registered successfully`,
      user: { id: newUserId, email, type }
    });

  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ message: 'Server error' });
  }
}

module.exports = { registerUser };

