import React, { useState, useEffect, useRef } from 'react';
import './ProjectForm.css';
import axios from 'axios';

function ProjectForm({ closeForm, addProject, editProject, initialData, mode }) {
  const [formData, setFormData] = useState(initialData ? {
    ...initialData,
    members: initialData.members || [] // Keep members as an array
  } : {
    projectname: '',
    department: '',
    client: '',
    description: '',
    startDate: '',
    dueDate: '',
    priority: 'medium',
    members: []
  });
  console.log("form")
  console.log(initialData);
  
  const [memberSearch, setMemberSearch] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);
  const [originalData] = useState(initialData || {...formData});
  
  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleMemberSearch = async (e) => {
    const searchValue = e.target.value;
    setMemberSearch(searchValue);
    
    if (searchValue.length < 1) {
      setSearchResults([]);
      setShowDropdown(false);
      return;
    }
    
    setIsSearching(true);
    setShowDropdown(true);
    
    try {
      // Get token from localStorage
      const token = localStorage.getItem('userToken');
      
      const response = await axios.get(
        `http://localhost:5001/api/auth/search?name=${searchValue}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      
      setSearchResults(response.data);
    } catch (error) {
      console.error("Error searching for members:", error);
    } finally {
      setIsSearching(false);
    }
  };
  
  const addMember = (member) => {
    // Check if member is already added
    const isMemberAdded = formData.members.some(m => 
      typeof m === 'object' ? m.id === member.id : m === member.id
    );
    
    if (!isMemberAdded) {
      setFormData(prev => ({
        ...prev,
        members: [...prev.members, member]
      }));
    }
    
    setMemberSearch('');
    setShowDropdown(false);
  };
  
  const removeMember = (username) => {
    setFormData(prev => ({
      ...prev,
      members: prev.members.filter(m => 
        typeof m === 'object' ? m.username !== username : m !== username
      )
    }));
  };

  const handlePriorityChange = (level) => {
    setFormData(prev => ({ ...prev, priority: level }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Process members into array of usernames if they're objects
    const processedData = {
      ...formData,
      members: formData.members.map(member => 
        typeof member === 'object' ? member.username : member
      )
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
      }
    } else {
      addProject(processedData);
    }
  };

  // Rest of your functions...

  const handleCreateReset = () => {
    if (window.confirm('Are you sure you want to reset the form?')) {
      setFormData({
        projectname: '',
        department: '',
        client: '',
        description: '',
        startDate: '',
        dueDate: '',
        priority: 'medium',
        members: []
      });
    }
  };

  const handleEditReset = () => {
    if (window.confirm('Reset to original values?')) {
      setFormData(originalData);
    }
  };

  return (
    // Rest of the form remains the same until the members section
    <div className="projectform-form-modal">
      <div className="projectform-projects-container" onClick={(e) => e.stopPropagation()}>
        <div className="projectform-modal-header">
          <h1>{mode === 'edit' ? 'Edit Project' : 'Create New Project'}</h1>
          <div className="projectform-minus-icon" onClick={closeForm}>
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
              <div className="projectform-members-container" ref={dropdownRef}>
                <input 
                  type="text" 
                  className="projectform-members-input" 
                  placeholder="Search for members..." 
                  value={memberSearch}
                  onChange={handleMemberSearch}
                  onClick={() => memberSearch && setShowDropdown(true)}
                />
                
                <div className="projectform-svg-member-icon">
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    strokeWidth="1" 
                    stroke="currentColor" 
                    width="24" height="24"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      d="M17.982 18.725A7.488 7.488 0 0 0 12 15.75a7.488 7.488 0 0 0-5.982 2.975m11.963 0a9 9 0 1 0-11.963 0m11.963 0A8.966 8.966 0 0 1 12 21a8.966 8.966 0 0 1-5.982-2.275M15 9.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" 
                    />
                  </svg>
                </div>
                
                {/* Dropdown for search results */}
                {showDropdown && (
                  <div className="projectform-members-dropdown">
                    {isSearching && <div className="projectform-dropdown-loading">Loading...</div>}
                    
                    {!isSearching && searchResults.length === 0 && (
                      <div className="projectform-dropdown-no-results">No members found</div>
                    )}
                    
                    {!isSearching && searchResults.map(user => (
                      <div 
                        key={user.id} 
                        className="projectform-dropdown-item"
                        onClick={() => addMember(user)}
                      >
                        {user.username} ({user.email})
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              {/* Display selected members */}
              <div className="projectform-selected-members">
                {formData.members.map((member, index) => (
                  <div key={index} className="projectform-member-tag">
                    {typeof member === 'object' 
                      ? `${member.username || member.name || 'Unknown'} ${member.email ? `(${member.email})` : ''}`
                      : `Username: ${member}`}
                    <button 
                      type="button"
                      className="projectform-member-remove"
                      onClick={() => removeMember(typeof member === 'object' ? member.username : member)}
                    >
                      ×
                    </button>
                  </div>
                ))}
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
              <button 
                type="button" 
                onClick={handleCreateReset} 
                className="projectform-form-btn reset"
              >
                Reset
              </button>
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