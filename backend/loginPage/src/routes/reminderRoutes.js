const express = require('express');
const router = express.Router();
const{protect} = require('../middleware/authMiddleware');

const {
    getReminderSettings,
    updateReminderSettings
} = require('../controllers/reminderControllers');

router.use(protect);

router.route('/').get(getReminderSettings).put(updateReminderSettings);

module.exports = router;