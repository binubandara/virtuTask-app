import React, { useEffect, useState } from 'react';
import '../Task-management/MyProjectsManager.css';
import { useNavigate } from 'react-router-dom';

const clockSVG = (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor" className="icon icon-tabler icons-tabler-filled icon-tabler-clock">
    <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
    <path d="M17 3.34a10 10 0 1 1 -14.995 8.984l-.005 -.324l.005 -.324a10 10 0 0 1 14.995 -8.336zm-5 2.66a1 1 0 0 0 -.993 .883l-.007 .117v5l.009 .131a1 1 0 0 0 .197 .477l.087 .1l3 3l.094 .082a1 1 0 0 0 1.226 0l.094 -.083l.083 -.094a1 1 0 0 0 0 -1.226l-.083 -.094l-2.707 -2.708v-4.585l-.007 -.117a1 1 0 0 0 -.993 -.883z" />
  </svg>
);

const MyProjects = () => {
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
    const [sortBy, setSortBy] = useState('default'); // Add this line
  
    
  

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


  // Load from same localStorage key
  useEffect(() => {
    const interval = setInterval(() => {
      const saved = localStorage.getItem('projects');
      if (saved) setProjects(JSON.parse(saved));
    }, 500);
    return () => clearInterval(interval);
  }, []);
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

  const truncateText = (text, maxLength = 50) => 
    text.length > maxLength ? `${text.substring(0, maxLength)}...` : text;

  const userProjects = projects
  .filter(project => project.members?.includes('Tharindy123'))
  .map(project => ({
    ...project,
    tasks: (project.tasks || []).filter(task =>
      task.assignee?.split(',')
        .map(a => a.trim())
        .includes('Tharindy123')
    )
  }));

  console.log('Filtered tasks:', userProjects[0]?.tasks);

  
  

  return (
    <div className="project-manager-container">
      <h1 className="title">My Projects</h1>
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
      </div>


      {/* Use EXACTLY the same project-tiles structure */}
      <div className="project-tiles">
      {sortProjects(projects).map((project) => {
          const dueDisplay = getDueDateDisplay(project.dueDate);
          return (
            <div 
              className="project-tile" 
              key={project.id}
              onClick={() => navigate(`/task-manager/${project.id}`, { 
                state: { fromMyProjects: true } 
              })}
            >
              {/* Keep identical tile structure */}
              <div className="tile-content">
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
  );
};

export default MyProjects;