import React, { useState, useEffect } from 'react';
import './TaskInformation.css';
import EmojiPicker from 'emoji-picker-react';
import axios from 'axios';
import { useSocket } from "../../context/SocketContext";

const API_URL = 'http://localhost:5004/api';
const MAX_FILE_SIZE = 1073741824; // 1GB in bytes

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

const TaskInformation = ({ task, onClose, isFromMyProjects, currentUser, onUpdateTask }) => {
  const { socket, connected } = useSocket();
  const [isAssigneeHovered, setIsAssigneeHovered] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [description, setDescription] = useState('');
  const [attachments, setAttachments] = useState([]);
  const [comments, setComments] = useState([]);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  const PRIORITY_COLORS = { high: '#ff4444', medium: '#ffa500', low: '#4CAF50' };
  const STATUS_COLORS = { pending: '#f67a15', on_hold: '#939698', in_progress: '#0d85fd', completed: '#28a46a' };

  useEffect(() => {
    setDescription(task?.description || '');
    setAttachments(task?.attachments || []);
    setComments(task?.comments || []);
  }, [task]);

  useEffect(() => {
    if(task) {
      onUpdateTask({
        ...task,
        description,
        attachments,
        comments
      });
    }
  }, [description, attachments, comments, task, onUpdateTask]);

  // Socket.IO integration for real-time updates
  useEffect(() => {
    if (!socket || !connected || !task) return;

    // Listen for comment events
    const handleNewComment = (data) => {
      if (data.taskId === task.id) {
        setComments(prevComments => [...prevComments, data.comment]);
      }
    };

    const handleCommentUpdated = (data) => {
      if (data.taskId === task.id) {
        setComments(prevComments => 
          prevComments.map(comment => 
            comment.id === data.comment.id ? data.comment : comment
          )
        );
      }
    };

    const handleCommentDeleted = (data) => {
      if (data.taskId === task.id) {
        setComments(prevComments => 
          prevComments.filter(comment => comment.id !== data.commentId)
        );
      }
    };

    // Listen for attachment events
    const handleAttachmentUploaded = (data) => {
      if (data.taskId === task.id) {
        setAttachments(prev => [...prev, data.attachment]);
      }
    };

    const handleAttachmentDeleted = (data) => {
      if (data.taskId === task.id) {
        setAttachments(prev => prev.filter(a => a.id !== data.attachmentId));
      }
    };

    // Listen for task description updates
    const handleTaskUpdated = (data) => {
      if (data.id === task.id) {
        // Only update description if we're not currently editing it
        if (data.description !== description) {
          setDescription(data.description);
        }
      }
    };

    // Register socket event listeners
    socket.on('new_comment', handleNewComment);
    socket.on('comment_updated', handleCommentUpdated);
    socket.on('comment_deleted', handleCommentDeleted);
    socket.on('task_attachment_uploaded', handleAttachmentUploaded);
    socket.on('task_attachment_deleted', handleAttachmentDeleted);
    socket.on('task_updated', handleTaskUpdated);

    // Clean up on unmount
    return () => {
      socket.off('new_comment', handleNewComment);
      socket.off('comment_updated', handleCommentUpdated);
      socket.off('comment_deleted', handleCommentDeleted);
      socket.off('task_attachment_uploaded', handleAttachmentUploaded);
      socket.off('task_attachment_deleted', handleAttachmentDeleted);
      socket.off('task_updated', handleTaskUpdated);
    };
  }, [socket, connected, task, description]);

  const handleEmojiClick = (emojiObject) => {
    setCommentText(prev => prev + emojiObject.emoji);
    setShowEmojiPicker(false);
  };

  const handleDeleteAttachment = async (attachmentId) => {
    if (window.confirm('Are you sure you want to delete this file?')) {
      try {
        const token = localStorage.getItem('token');
        
        // Find the attachment in our current list
        const attachment = attachments.find(a => a.id === attachmentId);
        if (!attachment) return;

        // Make API call to delete the attachment
        await axios.delete(
          `${API_URL}/projects/${task.projectId}/tasks/${task.id}/attachments/${attachmentId}`,
          { headers: { Authorization: `Bearer ${token}` }}
        );

        // The socket event should handle the state update, but if not:
        setAttachments(prev => {
          const updated = prev.filter(a => a.id !== attachmentId);
          try {
            onUpdateTask({
              ...task,
              attachments: updated
            });
          } catch (error) {
            console.error('Delete error:', error);
            alert('Error removing file. Please try again.');
          }
          return updated;
        });
      } catch (error) {
        console.error('Error deleting attachment:', error);
        alert('Failed to delete attachment. Please try again.');
      }
    }
  };

  const getFileIcon = (fileName) => {
    const ext = fileName.split('.').pop().toLowerCase();
    const icons = {
      pdf: '📄',
      doc: '📝',
      docx: '📝',
      jpg: '🖼️',
      jpeg: '🖼️',
      png: '🖼️',
      zip: '📦',
      mp3: '🎵',
      mp4: '🎥',
      txt: '📃',
      xls: '📊',
      xlsx: '📊',
      ppt: '📑',
      pptx: '📑'
    };
    return icons[ext] || '📎';
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const handleAddComment = async () => {
    if (commentText.trim()) {
      try {
        const token = localStorage.getItem('token');
        
        const commentData = {
          text: commentText,
          author: currentUser,
        };
        
        // Make API call to add a comment
        const response = await axios.post(
          `${API_URL}/projects/${task.projectId}/tasks/${task.id}/comments`,
          commentData,
          { headers: { Authorization: `Bearer ${token}` }}
        );
        
        // Create a new comment object
        const newComment = {
          id: response.data.id || Date.now(),
          user: currentUser,
          text: commentText,
          timestamp: new Date().toISOString()
        };

        // The socket event should handle adding the comment, but if not:
        setComments(prev => [...prev, newComment]);
        setCommentText('');
        setShowEmojiPicker(false);
      } catch (error) {
        console.error('Error adding comment:', error);
        alert('Failed to add comment. Please try again.');
      }
    }
  };

  const handleEditComment = async (id) => {
    try {
      const token = localStorage.getItem('token');
      
      const commentData = {
        text: commentText,
      };
      
      // Make API call to update the comment
      await axios.patch(
        `${API_URL}/projects/${task.projectId}/tasks/${task.id}/comments/${id}`,
        commentData,
        { headers: { Authorization: `Bearer ${token}` }}
      );
      
      // The socket event should handle updating the comment, but if not:
      setComments(comments.map(c => 
        c.id === id ? {...c, text: commentText} : c
      ));
      setEditingCommentId(null);
      setCommentText('');
    } catch (error) {
      console.error('Error updating comment:', error);
      alert('Failed to update comment. Please try again.');
    }
  };

  const handleDeleteComment = async (id) => {
    if (window.confirm('Are you sure you want to delete this comment?')) {
      try {
        const token = localStorage.getItem('token');
        
        // Make API call to delete the comment
        await axios.delete(
          `${API_URL}/projects/${task.projectId}/tasks/${task.id}/comments/${id}`,
          { headers: { Authorization: `Bearer ${token}` }}
        );
        
        // The socket event should handle removing the comment, but if not:
        setComments(comments.filter(c => c.id !== id));
      } catch (error) {
        console.error('Error deleting comment:', error);
        alert('Failed to delete comment. Please try again.');
      }
    }
  };

  const handleFileUpload = async (e) => {
    if (!isFromMyProjects) {
      const files = Array.from(e.target.files);
      const validFiles = [];
      const invalidFiles = [];
  
      // Check file sizes first
      files.forEach(file => {
        if (file.size > MAX_FILE_SIZE) {
          invalidFiles.push(file.name);
        } else {
          validFiles.push(file);
        }
      });
  
      // Show alerts for invalid files
      if (invalidFiles.length > 0) {
        alert(`These files exceed 1GB: ${invalidFiles.join(', ')}`);
      }
  
      // Process valid files
      if (validFiles.length > 0) {
        try {
          setIsUploading(true);
          setUploadProgress(0);
          
          // Create FormData for the API call
          const formData = new FormData();
          validFiles.forEach(file => {
            formData.append('file', file);
          });
          
          const token = localStorage.getItem('token');
          
          // Upload files to the server
          const response = await axios.post(
            `${API_URL}/projects/${task.projectId}/tasks/${task.id}/upload`,
            formData,
            {
              headers: { 
                Authorization: `Bearer ${token}`,
                'Content-Type': 'multipart/form-data'
              },
              onUploadProgress: (progressEvent) => {
                const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                setUploadProgress(percentCompleted);
              }
            }
          );
          
          setIsUploading(false);
          
          // Create local attachments for immediate display 
          // (the socket event should add the server attachments officially)
          const newAttachments = await Promise.all(
            validFiles.map(file => new Promise((resolve) => {
              const reader = new FileReader();
              reader.onload = (e) => {
                resolve({
                  id: Date.now() + Math.random().toString(36).substring(2, 9), // Unique ID
                  name: file.name,
                  url: e.target.result,
                  size: file.size,
                  type: file.type,
                  lastModified: file.lastModified
                });
              };
              reader.readAsDataURL(file);
            }))
          );
  
          // Update state with new attachments
          setAttachments(prev => {
            const updatedAttachments = [...prev, ...newAttachments];
            onUpdateTask({
              ...task,
              attachments: updatedAttachments
            });
            return updatedAttachments;
          });
        } catch (error) {
          console.error('File processing error:', error);
          alert('Error processing files. Please try again.');
          setIsUploading(false);
        }
      }
    }
  };
  
  // Function to update description on server
  const handleDescriptionUpdate = async () => {
    if (!isFromMyProjects) {
      try {
        const token = localStorage.getItem('token');
        
        // Make API call to update task description
        await axios.patch(
          `${API_URL}/projects/${task.projectId}/tasks/${task.id}`,
          { description },
          { headers: { Authorization: `Bearer ${token}` }}
        );
        
        // The socket event will handle the update notification to other users
      } catch (error) {
        console.error('Error updating description:', error);
        alert('Failed to update description. Please try again.');
      }
    }
  };

  // Handle description blur - update the description when user finishes editing
  const handleDescriptionBlur = () => {
    handleDescriptionUpdate();
  };

  if (!task) return null;

  return (
    <div className="task-info-container">
      <div className="task-info-header">
      <h3 className="task-info-title">{task?.taskName}</h3>
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
              <path d="M17 3.34a10 10 0 1 1 -14.995 8.984l-.005 -.324l.005 -.324a10 10 0 0 1 14.995 -8.336zm-5 6.66a2 2 0 0 0 -1.977 1.697l-.018 .154l-.005 .149l.005 .15a2 2 0 1 0 1.995 -2.15z" />
            </svg>
          </div>
          <span className="task-info-meta-label">Status:</span>
          <span 
            className="task-info-status-capsule"
            style={{ backgroundColor: STATUS_COLORS[task.status] }}
          >
            {task.status.replace(/_/g, ' ')}
          </span>
        </div>
        
        <div className="task-info-meta-item">
          <div className='taskinfo-priority-svg'>
            <svg xmlns="http://www.w3.org/2000/svg"  width="16"  height="16" viewBox="0 0 24 24" fill="currentColor" className="size-6">
              <path fillRule="evenodd" d="M3 2.25a.75.75 0 0 1 .75.75v.54l1.838-.46a9.75 9.75 0 0 1 6.725.738l.108.054A8.25 8.25 0 0 0 18 4.524l3.11-.732a.75.75 0 0 1 .917.81 47.784 47.784 0 0 0 .005 10.337.75.75 0 0 1-.574.812l-3.114.733a9.75 9.75 0 0 1-6.594-.77l-.108-.054a8.25 8.25 0 0 0-5.69-.625l-2.202.55V21a.75.75 0 0 1-1.5 0V3A.75.75 0 0 1 3 2.25Z" clipRule="evenodd" />
            </svg>

          </div>
          <span className="task-info-meta-label">Priority:</span>
          <span 
            className="task-info-priority-capsule"
            style={{ backgroundColor: PRIORITY_COLORS[task.priority] }}
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

      {/* Description Section with real-time synchronization */}
      <div className="task-info-description-section">
        <h4 className="task-info-section-title">Description</h4>
        {isFromMyProjects ? (
          <div className="task-info-description-view">{task.description}</div>
        ) : (
          <textarea
            className="task-info-description-textarea"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            onBlur={handleDescriptionBlur}
            placeholder="No description available"
          />
        )}
      </div>
      
      {/* Attachments Section with real-time updates */}
      <div className="task-info-attachments-section">
        <div className="task-info-attachments-header">
          <h4 className="task-info-section-title">Attachments</h4>
          {!isFromMyProjects && (
            <label className="attachment-upload-btn">
              <span>+</span>
              <input 
                type="file" 
                onChange={handleFileUpload}
                multiple 
                style={{ display: 'none' }}
              />
            </label>
          )}
        </div>
        
        {isUploading && (
          <div className="upload-progress-container">
            <div 
              className="upload-progress-bar" 
              style={{ width: `${uploadProgress}%` }}
            ></div>
            <div className="upload-progress-text">{uploadProgress}%</div>
          </div>
        )}
        
        <div className="attachments-list">
          {attachments.map((file) => (
            <div key={file.id} className="attachment-item">
              <a 
                href={file.url} 
                download={file.name}
                target="_blank"
                rel="noopener noreferrer"
                className="attachment-content"
              >
                <span className="file-icon">{getFileIcon(file.name)}</span>
                <div className="file-details">
                  <span className="file-name">{file.name}</span>
                  <span className="file-size">{formatFileSize(file.size)}</span>
                </div>
              </a>
              {!isFromMyProjects && (
                <button className="delete-attachment-btn"
                  onClick={() => handleDeleteAttachment(file.id)}
                >
                  ×
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Comments Section with real-time updates */}
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