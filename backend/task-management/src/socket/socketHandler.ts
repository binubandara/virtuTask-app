import { Server, Socket } from "socket.io";
import { Task } from "../models/Task";
  

export const socketHandler = (io: Server) => {
  io.on("connection", (socket: Socket) => {
    console.log(`New client connected: ${socket.id}`);

    // Join project room
    socket.on("joinProject", (projectId: string) => {
      socket.join(`project-${projectId}`);
      console.log(`Socket ${socket.id} joined project-${projectId}`);
    });

    // Handle task status changes
    socket.on("updateTaskStatus", async ({ taskId, status }) => {
      try {
        const task = await Task.findByIdAndUpdate(taskId, { status, updatedAt: new Date() }, { new: true });

        if (task) {
          io.to(`project-${task.project_id}`).emit("taskStatusUpdated", {
            taskId,
            status,
            updatedAt: task.updatedAt,
          });
        }
      } catch (error) {
        console.error("Error updating task status:", error);
      }
    });

    // Handle task priority changes
    socket.on("updateTaskPriority", async ({ taskId, priority }) => {
      try {
        const task = await Task.findByIdAndUpdate(taskId, { priority, updatedAt: new Date() }, { new: true });

        if (task) {
          io.to(`project-${task.project_id}`).emit("taskPriorityUpdated", {
            taskId,
            priority,
            updatedAt: task.updatedAt,
          });
        }
      } catch (error) {
        console.error("Error updating task priority:", error);
      }
    });

    // Handle task creation
    socket.on("createTask", async (taskData) => {
      try {
        const task = await Task.create(taskData);

        if (task) {
          io.to(`project-${task.project_id}`).emit("taskCreated", task);
        }
      } catch (error) {
        console.error("Error creating task:", error);
      }
    });

    // Handle task deletion
    socket.on("deleteTask", async (taskId) => {
      try {
        const task = await Task.findByIdAndDelete(taskId);

        if (task) {
          io.to(`project-${task.project_id}`).emit("taskDeleted", { taskId });
        }
      } catch (error) {
        console.error("Error deleting task:", error);
      }
    });

    // Handle disconnection
    socket.on("disconnect", () => {
      console.log(`Client disconnected: ${socket.id}`);
    });
  });
};