import mongoose, { Schema, Document } from 'mongoose';

interface IReward extends Document {
  __v: any;
  name: string;
  points: number;
  description: string;
  date: Date;
  rewardAmount: number; // Add the rewardAmount field
}

const RewardSchema: Schema = new Schema({
  name: { type: String, required: true },
  points: { type: Number, required: true },
  description: { type: String, required: true },
  date: { type: Date, default: Date.now },
  rewardAmount: { type: Number, required: true }, // Add the rewardAmount field
});

const Reward = mongoose.model<IReward>('Reward', RewardSchema);

export default Reward;
export { IReward };