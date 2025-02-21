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
import Home from './components/landingPage/Home'; // Import your Home component
import { Flowbite } from "flowbite-react";
import Services from "./components/landingPage/Services";
import MyFooter from "./components/landingPage/MyFooter";
import PanePage from './components/pane/PanePage'; // Import the PanePage component

function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}

function AppContent() {
  const location = useLocation(); // Get the current route location

  return (
    <>
      {/* Render Navbar, Services, and MyFooter only on landing pages */}
      {location.pathname !== '/pane' && (
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
        <Route path="/pane" element={<PanePage />} /> {/* Pane Page */}
      </Routes>

      {/* Render MyFooter only on landing pages */}
      {location.pathname !== '/pane' && <MyFooter />}
    </>
  );
}

export default App;
