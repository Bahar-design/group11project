// routes/loginRoutes.js

const express = require("express");
const { login, changePassword } = require("../controllers/loginController");

const router = express.Router();

// POST /api/login
router.post("/", login);

// POST /api/login/change-password
router.post("/change-password", changePassword);
router.put("/change-password", changePassword);

module.exports = router;

