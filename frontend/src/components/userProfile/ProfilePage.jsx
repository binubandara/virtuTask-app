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
  
  // Format date from DD/MM/YYYY to YYYY-MM-DD
  const formatDateForInput = (dateString) => {
    if (!dateString) return '';
    
    // Check if already in YYYY-MM-DD format
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
      return dateString;
    }
    
    // Handle DD/MM/YYYY format
    const parts = dateString.split('/');
    if (parts.length === 3) {
      return `${parts[2]}-${parts[1]}-${parts[0]}`;
    }
    
    return dateString;
  };
  
  // Format date from YYYY-MM-DD to DD/MM/YYYY for submission
  const formatDateForSubmission = (dateString) => {
    if (!dateString) return '';
    
    // Always ensure we're using YYYY-MM-DD format for the API
    const date = new Date(dateString);
    if (!isNaN(date.getTime())) {
      return date.toISOString().split('T')[0]; // Returns YYYY-MM-DD
    }
    
    return dateString;
  };
  
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
          dateOfBirth: formatDateForInput(profile.dob) || '',
          mobile: profile.contact || '',
          email: user.email || '',
          address: profile.address || '',
          country: profile.pcode || '', // Backend uses pcode for country
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
    if (e.target.files && e.target.files[0]) {
      setProfilePic(URL.createObjectURL(e.target.files[0]));
    }
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
    formDataObj.append('dob', formatDateForSubmission(formData.dateOfBirth));
    formDataObj.append('contact', formData.mobile);
    formDataObj.append('address', formData.address);
    formDataObj.append('pcode', formData.country); // Backend expects pcode
    formDataObj.append('city', formData.city);
    formDataObj.append('gender', formData.gender);

    // Append the profile picture if it exists and is a new file (starts with blob:)
    if (profilePic && profilePic.startsWith('blob:')) {
      try {
        const file = await fetch(profilePic).then((res) => res.blob());
        formDataObj.append('profileImage', file, 'profile.jpg');
      } catch (error) {
        console.error('Error preparing image upload:', error);
      }
    }

    try {
      console.log('Saving profile with data:', Object.fromEntries(formDataObj));
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
      alert(`Error saving profile: ${error.message || 'Unknown error'}`);
    }
  };

  const filledFields = Object.values(formData).filter((value) => value !== '').length;
  const totalFields = Object.keys(formData).length;
  const completionPercentage = ((filledFields / totalFields) * 100).toFixed(0);

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
              accept="image/*"
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