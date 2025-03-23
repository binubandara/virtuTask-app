import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { Task } from '../models/Task';
import Subtask, { ISubtask } from '../models/Subtask';
import { io } from '../server';
import { Project } from '../models/Project';

export const createSimpleSubtask = async (req: Request, res: Response): Promise<void> => {
  try {
    const employee_id = req.employee_id;  // Get employee ID from auth middleware
    if (!employee_id) {
      res.status(401).json({ message: 'Unauthorized: Employee not authenticated' });
      return;
    }

    const { subtask } = req.body;  // Only subtask in the body
    const { task_id, project_id } = req.params; // Get task_id and project_id from route params

    if (!subtask) {
      res.status(400).json({ message: 'Subtask description is required' });
      return;
    }

    if (!task_id || !project_id) {
      res.status(400).json({ message: 'Task ID and project ID are required in the route parameters' });
      return;
    }

    // Validate project_id exists and employee has access
    const project = await Project.findOne({ project_id });
    if (!project) {
      res.status(404).json({ message: 'Project not found' });
      return;
    }

    const isMember = project.members.includes(employee_id);
    const isCreator = project.createdBy === employee_id;

    if (!isMember && !isCreator) {
      res.status(403).json({ message: 'Forbidden: You do not have permission to access this project' });
      return;
    }

    // Validate task_id exists
    const existingTask = await Task.findOne({ task_id, project_id });
    if (!existingTask) {
      res.status(404).json({ message: 'Task not found' });
      return;
    }

    // Create a new Subtask document, using the authenticated employee's ID as the assignee
    const newSubtask: ISubtask = new Subtask({
      task_id,
      subtask,
      assignee_id: employee_id, // Use the authenticated employee's ID
      project_id,  // Include the project_id
    });

    // Save the subtask to the database
    await newSubtask.save();

    // Optionally, emit a WebSocket event:
    io.to(employee_id).emit('simple_subtask_created', newSubtask); // Send to the assigned employee

    res.status(201).json(newSubtask);

  } catch (error: any) {
    console.error('Error creating simple subtask:', error);
    res.status(500).json({ message: 'Error creating simple subtask', error: error.message });
  }
};
// GET ALL SUBTASKS FOR A TASK
export const getSubtasksForTask = async (req: Request, res: Response): Promise<void> => {
  try {
    const employee_id = req.employee_id;  // Get employee ID from auth middleware
    if (!employee_id) {
      res.status(401).json({ message: 'Unauthorized: Employee not authenticated' });
      return;
    }

    const { task_id, project_id } = req.params;

    if (!task_id || !project_id) {
      res.status(400).json({ message: 'Task ID and Project ID are required in the route parameters' });
      return;
    }

    // Validate project_id exists and employee has access
    const project = await Project.findOne({ project_id });

    if (!project) {
      res.status(404).json({ message: 'Project not found' });
      return;
    }

    const isMember = project.members.includes(employee_id);
    const isCreator = project.createdBy === employee_id;

    if (!isMember && !isCreator) {
      res.status(403).json({ message: 'Forbidden: You do not have permission to access this project' });
      return;
    }

    // Validate task_id exists
    const existingTask = await Task.findOne({ task_id, project_id });
    if (!existingTask) {
      res.status(404).json({ message: 'Task not found' });
      return;
    }

    // Get all subtasks for the task assigned to the employee
    const subtasks: ISubtask[] = await Subtask.find({ task_id, assignee_id: employee_id, project_id });
    res.status(200).json(subtasks);

  } catch (error: any) {
    console.error('Error getting subtasks:', error);
    res.status(500).json({ message: 'Error getting subtasks', error: error.message });
  }
};
// ----------------------------------------------------------------------------
// GET SUBTASK BY ID
// ----------------------------------------------------------------------------

