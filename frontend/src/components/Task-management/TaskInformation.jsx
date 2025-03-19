import React, { useState, useEffect } from 'react';
import './TaskInformation.css';
import EmojiPicker from 'emoji-picker-react';

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
  const [isAssigneeHovered, setIsAssigneeHovered] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [description, setDescription] = useState('');
  const [attachments, setAttachments] = useState([]);
  const [comments, setComments] = useState([]);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const PRIORITY_COLORS = { high: '#ff4444', medium: '#ffa500', low: '#4CAF50' };
  const STATUS_COLORS = { pending: '#f67a15', on_hold: '#939698', in_progress: '#0d85fd', completed: '#28a46a' };

  // Reset state when task changes
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
  }, [description, attachments, comments]);

  const handleEmojiClick = (emojiObject) => {
    setCommentText(prev => prev + emojiObject.emoji);
    setShowEmojiPicker(false);
  };
  const handleDeleteAttachment = (attachmentId) => {
    if (window.confirm('Are you sure you want to delete this file?')) {
      setAttachments(attachments.filter(a => a.id !== attachmentId));
    }
  };

  const getFileIcon = (fileName) => {
    const ext = fileName.split('.').pop().toLowerCase();
    if (ext === 'pdf') return '📄';
    if (['doc', 'docx'].includes(ext)) return '📝';
    return '📎';
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };


  const handleAddComment = () => {
    if (commentText.trim()) {
      const newComment = {
        id: Date.now(),
        user: currentUser,
        text: commentText,
        timestamp: new Date().toISOString()
      };
      setComments([...comments, newComment]);
      setCommentText('');
      setShowEmojiPicker(false);
    }
  };

  const handleEditComment = (id) => {
    setComments(comments.map(c => 
      c.id === id ? {...c, text: commentText} : c
    ));
    setEditingCommentId(null);
    setCommentText('');
  };

  const handleDeleteComment = (id) => {
    if (window.confirm('Are you sure you want to delete this comment?')) {
      setComments(comments.filter(c => c.id !== id));
    }
  };

  const handleFileUpload = (e) => {
    if (!isFromMyProjects) {
      const newFiles = Array.from(e.target.files).map(file => ({
        id: Date.now(),
        name: file.name,
        url: URL.createObjectURL(file),
        size: file.size,
        type: file.type
      }));
      setAttachments([...attachments, ...newFiles]);
    }
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
              class="icon icon-tabler icons-tabler-filled icon-tabler-circle-dot"
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
            <svg xmlns="http://www.w3.org/2000/svg"  width="16"  height="16" viewBox="0 0 24 24" fill="currentColor" class="size-6">
              <path fill-rule="evenodd" d="M3 2.25a.75.75 0 0 1 .75.75v.54l1.838-.46a9.75 9.75 0 0 1 6.725.738l.108.054A8.25 8.25 0 0 0 18 4.524l3.11-.732a.75.75 0 0 1 .917.81 47.784 47.784 0 0 0 .005 10.337.75.75 0 0 1-.574.812l-3.114.733a9.75 9.75 0 0 1-6.594-.77l-.108-.054a8.25 8.25 0 0 0-5.69-.625l-2.202.55V21a.75.75 0 0 1-1.5 0V3A.75.75 0 0 1 3 2.25Z" clip-rule="evenodd" />
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
          <svg xmlns="http://www.w3.org/2000/svg" width="16"  height="16" viewBox="0 0 24 24" fill="currentColor" class="size-6">
            <path d="M12.75 12.75a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0ZM7.5 15.75a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5ZM8.25 17.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0ZM9.75 15.75a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5ZM10.5 17.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0ZM12 15.75a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5ZM12.75 17.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0ZM14.25 15.75a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5ZM15 17.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0ZM16.5 15.75a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5ZM15 12.75a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0ZM16.5 13.5a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Z" />
            <path fill-rule="evenodd" d="M6.75 2.25A.75.75 0 0 1 7.5 3v1.5h9V3A.75.75 0 0 1 18 3v1.5h.75a3 3 0 0 1 3 3v11.25a3 3 0 0 1-3 3H5.25a3 3 0 0 1-3-3V7.5a3 3 0 0 1 3-3H6V3a.75.75 0 0 1 .75-.75Zm13.5 9a1.5 1.5 0 0 0-1.5-1.5H5.25a1.5 1.5 0 0 0-1.5 1.5v7.5a1.5 1.5 0 0 0 1.5 1.5h13.5a1.5 1.5 0 0 0 1.5-1.5v-7.5Z" clip-rule="evenodd" />
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

      {/* Updated Description Section */}
      <div className="task-info-description-section">
        <h4 className="task-info-section-title">Description</h4>
        {isFromMyProjects ? (
          <div className="task-info-description-view">{task.description}</div>
        ) : (
          <textarea
            className="task-info-description-textarea"
            value={description} // Use local state
            onChange={(e) => setDescription(e.target.value)} // Add onChange handler
            placeholder="No description available"
          />
        )}
      </div>
     {/* Updated Attachments Section */}
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
        <div className="attachments-list">
          {attachments.map((file) => (
            <div key={file.id} className="attachment-item">
              <a 
                href={file.url} 
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
                <button 
                  className="delete-attachment-btn"
                  onClick={() => handleDeleteAttachment(file.id)}
                >
                  ×
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Updated Comments Section */}
      <div className="task-info-comments-section">
        <div className="task-info-comments-header">
          <h4 className="task-info-section-title">Comments</h4>
          <div className="comment-section-divider"></div>
        </div>

        {/* Comment Input Area */}
        {!isFromMyProjects && (
          <div className="comment-input-container">
            <div className="comment-input-wrapper">
              <button 
                className="emoji-btn"
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                type="button"
              >
                😀
              </button>
              <textarea
                className="task-info-comment-textarea"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Add a new comment..."
                rows="3"
              />
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
        )}

        {/* Comments List */}
        <div className="comments-list">
          {comments.map(comment => (
            <div key={comment.id} className="comment-item">
              <div className="comment-header">
                <div className="comment-user-info">
                  <MemberIcon member={comment.user} />
                  <span className="comment-username">{comment.user}:</span>
                </div>
                
                {!isFromMyProjects && (
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
                )}
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