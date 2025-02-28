// TaskManager.jsx
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import './TaskManager.css';
import TaskForm from './TaskForm';

const TaskManager = ({ projects }) => {
  const { projectId } = useParams();
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    const foundProject = projects.find(p => p.id.toString() === projectId);
    setProject(foundProject);
    setTasks(foundProject?.tasks || []);
  }, [projectId, projects]);

  const addTask = (newTask) => {
    setTasks([...tasks, { ...newTask, id: Date.now() }]);
  };

  if (!project) return <div>Loading...</div>;

  return (
    <div className="task-manager-container">
      <div className="task-header">
        <h1 style={{ color: project.color }}>{project.projectname}</h1>
        <button 
          className="add-task-btn"
          onClick={() => setShowTaskForm(true)}
          style={{ backgroundColor: project.color }}
        >
          + Add Tasks
        </button>
      </div>

      <div className="tasks-container">
        {tasks.map(task => (
          <div 
            key={task.id}
            className="task-card"
            style={{ borderLeft: `4px solid ${project.color}` }}
          >
            <div className="task-header">
              <h3>{task.taskName}</h3>
              <span className={`status ${task.status.replace(' ', '-')}`}>
                {task.status}
              </span>
            </div>
            
            <div className="task-details">
              <p>Due: {new Date(task.dueDate).toLocaleDateString()}</p>
              <span className={`priority ${task.priority}`}>
                {task.priority}
              </span>
            </div>
            
            <p className="task-description">{task.description}</p>
          </div>
        ))}
      </div>

      {showTaskForm && (
        <div className="task-form-overlay">
          <TaskForm 
            project={project}
            closeForm={() => setShowTaskForm(false)}
            addTask={addTask}
          />
        </div>
      )}
    </div>
  );
};

export default TaskManager;