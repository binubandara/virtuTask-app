import { Request, Response, NextFunction } from 'express';
import axios from 'axios';
import { io } from '../server'; // Import the io instance

declare module 'express-serve-static-core' {
  interface Request {
    employee_id?: string;
    io?: typeof io;
  }
}

export const authMiddleware = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith('Bearer ')) {
    console.log('Missing or malformed Authorization header');
    res.status(401).json({ message: 'Unauthorized - Missing token' });
    return;
  }

  const token = authHeader.split(' ')[1];

  try {
    const response = await axios.post('http://localhost:5001/api/auth/verify-token', { token });

    console.log('Authentication server response:', response.data); // Log the response data

    if (response.status !== 200) {
      console.error('Authentication server returned an error:', response.status, response.data);
      res.status(500).json({ message: 'Internal Server Error - Authentication Failed' });
      return;
    }

    const { employeeId } = response.data as { employeeId: string };

    if (!employeeId) {
      console.error('Authentication server did not return employeeId');
      res.status(500).json({ message: 'Internal Server Error - Missing employeeId' });
      return;
    }

    req.employee_id = employeeId;
    req.io = io; // Add the io instance to the req object
    console.log(`Authenticated employee ID: ${employeeId}`);

    next();
  } catch (error: any) {
    console.error('Error calling authentication server:', error);

    if (error.response) {
      console.error('Authentication server response:', error.response.data);
      res.status(error.response.status).json({ message: `Authentication server error: ${error.response.data.message || 'Authentication Failed'}` });
    } else if (error.request) {
      console.error('No response from authentication server:', error.request);
      res.status(500).json({ message: 'Authentication server unavailable' });
    } else {
      console.error('Error setting up authentication request:', error.message);
      res.status(500).json({ message: 'Internal server error' });
    }
  }
};