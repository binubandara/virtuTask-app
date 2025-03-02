import express from 'express';
import {
  getLeaderboard,
  getLeaderboardEntryById,
  createLeaderboardEntry,
  updateLeaderboardEntry,
  deleteLeaderboardEntry,
} from '../controllers/leaderboardController';

const router = express.Router();

router.get('/', getLeaderboard);
router.get('/:id', getLeaderboardEntryById);
router.post('/', createLeaderboardEntry);
router.put('/:id', updateLeaderboardEntry);
router.delete('/:id', deleteLeaderboardEntry);

export default router;