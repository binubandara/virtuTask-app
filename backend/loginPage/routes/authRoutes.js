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

  
// Search users by name
router.get('/search',protect, async (req, res) => {
  try {
      const { name } = req.query;

      if (!name) {
          return res.status(400).json({ message: 'Name parameter is required' });
      }

      const users = await User.find({
          username: { $regex: name, $options: 'i' }
      });

      if (users.length === 0) {
          return res.status(404).json({ message: 'No users found with that name' });
      }
     // Map the users and return only the needed information

     const searchResults = users.map(user => ({
          id: user._id,
          username: user.username,
          email: user.email,
          employeeId: user.employeeId
      }));
      return res.json(searchResults);
  } catch (error) {
      console.error('Error searching users:', error);
      return res.status(500).json({ message: 'Error searching users' });
  }
});

module.exports = router;