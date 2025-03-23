import express, { Request, Response } from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';

import rewardRoutes from './routes/rewardRoutes';
import { authMiddleware } from './middleware/authMiddleware'; // Import the authMiddleware

// Load environment variables
dotenv.config();

// Initialize express app
const app = express();
const PORT = process.env.PORT || 5006;

// Middleware
app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI as string)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// Routes



// Apply authMiddleware to the reward routes
app.use('/api', authMiddleware, rewardRoutes);

app.use('/api', rewardRoutes);

// Basic route (no authentication)
app.get('/', (req: Request, res: Response) => {
  res.send('Productivity Reward System API is running');
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});