const express = require('express');
const profileController = require('../controllers/profileController');

const router = express.Router();

// Save profile
router.post('/profile', profileController.saveProfile);

// Get profile by email
router.get('/profile/:email', profileController.getProfile);

module.exports = router;