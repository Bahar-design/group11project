import React, { useState, useContext } from 'react';
import { UserProfileContext } from '../pages/user_profiles/adminInfo';
import { useNavigate } from "react-router-dom";   //for navigation through pages

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

  // Only show Events for admin, Matchmaking for volunteer, Calendar for all logged-in users
  const navItems = [
    { id: 'home', label: 'Home', href: '#home' },
    ...(isLoggedIn && user?.userType === 'admin' ? [
      { id: 'events', label: 'Events', href: '#events' }
    ] : []),
    ...(isLoggedIn && user?.userType === 'volunteer' ? [
      { id: 'matchmaking', label: 'Volunteer Matchmaking', href: '#matchmaking' }
    ] : []),
    ...(isLoggedIn ? [
      { id: 'calendar', label: 'Calendar', href: '#calendar' }
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
        
        {/* Updated nav-links styles to fix spacing and wrapping */}
        <div
          className={`nav-links ${isMobileMenuOpen ? 'nav-links-mobile' : ''}`}
          style={{
            display: 'flex',         // use flexbox for horizontal layout
            gap: '1rem',             // consistent spacing between links
            alignItems: 'center',    // vertically center links
            flexWrap: 'nowrap',      // prevent wrapping
            whiteSpace: 'nowrap',    // keep long labels on one line
          }}
        >
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
                } else if (item.id === "calendar") {
                  navigate("/calendar");
                } else if (item.id === "matchmaking") {
                  navigate("/match-making");
                } else {
                  console.log(`${item.label} clicked (no page yet)`);
                }
              }}
            >
              {item.label}
            </a>
          ))}
        </div>

        <div className="nav-actions" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
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
          {/* Fixed button width and padding for consistent Sign In / Sign Out */}
          <button
            className="btn-login"
            style={{
              padding: '0.5rem 1rem',   // consistent padding
              minWidth: '80px',         // ensures Sign In / Sign Out same width
              textAlign: 'center',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
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
