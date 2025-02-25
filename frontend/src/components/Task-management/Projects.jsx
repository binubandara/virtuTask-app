import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Projects.css';

function Projects() {
  const navigate = useNavigate();
  const handleReset = () => {
    document.getElementById("projectsForm").reset();
  };

  const [startDate, setStartDate] = useState('');
  const [dueDate, setDueDate] = useState('');

  return (
    <div className="projects-body">
      <div className="projects-container">
        <h1>Project Form</h1>
        <form id="projectsForm">
          <div className="form-row">
            {/* Left Section */}
            <div className="form-column">
              <label htmlFor="projectname">Project Name</label>
              <input type="text" placeholder="Enter Project Name" name="projectname" />

              <label htmlFor="departmentname">Department Name</label>
              <input type="text" placeholder="Enter Department Name" name="departmentname" />

              <label htmlFor="clientname">Client Name</label>
              <input type="text" placeholder="Enter Client Name (N/A)" name="clientname" />

              <label htmlFor="address">Description</label>
              <textarea name="address" placeholder="Enter Address" className="textarea"></textarea>
            </div>

            {/* Right Section */}
            <div className="form-column">
              <label>Priority Level</label>
              <div className="priority-buttons">
                <button type="button" className="high">High</button>
                <button type="button" className="medium">Medium</button>
                <button type="button" className="low">Low</button>
              </div>

              <label htmlFor="startdate">Start Date</label>
              <input 
                type="text" 
                placeholder="Select Start Date" 
                className="date-picker" 
                value={startDate} 
                onFocus={(e) => e.target.type = 'date'}
                onBlur={(e) => e.target.type = 'text'}
                onChange={(e) => setStartDate(e.target.value)}
              />

              <label htmlFor="duedate">Due Date</label>
              <input 
                type="text" 
                placeholder="Select Due Date" 
                className="date-picker" 
                value={dueDate} 
                onFocus={(e) => e.target.type = 'date'}
                onBlur={(e) => e.target.type = 'text'}
                onChange={(e) => setDueDate(e.target.value)}
              />

              <label>Members</label>
              <input type="text" placeholder="Search Members" className="members-input" />
            </div>
          </div>

          {/* Buttons Section */}
          <div className="form-buttons">
            <button type="button" onClick={handleReset} className="form-btn">Cancel</button>
            <button type="button" onClick={() => navigate('/password')} className="form-btn">Create Project</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Projects;
