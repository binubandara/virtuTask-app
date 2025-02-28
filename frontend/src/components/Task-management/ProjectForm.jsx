import React, { useState } from 'react';
import './ProjectForm.css';

function ProjectForm({ closeForm, addProject }) {
  const [formData, setFormData] = useState({
    projectname: '',
    department: '',
    description: '',
    startDate: '',
    dueDate: '',
    priority: 'medium'
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handlePriorityChange = (level) => {
    setFormData(prev => ({ ...prev, priority: level }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    addProject(formData);
  };

  return (
    <div className="form-modal" onClick={closeForm}>
      <div className="projects-container" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h1>Create New Project</h1>
          <div className="minus-icon" onClick={closeForm}>
            <svg 
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24" 
              strokeWidth="1.5"
              stroke="currentColor" 
              className="size-6"
              width="24" height="24"
            >
              <path 
                strokeLinecap="round"
                strokeLinejoin="round" 
                d="M5 12h14" 
              />
            </svg>
          </div>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="left-form-column">
              <label htmlFor="projectname">Project Name</label>
              <input 
                type="text" 
                name="projectname" 
                placeholder="Enter Project Name" 
                onChange={handleChange}
                required
              />

              <label htmlFor="department">Department</label>
              <input 
                type="text" 
                name="department" 
                placeholder="Enter Department" 
                onChange={handleChange}
              />

              <label htmlFor="client">Client</label>
              <input 
                type="text" 
                name="client" 
                placeholder="Enter Client (N/A)" 
                onChange={handleChange}
              />

              <label htmlFor="description">Description</label>
              <textarea 
                name="description" 
                placeholder="Enter Description" 
                onChange={handleChange}
                className="textarea"
              />
            </div>

            <div className="right-form-column">
              <label>Priority Level</label>
              <div className="priority-buttons">
                <button 
                  type="button" 
                  className={`high ${formData.priority === 'high' ? 'active' : ''}`}
                  onClick={() => handlePriorityChange('high')}
                >
                  High
                </button>
                <button 
                  type="button" 
                  className={`medium ${formData.priority === 'medium' ? 'active' : ''}`}
                  onClick={() => handlePriorityChange('medium')}
                >
                  Medium
                </button>
                <button 
                  type="button" 
                  className={`low ${formData.priority === 'low' ? 'active' : ''}`}
                  onClick={() => handlePriorityChange('low')}
                >
                  Low
                </button>
              </div>

              <label htmlFor="startDate">Start Date</label>
              <input 
                type="date" 
                name="startDate" 
                className="date-picker"
                onChange={handleChange}
              />

              <label htmlFor="dueDate">Due Date</label>
              <input 
                type="date" 
                name="dueDate" 
                className="date-picker"
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="form-buttons">
            <button type="button" onClick={closeForm} className="form-btn reset">
              Reset
            </button>
            <button type="submit" className="form-btn create">
              Create Project
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ProjectForm;