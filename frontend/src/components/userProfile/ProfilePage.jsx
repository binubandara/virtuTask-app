import React, { useState, useEffect } from 'react';
import profilePicDefault from '../../assets/profile.jpg';
import { FaUser, FaEnvelope, FaPhone, FaCalendar, FaMapMarker, FaGlobe, FaVenusMars } from 'react-icons/fa';
import apiClient from '../utils/apiClient';
import './ProfilePage.css';

const ProfilePage = () => {
  const [profilePic, setProfilePic] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    mobile: '',
    email: '',
    address: '',
    country: '',
    city: '',
    gender: '',
  });
  
  // Fetch profile data when component mounts
  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        setLoading(true);
        const response = await apiClient.get('/api/users/profile');
        const { profile, user } = response.data;
        
        setFormData({
          firstName: profile.firstname || '',
          lastName: profile.lastname || '',
          dateOfBirth: profile.dob || '',
          mobile: profile.contact || '',
          email: user.email || '',
          address: profile.address || '',
          country: profile.country || '',
          city: profile.city || '',
          gender: profile.gender || '',
        });
        
        if (profile.profileImage) {
          setProfilePic(profile.profileImage);
        }
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching profile:', err);
        setError('Failed to load profile data');
        setLoading(false);
      }
    };
    
    fetchProfileData();
  }, []);

  const handleFileChange = (e) => {
    setProfilePic(URL.createObjectURL(e.target.files[0]));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Create a FormData object
    const formDataObj = new FormData();
    formDataObj.append('firstname', formData.firstName);
    formDataObj.append('lastname', formData.lastName);
    formDataObj.append('dob', formData.dateOfBirth);
    formDataObj.append('contact', formData.mobile);
    formDataObj.append('address', formData.address);
    formDataObj.append('pcode', formData.country);
    formDataObj.append('city', formData.city);
    formDataObj.append('gender', formData.gender);

    // Append the profile picture if it exists
    if (profilePic && profilePic.startsWith('blob:')) {
      const file = await fetch(profilePic).then((res) => res.blob());
      formDataObj.append('profileImage', file, 'profile.jpg');
    }

    try {
      console.log('Saving profile...');
      const response = await apiClient.post('/api/users/profile', formDataObj, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (!response.data) {
        throw new Error('Failed to save profile');
      }

      console.log('Profile saved:', response.data);
      alert('Profile saved successfully!');
    } catch (error) {
      console.error('Error saving profile:', error);
      alert(`Error saving profile: ${error.message}`);
    }
  };

  // Define the editable fields that should be counted for completion
  const editableFields = [
    'firstName', 
    'lastName', 
    'dateOfBirth', 
    'mobile', 
    // 'email' is excluded since it's read-only
    'address', 
    'country', 
    'city', 
    'gender'
  ];
  
  // Count only the editable fields that have values
  const filledEditableFields = editableFields.filter(field => formData[field] !== '').length;
  const totalEditableFields = editableFields.length;
  const completionPercentage = Math.round((filledEditableFields / totalEditableFields) * 100);

  if (loading) {
    return <div className="loading-spinner">Loading profile data...</div>;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  return (
    <div className="profile-container">
      <h1 className="profile-heading">Edit Profile</h1>

      <div className="profile-section">
        <div className="profile-picture-section">
          <div className="profile-picture-container">
            <div className="profile-picture">
              <img src={profilePic || profilePicDefault} alt="Profile" />
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
            <label htmlFor="profile-pic-upload" className="profile-picture-upload">
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
                    readOnly
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
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
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

            <button type="submit" className="profile-form-button">
              Save
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;