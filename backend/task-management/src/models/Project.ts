import mongoose, { Schema, Document } from 'mongoose';

export interface IProject extends Document {
  project_id: string;
  name: string;
  description: string;
  startDate: Date;
  dueDate: Date;
  status: string;
  tasks: mongoose.Types.ObjectId[];
  department: string;
  members: 'string';
  priority: string;
  clientId: string | null;  // Allow null
  createdBy:string;   // Added User Id for authentication
}

const ProjectSchema: Schema = new Schema({
  project_id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  description: { type: String, required: true },
  startDate: { type: Date, required: true },
  dueDate: { type: Date, required: true },
  status: { type: String, default: 'Active' },
  tasks: [{ type: String, ref: 'Task' }],
  department: { type: String, required: true },
  clientId: { type: String, default: null },
  members: [{ type: String, ref: 'User' }],
  priority: { type: String, enum: ['High', 'Medium', 'Low'], default: 'Medium' },
  createdBy: {                                        //ADDED TO SCHEMA
    type: String,           //type objectid
    ref: 'User',                                    //referes to user model
    required: true                                 //is a required field
  }

});

export const Project = mongoose.model<IProject>('Project', ProjectSchema);