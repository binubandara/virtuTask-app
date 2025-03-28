import React, { useState, useEffect } from 'react';
import './TaskForm.css';
import axios from 'axios'; // Import axios

// Add API_URL constant
const API_URL = 'http://localhost:5004/api';

const TaskForm = ({ 
  closeForm, 
  addTask, 
  editTask,
  projectStartDate, 
  projectDueDate,
  projectMembers,
  initialData,
  mode,
  projectId // Add projectId prop
}) => {
  // Format date as YYYY-MM-DD for input elements
  const formatDateForInput = (dateString) => {
    if (!dateString) return '';
    
    // If already in YYYY-MM-DD format, return as is
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) return dateString;
    
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return ''; // Invalid date
      
      return date.toISOString().split('T')[0];
    } catch (error) {
      console.error("Date formatting error:", error);
      return '';
    }
  };
  
  // Set default dates based on project dates
  const getDefaultStartDate = () => {
    if (initialData?.startDate) return formatDateForInput(initialData.startDate);
    if (projectStartDate) return formatDateForInput(projectStartDate);
    return formatDateForInput(new Date().toISOString());
  };
  
  const getDefaultDueDate = () => {
    if (initialData?.dueDate) return formatDateForInput(initialData.dueDate);
    if (projectDueDate) return formatDateForInput(projectDueDate);
    
    // Default to 7 days from now if no project due date
    const sevenDaysLater = new Date();
    sevenDaysLater.setDate(sevenDaysLater.getDate() + 7);
    return formatDateForInput(sevenDaysLater.toISOString());
  };

  // Properly initialize state with formatted dates
  const [taskData, setTaskData] = useState({
    taskName: initialData?.taskName || '',
    status: initialData?.status || 'pending',
    priority: initialData?.priority || 'medium',
    startDate: getDefaultStartDate(),
    dueDate: getDefaultDueDate(),
    assignees: initialData?.assignees || '',
  });
  
  // Update form data when initialData changes
  useEffect(() => {
    if (initialData) {
      setTaskData({
        taskName: initialData.taskName || '',
        status: initialData.status || 'pending',
        priority: initialData.priority || 'medium',
        startDate: formatDateForInput(initialData.startDate) || getDefaultStartDate(),
        dueDate: formatDateForInput(initialData.dueDate) || getDefaultDueDate(),
        assignees: initialData.assignees || '',
      });
    }
  }, [initialData]);

  // Add getToken function
  const getToken = () => {
    return localStorage.getItem('userToken');
  };

  // Add updateTaskInApi function
  const updateTaskInApi = async (taskData) => {
    console.log("Updating task:", taskData);
    try {
      const token = getToken();
      // Make sure we have the task_id from initialData
      if (!initialData || !initialData.task_id) {
        throw new Error("Task ID is missing");
      }
      
      // Convert the comma-separated assignees string to an array of objects
      const assigneesList = taskData.assignees
        ? taskData.assignees.split(',')
            .map(user => user.trim())
            .filter(user => user !== '')
            .map(user => ({
              user: user,
              status: taskData.status === 'completed' ? 'Complete' : 'In Progress'
            }))
        : [];

      // Convert status and priority to the format expected by the API
      const statusMap = {
        'pending': 'Pending',
        'in_progress': 'In Progress',
        'completed': 'Complete'
      };
      
      const priorityMap = {
        'high': 'High',
        'medium': 'Medium',
        'low': 'Low'
      };
      
      // Format the data for the API according to the expected JSON structure
      const apiTaskData = {
        name: taskData.taskName,
        dueDate: new Date(taskData.dueDate).toISOString(),
        priority: priorityMap[taskData.priority] || 'Medium',
        status: statusMap[taskData.status] || 'Pending',
        assignees: assigneesList,
        description: taskData.description || 'No description provided'
      };
      
      console.log("Sending to API:", apiTaskData);
      
      const response = await axios.patch(
        `${API_URL}/projects/${projectId}/tasks/${initialData.task_id}`, 
        apiTaskData, 
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      console.log("API Response:", response);
      
      // If successful, call the parent component's editTask function
      editTask(taskData);
      return true;
    } catch (error) {
      console.error('API error updating task:', error);
      alert('Error updating task. Please try again.');
      return false;
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateDates()) return;

    // Trim and filter empty values
    const enteredAssignees = taskData.assignees
      ? taskData.assignees
          .split(',')
          .map(a => a.trim())
          .filter(a => a !== '')
      : [];

    const processedData = {
      ...taskData,
      assignees: enteredAssignees.join(', ') // Store as comma-separated string
    };

    if (mode === 'edit') {
      if (window.confirm('Confirm task changes?')) {
        // Call the API update function instead of directly calling editTask
        updateTaskInApi(processedData);
      }
    } else {
      addTask(processedData);
    }
  };

  const handleReset = () => {
    const message = mode === 'edit' 
      ? 'Reset to original values?' 
      : 'Are you sure you want to reset?';
    
    if (window.confirm(message)) {
      if (mode === 'edit' && initialData) {
        // Reset to initial values when editing
        setTaskData({
          taskName: initialData.taskName || '',
          status: initialData.status || 'pending',
          priority: initialData.priority || 'medium',
          startDate: initialData.startDate || '',
          dueDate: initialData.dueDate || '',
          assignees: initialData.assignees || '',
        });
      } else {
        // Reset to empty values when creating
        setTaskData({
          taskName: '',
          status: 'pending',
          priority: 'medium',
          startDate: '',
          dueDate: '',
          assignees: '',
        });
      }
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setTaskData(prev => ({ ...prev, [name]: value }));
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
    if (!taskData.startDate || !taskData.dueDate) {
      alert('Please select both start and due dates');
      return false;
    }

    try {
      const taskStart = new Date(taskData.startDate);
      const taskDue = new Date(taskData.dueDate);
      
      // Set times to midnight to compare dates only
      taskStart.setHours(0, 0, 0, 0);
      taskDue.setHours(0, 0, 0, 0);
      
      // Check if dates are valid
      if (isNaN(taskStart.getTime()) || isNaN(taskDue.getTime())) {
        alert('Please enter valid dates');
        return false;
      }

      // If project dates are provided, validate against them
      if (projectStartDate && projectDueDate) {
        const projStart = new Date(projectStartDate);
        const projDue = new Date(projectDueDate);
        
        // Set times to midnight for fair comparison
        projStart.setHours(0, 0, 0, 0);
        projDue.setHours(0, 0, 0, 0);

        if (taskStart < projStart) {
          alert(`Task start date (${taskData.startDate}) cannot be before project start date (${formatDateForInput(projectStartDate)})`);
          return false;
        }

        if (taskStart > projDue) {
          alert(`Task start date (${taskData.startDate}) cannot be after project end date (${formatDateForInput(projectDueDate)})`);
          return false;
        }

        if (taskDue < taskStart) {
          alert(`Task due date (${taskData.dueDate}) cannot be before task start date (${taskData.startDate})`);
          return false;
        }

        if (taskDue > projDue) {
          alert(`Task due date (${taskData.dueDate}) cannot be after project end date (${formatDateForInput(projectDueDate)})`);
          return false;
        }
      } else {
        // If project dates aren't provided, just check task date order
        if (taskDue < taskStart) {
          alert(`Task due date (${taskData.dueDate}) cannot be before task start date (${taskData.startDate})`);
          return false;
        }
      }

      return true;
    } catch (error) {
      console.error("Date validation error:", error);
      alert('Error validating dates. Please check the date format.');
      return false;
    }
  };

  const handleClose = () => {
    if (window.confirm('Are you sure you want to cancel? Unsaved changes will be lost.')) {
      closeForm();
    }
  };

  // For debugging
  console.log("Current taskData:", taskData);
  console.log("Initial data provided:", initialData);

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
                  onClick={() => setTaskData(prev => ({ ...prev, status: option.value }))}
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
                  onClick={() => setTaskData(prev => ({ ...prev, priority: option.value }))}
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
              min={projectStartDate ? formatDateForInput(projectStartDate) : ''}
              max={projectDueDate ? formatDateForInput(projectDueDate) : ''}
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
              min={taskData.startDate || (projectStartDate ? formatDateForInput(projectStartDate) : '')}
              max={projectDueDate ? formatDateForInput(projectDueDate) : ''}
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
              value={taskData.assignees}
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