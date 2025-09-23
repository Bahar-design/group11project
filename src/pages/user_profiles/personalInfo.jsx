import React, { useState, useRef, useEffect } from 'react';
import Select from 'react-select';
import DatePicker from 'react-multi-date-picker';
import 'react-multi-date-picker/styles/colors/red.css';

const PersonalInfo = ({ user }) => {
  const [formData, setFormData] = useState({
    name: user.name || "",
    email: user.email || "",
    phone: user.phone || "",
    address1: user.address1 || "",
    address2: user.address2 || "",
    city: user.city || "",
    state: user.state || "",
    zipCode: user.zipCode || "",
    emergencyContact: user.emergencyContact || "",
    primaryLocation: user.primaryLocation || "Sugar Land",
    skills: Array.isArray(user.skills) ? user.skills.map(String) : [],
    preferences: user.preferences || "",
    availability: Array.isArray(user.availability) ? user.availability : [],
    travelRadius: user.travelRadius || "20 miles",
    hasTransportation: user.hasTransportation !== undefined ? user.hasTransportation : true
  });
  const [availability, setAvailability] = useState(
    Array.isArray(user.availability)
      ? user.availability.map(date => (date instanceof Date ? date : new Date(date)))
      : []
  );
  const calendarContainerRef = useRef(null);

  const handleInputChange = (e) => {
    const { name, value, type, checked, multiple, options } = e.target;
    if (name === 'skills') {
      // for multi-select, update both formData and preserve focus/selection
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

  const handleSubmit = (e) => {
    e.preventDefault();
    if (availability.length === 0) {
      alert('Please select at least one available date.');
      return;
    }
    console.log('Saving personal info:', formData);
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

  return (
    <div className="profile-grid">
      <div className="profile-card">
        <div className="profile-card-header">
          <h3 className="profile-card-title">Complete Your Volunteer Profile</h3>
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