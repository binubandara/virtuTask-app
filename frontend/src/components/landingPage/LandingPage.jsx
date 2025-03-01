import React from "react";
import Navbar from "./Navbar";
import Home from "./Home";
import Services from "./Services";
import MyFooter from "./MyFooter";

const LandingPage = () => {
  return (
    <div className="landing-page">
      <Navbar />
      <div className="page-content">
        <Home />
        <Services />
      </div>
      <MyFooter />
    </div>
  );
};

export default LandingPage;