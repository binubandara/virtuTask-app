import React, { useState } from 'react';
import './ProjectForm.css';

function ProjectForm({ closeForm, addProject }) {
  const [formData, setFormData] = useState({
    projectname: '',
    department: '',
    description: '',
    picture: ''
  });

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setFormData({
      ...formData,
      [name]: files ? URL.createObjectURL(files[0]) : value // Set image URL for preview
    });
  };

  // ImageUpload component inside ProjectForm
  const ImageUpload = ({ onImageSelect }) => {
    const handleImageChange = (event) => {
      const file = event.target.files[0];
      if (file) {
        const imageUrl = URL.createObjectURL(file);
        onImageSelect(imageUrl);
      }
    };

    return <input type="file" name="picture" accept="image/*" onChange={handleImageChange} />;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    addProject(formData);
  };

  return (
    <div className="form-modal" onClick={closeForm}>
      <div className="form-container" onClick={(e) => e.stopPropagation()}>
        <h1>Form in React</h1>
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

          <label htmlFor="picture">Picture</label>
          {/* Use the ImageUpload component and update formData.picture */}
          <ImageUpload onImageSelect={(imageUrl) => setFormData({ ...formData, picture: imageUrl })} />

          {/* Display selected image */}
          {formData.picture && <img src={formData.picture} alt="Preview" width="200" style={{ marginTop: '10px' }} />}

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
