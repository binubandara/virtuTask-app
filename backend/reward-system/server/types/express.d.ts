import { Request } from 'express';

declare global {
  namespace Express {
    interface Request {
      employee_id?: string;
      io?: any; // Keep this if you're using it
    }
  }
}