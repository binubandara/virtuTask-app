import { Request, Response } from 'express';
import {Task} from '../models/Task';
import { Project } from '../models/Project';
import { v4 as uuidv4 } from 'uuid';
import mongoose from 'mongoose';


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

      // Validate required fields
      const { name, description, startDate, dueDate, department, client, priority, members } = req.body;
      if (!name || !startDate || !dueDate || !description || !department || !client || !members || !priority) {
          res.status(400).json({ message: 'Name, description, start date, due date, department, client, priority, and members are required' });
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
          client,
          priority,
          members // Ensure this is an array of user IDs/names
      });

      console.log('Project created successfully:', project);

      // Emit a socket event for have real-time updates
      if ((req as any).io) {
          (req as any).io.emit('project_created', project);
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

      const allowedUpdates = ['name', 'description', 'startDate', 'dueDate', 'status', 'department', 'client', 'priority', 'members'];
      const updates = Object.keys(req.body);
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

      // Emit socket event for real-time updates
      if ((req as any).io) {
          (req as any).io.emit('project_updated', project);
      }

      console.log('Project updated successfully:', project);
      res.status(200).json(project);
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

// Update assignee and task status
export const updateAssigneeStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const { status, assigneeId } = req.body;

      // Validate input
      if (!status || !assigneeId) {
          res.status(400).json({ message: 'Status and assigneeId are required' });
          return;
      }

      console.log("Received status update request:", { status, assigneeId });

      const task = await Task.findOne({ task_id: req.params.id }); // Use findOne with task_id
      if (!task) {
          res.status(404).json({ message: 'Task not found' });
          return;
      }

      console.log("Task found:", task);

      // Update the specific assignee's status
      const assignee = task.assignees.find(a => a.task_id.toString() === assigneeId);
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