const mongoose = require('mongoose');

const profileSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  dateOfBirth: { type: Date, required: true },
  mobile: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  address: { type: String, required: true },
  country: { type: String, required: true },
  city: { type: String, required: true },
  gender: { type: String, required: true },
  profilePic: { type: String, default: 'default.jpg' },
});

module.exports = mongoose.model('Profile', profileSchema);