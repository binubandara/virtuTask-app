import React, { useState, useEffect } from "react";
import { FaPalette, FaCalendarAlt, FaBell, FaLock, FaPowerOff, FaGlobe } from "react-icons/fa";
import "./Settings.css"; // Import the CSS file

const Settings = () => {
  const [darkMode, setDarkMode] = useState(false);

  const [notifications, setNotifications] = useState({
    email: true,
    app: true,
    sound: false,
    taskUpdates: true,
    messages: true,
    reminders: true,
    health: false,
    focusMode: false,
  });

  const [selectedCountry, setSelectedCountry] = useState("");
  const [selectedCity, setSelectedCity] = useState("");
  const [dateFormat, setDateFormat] = useState("MM/DD/YY");
  const [timeFormat, setTimeFormat] = useState("digital");

  const handleNotificationChange = (type) => {
    setNotifications((prev) => ({
      ...prev,
      [type]: !prev[type],
    }));
  };

  // Effect to toggle dark mode on the body
  useEffect(() => {
    if (darkMode) {
      document.body.classList.add("dark-mode");
    } else {
      document.body.classList.remove("dark-mode");
    }
  }, [darkMode]);

  return (
    <div className={`settings-container ${darkMode ? "dark-mode" : ""}`}>
      {/* My Settings Heading */}
      <h1 className={`settings-heading ${darkMode ? "dark-mode" : ""}`}>
        My Settings
      </h1>

      {/* Grid Layout for Setting Boxes */}
      <div className="settings-grid">
        {/* Theme Settings */}
        <div className={`settings-box ${darkMode ? "dark-mode" : ""}`}>
          <h2 className="settings-box-heading">
            <FaPalette /> Theme Settings
          </h2>
          <div className="theme-toggle">
            <span className="theme-label">Light Mode</span>
            <button onClick={() => setDarkMode(!darkMode)} className={`toggle-button ${darkMode ? "dark-mode" : ""}`}>
              <div className={`toggle-switch ${darkMode ? "dark-mode" : ""}`} />
            </button>
            <span className="theme-label">Dark Mode</span>
          </div>
        </div>

        {/* Notifications */}
        <div className={`settings-box ${darkMode ? "dark-mode" : ""}`}>
          <h2 className="settings-box-heading">
            <FaBell /> Notifications Settings
          </h2>
          <div className="notifications-list">
            <label className="notification-item">
              <input type="checkbox" checked={notifications.taskUpdates} onChange={() => handleNotificationChange("taskUpdates")} />
              Task Updates
            </label>
            <label className="notification-item">
              <input type="checkbox" checked={notifications.messages} onChange={() => handleNotificationChange("messages")} />
              Messages
            </label>
            <label className="notification-item">
              <input type="checkbox" checked={notifications.health} onChange={() => handleNotificationChange("health")} />
              Health Notifications
            </label>
            <label className="notification-item">
              <input type="checkbox" checked={notifications.focusMode} onChange={() => handleNotificationChange("focusMode")} />
              Focus Mode Notifications
            </label>
          </div>
        </div>
      </div>

      {/* Second Grid Row */}
      <div className="settings-grid">
        {/* Time Zone Select */}
        <div className={`settings-box ${darkMode ? "dark-mode" : ""}`}>
          <h2 className="settings-box-heading">
            <FaGlobe /> Global Time Zone
          </h2>
          <div className="time-zone-select">
            <label className="select-label">Select Country</label>
            <select className={`select-input ${darkMode ? "dark-mode" : ""}`} value={selectedCountry} onChange={(e) => setSelectedCountry(e.target.value)}>
              <option value="">-- Select Country --</option>
              <option value="Argentina">Argentina</option>
              <option value="Australia">Australia</option>
              <option value="Austria">Austria</option>
            </select>
            <label className="select-label">Select City</label>
            <select className={`select-input ${darkMode ? "dark-mode" : ""}`} value={selectedCity} onChange={(e) => setSelectedCity(e.target.value)} disabled={!selectedCountry}>
              <option value="">-- Select City --</option>
              {selectedCountry === "USA" && (
                <>
                  <option value="New York">New York</option>
                  <option value="Los Angeles">Los Angeles</option>
                  <option value="Chicago">Chicago</option>
                  <option value="San Francisco">San Francisco</option>
                </>
              )}
              {selectedCountry === "UK" && (
                <>
                  <option value="London">London</option>
                  <option value="Manchester">Manchester</option>
                  <option value="Birmingham">Birmingham</option>
                  <option value="Liverpool">Liverpool</option>
                </>
              )}
            </select>
          </div>
        </div>

        {/* Date and Time */}
        <div className={`settings-box ${darkMode ? "dark-mode" : ""}`}>
          <h2 className="settings-box-heading">
            <FaCalendarAlt /> Date & Time Format
          </h2>
          <div className="date-time-format">
            <h3 className="format-heading">Date Format</h3>
            <div className="format-buttons">
              <button onClick={() => setDateFormat("MM/DD/YY")} className={`format-button ${dateFormat === "MM/DD/YY" ? "active" : ""}`}>
                MM/DD/YY
              </button>
              <button onClick={() => setDateFormat("DD/MM/YY")} className={`format-button ${dateFormat === "DD/MM/YY" ? "active" : ""}`}>
                DD/MM/YY
              </button>
            </div>
          </div>
          <div className="date-time-format">
            <h3 className="format-heading">Time Format</h3>
            <div className="format-buttons">
              <button onClick={() => setTimeFormat("digital")} className={`format-button ${timeFormat === "digital" ? "active" : ""}`}>
                Digital
              </button>
              <button onClick={() => setTimeFormat("analog")} className={`format-button ${timeFormat === "analog" ? "active" : ""}`}>
                Analog
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Account Settings */}
      <div className="account-settings">
        <div className={`settings-box ${darkMode ? "dark-mode" : ""}`}>
          <h2 className="settings-box-heading">
            <FaLock /> Account Settings
          </h2>
          <div className="account-buttons">
            <button className="change-password-button">
              Change Password
            </button>
            <button className="logout-button">
              <FaPowerOff /> Log Out
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;