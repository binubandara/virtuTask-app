import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Projects.css';

function Projects() {
  const navigate = useNavigate();
  const handleReset = () => {
    document.getElementById("projectsForm").reset();
  };

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
              <div className="input-row">
              <div className='plevel'>
                <h4>Priority Level</h4>
                <button type="button">High</button>
                <button type="button">Medium</button>
                <button type="button">Low</button>
              </div>
              
              </div>

              <label htmlFor="attachment">Attachments</label>
              <input type="file" name="resume" />
               
              <label htmlFor="projectname">Project Name</label>
              <input type="text" placeholder="Enter Project Name" name="projectname" />
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
