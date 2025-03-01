const UserProfile = require('../models/UserProfile');

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
    const profile = await UserProfile.findOne({ user: req.user._id });
    
    if (!profile) {
      return res.status(404).json({ message: 'Profile not found' });
    }
    
    res.json(profile);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

module.exports = { createUserProfile, getUserProfile };