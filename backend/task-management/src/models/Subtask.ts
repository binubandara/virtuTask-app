import mongoose, { Schema, Document } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

// Interface for the Subtask document
export interface ISubtask extends Document {
  subtask_id: string;
  task_id: string;
  project_id: string;  // Add project_id
  assignee_id: string;
  subtask: string;
}

// Subtask Schema
const SubtaskSchema: Schema = new Schema({
  subtask_id: {
    type: String,
    default: uuidv4,
    required: true,
    unique: true,
  },
  task_id: {
    type: String,
    required: true,
  },
  project_id: { // Add project_id to the schema
        type: String,
        required: true,
  },
  assignee_id: {
    type: String,
    required: true,
  },
  subtask: {
    type: String,
    required: true,
  },
});

// Create the Subtask model
const Subtask = mongoose.model<ISubtask>('Subtask', SubtaskSchema);

export default Subtask;