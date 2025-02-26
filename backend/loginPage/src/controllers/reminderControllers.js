const ReminderSettings = require('../models/ReminderSettings');

//@desc     Get reminder settings
//@route    GET /api/reminders
//@access   Private

const getReminderSettings = async (req, res) => {
    try {
        let settings = await ReminderSettings.findOne({ user: req.user._id});

        if(!settings) {
            settings = await ReminderSettings.create({ user: req.user._id});
        }

        res.json(settings);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error'});
    }
};