import React, { useState, useEffect } from "react";
import { FaPalette, FaCalendarAlt, FaBell, FaLock, FaPowerOff, FaGlobe, FaShieldAlt } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import "./Settings.css";

const Settings = () => {
  const [darkMode, setDarkMode] = useState(false);
  const navigate = useNavigate();

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

  const handleNavigateToPrivacy = () => {
    navigate("/settings/privacy");
  };

  // Handle logout
  const handleLogout = () => {
    
    localStorage.removeItem("authToken"); 

    // Redirect to the login page
    navigate("/login");
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
              <option value="Bangladesh">Bangladesh</option>
              <option value="Belgium">Belgium</option>
              <option value="Brazil">Brazil</option>
              <option value="Canada">Canada</option>
              <option value="Chile">Chile</option>
              <option value="China">China</option>
              <option value="Colombia">Colombia</option>
              <option value="Czech Republic">Czech Republic</option>
              <option value="Denmark">Denmark</option>
              <option value="Egypt">Egypt</option>
              <option value="Finland">Finland</option>
              <option value="France">France</option>
              <option value="Germany">Germany</option>
              <option value="Greece">Greece</option>
              <option value="Hungary">Hungary</option>
              <option value="India">India</option>
              <option value="Indonesia">Indonesia</option>
              <option value="Ireland">Ireland</option>
              <option value="Italy">Italy</option>
              <option value="Japan">Japan</option>
              <option value="Kenya">Kenya</option>
              <option value="Malaysia">Malaysia</option>
              <option value="Mexico">Mexico</option>
              <option value="Netherlands">Netherlands</option>
              <option value="New Zealand">New Zealand</option>
              <option value="Nigeria">Nigeria</option>
              <option value="Norway">Norway</option>
              <option value="Pakistan">Pakistan</option>
              <option value="Peru">Peru</option>
              <option value="Philippines">Philippines</option>
              <option value="Poland">Poland</option>
              <option value="Portugal">Portugal</option>
              <option value="Romania">Romania</option>
              <option value="Russia">Russia</option>
              <option value="Sri Lanka">Sri Lanka</option>
              <option value="Saudi Arabia">Saudi Arabia</option>
              <option value="Singapore">Singapore</option>
              <option value="South Africa">South Africa</option>
              <option value="South Korea">South Korea</option>
              <option value="Spain">Spain</option>
              <option value="Sweden">Sweden</option>
              <option value="Switzerland">Switzerland</option>
              <option value="Thailand">Thailand</option>
              <option value="Turkey">Turkey</option>
              <option value="United Arab Emirates">United Arab Emirates</option>
              <option value="United Kingdom">United Kingdom</option>
              <option value="USA">United States</option>
              <option value="Vietnam">Vietnam</option>
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

{selectedCountry === "Australia" && (
              <>
                <option value="Sydney">Sydney</option>
                <option value="Melbourne">Melbourne</option>
                <option value="Brisbane">Brisbane</option>
                <option value="Perth">Perth</option>
              </>
            )}
            {selectedCountry === "India" && (
              <>
                <option value="Delhi">Delhi</option>
                <option value="Mumbai">Mumbai</option>
                <option value="Bangalore">Bangalore</option>
                <option value="Kolkata">Kolkata</option>
              </>
            )}
            {selectedCountry === "Argentina" && (
              <>
                <option value="Buenos Aires">Buenos Aires</option>
                <option value="Cordoba">Cordoba</option>
                <option value="Rosario">Rosario</option>
              </>
            )}
            {selectedCountry === "Belgium" && (
              <>
                <option value="Brussels">Brussels</option>
                <option value="Antwerp">Antwerp</option>
                <option value="Ghent">Ghent</option>
              </>
            )}
            {selectedCountry === "Brazil" && (
              <>
                <option value="Rio de Janeiro">Rio de Janeiro</option>
                <option value="São Paulo">São Paulo</option>
                <option value="Brasília">Brasília</option>
              </>
            )}
            {selectedCountry === "Canada" && (
              <>
                <option value="Toronto">Toronto</option>
                <option value="Vancouver">Vancouver</option>
                <option value="Montreal">Montreal</option>
              </>
            )}
            {selectedCountry === "Chile" && (
              <>
                <option value="Santiago">Santiago</option>
                <option value="Valparaíso">Valparaíso</option>
                <option value="Concepción">Concepción</option>
              </>
            )}
            {selectedCountry === "China" && (
              <>
                <option value="Beijing">Beijing</option>
                <option value="Shanghai">Shanghai</option>
                <option value="Shenzhen">Shenzhen</option>
              </>
            )}
            {selectedCountry === "Colombia" && (
              <>
                <option value="Bogotá">Bogotá</option>
                <option value="Medellín">Medellín</option>
                <option value="Cali">Cali</option>
              </>
            )}
            {selectedCountry === "Czech Republic" && (
              <>
                <option value="Prague">Prague</option>
                <option value="Brno">Brno</option>
                <option value="Ostrava">Ostrava</option>
              </>
            )}
            {selectedCountry === "Denmark" && (
              <>
                <option value="Copenhagen">Copenhagen</option>
                <option value="Aarhus">Aarhus</option>
                <option value="Odense">Odense</option>
              </>
            )}
            {selectedCountry === "Egypt" && (
              <>
                <option value="Cairo">Cairo</option>
                <option value="Alexandria">Alexandria</option>
                <option value="Giza">Giza</option>
              </>
            )}
            {selectedCountry === "Finland" && (
              <>
                <option value="Helsinki">Helsinki</option>
                <option value="Espoo">Espoo</option>
                <option value="Tampere">Tampere</option>
              </>
            )}
            {selectedCountry === "France" && (
              <>
                <option value="Paris">Paris</option>
                <option value="Marseille">Marseille</option>
                <option value="Lyon">Lyon</option>
              </>
            )}
            {selectedCountry === "Germany" && (
              <>
                <option value="Berlin">Berlin</option>
                <option value="Munich">Munich</option>
                <option value="Hamburg">Hamburg</option>
              </>
            )}
            {selectedCountry === "Greece" && (
              <>
                <option value="Athens">Athens</option>
                <option value="Thessaloniki">Thessaloniki</option>
                <option value="Patras">Patras</option>
              </>
            )}
            {selectedCountry === "Hungary" && (
              <>
                <option value="Budapest">Budapest</option>
                <option value="Debrecen">Debrecen</option>
                <option value="Szeged">Szeged</option>
              </>
            )}
            {selectedCountry === "Indonesia" && (
              <>
                <option value="Jakarta">Jakarta</option>
                <option value="Surabaya">Surabaya</option>
                <option value="Bandung">Bandung</option>
              </>
            )}
            {selectedCountry === "Ireland" && (
              <>
                <option value="Dublin">Dublin</option>
                <option value="Cork">Cork</option>
                <option value="Limerick">Limerick</option>
              </>
            )}
            {selectedCountry === "Italy" && (
              <>
                <option value="Rome">Rome</option>
                <option value="Milan">Milan</option>
                <option value="Naples">Naples</option>
              </>
            )}
            {selectedCountry === "Japan" && (
              <>
                <option value="Tokyo">Tokyo</option>
                <option value="Osaka">Osaka</option>
                <option value="Kyoto">Kyoto</option>
              </>
            )}
            {selectedCountry === "Kenya" && (
              <>
                <option value="Nairobi">Nairobi</option>
                <option value="Mombasa">Mombasa</option>
                <option value="Kisumu">Kisumu</option>
              </>
            )}
            {selectedCountry === "Malaysia" && (
              <>
                <option value="Kuala Lumpur">Kuala Lumpur</option>
                <option value="George Town">George Town</option>
                <option value="Johor Bahru">Johor Bahru</option>
              </>
            )}
            {selectedCountry === "Mexico" && (
              <>
                <option value="Mexico City">Mexico City</option>
                <option value="Guadalajara">Guadalajara</option>
                <option value="Monterrey">Monterrey</option>
              </>
            )}
            {selectedCountry === "Netherlands" && (
              <>
                <option value="Amsterdam">Amsterdam</option>
                <option value="Rotterdam">Rotterdam</option>
                <option value="The Hague">The Hague</option>
              </>
            )}
            {selectedCountry === "New Zealand" && (
              <>
                <option value="Auckland">Auckland</option>
                <option value="Wellington">Wellington</option>
                <option value="Christchurch">Christchurch</option>
              </>
            )}
            {selectedCountry === "Nigeria" && (
              <>
                <option value="Lagos">Lagos</option>
                <option value="Abuja">Abuja</option>
                <option value="Kano">Kano</option>
              </>
            )}
            {selectedCountry === "Norway" && (
              <>
                <option value="Oslo">Oslo</option>
                <option value="Bergen">Bergen</option>
                <option value="Stavanger">Stavanger</option>
              </>
            )}
            {selectedCountry === "Pakistan" && (
              <>
                <option value="Karachi">Karachi</option>
                <option value="Lahore">Lahore</option>
                <option value="Islamabad">Islamabad</option>
              </>
            )}
            {selectedCountry === "Peru" && (
              <>
                <option value="Lima">Lima</option>
                <option value="Arequipa">Arequipa</option>
                <option value="Cusco">Cusco</option>
              </>
            )}
            {selectedCountry === "Philippines" && (
              <>
                <option value="Manila">Manila</option>
                <option value="Cebu">Cebu</option>
                <option value="Davao">Davao</option>
              </>
            )}
            {selectedCountry === "Poland" && (
              <>
                <option value="Warsaw">Warsaw</option>
                <option value="Kraków">Kraków</option>
                <option value="Wrocław">Wrocław</option>
              </>
            )}
            {selectedCountry === "Portugal" && (
              <>
                <option value="Lisbon">Lisbon</option>
                <option value="Porto">Porto</option>
                <option value="Amadora">Amadora</option>
              </>
            )}
            {selectedCountry === "Romania" && (
              <>
                <option value="Bucharest">Bucharest</option>
                <option value="Cluj-Napoca">Cluj-Napoca</option>
                <option value="Timișoara">Timișoara</option>
              </>
            )}
            {selectedCountry === "Russia" && (
              <>
                <option value="Moscow">Moscow</option>
                <option value="Saint Petersburg">Saint Petersburg</option>
                <option value="Novosibirsk">Novosibirsk</option>
              </>
            )}
            {selectedCountry === "Sri Lanka" && (
              <>
                <option value="Colombo">Colombo</option>
                <option value="Kandy">Kandy</option>
                <option value="Galle">Galle</option>
              </>
            )}
            {selectedCountry === "Saudi Arabia" && (
              <>
                <option value="Riyadh">Riyadh</option>
                <option value="Jeddah">Jeddah</option>
                <option value="Mecca">Mecca</option>
              </>
            )}
            {selectedCountry === "Singapore" && (
              <>
                <option value="Singapore">Singapore</option>
              </>
            )}
            {selectedCountry === "South Africa" && (
              <>
                <option value="Cape Town">Cape Town</option>
                <option value="Johannesburg">Johannesburg</option>
                <option value="Durban">Durban</option>
              </>
            )}
            {selectedCountry === "South Korea" && (
              <>
                <option value="Seoul">Seoul</option>
                <option value="Busan">Busan</option>
                <option value="Incheon">Incheon</option>
              </>
            )}
            {selectedCountry === "Spain" && (
              <>
                <option value="Madrid">Madrid</option>
                <option value="Barcelona">Barcelona</option>
                <option value="Valencia">Valencia</option>
              </>
            )}
            {selectedCountry === "Sweden" && (
              <>
                <option value="Stockholm">Stockholm</option>
                <option value="Gothenburg">Gothenburg</option>
                <option value="Malmö">Malmö</option>
              </>
            )}
            {selectedCountry === "Switzerland" && (
              <>
                <option value="Zurich">Zurich</option>
                <option value="Geneva">Geneva</option>
                <option value="Bern">Bern</option>
              </>
            )}
            {selectedCountry === "Thailand" && (
              <>
                <option value="Bangkok">Bangkok</option>
                <option value="Chiang Mai">Chiang Mai</option>
                <option value="Phuket">Phuket</option>
              </>
            )}
            {selectedCountry === "Turkey" && (
              <>
                <option value="Istanbul">Istanbul</option>
                <option value="Ankara">Ankara</option>
                <option value="Izmir">Izmir</option>
              </>
            )}
            {selectedCountry === "United Arab Emirates" && (
              <>
                <option value="Dubai">Dubai</option>
                <option value="Abu Dhabi">Abu Dhabi</option>
                <option value="Sharjah">Sharjah</option>
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

      {/* Privacy Settings Box */}
      <div className="settings-grid">
        <div className={`settings-box ${darkMode ? "dark-mode" : ""}`}>
          <h2 className="settings-box-heading">
            <FaShieldAlt /> Privacy & Data
          </h2>
          <p className="privacy-description">
            Manage your privacy settings, data collection preferences, and consent options.
          </p>
          <button 
            className="privacy-settings-button"
            onClick={handleNavigateToPrivacy}
          >
            Privacy Settings
          </button>
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
            <button className="logout-button" onClick={handleLogout}>
              <FaPowerOff /> Log Out
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;