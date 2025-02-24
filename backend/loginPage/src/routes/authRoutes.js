const express = require ('express');
const router = express.Router();
const { registerUser, loginUser, getUserProfile } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

// Public routes
router.post('/register', registerUser);
router.post('/login', loginUser);

// Protected routes
router.get('/profile', protect, getUserProfile);

// Admin route
router.get('/admin', protect, roleMiddleware(['admin']), (req, res) => {
    res.json({ message : 'Admin access granted' });
});

module.exports = router;