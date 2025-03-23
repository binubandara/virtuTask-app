import mongoose, { Schema, Document } from 'mongoose';

interface IReward extends Document {
  __v: any;
  rewardType: string;
  points: number;
  description: string;
  date: Date;
  rewardAmount: string; // Add the rewardAmount field
  employee_id: string; // Add the employee_id field
}

const RewardSchema: Schema = new Schema({
  rewardType: { type: String, required: true },
  points: { type: Number, required: true },
  description: { type: String, required: true },
  date: { type: Date, default: Date.now },
  rewardAmount: { type: String, required: true }, // Add the rewardAmount field
  employee_id: { type: String, required: true }, // Add the employee_id field
});

const Reward = mongoose.model<IReward>('Reward', RewardSchema);

export default Reward;
export { IReward };