export const getSubtaskById = async (req: Request, res: Response): Promise<void> => {
  try {
    const employee_id = req.employee_id;  // Get employee ID from auth middleware
    if (!employee_id) {
      res.status(401).json({ message: 'Unauthorized: Employee not authenticated' });
      return;
    }

    const { subtask_id, task_id, project_id } = req.params;

    if (!subtask_id || !task_id || !project_id) {
      res.status(400).json({ message: 'Subtask ID, Task ID and Project ID are required in the route parameters' });
      return;
    }

    // Validate project_id exists and employee has access
    const project = await Project.findOne({ project_id });

    if (!project) {
      res.status(404).json({ message: 'Project not found' });
      return;
    }

    const isMember = project.members.includes(employee_id);
    const isCreator = project.createdBy === employee_id;

    if (!isMember && !isCreator) {
      res.status(403).json({ message: 'Forbidden: You do not have permission to access this project' });
      return;
    }

    // Validate task_id exists
    const existingTask = await Task.findOne({ task_id, project_id });
    if (!existingTask) {
      res.status(404).json({ message: 'Task not found' });
      return;
    }

    const subtask: ISubtask | null = await Subtask.findOne({
      subtask_id,
      task_id,
      assignee_id: employee_id,  // Only get subtask assigned to this employee
      project_id,
    });

    if (!subtask) {
      res.status(404).json({ message: 'Subtask not found' });
      return;
    }

    res.status(200).json(subtask);

  } catch (error: any) {
    console.error('Error getting subtask by ID:', error);
    res.status(500).json({ message: 'Error getting subtask by ID', error: error.message });
  }
};// ----------------------------------------------------------------------------
// UPDATE SUBTASK
// ----------------------------------------------------------------------------

export const updateSubtask = async (req: Request, res: Response): Promise<void> => {
  try {
    const employee_id = req.employee_id;  // Get employee ID from auth middleware
    if (!employee_id) {
      res.status(401).json({ message: 'Unauthorized: Employee not authenticated' });
      return;
    }

    const { subtask_id, task_id, project_id } = req.params;
    const { subtask } = req.body;  // Allow updating the subtask description

    if (!subtask_id || !task_id || !project_id) {
      res.status(400).json({ message: 'Subtask ID, Task ID and Project ID are required in the route parameters' });
      return;
    }

    // Validate project_id exists and employee has access
    const project = await Project.findOne({ project_id });
    if (!project) {
      res.status(404).json({ message: 'Project not found' });
      return;
    }

    const isMember = project.members.includes(employee_id);
    const isCreator = project.createdBy === employee_id;

    if (!isMember && !isCreator) {
      res.status(403).json({ message: 'Forbidden: You do not have permission to access this project' });
      return;
    }

    // Validate task_id exists
    const existingTask = await Task.findOne({ task_id, project_id });
    if (!existingTask) {
      res.status(404).json({ message: 'Task not found' });
      return;
    }

    if (!subtask) {
      res.status(400).json({ message: 'Subtask description is required in the request body' });
      return;
    }

    const updatedSubtask: ISubtask | null = await Subtask.findOneAndUpdate(
      { subtask_id, task_id, assignee_id: employee_id, project_id }, // Only update subtasks assigned to this employee
      { subtask },
      { new: true } // Return the updated document
    );

    if (!updatedSubtask) {
      res.status(404).json({ message: 'Subtask not found' });
      return;
    }

    res.status(200).json(updatedSubtask);

  } catch (error: any) {
    console.error('Error updating subtask:', error);
    res.status(500).json({ message: 'Error updating subtask', error: error.message });
  }
};// ----------------------------------------------------------------------------
// DELETE SUBTASK
// ----------------------------------------------------------------------------

export const deleteSubtask = async (req: Request, res: Response): Promise<void> => {
  try {
    const employee_id = req.employee_id;  // Get employee ID from auth middleware
    if (!employee_id) {
      res.status(401).json({ message: 'Unauthorized: Employee not authenticated' });
      return;
    }

    const { subtask_id, task_id, project_id } = req.params;

    if (!subtask_id || !task_id || !project_id) {
      res.status(400).json({ message: 'Subtask ID, Task ID and Project ID are required in the route parameters' });
      return;
    }

    // Validate project_id exists and employee has access
    const project = await Project.findOne({ project_id });

    if (!project) {
      res.status(404).json({ message: 'Project not found' });
      return;
    }

    const isMember = project.members.includes(employee_id);
    const isCreator = project.createdBy === employee_id;

    if (!isMember && !isCreator) {
      res.status(403).json({ message: 'Forbidden: You do not have permission to access this project' });
      return;
    }

    // Validate task_id exists
    const existingTask = await Task.findOne({ task_id, project_id });
    if (!existingTask) {
      res.status(404).json({ message: 'Task not found' });
      return;
    }

    const deletedSubtask: ISubtask | null = await Subtask.findOneAndDelete({
      subtask_id,
      task_id,
      assignee_id: employee_id, // Only delete subtasks assigned to this employee
      project_id,
    });

    if (!deletedSubtask) {
      res.status(404).json({ message: 'Subtask not found' });
      return;
    }

    res.status(200).json({ message: 'Subtask successfully deleted' }); // 200 OK with a message

  } catch (error: any) {
    console.error('Error deleting subtask:', error);
    res.status(500).json({ message: 'Error deleting subtask', error: error.message });
  }
};