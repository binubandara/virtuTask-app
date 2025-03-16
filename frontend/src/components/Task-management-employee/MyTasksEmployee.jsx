import React from 'react';
import './MyTasksEmployee.css';

const MyTasksEmployee = () => {
  return (
    <div className="tasks-container">
      <div className="page-header">
        <div className="header-left">
          <span className="back-arrow">←</span>
          <h1 className="project-title">Project Title</h1>
        </div>
        <div className="members-section">
          <span className="members-label">Members</span>
          <div className="member-icon">👤</div>
        </div>
      </div>

      <div className="tasks-content">
        <div className="tasks-header">
          <h2 className="tasks-title">Tasks</h2>
          <div className="title-divider"></div>
        </div>
        
        <div className="no-tasks-message">
          No tasks available
        </div>
      </div>
    </div>
  );
};

export default MyTasksEmployee;