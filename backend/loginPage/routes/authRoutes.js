const express = require ('express');
const router = express.Router();
const { registerUser, loginUser, getUserProfile } = require('../controllers/authControllers');
const { protect } = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');
const jwt = require('jsonwebtoken');
const User = require('../models/User')

// Public routes
router.post('/register', registerUser);
router.post('/login', loginUser);

// Protected routes
router.get('/profile', protect, getUserProfile);

// Admin route
router.get('/admin', protect, roleMiddleware(['admin']), (req, res) => {
    res.json({ message : 'Admin access granted' });
});

router.post('/verify-token', async (req, res) => {
    try {
      const { token } = req.body;
      
      if (!token) {
        return res.status(400).json({ message: 'Token is required' });
      }
      
      // Verify the token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // Find the user
      const user = await User.findById(decoded.id);
      
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      
      // Check if user has employeeId
      if (!user.employeeId) {
        return res.status(400).json({ message: 'User does not have an employee ID' });
      }
      
      return res.json({
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        employeeId: user.employeeId
      });
    } catch (error) {
      console.error('Token verification error:', error);
      return res.status(401).json({ message: 'Invalid token' });
    }
  });

module.exports = router;