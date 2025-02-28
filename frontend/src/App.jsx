import { useState } from 'react';
import { Layout } from 'antd';
import Logo from './components/pane/Logo';
import MenuList from './components/pane/MenuList';
import Profile from './components/pane/Profile';

// LandingPage imports
import './App.css';
import Navbar from "./components/landingPage/Navbar";
import React from "react";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import Home from './components/landingPage/Home'; 
import { Flowbite } from "flowbite-react";
import Services from "./components/landingPage/Services";
import MyFooter from "./components/landingPage/MyFooter";
import PanePage from './components/pane/PanePage'; 
import ProfilePage from "./components/userProfile/ProfilePage";

function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}

function AppContent() {
  const location = useLocation(); // Get the current route location

  // Check if the current path starts with '/pane'
  const isPaneRoute = location.pathname.startsWith('/pane');

  return (
    <>
      {/* Render Navbar, Services, and MyFooter only on landing pages */}
      {!isPaneRoute && (
        <>
          <Flowbite>
            <Navbar />
            <Home />
            <Services />
          </Flowbite>
        </>
      )}

      {/* Main Routes */}
      <Routes>
        <Route path="/pane/*" element={<PanePage />} /> {/* Pane Page with nested routes */}
        <Route path="/profile" element={<ProfilePage />} /> {/* Add Profile Page Route */}
      </Routes>

      {/* Render MyFooter only on landing pages */}
      {!isPaneRoute && <MyFooter />}
    </>
  );
}

export default App;