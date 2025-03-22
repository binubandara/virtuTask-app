// Login.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./Login.module.css";
import axios from "../axiosConfig"; // Import the configured axios

function Login() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: "",
    password: ""
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    
    try {
      const response = await axios.post('/api/auth/login', {
        username: formData.username,
        password: formData.password
      });
      
      // Store token in localStorage
      localStorage.setItem('userToken', response.data.token);
      localStorage.setItem('userData', JSON.stringify(response.data));
      
      // Redirect to dashboard or home page
      navigate('/dashboard');
    } catch (error) {
      setError(error.response?.data?.message || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.leftSection}>
        <img src="/5790570.jpg" alt="Background" />
        <div className={styles.leftContent}>
          <h1>Welcome Back !</h1>
          <p>Sign in to continue to your account</p>
        </div>
      </div>

      <div className={styles.rightSection}>
        <div className={styles.loginBox}>
          <h2>Login</h2>
          <p className={styles.loginSubtext}>Enter your credentials to access your account</p>
          
          {error && <div className={styles.errorMessage}>{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className={styles.inputContainer}>
              <input 
                type="text" 
                placeholder="Username or Email" 
                className={styles.inputLine} 
                name="username"
                value={formData.username}
                onChange={handleChange}
                required
              />
            </div>
            <div className={styles.inputContainer}>
              <input 
                type="password" 
                placeholder="Password" 
                className={styles.inputLine} 
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>

            <div className={styles.loginOptions}>
              <label className={styles.rememberMe}>
                <input type="checkbox" />
                Remember me
              </label>
              <a href="#" className={styles.forgotPassword}>Forgot Password?</a>
            </div>

            <button 
              type="submit" 
              className={styles.loginBtn}
              disabled={loading}
            >
              {loading ? "Logging in..." : "Login"}
            </button>
          </form>
          
          <button 
            className={styles.registerBtn} 
            onClick={() => navigate("/register")}
          >
            Register
          </button>

        {/*
          <div className={styles.orDivider}>
            <hr /><span>OR</span><hr />
          </div>

          <button className={styles.googleBtn}>
            Sign in with Google
          </button>*/}
        </div>
      </div>
    </div>
  );
}

export default Login;