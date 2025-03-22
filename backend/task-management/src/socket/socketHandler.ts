import jwt from 'jsonwebtoken';
import { Server, Socket } from 'socket.io';
import mongoose from 'mongoose';

declare module 'socket.io' {
  interface Socket {
    userId?: string; // Store user ID from JWT
  }
}

export const socketHandler = (io: Server) => {
  // Authentication middleware (JWT-only validation)
  io.use(async (socket: Socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) throw new Error('Missing authentication token');

      // Verify JWT without user lookup
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string };
      
      // Validate ID format only
      if (!mongoose.Types.ObjectId.isValid(decoded.userId)) {
        throw new Error('Invalid user ID format');
      }

      // Attach user ID to socket
      socket.userId = decoded.userId;
      next();
    } catch (error) {
      console.error('Socket auth error:', error);
      next(new Error('Authentication failed'));
    }
  });

  io.on('connection', (socket: Socket) => {
    if (!socket.userId) return socket.disconnect();

    console.log(`User connected: ${socket.userId}`);

    // Join user-specific room
    socket.join(socket.userId);

    // Optional: Project room handling
    socket.on('joinProject', (projectId) => {
      socket.join(`project:${projectId}`);
    });

    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.userId}`);
    });
  });
};