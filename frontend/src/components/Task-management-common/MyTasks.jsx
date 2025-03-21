import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { useSocket } from "../../context/SocketContext";
import './mytasks.css';

const API_URL = 'http://localhost:5004/api';

const MyTasks = () => {
  const { projectId } = useParams();
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [projectName, setProjectName] = useState('');
  const { socket, connected, joinProjectRoom } = useSocket();

  // Fetch tasks when component mounts
  useEffect(() => {
    fetchTasks();
    // If we have a projectId, join that project's room
    if (projectId && connected && socket) {
      joinProjectRoom(projectId);
    }
  }, [projectId, connected, socket]);

  // Socket event listeners
  useEffect(() => {
    if (!socket) return;

    // Listen for task events
    const handleNewTask = (data) => {
      console.log('New task received:', data);
      if (!projectId || data.project_id === projectId) {
        setTasks(prev => [
          ...prev,
          {
            id: data.task_id,
            text: data.name,
            checked: data.status === 'Complete' || data.status === 'Completed',
            status: data.status === 'Pending' ? 'To Do' : data.status
          }
        ]);
      }
    };

    const handleTaskUpdated = (data) => {
      console.log('Task updated:', data);
      setTasks(prev => 
        prev.map(task => 
          task.id === data.task_id 
            ? {
                ...task,
                text: data.name,
                checked: data.status === 'Complete' || data.status === 'Completed',
                status: data.status === 'Pending' ? 'To Do' : data.status
              } 
            : task
        )
      );
    };

    const handleTaskDeleted = (data) => {
      console.log('Task deleted:', data);
      setTasks(prev => prev.filter(task => task.id !== data.task_id));
    };

    const handleTaskStatusUpdated = (data) => {
      console.log('Task status updated:', data);
      setTasks(prev => 
        prev.map(task => 
          task.id === data.task_id 
            ? {
                ...task,
                checked: data.status === 'Complete' || data.status === 'Completed',
                status: data.status === 'Pending' ? 'To Do' : data.status
              } 
            : task
        )
      );
    };

    // Register event listeners
    socket.on('task_created', handleNewTask);
    socket.on('task_updated', handleTaskUpdated);
    socket.on('task_deleted', handleTaskDeleted);
    socket.on('task_status_updated', handleTaskStatusUpdated);

    // Clean up listeners when component unmounts
    return () => {
      socket.off('task_created', handleNewTask);
      socket.off('task_updated', handleTaskUpdated);
      socket.off('task_deleted', handleTaskDeleted);
      socket.off('task_status_updated', handleTaskStatusUpdated);
    };
  }, [socket, projectId]);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      if (!token) {
        setError('Authentication required');
        setLoading(false);
        return;
      }

      // Determine which API endpoint to call
      let endpoint = '/my-tasks';
      if (projectId) {
        endpoint = `/projects/${projectId}/tasks`;
        
        // Fetch project details to get the name
        const projectResponse = await axios.get(`${API_URL}/projects/${projectId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        setProjectName(projectResponse.data.name);
      }
      
      // Fetch tasks
      const response = await axios.get(`${API_URL}${endpoint}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Transform API response to our component's expected format
      const formattedTasks = response.data.map(task => ({
        id: task.task_id,
        text: task.name,
        checked: task.status === 'Complete' || task.status === 'Completed',
        status: task.status === 'Pending' ? 'To Do' : task.status
      }));
      
      setTasks(formattedTasks);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching tasks:', err);
      setError('Failed to load tasks');
      setLoading(false);
    }
  };

  const addTask = async () => {
    if (!newTask.trim() || !projectId) return;
    
    try {
      const token = localStorage.getItem('token');
      
      // Create task data for API
      const taskData = {
        name: newTask,
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 1 week from now
        priority: 'Medium',
        status: 'To Do',
        assignees: [{ 
          user: localStorage.getItem('userId') || localStorage.getItem('employeeId'), 
          status: 'To Do'
        }],
        description: ''
      };
      
      await axios.post(`${API_URL}/projects/${projectId}/tasks`, taskData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Clear input field - the actual task will be added via socket event
      setNewTask('');
    } catch (err) {
      console.error('Error adding task:', err);
      alert('Failed to add task. Please try again.');
    }
  };

  const toggleCheck = async (taskId) => {
    try {
      const token = localStorage.getItem('token');
      const task = tasks.find(t => t.id === taskId);
      
      if (!task) return;
      
      const newCheckedStatus = !task.checked;
      const newStatus = newCheckedStatus ? 'Complete' : 'To Do';
      
      await axios.patch(
        `${API_URL}/projects/${projectId}/tasks/${taskId}/assignee-status`, 
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      // The status update will come through the socket event
    } catch (err) {
      console.error('Error toggling task check:', err);
      alert('Failed to update task status');
    }
  };

  const toggleStatus = async (taskId) => {
    try {
      const token = localStorage.getItem('token');
      const task = tasks.find(t => t.id === taskId);
      
      if (!task) return;
      
      const statusOrder = ['To Do', 'In Progress', 'Complete', 'On Hold'];
      const currentIndex = statusOrder.indexOf(task.status);
      const nextIndex = (currentIndex + 1) % statusOrder.length;
      const newStatus = statusOrder[nextIndex];
      
      await axios.patch(
        `${API_URL}/projects/${projectId}/tasks/${taskId}/assignee-status`, 
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      // The status update will come through the socket event
    } catch (err) {
      console.error('Error toggling task status:', err);
      alert('Failed to update task status');
    }
  };

  // Calculate overall progress percentage
  const calculateProgress = () => {
    if (tasks.length === 0) return 0;
    
    const completedTasks = tasks.filter(task => 
      task.status === 'Complete' || task.status === 'Completed'
    ).length;
    
    return Math.round((completedTasks / tasks.length) * 100);
  };

  if (loading) {
    return <div className="loading-container">Loading tasks...</div>;
  }

  if (error) {
    return <div className="error-container">{error}</div>;
  }

  return (
    <div className="mytasks-container">
      <div className="mytasks-header-section">
        <h1 className="mytasks-title">
          {projectName ? `${projectName} TASKS` : 'MY TASKS'}
        </h1>
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
          <div className="mytasks-progress-text">
            Overall Progress: {calculateProgress()}%
          </div>
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
          
          {tasks.length === 0 ? (
            <div className="mytasks-no-tasks">No tasks found</div>
          ) : (
            tasks.map(task => (
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
                  <span>{task.text}</span>
                </div>
                <button 
                  className={`mytasks-status-button ${task.status.replace(' ', '-')}`}
                  onClick={() => toggleStatus(task.id)}
                >
                  {task.status}
                </button>
              </div>
            ))
          )}

          <div className="mytasks-add-task-container">
            <input
              type="text"
              value={newTask}
              onChange={(e) => setNewTask(e.target.value)}
              placeholder="Add new task"
              onKeyDown={(e) => e.key === 'Enter' && addTask()}
            />
            <button onClick={addTask} className="mytasks-add-button">Add</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyTasks;