import React from 'react';
import './TaskInformation.css';

const TaskInformation = ({ task, onClose }) => {
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
            <svg  xmlns="http://www.w3.org/2000/svg"  width="16"  height="16"  viewBox="0 0 24 24"  fill="currentColor"  class="icon icon-tabler icons-tabler-filled icon-tabler-circle-dot">
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
            <svg xmlns="http://www.w3.org/2000/svg"width="16"  height="16"viewBox="0 0 24 24" fill="currentColor" class="size-6">
              <path d="M4.5 6.375a4.125 4.125 0 1 1 8.25 0 4.125 4.125 0 0 1-8.25 0ZM14.25 8.625a3.375 3.375 0 1 1 6.75 0 3.375 3.375 0 0 1-6.75 0ZM1.5 19.125a7.125 7.125 0 0 1 14.25 0v.003l-.001.119a.75.75 0 0 1-.363.63 13.067 13.067 0 0 1-6.761 1.873c-2.472 0-4.786-.684-6.76-1.873a.75.75 0 0 1-.364-.63l-.001-.122ZM17.25 19.128l-.001.144a2.25 2.25 0 0 1-.233.96 10.088 10.088 0 0 0 5.06-1.01.75.75 0 0 0 .42-.643 4.875 4.875 0 0 0-6.957-4.611 8.586 8.586 0 0 1 1.71 5.157v.003Z" />
            </svg>

          </div>
          <span className="task-info-meta-label">Assignee:</span>
          <button className="task-info-assignee-button">
            {task.assignee || 'Change Person'}
          </button>
        </div>
      </div>

      <div className="task-info-description-section">
        <h4 className="task-info-section-title">Description</h4>
        <textarea
          className="task-info-description-textarea"
          placeholder="No description available"
        />
      </div>
      

      <div className="task-info-attachments-section">
        <div className="task-info-attachments-header">
        <label htmlFor="task-info-attachment"><h4 className="task-info-section-title">Attachments</h4></label>
        <input type="file" name="files" />
        </div>
      </div>

      <div className="task-info-comments-section">
        <div className="task-info-comments-header">
          <h4 className="task-info-section-title">Comments</h4>
          
        </div>
        <textarea
          className="task-info-comment-textarea"
          placeholder="Add a new comment..."
        />
      </div>
    </div>
  );
};

export default TaskInformation;