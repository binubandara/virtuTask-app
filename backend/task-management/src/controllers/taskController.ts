import { Request, Response } from 'express';

interface MulterRequest extends Request {
  file?: Express.Multer.File;
}
import {Task} from '../models/Task';
import { Project } from '../models/Project';
import { v4 as uuidv4 } from 'uuid';
import mongoose from 'mongoose';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Get all tasks for a specific project 
export const getTasks = async (req: Request, res: Response): Promise<void> => {
  try {
    console.log('Fetching all tasks...');
    const tasks = await Task.find()
      .sort({ createdAt: -1 })
      .populate('comments');
    
    console.log(`Successfully fetched ${tasks.length} tasks`);
    res.status(200).json(tasks);
  } catch (error: any) {
    console.error('Error fetching tasks:', error);
    res.status(500).json({ message: 'Error fetching tasks', error: error.message });
  }
};

// Create new task under a specific project 
export const createTask = async (req: Request, res: Response): Promise<void> => {
  try {
    console.log('Creating new task:', req.body);
    
    // Validate required fields
    const { name, dueDate, priority, status, assignees, project_id, description } = req.body;
    if (!name || !dueDate || !project_id) {
      res.status(400).json({ message: 'Name, due date, and project_id are required' });
      return;
    }

    // Validate assignees
    if (!Array.isArray(assignees) || !assignees.every(assignee => typeof assignee === 'object')) {
      res.status(400).json({ message: 'Assignees must be an array of objects' });
      return;
    }
    // Ensure each assignee has a status
    const validatedAssignees = assignees.map(assignee => {
      if (!assignee.status) {
        assignee.status = 'Pending'; // Default status if not provided
      }
      return assignee;
    });

    // Validate project ID
    const existingProject = await Project.findOne({ project_id: project_id }); // Ensure you are querying on the string field
if (!existingProject) {
  res.status(400).json({ message: 'Invalid project ID' });
  return;
}

    // Generate a UUID for the task_id
    const task_id = uuidv4();

    // Create a new task
    const task = await Task.create({
      task_id: task_id,
      name,
      dueDate: new Date(dueDate),
      priority: priority || 'Medium',
      status: status || 'Pending',
      assignees: validatedAssignees,
      description: description || '',
      project_id // Ensure this is a string
    });

    console.log('Task created successfully:', task);
    
    // Emit socket event for real-time updates
    if ((req as any).io) {
      (req as any).io.emit('task_created', task);
    }
    
    res.status(201).json(task);
  } catch (error: any) {
    console.error('Error creating task:', error);
    res.status(500).json({ message: 'Error creating task', error: error.message });
  }
};

// Update task under a specific project 
export const updateTask = async (req: Request, res: Response): Promise<void> => {
  try {
    console.log('Updating task:', req.params.task_id);
    
    const allowedUpdates = ['name', 'description', 'priority', 'dueDate', 'assignees', 'status'];
    const updates = Object.keys(req.body);
    const isValidOperation = updates.every(update => allowedUpdates.includes(update));

    if (!isValidOperation) {
      res.status(400).json({ message: 'Invalid updates!' });
      return;
    }

    const task = await Task.findOneAndUpdate(    // Find and update by task_id
      { task_id: req.params.task_id },
      req.body,
      { new: true, runValidators: true }
  );
    
    if (!task) {
      console.log('Task not found:', req.params.id);
      res.status(404).json({ message: 'Task not found' });
      return;
    }
    
    // Emit socket event for real-time updates
    if ((req as any).io) {
      (req as any).io.emit('task_updated', task);
    }
    
    console.log('Task updated successfully:', task);
    res.status(200).json(task);
  } catch (error: any) {
    console.error('Error updating task:', error);
    res.status(400).json({ message: 'Error updating task', error: error.message });
  }
};

