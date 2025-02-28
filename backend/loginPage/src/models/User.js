const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// User schema definition
const userSchema = new mongoose.Schema({
    username : {
        type : String,
        required : [true, 'Username is required'],
        unique : true,
        trim : true,
        minlength : [5, 'Username must be at least 5 characters long']
    },
    email : {
        type : String,
        required : [true, 'Email is required'],
        unique : true,
        trim : true,
        match : [/.+\@.+\..+/, 'Please enter a valid email address']
    },
    password : {
        type : String,
        required : [true, 'Password is required'],
        minlength : [6, 'Password must be at least 6 characters long']
    },
    role : {
        type : String,
        enum : ['user', 'admin', 'employee'],
        default : 'user'
    },
    employeeId: {
        type : String,
        unique : true,
        trim : true
    },
    createAt : {
        type : Date,
        default : Date.now
    }
});

// Error handing for duplicate key
userSchema.post('save', function(error,doc, next){
    if(error.name === 'MongoError' && error.code === 11000){
        if (error.keyPattern && error.keyPattern.username){
            next(new Error('Username is already in there. Please try new username.'));
        }else if (error.keyPattern && error.keyPattern.email){
            next(new Error('Email is already registered. Please use a different email.'));
        }else if (error.keyPattern && error.keyPattern.employeeId){
            next(new Error('Employee ID is already in use.'));
        }else {
            next(error);
        }
    }else {
        next(error);
    }
});

// Hash password before saving
userSchema.pre('save', async function(next){
    if (!this.isModified('password')){
        return next();
    }
    try{
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    }catch(err){
        next(err);
    }
});

// Method to compare password
userSchema.methods.matchPassword = async function(enteredPassword){
    return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);