import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

// Add this to a separate type definition file (src/types/express.d.ts)
declare global {
  namespace Express {
    interface Request {
      user?: { id: string };
      io?: any;
    }
  }
}

export const authMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;
  
  // 1. Check Authorization header
  if (!authHeader?.startsWith('Bearer ')) {
    console.log('Missing or malformed Authorization header');
     res.status(401).json({ message: 'Unauthorized - Missing token' });
     return;
  }

  const token = authHeader.split(' ')[1];
  
  try {
    // 2. Verify JWT
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { 
      id: string;
      iat: number;
      exp: number;
    };

    // 3. Attach user to request
    req.user = { id: decoded.id };
    console.log(`Authenticated user: ${decoded.id}`); // Debug log
    
    // 4. Proceed to route handler
    next();
  } catch (error) {
    console.error('JWT verification failed:', error);
     res.status(403).json({ message: 'Forbidden - Invalid token' });
     return;
  }
};