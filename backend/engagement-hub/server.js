const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');
const engagementRoutes = require('./routes/engagement.routes');

// Load env vars
dotenv.config();

// Connect to database
connectDB();

const app = express();

// Frontend origin
const frontendOrigin = process.env.NODE_ENV === 'development' 
  ? 'http://localhost:5173'  // Vite default port
  : 'http://localhost:5173'; 

// Configured CORS middleware
app.use(cors({
  origin: frontendOrigin,  // Specific origin instead of wildcard '*'
  credentials: true,       // Allow credentials (cookies, auth headers)
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'user-id']
}));

// Middleware
app.use(express.json());

// Routes
app.use('/api/engagement-hub', engagementRoutes);

// Basic route for testing
app.get('/', (req, res) => {
  res.send('Engagement Hub API is running');
});

// Set port
const PORT = process.env.PORT || 5000;

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`CORS enabled for origin: ${frontendOrigin}`);
});