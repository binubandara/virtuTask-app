import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./components/Login/Login"; 
import Register from "./components/Login/Register"; 
import Password from "./components/Login/Password"; 

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/password" element={<Password />} />
            </Routes>
        </Router>
    );
}

export default App;
