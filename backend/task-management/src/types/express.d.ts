import { Socket } from 'socket.io';

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
      };
      io?: any;
    }
  }
}
import { Request } from 'express';

declare global {
  namespace Express {
    interface Request {
      employee_id?: string;
      io?: any; // Keep this if you're using it
    }
  }
}