import React, { useState } from 'react';
import './TaskForm.css';

const TaskForm = ({ closeForm, addTask }) => {
  const [taskData, setTaskData] = useState({
    taskName: '',
    status: 'pending',
    priority: 'medium',
    dueDate: '',
    assignee: '',
    description: ''
  });

  const handleChange = (e) => {
    setTaskData({ ...taskData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    addTask(taskData);
  };

  return (
    <div className="task-form-container">
      <h2>Add Task</h2>
      <form className = "taskform" onSubmit={handleSubmit}>
        <label>Task Name:</label>
        <input type="text" name="taskName" value={taskData.taskName} onChange={handleChange} required />

        <label>Status:</label>
        <select name="status" value={taskData.status} onChange={handleChange}>
          <option value="pending">Pending</option>
          <option value="in_progress">In Progress</option>
          <option value="completed">Completed</option>
          <option value="on_hold">On Hold</option>
        </select>

        <label>Priority:</label>
        <select name="priority" value={taskData.priority} onChange={handleChange}>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>

        <label>Due Date:</label>
        <input type="date" name="dueDate" value={taskData.dueDate} onChange={handleChange} required />

        <button type="submit">Add Task</button>
        <button type="button" onClick={closeForm}>Cancel</button>
      </form>
    </div>
  );
};

export default TaskForm;