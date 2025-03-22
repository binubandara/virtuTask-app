import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import PanePage from './components/pane/PanePage';
import PrivacyConsentDialog from './components/PrivacyConsentDialog';
import { AuthProvider } from './context/AuthContext';
// Import auth components
import Login from './components/Login/login';
import Register from './components/Login/Register';
import Password from './components/Login/Password';

function App() {
  const [hasConsent, setHasConsent] = useState(false);
  
  const handleConsent = (consentGiven) => {
    setHasConsent(consentGiven);
  };

  return (
    <Router>
      <AuthProvider>
        <div className="app-container">
          <PrivacyConsentDialog onConsent={handleConsent} />
          
          {/* Always allow access to auth routes */}
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/password" element={<Password />} />
            
            {/* All other routes require consent */}
            <Route path="/*" element={
              hasConsent ? (
                <PanePage />
              ) : (
                <div className="container py-5 text-center">
                  <div className="card p-5 shadow">
                    <h2>Welcome to VirtuTask</h2>
                    <p className="lead my-4">
                      VirtuTask needs your consent to monitor windows and collect screenshots for productivity tracking.
                      Please accept the privacy consent to continue.
                    </p>
                    <button 
                      className="btn btn-primary mx-auto" 
                      style={{width: 'fit-content'}}
                      onClick={() => {
                        // Show consent dialog again if they dismissed it
                        localStorage.removeItem('virtutask_privacy_consent');
                        window.location.reload();
                      }}
                    >
                      Review Privacy Settings
                    </button>
                  </div>
                </div>
              )
            } />
          </Routes>
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;