// Delete task
export const deleteTask = async (req: Request, res: Response): Promise<void> => {
  try {
    console.log('Deleting task:', req.params.id);
    const task = await Task.findByIdAndDelete(req.params.task_id);
    
    if (!task) {
      console.log('Task not found:', req.params.id);
      res.status(404).json({ message: 'Task not found' });
      return;
    }
    
    // Emit socket event for real-time updates
    if ((req as any).io) {
      (req as any).io.emit('task_deleted', req.params.id);
    }
    
    console.log('Task deleted successfully');
    res.status(200).json({ message: 'Task deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting task:', error);
    res.status(400).json({ message: 'Error deleting task', error: error.message });
  }
};

// Get all tasks for a specific project
export const getTasksByProject = async (req: Request, res: Response): Promise<void> => {
  try {
    const { project_id } = req.params;

    if (!project_id) {
      res.status(400).json({ message: 'Project ID is required' });
      return;
    }

    console.log(`Fetching tasks for project: ${project_id}`);

    const tasks = await Task.find({ project_id: project_id })
      .sort({ createdAt: -1 })
      .populate('comments');

    console.log(`Successfully fetched ${tasks.length} tasks for project: ${project_id}`);
    res.status(200).json(tasks);
  } catch (error: any) {
    console.error(`Error fetching tasks for project ${req.params.project_id}:`, error);
    res.status(500).json({ message: `Error fetching tasks for project ${req.params.project_id}`, error: error.message });
  }
};

/// Get single task
export const getTask = async (req: Request, res: Response): Promise<void> => {
  try {
    const task_id = req.params.task_id; // Extract task_id
    console.log('Fetching task:', task_id);

    const task = await Task.findOne({ task_id: task_id }).populate('comments');  // Use findOne and query by task_id

    if (!task) {
      console.log('Task not found:', task_id);
      res.status(404).json({ message: 'Task not found' });
      return;
    }

    console.log('Task fetched successfully:', task);
    res.status(200).json(task);
  } catch (error: any) {
    console.error('Error fetching task:', error);
    res.status(400).json({ message: 'Error fetching task', error: error.message });
  }
};

// Create a new project
export const createProject = async (req: Request, res: Response): Promise<void> => {
  try {
      console.log('Creating new project:', req.body);

      // **** START TEST CODE - REMOVE BEFORE DEPLOYMENT ****
      const testUserId = '67cd3c865b9d52546d109fd6'; // Replace with a VALID ObjectId from your Users collection

      if (!mongoose.Types.ObjectId.isValid(testUserId)) {
          res.status(400).json({ message: 'Invalid test user ID' });
          return;
      }

      (req as any).user = { _id: new mongoose.Types.ObjectId(testUserId) }; // Use a valid ObjectId
      // **** END TEST CODE - REMOVE BEFORE DEPLOYMENT ****

      // Access the user's ObjectId from req.user._id
      const userId = (req as any).user._id;

      // Validate that the user is authenticated (check if userId exists)
      if (!userId) {
          res.status(401).json({ message: 'Unauthorized: User not authenticated' });
          return;
      }

      // Validate required fields
      const { name, description, startDate, dueDate, department, priority, members, clientId } = req.body;

      if (!name || !startDate || !dueDate || !description || !department || !priority || !members) {
          res.status(400).json({ message: 'Name, description, start date, due date, department, priority, and members are required' });
          return;
      }

      // Validate that 'members' is an array of valid User ObjectIds
      if (!Array.isArray(members) || !members.every(memberId => mongoose.Types.ObjectId.isValid(memberId))) {
          res.status(400).json({ message: 'Members must be an array of valid User ObjectIds' });
          return;
      }

      // Generate a UUID for the project_id
      const project_id = uuidv4();

      // Create a new project
      const project = await Project.create({
          project_id: project_id,
          name,
          description,
          startDate: new Date(startDate),
          dueDate: new Date(dueDate),
          status: 'Active', // Default status
          tasks: [], // You can add task references later
          department,
          priority,
          members, // Assign the array of User ObjectIds
          clientId,
          createdBy: userId  //Set the user ID to know which user created
      });

      console.log('Project created successfully:', project);

      // Emit Socket.IO events to notify frontends to update - SIMPLIFIED
      if ((req as any).io) {
          const io = (req as any).io;

          // Notify everyone that a project was created (optional)
          io.emit('project_created', project);

          // Notify specific members that they were added to this project
          members.forEach(memberId => {
              io.emit(`project_members_updated:${project.project_id}`, {  // NOT user specific, rather project specific
                  projectId: project.project_id,
                  members: members // Send the entire updated members array
              });
          });
      }

      res.status(201).json(project);
  } catch (error: any) {
      console.error('Error creating project:', error);
      res.status(400).json({ message: 'Error creating project', error: error.message });
  }
};
// Get all projects
export const getProjects = async (req: Request, res: Response): Promise<void> => {
  try {
    console.log('Fetching all projects...');
    const projects = await Project.find().sort({ createdAt: -1 });
    console.log(`Successfully fetched ${projects.length} projects`);
    res.status(200).json(projects);
  } catch (error: any) {
    console.error('Error fetching projects:', error);
    res.status(500).json({ message: 'Error fetching projects', error: error.message });
  }
};

// Get a single project by ID
export const getProject = async (req: Request, res: Response): Promise<void> => {
  try {
    console.log('Fetching project:', req.params.project_id);
    const project = await Project.findOne({ project_id: req.params.project_id });
    
    if (!project) {
      console.log('Project not found:', req.params.project_id);
      res.status(404).json({ message: 'Project not found' });
      return;
    }
    
    console.log('Project fetched successfully:', project);
    res.status(200).json(project);
  } catch (error: any) {
    console.error('Error fetching project:', error);
    res.status(500).json({ message: 'Error fetching project', error: error.message });
  }
};

// Update project
export const updateProject = async (req: Request, res: Response): Promise<void> => {
  try {
      console.log('Updating project:', req.params.project_id);

      const allowedUpdates = ['name', 'description', 'startDate', 'dueDate', 'status', 'department', 'clientId', 'priority', 'members']; // Add any missing fields here
      console.log('Allowed updates', allowedUpdates);  // Debug: Log the allowedUpdates array

      const updates = Object.keys(req.body);
      console.log('Updates sent', updates); //Debug: Log the keys in the request body
      const isValidOperation = updates.every(update => allowedUpdates.includes(update));

      if (!isValidOperation) {
          res.status(400).json({ message: 'Invalid updates!' });
          return;
      }

      const project = await Project.findOneAndUpdate( // Find and update by project_id
          { project_id: req.params.project_id },
          req.body,
          { new: true, runValidators: true }
      );

      if (!project) {
          console.log('Project not found:', req.params.project_id);
          res.status(404).json({ message: 'Project not found' });
          return;
      }

      // Fetch the UPDATED project after the update operation
      const updatedProject = await Project.findOne({ project_id: req.params.project_id });

      if (!updatedProject) {
          console.log('Updated project not found after update operation:', req.params.project_id);
          res.status(500).json({ message: 'Error fetching updated project' });  // or 404, depending on your preference
          return;
      }

      // Emit socket event for real-time updates - USE THE UPDATED PROJECT
      if ((req as any).io) {
          (req as any).io.emit('project_updated', updatedProject);
           updatedProject.members.forEach(memberId => {
              (req as any).io.emit(`project_members_updated:${updatedProject.project_id}`, {  // NOT user specific, rather project specific
                  projectId: updatedProject.project_id,
                  members: updatedProject.members // Send the entire updated members array
              });
          });
      }

      console.log('Project updated successfully:', updatedProject);
      res.status(200).json(updatedProject);  // Send the updated project in the response
  } catch (error: any) {
      console.error('Error updating project:', error);
      res.status(400).json({ message: 'Error updating project', error: error.message });
  }
};


// Delete project
export const deleteProject = async (req: Request, res: Response): Promise<void> => {
try {
  console.log('Deleting project:', req.params.project_id);
  const project = await Project.findOneAndDelete({ project_id: req.params.project_id });  // Find and delete by project_id
  if (!project) {
    console.log('Project not found:', req.params.project_id);
    res.status(404).json({ message: 'Project not found' });
    return;
  }
  
  // Emit socket event for real-time updates
  if ((req as any).io) {
    (req as any).io.emit('project_deleted', req.params.project_id);
  }
  
  console.log('Project deleted successfully');
  res.status(200).json({ message: 'Project deleted successfully' });
} catch (error: any) {
  console.error('Error deleting project:', error);
  res.status(400).json({ message: 'Error deleting project', error: error.message });
}
};// Helper function to determine overall task status
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
      const { status, assigneeId } = req.body;

      // Validate input
      if (!status || !assigneeId) {
          res.status(400).json({ message: 'Status and assigneeId are required' });
          return;
      }

      console.log("Received status update request:", { status, assigneeId });

      const task = await Task.findOne({ task_id: req.params.task_id }); // Use findOne with task_id
      if (!task) {
          res.status(404).json({ message: 'Task not found' });
          return;
      }

      console.log("Task found:", task);

      // Update the specific assignee's status
       const assignee = task.assignees.find(a => a.user.toString() === assigneeId);
        console.log("Assignee Found:", assignee)

        if (!assignee) {
            res.status(404).json({ message: 'Assignee not found' });
            return;
        }

      console.log("Assignee before update:", assignee);
      assignee.status = status;
      console.log("Assignee after update:", assignee);

      // Determine the overall task status based on assignee statuses
      const assigneeStatuses = task.assignees.map(a => a.status);
      task.status = determineOverallTaskStatus(assigneeStatuses);

      console.log("Overall task status after update:", task.status);

      const savedTask = await task.save(); // Save the updated task
      console.log("Saved task:", savedTask);

      // Emit socket event for real-time update
      if ((req as any).io) {
          (req as any).io.emit('task_status_updated', savedTask);
      }

      res.status(200).json(savedTask);
  } catch (error: any) {
      console.error("Error updating assignee status:", error); // Log error
      res.status(500).json({ message: 'Error updating assignee status', error: error.message });
  }
};
// --- Multer Configuration ---
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

