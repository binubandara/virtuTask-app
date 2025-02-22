import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Register.css';

function Register() {
  const navigate = useNavigate();
  const handleReset = () => {
    document.getElementById("registerForm").reset();
  };

  return (
    <div className="register-body">
      <div className="register-container">
        <h1>Register Form</h1>
        <form id="registerForm">
          <div className="form-row">
            {/* Left Section */}
            <div className="form-column">
              <label htmlFor="firstname">First Name</label>
              <input type="text" placeholder="Enter First Name" name="firstname" />

              <label htmlFor="lastname">Last Name</label>
              <input type="text" placeholder="Enter Last Name" name="lastname" />

              <label htmlFor="email">Email</label>
              <input type="email" placeholder="Enter Email" name="email" />

              <label htmlFor="contact">Contact</label>
              <input type="text" placeholder="Enter Phone number" name="contact" />

              <label htmlFor="dob">Date of Birth</label>
              <input type="text" placeholder="DD-MM-YYYY" name="dob" />

              <label htmlFor="gender">Gender</label>
              <div className="gender-options">
                <label><input type="radio" name="gender" value="Male" /> Male</label>
                <label><input type="radio" name="gender" value="Female" /> Female</label>
                <label><input type="radio" name="gender" value="Other" /> Other</label>
              </div>
            </div>

            {/* Right Section */}
            <div className="form-column">
              <div className="input-row">
                <div className="input-half">
                  <label htmlFor="address">Address</label>
                  <textarea name="address" placeholder="Enter Address" className="textarea"></textarea>
                </div>
                <div className="input-half">
                  <label htmlFor="pcode">Postal Code</label>
                  <input type="text" placeholder="Enter Postal Code" name="pcode" />
                </div>
              </div>

              <div className="input-row">
                <div className="input-half">
                  <label htmlFor="role">Role</label>
                  <select name="role">
                    <option value="employee">Employee</option>
                    <option value="manager">Manager</option>
                    <option value="cbo">CBO</option>
                  </select>
                </div>
                <div className="input-half">
                  <label htmlFor="attachment">Attachments</label>
                  <input type="file" name="resume" />
                </div>
              </div>

              <label htmlFor="pic">Professional Picture</label>
              <input type="file" name="Image" />

              <label htmlFor="about">About</label>
              <textarea name="about" placeholder="Enter Description" className="textarea about-textarea"></textarea>
            </div>
          </div>

          {/* Buttons Section */}
          <div className="form-buttons">
            <button type="button" onClick={handleReset} className="form-btn">Reset</button>
            <button type="button" onClick={() => navigate('/password')} className="form-btn">Register</button>
          </div>

          {/* Google Signup Section (Aligned with Register Button) */}
          <div className="google-register-section">
            <button type="button" className="form-btn google-signup">Sign Up with Google</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Register;
