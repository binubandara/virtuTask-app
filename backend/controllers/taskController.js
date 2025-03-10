const Task = require("../models/Task");

exports.getTasks = async (req, res) => {
  try {
    const tasks = await Task.find();
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.addTask = async (req, res) => {
  try {
    console.log("Received task:", req.body);  
    const task = new Task(req.body);
    await task.save();
    console.log("Task Saved to DB:", task);
    res.json(task);
  } catch (error) {
    console.error("Error saving task:", error);
    res.status(400).json({ error: error.message });
  }
};


exports.updateTask = async (req, res) => {
  try {
    console.log("Updating Task:", req.params.id, req.body); // Debug log

    const task = await Task.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!task) return res.status(404).json({ error: "Task not found" });

    res.json(task);
  } catch (error) {
    console.error("Error updating task:", error);
    res.status(400).json({ error: error.message });
  }
};



exports.deleteTask = async (req, res) => {
  try {
    console.log("Deleting Task with ID:", req.params.id); // Debug log

    const task = await Task.findByIdAndDelete(req.params.id);
    if (!task) return res.status(404).json({ error: "Task not found" });

    res.json({ message: "Task deleted successfully", taskId: req.params.id });
  } catch (error) {
    console.error("Error deleting task:", error);
    res.status(500).json({ error: error.message });
  }
};


