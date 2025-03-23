import React, { useEffect, useState } from "react";
import { Carousel } from "react-bootstrap";
import { MdEmail } from "react-icons/md";
import logo from "../../assets/logo.png";
import pic1 from "../../assets/pic1.png";
import img2 from "../../assets/img2.png";
import { Link, useNavigate } from "react-router-dom";

const LandingPage = () => {
  const [isSticky, setIsSticky] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setIsSticky(window.scrollY > 100);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToSection = (sectionId) => {
    const section = document.getElementById(sectionId);
    if (section) {
      section.scrollIntoView({ behavior: "smooth" });
    }
  };

  const navItems = [
    { link: "Home", path: "#home" },
    { link: "Services", path: "#services" },
    { link: "Product", path: "product" },
    { link: "Contact", path: "#contact" },
  ];

  const services = [
    { id: 1, title: "Remote and Hybrid Teams", description: "Companies with distributed employees needing seamless collaboration.", image: "/src/assets/remote.png" },
    { id: 2, title: "Startups & Growing Businesses", description: "Teams that need an efficient, scalable workspace without overhead.", image: "/src/assets/startup.png" },
    { id: 3, title: "Freelancers & Consultants", description: "Independent professionals who manage projects and clients remotely.", image: "/src/assets/free.png" },
  ];

  return (
    <div>
      {/* Navbar */}
      <header className={`w-full bg-white fixed-top ${isSticky ? "sticky-top shadow-sm" : ""}`}>
        <nav className="navbar navbar-expand-lg navbar-light py-3">
          <div className="container">
            <a href="/" className="navbar-brand d-flex align-items-center">
              <img src={logo} alt="VirtuTask Logo" className="me-2" style={{ width: "40px" }} />
              <span className="text-dark fs-4 fw-semibold">VirtuTask</span>
            </a>
            <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
              <span className="navbar-toggler-icon"></span>
            </button>
            <div className="collapse navbar-collapse" id="navbarNav">
              <ul className="navbar-nav ms-auto mb-2 mb-lg-0">
                {navItems.map(({ link, path }) => (
                  <li key={link} className="nav-item">
                    <a href={path} className="nav-link text-secondary">
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
              <div className="d-flex ms-3">
                <button className="btn btn-success me-2" onClick={() => navigate("/login")}>
                  Login
                </button>
                <button className="btn btn-success" onClick={() => navigate("/register")}>
                  Register
                </button>
              </div>
            </div>
          </div>
        </nav>
      </header>

      {/* Home Section */}
      <div id="home" className="bg-light">
        <Carousel>
          <Carousel.Item>
            <div className="container py-5">
              <div className="row align-items-center">
                <div className="col-md-6 order-md-2">
                  <img src={pic1} alt="" className="img-fluid" />
                </div>
                <div className="col-md-6 order-md-1">
                  <h1 className="display-4 fw-semibold text-dark">
                    Redefining Work,<br />
                    <span className="text-success">One Click at a Time!</span>
                  </h1>
                  <p className="lead text-secondary">
                    Streamline your tasks, connect effortlessly, and thrive—wherever you are.
                  </p>
                  <button className="btn btn-success btn-lg">Sign in with your work email</button>
                </div>
              </div>
            </div>
          </Carousel.Item>
          <Carousel.Item>
            <div className="container-slide py-5">
              <div className="row align-items-center">
                <div className="col-md-6 order-md-2">
                  <img src={img2} alt="" className="img-fluid" />
                </div>
                <div className="col-md-6 order-md-1">
                  <h1 className="display-4 fw-semibold text-dark">
                    Revolutionizing Collaboration,<br />
                    <span className="text-success">One Click at a Time!</span>
                  </h1>
                  <p className="lead text-secondary">
                    Bringing teams together, no matter the distance—because work should just flow.
                  </p>
                  <button className="btn btn-success btn-lg">Sign in with your work email</button>
                </div>
              </div>
            </div>
          </Carousel.Item>
        </Carousel>
      </div>

      {/* Services Section */}
      <div id="services" className="container py-5">
        <div className="text-center my-5">
          <h2 className="display-5 fw-semibold text-dark">Unlock the Future of Remote Work!</h2>
          <p className="text-secondary">Who is VirtuTask suitable for?</p>
        </div>
        <div className="row g-4">
          {services.map((service) => (
            <div key={service.id} className="col-md-4">
              <div className="card h-100 shadow-sm border-0 text-center p-4">
                <div className="bg-light rounded-circle p-3 mx-auto mb-3">
                  <img src={service.image} alt="" className="img-fluid" />
                </div>
                <h4 className="fw-bold text-dark">{service.title}</h4>
                <p className="text-secondary">{service.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-dark text-white py-5">
        <div className="container">
          <div className="row">
            <div className="col-md-4 mb-4">
              <a href="/" className="d-flex align-items-center text-white text-decoration-none">
                <img src={logo} alt="VirtuTask Logo" className="me-2" style={{ width: "40px" }} />
                <span className="fs-4 fw-semibold">VirtuTask</span>
              </a>
              <p className="mt-3">copyright © 2025 VirtuTask ltd.</p>
              <p>All rights reserved</p>
            </div>
            <div className="col-md-2 mb-4">
              <h5 className="fw-bold">About</h5>
              <ul className="list-unstyled">
                <li>
                  <a href="#home" className="text-white text-decoration-none">
                    Home
                  </a>
                </li>
                <li>
                  <a href="#services" className="text-white text-decoration-none">
                    Services
                  </a>
                </li>
              </ul>
            </div>
            <div className="col-md-2 mb-4">
              <h5 className="fw-bold">Follow us</h5>
              <ul className="list-unstyled">
                <li>
                  <a href="https://github.com" className="text-white text-decoration-none">
                    Github
                  </a>
                </li>
                <li>
                  <a href="https://www.instagram.com/virtutask_?igsh=enRldjVma2NhZGg0" className="text-white text-decoration-none">
                    Instagram
                  </a>
                </li>
              </ul>
            </div>
            <div className="col-md-2 mb-4">
              <h5 className="fw-bold">Legal</h5>
              <ul className="list-unstyled">
                <li>
                  <a href="#" className="text-white text-decoration-none">
                    Privacy Policy
                  </a>
                </li>
                <li>
                  <a href="#" className="text-white text-decoration-none">
                    Terms &amp; Conditions
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <hr className="bg-light" />
          <div className="d-flex justify-content-between align-items-center">
            <p className="mb-0">© 2025 Flowbite™</p>
            <a href="mailto:contact@virtutask.com" className="text-white text-decoration-none d-flex align-items-center">
              <MdEmail className="me-2" />
              contact@virtutask.com
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;