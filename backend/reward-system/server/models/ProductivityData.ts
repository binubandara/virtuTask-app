import mongoose, { Schema, Document } from 'mongoose';

interface IProductivityData extends Document {
  memberId: mongoose.Types.ObjectId;  // Reference to TeamMember (crucial)
  date: Date;
  productivity_score: number;
  total_productive_time: number;
  total_time: number;
  total_unproductive_time: number;
}

const ProductivityDataSchema: Schema = new Schema({
  memberId: { type: Schema.Types.ObjectId, ref: 'TeamMember', required: true },
  date: { type: Date, required: true },
  productivity_score: { type: Number, required: true },
  total_productive_time: { type: Number, required: true },
  total_time: { type: Number, required: true },
  total_unproductive_time: { type: Number, required: true },
});

export default mongoose.model<IProductivityData>('ProductivityData', ProductivityDataSchema);
export { IProductivityData };