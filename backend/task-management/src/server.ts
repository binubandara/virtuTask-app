import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import cors from "cors";
import { connectDB } from "./config/database";
import taskRoutes from "./routes/taskRoutes";
import { socketHandler } from "./socket/socketHandler";
import { errorHandler } from './middleware/errorHandler';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:5000",
    methods: ["GET", "POST", "PATCH", "DELETE"],
  },
});

// Middleware
app.use(cors());
app.use(express.json());

// Store io instance on app
app.set("io", io);

// Connect to MongoDB
connectDB();

// Routes
app.use("/api", taskRoutes);

// Error handling
app.use(errorHandler);

// Setup Socket handlers
socketHandler(io);

const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});