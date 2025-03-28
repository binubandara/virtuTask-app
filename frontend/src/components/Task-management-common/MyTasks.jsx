import React, { useState, useEffect } from 'react';
import './mytasks.css';
import axios from 'axios';

const MyTasks = () => {
  const [tasks, setTasks] = useState([]); // For task list
  const [subtasks, setSubtasks] = useState([]); // New state for subtasks
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
  const [isLoadingSubtasks, setIsLoadingSubtasks] = useState(false); // Loading state for subtasks

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

  // New function to fetch subtasks for a selected task
  const fetchSubtasks = async (projectId, taskId) => {
    if (!projectId || !taskId) return;
    
    setIsLoadingSubtasks(true);
    try {
      const token = localStorage.getItem('userToken');
      const response = await axios.get(
        `http://localhost:5004/api/projects/${projectId}/tasks/${taskId}/subtasks`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      
      console.log('Fetched subtasks:', response.data);
      
      // Map API response prioritizing subtask_id over _id
      const mappedSubtasks = response.data.map(subtask => ({
        id: subtask.subtask_id || subtask._id, // Prefer subtask_id since that's what the API expects
        originalId: subtask._id, // Keep original MongoDB ID for reference if needed
        text: subtask.subtask || subtask.name, // Use subtask field if name isn't available
        checked: subtask.status === 'Complete',
        status: subtask.status || 'To Do',
        isSubtask: true,
        parentTaskId: taskId
      }));
      
      console.log('Mapped subtasks:', mappedSubtasks);
      
      // Save the mapped subtasks to state
      setSubtasks(mappedSubtasks);
    } catch (error) {
      console.error('Error fetching subtasks:', error);
      setSubtasks([]);
    } finally {
      setIsLoadingSubtasks(false);
    }
  };

  // Add this new function to fetch a single subtask by ID
  const fetchSubtaskById = async (projectId, taskId, subtaskId) => {
    if (!projectId || !taskId || !subtaskId) {
      console.error('Missing required parameters to fetch subtask');
      return null;
    }
    
    try {
      const token = localStorage.getItem('userToken');
      const response = await axios.get(
        `http://localhost:5004/api/projects/${projectId}/tasks/${taskId}/subtasks/${subtaskId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      
      console.log('Fetched subtask details:', response.data);
      return response.data;
    } catch (error) {
      console.error(`Error fetching subtask ${subtaskId}:`, error);
      return null;
    }
  };

  // Modify the dropdown change handler to fetch subtasks
  const handleTaskSelect = (e) => {
    const selectedTaskId = e.target.value;
    const task = dropdownTasks.find((task) => task.id === selectedTaskId);
    setSelectedTask(task);
    setSelectedProjectId(task?.project_id || null);
    console.log('Selected Task:', task);
    
    // Fetch subtasks when a task is selected
    if (task && task.id && task.project_id) {
      fetchSubtasks(task.project_id, task.id);
    } else {
      setSubtasks([]); // Clear subtasks if no task is selected
    }
  };

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
        
        setSubtasks(prev => [...prev, newSubtask]); // Add to subtasks instead of tasks
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
        
        // Update the subtask with the actual ID from the API
        if (response.data && response.data.subtask_id) {
          setSubtasks(prev => 
            prev.map(subtask => 
              subtask.id === newSubtask.id 
                ? { ...subtask, id: response.data.subtask_id } 
                : subtask
            )
          );
        }
        
      } catch (error) {
        console.error('Error creating subtask:', error);
        alert('Failed to create subtask. Please try again.');
        
        // Remove the optimistically added subtask if API call fails
        setSubtasks(prev => prev.filter(subtask => subtask.id !== Date.now()));
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

  const toggleCheck = (taskId, isSubtask = false) => {
    if (isSubtask) {
      setSubtasks(subtasks.map(subtask => {
        if (subtask.id === taskId) {
          const newChecked = !subtask.checked;
          return {
            ...subtask,
            checked: newChecked,
            status: newChecked ? 'Complete' : 'To Do'
          };
        }
        return subtask;
      }));
    } else {
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
    }
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

  const toggleSubtaskStatus = (subtaskId) => {
    setSubtasks(subtasks.map(subtask => {
      if (subtask.id === subtaskId) {
        const statusOrder = ['To Do', 'In Progress', 'Complete', 'On Hold'];
        const currentIndex = statusOrder.indexOf(subtask.status);
        const nextIndex = (currentIndex + 1) % statusOrder.length;
        const newStatus = statusOrder[nextIndex];
        
        return {
          ...subtask,
          status: newStatus,
          checked: newStatus === 'Complete'
        };
      }
      return subtask;
    }));
  };

  const handleDelete = (taskId) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      setTasks(tasks.filter(task => task.id !== taskId));
    }
  };

  // Add these two new functions for API integration

  // Function to update a subtask in the API
  const updateSubtaskInApi = async (subtaskId, updatedText) => {
    if (!selectedProjectId || !selectedTask || !subtaskId) return false;
    
    try {
      // Find the subtask to get the correct subtask_id
      const subtaskToUpdate = subtasks.find(sub => sub.id === subtaskId);
      if (!subtaskToUpdate) {
        console.error('Subtask not found in local state');
        return false;
      }
      
      // Log what we're sending
      console.log('Updating subtask with id:', subtaskId);
      
      const token = localStorage.getItem('userToken');
      const response = await axios.patch(
        `http://localhost:5004/api/projects/${selectedProjectId}/tasks/${selectedTask.id}/subtasks/${subtaskId}`,
        {
          subtask: updatedText
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      
      console.log('Subtask updated:', response.data);
      return true;
    } catch (error) {
      console.error('Error updating subtask:', error);
      return false;
    }
  };

  // Function to delete a subtask in the API
  const deleteSubtaskInApi = async (subtaskId) => {
    if (!selectedProjectId || !selectedTask || !subtaskId) return false;
    
    try {
      // Find the subtask to get the correct subtask_id
      const subtaskToDelete = subtasks.find(sub => sub.id === subtaskId);
      if (!subtaskToDelete) {
        console.error('Subtask not found in local state');
        return false;
      }
      
      // Log what we're deleting
      console.log('Deleting subtask with id:', subtaskId);
      
      const token = localStorage.getItem('userToken');
      await axios.delete(
        `http://localhost:5004/api/projects/${selectedProjectId}/tasks/${selectedTask.id}/subtasks/${subtaskId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      
      console.log('Subtask deleted successfully');
      return true;
    } catch (error) {
      console.error('Error deleting subtask:', error);
      return false;
    }
  };

  // Now update the existing functions to use these API functions

  // Modified handleSaveSubtaskEdit function to use the API
  const handleSaveSubtaskEdit = async (subtaskId) => {
    try {
      // First update the API
      const success = await updateSubtaskInApi(subtaskId, editTaskText);
      
      if (success) {
        // If API update was successful, update local state
        setSubtasks(subtasks.map(subtask => 
          subtask.id === subtaskId ? { ...subtask, text: editTaskText } : subtask
        ));
        setEditTaskId(null);
        setEditTaskText('');
      } else {
        alert('Failed to update subtask. Please try again.');
      }
    } catch (error) {
      console.error('Error in handleSaveSubtaskEdit:', error);
      alert('An error occurred while updating the subtask.');
    }
  };

  // Modified handleDeleteSubtask function to use the API
  const handleDeleteSubtask = async (subtaskId) => {
    if (window.confirm('Are you sure you want to delete this subtask?')) {
      try {
        // First delete from API
        const success = await deleteSubtaskInApi(subtaskId);
        
        if (success) {
          // If API delete was successful, update local state
          setSubtasks(subtasks.filter(subtask => subtask.id !== subtaskId));
        } else {
          alert('Failed to delete subtask. Please try again.');
        }
      } catch (error) {
        console.error('Error in handleDeleteSubtask:', error);
        alert('An error occurred while deleting the subtask.');
      }
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
            onChange={handleTaskSelect}
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
          disabled={!selectedTask}
        >
          Break down the task for me
        </button>
      </div>

      <div className="mytasks-task-list-section">
        <h2 className="mytasks-task-list-title">
          {selectedTask ? `Task: ${selectedTask.text}` : 'My Tasks'}
        </h2>
        
        {/* Display task info when a task is selected */}
        {selectedTask && (
          <div className="mytasks-selected-task-info">
            <div className="mytasks-subtask-header">
              Subtasks
              {isLoadingSubtasks && <span className="mytasks-loading">Loading...</span>}
            </div>
          </div>
        )}
        
        <div className="mytasks-task-list-container">
          <div className="mytasks-task-list-header">
            <div className="mytasks-task-column">
              {selectedTask ? 'Subtasks' : 'Tasks'}
            </div>
            <div className="mytasks-status-column">Status</div>
          </div>
          
          {/* Display regular tasks or subtasks based on selection */}
          {selectedTask ? (
            // Show subtasks for selected task
            subtasks.length > 0 ? (
              subtasks.map(subtask => (
                <div 
                  key={subtask.id} 
                  className={`mytasks-task-item ${subtask.status.replace(' ', '-')}-bg mytasks-subtask-item`}
                >
                  <div className="mytasks-task-content">
                    <label className="mytasks-custom-checkbox">
                      <input 
                        type="checkbox"
                        checked={subtask.checked}
                        onChange={() => toggleCheck(subtask.id, true)}
                      />
                      <span className="mytasks-checkmark"></span>
                    </label>

                    <button 
                      className="mytasks-options-button"
                      onClick={() => setSelectedTaskId(subtask.id === selectedTaskId ? null : subtask.id)}
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

                    {selectedTaskId === subtask.id && (
                      <div className="mytasks-dropdown-menu">
                        <div 
                          className="mytasks-dropdown-item"
                          onClick={() => {
                            setEditTaskId(subtask.id);
                            setEditTaskText(subtask.text);
                            setSelectedTaskId(null);
                          }}
                        >
                          Edit Subtask
                        </div>
                        <div 
                          className="mytasks-dropdown-item mytasks-delete-item"
                          onClick={() => handleDeleteSubtask(subtask.id)}
                        >
                          Delete Subtask
                        </div>
                      </div>
                    )}

                    {editTaskId === subtask.id ? (
                      <>
                        <input
                          type="text"
                          value={editTaskText}
                          onChange={(e) => setEditTaskText(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && handleSaveSubtaskEdit(subtask.id)}
                          autoFocus
                          className="mytasks-edit-input"
                        />
                        <button 
                          onClick={() => handleSaveSubtaskEdit(subtask.id)}
                          className="mytasks-save-button"
                        >
                          Save
                        </button>
                      </>
                    ) : (
                      <span style={{ 
                        textDecoration: subtask.checked ? 'line-through' : 'none',
                        opacity: subtask.checked ? 0.6 : 1
                      }}>
                        {subtask.text}
                      </span>
                    )}
                  </div>
                  <button 
                    className={`mytasks-status-button ${subtask.status.replace(' ', '-')}`}
                    onClick={() => toggleSubtaskStatus(subtask.id)}
                  >
                    {subtask.status}
                  </button>
                </div>
              ))
            ) : (
              <div className="mytasks-no-subtasks">
                {isLoadingSubtasks ? 'Loading subtasks...' : 'No subtasks found for this task.'}
              </div>
            )
          ) : (
            // Show regular tasks when no task is selected
            tasks.map(task => (
              <div 
                key={task.id} 
                className={`mytasks-task-item ${task.status.replace(' ', '-')}-bg`}
              >
                {/* Existing task rendering code */}
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
            ))
          )}

          <div className="mytasks-add-task-container">
            {/* {selectedTask && (
              <div className="mytasks-parent-task-indicator">
                Adding subtask to: <span>{selectedTask.text}</span>
                <button 
                  className="mytasks-clear-selection" 
                  onClick={() => {
                    setSelectedTask(null);
                    setSelectedProjectId(null);
                    setSubtasks([]);
                  }}
                  title="Clear selection"
                >
                  ×
                </button>
              </div>
            )} */}
            
            <input
              type="text"
              value={newTask}
              onChange={(e) => setNewTask(e.target.value)}
              placeholder={selectedTask ? "Add new subtask" : "Add new task"}
            />
            <button onClick={addTask} className="mytasks-add-button">
              {selectedTask ? "Add" : "Add"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyTasks;
