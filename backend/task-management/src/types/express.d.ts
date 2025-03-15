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