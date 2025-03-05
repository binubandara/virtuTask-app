import React, { useState, useEffect } from "react";
import { Plus, Trash } from "lucide-react";

const TaskList = () => {
  const [tasks, setTasks] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [taskName, setTaskName] = useState("");
  const [taskDate, setTaskDate] = useState("");
  const [taskSessions, setTaskSessions] = useState("");

  // Fetch tasks from backend on component mount
  useEffect(() => {
    fetch("http://localhost:5000/tasks") // Backend API
      .then((res) => res.json())
      .then((data) => setTasks(data))
      .catch((err) => console.error("Error fetching tasks:", err));
  }, []);

  // Function to add a new task
  const handleAddTask = async () => {
    if (!taskName.trim() || !taskDate || !taskSessions) return;

    const newTask = {
      title: taskName,
      date: taskDate,
      sessions: taskSessions,
      completed: false,
    };

    try {
      const response = await fetch("http://localhost:5000/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newTask),
      });

      if (response.ok) {
        const savedTask = await response.json();
        setTasks([...tasks, savedTask]); // Update state with new task
        setTaskName("");
        setTaskDate("");
        setTaskSessions("");
        setShowModal(false);
      }
    } catch (error) {
      console.error("Error adding task:", error);
    }
  };

  // Function to toggle task completion
  const toggleTaskCompletion = async (taskId, completed) => {
    try {
      await fetch(`http://localhost:5000/tasks/${taskId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ completed: !completed }),
      });

      setTasks(tasks.map((task) =>
        task.id === taskId ? { ...task, completed: !completed } : task
      ));
    } catch (error) {
      console.error("Error updating task:", error);
    }
  };

  // Function to delete a task
  const handleDeleteTask = async (taskId) => {
    try {
      await fetch(`http://localhost:5000/tasks/${taskId}`, {
        method: "DELETE",
      });

      setTasks(tasks.filter((task) => task.id !== taskId));
    } catch (error) {
      console.error("Error deleting task:", error);
    }
  };

  return (
    <>
      <div className="task-list-container">
        <h3>Today's Tasks</h3>
        <ul className="task-list">
          {tasks.map((task) => (
            <li key={task.id} className="task-item">
              <input
                type="checkbox"
                checked={task.completed}
                onChange={() => toggleTaskCompletion(task.id, task.completed)}
              />
              <span>{task.title} - {task.date} ({task.sessions} sessions)</span>
              <Trash className="delete-icon" onClick={() => handleDeleteTask(task.id)} />
            </li>
          ))}
        </ul>
      </div>

      {/* Floating Plus Button */}
      <button className="fab" onClick={() => setShowModal(true)}>
        <Plus size={24} />
      </button>

      {/* Modal for Task Input */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>Add New Task</h2>
            <input
              type="text"
              placeholder="Task Name"
              value={taskName}
              onChange={(e) => setTaskName(e.target.value)}
            />
            <input
              type="date"
              value={taskDate}
              onChange={(e) => setTaskDate(e.target.value)}
            />
            <input
              type="number"
              placeholder="Number of Sessions"
              value={taskSessions}
              onChange={(e) => setTaskSessions(e.target.value)}
            />
            <div className="modal-buttons">
              <button className="cancel-btn" onClick={() => setShowModal(false)}>Cancel</button>
              <button className="task-add-btn" onClick={handleAddTask}>Add Task</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default TaskList;
