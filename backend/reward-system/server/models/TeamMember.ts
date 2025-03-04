import mongoose, { Schema, Document } from 'mongoose';

interface ITeamMember extends Document {
  name: string;
  email: string;
  employee_id: string; // Add the employee_id field
  // Other employee details (e.g., job title)
}

const TeamMemberSchema: Schema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  employee_id: { type: String, required: true }, // Add the employee_id field
  // Other fields
});

export default mongoose.model<ITeamMember>('TeamMember', TeamMemberSchema);
export { ITeamMember };