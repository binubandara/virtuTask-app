import { Request, Response, NextFunction } from 'express';
import Leaderboard, { ILeaderboard } from '../models/Leaderboard';

// Get the entire leaderboard
export const getLeaderboard = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const leaderboard = await Leaderboard.find().sort({ rank: 1 }); // Sort by rank (ascending)
    res.status(200).json(leaderboard);
  } catch (error) {
    console.error('Error getting leaderboard:', error);
    next(error);
  }
};

// Get a single leaderboard entry by ID
export const getLeaderboardEntryById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const leaderboardEntry = await Leaderboard.findById(req.params.id);
    if (!leaderboardEntry) {
      res.status(404).json({ message: 'Leaderboard entry not found' });
      return;
    }
    res.status(200).json(leaderboardEntry);
  } catch (error) {
    console.error('Error getting leaderboard entry:', error);
    next(error);
  }
};

// Create a new leaderboard entry (usually done by the system, not directly)
export const createLeaderboardEntry = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const newLeaderboardEntry: ILeaderboard = new Leaderboard(req.body);
    const savedLeaderboardEntry = await newLeaderboardEntry.save();
    res.status(201).json(savedLeaderboardEntry);
  } catch (error) {
    console.error('Error creating leaderboard entry:', error);
    next(error);
  }
};

// Update an existing leaderboard entry (e.g., when scores change)
export const updateLeaderboardEntry = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const updatedLeaderboardEntry = await Leaderboard.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updatedLeaderboardEntry) {
      res.status(404).json({ message: 'Leaderboard entry not found' });
      return;
    }
    res.status(200).json(updatedLeaderboardEntry);
  } catch (error) {
    console.error('Error updating leaderboard entry:', error);
    next(error);
  }
};

// Delete a leaderboard entry
export const deleteLeaderboardEntry = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const deletedLeaderboardEntry = await Leaderboard.findByIdAndDelete(req.params.id);
    if (!deletedLeaderboardEntry) {
      res.status(404).json({ message: 'Leaderboard entry not found' });
      return;
    }
    res.status(200).json({ message: 'Leaderboard entry deleted' });
  } catch (error) {
    console.error('Error deleting leaderboard entry:', error);
    next(error);
  }
};