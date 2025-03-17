const mongoose = require('mongoose');

const userEngagementSchema = new mongoose.Schema({
  employeeId: {
    type: String,
    required: true,
    unique: true
  },
  lastSessionStart: {
    type: Date,
    default: null
  },
  sessionDuration: {
    type: Number,
    default: 0
  },
  isEnabled: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

const UserEngagement = mongoose.model('UserEngagement', userEngagementSchema);

module.exports = UserEngagement;