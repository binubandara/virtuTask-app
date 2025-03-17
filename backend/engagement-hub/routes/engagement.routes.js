const express = require('express');
const router = express.Router();
const UserEngagement = require('../models/UserEngagement');
const axios = require('axios');

// Middleware to authenticate user and get employee ID
const authenticateUser = async (req, res, next) => {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Not authenticated. Please login first.' });
    }
    
    const token = authHeader.split(' ')[1];
    
    // Verify token with authentication service
    try {
      const response = await axios.post('http://localhost:5001/api/auth/verify-token', 
        { token },
        { timeout: 5000 }
      );
      
      if (response.status !== 200) {
        return res.status(401).json({ message: 'Invalid token' });
      }
      
      // Extract employee ID
      const userData = response.data;
      const employeeId = userData.employeeId;
      
      if (!employeeId) {
        return res.status(400).json({ message: 'User does not have an employee ID' });
      }
      
      // Set employee ID in request
      req.employeeId = employeeId;
      next();
    } catch (error) {
      console.error('Error verifying token:', error);
      return res.status(503).json({ message: 'Authentication service unavailable' });
    }
  } catch (error) {
    console.error('Authentication error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

// API endpoint to check hub status
router.get('/status', authenticateUser, async (req, res) => {
  try {
    const employeeId = req.employeeId;
    let userEngagement = await UserEngagement.findOne({ employeeId });
    
    // If no record exists, create one
    if (!userEngagement) {
      userEngagement = new UserEngagement({ employeeId });
      await userEngagement.save();
      return res.json({ isEnabled: true, remainingTime: 30 * 60 });
    }
    
    // Check if it's a new day since last session
    const lastSessionDate = userEngagement.lastSessionStart ? new Date(userEngagement.lastSessionStart) : null;
    const today = new Date();
    
    const isNewDay = !lastSessionDate || 
      (lastSessionDate.getDate() !== today.getDate() ||
       lastSessionDate.getMonth() !== today.getMonth() ||
       lastSessionDate.getFullYear() !== today.getFullYear());
    
    if (isNewDay) {
      // Reset for new day
      userEngagement.isEnabled = true;
      userEngagement.sessionDuration = 0;
      await userEngagement.save();
      return res.json({ isEnabled: true, remainingTime: 30 * 60 });
    }
    
    // Calculate remaining time
    const totalAllowedTime = 30 * 60; // 30 minutes in seconds
    const remainingTime = Math.max(0, totalAllowedTime - userEngagement.sessionDuration);
    
    // If no time left, disable the hub
    if (remainingTime <= 0 && userEngagement.isEnabled) {
      userEngagement.isEnabled = false;
      await userEngagement.save();
    }
    
    res.json({
      isEnabled: userEngagement.isEnabled,
      remainingTime: remainingTime
    });
  } catch (error) {
    console.error('Error fetching hub status:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// API endpoint to update hub status
router.post('/status', authenticateUser, async (req, res) => {
  try {
    const { isEnabled } = req.body;
    const employeeId = req.employeeId;
    
    let userEngagement = await UserEngagement.findOne({ employeeId });
    
    if (!userEngagement) {
      userEngagement = new UserEngagement({ employeeId });
    }
    
    userEngagement.isEnabled = isEnabled;
    
    // If enabling, set start time only if it's null or a new day
    if (isEnabled && !userEngagement.lastSessionStart) {
      userEngagement.lastSessionStart = new Date();
    }
    
    await userEngagement.save();
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error updating hub status:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// API endpoint to update play time
router.post('/play-time', authenticateUser, async (req, res) => {
  try {
    const { playedSeconds } = req.body;
    const employeeId = req.employeeId;
    
    if (typeof playedSeconds !== 'number' || playedSeconds < 0) {
      return res.status(400).json({ error: 'Invalid played time value' });
    }
    
    let userEngagement = await UserEngagement.findOne({ employeeId });
    
    if (!userEngagement) {
      userEngagement = new UserEngagement({ 
        employeeId,
        sessionDuration: playedSeconds,
        lastSessionStart: new Date()
      });
    } else {
      // Update the session duration
      userEngagement.sessionDuration = playedSeconds;
      
      // Check if time is up
      const totalAllowedTime = 30 * 60; // 30 minutes in seconds
      if (playedSeconds >= totalAllowedTime) {
        userEngagement.isEnabled = false;
      }
    }
    
    await userEngagement.save();
    
    res.json({ 
      success: true,
      isEnabled: userEngagement.isEnabled,
      remainingTime: Math.max(0, 30 * 60 - playedSeconds)
    });
  } catch (error) {
    console.error('Error updating play time:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;