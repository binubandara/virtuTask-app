import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { connectDB } from './config/database';
import taskRoutes from './routes/taskRoutes';
import projectRoutes from './routes/projectRoutes';
// import authRoutes from './routes/authRoutes';
import { socketHandler } from './socket/socketHandler';


// Load environment variables
dotenv.config();

// Create Express app
const app = express();
const httpServer = createServer(app);

// Initialize Socket.IO
const io = new Server(httpServer, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'PATCH', 'DELETE'],
  },
});

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors());
app.use(express.json());

// Add Socket.IO instance to request object
app.use((req: any, res, next) => {
  req.io = io;
  next();
});

// Routes
app.use('/api', taskRoutes);
app.use('/api', projectRoutes);
// app.use('/api', authRoutes);

// Initialize Socket.IO handlers
socketHandler(io);

// Start server
const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export default app;