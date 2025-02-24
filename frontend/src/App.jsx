import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import PanePage from './components/pane/PanePage';

function App() {
  return (
    <Router>
      <div className="app-container">
        <PanePage />
      </div>
    </Router>
  );
}

export default App;