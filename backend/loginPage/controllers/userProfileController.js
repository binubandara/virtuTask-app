const UserProfile = require('../models/UserProfile');
const User = require('../models/User');
// @desc    Create or update user profile
// @route   POST /api/users/profile
// @access  Private
const createUserProfile = async (req, res) => {
  try {
    const {
      userId,
      firstname,
      lastname,
      contact,
      dob,
      gender,
      address,
      pcode,
      about
    } = req.body;

    // Check if profile exists
    let profile = await UserProfile.findOne({ user: userId || req.user._id });

    if (profile) {
      // Update existing profile
      profile.firstname = firstname || profile.firstname;
      profile.lastname = lastname || profile.lastname;
      profile.contact = contact || profile.contact;
      profile.dob = dob || profile.dob;
      profile.gender = gender || profile.gender;
      profile.address = address || profile.address;
      profile.pcode = pcode || profile.pcode;
      profile.about = about || profile.about;

      await profile.save();
    } else {
      // Create new profile
      profile = await UserProfile.create({
        user: userId || req.user._id,
        firstname,
        lastname,
        contact,
        dob,
        gender,
        address,
        pcode,
        about
      });
    }

    res.status(201).json(profile);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
const getUserProfile = async (req, res) => {
  try {
    // Find profile by user ID (from the auth middleware)
    let userProfile = await UserProfile.findOne({ user: req.user._id });
    
    // Get user data to supplement profile
    const userData = await User.findById(req.user._id).select('-password');
    
    // If profile doesn't exist, return empty profile structure
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
    
    res.json({
      profile: userProfile,
      user: userData
    });
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Create or update user profile
// @route   POST /api/users/profile
// @access  Private
const updateUserProfile = async (req, res) => {
  try {
    // Validate date format if provided
    if (req.body.dob) {
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!dateRegex.test(req.body.dob)) {
        return res.status(400).json({ 
          message: 'Invalid date format. Use YYYY-MM-DD format.' 
        });
      }
    }

    const {
      firstname,
      lastname,
      dob,
      contact,
      gender,
      address,
      pcode,
      city,
      about
    } = req.body;

    // Find profile by user ID (from auth middleware)
    let userProfile = await UserProfile.findOne({ user: req.user._id });

    if (userProfile) {
      // Update existing profile
      userProfile.firstname = firstname || userProfile.firstname;
      userProfile.lastname = lastname || userProfile.lastname;
      userProfile.dob = dob || userProfile.dob;
      userProfile.contact = contact || userProfile.contact;
      userProfile.gender = gender || userProfile.gender;
      userProfile.address = address || userProfile.address;
      userProfile.pcode = pcode || userProfile.pcode;
      userProfile.city = city || userProfile.city;
      userProfile.about = about || userProfile.about;

      // Handle profile image if uploaded
      if (req.file) {
        userProfile.profileImage = req.file.path;
      }

      await userProfile.save();
    } else {
      // Create new profile
      const profileData = {
        user: req.user._id,
        firstname: firstname || '',
        lastname: lastname || '',
        dob: dob || '',
        contact: contact || '',
        gender: gender || '',
        address: address || '',
        pcode: pcode || '',
        city: city || '',
        about: about || ''
      };

      // Add profile image if uploaded
      if (req.file) {
        profileData.profileImage = req.file.path;
      }

      userProfile = await UserProfile.create(profileData);
    }

    res.status(200).json({
      message: 'Profile updated successfully',
      profile: userProfile
    });
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

module.exports = {
  getUserProfile,
  updateUserProfile,
  createUserProfile
};