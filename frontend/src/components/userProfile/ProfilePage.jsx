import React, { useState } from 'react';
import profilePicDefault from '../../assets/profile.jpg';
import { FaUser, FaEnvelope, FaPhone, FaCalendar, FaMapMarker, FaGlobe, FaVenusMars } from 'react-icons/fa'; 
import './ProfilePage.css'; 

const ProfilePage = () => {
  const [profilePic, setProfilePic] = useState(null);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    mobile: '',
    email: '',
    address: '',
    country: '',
    city: '',
    gender: ''
  });

  const handleFileChange = (e) => {
    setProfilePic(URL.createObjectURL(e.target.files[0]));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
  };

  const filledFields = Object.values(formData).filter((value) => value !== '').length;
  const totalFields = Object.keys(formData).length;
  const completionPercentage = ((filledFields / totalFields) * 100).toFixed(0);

  return (
    <div className="profile-container">
      <h1 className="profile-heading">
        Edit Profile
      </h1>

      <div className="profile-section">
        <div className="profile-picture-section">
          <div className="profile-picture-container">
            <div className="profile-picture">
              <img
                src={profilePic || profilePicDefault}
                alt="Profile"
              />
              <div className="profile-picture-overlay">
                <span>Change Photo</span>
              </div>
            </div>
            <input
              type="file"
              onChange={handleFileChange}
              className="hidden"
              id="profile-pic-upload"
            />
            <label
              htmlFor="profile-pic-upload"
              className="profile-picture-upload"
            >
              Upload Photo
            </label>
          </div>
        </div>

        <div className="profile-form-section">
          <div className="profile-completion">
            <div className="profile-completion-label">
              <span>Profile Completion</span>
              <span className="profile-completion-percentage">{completionPercentage}%</span>
            </div>
            <div className="profile-completion-bar">
              <div
                className="profile-completion-progress"
                style={{ width: `${completionPercentage}%` }}
              ></div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="profile-form">
            <div className="profile-form-grid">
              <div className="profile-form-field">
                <label className="profile-form-label">First Name</label>
                <div className="relative">
                  <FaUser className="profile-form-icon" />
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    className="profile-form-input"
                  />
                </div>
              </div>
              <div className="profile-form-field">
                <label className="profile-form-label">Last Name</label>
                <div className="relative">
                  <FaUser className="profile-form-icon" />
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    className="profile-form-input"
                  />
                </div>
              </div>
            </div>

            <div className="profile-form-grid">
              <div className="profile-form-field">
                <label className="profile-form-label">Date of Birth</label>
                <div className="relative">
                  <FaCalendar className="profile-form-icon" />
                  <input
                    type="date"
                    name="dateOfBirth"
                    value={formData.dateOfBirth}
                    onChange={handleChange}
                    className="profile-form-input"
                  />
                </div>
              </div>
              <div className="profile-form-field">
                <label className="profile-form-label">Mobile</label>
                <div className="relative">
                  <FaPhone className="profile-form-icon" />
                  <input
                    type="text"
                    name="mobile"
                    value={formData.mobile}
                    onChange={handleChange}
                    className="profile-form-input"
                  />
                </div>
              </div>
            </div>

            <div className="profile-form-grid">
              <div className="profile-form-field">
                <label className="profile-form-label">Email</label>
                <div className="relative">
                  <FaEnvelope className="profile-form-icon" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="profile-form-input"
                  />
                </div>
              </div>
              <div className="profile-form-field">
                <label className="profile-form-label">Gender</label>
                <div className="relative">
                  <FaVenusMars className="profile-form-icon" />
                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                    className="profile-form-input"
                  >
                    <option value="">Select</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="profile-form-field">
              <label className="profile-form-label">Address</label>
              <div className="relative">
                <FaMapMarker className="profile-form-icon" />
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  className="profile-form-input"
                />
              </div>
            </div>

            <div className="profile-form-grid">
              <div className="profile-form-field">
                <label className="profile-form-label">Country</label>
                <div className="relative">
                  <FaGlobe className="profile-form-icon" />
                  <input
                    type="text"
                    name="country"
                    value={formData.country}
                    onChange={handleChange}
                    className="profile-form-input"
                  />
                </div>
              </div>
              <div className="profile-form-field">
                <label className="profile-form-label">City</label>
                <div className="relative">
                  <FaMapMarker className="profile-form-icon" />
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    className="profile-form-input"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="profile-form-button"
            >
              Save
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;