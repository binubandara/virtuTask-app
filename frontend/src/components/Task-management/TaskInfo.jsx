import React from 'react';
import './TaskInfo.css';

const TaskInfo = ({ task, onClose }) => {
  if (!task) return null;

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

  return (
    <div className="task-info-container">
      <div className="task-info-header">
        <h3 className="task-info-title">{task.taskName}</h3>
        <button className="task-info-close" onClick={onClose}>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
            <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
          </svg>
        </button>
      </div>
      <div className="divider"></div>

      <div className="task-meta-section">
        <div className="meta-item">
          <span className="meta-label">Status:</span>
          <span 
            className="status-capsule"
            style={{ backgroundColor: STATUS_COLORS[task.status] }}
          >
            {task.status.replace(/_/g, ' ')}
          </span>
        </div>
        
        <div className="meta-item">
          <span className="meta-label">Priority:</span>
          <span 
            className="priority-capsule"
            style={{ backgroundColor: PRIORITY_COLORS[task.priority] }}
          >
            {task.priority}
          </span>
        </div>

        <div className="meta-item">
          <span className="meta-label">Due Date:</span>
          <span className="due-date">{task.dueDate}</span>
        </div>

        <div className="meta-item">
          <span className="meta-label">Assignee:</span>
          <button className="assignee-button">
            {task.assignee || 'Change Person'}
          </button>
        </div>
      </div>

      <div className="description-section">
        <h4 className="section-title">Description</h4>
        <textarea
          className="description-textarea"
          value={task.description || ''}
          readOnly
          placeholder="No description available"
        />
      </div>

      <div className="attachments-section">
        <div className="attachments-header">
          <h4 className="section-title">Attachments</h4>
          <button className="add-attachment">
            <span className="plus-sign">+</span>
          </button>
        </div>
        <div className="attachment-list">
          {task.attachments?.map((attachment, index) => (
            <div key={index} className="attachment-item">
              {attachment}
            </div>
          ))}
        </div>
      </div>

      <div className="comments-section">
        <div className="comments-header">
          <h4 className="section-title">Comments</h4>
          <input 
            type="search" 
            placeholder="Search comments..." 
            className="comment-search"
          />
        </div>
        <textarea
          className="comment-textarea"
          placeholder="Add a new comment..."
        />
      </div>
    </div>
  );
};

export default TaskInfo;