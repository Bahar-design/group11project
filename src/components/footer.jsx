import React from 'react';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  
  const getInvolvedLinks = [
    { label: 'Volunteer Opportunities', href: '#volunteer-opportunities' },
    { label: 'Upcoming Events', href: '#events' },
    { label: 'Donation Guidelines', href: '#donation-guidelines' },
    { label: 'Emergency Response', href: '#emergency' },
    { label: 'Become a Team Leader', href: '#team-leader' }
  ];

  const serviceAreas = [
    { label: '🏢 Downtown Houston', area: 'Downtown Houston' },
    { label: '🏘️ Sugar Land Community', area: 'Sugar Land Community' },
    { label: '🌳 Katy Neighborhoods', area: 'Katy Neighborhoods' },
    { label: '🏡 Cypress Areas', area: 'Cypress Areas' },
    { label: '🌆 Greater Houston Metro', area: 'Greater Houston Metro' }
  ];

  const socialIcons = [
    { icon: '📧', label: 'Email', action: () => window.location.href = 'mailto:volunteer@houstonhearts.org' },
    { icon: '📱', label: 'Phone', action: () => window.location.href = 'tel:7135554357' },
    { icon: '🌐', label: 'Website', action: () => window.open('#', '_blank') }
  ];

  const footerLinks = [
    { label: 'Privacy Policy', href: '#privacy' },
    { label: 'Terms of Service', href: '#terms' },
    { label: 'Volunteer Agreement', href: '#agreement' },
    { label: 'Accessibility', href: '#accessibility' },
    { label: 'Report Issue', href: '#report' }
  ];

  const contactInfo = [
    { icon: '📧', text: 'volunteer@houstonhearts.org', action: () => window.location.href = 'mailto:volunteer@houstonhearts.org' },
    { icon: '📱', text: '(713) 555-HELP (4357)', action: () => window.location.href = 'tel:7135554357' },
    { icon: '🚨', text: 'Emergency: (713) 555-URGENT', action: () => window.location.href = 'tel:7135558743' },
    { icon: '📍', text: 'Houston, TX 77001', action: null }
  ];

  const handleSocialClick = (socialAction) => {
    if (socialAction) {
      socialAction();
    }
  };

  const handleContactClick = (contactAction) => {
    if (contactAction) {
      contactAction();
    }
  };

  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-content">
          {/* Brand Section */}
          <div className="footer-section">
            <div className="footer-brand">
              <div className="footer-logo-icon">🤝</div>
              <span className="footer-brand-name">Houston Hearts</span>
            </div>
            <p className="footer-description">
              Connecting hearts through clothing donations. Every item shared is a story of hope, 
              dignity, and community care across Houston.
            </p>
            <div className="footer-social">
              {socialIcons.map((social, index) => (
                <div
                  key={index}
                  className="footer-social-icon"
                  onClick={() => handleSocialClick(social.action)}
                  title={social.label}
                  role="button"
                  tabIndex={0}
                  onKeyPress={(e) => e.key === 'Enter' && handleSocialClick(social.action)}
                >
                  {social.icon}
                </div>
              ))}
            </div>
          </div>

          {/* Get Involved Section */}
          <div className="footer-section">
            <h3 className="footer-section-title">🎯 Get Involved</h3>
            <div className="footer-links">
              {getInvolvedLinks.map((link, index) => (
                <a
                  key={index}
                  href={link.href}
                  className="footer-link"
                >
                  {link.label}
                </a>
              ))}
            </div>
          </div>

          {/* Service Areas Section */}
          <div className="footer-section">
            <h3 className="footer-section-title">📍 Service Areas</h3>
            <div className="footer-service-areas">
              {serviceAreas.map((area, index) => (
                <div key={index} className="footer-service-area">
                  {area.label}
                </div>
              ))}
            </div>
          </div>

          {/* Contact Section */}
          <div className="footer-section">
            <h3 className="footer-section-title">📞 Connect With Us</h3>
            <div className="footer-contact">
              {contactInfo.map((contact, index) => (
                <div
                  key={index}
                  className={`footer-contact-item ${contact.action ? 'clickable' : ''}`}
                  onClick={() => handleContactClick(contact.action)}
                  role={contact.action ? 'button' : 'text'}
                  tabIndex={contact.action ? 0 : -1}
                  onKeyPress={(e) => e.key === 'Enter' && handleContactClick(contact.action)}
                >
                  {contact.icon} {contact.text}
                </div>
              ))}
              <div className="footer-emergency-notice">
                <strong className="emergency-title">24/7 Crisis Support</strong>
                <br />
                <span className="emergency-description">
                  For urgent clothing needs during disasters
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Bottom */}
        <div className="footer-bottom">
          <p className="footer-copyright">
            &copy; {currentYear} Houston Hearts Clothing Drive. Making a difference, one family at a time.
          </p>
          <div className="footer-legal-links">
            {footerLinks.map((link, index) => (
              <a
                key={index}
                href={link.href}
                className="footer-legal-link"
              >
                {link.label}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;