import React, { useState, useRef, useEffect, useContext } from 'react';
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
    skills: [],
    preferences: '',
    availability: [],
    hasTransportation: true
  });
  const [availability, setAvailability] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [serverErrorDetails, setServerErrorDetails] = useState(null);
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
        console.error('Load profile error:', err);
        setError('Failed to load user profile');
        setLoading(false);
      });

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
    }
  };

  // Update both local state and formData for multi-date picker
  const handleAvailabilityChange = (dates) => {
    console.log('DatePicker onChange - Raw dates:', dates);
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
    setServerErrorDetails(null);
    setSuccess(false);
    console.log('Current formData:', formData);
    console.log('Current availability state:', availability);
    if (!availability || availability.length === 0) {
      setError('Please select at least one available date.');
      return;
    }
    // Basic client-side validation to catch obvious problems before posting
    if (!formData.name || formData.name.trim().length === 0) {
      setError('Full name is required');
      return;
    }
    if (!formData.address1 || formData.address1.trim().length === 0) {
      setError('Address Line 1 is required');
      return;
    }
    if (!formData.city || formData.city.trim().length === 0) {
      setError('City is required');
      return;
    }
    if (!formData.state || formData.state.length !== 2) {
      setError('Please select a valid 2-letter state');
      return;
    }
    if (!formData.zipCode || String(formData.zipCode).trim().length < 5) {
      setError('Zip Code must be at least 5 characters');
      return;
    }
    // Convert DatePicker dates to YYYY-MM-DD strings
    const formattedAvailability = availability.map(date => {
      console.log('Processing date:', date, 'Type:', typeof date);

      // Handle react-multi-date-picker DateObject
      if (date && typeof date === 'object') {
        // If it has a format method (DatePicker DateObject)
        if (typeof date.format === 'function') {
          const formatted = date.format('YYYY-MM-DD');
          console.log('Formatted using date.format():', formatted);
          return formatted;
        }

        // If it's a regular Date object
        if (date instanceof Date) {
          const formatted = date.toISOString().substring(0, 10);
          console.log('Formatted Date object:', formatted);
          return formatted;
        }

        // If it has year/month/day properties (DateObject structure)
        if (date.year && date.month && date.day) {
          const month = String(date.month.number || date.month).padStart(2, '0');
          const day = String(date.day).padStart(2, '0');
          const formatted = `${date.year}-${month}-${day}`;
          console.log('Formatted from properties:', formatted);
          return formatted;
        }
      }

      // If already a string
      if (typeof date === 'string') {
        const formatted = date.split('T')[0];
        console.log('Already string, cleaned:', formatted);
        return formatted;
      }

      console.warn('Unknown date format:', date);
      return null;
    }).filter(Boolean);

    // Extra safety: convert any numeric timestamps (or numeric strings) to YYYY-MM-DD
    const normalizedAvailability = formattedAvailability.map(d => {
      if (!d) return null;
      // numeric string or number
      if (/^\d{10,13}$/.test(String(d))) {
        const dt = new Date(Number(d));
        if (!Number.isNaN(dt.getTime())) return dt.toISOString().substring(0,10);
      }
      return String(d).split('T')[0];
    }).filter(Boolean);

    console.log('Final formatted availability:', formattedAvailability);
    if (normalizedAvailability.length === 0) {
      setError('Could not format dates. Please try selecting dates again.');
      return;
    }
    // Build the submit data with normalized dates
    const submitData = { ...formData, availability: normalizedAvailability };

    console.log('Submit data to send:', JSON.stringify(submitData, null, 2));

    try {
      const base = API_BASE.replace(/\/$/, '');
      const emailQuery = formData.email ? `&email=${encodeURIComponent(formData.email)}` : '';
      const res = await axios.post(`${base}/api/user-profile?type=volunteer${emailQuery}`, submitData);
      setFormData(prev => ({ ...prev, ...res.data }));
      if (setUserProfile) {
        setUserProfile(res.data);
        try { localStorage.setItem('hh_userProfile', JSON.stringify(res.data)); } catch (err) {}
      }
      setSuccess(true);
    } catch (err) {
      // Capture and display more detailed server error info to help debugging
      console.error('Error response.data:', err.response?.data);
      console.error('Error status:', err.response?.status);
      console.error('Error headers:', err.response?.headers);
      console.error('Error message:', err.message);
      console.error('Full error object:', err);

      // Prefer structured server message when available
      const errorMsg = err.response?.data?.message || err.response?.data?.error || err.message || 'Failed to save profile';
      setError(errorMsg);
      setServerErrorDetails({
        status: err.response?.status || null,
        data: err.response?.data || null,
        headers: err.response?.headers || null,
        message: err.message
      });
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

            {/* Preferences & Skills */}
            <div className="form-group">
              <label>Skills*</label>
              <Select
                isMulti
                name="skills"
                options={skillOptions}
                value={skillOptions.filter(option => Array.isArray(formData.skills) && formData.skills.includes(option.value))}
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
          {serverErrorDetails && (
            <div style={{ marginTop: 12, background: '#fee', padding: 10, border: '1px solid #f88' }}>
              <strong>Server error:</strong>
              <div>Status: {serverErrorDetails.status ?? 'unknown'}</div>
              <div style={{ whiteSpace: 'pre-wrap', marginTop: 6 }}>{JSON.stringify(serverErrorDetails.data || serverErrorDetails.message, null, 2)}</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PersonalInfo;