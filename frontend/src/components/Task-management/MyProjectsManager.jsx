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
                {/* Ensure image preview is displayed */}
                {project.picture && <img src={project.picture} alt={project.projectname} className="project-image" />}
                <div className="project-details">
                  <h3>{project.projectname}</h3>
                  <h4>{project.department}</h4>
                  <p>{project.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

export default MyProjectsManager;
