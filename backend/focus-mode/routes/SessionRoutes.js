const express = require("express");
const Session = require("../models/Session");

const router = express.Router();

// Log a focus session
router.post("/", async (req, res) => {
  try {
    const session = new Session(req.body);
    await session.save();
    res.status(201).json(session);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get all focus sessions
router.get("/", async (req, res) => {
  try {
    const sessions = await Session.find().populate("taskId");
    res.json(sessions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;