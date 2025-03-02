import { Request, Response, NextFunction } from 'express';
import Reward, { IReward } from '../models/Reward';
import ProductivityData from '../models/ProductivityData';
import TeamMember from '../models/TeamMember';
import mongoose from 'mongoose';

// Get all rewards
export const getAllRewards = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const rewards = await Reward.find();
    res.status(200).json(rewards);
  } catch (error) {
    console.error('Error getting rewards:', error);
    next(error);
  }
};

// Get a single reward by ID
export const getRewardById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const reward = await Reward.findById(req.params.id);
    if (!reward) {
      res.status(404).json({ message: 'Reward not found' });
      return;
    }
    res.status(200).json(reward);
  } catch (error) {
    console.error('Error getting reward:', error);
    next(error);
  }
};

// Create a new reward
export const createReward = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const newReward: IReward = new Reward(req.body);
    const savedReward = await newReward.save();
    res.status(201).json(savedReward);
  } catch (error) {
    console.error('Error creating reward:', error);
    next(error);
  }
};

// Update an existing reward
export const updateReward = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const updatedReward = await Reward.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updatedReward) {
      res.status(404).json({ message: 'Reward not found' });
      return;
    }
    res.status(200).json(updatedReward);
  } catch (error) {
    console.error('Error updating reward:', error);
    next(error);
  }
};

// Delete a reward
export const deleteReward = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const deletedReward = await Reward.findByIdAndDelete(req.params.id);
    if (!deletedReward) {
      res.status(404).json({ message: 'Reward not found' });
      return;
    }
    res.status(200).json({ message: 'Reward deleted' });
  } catch (error) {
    console.error('Error deleting reward:', error);
    next(error);
  }
};

// Calculate and award rewards
export const calculateAndAwardRewards = async (memberId: string): Promise<IReward | null> => {
  try {
    if (!memberId || !mongoose.isValidObjectId(memberId)) {
      console.error('Invalid memberId');
      throw new Error('Invalid memberId');
    }

    const member = await TeamMember.findById(memberId);
    if (!member) {
      console.error('Member not found');
      throw new Error('Member not found');
    }

    const productivityData = await ProductivityData.find({ memberId: memberId });

    if (!productivityData || productivityData.length === 0) {
      console.warn('No productivity data found for this member');
      return null;
    }

    let totalScore = 0;
    for (const data of productivityData) {
      totalScore += data.productivity_score;
    }

    let minutesReward = 0;
    if (totalScore >= 90) {
      minutesReward = 60;
    } else if (totalScore >= 75) {
      minutesReward = 30;
    } else if (totalScore >= 50) {
      minutesReward = 15;
    } else {
      minutesReward = 0;
    }

    const rewardData = {
      memberId: member._id,
      date: new Date(),
      rewardType: "Game Time",
      rewardAmount: minutesReward,
      description: `Reward for productivity on ${new Date().toLocaleDateString()}`,
      name: "Productivity Reward", // Add the required name field
      points: totalScore // Add the required points field
    };

    const newReward = await Reward.create(rewardData);
    return newReward;
  } catch (error) {
    console.error('Error calculating and awarding rewards:', error);
    throw error;
  }
};

// Trigger reward calculation for a member
export const triggerRewardCalculation = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { memberId } = req.params; // Get memberId from request params
    const newReward = await calculateAndAwardRewards(memberId);
    if (newReward) {
      res.status(200).json({ message: 'Reward calculated and awarded successfully!', reward: newReward });
    } else {
      res.status(200).json({ message: 'No reward given!', reward: newReward });
    }
  } catch (error) {
    console.error('Error triggering reward calculation:', error);
    next(error);
  }
};