import React from 'react';
import { useNavigate } from 'react-router-dom';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  const navigate = useNavigate();

  // Basic links - use app routes defined in App.jsx
  const getInvolvedLinks = [
    { id: 'about', label: 'Learn About Us', path: '/about' },
    { id: 'calendar', label: 'Upcoming Events', path: '/calendar' },
    { id: 'register', label: 'Become a Volunteer', path: '/register' }
  ];

  const serviceAreas = [
    'Downtown Houston',
    'Sugar Land Community',
    'Katy Neighborhoods',
    'Cypress Areas',
    'Greater Houston Metro'
  ];

  // Determine whether a volunteer is logged in. The app stores a cached profile in localStorage under
  // 'hh_userProfile' and the Header/Layout also pass `user` and `isLoggedIn` down when available. Footer
  // doesn't receive props, so we use localStorage as a reasonable fallback.
  let isVolunteer = false;
  try {
    const s = localStorage.getItem('hh_userProfile');
    if (s) {
      const profile = JSON.parse(s);
      const profileType = (profile && (profile.userType || profile.type)) || null;
      if (profileType === 'volunteer') isVolunteer = true;
    }
  } catch (e) {
    // ignore parse errors
  }

  const handleLinkClick = (link) => (e) => {
    e.preventDefault();
    if (link.id === 'calendar') {
      // calendar is protected in App.jsx; if not a volunteer (or not logged in), go to login
      if (isVolunteer) navigate('/calendar');
      else navigate('/login');
      return;
    }
    navigate(link.path);
  };

  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-content">
          <div className="footer-section">
            <div className="footer-brand">
              <div className="footer-logo-icon">🤝</div>
              <span className="footer-brand-name">Houston Hearts</span>
            </div>
            <p className="footer-description">
              Connecting volunteers with meaningful opportunities. 
              Every act of service strengthens hope, dignity, and community across Houston.
            </p>
          </div>

          <div className="footer-section">
            <h3 className="footer-section-title">Get Involved</h3>
            <div className="footer-links">
              {getInvolvedLinks.map((link) => (
                <a
                  key={link.id}
                  href={link.path}
                  className="footer-link"
                  onClick={handleLinkClick(link)}
                >
                  {link.label}
                </a>
              ))}
            </div>
          </div>

          <div className="footer-section">
            <h3 className="footer-section-title">Service Areas</h3>
            <div className="footer-service-areas">
              {serviceAreas.map((label, index) => (
                <div key={index} className="footer-service-area">
                  {label}
                </div>
              ))}
            </div>
          </div>

          <div className="footer-section">
            <h3 className="footer-section-title">Connect With Us</h3>
            <div className="footer-contact">
              <div className="footer-contact-item clickable" role="button" tabIndex={0} onClick={() => (window.location.href = 'mailto:volunteer@houstonhearts.org')}>volunteer@houstonhearts.org</div>
              <div className="footer-contact-item clickable" role="button" tabIndex={0} onClick={() => (window.location.href = 'tel:8327055309')}>(832) 705-5309</div>
              <div className="footer-contact-item">4800 Calhoun Road, Houston, TX 77204</div>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <p className="footer-copyright">
            &copy; {currentYear} Houston Hearts Clothing Drive. Making a difference, one family at a time.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;