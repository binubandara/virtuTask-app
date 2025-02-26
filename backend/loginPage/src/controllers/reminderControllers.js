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

// @desc    Update reminder settings
// @route   PUT /api/reminders
// @access  Private

const updateReminderSettings = async (req, res) => {
    try{
        const { postureReminder, postureInterval, waterReminder, waterInterval, standReminder, standInterval } = req.body;

        const settings = await ReminderSettings.findOne(
            {user : req.user._id},
            { postureReminder, hydrationReminder, movementReminder },
            { new : true, upsert : true}
        );

            res.json(settings);
    } catch(error){
        console.error(error);
        res.status(500).json({ message: 'Server Error'});
    }
};

module.exports = { getReminderSettings, updateReminderSettings };
