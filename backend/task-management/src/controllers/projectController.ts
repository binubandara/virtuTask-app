import { Request, Response } from 'express';
import { Project } from '../models/Project';
import { v4 as uuidv4 } from 'uuid';
import mongoose from 'mongoose';
import { io } from '../server'; // Socket.io instance
import axios from 'axios'; 



export const createProject = async (req: Request, res: Response): Promise<void> => {
  try {
    // 1. Get employee ID from middleware
    const employee_id = req.employee_id;
    if (!employee_id) {
      res.status(401).json({ message: 'Unauthorized: Invalid user ID' });
      return;
    }

    // 2. Validate input
    const { name, description, startDate, dueDate, department, priority, members } = req.body;
    if (!name || !description || !startDate || !dueDate || !department || !priority) {
      res.status(400).json({ message: 'Missing required fields' });
      return;
    }

    // 3. Filter valid members (basic validation)
    const validMembers = members.filter((m: string) => 
      typeof m === 'string' && m.trim() !== ''
    );

    // 4. Create project
    const project = await Project.create({
      project_id: uuidv4(),
      name,
      description,
      startDate: new Date(startDate),
      dueDate: new Date(dueDate),
      status: 'Active',
      department,
      priority,
      members: validMembers,
      createdBy: employee_id
    });

    // 5. Send real-time updates to members via WebSocket
    validMembers.forEach((memberId: string) => {
      io.to(memberId).emit('new_project', project);
    });

    // 6. Send response
    res.status(201).json(project);
  } catch (error: any) {
    console.error('Project creation error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get projects for an employee (where employee is member or creator)
export const getProjects = async (req: Request, res: Response): Promise<void> => {
  try {
    // 1. Get employee ID from middleware
    const employee_id = req.employee_id;
    console.log('Fetching projects for employee:', employee_id);

    if (!employee_id) {
      res.status(401).json({ message: 'Invalid employee credentials' });
      return;
    }

    // 2. Find projects where the employee is a member or the creator
    const projects = await Project.find({
      $or: [
        { members: employee_id },
        { createdBy: employee_id }
      ]
    });

    // 3. Send response
    res.status(200).json(projects);
  } catch (error: any) {
    console.error('Error fetching projects:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get project by id
export const getProject = async (req: Request, res: Response): Promise<void> => {
  try {
    // 1. Get employee ID from middleware
    const employee_id = req.employee_id;
    console.log('Fetching project for employee:', employee_id);

    if (!employee_id) {
      res.status(401).json({ message: 'Invalid employee credentials' });
      return;
    }

    // 2. Find the project by its `project_id`
    const project = await Project.findOne({ project_id: req.params.project_id });

    // 3. Check if the project exists
    if (!project) {
      console.log('Project not found:', req.params.project_id);
      res.status(404).json({ message: 'Project not found' });
      return;
    }

    // 4. Check if the employee is a member of the project or the creator
    const isMember = project.members.includes(employee_id);
    const isCreator = project.createdBy === employee_id;

    if (!isMember && !isCreator) {
      console.log('Employee is not authorized to access this project:', req.params.project_id);
      res.status(403).json({ message: 'Forbidden: You do not have permission to access this project' });
      return;
    }

    // 5. Send response
    console.log('Project fetched successfully:', project);
    res.status(200).json(project);
  } catch (error: any) {
    console.error('Error fetching project:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};


// Update a project
export const updateProject = async (req: Request, res: Response): Promise<void> => {
  try {
    // 1. Get employee ID from middleware
    const employee_id = req.employee_id;
    if (!employee_id) {
      res.status(401).json({ message: 'Invalid employee credentials' });
      return;
    }

    // 2. Find the project by its `project_id`
    const project = await Project.findOne({ project_id: req.params.project_id });

    // 3. Check if the project exists
    if (!project) {
      res.status(404).json({ message: 'Project not found' });
      return;
    }

    // 4. Check if the logged-in employee is the creator of the project
    if (project.createdBy !== employee_id) {
      res.status(403).json({ message: 'Forbidden: Only the creator can update this project' });
      return;
    }

    // 5. Validate input
    const { name, description, startDate, dueDate, department, priority, members } = req.body;
    if (!name || !description || !startDate || !dueDate || !department || !priority) {
      res.status(400).json({ message: 'Missing required fields' });
      return;
    }

    // 6. Filter valid members (basic validation)
    const validMembers = members.filter((m: string) => 
      typeof m === 'string' && m.trim() !== ''
    );

    // 7. Update project fields
    project.name = name;
    project.description = description;
    project.startDate = new Date(startDate);
    project.dueDate = new Date(dueDate);
    project.department = department;
    project.priority = priority;
    project.members = validMembers;

    // 8. Save the updated project
    await project.save();

    // 9. Send real-time updates to members via WebSocket
    validMembers.forEach((memberId: string) => {
      io.to(memberId).emit('updated_project', project);
    });

    // 10. Send response
    res.status(200).json(project);
  } catch (error: any) {
    console.error('Project update error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
// Delete a project
export const deleteProject = async (req: Request, res: Response): Promise<void> => {
  try {
    // 1. Get employee ID from middleware
    const employee_id = req.employee_id;
    if (!employee_id) {
      res.status(401).json({ message: 'Invalid employee credentials' });
      return;
    }

    // 2. Find the project by its `project_id`
    const project = await Project.findOne({ project_id: req.params.project_id });

    // 3. Check if the project exists
    if (!project) {
      res.status(404).json({ message: 'Project not found' });
      return;
    }

    // 4. Check if the logged-in employee is the creator of the project
    if (project.createdBy !== employee_id) {
      res.status(403).json({ message: 'Forbidden: Only the creator can delete this project' });
      return;
    }

    // 5. Delete the project
    await Project.deleteOne({ project_id: req.params.project_id });

    // 6. Send real-time updates to members via WebSocket
    (Array.isArray(project.members) ? project.members : []).forEach((memberId: string) => {
      io.to(memberId).emit('deleted_project', { project_id: req.params.project_id });
    });

    // 7. Send response
    res.status(200).json({ message: 'Project deleted successfully' });
  } catch (error: any) {
    console.error('Project deletion error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
export const USER_SERVICE_URL = 'http://localhost:5001/api/auth';
// Search users by name
export const searchUsersByName = async (req: Request, res: Response): Promise<void> => {
    try {
        const searchTerm = req.query.searchTerm as string;

        if (!searchTerm) {
            res.status(400).json({ message: 'Search term is required' });
            return;
        }

        // Change the search URL construction to:
      const searchURL = `${USER_SERVICE_URL}/search?name=${encodeURIComponent(searchTerm)}`;
        // Call external service to search users by name
        const userServiceResponse = await axios.get(searchURL);

        if (userServiceResponse.status !== 200) {
            console.error('User service returned an error:', userServiceResponse.status, userServiceResponse.data);
            res.status(userServiceResponse.status).json({ message: 'User search failed' });  // Pass along the error status
            return;
        }

        // Extract the search results
        const users = userServiceResponse.data;  // Assuming your auth service returns an array of users

        // Format and send the response
        res.status(200).json(users);

    } catch (error: any) {
        console.error('Error searching users:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};