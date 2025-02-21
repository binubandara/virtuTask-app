import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import ProductivityDashboard from './components/productivity-tracker/ProductivityDashboard';

function App() {
  return (
    <div className="container-fluid">
      <ProductivityDashboard/>
    </div>
  );
}

export default App;