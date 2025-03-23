import React, { useState, useEffect } from 'react';
import './TaskManage.css';
import TaskForm from './TaskForm';
import { useParams, useNavigate } from 'react-router-dom';
import TaskInformation from './TaskInformation';
import { useLocation } from 'react-router-dom';

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
const colorPalette = ["#ffc8dd", "#bde0fe", "#a2d2ff", "#94d2bd","#e0b1cb","#adb5bd","#98f5e1","#f79d65","#858ae3","#c2dfe3","#ffccd5","#e8e8e4","#fdffb6","#f1e8b8","#d8e2dc","#fff0f3","#ccff66"];

const getMemberColor = (name) => {
  const hash = name.split('').reduce((acc, char) => char.charCodeAt(0) + acc, 0);
  return colorPalette[hash % colorPalette.length];
};

const MemberIcon = ({ member }) => {
  const firstLetter = member.charAt(0).toUpperCase();
  return (
    <div 
      className="member-icon-circle"
      style={{ 
        backgroundColor: getMemberColor(member),
      }}
    >
      <span className="member-initial">{firstLetter}</span>
    </div>
  );
};

const TaskManage = () => {
  const location = useLocation();
  const isFromMyProjects = location.state?.fromMyProjects || false;
  const [isMembersHovered, setIsMembersHovered] = useState(false);
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

  const loadProjects = () => {
    const saved = localStorage.getItem('projects');
    return saved ? JSON.parse(saved) : [];
  };

  // Save projects to localStorage
  const saveProjects = (updatedProjects) => {
    localStorage.setItem('projects', JSON.stringify(updatedProjects));
  };

  useEffect(() => {
    const projects = loadProjects();
    const project = projects.find(p => p.id === Number(projectId));
  
    if (project) {
      setCurrentProject({
        id: project.id,
        ...project,
        projectName: project.projectname,
        startDate: project.startDate,
        dueDate: project.dueDate,
        priority: project.priority || 'medium',
        priorityColor: PRIORITY_COLORS[project.priority] || '#e0e0e0',
        members: project.members || [],
        tasks: project.tasks || []
      });
  
      // Apply task filtering for My Projects view
      let filteredTasks = project.tasks || [];
    if (isFromMyProjects) {
      filteredTasks = filteredTasks.filter(task => 
        task.assignees?.toLowerCase() // Plural + case-insensitive
          .split(',')
          .map(a => a.trim())
          .includes('tharindy123') // Lowercase comparison
      );
    }
    setTasks(filteredTasks);
  }
}, [projectId, navigate, isFromMyProjects])// Added isFromMyProjects to dependencies

  // Update the updateTasks function to handle attachments
  const updateTasks = (newTasks) => {
    const projects = loadProjects();
    const updatedProjects = projects.map(p => {
      if (p.id === Number(projectId)) {
        return { 
          ...p, 
          tasks: newTasks.map(task => ({
            ...task,
            attachments: task.attachments?.map(att => ({
              id: att.id,
              name: att.name,
              file: att.file
            })) || [],
            comments: task.comments || []
          }))
        };
      }
      return p;
    });
    saveProjects(updatedProjects);
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
        {/* Only show edit controls if NOT coming from My Projects */}
        {!isFromMyProjects && (
          <>
            <button 
              className="task-edit-icon"
              onClick={(e) => {
                e.stopPropagation();
                setSelectedTaskId(task.id === selectedTaskId ? null : task.id);
              }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 9h16.5m-16.5 6.75h16.5" />
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
          </>
        )}
        {task.taskName}
      </div>
    </td>
  );
  if (!currentProject) {
    return <div className="loading">Loading project...</div>;
  }

  return (
    <div className="task-manage-container">
      
     
   
      <div className="members-container"
          onMouseEnter={() => setIsMembersHovered(true)}
          onMouseLeave={() => setIsMembersHovered(false)}>
        <button className="members-dropdown">
          Members ({currentProject?.members?.length || 0}) ▼
        </button>
        
        {isMembersHovered && (
          <div className="members-list">
            {currentProject?.members?.map((member) => (
              <div key={member} className="member-item">
                <MemberIcon member={member} />
                <span>{member}</span>
              </div>
            ))}
          </div>
        )}
      </div>

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
          {!isFromMyProjects && (
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
          )}
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
                    <td className='taskmanage-task_assignee'>
                      <div className="taskmanage-assignee-icons-container">
                        {task.assignees?.split(',').slice(0,4).map((assignee, index) => (
                          <MemberIcon 
                            key={assignee.trim()} 
                            member={assignee.trim()}
                            style={{ zIndex: 4 - index }}
                          />
                        ))}
                        {task.assignees?.split(',').length > 4 && (
                          <div className="extra-members">+{task.assignees.split(',').length - 4}</div>
                        )}
                      </div>
                    </td>
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
          isFromMyProjects={isFromMyProjects}
          currentUser="Tharindy123"
          onUpdateTask={(updatedTask) => {
            const newTasks = tasks.map(t => 
              t.id === updatedTask.id ? updatedTask : t
            );
            updateTasks(newTasks);
          }}
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
            projectMembers={currentProject.members || []} // Add this line
            initialData={editingTask}
            mode={editingTask ? 'edit' : 'create'}
          />
        </div>
      )}
    </div>
  );
};

export default TaskManage;
