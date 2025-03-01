const express = require('express');
const cors = require('cors');
require('dotenv').config();
const connectDB = require('./config/db');

const app = express();

// Connect to the Database
connectDB();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
const authRoutes = require('./routes/authRoutes');
const reminderRoutes = require('./routes/reminderRoutes');
const userProfileRoutes = require('./routes/userProfileRoutes');

app.use('/api/auth', authRoutes);
app.use('/api/reminders', reminderRoutes);
app.use('/api/users', userProfileRoutes);

// Basic route
app.get('/', (req, res) => {
    res.json({ message : 'Welcome to the authentication API' });
});

const PORT = process.env.PORT || 5001;

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});