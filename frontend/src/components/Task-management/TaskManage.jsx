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

const TaskManage = ({ projects, setProjects }) => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const [tasks, setTasks] = useState([]);
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [currentProject, setCurrentProject] = useState({
    priorityColor: '#e0e0e0',
    priority: 'medium'
  });
  const [editingTask, setEditingTask] = useState(null);
  // Add this to your existing state declarations
  const [selectedTask, setSelectedTask] = useState(null);
  const [selectedTaskId, setSelectedTaskId] = useState(null); // New state for dropdown


  useEffect(() => {
    const project = projects.find(p => p.id === Number(projectId));
    if (project) {
      setCurrentProject({
        id: project.id,
        projectName: project.projectname,
        startDate: project.startDate,
        dueDate: project.dueDate,
        priority: project.priority || 'medium',
        priorityColor: PRIORITY_COLORS[project.priority] || '#e0e0e0'
      });
      setTasks(project.tasks || []);
    }
  }, [projectId, projects]);

  const updateTasks = (newTasks) => {
    const updatedProjects = projects.map(p => {
      if (p.id === Number(projectId)) {
        return { ...p, tasks: newTasks };
      }
      return p;
    });
    setProjects(updatedProjects);
    setTasks(newTasks);
  };

  const addTask = (taskData) => {
    const newTask = { id: Date.now(), ...taskData };
    updateTasks([...tasks, newTask]);
    setShowTaskForm(false);
  };

  const editTask = (updatedTask) => {
    const newTasks = tasks.map(task => 
      task.id === updatedTask.id ? updatedTask : task
    );
    updateTasks(newTasks);
    setShowTaskForm(false);
    setEditingTask(null);
  };

  const deleteTask = (taskId) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      const newTasks = tasks.filter(task => task.id !== taskId);
      updateTasks(newTasks);
    }
    setSelectedTaskId(null);
  };
  

  
  const handleBack = () => navigate(-1);

  
  // ... keep existing useEffect and other functions ...

  const TaskNameWithEdit = ({ task }) => (
    <td className='tname'>
      <div className="task-name-container">
        <button 
          className="task-edit-icon"
          onClick={(e) => {
            e.stopPropagation();
            setSelectedTaskId(task.id === selectedTaskId ? null : task.id);
          }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
            <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 9h16.5m-16.5 6.75h16.5" />
          </svg>
        </button>
        {selectedTaskId === task.id && (
          <div className="task-options-dropdown">
            <div 
              className="option"
              onClick={(e) => {
                e.stopPropagation();
                setEditingTask(task);
                setShowTaskForm(true);
                setSelectedTaskId(null);
              }}
            >
              Edit Task
            </div>
            <div 
              className="option delete-option"
              onClick={(e) => {
                e.stopPropagation();
                deleteTask(task.id);
              }}
            >
              Delete Task
            </div>
          </div>
        )}
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
                    <td className='task_assignee'>{task.assignee}</td>
                    <td className='task_due_date'>{task.dueDate}</td>
                    <td className='task_levels'>
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
