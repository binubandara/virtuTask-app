import React, { useState, useEffect } from 'react';
import './TaskManage.css';
import TaskForm from './TaskForm';
import { useParams, useNavigate } from 'react-router-dom';
import TaskInformation from './TaskInformation';

const PRIORITY_COLORS = {
  high: '#ff4444',
  medium: '#ffa500',
  low: '#4CAF50'
};

const STATUS_COLORS = {
  pending: '#f67a15',
  on_hold: '#939698',
  in_progress: '#0d85fd',
  completed: '#28a46a'
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
  const [editingTask, setEditingTask] = useState(null);

  useEffect(() => {
    const savedProjects = JSON.parse(localStorage.getItem('projects')) || [];
    const project = savedProjects.find(p => p.id === Number(projectId));
    
    if (project) {
      setCurrentProject({
        id: project.id,
        projectName: project.projectname,
        startDate: project.startDate,
        dueDate: project.dueDate,
        priority: project.priority || 'medium',
        priorityColor: PRIORITY_COLORS[project.priority] || '#e0e0e0'
      });
    }
  }, [projectId]);

  const addTask = (taskData) => {
    setTasks((prevTasks) => [...prevTasks, { id: Date.now(), ...taskData }]);
    setShowTaskForm(false);
  };

  const editTask = (updatedTask) => {
    setTasks(prevTasks => prevTasks.map(task => 
      task.id === editingTask.id ? {...updatedTask, id: task.id} : task
    ));
    setShowTaskForm(false);
    setEditingTask(null);
  };

  const handleBack = () => navigate(-1);

  const TaskNameWithEdit = ({ task }) => (
    <td className='tname'>
      <div className="task-name-container">
        <button 
          className="task-edit-icon"
          onClick={(e) => {
            e.stopPropagation();
            setEditingTask(task);
            setShowTaskForm(true);
          }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
            <path d="M21.731 2.269a2.625 2.625 0 0 0-3.712 0l-1.157 1.157 3.712 3.712 1.157-1.157a2.625 2.625 0 0 0 0-3.712ZM19.513 8.199l-3.712-3.712-12.15 12.15a5.25 5.25 0 0 0-1.32 2.214l-.8 2.685a.75 .75 0 0 0 .933 .933l2.685-.8a5.25 5.25 0 0 0 2.214-1.32L19.513 8.2Z" />
          </svg>
        </button>
        {task.taskName}
      </div>
    </td>
  );

  return (
    <div className="task-manage-container">
      <button className="members-dropdown">Members ▼</button>
      <button onClick={handleBack} className="back-button">◄</button>
      
      <div className="header-section">
        <h1 className="project-title" style={{ borderColor: currentProject.priorityColor }}>
          {currentProject.projectName}
        </h1>
      </div>

      <div className="tasks-section">
        <div className="tasks-header">
          <h2 className="section-title" style={{ 
            borderColor: currentProject.priorityColor,
            backgroundColor: `${currentProject.priorityColor}20`
          }}>
            Tasks
          </h2>
          <button 
            className="add-tasks-btn" 
            onClick={() => {
              setEditingTask(null);
              setShowTaskForm(true);
            }}
            style={{ backgroundColor: currentProject.priorityColor }}
          >
            Add Tasks
          </button>
        </div>
        <div className="underline" style={{ borderBottomColor: currentProject.priorityColor }}></div>

        <div className="tasks-list">
          {tasks.length > 0 ? (
            <table className="tasks-table">
              <thead>
                <tr>
                  <th className='tname'></th>
                  <th className='task-assignee'>Assignee</th>
                  <th className='task-due-date'>Due Date</th>
                  <th className='task-levels'>Priority</th>
                  <th className='task-levels'>Status</th>
                </tr>
              </thead>
              <tbody>
                {tasks.map(task => (
                  <tr className="task-item" key={task.id}onClick={() => setSelectedTask(task)}>
                    <TaskNameWithEdit task={task} />
                    <td className='task-assignee'>{task.assignee}</td>
                    <td className='task-due-date'>{task.dueDate}</td>
                    <td className='task-levels'>
                      <span className="priority-pill" 
                        style={{ backgroundColor: PRIORITY_COLORS[task.priority] }}>
                        {task.priority}
                      </span>
                    </td>
                    <td className='task-levels'>
                      <span className="status-badge" 
                        style={{ backgroundColor: STATUS_COLORS[task.status] }}>
                        {task.status.replace(/_/g, ' ')}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : <p className="no-tasks">No tasks available</p>}
        </div>
      </div>
      {selectedTask && (
        <TaskInformation 
          task={selectedTask} 
          onClose={() => setSelectedTask(null)} 
        />
      )}

      {showTaskForm && (
        <div className="modal-overlay">
          <TaskForm 
            closeForm={() => {
              setShowTaskForm(false);
              setEditingTask(null);
            }}
            addTask={addTask}
            editTask={editTask}
            projectStartDate={currentProject.startDate}
            projectDueDate={currentProject.dueDate}
            initialData={editingTask}
            mode={editingTask ? 'edit' : 'create'}
          />
        </div>
      )}
    </div>
  );
};

export default TaskManage;