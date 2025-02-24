import React, { useState } from 'react';
import './ProjectForm.css';

function ProjectForm({ closeForm, addProject }) {
  const [formData, setFormData] = useState({
    projectname: '',
    department: '',
    description: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    addProject(formData);
  };

  return (
    <div className="form-modal" onClick={closeForm}>
      <div className="form-container" onClick={(e) => e.stopPropagation()}>
        <h1>Create New Project</h1>
        <form onSubmit={handleSubmit}>
          <label htmlFor="projectname">Project Name</label>
          <input type="text" placeholder="Enter Project Name" name="projectname" onChange={handleChange} />

          <label htmlFor="department">Department</label>
          <input type="text" placeholder="Enter Department" name="department" onChange={handleChange} />

          <label htmlFor="Client">Client</label>
          <input type="text" placeholder="Enter Client" name="Client" />

          <label htmlFor="gender">Gender</label>
          <input type="radio" name="gender" />Male
          <input type="radio" name="gender" />Female
          <input type="radio" name="gender" />Other

          <label htmlFor="level">Priority Level</label>
          <select name="level" id="level">
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>

          <label htmlFor="files">Attachments</label>
          <input type="file" name="Attachments" />


          <label htmlFor="description">Description</label>
          <textarea name="description" rows={3} placeholder="Enter description" onChange={handleChange}></textarea>

          <button type="button" onClick={closeForm}>Cancel</button>
          <button type="submit">Create Project</button>
        </form>
      </div>
    </div>
  );
}

export default ProjectForm;
