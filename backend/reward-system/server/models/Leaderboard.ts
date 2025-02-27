import mongoose, { Schema, Document } from 'mongoose';

interface ILeaderboard extends Document {
  memberId: mongoose.Types.ObjectId;  // Reference to TeamMember
  rank: number;
  score: number;  // Score used for ranking (e.g., totalRewardPoints, productivityScore)
  lastUpdated: Date;
}

const LeaderboardSchema: Schema = new Schema({
  memberId: { type: Schema.Types.ObjectId, ref: 'TeamMember', required: true },
  rank: { type: Number, required: true },
  score: { type: Number, required: true },
  lastUpdated: { type: Date, default: Date.now },
});

const Leaderboard = mongoose.model<ILeaderboard>('Leaderboard', LeaderboardSchema);

export default Leaderboard;
export { ILeaderboard };