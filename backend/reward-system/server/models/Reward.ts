import mongoose, { Schema, Document } from 'mongoose';

interface IReward extends Document {
  memberId: mongoose.Types.ObjectId;  // Reference to TeamMember
  date: Date;
  rewardType: string;  // E.g., "Game Time", "Bonus Points", "Gift Card"
  rewardAmount: number;
  description?: string;   // Optional: Description of the reward
}

const RewardSchema: Schema = new Schema({
  memberId: { type: Schema.Types.ObjectId, ref: 'TeamMember', required: true },
  date: { type: Date, required: true },
  rewardType: { type: String, required: true },
  rewardAmount: { type: Number, required: true },
  description: { type: String },
});

// Use the second database connection
const Reward = mongoose.connections[1].model<IReward>('Reward', RewardSchema);

export default Reward;
export { IReward };