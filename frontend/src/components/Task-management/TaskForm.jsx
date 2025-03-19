import React, { useState } from 'react';
import './TaskForm.css';

const TaskForm = ({ 
  closeForm, 
  addTask, 
  editTask,
  projectStartDate, 
  projectDueDate,
  projectMembers, // Added missing prop
  initialData,
  mode 
}) => {
  const [taskData, setTaskData] = useState(initialData || {
    taskName: '',
    status: 'pending',
    priority: 'medium',
    startDate: '',
    dueDate: '',
    assignees: initialData?.assignees || '',
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateDates()) return;

    // Trim and filter empty values
    const enteredAssignees = taskData.assignees
      .split(',')
      .map(a => a.trim())
      .filter(a => a !== '');

    // Validate against project members
    const invalidAssignees = enteredAssignees
      .filter(a => !projectMembers.includes(a));

    if (invalidAssignees.length > 0) {
      alert(`The following members are not part of the project:\n${invalidAssignees.join('\n')}\n\nPlease add them to the project first.`);
      return;
    }

    const processedData = {
      ...taskData,
      assignees: enteredAssignees.join(', ') // Store as comma-separated string
    };

    if (mode === 'edit') {
      if (window.confirm('Confirm task changes?')) {
        editTask(processedData); // Fixed prop reference
      }
    } else {
      addTask(processedData); // Fixed prop reference
    }
  };

  // Rest of the component remains the same...
  const handleReset = () => {
    const message = mode === 'edit' 
      ? 'Reset to original values?' 
      : 'Are you sure you want to reset?';
    
    if (window.confirm(message)) {
      setTaskData(initialData || {
        taskName: '',
        status: 'pending',
        priority: 'medium',
        startDate: '',
        dueDate: '',
      });
    }
  };

  const handleChange  = (e) => {
    setTaskData({ ...taskData, [e.target.name]: e.target.value });
  };

  const statusOptions = [
    { value: 'pending', label: 'Pending', color: 'var(--taskform-orange)' },
    { value: 'in_progress', label: 'In-Progress', color: 'var(--taskform-blue)' },
    { value: 'completed', label: 'Completed', color: 'var(--taskform-green)' },
  ];

  const priorityOptions = [
    { value: 'high', label: 'High', color: 'var(--taskform-red)' },
    { value: 'medium', label: 'Medium', color: 'var(--taskform-yellow)' },
    { value: 'low', label: 'Low', color: 'var(--taskform-green)' },
  ];

  const validateDates = () => {
    const taskStart = new Date(taskData.startDate);
    const taskDue = new Date(taskData.dueDate);
    const projStart = new Date(projectStartDate);
    const projDue = new Date(projectDueDate);

    if (taskStart < projStart || taskStart > projDue) {
      alert('Task start date must be within project dates');
      return false;
    }

    if (taskDue < taskStart) {
      alert('Task due date cannot be before start date');
      return false;
    }

    if (taskDue < projStart || taskDue > projDue) {
      alert('Task due date must be within project dates');
      return false;
    }

    return true;
  };

  const handleClose = () => {
    if (window.confirm('Are you sure you want to cancel? Unsaved changes will be lost.')) {
      closeForm();
    }
  };

  return (
    <div className="task-form-container">
      <button className="task-form-close" onClick={handleClose}>
        <svg 
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24" 
          strokeWidth="1.5"
          stroke="currentColor" 
          className="size-6"
          width="24" 
          height="24"
        >
          <path 
            strokeLinecap="round"
            strokeLinejoin="round" 
            d="M5 12h14" 
          />
        </svg>
      </button>
      <h3>{mode === 'edit' ? 'Edit Task' : 'Add New Task'}</h3>
        
      <form className="taskform" onSubmit={handleSubmit}>
        <label>Task Name:</label>
        <input
          type="text"
          name="taskName"
          value={taskData.taskName}
          onChange={handleChange}
          required
        />

        <div className="taskform-columns">
          <div className="taskform-group">
            <label>Status:</label>
            <div className="taskform-button-group">
              {statusOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  className={`taskform-status-button ${taskData.status === option.value ? 'selected' : ''}`}
                  style={{ backgroundColor: option.color }}
                  onClick={() => setTaskData({ ...taskData, status: option.value })}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          <div className="taskform-group">
            <label>Priority Level:</label>
            <div className="taskform-button-group">
              {priorityOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  className={`taskform-priority-button ${taskData.priority === option.value ? 'selected' : ''}`}
                  style={{ backgroundColor: option.color }}
                  onClick={() => setTaskData({ ...taskData, priority: option.value })}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="taskform-date-inputs">
          <div className="taskform-date-group">
            <label>Start Date:</label>
            <input
              type="date"
              name="startDate"
              value={taskData.startDate}
              onChange={handleChange}
              required
            />
          </div>
          <div className="taskform-date-group">
            <label>Due Date:</label>
            <input
              type="date"
              name="dueDate"
              value={taskData.dueDate}
              onChange={handleChange}
              required
            />
          </div>
          <div className="taskform-assignees-section">
            <div className="taskform-icon-container">
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                fill="none" 
                viewBox="0 0 24 24" 
                strokeWidth="1" 
                stroke="currentColor" 
                className="taskform-assignees-icon"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  d="M17.982 18.725A7.488 7.488 0 0 0 12 15.75a7.488 7.488 0 0 0-5.982 2.975m11.963 0a9 9 0 1 0-11.963 0m11.963 0A8.966 8.966 0 0 1 12 21a8.966 8.966 0 0 1-5.982-2.275M15 9.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" 
                />
              </svg>
            </div>
            <label>Assignees</label>
            <input 
              type="text" 
              name="assignees"
              className="taskform-assignees-input" 
              placeholder="Comma-separated user IDs"
              value={taskData.assignees || ''}
              onChange={handleChange}
            />
          </div>
        </div>
        <div className="taskform-buttons">
          <button 
            type="button" 
            className="taskform-reset-button" 
            onClick={handleReset}
          >
            {mode === 'edit' ? 'Original Input' : 'Reset'}
          </button>
          <button 
            type="submit" 
            className="taskform-submit-button"
          >
            {mode === 'edit' ? 'Confirm Edit' : 'Add Task'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default TaskForm;