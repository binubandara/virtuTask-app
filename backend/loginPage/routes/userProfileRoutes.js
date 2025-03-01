const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { createUserProfile, getUserProfile } = require('../controllers/userProfileController');

router.route('/profile')
  .post(protect, createUserProfile)
  .get(protect, getUserProfile);

module.exports = router;