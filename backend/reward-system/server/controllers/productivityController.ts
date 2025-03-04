import { Request, Response, NextFunction } from 'express';
import ProductivityData, { IProductivityData } from '../models/ProductivityData';
import TeamMember from '../models/TeamMember';

export const importProductivityData = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    // 1. Receive the JSON string from the request body
    const jsonString = req.body.data; // Assuming the JSON string is sent in the 'data' field

    // 2. Parse the JSON string
    const productivityDataArray = JSON.parse(jsonString);

    // 3. Check to see if the array is empty, or bad
    if (!productivityDataArray || productivityDataArray.length === 0) {
      res.status(400).json({ message: 'Invalid data' });
      return;
    }

    // Array to store the newly created productivity data
    const newProductivityEntries: IProductivityData[] = [];

    // 4. For all objects in the array, we run the function. Find or create teamMember.
    for (const data of productivityDataArray) {
      // 5. Check that all keys exist
      if (!data._id || !data.date || !data.employee_id || !data.productivity_score || !data.total_productive_time
        || !data.total_time || !data.total_unproductive_time) {
        res.status(400).json({ message: 'Data is not valid' });
        return;
      }

      // 6. Find or Create a teamMember based on employee_id
      let teamMember = await TeamMember.findOne({ employee_id: data.employee_id });

      if (!teamMember) {
        // Create a new TeamMember if one doesn't exist
        const newTeamMemberData = {
          employee_id: data.employee_id,
          name: 'Temporary User',
          email: `temp_${data.employee_id}@temp.com`
        };
        teamMember = await TeamMember.create(newTeamMemberData);

        if (!teamMember) {
          console.error('Error creating team member:', newTeamMemberData);
          res.status(500).json({ message: 'Error creating team member' });
          return;
        }
        console.log(`Created new team member with employee_id: ${data.employee_id}`);
      }
      if (!teamMember._id) {
        console.error('Team member does not have a valid ID');
        res.status(500).json({ message: 'Team Member has Invalid Id' });
        return;
      }

      // 6.1 create a new productivity for each document
      const newProductivityData = {
        memberId: teamMember._id, // Use the TeamMember ID
        date: data.date.$date, // Access the date value correctly
        employee_id: data.employee_id,
        productivity_score: data.productivity_score,
        total_productive_time: data.total_productive_time,
        total_time: data.total_time,
        total_unproductive_time: data.total_unproductive_time,
      };

      const createdProductivity = await ProductivityData.create(newProductivityData);
      newProductivityEntries.push(createdProductivity); // Add to the array
      console.log('New documents created');
    }

    // 7. Send ONLY the newly created entries in the response
    res.status(200).json({ message: 'Data imported successfully!', entries: newProductivityEntries });

  } catch (error) {
    console.error('Error importing data:', error);
    res.status(500).json({ message: 'Error importing data' });
    return;
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