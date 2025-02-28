import React, { useState } from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import PanePage from './components/pane/PanePage';
import PrivacyConsentDialog from './components/PrivacyConsentDialog';

function App() {
  const [hasConsent, setHasConsent] = useState(false);
  
  const handleConsent = (consentGiven) => {
    setHasConsent(consentGiven);
  };

  return (
    <Router>
      <div className="app-container">
        <PrivacyConsentDialog onConsent={handleConsent} />
        {hasConsent ? (
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
        )}
      </div>
    </Router>
  );
}

export default App;