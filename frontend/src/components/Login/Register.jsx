// Register.jsx 
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './Register.module.css';

/* CHANGED THE ORDER AND REMOVED SOME FIELDS */ 
function Register() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    firstname: '',
    lastname: '',
    email: '',
    username: '',
    contact: '',
    address: '',
    pcode: '',
    about: '',
    gender: '',
    dob: ''  
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'radio' && checked ? value : type !== 'radio' ? value : formData[name]
    });
  };

  /* CHANGED THE ORDER AND REMOVED SOME FIELDS */ 
  const handleReset = () => {
    if (window.confirm("Are you sure you want to reset the form?")) {
      setFormData({
        firstname: '',
        lastname: '',
        email: '',
        username: '',
        contact: '',
        address: '',
        pcode: '',
        about: '',
        gender: '',
        dob: ''  
      });
      setError('');
    }
  };

  const handleRegister = async () => {
    // Validation
    for (const key in formData) {
      if (!formData[key] && key !== 'about') {
        setError(`Please fill in the ${key} field.`);
        return;
      }
    }
    
    setLoading(true);
    setError('');
    
    try {
      // Store user data in localStorage for password page
      localStorage.setItem('registerData', JSON.stringify(formData));
      
      // Navigate to password page instead of immediate registration
      navigate('/password');
    } catch (error) {
      setError(error.response?.data?.message || 'Registration failed. Please try again.');
      setLoading(false);
    }
  };

  /* CHANGED THE ORDER AND REMOVED SOME FIELDS */ 
  return (
    <div className={styles.registerBody}>
      <div className={styles.registerContainer}>
        <h1>Register Form</h1>
        {error && <div className={styles.errorMessage}>{error}</div>}
        <form id="registerForm">
          <div className={styles.formColumn}>
            <label htmlFor="firstname">First Name</label>
            <input 
              type="text" 
              placeholder="Enter First Name" 
              name="firstname" 
              value={formData.firstname}
              onChange={handleChange}
            />

            <label htmlFor="lastname">Last Name</label>
            <input 
              type="text" 
              placeholder="Enter Last Name" 
              name="lastname" 
              value={formData.lastname}
              onChange={handleChange}
            />

            <label htmlFor="username">Username</label>
            <input 
              type="text" 
              placeholder="Enter Username" 
              name="username" 
              value={formData.username}
              onChange={handleChange}
            />

            <label htmlFor="email">Email</label>
            <input 
              type="email" 
              placeholder="Enter Email" 
              name="email" 
              value={formData.email}
              onChange={handleChange}
            />

            <label htmlFor="dob">Date of Birth</label>
            <input 
              type="text" 
              placeholder="DD-MM-YYYY" 
              name="dob" 
              value={formData.dob}
              onChange={handleChange}
            />

            <label htmlFor="contact">Contact</label>
            <input 
              type="tel" 
              placeholder="Enter Phone number" 
              name="contact" 
              value={formData.contact}
              onChange={handleChange}
            />

            <label htmlFor="address">Address</label>
            <textarea 
              name="address" 
              placeholder="Enter Address" 
              className={styles.textarea}
              value={formData.address}
              onChange={handleChange}
            ></textarea>

            <label htmlFor="pcode">Postal Code</label>
            <input 
              type="text" 
              placeholder="Enter Postal Code" 
              name="pcode" 
              value={formData.pcode}
              onChange={handleChange}
            />

          <label htmlFor="about">About</label>
            <textarea 
              name="about" 
              placeholder="Enter Description" 
              className={`${styles.textarea} ${styles.aboutTextarea}`}
              value={formData.about}
              onChange={handleChange}
            ></textarea>
          </div>

            <label htmlFor="gender">Gender</label>
            <div className={styles.genderOptions}>
              <label>
                <input 
                  type="radio" 
                  name="gender" 
                  value="Male" 
                  checked={formData.gender === "Male"}
                  onChange={handleChange}
                /> Male
              </label>
              <label>
                <input 
                  type="radio" 
                  name="gender" 
                  value="Female" 
                  checked={formData.gender === "Female"}
                  onChange={handleChange}
                /> Female
              </label>
              <label>
                <input 
                  type="radio" 
                  name="gender" 
                  value="Other" 
                  checked={formData.gender === "Other"}
                  onChange={handleChange}
                /> Other
              </label>
            </div>
            <label htmlFor="attachment">Attachments</label>
            <input type="file" name="resume" />

            <label htmlFor="pic">Professional Picture</label>
            <input type="file" name="Image" />

          <div className={styles.formButtons}>
            <button type="button" onClick={handleReset} className={styles.formBtn}>Reset</button>
            <button 
              type="button" 
              onClick={handleRegister} 
              className={styles.formBtn}
              disabled={loading}
            >
              {loading ? "Processing..." : "Register"}
            </button>
          </div>
          {/*
          <div className={styles.googleRegisterSection}>
            <button type="button" className={styles.formBtn}>Sign Up with Google</button>
          </div>*/}
        </form>
      </div>
    </div>
  );
}

export default Register;