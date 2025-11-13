import React, { useState, useContext } from 'react';
import { UserProfileContext } from '../pages/user_profiles/adminInfo';
import { useNavigate } from 'react-router-dom';

const Header = (props) => {
  const {
    currentPage = 'home',
    onLogin,
    isLoggedIn = false,
    onLogout,
    user
  } = props;

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const { userProfile } = useContext(UserProfileContext) || {};

  // Load cached saved profile as a fallback so initials persist when navigating
  let savedProfile = null;
  try {
    const s = localStorage.getItem('hh_userProfile');
    if (s) savedProfile = JSON.parse(s);
  } catch (e) {}

  // Helper to get initials from name or profile object
  const getInitials = (nameOrProfile) => {
    if (!nameOrProfile) return '';
    let name = '';
    if (typeof nameOrProfile === 'string') name = nameOrProfile;
    if (typeof nameOrProfile === 'object' && nameOrProfile !== null) name = nameOrProfile.name || '';
    if (!name) return 'U';
    const parts = name.trim().split(' ');
    if (parts.length === 1) return parts[0][0]?.toUpperCase() || 'U';
    return (parts[0][0] + (parts[1]?.[0] || '')).toUpperCase();
  };

  // navigation items
  const navItems = [
    { id: 'home', label: 'Home', href: '/' },
  ...(isLoggedIn && user?.userType === 'admin' ? [{ id: 'events', label: 'Events', href: '/events' }, { id: 'reports', label: 'Reports', href: '/reports' }] : []),
    ...(isLoggedIn && user?.userType === 'volunteer' ? [{ id: 'matchmaking', label: 'Volunteer Matchmaking', href: '/match-making' }] : []),
    ...(isLoggedIn ? [{ id: 'calendar', label: 'Calendar', href: '/calendar' }] : []),
    { id: 'about', label: 'About', href: '/about' }
  ];

  const handleLoginClick = () => {
    if (isLoggedIn) {
      onLogout && onLogout();
      navigate('/');
    } else {
      navigate('/login');
    }
  };

  const toggleMobileMenu = () => setIsMobileMenuOpen(v => !v);

  const profileInitials = getInitials(userProfile || savedProfile || user);

  return (
    <nav className="navbar">
      <div className="nav-container">
        <div className="logo">
          <div className="logo-icon">🤝</div>
          <span>Houston Hearts</span>
        </div>

        <div className={`nav-links ${isMobileMenuOpen ? 'nav-links-mobile' : ''}`} style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'nowrap', whiteSpace: 'nowrap' }}>
          {navItems.map(item => (
            <a key={item.id} href={item.href} className={currentPage === item.id ? 'active' : ''} onClick={(e) => { e.preventDefault(); setIsMobileMenuOpen(false); navigate(item.href); }}>
              {item.label}
            </a>
          ))}

          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            {isLoggedIn && user && (
              <button className="profile-icon-btn" title="Profile" onClick={() => { setIsMobileMenuOpen(false); navigate('/user-profiles'); }} style={{ border: 'none', background: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--primary-red, #e63946)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 18, marginRight: 8, boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}>{profileInitials}</div>
                <span style={{ color: 'var(--primary-red, #e63946)', fontWeight: 600 }}>Profile</span>
              </button>
            )}

            <button className="btn-login" style={{ padding: '0.5rem 1rem', minWidth: '80px', textAlign: 'center', border: 'none', borderRadius: '4px', cursor: 'pointer' }} onClick={handleLoginClick}>
              {isLoggedIn ? 'Sign Out' : 'Sign In'}
            </button>

            <button className="mobile-menu-toggle" onClick={toggleMobileMenu} aria-label="Toggle mobile menu">
              <span></span>
              <span></span>
              <span></span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Header;
