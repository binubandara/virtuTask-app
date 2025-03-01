import React, { useState, useEffect } from 'react';
import './TaskManage.css';
import TaskForm from './TaskForm';
import { useParams, useNavigate } from 'react-router-dom';

// Priority color mapping
const PRIORITY_COLORS = {
  high: '#ff4444',
  medium: '#ffa500',
  low: '#4CAF50'
};

const TaskManage = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const [tasks, setTasks] = useState([]);
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [currentProject, setCurrentProject] = useState({
    priorityColor: '#e0e0e0',
    priority: 'medium'
  });

  useEffect(() => {
    const savedProjects = JSON.parse(localStorage.getItem('projects')) || [];
    const project = savedProjects.find(p => p.id === Number(projectId));
    
    if (project) {
      setCurrentProject({
        id: project.id,
        projectName: project.projectname,
        priority: project.priority || 'medium',
        priorityColor: PRIORITY_COLORS[project.priority] || '#e0e0e0'
      });
    }
  }, [projectId])

  const addTask = (taskData) => {
    setTasks((prevTasks) => [...prevTasks, { id: Date.now(), ...taskData }]);
    setShowTaskForm(false);
  };

  const handleBack = () => navigate(-1);

  return (
    <div className="task-manage-container">
      <button className="members-dropdown">
        Members ▼
      </button>
      <button onClick={handleBack} className="back-button">
        ◄
      </button>
      
      <div className="header-section">
        <h1 className="project-title" style={{ borderColor: currentProject.priorityColor }}>
          {currentProject.projectName}
        </h1>
      </div>

      <div className="tasks-section">
        <div className="tasks-header">
          <h2 
            className="section-title" 
            style={{ 
              borderColor: currentProject.priorityColor,
              backgroundColor: `${currentProject.priorityColor}20`
            }}
          >
            Tasks
          </h2>
          <button 
            className="add-tasks-btn" 
            onClick={() => setShowTaskForm(true)}
            style={{ backgroundColor: currentProject.priorityColor }}
          >
            Add Tasks
          </button>
        </div>
        <div 
          className="underline" 
          style={{ borderBottomColor: currentProject.priorityColor }}
        ></div>

        <div className="tasks-list">
          {tasks.length > 0 ? tasks.map(task => (
            <div 
              className="task-item" 
              key={task.id}
              style={{ borderLeftColor: currentProject.priorityColor }}
            >
              <p>{task.taskName}</p>
              <span>{task.priority} - {task.dueDate}</span>
            </div>
          )) : <p className="no-tasks">No tasks available</p>}
        </div>
      </div>

      {showTaskForm && (
      <div className="modal-overlay">
        <TaskForm 
          closeForm={() => setShowTaskForm(false)} 
          addTask={addTask} 
        />
      </div>
    )}
    </div>
  );
};

export default TaskManage;