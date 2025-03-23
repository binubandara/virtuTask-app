import React, { useState } from 'react';
import './mytasks.css';

const MyTasks = () => {
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState('');
  const [showBreakdown, setShowBreakdown] = useState(false);
  const [breakdownTask, setBreakdownTask] = useState('');
  const [breakdownMessages, setBreakdownMessages] = useState([]);

  const addTask = () => {
    if (newTask.trim()) {
      setTasks([...tasks, {
        id: Date.now(),
        text: newTask,
        checked: false,
        status: 'To Do'
      }]);
      setNewTask('');
    }
  };

  const toggleCheck = (taskId) => {
    setTasks(tasks.map(task => {
      if (task.id === taskId) {
        const newChecked = !task.checked;
        return {
          ...task,
          checked: newChecked,
          status: newChecked ? 'Complete' : 'To Do'
        };
      }
      return task;
    }));
  };

  const toggleStatus = (taskId) => {
    setTasks(tasks.map(task => {
      if (task.id === taskId) {
        const statusOrder = ['To Do', 'In Progress', 'Complete', 'On Hold'];
        const currentIndex = statusOrder.indexOf(task.status);
        const nextIndex = (currentIndex + 1) % statusOrder.length;
        const newStatus = statusOrder[nextIndex];
        
        return {
          ...task,
          status: newStatus,
          checked: newStatus === 'Complete'
        };
      }
      return task;
    }));
  };

  const handleUploadMessage = () => {
    if (breakdownTask.trim()) {
      setBreakdownMessages([...breakdownMessages, breakdownTask]);
      setBreakdownTask('');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleUploadMessage();
    }
  };

  return (
    <div className="mytasks-container">
      {/* Breakdown Sidebar */}
      {showBreakdown && (
        <div className="breakdown-sidebar">
          <div className="breakdown-header">
            <h2>Breaking Down the Task</h2>
            <button 
              className="close-breakdown"
              onClick={() => setShowBreakdown(false)}
            >
              ×
            </button>
          </div>
          <div className="breakdown-separator"></div>
          <div className="breakdown-content">
            <div className="chat-messages">
              {breakdownMessages.map((message, index) => (
                <div key={index} className="user-message">
                  {message}
                </div>
              ))}
            </div>
            <div className="breakdown-input-container">
              <input
                type="text"
                className="breakdown-input"
                placeholder="Enter Task Description"
                value={breakdownTask}
                onChange={(e) => setBreakdownTask(e.target.value)}
                onKeyPress={handleKeyPress}
              />
              <button 
                onClick={handleUploadMessage} 
                className="upload-icon-button"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="1.5"
                  stroke="currentColor"
                  className="upload-icon"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="mytasks-header-section">
        <h1 className="mytasks-title">MY TASKS</h1>
        <div className="mytasks-underline"></div>
      </div>

      <div className="mytasks-controls-section">
        <div className="mytasks-filters-container">
          <select className="mytasks-dropdown">
            <option>Project</option>
          </select>
          <select className="mytasks-dropdown">
            <option>My Tasks</option>
          </select>
          <div className="mytasks-progress-text">Overall Progress</div>
        </div>
        <button 
          className="mytasks-breakdown-button"
          onClick={() => setShowBreakdown(true)}
        >
          Break down the task for me
        </button>
      </div>

      <div className="mytasks-task-list-section">
        <h2 className="mytasks-task-list-title">Task Title</h2>
        <div className="mytasks-task-list-container">
          <div className="mytasks-task-list-header">
            <div className="mytasks-task-column">Add Tasks</div>
            <div className="mytasks-status-column">Status</div>
          </div>
          
          {tasks.map(task => (
            <div 
              key={task.id} 
              className={`mytasks-task-item ${task.status.replace(' ', '-')}-bg`}
            >
              <div className="mytasks-task-content">
                <label className="mytasks-custom-checkbox">
                  <input 
                    type="checkbox"
                    checked={task.checked}
                    onChange={() => toggleCheck(task.id)}
                  />
                  <span className="mytasks-checkmark"></span>
                </label>
                <span style={{ 
                  textDecoration: task.checked ? 'line-through' : 'none',
                  opacity: task.checked ? 0.6 : 1
                }}>
                  {task.text}
                </span>
              </div>
              <button 
                className={`mytasks-status-button ${task.status.replace(' ', '-')}`}
                onClick={() => toggleStatus(task.id)}
              >
                {task.status}
              </button>
            </div>
          ))}

          <div className="mytasks-add-task-container">
            <input
              type="text"
              value={newTask}
              onChange={(e) => setNewTask(e.target.value)}
              placeholder="Add new task"
            />
            <button onClick={addTask} className="mytasks-add-button">Add</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyTasks;