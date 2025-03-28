import React, { useState, useEffect } from 'react';
import './TaskManage.css';
import TaskForm from './TaskForm';
import { useParams, useNavigate } from 'react-router-dom';
import TaskInformation from './TaskInformation';
import { useLocation } from 'react-router-dom';
import axios from 'axios';

// API configuration
const API_URL = 'http://localhost:5004/api';
const getToken = () => localStorage.getItem('userToken') || '';

const PRIORITY_COLORS = {
  high: '#ff4444',
  medium: '#ffa500',
  low: '#4CAF50'
};

// Add this right after the PRIORITY_COLORS definition, around line 13-14
const STATUS_COLORS = {
  pending: '#f67a15',
  on_hold: '#939698',
  in_progress: '#0d85fd',
  completed: '#28a46a',
  // Add capitalized and spaced versions for API mapping
  Pending: '#f67a15',
  
  In_Progress: '#0d85fd',
  Completed: '#28a46a'
};
const colorPalette = ["#ffc8dd", "#bde0fe", "#a2d2ff", "#94d2bd","#e0b1cb","#adb5bd","#98f5e1","#f79d65","#858ae3","#c2dfe3","#ffccd5","#e8e8e4","#fdffb6","#f1e8b8","#d8e2dc","#fff0f3","#ccff66"];

// Keep the helper functions
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
  const [selectedTask, setSelectedTask] = useState(null);
  const [selectedTaskId, setSelectedTaskId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  console.log(projectId);
  // Fetch project tasks from API
  const loadProjectTasks = async () => {
    try {
      setIsLoading(true);
      const token = getToken();
      const response = await axios.get(`${API_URL}/projects/${projectId}/tasks`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log("task id",response);
      return response.data;
      
    } catch (error) {
      console.error('Error fetching project tasks:', error);
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch project details from API
  const loadProjectDetails = async () => {
    try {
      setIsLoading(true);
      const token = getToken();
      const response = await axios.get(`${API_URL}/projects/${projectId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching project details:', error);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // Add task to API
  const addTaskToApi = async (taskData) => {
    try {
      const token = getToken();
      const response = await axios.post(`${API_URL}/projects/${projectId}/tasks`, taskData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      console.error('API error adding task:', error);
      alert('Error adding task. Please try again.');
      return null;
    }
  };

  // // Update task in API
  // const updateTaskInApi = async (taskData) => {
  //   console.log("task id",taskData);
  //   try {
  //     const token = getToken();
  //     await axios.patch(`${API_URL}/projects/${projectId}/tasks/${task_id}`, taskData, {
  //       headers: { Authorization: `Bearer ${token}` }
  //     });
  //     return true;
  //   } catch (error) {
  //     console.error('API error updating task:', error);
  //     alert('Error updating task. Please try again.');
  //     return false;
  //   }
  // };

  // Delete task from API
  const deleteTaskFromApi = async (taskId) => {
    try {
      const token = getToken();
      await axios.delete(`${API_URL}/projects/${projectId}/tasks/${taskId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return true;
    } catch (error) {
      console.error('API error deleting task:', error);
      alert('Error deleting task. Please try again.');
      return false;
    }
  };

  // Load project and task data
  useEffect(() => {
    const fetchProjectAndTasks = async () => {
      setIsLoading(true);
      const projectData = await loadProjectDetails();
      const tasksData = await loadProjectTasks();
      
      if (projectData) {
        // Map API project data to your component's format
        setCurrentProject({
          id: projectData._id || projectData.project_id,
          projectName: projectData.name,
          startDate: new Date(projectData.startDate).toLocaleDateString(),
          dueDate: new Date(projectData.dueDate).toLocaleDateString(),
          priority: projectData.priority?.toLowerCase() || 'medium',
          priorityColor: PRIORITY_COLORS[projectData.priority?.toLowerCase()] || '#e0e0e0',
          members: projectData.members || [],
          tasks: tasksData || []
        });
      
        // Process tasks data
        let processedTasks = tasksData.map(task => ({
          id: task._id,
          task_id: task.task_id,
          taskName: task.name,
          dueDate: new Date(task.dueDate).toLocaleDateString(),
          priority: task.priority?.toLowerCase(),
          status: task.status?.toLowerCase(),
          assignees: task.assignees.map(a => a.user).join(', '),
          description: task.description,
          attachments: task.attachments || [],
          comments: task.comments || []
        }));
        
        const userDataString = localStorage.getItem('userData');
    if (!userDataString) {
      console.error('No user data found');
      return projects;
    }
    
    const userData = JSON.parse(userDataString);
    const { username } = userData;
    // Filter tasks for My Projects view
        if (isFromMyProjects) {
          const currentUsername = username; // Replace with actual user ID retrieval
          processedTasks = processedTasks.filter(task => 
            task.assignees.includes(currentUsername)
          );
        }
        
        setTasks(processedTasks);
      } else {
        console.error('Project not found:', projectId);
        navigate('/My-projects-manager');
      }
      setIsLoading(false);
    };
  
    fetchProjectAndTasks();
  }, [projectId, navigate, isFromMyProjects]);

  // Update the updateTasks function to handle the new API structure
  const updateTasks = async (newTasks) => {
    try {
      setTasks(newTasks);
      return true;
    } catch (error) {
      console.error('Failed to update tasks:', error);
      return false;
    }
  };

  const addTask = async (taskData) => {
    // Format taskData to match API expectations
    const apiTaskData = {
      name: taskData.taskName,
      dueDate: taskData.dueDate,
      priority: taskData.priority.charAt(0).toUpperCase() + taskData.priority.slice(1),
      status: taskData.status.charAt(0).toUpperCase() + taskData.status.slice(1),
      assignees: taskData.assignees.split(',').map(user => ({
        user: user.trim(),
        status: "Pending"
      })),
      description: taskData.description || "",
      project_id: projectId
    };
    
    const newTask = await addTaskToApi(apiTaskData);
    
    if (newTask) {
      const processedTask = {
        id: newTask._id,
        task_id: newTask.task_id,
        taskName: newTask.name,
        dueDate: new Date(newTask.dueDate).toLocaleDateString(),
        priority: newTask.priority.toLowerCase(),
        status: newTask.status.toLowerCase(),
        assignees: newTask.assignees.map(a => a.user).join(', '),
        description: newTask.description,
        attachments: newTask.attachments || []
      };
      
      setTasks(prevTasks => [...prevTasks, processedTask]);
      setShowTaskForm(false);
    }
  };

  const editTask = async (updatedTask) => {
    // Format the task data for the API
    const apiTaskData = {
      task_id: updatedTask.task_id,
      name: updatedTask.taskName,
      dueDate: updatedTask.dueDate,
      priority: updatedTask.priority.charAt(0).toUpperCase() + updatedTask.priority.slice(1),
      status: updatedTask.status.charAt(0).toUpperCase() + updatedTask.status.slice(1),
      assignees: updatedTask.assignees.split(',').map(user => ({
        user: user.trim(),
        status: "Pending" // You might want to preserve existing status if possible
      })),
      description: updatedTask.description || ""
    };
    
    const success = await updateTaskInApi(apiTaskData);
    
    if (success) {
      const newTasks = tasks.map(task => 
        task.id === updatedTask.id ? updatedTask : task
      );
      setTasks(newTasks);
      setShowTaskForm(false);
      setEditingTask(null);
    }
  };

  const deleteTask = async (taskId) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      const task = tasks.find(t => t.id === taskId);
      if (!task) return;
      
      const success = await deleteTaskFromApi(task.task_id);
      
      if (success) {
        const newTasks = tasks.filter(task => task.id !== taskId);
        setTasks(newTasks);
      }
    }
    setSelectedTaskId(null);
  };
  
  const handleBack = () => navigate(-1);

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

  if (isLoading) {
    return <div className="loading">Loading project data...</div>;
  }

  if (!currentProject) {
    return <div className="loading">Project not found</div>;
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
            backgroundColor: `${currentProject.priorityColor}20`}}>
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
                  <tr className="task-item" key={task.id} onClick={() => setSelectedTask(task)}>
                    <TaskNameWithEdit task={task} />
                    <td className='taskmanage-task_assignee'>
                      <div className="taskmanage-assignee-icons-container">
                        {task.assignees?.split(',').slice(0,4).map((assignee, index) => (
                          <MemberIcon 
                            key={`${task.id}-${assignee.trim()}-${index}`}
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
                        style={{ backgroundColor: PRIORITY_COLORS[task.priority || 'medium'] }}>
                        {task.priority || 'medium'}
                      </span>
                    </td>
                    <td className='task-levels'>
                    <span className="status-badge" 
                  style={{ 
                    backgroundColor: 
                    task.status === 'completed' ? '#4CAF50' :
                    task.status === 'In Progress' ? '#0d85fd' :
                    task.status === 'pending' ? '#FFA726' :
                    task.status === 'blocked' ? '#F44336' : '#0d85fd'
                  }}>
                  {task.status}
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
          projectId={projectId} // Make sure this is explicitly passed
          onClose={() => {
            setSelectedTask(null);
            // Refresh task data
            const refreshTasks = async () => {
              const tasksData = await loadProjectTasks();
              if (tasksData) {
                // Process tasks data
                let processedTasks = tasksData.map(task => ({
                  id: task._id,
                  task_id: task.task_id,
                  taskName: task.name,
                  dueDate: new Date(task.dueDate).toLocaleDateString(),
                  priority: task.priority?.toLowerCase(),
                  status: task.status?.toLowerCase(),
                  assignees: task.assignees.map(a => a.user).join(', '),
                  description: task.description,
                  attachments: task.attachments || [],
                  comments: task.comments || []
                }));
                
                // Filter tasks for My Projects view if needed
                if (isFromMyProjects) {
                  const userDataString = localStorage.getItem('userData');
                  if (userDataString) {
                    const userData = JSON.parse(userDataString);
                    const { username } = userData;
                    processedTasks = processedTasks.filter(task => 
                      task.assignees.includes(username)
                    );
                  }
                }
                
                setTasks(processedTasks);
              }
            };
            refreshTasks();
          }}
          isFromMyProjects={isFromMyProjects}
          currentUser="EMP7876"
          onUpdateTask={(updatedTask) => {
            // Your existing update logic
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
            projectMembers={currentProject.members || []}
            initialData={editingTask}
            mode={editingTask ? 'edit' : 'create'}
          />
        </div>
      )}
    </div>
  );
};

export default TaskManage;