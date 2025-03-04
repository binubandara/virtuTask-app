import './App.css';
import React from "react";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { Flowbite } from "flowbite-react";
import PanePage from './components/pane/PanePage'; 
import ProfilePage from "./components/userProfile/ProfilePage";
import LandingPage from './components/landingPage/LandingPage';
import ClockDashboard from "./components/globalTime/ClockDashboard";




function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}

function AppContent() {
  const location = useLocation(); 

  const isPaneRoute = location.pathname.startsWith('/pane');

  return (
    <>
      {!isPaneRoute && (
        <>
          <Flowbite>
            <LandingPage />
          </Flowbite>
        </>
      )}

      <Routes>
        <Route path="/pane/*" element={<PanePage />} />
        <Route path="/profile" element={<ProfilePage />} /> 
        <Route path="/global-time" element={<ClockDashboard />} />
      </Routes>

    </>
  );
}

export default App;