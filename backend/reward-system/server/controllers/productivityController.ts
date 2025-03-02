import { Request, Response, NextFunction } from 'express';
import ProductivityData, { IProductivityData } from '../models/ProductivityData';
import TeamMember from '../models/TeamMember'; 

export const importProductivityData = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    // 1. Receive the JSON string from the request body
    const jsonString = req.body.data; // Assuming the JSON string is sent in the 'data' field

    // 2. Parse the JSON string
    const productivityDataArray = JSON.parse(jsonString);

    //3. Check to see if the array is empty, or bad
    if (!productivityDataArray || productivityDataArray.length === 0) {
        res.status(400).json({ message: 'Invalid data' });
        return;
    }

    //4. For all objects in the array, we run the function. Create new teamMember. The run a query.
    for (const data of productivityDataArray) {
        //5.  Check that all keys exist
         if (!data._id || !data.date || !data.productivity_score || !data.total_productive_time
             || !data.total_time || !data.total_unproductive_time) {
             res.status(400).json({ message: 'Data is not valid' });
             return;
        }

        //6. Add a temporary document to the teamMember list. We will only do this if the data exists
        const teamMemberData = {
            name: 'Temporary User',
            email: 'temp@temp.com'
         };

        const teamMember = await TeamMember.create(teamMemberData);
        if (!teamMember) {
            res.status(500).json({ message: 'Error creating team member' });
        }

        //6.1 create a new productivity for each document
          const newProductivityData = {
            memberId: teamMember._id, // Use the TeamMember ID
            date: data.date.$date, // Access the date value correctly
            productivity_score: data.productivity_score,
            total_productive_time: data.total_productive_time,
            total_time: data.total_time,
            total_unproductive_time: data.total_unproductive_time,
          };

        await ProductivityData.create(newProductivityData);
        console.log('New documents created');
    }
    //3. Get all the current productivity entries in the database
    const productivityData = await ProductivityData.find();

    res.status(200).json({ message: 'Data imported successfully!', entries: productivityData });

  } catch (error) {
    console.error('Error importing data:', error);
    res.status(500).json({ message: 'Error importing data' });
    return; // Make sure there's a return here!
  }
};

// Get all productivity data
export const getAllProductivityData = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const productivityData = await ProductivityData.find();
    res.status(200).json(productivityData);
  } catch (error) {
    console.error('Error getting productivity data:', error);
    next(error);
  }
};

// Get a single productivity data entry by ID
export const getProductivityDataById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const productivityData = await ProductivityData.findById(req.params.id);
    if (!productivityData) {
      res.status(404).json({ message: 'Productivity data not found' });
      return;
    }
    res.status(200).json(productivityData);
  } catch (error) {
    console.error('Error getting productivity data:', error);
    next(error);
  }
};

// Create a new productivity data entry
export const createProductivityData = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const newProductivityData: IProductivityData = new ProductivityData(req.body);
    const savedProductivityData = await newProductivityData.save();
    res.status(201).json(savedProductivityData);
  } catch (error) {
    console.error('Error creating productivity data:', error);
    next(error);
  }
};

// Update an existing productivity data entry
export const updateProductivityData = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const updatedProductivityData = await ProductivityData.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updatedProductivityData) {
      res.status(404).json({ message: 'Productivity data not found' });
      return;
    }
    res.status(200).json(updatedProductivityData);
  } catch (error) {
    console.error('Error updating productivity data:', error);
    next(error);
  }
};

// Delete a productivity data entry
export const deleteProductivityData = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const deletedProductivityData = await ProductivityData.findByIdAndDelete(req.params.id);
    if (!deletedProductivityData) {
      res.status(404).json({ message: 'Productivity data not found' });
      return;
    }
    res.status(200).json({ message: 'Productivity data deleted' });
  } catch (error) {
    console.error('Error deleting productivity data:', error);
    next(error);
  }
};