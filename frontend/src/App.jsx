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
      <ClockDashboard/>;
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
        <Route path="/pane/*" element={<PanePage />} /> {/* Pane Page with nested routes */}
        <Route path="/profile" element={<ProfilePage />} /> {/* Add Profile Page Route */}
      </Routes>

    </>
  );
}

export default App;