import React from 'react';
import './MyTasksEmployee.css';

const MyTasksEmployee = () => {
  return (
    <div className="mytasks-container">
      <div className="mytasks-page-header">
        <div className="mytasks-header-left">
          <span className="mytasks-back-arrow">←</span>
          <h1 className="mytasks-project-title">Project Title</h1>
        </div>
        <div className="mytasks-members-section">
          <span className="mytasks-members-label">Members</span>
          <div className="mytasks-member-icon">👤</div>
        </div>
      </div>

      <div className="mytasks-tasks-content">
        <div className="mytasks-tasks-header">
          <h2 className="mytasks-tasks-title">Tasks</h2>
          <div className="mytasks-title-divider"></div>
        </div>
        
        <div className="mytasks-no-tasks-message">
          No tasks available
        </div>
      </div>
    </div>
  );
};

export default MyTasksEmployee;