import React, { useState } from 'react';
import './MyProjectsManager.css';
import ProjectForm from './ProjectForm';

function MyProjectsManager() {
  const [showForm, setShowForm] = useState(false);
  const [projects, setProjects] = useState([]);

  const addProject = (project) => {
    setProjects([...projects, project]);
    setShowForm(false);
  };
  const truncateText = (text, maxLength) => {
    return text.length > maxLength ? text.substring(0, maxLength) + "..." : text;
  };
  
  

  return (
    <>
      {showForm && <div className="modal-overlay" />} 

      <div className={`project-manager-container ${showForm ? 'blur-background' : ''}`}>
        <h1 className="title">Project Management</h1>
        <div className="line"></div>

        <div className="toolbar">
          <div className="dropdowns">
            <select className="dropdown">
              <option>Sort</option>
              <option>A - Z</option>
              <option>Month</option>
              <option>Year</option>
            </select>

            <select className="dropdown" name="Status">
              <option>Status</option>
              <option>All</option>
              <option>Completed</option>
              <option>On Hold</option>
              <option>Started</option>
            </select>
          </div>

          <div className="button-group">
            <button className="add-project" onClick={() => setShowForm(true)}>+ Add New Project</button>
          </div>
        </div>

        {showForm && <ProjectForm closeForm={() => setShowForm(false)} addProject={addProject} />}

        <div className="project-tiles">
          {projects.map((project, index) => (
            <div className="project-tile" key={index}>
              
              <div className="tile-content">
                {/* Default SVG icon */}
                <div className="project-icon">
                  {/* Insert the SVG Icon below */}
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" className="size-6">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
                  </svg>
                  

                </div>
              

                <div className="project-details">
                  <h3>{truncateText(project.projectname, 20)}</h3>
                  <h4>{truncateText(project.department, 20)}</h4>
                  
                </div>
              </div>
              <p>{truncateText(project.description)}</p>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

export default MyProjectsManager;
