const FocusSession = require("../models/FocusSession");

exports.logFocusSession = async (req, res) => {
  try {
    const session = new FocusSession(req.body);
    await session.save();
    res.json(session);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.getFocusSessions = async (req, res) => {
  try {
    const sessions = await FocusSession.find().populate("taskId");
    res.json(sessions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
