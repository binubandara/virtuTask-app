import React, { useEffect, useState } from "react";
import { Carousel } from "flowbite-react";
import { Footer } from "flowbite-react";
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
      <header className="w-full bg-white md:bg-[transparent] fixed top-0 left-0 right-0">
        <nav
          className={`py-4 lg:px-18 px-10 ${isSticky ? "sticky top-0 left-0 right-0 border-b bg-white duration-300" : ""}`}
          style={{ paddingLeft: "40px", paddingTop: "20px", paddingRight: "40px" }}
        >
          <div className="flex justify-between items-center text-base gap-8">
            <a href="/" className="text-2xl font-semibold flex items-center space-x-3">
              <img src={logo} alt="VirtuTask Logo" className="w-10 inline-block items-center" />
              <span className="text-[#263238]">VirtuTask</span>
            </a>

            <ul className="md:flex justify-start gap-x-12">
              {navItems.map(({ link, path }) => (
                <li key={link}>
                  <a href={path} className="text-base md:text-lg text-[#717171] hover:text-[#4CAF4F]">
                    {link}
                  </a>
                </li>
              ))}
            </ul>

            {/* Buttons for large devices */}
            <div className="justify-start gap-x-4 hidden lg:flex items-center">
              <button
                className="bg-[#4CAF4F] text-[white] w-20 h-8 transition-all duration-300 rounded hover:bg-[#4D4D4D]"
                onClick={() => navigate("/pane")}
              >
                Login
              </button>

              <button className="bg-[#4CAF4F] text-[white] w-20 h-8 transition-all duration-300 rounded hover:bg-[#4D4D4D]">
                Register
              </button>
            </div>
          </div>
        </nav>
      </header>

      {/* Home Section */}
      <div id="home" className="bg-[#F5F7FA]">
        <div style={{ paddingLeft: "2.5rem", paddingRight: "2.5rem" }} className="max-w-screen mx-auto min-h-screen h-screen">
          <Carousel className="w-full mx-auto">
            <div className="my-28 md:my-8 py-12 flex flex-col md:flex-row-reverse items-center justify-between gap-12">
              <div>
                <img src={pic1} alt="" className="w-30 md:w-20 lg:w-130" />
              </div>

              {/* Hero text */}
              <div className="md:w-1/2">
                <h1 style={{ marginBottom: "1.5rem" }} className="text-5xl font-semibold mb-4 text-[#4D4D4D] md:w-3/4 landing-snug">
                  Redefining Work,<br></br>
                  <span className="text-[#4CAF4F] leading-snug">One Click at a Time!</span>
                </h1>
                <p style={{ marginBottom: "1.5rem" }} className="text-[#4D4D4D] text-base mb-8">
                  Streamline your tasks, connect effortlessly, and thrive—wherever you are.
                </p>
                <button className="btn-primary h-10 w-60 bg-[#4CAF4F] text-white rounded hover:bg-[#4D4D4D] transition-all duration-300 hover:-translate-y-4">
                  Sign in with your work email
                </button>
              </div>
            </div>

            <div className="my-28 md:my-8 py-12 flex flex-col md:flex-row-reverse items-center justify-between gap-12">
              <div>
                <img src={img2} alt="" className="w-30 md:w-30 lg:w-180" />
              </div>

              {/* Hero text */}
              <div className="md:w-1/2">
                <h1 style={{ marginBottom: "1.5rem" }} className="text-5xl font-semibold mb-4 text-[#4D4D4D] md:w-3/4 landing-snug">
                  Revolutionizing Collaboration,<br></br>
                  <span className="text-[#4CAF4F] leading-snug">Smooth and in line!</span>
                </h1>
                <p style={{ marginBottom: "1.5rem" }} className="text-[#4D4D4D] text-base mb-8">
                  Bringing teams together, no matter the distance—because work should just flow.
                </p>
                <button className="btn-primary h-10 w-60 bg-[#4CAF4F] text-white rounded hover:bg-[#4D4D4D] transition-all duration-300 hover:-translate-y-4">
                  Sign in with your work email
                </button>
              </div>
            </div>
          </Carousel>
        </div>
      </div>

      {/* Services Section */}
      <div id="services" className="md:px-14 px-4 py-1 max-w-screen-2xl mx-auto">
        <div className="text-center my-8">
          <h2 style={{ marginTop: "6rem", marginBottom: "0.5rem" }} className="text-4xl text-[#4D4D4D] font-semibold mb-2">
            Unlock the Future of Remote Work!
          </h2>
          <p className="text-[#717171]">Who is VirtuTask suitable for?</p>
        </div>

        {/* Services cards */}
        <div style={{ marginTop: "3rem", marginBottom: "4rem" }} className="mt-14 grid lg:grid-cols-3 md:grid-cols-2 grid-cols-1 md:w-11/12 mx-auto gap-12">
          {services.map((service) => (
            <div key={service.id} style={{ marginBottom: "3rem", marginLeft: "3rem" }} className="px-4 py-8 text-center md:w-[300px] mx-auto md:h-80 rounded-md shadow cursor-pointer hover:-translate-y-5 hover:border-b-4 hover:border-indigo-700 transition-all duration-300 flex items-center justify-center h-full">
              <div>
                <div style={{ marginLeft: "7rem", marginBottom: "2rem" }} className="bg-[#E8F5E9] mb-4 w-14 h-14 mx-auto rounded-br-3xl">
                  <img src={service.image} style={{ marginTop: "3rem" }} alt="" />
                </div>
                <h4 style={{ marginBottom: "1.5rem" }} className="text-2xl font-bold text-[#4D4D4D] mb-2 px-2">
                  {service.title}
                </h4>
                <p className="text-sm text-[#4D4D4D]">{service.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <Footer container>
        <div id="contact" className="w-full text-white">
          <div className="grid w-full justify-between sm:flex sm:justify-between md:flex md:grid-cols-1">
            <div className="space-y-4 mb-8">
              <a href="/" className="text-2xl font-semibold flex items-center space-x-3">
                <img src={logo} alt="VirtuTask Logo" className="w-15 inline-[block]" />
                <span className="text-white">VirtuTask</span>
              </a>
              <div>
                <p className="mb-1">copyright © 2025 VirtuTask ltd.</p>
                <p>All rights reserved</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-8 sm:mt-4 sm:grid-cols-3 sm:gap-6">
              <div>
                <Footer.Title title="about" />
                <Footer.LinkGroup col>
                  <a href="#home" className="text-white hover:underline">
                    Home
                  </a>
                  <a href="#services" className="text-white hover:underline">
                    Services
                  </a>
                </Footer.LinkGroup>
              </div>
              <div>
                <Footer.Title title="Follow us" />
                <Footer.LinkGroup col>
                  <Footer.Link href="https://github.com" target="_blank" rel="noopener noreferrer">
                    Github
                  </Footer.Link>
                  <Footer.Link href="https://www.instagram.com/virtutask_?igsh=enRldjVma2NhZGg0" target="_blank" rel="noopener noreferrer">
                    Instagram
                  </Footer.Link>
                </Footer.LinkGroup>
              </div>
              <div>
                <Footer.Title title="Legal" />
                <Footer.LinkGroup col>
                  <Footer.Link href="#">Privacy Policy</Footer.Link>
                  <Footer.Link href="#">Terms &amp; Conditions</Footer.Link>
                </Footer.LinkGroup>
              </div>
            </div>
          </div>
          <Footer.Divider />
          <div className="w-full sm:flex sm:items-center sm:justify-between">
            <Footer.Copyright href="#" by="Flowbite™" year={2025} />
            <div className="mt-4 flex items-center space-x-2 sm:mt-0">
              <MdEmail className="text-xl" />
              <a href="mailto:contact@virtutask.com" className="text-white hover:underline">
                contact@virtutask.com
              </a>
            </div>
          </div>
        </div>
      </Footer>
    </div>
  );
};

export default LandingPage;