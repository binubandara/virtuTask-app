const jwt = require('jsonwebtoken');
const User = require('../models/User');
const mongoose = require('mongoose');
// Middleware to protect routes and verify JWT token
const protect = async (req, res, next) => {
    let token;
    console.log('JWT_SECRET:', process.env.JWT_SECRET); // Debug statement
    console.log('Mongoose connection state:', mongoose.connection.readyState);
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            // Get token from header
            token = req.headers.authorization.split(' ')[1];
            console.log('Token:', token); // Debug statement

            // Verify the token
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            console.log('Debug Token:', decoded); // Debug statement

            // Get the user from the token
            console.log('User ID:', decoded.id);
            req.user = await User.findById(decoded.id).select('-password');
            console.log('User:', req.user); // Debug statement

            if (!req.user) {
                return res.status(401).json({ message: 'Not authorized, user not found' });
            }

            next();
        } catch (error) {
            console.error('JWT Error:', error);
            res.status(401).json({ message: 'Not authorized, invalid token' });
        }
    } else {
        res.status(401).json({ message: 'Not authorized, no token' });
    }
};

module.exports = { protect };
