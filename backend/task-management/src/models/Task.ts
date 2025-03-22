import mongoose, { Schema, Document } from 'mongoose';

interface IComment extends Document {
  text: string;
  author: string;
  createdAt: Date;
}

export interface IAttachment {
  _id: mongoose.Types.ObjectId;
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
  assignees: {
    user: string;  // Reference to User model
    status: string;               // Status of the assignee for this task
  }[];
  description: string;
  project_id: string;
  comments: IComment[];
  createdAt: Date;
  updatedAt: Date;
  attachments: IAttachment[];
  createdBy: String;
}

const CommentSchema: Schema = new Schema({
  text: { type: String, required: true },
  author: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

const TaskSchema: Schema = new Schema({
  task_id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  dueDate: { type: Date, required: true },
  priority: { type: String, default: 'Medium' },
  status: { type: String, default: 'Pending' },
  assignees: [{
    user: { type: String, required: true },
    status: { type: String, required: true, default: 'Pending' }
  }],
  description: { type: String, default: '' },
  project_id: { type: String, required: true },
  comments: [CommentSchema],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  attachments: [{
    _id: { type: mongoose.Types.ObjectId, required: true },
    filename: { type: String },
    filePath: { type: String },
    fileSize: { type: Number },
    fileType: { type: String },
  }],
  createdBy: {
    type: String,
    ref: 'User',
    required: true
  }
});

export const Task = mongoose.model<ITask>('Task', TaskSchema);
export const Comment = mongoose.model<IComment>('Comment', CommentSchema);