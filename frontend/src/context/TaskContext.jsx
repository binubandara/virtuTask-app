import React, { createContext, useState, useEffect } from "react";
import axios from "axios";

// Create the context
export const TaskContext = createContext();

const API_URL = "http://localhost:5005/api/tasks";
const FOCUS_API = "http://localhost:5005/api/sessions"; 


export const TaskProvider = ({ children }) => {
  const [tasks, setTasks] = useState([]);

  // Fetch tasks from backend on load
  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const response = await axios.get(API_URL);
        setTasks(response.data);
      } catch (error) {
        console.error("Error fetching tasks:", error);
      }
    };

    fetchTasks();
  }, []);

  // Add new task (send to backend)
  const addTask = async (task) => {
    try {
      const response = await axios.post("http://localhost:5005/api/tasks", task);
      setTasks([...tasks, response.data]);
    } catch (error) {
      console.error("Error adding task:", error.response ? error.response.data : error.message);
    }
  };  

  // Toggle task completion (update in backend)
  const toggleTaskCompletion = async (taskId) => {
    try {
      console.log("Toggling Completion for:", taskId); 
  
      const taskToUpdate = tasks.find((task) => task._id === taskId);
      if (!taskToUpdate) return console.error("Task not found in state");
  
      const updatedTask = { ...taskToUpdate, completed: !taskToUpdate.completed };
  
      await axios.put(`http://localhost:5005/api/tasks/${taskId}`, updatedTask);
      
      setTasks((prevTasks) => prevTasks.map((task) => (task._id === taskId ? updatedTask : task)));
  
      console.log("Task Completion Toggled");
    } catch (error) {
      console.error("Error updating task:", error.response ? error.response.data : error.message);
    }
  };
  
  
  

  // Delete task (remove from backend)
  const deleteTask = async (taskId) => {
    try {
      console.log("Deleting Task:", taskId);
  
      await axios.delete(`http://localhost:5005/api/tasks/${taskId}`);
      
      setTasks((prevTasks) => prevTasks.filter((task) => task._id !== taskId)); 
  
      console.log("Task Deleted Successfully");
    } catch (error) {
      console.error("Error deleting task:", error.response ? error.response.data : error.message);
    }
  };
  
  

  // Log focus session
  const logFocusSession = async (taskId, duration) => {
    try {
      await axios.post(FOCUS_API, { taskId, duration });
      console.log("Focus session logged for task:", taskId);
    } catch (error) {
      console.error("Error logging focus session:", error);
    }
  };

  return (
    <TaskContext.Provider
      value={{
        tasks,
        addTask,
        toggleTaskCompletion,
        deleteTask,
        logFocusSession,
      }}
    >
      {children}
    </TaskContext.Provider>
  );
};