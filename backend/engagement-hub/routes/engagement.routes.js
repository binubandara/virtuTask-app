const express = require('express');
const router = express.Router();
const UserEngagement = require('../models/UserEngagement');

// Middleware to get user ID from request
// In a real app, this would come from authentication
const getUserId = (req, res, next) => {
  // For demo purposes, using a fixed user ID or from headers
  // In production, get this from JWT token or session
  req.userId = req.headers['user-id'] || 'demo-user';
  next();
};

// API endpoint to check hub status
router.get('/status', getUserId, async (req, res) => {
  try {
    const userId = req.userId;
    let userEngagement = await UserEngagement.findOne({ userId });
    
    // If no record exists, create one
    if (!userEngagement) {
      userEngagement = new UserEngagement({ userId });
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
router.post('/status', getUserId, async (req, res) => {
  try {
    const { isEnabled } = req.body;
    const userId = req.userId;
    
    let userEngagement = await UserEngagement.findOne({ userId });
    
    if (!userEngagement) {
      userEngagement = new UserEngagement({ userId });
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

// NEW API endpoint to update play time
router.post('/play-time', getUserId, async (req, res) => {
  try {
    const { playedSeconds } = req.body;
    const userId = req.userId;
    
    if (typeof playedSeconds !== 'number' || playedSeconds < 0) {
      return res.status(400).json({ error: 'Invalid played time value' });
    }
    
    let userEngagement = await UserEngagement.findOne({ userId });
    
    if (!userEngagement) {
      userEngagement = new UserEngagement({ 
        userId,
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