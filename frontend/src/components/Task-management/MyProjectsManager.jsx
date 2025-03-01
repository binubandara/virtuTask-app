import React, { useState, useEffect } from 'react';
import './MyProjectsManager.css';
import ProjectForm from './ProjectForm';
import ReactDOM from 'react-dom';
import { useNavigate } from 'react-router-dom';

const clockSVG = (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor" className="icon icon-tabler icons-tabler-filled icon-tabler-clock">
    <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
    <path d="M17 3.34a10 10 0 1 1 -14.995 8.984l-.005 -.324l.005 -.324a10 10 0 0 1 14.995 -8.336zm-5 2.66a1 1 0 0 0 -.993 .883l-.007 .117v5l.009 .131a1 1 0 0 0 .197 .477l.087 .1l3 3l.094 .082a1 1 0 0 0 1.226 0l.094 -.083l.083 -.094a1 1 0 0 0 0 -1.226l-.083 -.094l-2.707 -2.708v-4.585l-.007 -.117a1 1 0 0 0 -.993 -.883z" />
  </svg>
);

const pencilSVG = (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-6">
    <path d="M21.731 2.269a2.625 2.625 0 0 0-3.712 0l-1.157 1.157 3.712 3.712 1.157-1.157a2.625 2.625 0 0 0 0-3.712ZM19.513 8.199l-3.712-3.712-12.15 12.15a5.25 5.25 0 0 0-1.32 2.214l-.8 2.685a.75 .75 0 0 0 .933 .933l2.685-.8a5.25 5.25 0 0 0 2.214-1.32L19.513 8.2Z" />
  </svg>
);

function MyProjectsManager() {
  const navigate = useNavigate();
  const [showForm, setShowForm] = useState(false);
  const [projects, setProjects] = useState(() => {
    const saved = localStorage.getItem('projects');
    return saved ? JSON.parse(saved) : [];
  });
  const [editingProject, setEditingProject] = useState(null);
  const colorPalette = ["#ffc8dd", "#bde0fe", "#a2d2ff", "#94d2bd","#e0b1cb","#adb5bd","#98f5e1","#f79d65","#858ae3","#c2dfe3","#ffccd5","#e8e8e4","#fdffb6","#f1e8b8","#d8e2dc","#fff0f3","#ccff66"];

  useEffect(() => {
    localStorage.setItem('projects', JSON.stringify(projects));
  }, [projects]);

  const getRandomColor = (() => {
    let lastUsedColors = new Set();
    return () => {
      let availableColors = colorPalette.filter(c => !lastUsedColors.has(c));
      if (availableColors.length === 0) {
        lastUsedColors.clear(); 
        availableColors = [...colorPalette];
      }
      const randomColor = availableColors[Math.floor(Math.random() * availableColors.length)];
      lastUsedColors.add(randomColor);
      return randomColor;
    };
  })();

  const createProject = (formData) => ({
    id: Date.now(),
    ...formData,
    color: getRandomColor()
  });

  const addProject = (formData) => {
    const newProject = createProject(formData);
    setProjects([...projects, newProject]);
    setShowForm(false);
  };

  const editProject = (updatedProject) => {
    setProjects(projects.map(p => p.id === updatedProject.id ? updatedProject : p));
    setShowForm(false);
    setEditingProject(null);
  };

  const truncateText = (text, maxLength = 50) => 
    text.length > maxLength ? `${text.substring(0, maxLength)}...` : text;

  const getDueDateDisplay = (dueDate) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const due = new Date(dueDate);
    due.setHours(0, 0, 0, 0);
    const diffTime = due - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return { 
      text: 'Overdue', 
      textColor: '#ff0000',
      backgroundColor: 'rgba(255, 0, 0, 0.1)' 
    };

    let text = '';
    let textColor = '';
    let backgroundColor = '';

    if (diffDays === 0) {
      text = 'Today';
      textColor = '#ff0000';
    } else if (diffDays === 1) {
      text = '1 day';
      textColor = '#ff0000';
    } else if (diffDays <= 7) {
      text = `${diffDays} days`;
      textColor = '#ff0000';
    } else if (diffDays <= 14) {
      text = '1 week';
      textColor = '#808080';
    } else if (diffDays <= 21) {
      text = '2 weeks';
      textColor = '#808080';
    } else if (diffDays <= 28) {
      text = '3 weeks';
      textColor = '#808080';
    } else if (diffDays <= 58) {
      text = '1 month';
      textColor = '#ffff00';
    } else if (diffDays <= 88) {
      text = '2 months';
      textColor = '#ffff00';
    } else if (diffDays <= 364) {
      const months = Math.floor(diffDays / 30);
      text = `${months} month${months > 1 ? 's' : ''}`;
      textColor = '#ffff00';
    } else {
      const years = Math.floor(diffDays / 365);
      text = `${years} year${years > 1 ? 's' : ''}`;
      textColor = '#0000ff';
    }

    backgroundColor = `${textColor}1A`;
    return { text, textColor, backgroundColor };
  };

  const handleTileClick = (projectId) => {
    navigate(`/task-manager/${projectId}`);
  };

  return (
    <>
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
            <button className="add-project" onClick={() => {
              setEditingProject(null);
              setShowForm(true);
            }}>+ Add New Project</button>
          </div>
        </div>

        <div className="project-tiles">
          {projects.map((project) => {
            const dueDisplay = getDueDateDisplay(project.dueDate);
            return (
              <div 
                className="project-tile" 
                key={project.id}
                onClick={() => handleTileClick(project.id)}
              >
                <div className="tile-content">
                  <div 
                    className="pencil-icon" 
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditingProject(project);
                      setShowForm(true);
                    }}
                  >
                    {pencilSVG}
                  </div>
                  <div className="project-icon">
                    <svg 
                      xmlns="http://www.w3.org/2000/svg" 
                      fill={project.color}
                      viewBox="0 0 24 24" 
                      stroke="black" 
                      strokeWidth="0.2"
                      className="project-svg-icon"
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
                
                {dueDisplay.text && (
                  <button 
                    className="due-button" 
                    style={{ 
                      backgroundColor: dueDisplay.backgroundColor,
                      color: dueDisplay.textColor
                    }}
                  >
                    {clockSVG} {dueDisplay.text}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {ReactDOM.createPortal(
        showForm && (
          <div className="modal-overlay">
            <ProjectForm
              closeForm={() => {
                if(window.confirm('Are you sure you want to cancel? Unsaved changes will be lost.')) {
                  setShowForm(false);
                  setEditingProject(null);
                }
              }}
              addProject={addProject}
              editProject={editProject}
              initialData={editingProject}
              mode={editingProject ? 'edit' : 'create'}
            />
          </div>
        ),
        document.body
      )}
    </>
  );
}

export default MyProjectsManager;
