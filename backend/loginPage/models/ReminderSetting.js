const mongoose = require('mongoose');

// Reminder settings schema definition
const reminderSettingSchema = new mongoose.Schema({
    user : {
        type : mongoose.Schema.Types.ObjectId,
        ref : 'User',
        required : [true, 'User reference is required'],
        unique : true,
        immutable : true
    },

    postureReminder : {
        interval : {
            type : Number,
            min : [1, 'Interval must be at least 1 minute'],
            max : [1140, 'Interval cannot exceed 24 hours'],
            default : 30
        },
        enabled : {type : Boolean, default : true}
    },

    hydrationReminder : {
        interval : {
            type : Number,
            min : [1, 'Interval must be at least 1 minute'],
            max : [1140, 'Interval cannot exceed 24 hours'],
            default : 60
        },
        enabled : {type : Boolean, default : true}
    },

    movementReminder : {
        interval : {
            type : Number,
            min : [1, 'Interval must be at least 1 minute'],
            max : [1440, 'Interval cannot exceed 24 hours'],
            default : 45
        },
        enabled : {type : Boolean, default : true}
    }
}, {
        timestamps : true,
        toJSON : {virtuals : true},
        toObject : {virtuals : true}});

const ReminderSettings = mongoose.model('ReminderSetting', reminderSettingSchema);
module.exports = ReminderSettings;