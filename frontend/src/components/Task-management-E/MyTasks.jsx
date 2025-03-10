import React, { useState } from 'react';
import './mytasks.css';

const MyTasks = () => {
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState('');

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
    setTasks(tasks.map(task => 
      task.id === taskId ? { ...task, checked: !task.checked } : task
    ));
  };

  const toggleStatus = (taskId) => {
    setTasks(tasks.map(task => {
      if (task.id === taskId) {
        const statusOrder = ['To Do', 'In Progress', 'Complete', 'On Hold'];
        const currentIndex = statusOrder.indexOf(task.status);
        const nextIndex = (currentIndex + 1) % statusOrder.length;
        return { ...task, status: statusOrder[nextIndex] };
      }
      return task;
    }));
  };

  return (
    <div className="mytasks-container">
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
        <button className="mytasks-breakdown-button">
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
                        type="mytasks-checkbox" 
                        checked={task.checked}
                        onChange={() => toggleCheck(task.id)}  // Connect the handler
                    />
                    <span className="mytasks-checkmark"></span>
                </label>
                <span>{task.text}</span>
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
              type="mytasks-text"
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