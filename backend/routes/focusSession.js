// routes/focusSession.js
import express from 'express';
import FocusSession from '../models/FocusSession.js';

const router = express.Router();

// Get all focus sessions
router.get('/', async (req, res) => {
  try {
    const focusSessions = await FocusSession.find()
      .populate('taskId', 'title') // Get task title if associated
      .sort({ startTime: -1 });
    res.status(200).json(focusSessions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get a specific focus session
router.get('/:id', async (req, res) => {
  try {
    const focusSession = await FocusSession.findById(req.params.id)
      .populate('taskId');
    
    if (!focusSession) {
      return res.status(404).json({ message: 'Focus session not found' });
    }
    
    res.status(200).json(focusSession);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create a new focus session
router.post('/', async (req, res) => {
  const focusSession = new FocusSession(req.body);
  
  try {
    const newFocusSession = await focusSession.save();
    res.status(201).json(newFocusSession);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update a focus session (e.g., when ending a session)
router.patch('/:id', async (req, res) => {
  try {
    const updatedSession = await FocusSession.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!updatedSession) {
      return res.status(404).json({ message: 'Focus session not found' });
    }
    
    res.status(200).json(updatedSession);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete a focus session
router.delete('/:id', async (req, res) => {
  try {
    const focusSession = await FocusSession.findByIdAndDelete(req.params.id);
    
    if (!focusSession) {
      return res.status(404).json({ message: 'Focus session not found' });
    }
    
    res.status(200).json({ message: 'Focus session deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get all sessions for a specific task
router.get('/task/:taskId', async (req, res) => {
  try {
    const focusSessions = await FocusSession.find({ taskId: req.params.taskId })
      .sort({ startTime: -1 });
    res.status(200).json(focusSessions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;