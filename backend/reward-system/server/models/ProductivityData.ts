import mongoose, { Schema, Document, Types } from 'mongoose';

interface IProductivityData extends Document {
  memberId: Types.ObjectId;  // Reference to TeamMember (crucial - _id)
  employee_id: string;       // Adding employee_id
  date: Date;
  productivity_score: number;
  total_productive_time: number;
  total_time: number;
  total_unproductive_time: number;
}

const ProductivityDataSchema: Schema = new Schema({
  memberId: { type: Schema.Types.ObjectId, ref: 'TeamMember', required: true },
  employee_id: { type: String, required: true },  // Adding employee_id to the schema
  date: { type: Date, required: true },
  productivity_score: { type: Number, required: true },
  total_productive_time: { type: Number, required: true },
  total_time: { type: Number, required: true },
  total_unproductive_time: { type: Number, required: true },
}, {
  timestamps: true //Add timestamps
});

const ProductivityData = mongoose.model<IProductivityData>('ProductivityData', ProductivityDataSchema);

export default ProductivityData;
export { IProductivityData };