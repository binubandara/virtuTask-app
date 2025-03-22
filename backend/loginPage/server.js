require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const mongoose = require('mongoose');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5001;

// CORS configuration with specific origin
app.use(cors({
    origin: 'http://localhost:5173', // frontend URL
    credentials: true,               // Allow credentials
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const fs = require('fs');
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

// Define a function to initialize the routes
const initializeRoutes = () => {
    const authRoutes = require('./routes/authRoutes');
    const reminderRoutes = require('./routes/reminderRoutes');
    const userProfileRoutes = require('./routes/userProfileRoutes');

    app.use('/api/auth', authRoutes);
    app.use('/api/reminders', reminderRoutes);
    app.use('/api/users', userProfileRoutes);

    // Basic route
    app.get('/', (req, res) => {
        res.json({ message: 'Welcome to the authentication API' });
    });
};

// Start the server
const startServer = async () => {
    try {
        // Connect to MongoDB first
        await connectDB();
        mongoose.set('debug', true);
        console.log('Database connected, initializing routes...');
        
        // Initialize routes after successfully connecting
        initializeRoutes();

        // Start the server
        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });
    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
};

// Call startServer to begin the sequence
startServer();