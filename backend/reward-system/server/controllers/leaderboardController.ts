import { Request, Response } from 'express';
import Leaderboard, { ILeaderboard } from '../models/Leaderboard';

// Get all leaderboard entries
export const getLeaderboard = async (req: Request, res: Response) => {
  try {
    const leaderboard = await Leaderboard.find();
    res.status(200).json(leaderboard);
  } catch (error) {
    console.error('Error getting leaderboard:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// Get a single leaderboard entry by ID
export const getLeaderboardEntryById = async (req: Request, res: Response) => {
  try {
    const leaderboardEntry = await Leaderboard.findById(req.params.id);
    if (!leaderboardEntry) {
      return res.status(404).json({ message: 'Leaderboard entry not found' });
    }
    res.status(200).json(leaderboardEntry);
  } catch (error) {
    console.error('Error getting leaderboard entry:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// Create a new leaderboard entry
export const createLeaderboardEntry = async (req: Request, res: Response) => {
  try {
    const newLeaderboardEntry: ILeaderboard = new Leaderboard(req.body);
    const savedLeaderboardEntry = await newLeaderboardEntry.save();
    res.status(201).json(savedLeaderboardEntry);
  } catch (error) {
    console.error('Error creating leaderboard entry:', error);
    res.status(400).json({ message: 'Invalid data' });
  }
};

// Update an existing leaderboard entry
export const updateLeaderboardEntry = async (req: Request, res: Response) => {
  try {
    const updatedLeaderboardEntry = await Leaderboard.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updatedLeaderboardEntry) {
      return res.status(404).json({ message: 'Leaderboard entry not found' });
    }
    res.status(200).json(updatedLeaderboardEntry);
  } catch (error) {
    console.error('Error updating leaderboard entry:', error);
    res.status(400).json({ message: 'Invalid data' });
  }
};

// Delete a leaderboard entry
export const deleteLeaderboardEntry = async (req: Request, res: Response) => {
  try {
    const deletedLeaderboardEntry = await Leaderboard.findByIdAndDelete(req.params.id);
    if (!deletedLeaderboardEntry) {
      return res.status(404).json({ message: 'Leaderboard entry not found' });
    }
    res.status(200).json({ message: 'Leaderboard entry deleted' });
  } catch (error) {
    console.error('Error deleting leaderboard entry:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};