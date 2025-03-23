const express = require('express');
const router = express.Router();
const{protect} = require('../middleware/authMiddleware');
const{getReminder, updateReminder} = require('../controllers/reminderControllers');

// Reminder routes
router.route('/settings')
    .get(protect, getReminder)
    .put(protect, updateReminder);

module.exports = router;