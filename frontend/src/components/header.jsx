import React, { useState } from 'react';

const Header = ({ currentPage = 'home', onLogin, isLoggedIn = false, onLogout }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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
    } else {
      onLogin && onLogin();
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
              onClick={() => setIsMobileMenuOpen(false)}
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