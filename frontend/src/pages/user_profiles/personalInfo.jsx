import React, { useState, useRef, useEffect, useContext } from 'react';
// Context for global user info (name, initials)
import { UserProfileContext } from './adminInfo';
import Select from 'react-select';
import DatePicker from 'react-multi-date-picker';
import 'react-multi-date-picker/styles/colors/red.css';
import axios from 'axios';
import API_BASE from '../../lib/apiBase';

const getInitials = (name) => {
  if (!name) return '';
  const parts = name.trim().split(' ');
  if (parts.length === 1) return parts[0][0]?.toUpperCase() || '';
  return (parts[0][0] + (parts[1]?.[0] || '')).toUpperCase();
};

const PersonalInfo = ({ user }) => {
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
    emergencyContact: '',
    primaryLocation: 'Sugar Land',
    skills: [],
    preferences: '',
    availability: [],
    travelRadius: '20 miles',
    hasTransportation: true
  });
  const [availability, setAvailability] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  // Fetch user profile from backend on mount
  useEffect(() => {
    setLoading(true);
    const base = API_BASE.replace(/\/$/, '');
    let url = `${base}/api/user-profile?type=volunteer`;
    if (user?.email) url += `&email=${encodeURIComponent(user.email)}`;
    axios.get(url)
      .then(res => {
        setFormData(prev => ({ ...prev, ...res.data }));
        setAvailability(Array.isArray(res.data.availability) ? res.data.availability : []);
        if (setUserProfile) setUserProfile(res.data);
        setLoading(false);
      })
      .catch(err => {
        setError('Failed to load user profile');
        setLoading(false);
      });
    // eslint-disable-next-line
  }, [user?.email]);
  const calendarContainerRef = useRef(null);

  const handleInputChange = (e) => {
    const { name, value, type, checked, multiple, options } = e.target;
    if (name === 'skills') {
      const selected = Array.from(options).filter(o => o.selected).map(o => o.value);
      setFormData(prev => ({
        ...prev,
        skills: selected
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
      // If name changes, update context/global
      if (name === 'name' && setUserProfile) {
        setUserProfile(prev => ({ ...prev, name: value }));
      }
    }
  };

  // Update both local state and formData for multi-date picker
  const handleAvailabilityChange = (dates) => {
    setAvailability(dates);
    setFormData(f => ({ ...f, availability: dates }));
  };

  // Custom handler for day clicks
  useEffect(() => {
    const calendar = calendarContainerRef.current;
    if (!calendar) return;
    const handleDayClick = (e) => {
      const dayButton = e.target.closest('.react-datepicker__day');
      if (!dayButton || dayButton.classList.contains('react-datepicker__day--outside-month')) return;
      const dateString = dayButton.getAttribute('data-date');
      if (!dateString) return;
      const clickedDate = new Date(dateString);
      if (isNaN(clickedDate.getTime())) return; // skip invalid dates
      setAvailability(prev => {
        const exists = prev.some(d => d.toDateString() === clickedDate.toDateString());
        let newDates;
        if (exists) {
          newDates = prev.filter(d => d.toDateString() !== clickedDate.toDateString());
        } else {
          newDates = [...prev, clickedDate];
        }
        setFormData(f => ({ ...f, availability: newDates }));
        return newDates;
      });
    };
    calendar.addEventListener('click', handleDayClick);
    return () => calendar.removeEventListener('click', handleDayClick);
  }, [calendarContainerRef, setAvailability]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    if (availability.length === 0) {
      setError('Please select at least one available date.');
      return;
    }
    const submitData = { ...formData, availability };
    try {
      const base = API_BASE.replace(/\/$/, '');
      const res = await axios.post(`${base}/api/user-profile?type=volunteer`, submitData);
      setFormData(prev => ({ ...prev, ...res.data }));
      if (setUserProfile) setUserProfile(res.data);
      setSuccess(true);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save profile');
    }
  };

  // Skill options for react-select
  const skillOptions = [
    { value: 'Tailoring & Alterations', label: 'Tailoring & Alterations' },
    { value: 'Sewing & Stitching', label: 'Sewing & Stitching' },
    { value: 'Customer Service', label: 'Customer Service' },
    { value: 'Organization & Sorting', label: 'Organization & Sorting' },
    { value: 'Communication', label: 'Communication' },
    { value: 'Bilingual', label: 'Bilingual' },
    { value: 'Leadership & Training', label: 'Leadership & Training' },
    { value: 'Computer Skills & Data Entry', label: 'Computer Skills & Data Entry' },
    { value: 'Business & Administration', label: 'Business & Administration' },
    { value: 'Adaptability & Problem Solving', label: 'Adaptability & Problem Solving' },
  ];

  if (loading) return <div>Loading...</div>;
  // Show initials in big red circle above name
  const initials = getInitials(formData.name);
  return (
    <div className="profile-grid">
      {error && <div style={{ color: 'red', marginBottom: 10 }}>{error}</div>}
      {success && <div style={{ color: 'green', marginBottom: 10 }}>Profile saved!</div>}
      <div className="profile-card">
        <div className="profile-card-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{
              width: 56, height: 56, borderRadius: '50%', background: 'var(--primary-red)',
              color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, fontWeight: 700
            }}>{initials}</div>
            <div>
              <h3 className="profile-card-title" style={{ margin: 0 }}>{formData.name || 'Complete Your Volunteer Profile'}</h3>
              <div style={{ color: 'var(--medium-silver)', fontSize: 14 }}>{formData.email}</div>
            </div>
          </div>
          <button className="btn-secondary edit-btn" type="button">Edit</button>
        </div>
        <div className="profile-card-content">
          <form onSubmit={handleSubmit}>
            {/* Personal Info */}
            <div className="form-group">
              <label>Full Name*</label>
              <input 
                type="text" 
                className="form-input" 
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                maxLength={50}
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
              <label>Emergency Contact</label>
              <input 
                type="text" 
                className="form-input" 
                name="emergencyContact"
                value={formData.emergencyContact}
                onChange={handleInputChange}
              />
            </div>

            {/* Location, Preferences, Skills */}
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
              <label>Skills*</label>
              <Select
                isMulti
                name="skills"
                options={skillOptions}
                value={skillOptions.filter(option => formData.skills.includes(option.value))}
                onChange={selected => setFormData(prev => ({
                  ...prev,
                  skills: selected ? selected.map(option => option.value) : []
                }))}
                className="react-select-container"
                classNamePrefix="react-select"
                placeholder="Select your skills..."
                required
              />
              <div style={{ fontSize: '0.85em', color: '#888', marginTop: '0.3em', minHeight: '1.5em' }}>
                {formData.skills && formData.skills.length > 0 && formData.skills.map(skill => (
                  <span key={skill} className="skill-chip">{skill}</span>
                ))}
              </div>
            </div>
            <div className="form-group">
              <label>Preferences</label>
              <textarea 
                className="form-input" 
                name="preferences"
                value={formData.preferences}
                placeholder="Write any preferences you have for volunteering that we should know about..."
                onChange={handleInputChange}
                rows={8}
                maxLength={500}
              />
            </div>
            <div className="form-group">
              <label>Availability* (choose one or more dates)</label>
              <DatePicker
                multiple
                value={availability}
                onChange={handleAvailabilityChange}
                format="YYYY-MM-DD"
                className="red"
                style={{ width: '100%' }}
                placeholder="Select one or more dates"
                required
              />
              <div style={{ fontSize: '0.9em', color: '#888', marginTop: '0.5em' }}>
                (Click dates to select/deselect. Selected dates are highlighted.)
              </div>
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
            <button className="btn-primary" type="submit">Save Profile</button>
          </form>
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
                <div className="achievement-title">Top Volunteer</div>
                <div className="achievement-desc">Most hours in Q4 2025</div>
              </div>
              <div className="achievement-item">
                <div className="achievement-icon">❤️</div>
                <div className="achievement-title">Community Hero</div>
                <div className="achievement-desc">100+ families helped</div>
              </div>
              <div className="achievement-item">
                <div className="achievement-icon">⭐</div>
                <div className="achievement-title">Perfect Rating</div>
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