import React, { useState } from 'react';
import { useNavigate } from "react-router-dom";   //for navigation through pages, installed with: npm install react-router-dom


const Header = ({ currentPage = 'home', onLogin, isLoggedIn = false, onLogout }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  const navItems = [
    { id: 'home', label: 'Home', href: '#home' },
    { id: 'events', label: 'Events', href: '#events' },
    { id: 'volunteer', label: 'Volunteer', href: '#volunteer' },
    { id: 'impact', label: 'Impact', href: '#impact' },
    { id: 'about', label: 'About', href: '#about' }
  ];

  const handleLoginClick = () => {
    if (isLoggedIn) {
      onLogout && onLogout();
      navigate("/");
    } else {
      navigate("/login");
      //onLogin && onLogin();
    }
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <nav className="navbar">
      <div className="nav-container">
        <div className="logo">
          <div className="logo-icon">🤝</div>
          <span>Houston Hearts</span>
        </div>
        
        <div className={`nav-links ${isMobileMenuOpen ? 'nav-links-mobile' : ''}`}>
          {navItems.map((item) => (
            <a
              key={item.id}
              href={item.href}
              className={currentPage === item.id ? 'active' : ''}
              onClick={(e) => {
                e.preventDefault();          
                setIsMobileMenuOpen(false);
                if (item.id === "home") {
                  navigate("/");             //will go to homepage
                } else {
                  navigate(`/${item.id}`);    //will go to other page
                }
              }}
            >
              {item.label}
            </a>
          ))}
        </div>

        <div className="nav-actions">
          <button 
            className="btn-login" 
            onClick={handleLoginClick}
          >
            {isLoggedIn ? 'Sign Out' : 'Sign In'}
          </button>
          
          <button 
            className="mobile-menu-toggle"
            onClick={toggleMobileMenu}
            aria-label="Toggle mobile menu"
          >
            <span></span>
            <span></span>
            <span></span>
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Header;