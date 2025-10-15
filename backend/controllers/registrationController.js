// controllers/registrationController.js

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
