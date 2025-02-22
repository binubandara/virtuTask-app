import React from "react";
import { useNavigate } from "react-router-dom";
import "./Password.css";

function Password() {
  const navigate = useNavigate();

  return (
    <div className="container">
      <div className="left-section">
      <img src="/login-left.jpg" alt="Background" style={{ width: "100%", height: "100vh", objectFit: "cover" }} />
        <div className="left-content">
          <h1>Secure Your Account</h1>
          <p>Set a password to protect your account</p>
        </div>
      </div>

      <div className="right-section">
        <div className="password-box">
          <h2>Confirm</h2>

          <div className="input-container">
            <input type="password" placeholder="Enter Password" className="input-line" />
          </div>
          <div className="input-container">
            <input type="password" placeholder="Retype Password" className="input-line" />
          </div>

          <button className="button selected">Confirm Password</button>

          {/* Fix: Use navigate to move to Login page */}
          <button className="button" onClick={() => navigate("/")}>
            Login
          </button>
        </div>
      </div>
    </div>
  );
}

export default Password;
