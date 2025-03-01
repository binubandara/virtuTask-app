import React, { useState, useEffect } from 'react';
import './TaskManage.css';
import TaskForm from './TaskForm';
import { useParams } from 'react-router-dom';

const TaskManage = () => {
  const { projectId } = useParams();
  const [tasks, setTasks] = useState([]);
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [currentProject, setCurrentProject] = useState({});

  // Simulated fetching project from a data source
  useEffect(() => {
    const fetchProject = async () => {
      // Fetch project details here
      // For now, just simulating project to showcase usage
      setCurrentProject({ id: projectId, projectName: 'Project Title', priorityColor: '#f79d65' });
    };
    fetchProject();
  }, [projectId]);

  const addTask = (taskData) => {
    setTasks((prevTasks) => [...prevTasks, { id: Date.now(), ...taskData }]);
    setShowTaskForm(false);
  };

  return (
    <div className="task-manage-container">
      <h1 className="project-title" style={{ borderColor: currentProject.priorityColor }}>
        {currentProject.projectName}
      </h1>

      <div className="tasks-header">
        <h2>Tasks</h2>
        <button className="add-tasks-btn" onClick={() => setShowTaskForm(true)}>Add Tasks</button>
      </div>

      <div className="tasks-list">
        {tasks.length > 0 ? tasks.map(task => (
          <div className="task-item" key={task.id}>
            <p>{task.taskName}</p>
            <span>{task.priority} - {task.dueDate}</span>
          </div>
        )) : <p>No tasks available</p>}
      </div>

      {showTaskForm && (
        <TaskForm closeForm={() => setShowTaskForm(false)} addTask={addTask} />
      )}
    </div>
  );
};

export default TaskManage;