const Profile = require('../models/Profile');
const multer = require('multer');
const path = require('path');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({ storage }).single('profilePic');

// Save profile
exports.saveProfile = async (req, res) => {
  upload(req, res, async (err) => {
    if (err) {
      console.error('File upload error:', err);
      return res.status(400).json({ message: 'File upload failed', error: err });
    }

    console.log('Request body:', req.body);
    console.log('Uploaded file:', req.file);

    const { firstName, lastName, dateOfBirth, mobile, email, address, country, city, gender } = req.body;
    const profilePic = req.file ? req.file.filename : 'default.jpg';

    try {
      const profile = new Profile({
        firstName,
        lastName,
        dateOfBirth,
        mobile,
        email,
        address,
        country,
        city,
        gender,
        profilePic,
      });

      console.log('Saving profile to MongoDB...');
      await profile.save();
      console.log('Profile saved:', profile);
      res.status(201).json({ message: 'Profile saved successfully', profile });
    } catch (error) {
      console.error('Error saving profile to MongoDB:', error);
      res.status(500).json({ message: 'Error saving profile', error });
    }
  });
};

// Get profile by email
exports.getProfile = async (req, res) => {
  try {
    const profile = await Profile.findOne({ email: req.params.email });
    if (!profile) {
      return res.status(404).json({ message: 'Profile not found' });
    }
    res.status(200).json({ profile });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching profile', error });
  }
};