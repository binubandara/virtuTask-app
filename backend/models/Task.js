const mongoose = require("mongoose");

const TaskSchema = new mongoose.Schema({
  name: { type: String, required: true },
  date: { type: String, required: true },
  sessions: { type: Number, required: true },
  completed: { type: Boolean, default: false },
});

module.exports = mongoose.model("Task", TaskSchema);
