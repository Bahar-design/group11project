const express = require('express');
const { getUserProfile, updateUserProfile } = require('../controllers/userProfileController');

const router = express.Router();

// GET user profile
router.get('/', getUserProfile);

// POST/PUT user profile
router.post('/', updateUserProfile);

module.exports = router;
