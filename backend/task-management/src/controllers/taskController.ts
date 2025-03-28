import { Request, Response } from 'express';
import { Task } from '../models/Task';
import { Project } from '../models/Project';
import { v4 as uuidv4 } from 'uuid';
import mongoose from 'mongoose';
import { io } from '../server';

// Create new task under a project
export const createTask = async (req: Request, res: Response): Promise<void> => {
  try {
    console.log('Creating new task:', req.body);

    // Access the employee's ID from auth middleware
    const employee_id = req.employee_id;
    if (!employee_id) {
      res.status(401).json({ message: 'Unauthorized: Employee not authenticated' });
      return;
    }

    // Get project_id from URL parameters
    const project_id = req.params.project_id;
    if (!project_id) {
      res.status(400).json({ message: 'Project ID is required in the URL' });
      return;
    }

    // Validate required fields from body
    const { name, dueDate, priority, status, assignees, description } = req.body;
    if (!name || !dueDate) {
      res.status(400).json({ message: 'Name and due date are required' });
      return;
    }

    // Validate assignees array
    if (!Array.isArray(assignees)) {
      res.status(400).json({ message: 'Assignees must be an array' });
      return;
    }

    // Validate each assignee
    for (const assignee of assignees) {
      if (
        typeof assignee !== 'object' ||
        !assignee.user ||
        typeof assignee.user !== 'string'
      ) {
        res.status(400).json({ message: 'Each assignee must have a valid user ID' });
        return;
      }
      if (typeof assignee.status !== 'string') {
        res.status(400).json({ message: 'Each assignee must have a valid status' });
        return;
      }
    }

    // Verify project exists
    const existingProject = await Project.findOne({ project_id });
    if (!existingProject) {
      res.status(404).json({ message: 'Project not found' });
      return;
    }

    // Create task
    const task = await Task.create({
      task_id: uuidv4(),
      name,
      dueDate: new Date(dueDate),
      priority: priority || 'Medium',
      status: status || 'Pending',
      assignees,
      description: description || '',
      project_id, // Now coming from URL params
      createdBy: employee_id,
    });

    // Notify assignees via WebSocket
    assignees.forEach((assignee: any) => {
      io.to(assignee.user).emit('task_created', task);
    });

    res.status(201).json(task);
  } catch (error: any) {
    console.error('Error creating task:', error);
    res.status(500).json({ message: 'Error creating task', error: error.message });
  }
};


