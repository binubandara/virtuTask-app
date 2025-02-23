import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import ProductivityDashboard from './components/productivity-tracker/ProductivityDashboard';
import EngagementHub from './components/engagement-hub/EngagementHub';

function App() {
  return (
    <div className="container-fluid">
      <EngagementHub/>
    </div>
  );
}

export default App;