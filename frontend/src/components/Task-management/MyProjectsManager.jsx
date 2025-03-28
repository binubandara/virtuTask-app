import React, { useState, useEffect } from 'react';
import './MyProjectsManager.css';
import ProjectForm from './ProjectForm';
import ReactDOM from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { useSocket } from "../../context/SocketContext";
import axios from 'axios';

const API_URL = 'http://localhost:5004/api';

const clockSVG = (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor" className="icon icon-tabler icons-tabler-filled icon-tabler-clock">
    <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
    <path d="M17 3.34a10 10 0 1 1 -14.995 8.984l-.005 -.324l.005 -.324a10 10 0 0 1 14.995 -8.336zm-5 2.66a1 1 0 0 0 -.993 .883l-.007 .117v5l.009 .131a1 1 0 0 0 .197 .477l.087 .1l3 3l.094 .082a1 1 0 0 0 1.226 0l.094 -.083l.083 -.094a1 1 0 0 0 0 -1.226l-.083 -.094l-2.707 -2.708v-4.585l-.007 -.117a1 1 0 0 0 -.993 -.883z" />
  </svg>
);

const pencilSVG = (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-6">
    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 9h16.5m-16.5 6.75h16.5" />
  </svg>
);

function MyProjectsManager() {
  const navigate = useNavigate();
  const { socket, connected } = useSocket();
  const [showForm, setShowForm] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [selectedProjectId, setSelectedProjectId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const colorPalette = ["#ffc8dd", "#bde0fe", "#a2d2ff", "#94d2bd","#e0b1cb","#adb5bd","#98f5e1","#f79d65","#858ae3","#c2dfe3","#ffccd5","#e8e8e4","#fdffb6","#f1e8b8","#d8e2dc","#fff0f3","#ccff66"];

  // State for projects from API
  const [projects, setProjects] = useState([]);

  // Fetch projects from API
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('userToken');
        
        
        if (!token) {
          navigate('/login'); // Redirect to login if no token
          return;
        }
        
        const response = await axios.get(`${API_URL}/my-projects`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        console.log(response);
        // Transform API data to match component structure
        const formattedProjects = response.data.map(project => ({
          id: project.project_id,
          projectname: project.name,
          description: project.description,
          startDate: new Date(project.startDate).toISOString().split('T')[0],
          dueDate: new Date(project.dueDate).toISOString().split('T')[0],
          department: project.department,
          priority: project.priority.toLowerCase(),
          members: project.members,
          status: project.status,
          color: getRandomColor()
        }));
        
        setProjects(formattedProjects);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching projects:", err);
        setError("Failed to load projects. Please try again.");
        setLoading(false);
      }
    };

    fetchProjects();
  }, [navigate]);

  // Listen for socket events
  useEffect(() => {
    if (!socket || !connected) return;

    // Handle real-time project updates
    const handleNewProject = (project) => {
      const formattedProject = {
        id: project.project_id,
        projectname: project.name,
        description: project.description,
        startDate: new Date(project.startDate).toISOString().split('T')[0],
        dueDate: new Date(project.dueDate).toISOString().split('T')[0],
        department: project.department,
        priority: project.priority.toLowerCase(),
        members: project.members,
        status: project.status,
        color: getRandomColor()
      };
      
      setProjects(prev => [...prev, formattedProject]);
    };

    const handleUpdatedProject = (project) => {
      setProjects(prev => prev.map(p => 
        p.id === project.project_id 
          ? {
              id: project.project_id,
              projectname: project.name,
              description: project.description,
              startDate: new Date(project.startDate).toISOString().split('T')[0],
              dueDate: new Date(project.dueDate).toISOString().split('T')[0],
              department: project.department,
              priority: project.priority.toLowerCase(),
              members: project.members,
              status: project.status,
              color: p.color // Preserve the existing color
            } 
          : p
      ));
    };

    const handleDeletedProject = (data) => {
      setProjects(prev => prev.filter(p => p.id !== data.project_id));
    };

    // Register socket event listeners
    socket.on('new_project', handleNewProject);
    socket.on('updated_project', handleUpdatedProject);
    socket.on('deleted_project', handleDeletedProject);

    // Clean up on unmount
    return () => {
      socket.off('new_project', handleNewProject);
      socket.off('updated_project', handleUpdatedProject);
      socket.off('deleted_project', handleDeletedProject);
    };
  }, [socket, connected]);

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

  const addProject = async (formData) => {
    try {
      const token = localStorage.getItem('userToken');
      
      // Transform formData to match API expectations
      const projectData = {
        name: formData.projectname,
        description: formData.description,
        startDate: formData.startDate,
        dueDate: formData.dueDate,
        department: formData.department,
        priority: formData.priority.charAt(0).toUpperCase() + formData.priority.slice(1), // Capitalize
        members: formData.members
      };
      
      const response = await axios.post(`${API_URL}/projects`, projectData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Socket should handle adding the project, but in case it doesn't:
      const newProject = {
        id: response.data.project_id,
        projectname: response.data.name,
        description: response.data.description,
        startDate: new Date(response.data.startDate).toISOString().split('T')[0],
        dueDate: new Date(response.data.dueDate).toISOString().split('T')[0],
        department: response.data.department,
        priority: response.data.priority.toLowerCase(),
        members: response.data.members,
        status: response.data.status,
        color: getRandomColor()
      };
      
      setProjects(prev => [...prev, newProject]);
      setShowForm(false);
    } catch (err) {
      console.error("Error creating project:", err);
      alert("Failed to create project. Please try again.");
    }
  };

  const editProject = async (updatedProject) => {
    try {
      const token = localStorage.getItem('userToken');
      console.log("autherized")
      // Transform project data for API
      const projectData = {
        name: updatedProject.projectname,
        description: updatedProject.description,
        startDate: updatedProject.startDate,
        dueDate: updatedProject.dueDate,
        department: updatedProject.department,
        priority: updatedProject.priority.charAt(0).toUpperCase() + updatedProject.priority.slice(1), // Capitalize
        members: updatedProject.members
      };
      
      const res=await axios.patch(`${API_URL}/projects/${updatedProject.id}`, projectData, {
        headers: { Authorization: `Bearer ${token}` }
      
      });
      console.log(res)
      
      // Socket should handle updating the project, but in case it doesn't:
      setProjects(prev => prev.map(p => 
        p.id === updatedProject.id ? updatedProject : p
      ));
      
      setShowForm(false);
      setEditingProject(null);
    } catch (err) {
      console.error("Error updating project:", err);
      alert("Failed to update project. Please try again.");
    }
  };

  const deleteProject = async (projectId) => {
    if (window.confirm('Delete confirmation')) {
      try {
        const token = localStorage.getItem('userToken');
        
        await axios.delete(`${API_URL}/projects/${projectId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        // Socket should handle removing the project, but in case it doesn't:
        setProjects(prev => prev.filter(p => p.id !== projectId));
        setSelectedProjectId(null);
      } catch (err) {
        console.error("Error deleting project:", err);
        alert("Failed to delete project. Please try again.");
      }
    }
  };

  const truncateText = (text, maxLength = 50) => 
    text?.length > maxLength ? `${text.substring(0, maxLength)}...` : text;

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

  if (loading) {
    return <div className="loading-container">Loading projects...</div>;
  }

  if (error) {
    return <div className="error-container">{error}</div>;
  }

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

            
          </div>

          <div className="button-group">
            <button className="add-project" onClick={() => {
              setEditingProject(null);
              setShowForm(true);
            }}>+ Add New Project</button>
          </div>
        </div>

        <div className="project-tiles">
          {projects.length === 0 ? (
            <div className="no-projects-message">
              No projects found. Create a new project to get started!
            </div>
          ) : (
            projects.map((project) => {
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
            })
          )}
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