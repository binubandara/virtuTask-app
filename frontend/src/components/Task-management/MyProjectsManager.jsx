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
  <svg xmlns="http://www.w3.org/2000/svg"  viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
    <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 9h16.5m-16.5 6.75h16.5" />
  </svg>
);


function MyProjectsManager() {
  const navigate = useNavigate();
  const [showForm, setShowForm] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [selectedProjectId, setSelectedProjectId] = useState(null);
  const [sortBy, setSortBy] = useState('default'); // Add this line
  const colorPalette = ["#ffc8dd", "#bde0fe", "#a2d2ff", "#94d2bd","#e0b1cb","#adb5bd","#98f5e1","#f79d65","#858ae3","#c2dfe3","#ffccd5","#e8e8e4","#fdffb6","#f1e8b8","#d8e2dc","#fff0f3","#ccff66"];

  // Fix projects initialization
  const [projects, setProjects] = useState(() => {
    try {
      const saved = localStorage.getItem('projects');
      return saved ? JSON.parse(saved) : [];
    } catch (error) {
      console.error('Error loading projects:', error);
      return [];
    }
  });

  const sortProjects = (projects) => {
    switch(sortBy) {
      case 'a-z':
        return [...projects].sort((a, b) => 
          a.projectname.localeCompare(b.projectname));
      case 'month':
        return [...projects].sort((a, b) => 
          new Date(a.dueDate) - new Date(b.dueDate));
      case 'year':
        return [...projects].sort((a, b) => 
          new Date(a.dueDate).getFullYear() - new Date(b.dueDate).getFullYear());
      default:
        return projects;
    }
  };

  // Save to localStorage whenever projects change
  useEffect(() => {
    localStorage.setItem('projects', JSON.stringify(projects));
  }, [projects]);

  const saveProjects = (updatedProjects) => {
    setProjects(updatedProjects);
  };
  
  const addProject = (formData) => {
    const newProject = createProject(formData);
    saveProjects([...projects, newProject]);
    setShowForm(false);
  };

  const editProject = (updatedProject) => {
    const updatedProjects = projects.map(p => 
      p.id === updatedProject.id ? updatedProject : p
    );
    saveProjects(updatedProjects);
    setShowForm(false);
    setEditingProject(null);
  };

  const deleteProject = (projectId) => {
    if (window.confirm('Delete confirmation')) {
      const updatedProjects = projects.filter(project => project.id !== projectId);
      saveProjects(updatedProjects);
    }
    setSelectedProjectId(null);
  };

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
    color: getRandomColor(),
    priority: formData.priority,
    members: formData.members || [] // Add members array
  });
  
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
      textColor: ' #ff0000',
      backgroundColor: 'rgba(255, 0, 0, 0.1)' 
    };

    let text = '';
    let textColor = '';
    let backgroundColor = '';

    if (diffDays === 0) {
      text = 'Today';
      textColor = '#ff4b4b';
    } else if (diffDays === 1) {
      text = '1 day';
      textColor = ' #ff4b4b';
    } else if (diffDays <= 7) {
      text = `${diffDays} days`;
      textColor = ' #ff4b4b';
    } else if (diffDays <= 14) {
      text = '1 week';
      textColor = ' #808080';
    } else if (diffDays <= 21) {
      text = '2 weeks';
      textColor = ' #808080';
    } else if (diffDays <= 28) {
      text = '3 weeks';
      textColor = ' #808080';
    } else if (diffDays <= 58) {
      text = '1 month';
      textColor = '#ffd000';
    } else if (diffDays <= 88) {
      text = '2 months';
      textColor = 'rgb(255, 157, 0)';
    } else if (diffDays <= 364) {
      const months = Math.floor(diffDays / 30);
      text = `${months} month${months > 1 ? 's' : ''}`;
      textColor = 'rgb(255, 157, 0)';
    } else {
      const years = Math.floor(diffDays / 365);
      text = `${years} year${years > 1 ? 's' : ''}`;
      textColor = ' #0073ff';
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
            <select 
              className="dropdown"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="default">Sort</option>
              <option value="a-z">A - Z</option>
              <option value="month">Month</option>
              <option value="year">Year</option>
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
          
        {sortProjects(projects).map((project) =>  {
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
                      setSelectedProjectId(project.id === selectedProjectId ? null : project.id);
                    }}
                  >
                    {pencilSVG}
                    {selectedProjectId === project.id && (
                      <div className="project-options-dropdown">
                        <div 
                          className="option" 
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingProject(project);
                            setShowForm(true);
                            setSelectedProjectId(null);
                          }}
                        >
                          Edit Project
                        </div>
                        <div 
                          className="option delete-option" 
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteProject(project.id);
                          }}
                        >
                          Delete Project
                        </div>
                      </div>
                    )}
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
                <div className="project-description">
                  <p>{truncateText(project.description)}</p>
                </div>
                
                
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