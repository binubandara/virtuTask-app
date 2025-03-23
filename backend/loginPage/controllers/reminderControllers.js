const ReminderSettings = require('../models/ReminderSetting');

//@desc     Get reminder settings
//@route    GET /api/reminders/settings
//@access   Private

const getReminder = async (req, res) => {
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
// @route   PUT /api/reminders/settings
// @access  Private

const updateReminder = async (req, res) => {
    try{
        const { postureReminder, hydrationReminder, movementReminder } = req.body;
        let settings = await ReminderSettings.findOne({user : req.user._id});

        if(settings){
            settings.postureReminder = postureReminder;
            settings.hydrationReminder = hydrationReminder;
            settings.movementReminder = movementReminder;

            const updatedSettings = await settings.save();
            res.json(updatedSettings);
        } else {
            res.status(404).json({ message: 'Settings not found'});
        }
    }catch (error){
        console.error(error);
        res.status(500).json({ message: 'Server Error'});
    }
};

module.exports = { getReminder, updateReminder };