import React from 'react';

const Navbar = ({ user, onLogout }) => {
  return (
    <nav className="navbar">
      <div className="nav-container">
        <div className="logo">
          <div className="logo-icon">🤝</div>
          <span>Houston Hearts</span>
        </div>
        <div className="nav-links">
          <a href="#dashboard">Dashboard</a>
          <a href="#events">Events</a>
          <a href="#profile" className="active">Profile</a>
          <a href="#impact">Impact</a>
        </div>
        <div className="user-menu">
          <div className="user-avatar" title="Profile Menu">
            {user.initials}
          </div>
          <button className="btn-logout" onClick={onLogout}>
            Sign Out
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;