import React, { useState } from 'react';

const AdminInfo = ({ user }) => {
  const [formData, setFormData] = useState({
    name: user.name || '',
    email: user.email || '',
    phone: user.phone || '',
    address1: user.address1 || '',
    address2: user.address2 || '',
    city: user.city || '',
    state: user.state || '',
    zipCode: user.zipCode || '',
    adminLevel: user.adminLevel || 'Regional Administrator',
    department: user.department || 'Southwest Regional Operations',
    startDate: user.startDate || '2023-06-15',
    emergencyContact: user.emergencyContact || 'Regional Director - (713) 555-0001'
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Saving admin info:', formData);
  };

  const regions = ['Sugar Land', 'Katy', 'Southwest Houston'];
  const monthlyStats = [
    { icon: '📅', number: '12', label: 'Events This Month' },
    { icon: '👥', number: '85', label: 'Active Volunteers' },
    { icon: '⭐', number: '4.8', label: 'Avg Event Rating' },
    { icon: '🚨', number: '3', label: 'Emergency Responses' }
  ];

  return (
    <div>
      <div className="profile-grid">
        <div className="profile-card">
          <div className="profile-card-header">
            <h3 className="profile-card-title">Administrator Profile</h3>
            <button className="btn-secondary edit-btn" type="button">
              Edit Profile
            </button>
          </div>
          <div className="profile-card-content">
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Full Name*</label>
                <input
                  type="text"
                  className="form-input"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Email Address*</label>
                <input
                  type="email"
                  className="form-input"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Phone Number*</label>
                <input
                  type="tel"
                  className="form-input"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
              <label>Address Line 1*</label>
              <input 
                type="text" 
                className="form-input" 
                name="address1"
                value={formData.address1}
                onChange={handleInputChange}
                maxLength={100}
                required
              />
            </div>
            <div className="form-group">
              <label>Address line 2</label>
              <input 
                type="text" 
                className="form-input" 
                name="address2"
                value={formData.address2}
                onChange={handleInputChange}
                maxLength={100}
              />
            </div>
            <div className="form-group">
              <label>City*</label>
              <input 
                type="text" 
                className="form-input" 
                name="city"
                value={formData.city}
                onChange={handleInputChange}
                maxLength={100}
                required
              />
            </div>
            <div className="form-group">
              <label>State*</label>
              <select
                className="form-input"
                name="state"
                value={formData.state}
                onChange={handleInputChange}
                required
              >
                <option value="">Select State</option>
                <option value="TX">Texas</option>
                <option value="CA">California</option>
                <option value="NY">New York</option>
                <option value="FL">Florida</option>
              </select>
            </div>
            <div className="form-group">
              <label>Zip Code*</label>
              <input 
                type="text" 
                className="form-input" 
                name="zipCode"
                value={formData.zipCode}
                onChange={handleInputChange}
                minLength={5}
                maxLength={9}
                required
              />
            </div>
              <div className="form-group">
                <label>Administrator Level*</label>
                <select 
                  className="form-input"
                  name="adminLevel"
                  value={formData.adminLevel}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Select Admin Level</option>
                  <option value="Regional Administrator">Regional Administrator</option>
                  <option value="Site Administrator">Site Administrator</option>
                  <option value="Super Administrator">Super Administrator</option>
                </select>
              </div>
              <div className="form-group">
                <label>Regions Managed</label>
                <div style={{ 
                  display: 'flex', 
                  flexWrap: 'wrap', 
                  gap: '0.5rem', 
                  marginTop: '0.5rem' 
                }}>
                  {regions.map((region, index) => (
                    <span
                      key={index}
                      style={{
                        background: 'var(--primary-red)',
                        color: 'white',
                        padding: '0.25rem 0.75rem',
                        borderRadius: '12px',
                        fontSize: '0.875rem'
                      }}
                    >
                      {region}
                    </span>
                  ))}
                </div>
              </div>
            </form>
          </div>
        </div>

        <div className="profile-card">
          <div className="profile-card-header">
            <h3 className="profile-card-title">Organization Details</h3>
            <button className="btn-secondary edit-btn" type="button">
              Update
            </button>
          </div>
          <div className="profile-card-content">
            <div className="form-group">
              <label>Organization</label>
              <input
                type="text"
                className="form-input"
                value="Houston Hearts Clothing Drive"
                readOnly
                style={{ background: 'var(--medium-silver)' }}
              />
            </div>
            <div className="form-group">
              <label>Department</label>
              <input
                type="text"
                className="form-input"
                name="department"
                value={formData.department}
                onChange={handleInputChange}
              />
            </div>
            <div className="form-group">
              <label>Start Date</label>
              <input
                type="date"
                className="form-input"
                name="startDate"
                value={formData.startDate}
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
          </div>
        </div>
      </div>

      <div style={{ marginTop: '2rem' }}>
        <div className="admin-stats-grid">
          {monthlyStats.map((stat, index) => (
            <div key={index} className="admin-stat-card">
              <div className="admin-stat-icon">{stat.icon}</div>
              <div className="admin-stat-number">{stat.number}</div>
              <div className="admin-stat-label">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminInfo;