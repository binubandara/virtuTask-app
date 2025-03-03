// models/FocusSession.js
import mongoose from 'mongoose';

const focusSessionSchema = new mongoose.Schema({
  startTime: {
    type: Date,
    required: true,
    default: Date.now
  },
  endTime: {
    type: Date
  },
  duration: {
    type: Number, // Duration in seconds
    default: 0
  },
  taskId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Todo',
    required: false // Not required if user didn't associate with a specific task
  },
  completed: {
    type: Boolean,
    default: false
  },
  notes: {
    type: String
  },
  userId: {
    type: String, // You might want to add user authentication later
    required: false
  }
}, {
  timestamps: true // Adds createdAt and updatedAt
});

const FocusSession = mongoose.model('FocusSession', focusSessionSchema);

export default FocusSession;