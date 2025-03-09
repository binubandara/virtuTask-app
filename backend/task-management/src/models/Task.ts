import mongoose, { Schema, Document } from 'mongoose';

interface IComment extends Document {
  text: string;
  author: string;
  createdAt: Date;
}

interface IAssignee extends Document {
  _id: mongoose.Types.ObjectId;
  status: string;
  name: string;
  userId: string;
  initial: string;
  avatarColor: string;
}

export interface IAttachment {
  _id: mongoose.Types.ObjectId; // Add this line
  filename: string;
  filePath: string;
  fileSize: number;
  fileType: string;
}

interface ITask extends Document {
  task_id: string;
  name: string;
  dueDate: Date;
  priority: string;
  status: string;
  assignees: IAssignee[];
  description: string;
  project_id: string; // Ensure this is a string
  comments: IComment[];
  createdAt: Date;
  updatedAt: Date;
  attachments: IAttachment[];
}

const CommentSchema: Schema = new Schema({
  text: { type: String, required: true },
  author: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

const AssigneeSchema: Schema = new Schema({
  status: { type: String, required: true },
  name: { type: String, required: true },
  userId: { type: String, required: true },
  initial: { type: String, required: true },
  avatarColor: { type: String, required: true }
}, { _id: true });

const TaskSchema: Schema = new Schema({
  task_id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  dueDate: { type: Date, required: true },
  priority: { type: String, default: 'Medium' },
  status: { type: String, default: 'Pending' },
  assignees: [AssigneeSchema],
  description: { type: String, default: '' },
  project_id: { type: String, required: true }, // Ensure this is a string
  comments: [CommentSchema],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  attachments: [{
    _id: { type: mongoose.Types.ObjectId, required: true }, // Add this line
    filename: { type: String },
    filePath: { type: String },
    fileSize: { type: Number },
    fileType: { type: String },
  }],
});

export const Task = mongoose.model<ITask>('Task', TaskSchema);
export const Comment = mongoose.model<IComment>('Comment', CommentSchema);