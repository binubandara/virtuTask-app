import { Request, Response } from 'express';
import ProductivityData, { IProductivityData } from '../models/ProductivityData';

// Get all productivity data
export const getAllProductivityData = async (req: Request, res: Response) => {
  try {
    const productivityData = await ProductivityData.find();
    res.status(200).json(productivityData);
  } catch (error) {
    console.error('Error getting productivity data:', error);
    res.status(500).json({ message: 'Failed to get productivity data' });
  }
};

// Get a single productivity data entry by ID
export const getProductivityDataById = async (req: Request, res: Response) => {
  try {
    const productivityData = await ProductivityData.findById(req.params.id);
    if (!productivityData) {
      return res.status(404).json({ message: 'Productivity data not found' });
    }
    res.status(200).json(productivityData);
  } catch (error) {
    console.error('Error getting productivity data:', error);
    res.status(500).json({ message: 'Failed to get productivity data' });
  }
};

// Create a new productivity data entry
export const createProductivityData = async (req: Request, res: Response) => {
  try {
    const newProductivityData: IProductivityData = new ProductivityData(req.body);
    const savedProductivityData = await newProductivityData.save();
    res.status(201).json(savedProductivityData);
  } catch (error) {
    console.error('Error creating productivity data:', error);
    res.status(400).json({ message: 'Invalid data' });
  }
};

// Update an existing productivity data entry
export const updateProductivityData = async (req: Request, res: Response) => {
  try {
    const updatedProductivityData = await ProductivityData.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updatedProductivityData) {
      return res.status(404).json({ message: 'Productivity data not found' });
    }
    res.status(200).json(updatedProductivityData);
  } catch (error) {
    console.error('Error updating productivity data:', error);
    res.status(400).json({ message: 'Invalid data' });
  }
};

// Delete a productivity data entry
export const deleteProductivityData = async (req: Request, res: Response) => {
  try {
    const deletedProductivityData = await ProductivityData.findByIdAndDelete(req.params.id);
    if (!deletedProductivityData) {
      return res.status(404).json({ message: 'Productivity data not found' });
    }
    res.status(200).json({ message: 'Productivity data deleted' });
  } catch (error) {
    console.error('Error deleting productivity data:', error);
    res.status(500).json({ message: 'Failed to delete productivity data' });
  }
};