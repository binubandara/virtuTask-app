import express from 'express';
import {
  calculateGameRewards,
  getGameTimeReward,
  getRewardById,
  getAllRewardsForEmployee
} from '../controllers/rewardController';
import {
  calculateMonthlyGymMembership,
  getMonthlyReward
} from '../controllers/monthlyRewardController';
import { authMiddleware } from '../middleware/authMiddleware'; // Import the authMiddleware

const router = express.Router();

// POST route to calculate and award game rewards
router.post('/createGame', authMiddleware, calculateGameRewards);

// GET route to get the most recent GAME TIME reward for the employee
router.get('/game-time', authMiddleware, getGameTimeReward);

// GET route to get a specific reward by ID
router.get('/rewards/:id', authMiddleware, getRewardById);

// GET route to get all rewards for the employee, sorted by date (most recent first)
router.get('/rewards', authMiddleware, getAllRewardsForEmployee);

// POST route to calculate and award monthly gym membership rewards
router.post('/createMonthly', authMiddleware, calculateMonthlyGymMembership);

// GET route to get the monthly gym membership reward for the employee
router.get('/monthly', authMiddleware, getMonthlyReward);

export default router;