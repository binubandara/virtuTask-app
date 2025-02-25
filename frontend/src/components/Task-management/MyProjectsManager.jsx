import React, { useState } from 'react';
import './MyProjectsManager.css';
import ProjectForm from './ProjectForm';
import ReactDOM from 'react-dom';

function MyProjectsManager() {
  const [showForm, setShowForm] = useState(false);
  const [projects, setProjects] = useState([]);
  const colorPalette = ["#ffc8dd", "#bde0fe", "#a2d2ff", "#94d2bd","#e0b1cb","#adb5bd","#98f5e1","#f79d65","#858ae3","#c2dfe3","#ffccd5","#e8e8e4","#fdffb6","#f1e8b8","#d8e2dc","#fff0f3","#ccff66"];

  const getRandomColor = (() => {
    let lastUsedColors = new Set();
  
    return () => {
      let availableColors = colorPalette.filter(c => !lastUsedColors.has(c));
  
      if (availableColors.length === 0) {
        lastUsedColors.clear(); // Reset when all colors are used
        availableColors = [...colorPalette];
      }
  
      const randomColor = availableColors[Math.floor(Math.random() * availableColors.length)];
      lastUsedColors.add(randomColor);
  
      return randomColor;
    };
  })();
  
  
  const createProject = (formData) => ({
    id: Date.now(),
    projectname: formData.projectname,
    department: formData.department,
    description: formData.description,
    color: getRandomColor() // Assign color at creation
  });

  const addProject = (formData) => {
    const newProject = createProject(formData);
    setProjects([...projects, newProject]);
    setShowForm(false);
  };

  const truncateText = (text, maxLength) => 
    text.length > maxLength ? `${text.substring(0, maxLength)}...` : text;

  return (
    <>
      

      <div 
        className={`project-manager-container ${showForm ? 'blur-background' : ''}`}
        data-gp-c-s-check-loaded="true"
        data-gp-test-installed="1.4.1224"
      >
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

        

        <div className="project-tiles">
          {projects.map((project) => (
            <div className="project-tile" key={project.id}>
              <div className="tile-content">
                <div className="project-icon">
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  fill={project.color}
                  viewBox="0 0 24 24" 
                  stroke="black" 
                  strokeWidth="0.2"  // Remove black stroke
                  className="project-svg-icon"  // Add this class
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" 
                  />
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
      {ReactDOM.createPortal(
        showForm && (
          <div className="modal-overlay">
            <ProjectForm
              closeForm={() => setShowForm(false)}
              addProject={addProject}
            />
          </div>
  ),
  document.body
)}
    </>
  
  );
}

export default MyProjectsManager;
