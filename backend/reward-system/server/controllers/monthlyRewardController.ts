import { Request, Response } from 'express';
import mongoose from 'mongoose';
import Reward from '../models/Reward'; // Adjust path

// Calculate and award monthly gym membership rewards
export const calculateMonthlyGymMembership = async (req: Request, res: Response): Promise<void> => {
  try {
    // 1. Authentication and Authorization
    const employee_id = req.employee_id;  // Get employee_id from authMiddleware

    if (!employee_id) {
      console.error('Unauthorized: Missing employee_id');
      res.status(401).json({ message: 'Unauthorized: Missing employee ID' });
      return;
    }

    // 2. Get the start and end dates of the current month
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    // 3. Access productivity Data collection directly using mongoose.connection
    if (!mongoose.connection.db) {
      console.error('Database connection is not established');
      res.status(500).json({ message: 'Database connection is not established' });
      return;
    }
    const productivityCollection = mongoose.connection.db.collection('productivity_tracker'); // Replace 'productivity_tracker' with your actual collection name

    // Find productivity data for the member within the current month
    const productivityData = await productivityCollection.find({
      employee_id: employee_id,
      date: { $gte: startOfMonth, $lte: endOfMonth }
    }).toArray();

    if (!productivityData || productivityData.length === 0) {
      console.warn('No productivity data found for this member this month');
      res.status(404).json({ message: 'No productivity data found for this employee this month' });
      return;
    }

    // 4. Calculate Monthly average Score
    let totalScore = 0;
    for (const data of productivityData) {
      if (data.productivity_score !== undefined && typeof data.productivity_score === 'number') {
        totalScore += data.productivity_score;
      } else {
        console.warn(`Invalid productivity_score found in data:`, data);
        // Handle invalid score appropriately (e.g., skip, return error, etc.)
      }
    }

    const averageMonthlyScore = totalScore / productivityData.length;

    const requiredAverageMonthlyScoreForGymMembership = 75;  // Required average monthly score to get this reward
    if (averageMonthlyScore >= requiredAverageMonthlyScoreForGymMembership) {
      // 5. Create Reward Data
      const rewardData = {
        employee_id: employee_id,
        date: new Date(),
        rewardType: "Gym Membership",
        rewardAmount: "5000", // Or anything that reflects to the user that they have the reward
        description: `Gym membership awarded for average productivity of ${averageMonthlyScore.toFixed(2)} points in ${startOfMonth.toLocaleDateString('default', { month: 'long', year: 'numeric' })}`,
        name: "Monthly Gym Membership",
        points: averageMonthlyScore
      };

      // 6. Create and Save the Reward
      const newReward = await Reward.create(rewardData);

      // 7. Send Response
      res.status(201).json(newReward); // Send the newly created reward object
    } else {
      console.log(`Member did not meet the required monthly average score for gym membership: ${averageMonthlyScore.toFixed(2)} / ${requiredAverageMonthlyScoreForGymMembership}`);
      res.status(200).json({ message: `Did not meet the required monthly average score for gym membership: ${averageMonthlyScore.toFixed(2)} / ${requiredAverageMonthlyScoreForGymMembership}` }); // Status 200 is more appropriate here
      return;
    }
  } catch (error: any) {
    console.error('Error calculating and awarding gym membership:', error);
    res.status(500).json({ message: 'Failed to calculate and award gym membership', error: error.message });
  }
};

// Get monthly gym membership reward for an employee (PROTECTED endpoint)
export const getMonthlyReward = async (req: Request, res: Response): Promise<void> => {
    try {
        // 1. Authentication and Authorization
        const employee_id = req.employee_id;  // Get employee_id from authMiddleware

        if (!employee_id) {
            console.error('Unauthorized: Missing employee_id');
            res.status(401).json({ message: 'Unauthorized: Missing employee ID' });
            return;
        }

        // 2. Get the start and end dates of the current month
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

        // 3. Retrieve Reward from the Database (for the current month)
        const reward = await Reward.findOne({
            employee_id: employee_id,
            rewardType: "Gym Membership",
            date: { $gte: startOfMonth, $lte: endOfMonth }
        });

        if (!reward) {
            console.warn('No gym membership reward found for this employee this month:', employee_id);
            res.status(404).json({ message: 'No gym membership reward found for this employee this month' });
            return;
        }

        // 4. Send Response
        res.status(200).json(reward); // Send the Reward object

    } catch (error: any) {
        console.error('Error getting gym membership reward:', error);
        res.status(500).json({ message: 'Failed to get gym membership reward', error: error.message });
        return;
    }
};