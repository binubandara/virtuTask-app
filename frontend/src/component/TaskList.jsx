import React, { useContext, useState } from "react";
import { TaskContext } from "../context/TaskContext";
import { Plus, Trash } from "lucide-react";  

const TaskList = () => {
  const { tasks, addTask, toggleTaskCompletion, deleteTask } = useContext(TaskContext);
  const [showModal, setShowModal] = useState(false);
  const [taskName, setTaskName] = useState("");
  const [taskDate, setTaskDate] = useState("");
  const [taskSessions, setTaskSessions] = useState("");

  const handleAddTask = () => {
    if (taskName.trim() && taskDate && taskSessions) {
      addTask({ name: taskName, date: taskDate, sessions: taskSessions });
      setTaskName("");
      setTaskDate("");
      setTaskSessions("");
      setShowModal(false);
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
                onChange={() => toggleTaskCompletion(task.id)}
              />
              <span>{task.name} - {task.date} ({task.sessions} sessions)</span>
              <Trash className="delete-icon" onClick={() => deleteTask(task.id)} />
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
