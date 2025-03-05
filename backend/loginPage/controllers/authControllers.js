const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Generate JWT Token
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn : '30d'
    });
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public

const registerUser = async (req, res) => {
    try {
        console.log('Registration request received:', req.body);
        const {username, email, password, role} = req.body;

        // Validation check
        if (!username || !email || !password || !role) {
            console.log('Missing required fields:', {
                hasUsername: !!username, 
                hasEmail: !!email, 
                hasPassword: !!password, 
                hasRole: !!role 
            });
            return res.status(400).json({message: 'All fields are required'});
        }
    
        //check if user exists
        const userExists = await User.findOne({ username });
        if (userExists) { 
            return res.status(400).json({message : 'Username already exists.'})
        }

        // Generate employee ID
        const generateEmployeeId = () => {
            const prefix = 'EMP';
            const randomNumber = Math.floor(1000 + Math.random() * 9000);
            return `${prefix}${randomNumber}`
        }

        //Create user
        const user = await User.create({
            username,
            email,
            password,
            role,
            employeeId: generateEmployeeId()
        });

        if(user){
            res.status(201).json({
                _id : user._id,
                username : user.username,
                email : user.email,
                role : user.role,
                employeeId : user.employeeId,
                token : generateToken(user._id)
            });
        }
    }  catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({message: 'Server Error', error: error.message});
    }
};


// @desc    Login user
// @route   POST /api/auth/login
// @access  Public

const loginUser = async (req, res) => {
    try{
        const { username, password } = req.body;

        //check for user
        const user = await User.findOne({ username });

        if (user && (await user.matchPassword(password))){
            res.json({
                _id : user._id,
                username : user.username,
                token : generateToken(user._id)
            });
        } else {
            res.status(401).json({ message : 'Invalid username or password.' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message : 'Server Error'})
    }
};

// @descGet user profile
// @route GET / api/auth/profile
// @access Private

const getUserProfile = async(req, res) => {
    try{
        const user = await User.findById(req.user._id).select('-password');
        res.json(user);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message : 'Server Error'});
    }
};

module.exports = {
    registerUser,
    loginUser,
    getUserProfile
};