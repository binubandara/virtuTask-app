const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const UserProfile = require('../models/UserProfile');
const User = require('../models/User');
const upload = require('../middleware/uploadMiddleware');

// Get profile for logged in user
router.get('/profile', protect, async (req, res) => {
  try {
    // Find profile by user ID (req.user comes from protect middleware)
    let userProfile = await UserProfile.findOne({ user: req.user._id });
    
    // If profile doesn't exist, prepare an empty structure
    if (!userProfile) {
      userProfile = {
        user: req.user._id,
        firstname: '',
        lastname: '',
        contact: '',
        dob: '',
        gender: '',
        address: '',
        pcode: '',
        city: '',
        about: '',
        profileImage: '',
        resume: ''
      };
    }

    // Get user data to supplement profile
    const userData = await User.findById(req.user._id).select('-password');
    
    res.json({
      profile: userProfile,
      user: userData
    });
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({ message: 'Server Error' });
  }
});

// Update user profile
router.post('/profile', protect, upload.single('profileImage'), async (req, res) => {
  try {
    const { firstname, lastname, contact, dob, gender, address, pcode, city, about } = req.body;
    
    // Find profile by user ID
    let userProfile = await UserProfile.findOne({ user: req.user._id });
    
    // If profile doesn't exist, create a new one
    if (!userProfile) {
      userProfile = new UserProfile({
        user: req.user._id,
        firstname: firstname || '',
        lastname: lastname || '',
        contact: contact || '',
        dob: dob || '',
        gender: gender || '',
        address: address || '',
        pcode: pcode || '',
        city: city || '',
        about: about || ''
      });
    } else {
      // Update existing profile
      userProfile.firstname = firstname || userProfile.firstname;
      userProfile.lastname = lastname || userProfile.lastname;
      userProfile.contact = contact || userProfile.contact;
      userProfile.dob = dob || userProfile.dob;
      userProfile.gender = gender || userProfile.gender;
      userProfile.address = address || userProfile.address;
      userProfile.pcode = pcode || userProfile.pcode;
      userProfile.city = city || userProfile.city;
      userProfile.about = about || userProfile.about;
    }
    
    // Handle file upload (profile image)
    if (req.file) {
      userProfile.profileImage = req.file.path;
    }
    
    // Save the profile
    await userProfile.save();
    
    res.json({ 
      message: 'Profile updated successfully', 
      profile: userProfile 
    });
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
});

module.exports = router;