// controllers/loginController.js

const users = [
  { name: "Amy", email: "amy@email.com", password: "1234" },
  { name: "Bob", email: "bob@email.com", password: "5678" },
  { name: "Charlie", email: "charlie@email.com", password: "abcd" },
];

function login(req, res) {
  const { email, password } = req.body;

  const user = users.find(u => u.email === email && u.password === password);

  if (!user) {
    return res.status(401).json({ message: "Invalid email or password" });
  }

  res.json({ user });
}

module.exports = { login };
