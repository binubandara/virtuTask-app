import React, { useState, useEffect } from 'react';
import './TaskInformation.css';
import EmojiPicker from 'emoji-picker-react';
import { useParams } from 'react-router-dom';

const MemberIcon = ({ member }) => {
  const firstLetter = member.charAt(0).toUpperCase();
  const colorPalette = ["#ffc8dd", "#bde0fe", "#a2d2ff", "#94d2bd","#e0b1cb","#adb5bd","#98f5e1","#f79d65","#858ae3","#c2dfe3","#ffccd5","#e8e8e4","#fdffb6","#f1e8b8","#d8e2dc","#fff0f3","#ccff66"];
  const getColor = (name) => colorPalette[name.split('').reduce((acc, char) => char.charCodeAt(0) + acc, 0) % colorPalette.length];

  return (
    <div className="member-icon-circle" style={{ backgroundColor: getColor(member) }}>
      <span className="member-initial">{firstLetter}</span>
    </div>
  );
};

const TaskInformation = ({ task, projectId: propProjectId, onClose, isFromMyProjects, currentUser, onUpdateTask }) => {
  const { projectId: urlProjectId } = useParams();
  const projectId = propProjectId || urlProjectId;
  
  const [isAssigneeHovered, setIsAssigneeHovered] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [description, setDescription] = useState('');
  const [isSavingDescription, setIsSavingDescription] = useState(false);
  const [comments, setComments] = useState([]);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [myTaskStatus, setMyTaskStatus] = useState(task?.myTaskStatus || 'pending');

  const PRIORITY_COLORS = { 
    high: '#ff4444', 
    medium: '#ffa500', 
    low: '#4CAF50' 
  };
  
  const STATUS_COLORS = { 
    pending: '#f67a15', 
    in_progress: '#0d85fd', 
    completed: '#28a46a',
    Pending: '#f67a15', 
    'In Progress': '#0d85fd', 
    Completed: '#28a46a'
  };

  useEffect(() => {
    if (task) {
      const taskId = task.task_id;
      const storageKey = `comments_${projectId}_${taskId}`;
      const savedComments = JSON.parse(localStorage.getItem(storageKey)) || [];
      setComments(savedComments);
      setDescription(task?.description || '');
      setMyTaskStatus(task?.myTaskStatus || 'pending');
    }
  }, [task, projectId]);

  useEffect(() => {
    if(task) {
      onUpdateTask({
        ...task,
        description,
        myTaskStatus
      });
    }
  }, [description, myTaskStatus, task]);

  const handleEmojiClick = (emojiObject) => {
    setCommentText(prev => prev + emojiObject.emoji);
    setShowEmojiPicker(false);
  };

  const saveCommentsToStorage = (updatedComments) => {
    const taskId = task.task_id;
    const storageKey = `comments_${projectId}_${taskId}`;
    localStorage.setItem(storageKey, JSON.stringify(updatedComments));
  };

  const handleAddComment = () => {
    if (commentText.trim()) {
      const newComment = {
        id: Date.now(),
        user: currentUser,
        text: commentText,
        timestamp: new Date().toISOString()
      };
      const updatedComments = [...comments, newComment];
      setComments(updatedComments);
      saveCommentsToStorage(updatedComments);
      setCommentText('');
      setShowEmojiPicker(false);
    }
  };

  const handleEditComment = (id) => {
    const updatedComments = comments.map(c => 
      c.id === id ? {...c, text: commentText} : c
    );
    setComments(updatedComments);
    saveCommentsToStorage(updatedComments);
    setEditingCommentId(null);
    setCommentText('');
  };

  const handleDeleteComment = (id) => {
    if (window.confirm('Are you sure you want to delete this comment?')) {
      const updatedComments = comments.filter(c => c.id !== id);
      setComments(updatedComments);
      saveCommentsToStorage(updatedComments);
    }
  };

  const handleStatusUpdate = async (statusValue) => {
    setMyTaskStatus(statusValue);
    
    try {
      const taskId = task.task_id;
      const token = localStorage.getItem('userToken');
      const apiUrl = `http://localhost:5004/api/projects/${projectId}/tasks/${taskId}/assignee-status`;
      
      const response = await fetch(apiUrl, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : '',
        },
        body: JSON.stringify({ status: statusValue })
      });
      
      if (!response.ok) throw new Error(`Failed to update task status: ${response.status}`);
      
      if (onUpdateTask) {
        onUpdateTask({
          ...task,
          status: statusValue.toLowerCase()
        });
      }
    } catch (error) {
      console.error('Error updating task status:', error);
    }
  };

  const updateDescriptionOnServer = async (newDescription) => {
    if (!task) return;
    
    try {
      setIsSavingDescription(true);
      const taskId = task.task_id;
      const token = localStorage.getItem('userToken');
      const apiUrl = `http://localhost:5004/api/projects/${projectId}/tasks/${taskId}`;
      
      // Create the complete task object as expected by the backend
      const updatedTask = {
        name: task.name || task.taskName,
        dueDate: task.dueDate,
        priority: task.priority,
        status: task.status,
        assignees: Array.isArray(task.assignees) 
          ? task.assignees 
          : task.assignees?.split(',').map(user => ({ 
              user: user.trim(), 
              status: "In Progress" 
            })),
        description: newDescription
      };
      
      const response = await fetch(apiUrl, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : '',
        },
        body: JSON.stringify(updatedTask)
      });
      
      if (!response.ok) throw new Error(`Failed to update description: ${response.status}`);
      
      console.log('Description updated successfully');
    } catch (error) {
      console.error('Error updating description:', error);
    } finally {
      setIsSavingDescription(false);
    }
  };

  const handleDescriptionChange = (e) => {
    const newDescription = e.target.value;
    setDescription(newDescription);
    
    // Update task locally immediately for UI responsiveness
    if(task) {
      onUpdateTask({
        ...task,
        description: newDescription,
        myTaskStatus
      });
    }
  };

  useEffect(() => {
    if (task?.description !== description && !isFromMyProjects) {
      const timer = setTimeout(() => {
        updateDescriptionOnServer(description);
      }, 1000); // 1 second debounce
      
      return () => clearTimeout(timer);
    }
  }, [description, task?.description, isFromMyProjects, projectId]);

  const renderMyTaskStatus = () => {
    if (!isFromMyProjects) return null;

    const statusOptions = [
      { value: 'Pending', label: 'Pending' },
      { value: 'In Progress', label: 'In Progress' },
      { value: 'Completed', label: 'Completed' }
    ];

    return (
      <div className="task-info-meta-item">
        <div className='taskinfo-mytaskstatus-svg'>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="currentColor"
          >
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14H9V8h2v8zm4 0h-2V8h2v8z"/>
          </svg>
        </div>
        <span className="task-info-meta-label">My Task Status:</span>
        <div className="mytask-status-buttons">
          {statusOptions.map((status) => (
            <button
              key={status.value}
              className={`mytask-status-button ${myTaskStatus === status.value ? 'active' : ''}`}
              style={{ 
                backgroundColor: `${STATUS_COLORS[status.value]}`,
                border: `2px solid ${STATUS_COLORS[status.value]}`,
                color: myTaskStatus === status.value ? '#ff0000' : '#000000',
                fontWeight: myTaskStatus === status.value ? 'bold' : 'normal'
              }}
              onClick={() => {
                setMyTaskStatus(status.value);
                handleStatusUpdate(status.value);
              }}
            >
              {status.label}
            </button>
          ))}
        </div>
      </div>
    );
  };

  if (!task) return null;

  const getStatusColor = (status) => {
    const normalizedStatus = status?.toLowerCase().replace(' ', '_');
    return STATUS_COLORS[status] || STATUS_COLORS[normalizedStatus] || '#808080';
  };

  const getPriorityColor = (priority) => {
    const normalizedPriority = priority?.toLowerCase();
    return PRIORITY_COLORS[normalizedPriority] || '#808080';
  };

  return (
    <div className="task-info-container">
      <div className="task-info-header">
        <h3 className="task-info-title">{task?.name || task?.taskName}</h3>
        <button className="task-info-close" onClick={onClose}>
          <svg 
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24" 
            strokeWidth="1.5"
            stroke="currentColor" 
            className="size-6"
            width="24" 
            height="24"
          >
            <path 
              strokeLinecap="round"
              strokeLinejoin="round" 
              d="M5 12h14" 
            />
          </svg>
        </button>
      </div>
      <div className="task-info-divider"></div>

      <div className="task-info-meta-section">
        <div className="task-info-meta-item">
          <div className='taskinfo-status-svg'>
            <svg  
              xmlns="http://www.w3.org/2000/svg"  
              width="16"  
              height="16"  
              viewBox="0 0 24 24"  
              fill="currentColor"  
              className="icon icon-tabler icons-tabler-filled icon-tabler-circle-dot"
            >
              <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
              <path d="M17 3.34a10 10 0 1 1 -14.995 8.984l-.005 -.324l.005 -.324a10 10 0 0 1 14.995 -8.336zm-5 2.66a2 2 0 0 0 -1.977 1.697l-.018 .154l-.005 .149l.005 .15a2 2 0 1 0 1.995 -2.15z" />
            </svg>
          </div>
          <span className="task-info-meta-label">Status:</span>
          <span 
            className="task-info-status-capsule"
            style={{ backgroundColor: getStatusColor(task.status) }}
          >
            {task.status.replace(/_/g, ' ')}
          </span>
        </div>

        {renderMyTaskStatus()}

        <div className="task-info-meta-item">
          <div className='taskinfo-priority-svg'>
            <svg xmlns="http://www.w3.org/2000/svg"  width="16"  height="16" viewBox="0 0 24 24" fill="currentColor" className="size-6">
              <path fillRule="evenodd" d="M3 2.25a.75.75 0 0 1 .75.75v.54l1.838-.46a9.75 9.75 0 0 1 6.725.738l.108.054A8.25 8.25 0 0 0 18 4.524l3.11-.732a.75.75 0 0 1 .917.81 47.784 47.784 0 0 0 .005 10.337a.75.75 0 0 1-.574.812l-3.114.733a9.75 9.75 0 0 1-6.594-.77l-.108-.054a8.25 8.25 0 0 0-5.69-.625l-2.202.55V21a.75.75 0 0 1-1.5 0V3A.75.75 0 0 1 3 2.25Z" clipRule="evenodd" />
            </svg>
          </div>
          <span className="task-info-meta-label">Priority:</span>
          <span 
            className="task-info-priority-capsule"
            style={{ backgroundColor: getPriorityColor(task.priority) }}
          >
            {task.priority}
          </span>
        </div>

        <div className="task-info-meta-item">
          <div className='taskinfo-duedate-svg'>
            <svg xmlns="http://www.w3.org/2000/svg" width="16"  height="16" viewBox="0 0 24 24" fill="currentColor" className="size-6">
              <path d="M12.75 12.75a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0ZM7.5 15.75a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5ZM8.25 17.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0ZM9.75 15.75a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5ZM10.5 17.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0ZM12 15.75a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5ZM12.75 17.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0ZM14.25 15.75a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5ZM15 17.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0ZM16.5 15.75a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5ZM15 12.75a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0ZM16.5 13.5a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Z" />
              <path fillRule="evenodd" d="M6.75 2.25A.75.75 0 0 1 7.5 3v1.5h9V3A.75.75 0 0 1 18 3v1.5h.75a3 3 0 0 1 3 3v11.25a3 3 0 0 1-3 3H5.25a3 3 0 0 1-3-3V7.5a3 3 0 0 1 3-3H6V3a.75.75 0 0 1 .75-.75Zm13.5 9a1.5 1.5 0 0 0-1.5-1.5H5.25a1.5 1.5 0 0 0-1.5 1.5v7.5a1.5 1.5 0 0 0 1.5 1.5h13.5a1.5 1.5 0 0 0 1.5-1.5v-7.5Z" clipRule="evenodd" />
            </svg>
          </div>
          <span className="task-info-meta-label">Due Date:</span>
          <span className="task-info-due-date">{task.dueDate}</span>
        </div>

        <div className="task-info-meta-item">
          <div className='taskinfo-assignee-svg'>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M4.5 6.375a4.125 4.125 0 1 1 8.25 0 4.125 4.125 0 0 1-8.25 0ZM14.25 8.625a3.375 3.375 0 1 1 6.75 0 3.375 3.375 0 0 1-6.75 0ZM1.5 19.125a7.125 7.125 0 0 1 14.25 0v.003l-.001.119a.75.75 0 0 1-.363.63 13.067 13.067 0 0 1-6.761 1.873c-2.472 0-4.786-.684-6.76-1.873a.75.75 0 0 1-.364-.63l-.001-.122ZM17.25 19.128l-.001.144a2.25 2.25 0 0 1-.233.96 10.088 10.088 0 0 0 5.06-1.01.75.75 0 0 0 .42-.643 4.875 4.875 0 0 0-6.957-4.611 8.586 8.586 0 0 1 1.71 5.157v.003Z" />
            </svg>
          </div>
          <span className="task-info-meta-label">Assignee:</span>
          <div 
            className="assignee-icons-container"
            onMouseEnter={() => setIsAssigneeHovered(true)}
            onMouseLeave={() => setIsAssigneeHovered(false)}
          >
            {task.assignees?.split(',').slice(0,4).map((assignee, index) => (
              <MemberIcon key={assignee.trim()} member={assignee.trim()} />
            ))}
            {task.assignees?.split(',').length > 4 && (
              <div className="extra-members">+{task.assignees.split(',').length - 4}</div>
            )}
            {isAssigneeHovered && (
              <div className="assignee-dropdown">
                {task.assignees?.split(',').map(assignee => (
                  <div key={assignee.trim()} className="assignee-item">
                    <MemberIcon member={assignee.trim()} />
                    <span>{assignee.trim()}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="task-info-description-section">
        <h4 className="task-info-section-title">Description</h4>
        {isFromMyProjects ? (
          <div className="task-info-description-view">{task.description}</div>
        ) : (
          <textarea
            className="task-info-description-textarea"
            value={description}
            onChange={handleDescriptionChange}
            placeholder="No description available"
          />
        )}
      </div>

      <div className="task-info-comments-section">
        <div className="task-info-comments-header">
          <h4 className="task-info-section-title">Comments</h4>
        </div>

        <div className="comment-input-area">
          <textarea
            className="task-info-comment-textarea"
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            placeholder="Add a new comment..."
            rows="3"
          />
          <div className="comment-buttons">
            <button 
              className="emoji-btn"
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              type="button"
            >
              😀
            </button>
            <button 
              className="add-comment-btn" 
              onClick={handleAddComment}
            >
              Send
            </button>
          </div>
          
          {showEmojiPicker && (
            <div className="emoji-picker-container">
              <EmojiPicker 
                onEmojiClick={handleEmojiClick}
                searchDisabled
                skinTonesDisabled
                previewConfig={{ showPreview: false }}
              />
            </div>
          )}
        </div>

        <div className="comments-list">
          {comments.map(comment => (
            <div key={comment.id} className="comment-item">
              <div className="comment-header">
                <div className="comment-user-info">
                  <MemberIcon member={comment.user} />
                  <span className="comment-username">{comment.user}:</span>
                </div>
                
                <div className="comment-actions">
                  {editingCommentId === comment.id ? (
                    <>
                      <button
                        className="confirm-btn"
                        onClick={() => handleEditComment(comment.id)}
                      >
                        Confirm
                      </button>
                      <button
                        className="cancel-btn"
                        onClick={() => {
                          setEditingCommentId(null);
                          setCommentText('');
                        }}
                      >
                        Cancel
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        className="edit-btn"
                        onClick={() => {
                          setEditingCommentId(comment.id);
                          setCommentText(comment.text);
                        }}
                      >
                        Edit
                      </button>
                      <button
                        className="delete-btn"
                        onClick={() => handleDeleteComment(comment.id)}
                      >
                        Delete
                      </button>
                    </>
                  )}
                </div>
              </div>

              {editingCommentId === comment.id ? (
                <textarea
                  className="comment-edit-textarea"
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  rows="3"
                />
              ) : (
                <div className="comment-text">
                  {comment.text}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TaskInformation;