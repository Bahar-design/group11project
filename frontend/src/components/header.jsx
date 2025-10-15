import React, { useState, useContext } from 'react';
import { UserProfileContext } from '../pages/user_profiles/adminInfo';
import { useNavigate } from "react-router-dom";   //for navigation through pages, installed with: npm install react-router-dom


const Header = ({ currentPage = 'home', onLogin, isLoggedIn = false, onLogout, user }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const { userProfile } = useContext(UserProfileContext) || {};
  // Helper to get initials from name
  const getInitials = (name) => {
    if (!name) return 'U';
    const parts = name.trim().split(' ');
    if (parts.length === 1) return parts[0][0]?.toUpperCase() || 'U';
    return (parts[0][0] + (parts[1]?.[0] || '')).toUpperCase();
  };

  // Only show Events for admin, Matchmaking for volunteer
  const navItems = [
    { id: 'home', label: 'Home', href: '#home' },
    ...(isLoggedIn && user?.userType === 'admin' ? [
      { id: 'events', label: 'Events', href: '#events' }
    ] : []),
    ...(isLoggedIn && user?.userType === 'volunteer' ? [
      { id: 'matchmaking', label: 'Volunteer Matchmaking', href: '#matchmaking' }
    ] : []),
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
                  navigate("/");
                } else if (item.id === "events") {
                  navigate("/events");
                } else if (item.id === "matchmaking") {
                  navigate("/match-making");
                } else {
                  // impact, about pages not done yet
                  console.log(`${item.label} clicked (no page yet)`);
                }
              }}
            >
              {item.label}
            </a>
          ))}
        </div>

        <div className="nav-actions">
          {isLoggedIn && user && (
            <button
              className="profile-icon-btn"
              title="Profile"
              style={{
                border: 'none',
                background: 'none',
                marginRight: '1rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
              }}
              onClick={() => {
                setIsMobileMenuOpen(false);
                navigate('/user-profiles');
              }}
            >
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: '50%',
                  background: 'var(--primary-red, #e63946)',
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 700,
                  fontSize: 18,
                  marginRight: 8,
                  boxShadow: '0 1px 4px rgba(0,0,0,0.08)'
                }}
              >
                {getInitials(userProfile?.name || user?.name)}
              </div>
              <span style={{ color: 'var(--primary-red, #e63946)', fontWeight: 600 }}>Profile</span>
            </button>
          )}
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