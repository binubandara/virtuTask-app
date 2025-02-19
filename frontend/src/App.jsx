import { useState } from 'react'
import { Layout } from 'antd'
import Logo from './assets/components/pane/Logo';
import MenuList from './assets/components/pane/MenuList';
import Profile from './assets/components/pane/Profile';

{/* Navbar imports*/}
import './App.css';
import Navbar from "./assets/components/landingPage/Navbar";
import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";



function App() {
  return (
    <BrowserRouter>
        <Navbar />
        

    </BrowserRouter>
  );
}

export default App;
