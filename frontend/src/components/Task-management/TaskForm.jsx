// TaskForm.jsx
import React, { useState } from 'react';
import './TaskForm.css';

const TaskForm = ({ project, closeForm, addTask }) => {
  const [formData, setFormData] = useState({
    taskName: '',
    status: 'pending',
    priority: 'medium',
    dueDate: '',
    description: '',
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleStatusChange = (status) => {
    setFormData({ ...formData, status });
  };

  const handlePriorityChange = (priority) => {
    setFormData({ ...formData, priority });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const taskDueDate = new Date(formData.dueDate);
    const projectStart = new Date(project.startDate);
    const projectDue = new Date(project.dueDate);

    if (taskDueDate < projectStart || taskDueDate > projectDue) {
      alert('Due date must be within project dates');
      return;
    }

    addTask(formData);
    closeForm();
  };

  return (
    <div className="task-form-modal" onClick={closeForm}>
      <div className="task-form-content" onClick={(e) => e.stopPropagation()}>
        <div className="task-form-header">
          <h2>{project.projectname}</h2>
          <button className="close-btn" onClick={closeForm}>×</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Task Name *</label>
            <input
              type="text"
              name="taskName"
              value={formData.taskName}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Status</label>
            <div className="status-buttons">
              {['pending', 'in-progress', 'completed', 'on-hold'].map((status) => (
                <button
                  key={status}
                  type="button"
                  className={`status-btn ${formData.status === status ? 'active' : ''} ${status}`}
                  onClick={() => handleStatusChange(status)}
                >
                  {status.replace('-', ' ')}
                </button>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label>Priority</label>
            <div className="priority-buttons">
              {['high', 'medium', 'low'].map((priority) => (
                <button
                  key={priority}
                  type="button"
                  className={`priority-btn ${formData.priority === priority ? 'active' : ''} ${priority}`}
                  onClick={() => handlePriorityChange(priority)}
                >
                  {priority}
                </button>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label>Due Date *</label>
            <input
              type="date"
              name="dueDate"
              value={formData.dueDate}
              onChange={handleChange}
              min={project.startDate}
              max={project.dueDate}
              required
            />
          </div>

          <div className="form-group">
            <label>Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="4"
            />
          </div>

          <div className="form-actions">
            <button type="button" onClick={closeForm}>Cancel</button>
            <button type="submit">Create Task</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TaskForm;