const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const UserProfile = require('../models/UserProfile');
const User = require('../models/User');

// Get profile for logged in user
router.get('/profile', protect, async (req, res) => {
  try {
    // Find profile by user ID
    let userProfile = await UserProfile.findOne({ user: req.user._id });
    
    // If profile doesn't exist, create an empty one
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
const upload = require('../middleware/uploadMiddleware');

// Update the post route to include file upload
router.post('/profile', protect, upload.single('profileImage'), async (req, res) => {
  try {
    const { firstname, lastname, contact, dob, gender, address, pcode, about } = req.body;
    
    // Find profile by user ID
    let userProfile = await UserProfile.findOne({ user: req.user._id });
    
    // If profile doesn't exist, create a new one
    if (!userProfile) {
      userProfile = new UserProfile({
        user: req.user._id,
        firstname,
        lastname,
        contact,
        dob,
        gender,
        address,
        pcode,
        about
      });
    } else {
      // Update existing profile
      userProfile.firstname = firstname;
      userProfile.lastname = lastname;
      userProfile.contact = contact;
      userProfile.dob = dob;
      userProfile.gender = gender;
      userProfile.address = address;
      userProfile.pcode = pcode;
      userProfile.about = about;
    }
    
    // Handle file upload (profile image)
    if (req.file) {
      userProfile.profileImage = req.file.path;
    }
    
    // Save the profile
    await userProfile.save();
    
    res.json({ message: 'Profile updated successfully', profile: userProfile });
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ message: 'Server Error' });
  }
});

module.exports = router;