const express = require("express");
const router = express.Router();
const Task = require("../models/Task");

// Create a new task
router.post("/", async (req, res) => {
  const { title, duration } = req.body;
  const task = await Task.create({ title, duration });
  res.json(task);
});

// Get all tasks
router.get("/", async (req, res) => {
  const tasks = await Task.findAll();
  res.json(tasks);
});

// Update a task
router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const { completed } = req.body;
  await Task.update({ completed }, { where: { id } });
  res.json({ message: "Task updated" });
});

// Delete a task
router.delete("/:id", async (req, res) => {
  const { id } = req.params;
  await Task.destroy({ where: { id } });
  res.json({ message: "Task deleted" });
});

module.exports = router;
