// server/models/TeamMember.ts
import mongoose, { Schema, Document } from 'mongoose';

interface ITeamMember extends Document {
  name: string;
  email: string;
  // Other employee details (e.g., employee ID, job title)
}

const TeamMemberSchema: Schema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  // Other fields
});

export default mongoose.model<ITeamMember>('TeamMember', TeamMemberSchema);
export { ITeamMember };