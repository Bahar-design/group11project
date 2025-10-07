const express = require("express");
const { registerUser } = require("../controllers/registrationController");

const router = express.Router();

// POST /api/register
router.post("/", registerUser);

module.exports = router;
