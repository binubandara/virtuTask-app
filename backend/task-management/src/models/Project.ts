import mongoose, { Schema, Document } from 'mongoose';

export interface IProject extends Document {
  project_id: string;
  name: string;
  description: string;
  startDate: Date;
  dueDate: Date;
  status: string;
  tasks: mongoose.Types.ObjectId[];
}

const ProjectSchema: Schema = new Schema({
  project_id: { type: String, required: true, unique: true }, 
  name: { type: String, required: true },
  description: { type: String, required: true },
  startDate: { type: Date, required: true },
  dueDate: { type: Date, required: true },
  status: { type: String, default: 'Active' },
  tasks: [{ type: String, ref: 'Task' }] 
});

export const Project = mongoose.model<IProject>('Project', ProjectSchema);