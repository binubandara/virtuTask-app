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
      name: "Game Time Reward",
      points: totalScore
    };

    const newReward = await Reward.create(rewardData);
    return newReward;
  } catch (error) {
    console.error('Error calculating and awarding rewards:', error);
    throw error;
  }
};


// Calculate Monthly Gym Membership Rewards
const calculateMonthlyGymMembership = async (memberId: string): Promise<IReward | null> => {
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

    // Get the start and end dates of the current month
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    // Find productivity data for the member within the current month
    const productivityData = await ProductivityData.find({
      memberId: member._id,
      date: { $gte: startOfMonth, $lte: endOfMonth }
    });

    if (!productivityData || productivityData.length === 0) {
      console.warn('No productivity data found for this member this month');
      return null;
    }

    let monthlyScore = 0;
    for (const data of productivityData) {
      monthlyScore += data.productivity_score;
    }

    const requiredMonthlyScoreForGymMembership = 1000;  // Required monthly score to get this reward
    if (monthlyScore >= requiredMonthlyScoreForGymMembership) {
      const rewardData = {
        memberId: member._id,
        date: new Date(),
        rewardType: "Gym Membership",
        rewardAmount: 1, // Or anything that reflects to the user that they have the reward
        description: `Gym membership awarded for total productivity of ${monthlyScore.toFixed(2)} points in ${startOfMonth.toLocaleDateString('default', { month: 'long', year: 'numeric' })}`,
        name: "Monthly Gym Membership",
        points: monthlyScore
      };

      const newReward = await Reward.create(rewardData);
      return newReward;
    } else {
      console.log(`Member did not meet the required monthly score for gym membership: ${monthlyScore.toFixed(2)} / ${requiredMonthlyScoreForGymMembership}`);
      return null;
    }
  } catch (error) {
    console.error('Error calculating and awarding gym membership:', error);
    throw error;
  }
};

// Trigger reward calculation for a member
export const triggerRewardCalculation = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { memberId } = req.params;

    // Calculate and award game time reward
    const gameTimeReward = await calculateAndAwardRewards(memberId);

    // Calculate and award gym membership reward
    const gymMembershipReward = await calculateMonthlyGymMembership(memberId);

    const rewards = [];

    if (gameTimeReward) {
      rewards.push({
        name: gameTimeReward.name,
        points: gameTimeReward.points,
        rewardAmount: gameTimeReward.rewardAmount, // Include rewardAmount in the response
        description: gameTimeReward.description,
        date: gameTimeReward.date,
        _id: gameTimeReward._id,
      });
    }

    if (gymMembershipReward) {
      rewards.push({
        name: gymMembershipReward.name,
        points: gymMembershipReward.points,
        rewardAmount: gymMembershipReward.rewardAmount, // Include rewardAmount in the response
        description: gymMembershipReward.description,
        date: gymMembershipReward.date,
        _id: gymMembershipReward._id,
      });
    }

    if (rewards.length > 0) {
      res.status(200).json({
        message: 'Rewards calculated and awarded successfully!',
        rewards: rewards  // Return an array of rewards
      });
    } else {
      res.status(200).json({ message: 'No rewards given!', rewards: [] }); // Return an empty array
    }
  } catch (error) {
    console.error('Error triggering reward calculation:', error);
    next(error);
  }
};