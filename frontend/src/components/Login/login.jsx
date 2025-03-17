import React from "react";
import { useNavigate } from "react-router-dom";
import "./Login.css";

function Login() {
  const navigate = useNavigate();

  return (
    <div className="container">
      {/* Left Section */}
      <div className="left-section">
        {/* TEST: Add Image Directly */}
        <img src="/login-left.jpg" alt="Login Background" style={{ width: "100%", height: "100vh", objectFit: "cover" }} />

        <div className="left-content">
          <h1>Streamline your remote work</h1>
          <p>Start for free and experience smarter, more connected work......</p>
        </div>
      </div>

      {/* Right Section */}
      <div className="right-section">
        <div className="login-box">
          <h2>Login</h2>
          <p className="login-subtext">Welcome back! Please enter your details.</p>

          <div className="input-container">
            <input type="email" placeholder="Email" className="input-line" />
          </div>
          <div className="input-container">
            <input type="password" placeholder="Password" className="input-line" />
          </div>

          <div className="login-options">
            <label>
              <input type="checkbox" /> Remember me for 30 days
            </label>
            <a href="#" className="forgot-password">Forgot Password?</a>
          </div>

          <button className="button selected">Log in</button>

          {/* Fix: Use navigate to move to Register */}
          <button className="button" onClick={() => navigate("/register")}>
            Register
          </button>

          <div className="or-divider">
            <hr /> <span>OR</span> <hr />
          </div>

          <button className="google-btn">Sign in with Google</button>
        </div>
      </div>
    </div>
  );
}

export default Login;

