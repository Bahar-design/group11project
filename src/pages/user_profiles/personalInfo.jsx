import React, { useState } from 'react';

const PersonalInfo = ({ user }) => {
  const [formData, setFormData] = useState({
    name: user.name,
    email: user.email,
    phone: user.phone,
    emergencyContact: user.emergencyContact,
    primaryLocation: 'Sugar Land',
    travelRadius: '20 miles',
    preferredLanguage: 'English',
    hasTransportation: true
  });

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Saving personal info:', formData);
  };

  return (
    <div className="profile-grid">
      <div className="profile-card">
        <div className="profile-card-header">
          <h3 className="profile-card-title">Contact Information</h3>
          <button className="btn-secondary edit-btn" type="button">Edit</button>
        </div>
        <div className="profile-card-content">
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Full Name</label>
              <input 
                type="text" 
                className="form-input" 
                name="name"
                value={formData.name}
                onChange={handleInputChange}
              />
            </div>
            <div className="form-group">
              <label>Email Address</label>
              <input 
                type="email" 
                className="form-input" 
                name="email"
                value={formData.email}
                onChange={handleInputChange}
              />
            </div>
            <div className="form-group">
              <label>Phone Number</label>
              <input 
                type="tel" 
                className="form-input" 
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
              />
            </div>
            <div className="form-group">
              <label>Emergency Contact</label>
              <input 
                type="text" 
                className="form-input" 
                name="emergencyContact"
                value={formData.emergencyContact}
                onChange={handleInputChange}
              />
            </div>
          </form>
        </div>
      </div>

      <div className="profile-card">
        <div className="profile-card-header">
          <h3 className="profile-card-title">Location & Preferences</h3>
          <button className="btn-secondary edit-btn" type="button">Edit</button>
        </div>
        <div className="profile-card-content">
          <div className="form-group">
            <label>Primary Location</label>
            <select 
              className="form-input"
              name="primaryLocation"
              value={formData.primaryLocation}
              onChange={handleInputChange}
            >
              <option>Sugar Land</option>
              <option>Downtown Houston</option>
              <option>Katy</option>
              <option>Cypress</option>
            </select>
          </div>
          <div className="form-group">
            <label>Travel Radius</label>
            <select 
              className="form-input"
              name="travelRadius"
              value={formData.travelRadius}
              onChange={handleInputChange}
            >
              <option>20 miles</option>
              <option>30 miles</option>
              <option>40 miles</option>
              <option>50 miles</option>
            </select>
          </div>
          <div className="form-group">
            <label>Preferred Language</label>
            <select 
              className="form-input"
              name="preferredLanguage"
              value={formData.preferredLanguage}
              onChange={handleInputChange}
            >
              <option>English</option>
              <option>Spanish</option>
              <option>Both English & Spanish</option>
            </select>
          </div>
          <div className="form-group">
            <label>Transportation</label>
            <div className="checkbox-group">
              <input 
                type="checkbox" 
                className="skill-checkbox" 
                name="hasTransportation"
                checked={formData.hasTransportation}
                onChange={handleInputChange}
              />
              <label>I have reliable transportation</label>
            </div>
          </div>
        </div>
      </div>

      <div className="achievements-card">
        <div className="profile-card">
          <div className="profile-card-header">
            <h3 className="profile-card-title">Achievements & Recognition</h3>
          </div>
          <div className="profile-card-content">
            <div className="achievements-grid">
              <div className="achievement-item">
                <div className="achievement-icon">🌟</div>
                <div className="achievement-title">Top Volunteer!</div>
                <div className="achievement-desc">Most hours in Q4 2025</div>
              </div>
              <div className="achievement-item">
                <div className="achievement-icon">❤️</div>
                <div className="achievement-title">Community Hero!</div>
                <div className="achievement-desc">100+ families helped</div>
              </div>
              <div className="achievement-item">
                <div className="achievement-icon">⭐</div>
                <div className="achievement-title">Perfect Rating!</div>
                <div className="achievement-desc">5.0 average rating</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PersonalInfo;