import { Request, Response } from 'express';
import TeamMember, { ITeamMember } from '../models/TeamMember';

// Get all team members
export const getAllTeamMembers = async (req: Request, res: Response) => {
  try {
    const teamMembers = await TeamMember.find();
    res.status(200).json(teamMembers);
  } catch (error) {
    console.error('Error getting team members:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// Get a single team member by ID
export const getTeamMemberById = async (req: Request, res: Response) => {
  try {
    const teamMember = await TeamMember.findById(req.params.id);
    if (!teamMember) {
      return res.status(404).json({ message: 'Team member not found' });
    }
    res.status(200).json(teamMember);
  } catch (error) {
    console.error('Error getting team member:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// Create a new team member
export const createTeamMember = async (req: Request, res: Response) => {
  try {
    const newTeamMember: ITeamMember = new TeamMember(req.body);
    const savedTeamMember = await newTeamMember.save();
    res.status(201).json(savedTeamMember);
  } catch (error) {
    console.error('Error creating team member:', error);
    res.status(400).json({ message: 'Invalid data' });
  }
};

// Update an existing team member
export const updateTeamMember = async (req: Request, res: Response) => {
  try {
    const updatedTeamMember = await TeamMember.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updatedTeamMember) {
      return res.status(404).json({ message: 'Team member not found' });
    }
    res.status(200).json(updatedTeamMember);
  } catch (error) {
    console.error('Error updating team member:', error);
    res.status(400).json({ message: 'Invalid data' });
  }
};

// Delete a team member
export const deleteTeamMember = async (req: Request, res: Response) => {
  try {
    const deletedTeamMember = await TeamMember.findByIdAndDelete(req.params.id);
    if (!deletedTeamMember) {
      return res.status(404).json({ message: 'Team member not found' });
    }
    res.status(200).json({ message: 'Team member deleted' });
  } catch (error) {
    console.error('Error deleting team member:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};