const mongoose = require("mongoose");

const FocusSessionSchema = new mongoose.Schema({
  taskId: { type: mongoose.Schema.Types.ObjectId, ref: "Task", required: true },
  duration: { type: Number, required: true }, // Duration in minutes
  timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model("FocusSession", FocusSessionSchema);
