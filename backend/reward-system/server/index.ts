import express, { Request, Response } from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import productivityRoutes from './routes/productivityRoutes';
import teamMemberRoutes from './routes/teamMemberRoutes';
import leaderboardRoutes from './routes/leaderboardRoutes'; 
import rewardRoutes from './routes/rewardRoutes'; 
// Load environment variables
dotenv.config();

// Initialize express app
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI as string)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// Routes
app.use('/api/productivity', productivityRoutes);
app.use('/api/teamMembers', teamMemberRoutes);
app.use('/api/leaderboard', leaderboardRoutes); // Use leaderboard routes
app.use('/api/rewards', rewardRoutes); // Use reward routes

// Basic route
app.get('/', (req: Request, res: Response) => {
  res.send('Productivity Reward System API is running');
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});