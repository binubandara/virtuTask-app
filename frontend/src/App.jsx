import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./components/Login/Login"; 
import Register from "./components/Login/Register"; 
import Password from "./components/Login/Password"; 
import MyProjectsManager from "./components/Task-management/MyProjectsManager";

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/password" element={<Password />} />
                <Route path="/My-projects-manager" element={<MyProjectsManager />} />
                
            </Routes>
        </Router>
    );
}

export default App;
