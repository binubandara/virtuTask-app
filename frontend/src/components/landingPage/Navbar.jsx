import React, { useEffect, useState } from "react";
import logo from "../../assets/logo.png";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext"; // Import Auth context

const Navbar = () => {
  const [isSticky, setIsSticky] = useState(false);
  const navigate = useNavigate();
  const { user, logout } = useAuth(); // Use the auth context

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

  // Handle navigation or scroll depending on current page
  const handleNavigation = (path) => {
    if (path.startsWith('#')) {
      // It's an anchor, scroll to it
      scrollToSection(path.substring(1));
    } else {
      // It's a route, navigate to it
      navigate(path);
    }
  };

  const navItems = [
    { link: "Home", path: "#home" },
    { link: "Services", path: "#services" },
    { link: "Product", path: "product" },
    { link: "Contact", path: "#contact" },
  ];

  return (
    <header className="w-full bg-white md:bg-[transparent] fixed top-0 left-0 right-0 z-50">
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
                <a 
                  href={path} 
                  onClick={(e) => {
                    e.preventDefault();
                    handleNavigation(path);
                  }}
                  className="text-base md:text-lg text-[#717171] hover:text-[#4CAF4F]"
                >
                  {link}
                </a>
              </li>
            ))}
          </ul>

          {/* Buttons for large devices */}
          <div className="justify-start gap-x-4 hidden lg:flex items-center">
            {user ? (
              <>
                <button
                  className="bg-[#4CAF4F] text-[white] w-20 h-8 transition-all duration-300 rounded hover:bg-[#4D4D4D]"
                  onClick={() => navigate("/pane")}
                >
                  Dashboard
                </button>
                <button 
                  className="bg-[#4D4D4D] text-[white] w-20 h-8 transition-all duration-300 rounded hover:bg-[#626262]"
                  onClick={logout}
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <button
                  className="bg-[#4CAF4F] text-[white] w-20 h-8 transition-all duration-300 rounded hover:bg-[#4D4D4D]"
                  onClick={() => navigate("/login")}
                >
                  Login
                </button>
                <button 
                  className="bg-[#4CAF4F] text-[white] w-20 h-8 transition-all duration-300 rounded hover:bg-[#4D4D4D]"
                  onClick={() => navigate("/register")}
                >
                  Register
                </button>
              </>
            )}
          </div>
        </div>
      </nav>
    </header>
  );
};

export default Navbar;