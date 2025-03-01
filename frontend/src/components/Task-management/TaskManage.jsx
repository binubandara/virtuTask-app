import React, { useState, useEffect } from 'react';
import './TaskManage.css'; // Verify this import exists
import TaskForm from './TaskForm';
import { useParams, useNavigate } from 'react-router-dom';

const TaskManage = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const [tasks, setTasks] = useState([]);
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [currentProject, setCurrentProject] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProjectData = () => {
      try {
        const savedProjects = JSON.parse(localStorage.getItem('projects')) || [];
        const project = savedProjects.find(p => p.id === Number(projectId));
        
        if (project) {
          setCurrentProject({
            id: project.id,
            projectName: project.projectname,
            priorityColor: project.color
          });
        } else {
          console.error('Project not found');
          navigate('/'); // Redirect if project doesn't exist
        }
      } catch (error) {
        console.error('Error loading project:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProjectData();
  }, [projectId, navigate]);

  const addTask = (taskData) => {
    setTasks((prevTasks) => [...prevTasks, { id: Date.now(), ...taskData }]);
    setShowTaskForm(false);
  };

  const handleBack = () => navigate(-1);

  if (loading) {
    return <div className="loading-container">Loading...</div>;
  }

  if (!currentProject) {
    return <div className="error-container">Project not found</div>;
  }

  return (
    <div className="task-manage-container">
      <button className="members-dropdown">
        Members ▼
      </button>
      <button onClick={handleBack} className="back-button">
        ← Back to Projects
      </button>
      
      <div className="header-section">
        <h1 className="project-title" style={{ borderColor: currentProject.priorityColor }}>
          {currentProject.projectName}
        </h1>
      </div>

      <div className="tasks-section">
        <div className="tasks-header">
          <h2 className="section-title">Tasks</h2>
          <button className="add-tasks-btn" onClick={() => setShowTaskForm(true)}>
            Add Tasks
          </button>
        </div>
        <div className="underline"></div>

        <div className="tasks-list">
          {tasks.length > 0 ? tasks.map(task => (
            <div className="task-item" key={task.id}>
              <p>{task.taskName}</p>
              <span>{task.priority} - {task.dueDate}</span>
            </div>
          )) : <p className="no-tasks">No tasks available</p>}
        </div>
      </div>

      {showTaskForm && (
        <TaskForm closeForm={() => setShowTaskForm(false)} addTask={addTask} />
      )}
    </div>
  );
};

export default TaskManage;