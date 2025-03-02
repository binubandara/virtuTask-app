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
    // 1. Validate Input: Make sure memberId is valid
    if (!memberId || !mongoose.isValidObjectId(memberId)) {
      console.error('Invalid memberId');
      throw new Error('Invalid memberId');
    }

    // 2. Find the TeamMember
    const member = await TeamMember.findById(memberId);
    if (!member) {
      console.error('Member not found');
      throw new Error('Member not found');
    }

    // 3. Get all productivity for the member
    const productivityData = await ProductivityData.find({ memberId: memberId });

    // 4. Check if there is any data
    if (!productivityData || productivityData.length === 0) {
      console.warn('No productivity data found for this member');
      return null; // No reward if no productivity data
    }

    // 5. Calculate Reward: Sum and determine amount based on score
    let totalScore = 0;
    for (const data of productivityData) {
      totalScore += data.productivity_score;
    }

    let minutesReward = 0;
    if (totalScore >= 90) {
      minutesReward = 60; // 1 hour of game time
    } else if (totalScore >= 75) {
      minutesReward = 30; // 30 minutes of game time
    } else if (totalScore >= 50) {
      minutesReward = 15; // 15 minutes of game time
    } else {
      minutesReward = 0; // no game time
    }

    // 6. Create the reward data
    const rewardData = {
      memberId: member._id,
      date: new Date(),
      rewardType: "Game Time",
      rewardAmount: minutesReward,
      description: `Reward for productivity on ${new Date().toLocaleDateString()}`,
    };

    // 7. Create the reward record
    const newReward = await Reward.create(rewardData);
    return newReward;
  } catch (error) {
    console.error('Error calculating and awarding rewards:', error);
    throw error; // Re-throw the error for handling elsewhere
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