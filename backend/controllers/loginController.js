// controllers/loginController.js


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
