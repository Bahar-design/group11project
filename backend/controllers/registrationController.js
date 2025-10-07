// controllers/registrationController.js

// Hardcoded users for testing
let users = [
  { email: "amy@example.com", password: "1234" },
  { email: "bob@example.com", password: "abcd" },
  { email: "carol@example.com", password: "pass" },
];

// Register a new user
function registerUser(req, res) {
  const { email, password } = req.body;  

  // Simple validation
  if (!email || !password) {
    return res.status(400).json({ message: "Please type email and password" });
  }

  // Check if user already exists
  const existingUser = users.find(user => user.email === email);
  if (existingUser) {
    return res.status(400).json({ message: "User already exists" });
  }

  // Add new user
  const newUser = { email, password };
  users.push(newUser);

  res.status(201).json({ message: "User registered successfully", user: newUser });
}

module.exports = { registerUser };
