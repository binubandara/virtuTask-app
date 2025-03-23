import React, { useState, useEffect } from 'react';
import './ProjectForm.css';

function ProjectForm({ closeForm, addProject, editProject, initialData, mode }) {
  // Local storage key for saving form data
  const STORAGE_KEY = 'project_form_draft';
  
  // Initialize form data from initialData, local storage, or default values
  const initializeFormData = () => {
    // If we're editing an existing project, use that data
    if (initialData) {
      return {
        ...initialData,
        members: initialData.members?.join(', ') || '' // Convert array to string
      };
    }
    
    // For new projects, try to load draft from local storage
    if (mode === 'create') {
      const savedForm = localStorage.getItem(STORAGE_KEY);
      if (savedForm) {
        try {
          return JSON.parse(savedForm);
        } catch (e) {
          console.error("Failed to parse saved form data:", e);
        }
      }
    }
    
    // Default empty form
    return {
      projectname: '',
      department: '',
      client: '',
      description: '',
      startDate: '',
      dueDate: '',
      priority: 'medium',
      members: ''
    };
  };

  const [formData, setFormData] = useState(initializeFormData);
  const [originalData] = useState(initialData || {...formData});

  // Save to local storage whenever form data changes (only in create mode)
  useEffect(() => {
    if (mode === 'create') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(formData));
    }
  }, [formData, mode]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handlePriorityChange = (level) => {
    setFormData(prev => ({ ...prev, priority: level }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Process members into array
    const processedData = {
      ...formData,
      members: formData.members 
        ? formData.members.split(',').map(m => m.trim()).filter(m => m)
        : []
    };

    const requiredFields = ['projectname', 'department', 'startDate', 'dueDate'];
    const missingFields = requiredFields.filter(field => !processedData[field]);
    
    if (missingFields.length > 0) {
      alert(`Missing required fields: ${missingFields.join(', ')}`);
      return;
    }

    // Existing validation checks
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const startDate = new Date(processedData.startDate);
    const dueDate = new Date(processedData.dueDate);

    if (dueDate < startDate) {
      alert('Due date must be after start date');
      return;
    }

    if (dueDate < today) {
      alert('Due date cannot be in the past');
      return;
    }

    if (mode === 'edit') {
      if (window.confirm('Confirm project changes?')) {
        editProject(processedData);
        // No need to clear storage in edit mode
      }
    } else {
      addProject(processedData);
      // Clear the saved draft after successful creation
      localStorage.removeItem(STORAGE_KEY);
    }
    
    closeForm(); // Close the form after successful submission
  };

  const handleCreateReset = () => {
    if (window.confirm('Are you sure you want to reset the form? This will clear all entered data.')) {
      const emptyForm = {
        projectname: '',
        department: '',
        client: '',
        description: '',
        startDate: '',
        dueDate: '',
        priority: 'medium',
        members: ''
      };
      
      setFormData(emptyForm);
      // Update the local storage with the empty form
      localStorage.setItem(STORAGE_KEY, JSON.stringify(emptyForm));
    }
  };

  const handleEditReset = () => {
    if (window.confirm('Reset to original values?')) {
      setFormData(originalData);
    }
  };

  // Add function to clear draft if the form is closed
  const handleCloseForm = () => {
    // We don't automatically clear drafts when closing to allow users to come back
    closeForm();
  };

  // Add function to discard draft
  const handleDiscardDraft = () => {
    if (window.confirm('Discard the saved draft? This cannot be undone.')) {
      localStorage.removeItem(STORAGE_KEY);
      setFormData({
        projectname: '',
        department: '',
        client: '',
        description: '',
        startDate: '',
        dueDate: '',
        priority: 'medium',
        members: ''
      });
    }
  };

  // Check if we have a saved draft (only in create mode)
  const hasSavedDraft = mode === 'create' && localStorage.getItem(STORAGE_KEY) !== null;

  return (
    <div className="projectform-form-modal">
      <div className="projectform-projects-container" onClick={(e) => e.stopPropagation()}>
        <div className="projectform-modal-header">
          <h1>{mode === 'edit' ? 'Edit Project' : 'Create New Project'}</h1>
          {hasSavedDraft && mode === 'create' && (
            <div className="projectform-draft-indicator">
              Draft Loaded
            </div>
          )}
          <div className="projectform-minus-icon" onClick={handleCloseForm}>
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
          </div>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="projectform-form-row">
            <div className="projectform-left-form-column">
              <label htmlFor="projectname">Project Name</label>
              <input 
                type="text" 
                name="projectname" 
                placeholder="Enter Project Name" 
                value={formData.projectname}
                onChange={handleChange}
                required
              />

              <label htmlFor="department">Department</label>
              <input 
                type="text" 
                name="department" 
                placeholder="Enter Department" 
                value={formData.department}
                onChange={handleChange}
                required
              />

              <label htmlFor="client">Client</label>
              <input 
                type="text" 
                name="client" 
                placeholder="Enter Client (N/A)" 
                value={formData.client}
                onChange={handleChange}
              />

              <label htmlFor="description">Description</label>
              <textarea 
                name="description" 
                placeholder="Enter Description" 
                value={formData.description}
                onChange={handleChange}
                className="projectform-textarea"
              />
            </div>

            <div className="projectform-right-form-column">
              <label>Priority Level</label>
              <div className="projectform-priority-buttons">
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
                className="projectform-date-picker"
                value={formData.startDate}
                onChange={handleChange}
                required
              />

              <label htmlFor="dueDate">Due Date</label>
              <input 
                type="date" 
                name="dueDate" 
                className="projectform-date-picker"
                value={formData.dueDate}
                onChange={handleChange}
                required
              />
               <label htmlFor="members">Members</label>
              <div className="projectform-members-container">
              <input 
                type="text" 
                name="members" 
                className="projectform-members-input" 
                placeholder="Enter member IDs (comma separated)"
                value={formData.members}
                onChange={handleChange}
              />
              
              <div className="projectform-svg-member-icon">
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  strokeWidth="1" 
                  stroke="currentColor" 
                  className="size-6"
                  width="24" height="24"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    d="M17.982 18.725A7.488 7.488 0 0 0 12 15.75a7.488 7.488 0 0 0-5.982 2.975m11.963 0a9 9 0 1 0-11.963 0m11.963 0A8.966 8.966 0 0 1 12 21a8.966 8.966 0 0 1-5.982-2.275M15 9.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" 
                  />
                </svg>
              </div>
            </div>
            </div>
          </div>

          <div className="projectform-form-buttons">
            {mode === 'edit' ? (
              <button 
                type="button" 
                onClick={handleEditReset} 
                className="projectform-form-btn reset"
              >
                Original Input
              </button>
            ) : (
              <>
                <button 
                  type="button" 
                  onClick={handleCreateReset} 
                  className="projectform-form-btn reset"
                >
                  Reset
                </button>
                {hasSavedDraft && (
                  <button 
                    type="button" 
                    onClick={handleDiscardDraft} 
                    className="projectform-form-btn discard"
                  >
                    Discard Draft
                  </button>
                )}
              </>
            )}
            <button type="submit" className="projectform-form-btn create">
              {mode === 'edit' ? 'Confirm Edit' : 'Create Project'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ProjectForm;