export const uploadFile = [upload.single('file'), async (req: MulterRequest, res: Response): Promise<void> => {
  try {
      if (!req.file) {
          res.status(400).json({ message: 'No file uploaded' });
          return;
      }

      const task = await Task.findOne({ task_id: req.params.task_id });

      if (!task) {
          res.status(404).json({ message: 'Task not found' });
          return;
      }

      task.attachments.push({
          _id: new mongoose.Types.ObjectId(),
          filename: req.file.originalname,
          filePath: req.file.path,
          fileSize: req.file.size,
          fileType: req.file.mimetype
      });

      await task.save();

      res.status(200).json({ message: 'File uploaded successfully', filename: req.file.originalname, filePath: req.file.path });
  } catch (error: any) {
      console.error('Error uploading file:', error);
      res.status(500).json({ message: 'Error uploading file', error: error.message });
  }
}];
export const getAttachment = async (req: Request, res: Response): Promise<void> => {
  try {
      const { task_id, attachment_id } = req.params;

      const task = await Task.findOne({ task_id: task_id });

      if (!task) {
          res.status(404).json({ message: 'Task not found' });
          return;
      }

      const attachment = task.attachments.find(attachment => attachment._id.toString() === attachment_id);

      if (!attachment) {
          res.status(404).json({ message: 'Attachment not found' });
          return;
      }
      if (!fs.existsSync(attachment.filePath)) {
        res.status(500).json({message: 'File not found on server'});
        return;
      }

      // Determine Content-Type based on file type
      let contentType = 'application/octet-stream';
      if (attachment.fileType) {
          contentType = attachment.fileType;
      }

      res.setHeader('Content-Type', contentType);
      res.status(200).sendFile(attachment.filePath, { root: '.' });  // The key is the root

  } catch (error: any) {
      console.error('Error fetching attachment:', error);
      res.status(500).json({ message: 'Error fetching attachment', error: error.message });
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
    if ((req as any).io) {
        (req as any).io.emit('task_attachment_deleted', { taskId: task_id, attachmentId: attachment_id });
    }

  } catch (error: any) {
    console.error('Error deleting attachment:', error);
    res.status(500).json({ message: 'Error deleting attachment', error: error.message });
  }
};

// Function to update an attachment (replace file and update metadata)
export const updateAttachment = async (req: Request, res: Response): Promise<void> => {
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
      if ((req as any).io) {
        (req as any).io.emit('task_attachment_updated', { taskId: task_id, attachment: attachment });
      }

    } catch (error: any) {
      console.error('Error updating attachment:', error);
      res.status(500).json({ message: 'Error updating attachment', error: error.message });
    }
  });
};