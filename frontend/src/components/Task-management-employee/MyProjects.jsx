import React from 'react';
import './myprojects.css';

const MyProjects = () => {
  return (
    <div className="my-projects-container">
      <h1 className="projects-title">My Projects</h1>
      
      <div className="filters-container">
        <select className="filter-dropdown">
          <option value="" disabled selected>Sort</option>
          <option value="a-z">A to Z</option>
          <option value="month">Month</option>
          <option value="year">Year</option>
        </select>

        <select className="filter-dropdown">
          <option value="" disabled selected>Status</option>
          <option value="all">All</option>
          <option value="completed">Completed</option>
          <option value="pending">Pending</option>
          <option value="started">Started</option>
        </select>
      </div>
      
      {/* Divider line below filters */}
      <div className="filters-divider"></div>
    </div>
  );
};

export default MyProjects;