// Get tasks for an employee (where employee is creator or assignee)
export const getTasks = async (req: Request, res: Response): Promise<void> => {
  try {
    // 1. Get employee ID from middleware
    const employee_id = req.employee_id;
    console.log('Fetching tasks for employee:', employee_id);

    if (!employee_id) {
      res.status(401).json({ message: 'Invalid employee credentials' });
      return;
    }

    // 2. Find tasks where the employee is an assignee or the creator
    const tasks = await Task.find({
      $or: [
        { 'assignees.user': employee_id },
        { createdBy: employee_id }
      ]
    });

    // 3. Send response
    res.status(200).json(tasks);
  } catch (error: any) {
    console.error('Error fetching tasks:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
// Get task by ID
export const getTaskById = async (req: Request, res: Response): Promise<void> => {
  try {
    // 1. Get employee ID from middleware
    const employee_id = req.employee_id;
    console.log('Fetching task for employee:', employee_id);

    if (!employee_id) {
      res.status(401).json({ message: 'Invalid employee credentials' });
      return;
    }

    // 2. Find the task by its `task_id`
    const task = await Task.findOne({ task_id: req.params.task_id });

    // 3. Check if the task exists
    if (!task) {
      console.log('Task not found:', req.params.task_id);
      res.status(404).json({ message: 'Task not found' });
      return;
    }

    // 4. Check if the employee is an assignee of the task or the creator
    const isAssignee = task.assignees.some((assignee: any) => assignee.user === employee_id);
    const isCreator = task.createdBy === employee_id;

    if (!isAssignee && !isCreator) {
      console.log('Employee is not authorized to access this task:', req.params.task_id);
      res.status(403).json({ message: 'Forbidden: You do not have permission to access this task' });
      return;
    }

    // 5. Send response
    console.log('Task fetched successfully:', task);
    res.status(200).json(task);
  } catch (error: any) {
    console.error('Error fetching task:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};


// Update a task (only the creator can update)
export const updateTask = async (req: Request, res: Response): Promise<void> => {
  try {
    console.log('Updating task:', req.params.task_id);

    // Access the employee's ID from auth middleware
    const employee_id = req.employee_id;
    if (!employee_id) {
      res.status(401).json({ message: 'Unauthorized: Employee not authenticated' });
      return;
    }

    // Get project_id and task_id from URL parameters
    const { project_id, task_id } = req.params;
    if (!project_id || !task_id) {
      res.status(400).json({ message: 'Project ID and Task ID are required in the URL' });
      return;
    }

    // Validate required fields from body
    const { name, dueDate, priority, status, assignees, description } = req.body;
    if (!name || !dueDate) {
      res.status(400).json({ message: 'Name and due date are required' });
      return;
    }

    // Validate assignees array
    if (!Array.isArray(assignees)) {
      res.status(400).json({ message: 'Assignees must be an array' });
      return;
    }

    // Validate each assignee
    for (const assignee of assignees) {
      if (
        typeof assignee !== 'object' ||
        !assignee.user ||
        typeof assignee.user !== 'string'
      ) {
        res.status(400).json({ message: 'Each assignee must have a valid user identifier' });
        return;
      }
      if (typeof assignee.status !== 'string') {
        res.status(400).json({ message: 'Each assignee must have a valid status' });
        return;
      }
    }

    // Verify task exists and employee is the creator
    const task = await Task.findOne({ task_id, project_id });
    if (!task) {
      res.status(404).json({ message: 'Task not found' });
      return;
    }
    if (task.createdBy !== employee_id) {
      res.status(403).json({ message: 'Forbidden: Only the creator can update this task' });
      return;
    }

    // Update task fields
    task.name = name;
    task.dueDate = new Date(dueDate);
    task.priority = priority || 'Medium';
    task.status = status || 'Pending';
    if (description !== undefined) {
      task.description = description;
    }
   

    // Update assignees
    const updatedAssignees = assignees.map(assignee => ({
      user: assignee.user,
      status: assignee.status
    }));

    task.assignees = task.assignees.filter(existingAssignee =>
      updatedAssignees.some(updatedAssignee => updatedAssignee.user === existingAssignee.user)
    );

    updatedAssignees.forEach(updatedAssignee => {
      const existingAssignee = task.assignees.find(a => a.user === updatedAssignee.user);
      if (existingAssignee) {
        existingAssignee.status = updatedAssignee.status;
      } else {
        task.assignees.push(updatedAssignee);
      }
    });

    // Save updated task
    const updatedTask = await task.save();

    // Notify assignees via WebSocket
    assignees.forEach((assignee: any) => {
      io.to(assignee.user.toString()).emit('task_updated', updatedTask);
    });

    res.status(200).json(updatedTask);
  } catch (error: any) {
    console.error('Error updating task:', error);
    res.status(500).json({ message: 'Error updating task', error: error.message });
  }
};
// Get tasks for a project
export const getTasksByProject = async (req: Request, res: Response): Promise<void> => {
  try {
    // 1. Get project ID from params
    const projectId = req.params.project_id;
    console.log('Fetching tasks for project:', projectId);

    // 2. Get employee ID from middleware (optional, if you need to verify project access)
    const employee_id = req.employee_id;  // Assuming your auth middleware populates req.employee_id
    console.log('Employee ID:', employee_id);
    if (!employee_id) {
      res.status(401).json({ message: 'Invalid employee credentials' });
      return;
    }

    // 3. Verify project exists
    const existingProject = await Project.findOne({ project_id: projectId });
    if (!existingProject) {
      res.status(404).json({ message: 'Project not found' });
      return;
    }

    // 4. Find tasks by projectId
    const tasks = await Task.find({ project_id: projectId });

    // 5. Check if tasks exist
    if (!tasks || tasks.length === 0) {
      res.status(404).json({ message: 'No tasks found for this project' });
      return;
    }

    // 6. Send response
    res.status(200).json(tasks);

  } catch (error: any) {
    console.error('Error fetching tasks by project:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
// Delete task (only the creator can delete)
export const deleteTask = async (req: Request, res: Response): Promise<void> => {
  try {
    console.log('Deleting task:', req.params.task_id);

    // Get the logged-in employee's ID from the request (set by the `authMiddleware`)
    const employee_id = req.employee_id;

    // Validate that the employee is authenticated
    if (!employee_id) {
      res.status(401).json({ message: 'Unauthorized: Employee not authenticated' });
      return;
    }

    // Fetch the task by its task_id
    const task = await Task.findOne({ task_id: req.params.task_id });

    // Check if the task exists
    if (!task) {
      console.log('Task not found:', req.params.task_id);
      res.status(404).json({ message: 'Task not found' });
      return;
    }

    // Check if the employee is the creator of the task
    const isCreator = task.createdBy === employee_id;
    if (!isCreator) {
      console.log('Employee is not authorized to delete this task:', req.params.task_id);
      res.status(403).json({ message: 'Forbidden: Only the creator can delete this task' });
      return;
    }

    // Delete the task
    const deletedTask = await Task.findOneAndDelete({ task_id: req.params.task_id });

    if (!deletedTask) {
      console.log('Task not found after deletion attempt:', req.params.task_id);
      res.status(500).json({ message: 'Error deleting task' });
      return;
    }

    // Notify assignees via WebSocket
    task.assignees.forEach((assignee: any) => {
      io.to(assignee.user.toString()).emit('task_deleted', deletedTask);
    });

    console.log('Task deleted successfully:', deletedTask);
    res.status(200).json({ message: 'Task deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting task:', error);
    res.status(500).json({ message: 'Error deleting task', error: error.message });
  }
};

// Helper function to determine overall task status
const determineOverallTaskStatus = (assigneeStatuses: string[]): string => {
  if (assigneeStatuses.every(status => status === 'Completed')) {
    return 'Completed';
  }
  if (assigneeStatuses.some(status => status === 'In Progress')) {
    return 'In Progress';
  }
  return 'Pending';
};

export const updateAssigneeStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const { project_id, task_id } = req.params;
    const { status } = req.body;

    // Validate inputs
    if (!status || !project_id || !task_id) {
      res.status(400).json({ message: 'Status, project ID, and task ID are required' });
      return;
    }

    // Authentication check
    const employee_id = req.employee_id;
    if (!employee_id) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    // Find task within project
    const task = await Task.findOne({
      task_id: task_id,
      project_id: project_id
    });

    if (!task) {
      res.status(404).json({ message: 'Task not found in project' });
      return;
    }

    // Add debug logs
    console.log('Employee ID:', employee_id);
    console.log('Task creator:', task.createdBy);
    console.log('Task assignees:', JSON.stringify(task.assignees));

    // Check if employee is the creator OR an assignee
    const isCreator = task.createdBy === employee_id;
    const assignee = task.assignees.find(a => a.user === employee_id);
    
    // If creator but not assignee, allow updating the first assignee's status
    if (isCreator && !assignee) {
      if (task.assignees.length === 0) {
        res.status(400).json({ message: 'No assignees found for this task' });
        return;
      }
      
      // Update the first assignee's status
      const firstAssignee = task.assignees[0];
      firstAssignee.status = status;
      
      // Update overall task status
      const assigneeStatuses = task.assignees.map(a => a.status);
      task.status = determineOverallTaskStatus(assigneeStatuses);
      
      // Save changes
      const updatedTask = await task.save();
      
      // Real-time update
      if (req.io) {
        req.io.to(project_id).emit('task_status_updated', updatedTask);
      }
      
      res.status(200).json(updatedTask);
      return;
    }
    
    // If not creator and not assignee, reject the request
    if (!assignee) {
      res.status(403).json({ 
        message: 'You are not assigned to this task',
        employeeId: employee_id,
        assignees: task.assignees.map(a => a.user)
      });
      return;
    }

    // Update status - assignees can only update their own status
    assignee.status = status;
    
    // Update overall task status
    const assigneeStatuses = task.assignees.map(a => a.status);
    task.status = determineOverallTaskStatus(assigneeStatuses);

    // Save changes
    const updatedTask = await task.save();

    // Real-time update
    if (req.io) {
      req.io.to(project_id).emit('task_status_updated', updatedTask);
    }

    res.status(200).json(updatedTask);
  } catch (error: any) {
    console.error('Update error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
import multer from 'multer';
import path from 'path';
import fs from 'fs';


interface MulterRequest extends Request {
  file?: Express.Multer.File;
}

// Multer configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  fileFilter: function (req, file, cb) {
    const filetypes = /jpeg|jpg|png|gif|pdf|doc|docx/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only images (jpeg, jpg, png, gif), PDFs, and Word documents are allowed!'));
    }
  }
});

export const uploadFile = [
  upload.single('file'),
  async (req: MulterRequest, res: Response): Promise<void> => {
    try {
      // 1. File check
      if (!req.file) {
        res.status(400).json({ message: 'No file uploaded' });
        return;
      }

      // 2. Authentication check
      const employee_id = req.employee_id;
      if (!employee_id) {
        res.status(401).json({ message: 'Unauthorized' });
        return;
      }

      // 3. Find task
      const task = await Task.findOne({ task_id: req.params.task_id });
      if (!task) {
        res.status(404).json({ message: 'Task not found' });
        return;
      }

      // 4. Authorization check (fixed comparison)
      if (task.createdBy !== employee_id) {
        console.log('Permission denied for employee:', employee_id);
        console.log('Task creator:', task.createdBy);
        res.status(403).json({ message: 'Forbidden: Only the task creator can upload attachments' });
        return;
      }

      // 5. Add attachment
      const attachment = {
        _id: new mongoose.Types.ObjectId(),
        filename: req.file.originalname,
        filePath: req.file.path,
        fileSize: req.file.size,
        fileType: req.file.mimetype,
      };
      task.attachments.push(attachment);

      // 6. Save changes
      await task.save();

      // 7. Notify assignees via WebSocket
      task.assignees.forEach((assignee: any) => {
        io.to(assignee.user.toString()).emit('task_attachment_uploaded', {
          taskId: task.task_id,
          attachment,
        });
      });

      res.status(200).json({
        message: 'File uploaded successfully',
        filename: req.file.originalname,
        filePath: req.file.path,
      });
    } catch (error: any) {
      console.error('Upload error:', error);
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  },
];



export const getAttachment = async (req: Request, res: Response): Promise<void> => {
  try {
    const { task_id, attachment_id } = req.params;
    const employee_id = req.employee_id; // Get from proper authentication middleware

    // Validate authentication
    if (!employee_id) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const task = await Task.findOne({ task_id });

    if (!task) {
      res.status(404).json({ message: 'Task not found' });
      return;
    }

    // Check permissions (using proper ID comparison)
    const isCreator = task.createdBy === employee_id;
    const isAssignee = task.assignees.some(assignee => assignee.user === employee_id);

    console.log(`Permission check - Employee: ${employee_id}, Creator: ${task.createdBy}, Assignees: ${task.assignees.map(a => a.user)}`);

    if (!isCreator && !isAssignee) {
      res.status(403).json({ message: 'Forbidden: No access permissions' });
      return;
    }

    // Find attachment
    const attachment = task.attachments.find(a => a._id.toString() === attachment_id);

    if (!attachment) {
      res.status(404).json({ message: 'Attachment not found' });
      return;
    }

    // Validate file existence
    if (!fs.existsSync(attachment.filePath)) {
      res.status(410).json({ message: 'File no longer available' });
      return;
    }

    res.sendFile(attachment.filePath, { root: process.cwd() }, (err) => {
      if (err) console.error('File send error:', err);
    });

  } catch (error: any) {
    console.error('Error:', error);
    res.status(500).json({ 
      message: 'Server error',
      error: error.message 
    });
  }
};
export const deleteAttachment = async (req: Request, res: Response): Promise<void> => {
  try {
    const { task_id, attachment_id } = req.params;

    const task = await Task.findOne({ task_id: task_id });

    if (!task) {
      res.status(404).json({ message: 'Task not found' });
      return;
    }

    // Check if the employee is the task creator
    const employee_id = req.employee_id;
    if (task.createdBy !== employee_id) {
      res.status(403).json({ message: 'Forbidden: Only the task creator can delete attachments' });
      return;
    }

    const attachment = task.attachments.find(attachment => attachment._id.toString() === attachment_id);

    if (!attachment) {
      res.status(404).json({ message: 'Attachment not found' });
      return;
    }

    // Delete the file from the file system
    fs.unlink(attachment.filePath, (err) => {
      if (err) {
        console.error("Error deleting file:", err);
        // Log the error, but don't block the deletion from the database.
      }
    });

    // Remove the attachment from the task's attachments array
    task.attachments = task.attachments.filter(attachment => attachment._id.toString() !== attachment_id);

    await task.save();

    res.status(200).json({ message: 'Attachment deleted successfully' });

    // Emit socket event for real-time updates
    task.assignees.forEach((assignee: any) => {
      io.to(assignee.user.toString()).emit('task_attachment_deleted', { taskId: task_id, attachmentId: attachment_id });
    });
  } catch (error: any) {
    console.error('Error deleting attachment:', error);
    res.status(500).json({ message: 'Error deleting attachment', error: error.message });
  }
};export const updateAttachment = async (req: Request, res: Response): Promise<void> => {
  upload.single('file')(req, res, async (err) => {
    try {
      if (err) {
        console.error("Multer error:", err);
        res.status(400).json({ message: 'Error uploading file', error: err.message });
        return;
      }

      const { task_id, attachment_id } = req.params;

      const task = await Task.findOne({ task_id: task_id });

      if (!task) {
        res.status(404).json({ message: 'Task not found' });
        return;
      }

      // Check if the employee is the task creator
      const employee_id = req.employee_id;
      if (task.createdBy !== employee_id) {
        res.status(403).json({ message: 'Forbidden: Only the task creator can update attachments' });
        return;
      }

      const attachment = task.attachments.find(attachment => attachment._id.toString() === attachment_id);

      if (!attachment) {
        res.status(404).json({ message: 'Attachment not found' });
        return;
      }

      // Check if a new file was uploaded
      if (req.file) {
        // Delete the old file
        fs.unlink(attachment.filePath, (unlinkErr) => {
          if (unlinkErr) {
            console.error("Error deleting old file:", unlinkErr);
            // Log the error, but don't block the update.
          }
        });

        // Update attachment information with the new file details
        attachment.filename = req.file.originalname;
        attachment.filePath = req.file.path;
        attachment.fileSize = req.file.size;
        attachment.fileType = req.file.mimetype;
      }

      await task.save();

      res.status(200).json({ message: 'Attachment updated successfully', attachment });

      // Emit socket event for real-time updates
      task.assignees.forEach((assignee: any) => {
        io.to(assignee.user.toString()).emit('task_attachment_updated', { taskId: task_id, attachment: attachment });
      });
    } catch (error: any) {
      console.error('Error updating attachment:', error);
      res.status(500).json({ message: 'Error updating attachment', error: error.message });
    }
  });
};