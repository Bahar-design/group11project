
import React, { useState, useEffect, useContext, createContext } from 'react';
import axios from 'axios';

// Context for global user info (name, initials)
export const UserProfileContext = createContext();


const getInitials = (name) => {
  if (!name) return '';
  const parts = name.trim().split(' ');
  if (parts.length === 1) return parts[0][0]?.toUpperCase() || '';
  return (parts[0][0] + (parts[1]?.[0] || '')).toUpperCase();
};

const AdminInfo = ({ user }) => {
  const { userProfile, setUserProfile } = useContext(UserProfileContext) || {};
  const [formData, setFormData] = useState(userProfile || {
    name: '',
    email: '',
    phone: '',
    address1: '',
    address2: '',
    city: '',
    state: '',
    zipCode: '',
    adminLevel: 'Regional Administrator',
    department: 'Southwest Regional Operations',
    startDate: '2023-06-15',
    emergencyContact: 'Regional Director - (713) 555-0001'
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  // Fetch user profile from backend on mount
  // On mount, fetch latest profile for this admin (by email if available)
  useEffect(() => {
    setLoading(true);
    const base = (window.__API_BASE__ || '') || '';
    const apiBase = base.replace(/\/$/, '') || '';
    let url = `${apiBase}/api/user-profile?type=admin`;
    if (user?.email) url += `&email=${encodeURIComponent(user.email)}`;
    axios.get(url)
      .then(res => {
        setFormData(prev => ({ ...prev, ...res.data }));
        if (setUserProfile) setUserProfile(res.data);
        setLoading(false);
      })
      .catch(err => {
        setError('Failed to load user profile');
        setLoading(false);
      });
    // eslint-disable-next-line
  }, [user?.email]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // If name changes, update context/global
    if (name === 'name' && setUserProfile) {
      setUserProfile(prev => ({ ...prev, name: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    try {
      const base = (window.__API_BASE__ || '') || '';
      const apiBase = base.replace(/\/$/, '') || '';
      const emailQuery = formData.email ? `&email=${encodeURIComponent(formData.email)}` : '';
      const res = await axios.post(`${apiBase}/api/user-profile?type=admin${emailQuery}`, formData);
      setFormData(prev => ({ ...prev, ...res.data }));
      if (setUserProfile) setUserProfile(res.data);
      setSuccess(true);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save profile');
    }
  };

  const regions = ['Sugar Land', 'Katy', 'Southwest Houston'];
  const monthlyStats = [
    { icon: '📅', number: '12', label: 'Events This Month' },
    { icon: '👥', number: '85', label: 'Active Volunteers' },
    { icon: '⭐', number: '4.8', label: 'Avg Event Rating' },
    { icon: '🚨', number: '3', label: 'Emergency Responses' }
  ];

  if (loading) return <div>Loading...</div>;
  // Show initials in big red circle above name
  const initials = getInitials(formData.name);
  return (
    <div>
      {error && <div style={{ color: 'red', marginBottom: 10 }}>{error}</div>}
      {success && <div style={{ color: 'green', marginBottom: 10 }}>Profile saved!</div>}
      <div className="profile-grid">
        <div className="profile-card">
          <div className="profile-card-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{
                width: 56, height: 56, borderRadius: '50%', background: 'var(--primary-red)',
                color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, fontWeight: 700
              }}>{initials}</div>
              <div>
                <h3 className="profile-card-title" style={{ margin: 0 }}>{formData.name || 'Administrator Profile'}</h3>
                <div style={{ color: 'var(--medium-silver)', fontSize: 14 }}>{formData.email}</div>
              </div>
            </div>
            <button className="btn-secondary edit-btn" type="button">
              Edit Profile
            </button>
          </div>
          <div className="profile-card-content">
            <form onSubmit={handleSubmit}>
              {/* ...existing form fields... */}
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
              <button type="submit" className="btn-primary" style={{ marginTop: 16 }}>Save Profile</button>
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