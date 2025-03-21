import mongoose, { Schema, Document } from 'mongoose';

/**
 * Interface representing a Reward document in MongoDB.
 */
interface IReward extends Document {
  __v: any;
  rewardType: string;
  points: number;
  description: string;
  date: Date;
  rewardAmount: string;
  employee_id: string; 
}

/**
 * Mongoose schema for the Reward model.
 */
const RewardSchema: Schema = new Schema({
  rewardType: { type: String, required: true }, // Type of reward (e.g., "Game Time", "Gym Membership")
  points: { type: Number, required: true }, // Points associated with the reward
  description: { type: String, required: true }, // Description of the reward
  date: { type: Date, default: Date.now }, // Date when the reward was created
  rewardAmount: { type: String, required: true }, // Amount of the reward (e.g., "5000" for gym membership)
  employee_id: { type: String, required: true }, // ID of the employee receiving the reward
});

/**
 * Mongoose model for the Reward schema.
 */
const Reward = mongoose.model<IReward>('Reward', RewardSchema);

export default Reward;
export { IReward };