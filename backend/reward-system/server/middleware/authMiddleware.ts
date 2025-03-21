import { Request, Response, NextFunction } from 'express';
import axios from 'axios';

// Extend the Express Request interface to include employee_id
declare module 'express-serve-static-core' {
  interface Request {
    employee_id?: string;
  }
}

/**
 * Middleware to authenticate requests using a token
 * @param req - Express request object
 * @param res - Express response object
 * @param next - Express next middleware function
 */
export const authMiddleware = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const authHeader = req.headers.authorization;

  // Check if the Authorization header is present and properly formatted
  if (!authHeader?.startsWith('Bearer ')) {
    console.log('Missing or malformed Authorization header');
    res.status(401).json({ message: 'Unauthorized - Missing token' });
    return;
  }

  const token = authHeader.split(' ')[1];

  try {
    // Verify the token with the authentication server
    const response = await axios.post('http://localhost:5001/api/auth/verify-token', { token });

    console.log('Authentication server response:', response.data); // Log the response data

    // Check if the authentication server returned a non-200 status
    if (response.status !== 200) {
      console.error('Authentication server returned an error:', response.status, response.data);
      res.status(500).json({ message: 'Internal Server Error - Authentication Failed' });
      return;
    }

    const { employeeId } = response.data as { employeeId: string };

    // Check if the employeeId is present in the response
    if (!employeeId) {
      console.error('Authentication server did not return employeeId');
      res.status(500).json({ message: 'Internal Server Error - Missing employeeId' });
      return;
    }

    // Attach the employeeId to the request object
    req.employee_id = employeeId;
    console.log(`Authenticated employee ID: ${employeeId}`);

    // Proceed to the next middleware or route handler
    next();
  } catch (error: any) {
    console.error('Error calling authentication server:', error);

    // Handle different types of errors
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
    return;
  }
};