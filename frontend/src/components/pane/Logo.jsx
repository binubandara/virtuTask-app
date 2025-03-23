import React from "react";
import "./Logo.css";

const Logo = () => {
    return (
        <div className="logo">
            <img src="src/assets/logo.png" alt="VirtuTask Logo" className="logo-img" />
            <span className="logo-text">VirtuTask</span>
        </div>
    );
};

export default Logo;