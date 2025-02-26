import mongoose from 'mongoose';

const reminderSettingSchema = new mongoose.Schema({
    user : {
        type : mongoose.Schema.Types.ObjectId,
        ref : 'User',
        required : [true, 'User reference is required'],
        unique : true,
        immutable : true
    },

    posture : {
        interval : {
            type : Number,
            min : [1, 'Interval must be at least 1 minute'],
            max : [1140, 'Interval cannot exceed 24 hours'],
            default : 30
        },
        enabled : {type : Boolean, default : true}
    },
})