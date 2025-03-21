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
<<<<<<< Updated upstream
    <div className={styles.registerBody}>
      <div className={styles.registerContainer}>
=======
    <div className="register-body">
      <div className="register-container">
        
<<<<<<< Updated upstream
<<<<<<< Updated upstream
>>>>>>> Stashed changes
=======
>>>>>>> Stashed changes
=======
>>>>>>> Stashed changes
        <h1>Register Form</h1>
        {error && <div className={styles.errorMessage}>{error}</div>}
        <form id="registerForm">
<<<<<<< Updated upstream
<<<<<<< Updated upstream
<<<<<<< Updated upstream
          <div className={styles.formColumn}>
=======
          <div className="register-form-column">
>>>>>>> Stashed changes
=======
          <div className="register-form-column">
>>>>>>> Stashed changes
=======
          <div className="register-form-column">
>>>>>>> Stashed changes
            <label htmlFor="firstname">First Name</label>
            <input 
              type="text" 
              placeholder="Enter First Name" 
              name="firstname" 
              value={formData.firstname}
              onChange={handleChange}
            />

            <label htmlFor="lastname">Last Name</label>
<<<<<<< Updated upstream
            <input 
              type="text" 
              placeholder="Enter Last Name" 
              name="lastname" 
              value={formData.lastname}
              onChange={handleChange}
            />
=======
            <input type="text" placeholder="Enter Last Name" name="lastname" />

            <label htmlFor="email">Email</label>
            <input type="email" placeholder="Enter Email" name="email" />
<<<<<<< Updated upstream
=======

            <label htmlFor="username">Username</label>
            <input type="text" placeholder="Enter Username" name="username" />

            <label htmlFor="password">Password</label>
            <input type="text" placeholder="Enter Password" name="username" />

            <label htmlFor="password">Confirm Password</label>
            <input type="text" placeholder="Confirm Password" name="password" />
>>>>>>> Stashed changes

            <label htmlFor="username">Username</label>
            <input type="text" placeholder="Enter Username" name="username" />
>>>>>>> Stashed changes

            <label htmlFor="password">Password</label>
            <input type="text" placeholder="Enter Password" name="username" />

            <label htmlFor="password">Confirm Password</label>
            <input type="text" placeholder="Confirm Password" name="password" />

            <label htmlFor="username">Username</label>
            <input 
              type="text" 
              placeholder="Enter Username" 
              name="username" 
              value={formData.username}
              onChange={handleChange}
            />

<<<<<<< Updated upstream
            <label htmlFor="email">Email</label>
            <input 
              type="email" 
              placeholder="Enter Email" 
              name="email" 
              value={formData.email}
              onChange={handleChange}
            />
=======
            <label htmlFor="password">Password</label>
            <input type="text" placeholder="Enter Password" name="username" />

            <label htmlFor="password">Confirm Password</label>
            <input type="text" placeholder="Confirm Password" name="password" />

            <label htmlFor="contact">Contact</label>
            <input type="tel" placeholder="Enter Phone number" name="contact" />
>>>>>>> Stashed changes

            <label htmlFor="dob">Date of Birth</label>
            <input 
              type="text" 
              placeholder="DD-MM-YYYY" 
              name="dob" 
              value={formData.dob}
              onChange={handleChange}
            />

<<<<<<< Updated upstream
            <label htmlFor="contact">Contact</label>
            <input 
              type="tel" 
              placeholder="Enter Phone number" 
              name="contact" 
              value={formData.contact}
              onChange={handleChange}
            />
=======
            <label htmlFor="gender">Gender</label>
            <div className="register-gender-options">
              <label><input type="radio" name="gender" value="Male" /> Male</label>
              <label><input type="radio" name="gender" value="Female" /> Female</label>
              <label><input type="radio" name="gender" value="Other" /> Other</label>
            </div>
>>>>>>> Stashed changes

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

<<<<<<< Updated upstream
<<<<<<< Updated upstream
<<<<<<< Updated upstream
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
=======
>>>>>>> Stashed changes
=======
>>>>>>> Stashed changes
=======
>>>>>>> Stashed changes
            <label htmlFor="attachment">Attachments</label>
            <input type="file" name="resume" />

            <label htmlFor="pic">Professional Picture</label>
            <input type="file" name="Image" />

<<<<<<< Updated upstream
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
=======
            <label htmlFor="about">About</label>
            <textarea name="about" placeholder="Enter Description" className="register-textarea about-textarea"></textarea>
          </div>

          <div className="register-form-buttons">
            <button type="button" onClick={handleReset} className="register-form-btn">Reset</button>
            <button type="button" onClick={handleRegister} className="register-form-btn">Register</button>
<<<<<<< Updated upstream
<<<<<<< Updated upstream
>>>>>>> Stashed changes
=======
>>>>>>> Stashed changes
=======
>>>>>>> Stashed changes
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