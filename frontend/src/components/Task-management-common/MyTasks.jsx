import React, { useState, useEffect } from 'react';
import './mytasks.css';
import axios from 'axios';

const MyTasks = () => {
  const [tasks, setTasks] = useState([]); // For task list
  const [dropdownTasks, setDropdownTasks] = useState([]); // For dropdown options
  const [newTask, setNewTask] = useState('');
  const [showBreakdown, setShowBreakdown] = useState(false);
  const [breakdownTask, setBreakdownTask] = useState('');
  const [breakdownMessages, setBreakdownMessages] = useState([]);
  const [selectedTaskId, setSelectedTaskId] = useState(null);
  const [editTaskId, setEditTaskId] = useState(null);
  const [editTaskText, setEditTaskText] = useState('');
  const [selectedTask, setSelectedTask] = useState(null);
  const [selectedProjectId, setSelectedProjectId] = useState(null);

  // Fetch tasks for the dropdown when the component mounts
  useEffect(() => {
    const fetchDropdownTasks = async () => {
      try {
        const token = localStorage.getItem('userToken'); // Retrieve token from localStorage
        const response = await axios.get('http://localhost:5004/api/my-tasks', {
          headers: {
            Authorization: `Bearer ${token}`, // Add the token to the Authorization header
          },
        });

        // Map API response to include project_id
        const mappedTasks = response.data.map((task) => ({
          id: task.task_id, // Use task_id as the unique identifier
          text: task.name,  // Use name as the task text
          project_id: task.project_id, // Include project_id
        }));

        console.log('Mapped tasks:', mappedTasks); // Debugging
        setDropdownTasks(mappedTasks); // Set the mapped tasks
      } catch (error) {
        console.error('Error fetching tasks for dropdown:', error);
      }
    };

    fetchDropdownTasks();
  }, []);

  const addTask = async () => {
    if (!newTask.trim()) return;
    
    // Check if a parent task is selected (for subtasks)
    if (selectedTask && selectedProjectId) {
      try {
        const token = localStorage.getItem('userToken');
        
        // First update local state for immediate UI feedback
        const newSubtask = {
          id: Date.now(), // Temporary local ID
          text: newTask,
          checked: false,
          status: 'To Do',
          isSubtask: true,
          parentTaskId: selectedTask.id
        };
        
        setTasks([...tasks, newSubtask]);
        setNewTask('');
        
        // Then create the subtask in the API
        const response = await axios.post(
          `http://localhost:5004/api/projects/${selectedProjectId}/tasks/${selectedTask.id}/subtasks`,
          {
            subtask: newTask
          },
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        );
        
        console.log('Subtask created:', response.data);
        
        // Optionally update the local task with the actual ID from the API
        if (response.data && response.data.subtask_id) {
          setTasks(prevTasks => 
            prevTasks.map(task => 
              task.id === newSubtask.id 
                ? { ...task, id: response.data.subtask_id } 
                : task
            )
          );
        }
        
      } catch (error) {
        console.error('Error creating subtask:', error);
        alert('Failed to create subtask. Please try again.');
        
        // Remove the optimistically added task if API call fails
        setTasks(prevTasks => prevTasks.filter(task => task.text !== newTask));
      }
    } else {
      // Regular task creation (no API call, just local state)
      setTasks([
        ...tasks,
        {
          id: Date.now(),
          text: newTask,
          checked: false,
          status: 'To Do',
        },
      ]);
      setNewTask('');
    }
  };

  const toggleCheck = (taskId) => {
    setTasks(tasks.map(task => {
      if (task.id === taskId) {
        const newChecked = !task.checked;
        return {
          ...task,
          checked: newChecked,
          status: newChecked ? 'Complete' : 'To Do'
        };
      }
      return task;
    }));
  };

  const toggleStatus = (taskId) => {
    setTasks(tasks.map(task => {
      if (task.id === taskId) {
        const statusOrder = ['To Do', 'In Progress', 'Complete', 'On Hold'];
        const currentIndex = statusOrder.indexOf(task.status);
        const nextIndex = (currentIndex + 1) % statusOrder.length;
        const newStatus = statusOrder[nextIndex];
        
        return {
          ...task,
          status: newStatus,
          checked: newStatus === 'Complete'
        };
      }
      return task;
    }));
  };

  const handleDelete = (taskId) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      setTasks(tasks.filter(task => task.id !== taskId));
    }
  };

  const handleSaveEdit = (taskId) => {
    setTasks(tasks.map(task => 
      task.id === taskId ? { ...task, text: editTaskText } : task
    ));
    setEditTaskId(null);
    setEditTaskText('');
  };

  const handleUploadMessage = async () => {
    if (breakdownTask.trim()) {
      try {
        const token = localStorage.getItem('userToken'); // Retrieve token from localStorage
        const userId = localStorage.getItem('userId'); // Retrieve user ID from localStorage or another source

        console.log('Sending message:', breakdownTask); // Debugging

        // POST request to send the message
        const chatResponse = await axios.post(
          'http://localhost:8000/api/chat',
          { user_message: breakdownTask }, // Use the correct field name
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        console.log('Chat Response:', chatResponse.data); // Debugging

        // Extract the gemini_response from the chat response
        const geminiResponse = chatResponse.data.gemini_response || 'No response received.';

        // Add the user's message and the gemini response to the breakdownMessages
        setBreakdownMessages((prevMessages) => [
          ...prevMessages,
          `You: ${breakdownTask}`,
          `Gemini: ${geminiResponse}`,
        ]);

        // Clear the input field
        setBreakdownTask('');
      } catch (error) {
        console.error('Error handling chat message:', error);
        alert('Failed to send or fetch messages. Please try again.');
      }
    } else {
      alert('Please enter a valid message.');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleUploadMessage();
    }
  };

  const handleAnalyzeTask = async () => {
    if (!selectedTask || !selectedProjectId) {
      alert('Please select a task first.');
      return;
    }

    try {
      const token = localStorage.getItem('userToken');
      // POST request to analyze the task
      await axios.post(
        `http://localhost:8000/projects/${selectedProjectId}/tasks/${selectedTask.id}/analyze-task`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // GET request to fetch analysis details
      const response = await axios.get(
        `http://localhost:8000/api/analysis/${selectedTask.id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log('API Response:', response.data); // Debugging

      // Extract subtasks and combine them into one formatted message
      const subtasks = response.data.subtasks || [];
      console.log('Subtasks:', subtasks); // Debugging

      const combinedMessage = subtasks
        .map(
          (subtask, index) =>
            `${index + 1}. ${subtask.step.replace(/^\d+\.\s*/, '') || 'No step available'} (Time Estimate: ${subtask.time_estimate || 'N/A'})`
        )
        .join('\n\n'); // Add an extra newline character for spacing between steps

      setBreakdownMessages([combinedMessage]); // Set the combined message as a single item in the array

      console.log('Breakdown Messages:', [combinedMessage]); // Debugging
      setShowBreakdown(true); // Open the sidebar
      console.log('Sidebar Opened'); // Debugging
    } catch (error) {
      console.error('Error analyzing task:', error);
      alert('Failed to analyze the task. Please try again.');
    }
  };

  return (
    <div className="mytasks-container">
      {showBreakdown && (
        <div className="breakdown-sidebar">
          <div className="breakdown-header">
            <h2>Breaking Down the Task</h2>
            <button 
              className="close-breakdown"
              onClick={() => setShowBreakdown(false)}
            >
              ×
            </button>
          </div>
          <div className="breakdown-separator"></div>
          <div className="breakdown-content">
            {/* Chat Messages Section */}
            <div className="chat-section">
              <div className="chat-messages">
                {breakdownMessages.length > 0 ? (
                  breakdownMessages.map((message, index) => (
                    <div key={index} className="user-message">
                      {message.split('\n').map((line, i) => (
                        <p key={i}>{line}</p> // Render each line as a paragraph
                      ))}
                    </div>
                  ))
                ) : (
                  <div className="no-messages">No messages available.</div>
                )}
              </div>
            </div>
          </div>

          {/* Post Chat Section */}
          <div className="post-chat-section">
            <div className="breakdown-input-container">
              <input
                type="text"
                className="breakdown-input"
                placeholder="Enter Task Description"
                value={breakdownTask}
                onChange={(e) => setBreakdownTask(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleUploadMessage()}
              />
              <button 
                onClick={handleUploadMessage} 
                className="upload-icon-button"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="1.5"
                  stroke="currentColor"
                  className="upload-icon"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="mytasks-header-section">
        <h1 className="mytasks-title">MY TASKS</h1>
        <div className="mytasks-underline"></div>
      </div>

      <div className="mytasks-controls-section">
        <div className="mytasks-filters-container">
          {/* Populate dropdown with fetched tasks */}
          <select
            className="mytasks-dropdown"
            onChange={(e) => {
              const selectedTaskId = e.target.value;
              const task = dropdownTasks.find((task) => task.id === selectedTaskId);
              setSelectedTask(task); // Set the selected task
              setSelectedProjectId(task?.project_id || null);
              console.log('Selected Task:', task); // Log the selected task to the console
            }}
          >
            <option value="">Select a Task</option>
            {dropdownTasks.map((task) => (
              <option key={task.id} value={task.id}>
                {task.text}
              </option>
            ))}
          </select>
          
        </div>
        <button 
          className="mytasks-breakdown-button"
          onClick={handleAnalyzeTask}
        >
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
                    type="checkbox"
                    checked={task.checked}
                    onChange={() => toggleCheck(task.id)}
                  />
                  <span className="mytasks-checkmark"></span>
                </label>

                <button 
                  className="mytasks-options-button"
                  onClick={() => setSelectedTaskId(task.id === selectedTaskId ? null : task.id)}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth="1.5"
                    stroke="currentColor"
                    className="mytasks-options-icon"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 6.75a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5ZM12 12.75a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5ZM12 18.75a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5Z"
                    />
                  </svg>
                </button>

                {selectedTaskId === task.id && (
                  <div className="mytasks-dropdown-menu">
                    <div 
                      className="mytasks-dropdown-item"
                      onClick={() => {
                        setEditTaskId(task.id);
                        setEditTaskText(task.text);
                        setSelectedTaskId(null);
                      }}
                    >
                      Edit Task
                    </div>
                    <div 
                      className="mytasks-dropdown-item mytasks-delete-item"
                      onClick={() => handleDelete(task.id)}
                    >
                      Delete Task
                    </div>
                  </div>
                )}

                {editTaskId === task.id ? (
                  <>
                    <input
                      type="text"
                      value={editTaskText}
                      onChange={(e) => setEditTaskText(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSaveEdit(task.id)}
                      autoFocus
                      className="mytasks-edit-input"
                    />
                    <button 
                      onClick={() => handleSaveEdit(task.id)}
                      className="mytasks-save-button"
                    >
                      Save
                    </button>
                  </>
                ) : (
                  <span style={{ 
                    textDecoration: task.checked ? 'line-through' : 'none',
                    opacity: task.checked ? 0.6 : 1
                  }}>
                    {task.text}
                  </span>
                )}
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
              type="text"
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
