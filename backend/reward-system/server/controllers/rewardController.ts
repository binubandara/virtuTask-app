import { Request, Response } from 'express';
import mongoose from 'mongoose';
import Reward from '../models/Reward'; 

/**
 * Calculate and award rewards (PROTECTED endpoint)
 * @param req - Express request object
 * @param res - Express response object
 */
export const calculateGameRewards = async (req: Request, res: Response): Promise<void> => {
  try {
    // 1. Authentication and Authorization
    const employee_id = req.employee_id;  

    if (!employee_id) {
      console.error('Invalid employee_id:', employee_id);
      res.status(401).json({ message: 'Unauthorized: Invalid user ID' });
      return;
    }

    // 2. Retrieve Productivity Data from "productivity_tracker" Collection
    if (!mongoose.connection.db) {
      console.error('Database connection is not established');
      res.status(500).json({ message: 'Database connection is not established' });
      return;
    }
    const productivityCollection = mongoose.connection.db.collection('productivity_tracker'); // Replace 'productivity_tracker' with your actual collection name

    // Assuming you want data for the current employee
    console.log('Querying productivity data for employee_id:', employee_id);
    const productivityData = await productivityCollection.find({ employee_id: employee_id }).toArray();

    console.log('Productivity data retrieved:', productivityData);

    if (!productivityData || productivityData.length === 0) {
      console.warn('No productivity data found for this member:', employee_id);
      res.status(404).json({ message: 'No productivity data found' });
      return;
    }

    // 3. Calculate Total Score
    let totalScore = 0;
    for (const data of productivityData) {
      if (data.productivity_score !== undefined && typeof data.productivity_score === 'number') {
        totalScore += data.productivity_score;
      } else {
        console.warn(`Invalid productivity_score found in data:`, data);
        // Handle invalid score appropriately (e.g., skip, return error, etc.)
      }
    }

    // 4. Determine Reward Amount (Game Time)
    let minutesReward = 0;
    if (totalScore >= 90) {
      minutesReward = 60;
    } else if (totalScore >= 75) {
      minutesReward = 30;
    } else if (totalScore >= 50) {
      minutesReward = 15;
    } 

    // 5. Create Reward Data
    const rewardData = {
      employee_id: employee_id, 
      date: new Date(),
      rewardType: "Game Time",
      rewardAmount: minutesReward,
      description: `Reward for productivity on ${new Date().toLocaleDateString()}`,
      name: "Game Time Reward",
      points: totalScore
    };

    // 6. Create and Save the Reward
    const newReward = await Reward.create(rewardData);

    // 7. Send Response
    res.status(201).json(newReward); 
  } catch (error: any) {
    console.error('Error calculating and awarding rewards:', error);
    res.status(500).json({ message: 'Failed to calculate and award rewards', error: error.message });
  }
};