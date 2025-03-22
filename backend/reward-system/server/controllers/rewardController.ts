import { Request, Response } from 'express';
import mongoose from 'mongoose';
import Reward from '../models/Reward'; // Adjust path to the correct location

// Calculate and award rewards (PROTECTED endpoint)
export const calculateGameRewards = async (req: Request, res: Response): Promise<void> => {
  try {
    // 1. Authentication and Authorization
    const employee_id = req.employee_id;  // Get employee_id from authMiddleware

    if (!employee_id) {
      console.error('Invalid employee_id:', employee_id);
      res.status(401).json({ message: 'Unauthorized: Invalid user ID' });
      return;
    }

    // 2. Retrieve Productivity Data from "productivity_tracker" Collection
    // Access the database and collection directly using mongoose.connection
    if (!mongoose.connection.db) {
      console.error('Database connection is not established');
      res.status(500).json({ message: 'Database connection is not established' });
      return;
    }
    const productivityCollection = mongoose.connection.db.collection('daily_scores'); // Replace 'productivity_tracker' with your actual collection name

    // Assuming you want data for the current employee
    const productivityData = await productivityCollection.find({ employee_id: employee_id }).toArray();

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
    } // No "else", so the reward will be 0 if none of the conditions are met.

    // 5. Create Reward Data
    const rewardData = {
      employee_id: employee_id, // Using employee_id from auth middleware
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
    res.status(201).json(newReward); // Send the newly created reward object

  } catch (error: any) {
    console.error('Error calculating and awarding rewards:', error);
    res.status(500).json({ message: 'Failed to calculate and award rewards', error: error.message }); // Include error message
  }
};

// Get the most recent GAME TIME reward for an employee for today (PROTECTED endpoint)
export const getGameTimeReward = async (req: Request, res: Response): Promise<void> => {
  try {
      // 1. Authentication and Authorization
      const employee_id = req.employee_id;  // Get employee_id from authMiddleware

      if (!employee_id) {
          console.error('Unauthorized: Missing employee_id');
           res.status(401).json({ message: 'Unauthorized: Missing employee ID' });
           return;
      }

      // 2. Get today's date (start and end)
      const now = new Date();
      const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1); // Up to, but not including, the next day

      // 3. Retrieve the most recent GAME TIME Reward from the Database for today
      const reward = await Reward.findOne({
          employee_id: employee_id,
          rewardType: "Game Time",
          date: { $gte: startOfDay, $lt: endOfDay }  // Find rewards within today's date range
      })
      .sort({ date: -1 })  // Sort by date in descending order (most recent first))
      .limit(1); // Limit to 1 result (the most recent)

      if (!reward) {
          console.warn('No game time reward found for this employee today:', employee_id);
           res.status(404).json({ message: 'No game time reward found for this employee today' });
           return;
      }

      // 4. Send Response
      res.status(200).json(reward); // Send the Game Time reward object

  } catch (error: any) {
      console.error('Error getting game time reward:', error);
       res.status(500).json({ message: 'Failed to get game time reward', error: error.message });
       return;
  }
};

// Get a specific reward by ID (PROTECTED endpoint)
export const getRewardById = async (req: Request, res: Response): Promise<void> => {
    try {
        // 1. Authentication and Authorization
        const employee_id = req.employee_id;  // Get employee_id from authMiddleware

        if (!employee_id) {
            console.error('Unauthorized: Missing employee_id');
             res.status(401).json({ message: 'Unauthorized: Missing employee ID' });
             return;
        }

        // 2. Get Reward ID from Request Parameters
        const rewardId = req.params.id;

        if (!rewardId || !mongoose.isValidObjectId(rewardId)) {
            console.error('Invalid rewardId:', rewardId);
             res.status(400).json({ message: 'Invalid reward ID format' });
             return;
        }

        // 3. Retrieve Reward from the Database (Ensuring Ownership)
        const reward = await Reward.findOne({
            _id: rewardId,
            employee_id: employee_id // Crucial: Ensure the reward belongs to the employee
        });

        if (!reward) {
            console.warn(`Reward not found for employee ${employee_id} with ID ${rewardId}`);
             res.status(404).json({ message: 'Reward not found' });
              return; 
        }

        // 4. Send Response
        res.status(200).json(reward);

    } catch (error: any) {
        console.error('Error getting reward by ID:', error);
         res.status(500).json({ message: 'Failed to get reward', error: error.message });
         return;  
    }
};

// Get all rewards for an employee, sorted by date (most recent first) (PROTECTED endpoint)
export const getAllRewardsForEmployee = async (req: Request, res: Response): Promise<void> => {
    try {
        // 1. Authentication and Authorization
        const employee_id = req.employee_id;  // Get employee_id from authMiddleware

        if (!employee_id) {
            console.error('Unauthorized: Missing employee_id');
              res.status(401).json({ message: 'Unauthorized: Missing employee ID' });
             return;
        }

        // 2. Retrieve Rewards from the Database, sorted by date (descending)
        const rewards = await Reward.find({ employee_id: employee_id })
                                   .sort({ date: -1 }); // Sort by date in descending order (most recent first)

        if (!rewards || rewards.length === 0) {
            console.warn('No rewards found for employee:', employee_id);
              res.status(404).json({ message: 'No rewards found for this employee' });
              return;
        }

        // 3. Send Response
        res.status(200).json(rewards); // Send the array of reward objects

    } catch (error: any) {
        console.error('Error getting rewards:', error);
          res.status(500).json({ message: 'Failed to get rewards', error: error.message });
          return;
    }
};