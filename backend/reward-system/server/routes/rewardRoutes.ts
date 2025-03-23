import express from 'express';
import {
  
  calculateGameRewards,
  getGameTimeReward,
  getRewardById,
  getAllRewardsForEmployee
} from '../controllers/rewardController';

import{
  calculateMonthlyGymMembership,
  getMonthlyReward
}from '../controllers/monthlyRewardController';
import { authMiddleware } from '../middleware/authMiddleware'; // Import the authMiddleware

const router = express.Router();


router.post('/createGame',authMiddleware ,calculateGameRewards);  

// GET route to get all GAME TIME rewards for the employee
router.get('/game-time', authMiddleware, getGameTimeReward);


// Get reward by id
router.get('/rewards/:id', authMiddleware, getRewardById);


// Get all rewards for the employee
router.get('/rewards', authMiddleware, getAllRewardsForEmployee);


// POST route to calculate and award monthly gym membership rewards
router.post('/createMonthly', authMiddleware, calculateMonthlyGymMembership);

router.get('/monthly', authMiddleware, getMonthlyReward);


export default router;