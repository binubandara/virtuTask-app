// Password.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./Password.module.css";
import axios from "../axiosConfig";

function Password() {
  const navigate = useNavigate();
  const [passwords, setPasswords] = useState({
    password: "",
    confirmPassword: ""
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [registerData, setRegisterData] = useState(null);

  useEffect(() => {
    // Get registration data from localStorage
    const data = localStorage.getItem("registerData");
    if (!data) {
      // Redirect if no registration data found
      navigate("/register");
      return;
    }
    setRegisterData(JSON.parse(data));
  }, [navigate]);

  const handleChange = (e) => {
    setPasswords({
      ...passwords,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Password validation
    if (passwords.password !== passwords.confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    
    if (passwords.password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }
    
    if (!registerData) {
      setError("Registration data not found");
      return;
    }
    
    setLoading(true);
    
    try {
      // Prepare data for API - Set a default role since it's no longer collected in the form
      const userData = {
        username: registerData.username,
        email: registerData.email,
        password: passwords.password,
        role: "user" // Default to 'user' role since it's required by the backend
      };
      
      console.log("Sending registration data:", userData);
      
      // Make API call to register user
      const response = await axios.post("/api/auth/register", userData);
      
      // Clear localStorage
      localStorage.removeItem("registerData");
      
      // Store extended user data in a different collection
      try {
        // Create extended profile
        await axios.post("/api/users/profile", {
          userId: response.data._id,
          firstname: registerData.firstname,
          lastname: registerData.lastname,
          contact: registerData.contact,
          dob: registerData.dob,
          gender: registerData.gender,
          address: registerData.address,
          pcode: registerData.pcode,
          about: registerData.about || "" // Make sure about is at least an empty string
        }, {
          headers: {
            'Authorization': `Bearer ${response.data.token}`
          }
        });
      } catch (profileError) {
        console.error("Error saving profile data:", profileError);
        // Continue anyway since the user account was created
      }
      
      // Store token
      localStorage.setItem("userToken", response.data.token);
      localStorage.setItem("userData", JSON.stringify(response.data));
      
      // Redirect to dashboard
      navigate("/dashboard");
    } catch (error) {
      console.error("Registration error:", error);
      setError(error.response?.data?.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.leftSection}>
        <img src="/5790570.jpg" alt="Background" />
        <div className={styles.leftContent}>
          <h1>Secure Your Account</h1>
          <p>Set a password to protect your account</p>
        </div>
      </div>

      <div className={styles.rightSection}>
        <div className={styles.passwordBox}>
          <h2>Confirm</h2>
          
          {error && <div className={styles.errorMessage}>{error}</div>}
          
          <form onSubmit={handleSubmit}>
            <div className={styles.inputContainer}>
              <input 
                type="password" 
                placeholder="Enter Password" 
                className={styles.inputLine} 
                name="password"
                value={passwords.password}
                onChange={handleChange}
                required
              />
            </div>
            <div className={styles.inputContainer}>
              <input 
                type="password" 
                placeholder="Retype Password" 
                className={styles.inputLine} 
                name="confirmPassword"
                value={passwords.confirmPassword}
                onChange={handleChange}
                required
              />
            </div>

            <button 
              type="submit" 
              className={styles.buttonSelected}
              disabled={loading}
            >
              {loading ? "Processing..." : "Confirm Password"}
            </button>
          </form>
          
          <button className={styles.button} onClick={() => navigate("/")}>
            Login
          </button>
        </div>
      </div>
    </div>
  );
}

export default Password;