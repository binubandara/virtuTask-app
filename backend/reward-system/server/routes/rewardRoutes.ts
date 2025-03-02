import express from 'express';
import {
  getAllRewards,
  getRewardById,
  createReward,
  updateReward,
  deleteReward,
  calculateAndAwardRewards,
  triggerRewardCalculation,
} from '../controllers/rewardController';

const router = express.Router();

router.get('/', getAllRewards);
router.get('/:id', getRewardById);
router.post('/', createReward);  
router.put('/:id', updateReward);  
router.delete('/:id', deleteReward);
router.post('/:memberId/calculate', triggerRewardCalculation);  

export default router;