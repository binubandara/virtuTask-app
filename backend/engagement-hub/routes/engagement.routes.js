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

// function to get productivity score
const getProductivityScore = async (employeeId, authToken) => {
  try {
    // Make the API request with the authorization header
    const response = await axios.get(`http://localhost:5000/productivity-score/${employeeId}`, {
      timeout: 5000,
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    });
    
    if (response.status === 200) {
      return response.data.productivityScore || 0;
    }
    return 0;
  } catch (error) {
    console.error('Error fetching productivity score:', error);
    return 0; // Default to 0 if there's an error
  }
};

// Calculate game time based on productivity score
const calculateGameTime = (productivityScore) => {
  if (productivityScore >= 90) {
    return 60 * 60; // 60 minutes in seconds
  } else if (productivityScore >= 75) {
    return 30 * 60; // 30 minutes in seconds
  } else {
    return 15 * 60; // 15 minutes in seconds
  }
};

// API endpoint to check hub status
router.get('/status', authenticateUser, async (req, res) => {
  try {
    const employeeId = req.employeeId;
    
    if (!employeeId) {
      return res.status(400).json({ error: 'Employee ID is required' });
    }
    
    let userEngagement = await UserEngagement.findOne({ employeeId });
    
    // Get token from authorization header
    const authHeader = req.headers.authorization;
    const token = authHeader.split(' ')[1];
    
    // Get productivity score with auth token
    const productivityScore = await getProductivityScore(employeeId, token);
    
    // Calculate allowed game time based on productivity score
    const totalAllowedTime = calculateGameTime(productivityScore);
    
    // If no record exists, create one
    if (!userEngagement) {
      userEngagement = new UserEngagement({ 
        employeeId,
        isEnabled: true,
        sessionDuration: 0,
        lastSessionStart: null
      });
      await userEngagement.save();
      return res.json({ 
        isEnabled: true, 
        remainingTime: totalAllowedTime,
        productivityScore: productivityScore,
        totalAllowedTime: totalAllowedTime
      });
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
      return res.json({ 
        isEnabled: true, 
        remainingTime: totalAllowedTime,
        productivityScore: productivityScore,
        totalAllowedTime: totalAllowedTime
      });
    }
    
    // Calculate remaining time
    const remainingTime = Math.max(0, totalAllowedTime - userEngagement.sessionDuration);
    
    // If no time left, disable the hub
    if (remainingTime <= 0 && userEngagement.isEnabled) {
      userEngagement.isEnabled = false;
      await userEngagement.save();
    }
    
    res.json({
      isEnabled: userEngagement.isEnabled,
      remainingTime: remainingTime,
      productivityScore: productivityScore,
      totalAllowedTime: totalAllowedTime
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
    
    if (!employeeId) {
      return res.status(400).json({ error: 'Employee ID is required' });
    }
    
    let userEngagement = await UserEngagement.findOne({ employeeId });
    
    if (!userEngagement) {
      userEngagement = new UserEngagement({ 
        employeeId,
        isEnabled: isEnabled,
        sessionDuration: 0,
        lastSessionStart: isEnabled ? new Date() : null
      });
    } else {
      userEngagement.isEnabled = isEnabled;
      
      // If enabling, set start time only if it's null or a new day
      if (isEnabled && !userEngagement.lastSessionStart) {
        userEngagement.lastSessionStart = new Date();
      }
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
    
    if (!employeeId) {
      return res.status(400).json({ error: 'Employee ID is required' });
    }
    
    if (typeof playedSeconds !== 'number' || playedSeconds < 0) {
      return res.status(400).json({ error: 'Invalid played time value' });
    }
    
    // Get token from authorization header
    const authHeader = req.headers.authorization;
    const token = authHeader.split(' ')[1];
    
    // Get productivity score and calculate allowed time
    const productivityScore = await getProductivityScore(employeeId, token);
    const totalAllowedTime = calculateGameTime(productivityScore);
    
    let userEngagement = await UserEngagement.findOne({ employeeId });
    
    if (!userEngagement) {
      userEngagement = new UserEngagement({ 
        employeeId,
        sessionDuration: playedSeconds,
        lastSessionStart: new Date(),
        isEnabled: playedSeconds < totalAllowedTime
      });
    } else {
      // Update the session duration
      userEngagement.sessionDuration = playedSeconds;
      
      // Check if time is up
      if (playedSeconds >= totalAllowedTime) {
        userEngagement.isEnabled = false;
      }
    }
    
    await userEngagement.save();
    
    res.json({ 
      success: true,
      isEnabled: userEngagement.isEnabled,
      remainingTime: Math.max(0, totalAllowedTime - playedSeconds),
      productivityScore: productivityScore,
      totalAllowedTime: totalAllowedTime
    });
  } catch (error) {
    console.error('Error updating play time:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;