const ReminderSettings = require('../models/ReminderSettings');

//@desc     Get reminder settings
//@route    GET /api/auth/reminders
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

// @desc    create reminder settings
// @route   POST /api/auth/reminders
// @access  Private 

const createReminder = async (req, res) => {
    try {
        const { title, description, date} = req.body;
        const reminder = new ReminderSettings({
            userId: req.user._id,
            title,
            description,
            date
        });
        const createdReminder = await reminder.save();
        res.status(201).json(createdReminder);
    }catch (error){
        console.error(error);
        res.status(500).json({ message: 'Server Error'});
    }
};

// @desc    Update reminder settings
// @route   PUT /api/auth/reminders/:id
// @access  Private

const updateReminder = async (req, res) => {
    try{
        const { title, description, date} = req.body;
        const reminder = await ReminderSettings.findById(req.params.id);

        if(reminder){
            reminder.title = title;
            reminder.description = description;
            reminder.date = date;

            const updatedReminder = await reminder.save();
            res.json(updatedReminder);
        } else {
            res.status(404).json({ message: 'Reminder not found'});
        }
    }catch (error){
        console.error(error);
        res.status(500).json({ message: 'Server Error'});
    }
};

// @desc    Delete reminder settings
// @route   DELETE /api/auth/reminders/:id
// @access  Private

const deleteReminder = async (req, res) => {
    try{
        const reminder = await ReminderSettings.findById(req.params.id);

        if(reminder){
            await reminder.remove();
            res.json({ message: 'Reminder removed'});
        } else {
            res.status(404).json({ message: 'Reminder not found'});
        }
    }catch (error){
        console.error(error);
        res.status(500).json({ message: 'Server Error'});
    }
};

module.exports = { getReminderSettings, createReminder, updateReminder, deleteReminder };
