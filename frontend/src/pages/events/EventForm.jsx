
import React, { useState, useEffect } from 'react';
import Select from 'react-select';
import DatePicker from 'react-multi-date-picker';
import 'react-multi-date-picker/styles/colors/red.css';

// Reusable event form for create/edit
export default function EventForm({
  initialData = {},
  onSubmit,
  onCancel,
  submitLabel = 'Create Event',
  errors = {},
}) {
  const [localErrors, setLocalErrors] = useState({});
  const [form, setForm] = useState({
    name: '',
    description: '',
    location: '',
    requiredSkills: [],
    urgency: '',
    date: '',
    ...initialData,
  });

  useEffect(() => {
    // Only update form if initialData is different from current form
    const isDifferent = Object.keys(initialData).some(
      key => initialData[key] !== form[key]
    );
    if (isDifferent) {
      setForm(f => ({ ...f, ...initialData }));
    }
    // eslint-disable-next-line
  }, [initialData]);

  const [skillOptions, setSkillOptions] = useState([]);

  useEffect(() => {
    // fetch skills from backend
    let cancelled = false;
    async function loadSkills() {
      try {
        // Use Vite env var when deployed (set VITE_API_BASE to your backend base url),
        // otherwise rely on relative '/api' which is proxied in dev via vite.config.js
        const apiBase = (import.meta && import.meta.env && import.meta.env.VITE_API_BASE) ? import.meta.env.VITE_API_BASE : '';
        const res = await fetch(`${apiBase}/api/events/skills`);
        if (!res.ok) throw new Error('Failed to fetch skills: ' + res.status + ' ' + res.statusText);
        const contentType = res.headers.get('content-type') || '';
        if (!contentType.includes('application/json')) {
          // defensive: log returned body (likely HTML index page when proxy is not configured)
          const text = await res.text();
          throw new Error('Expected JSON but received: ' + (text && text.substring(0, 200)));
        }
        const data = await res.json();
        if (cancelled) return;
        // data is expected to be [{ value, label, id }]
        setSkillOptions(Array.isArray(data) ? data : []);
      } catch (e) {
        console.error('Failed to load skills for EventForm:', e.message || e);
        setSkillOptions([]);
      }
    }
    loadSkills();
    return () => { cancelled = true; };
  }, []);

  // Client-side validation to improve UX before hitting the server
  const allowedCities = ['Katy', 'Cypress', 'Sugar Land', 'Tomball', 'Galveston', 'The Woodlands', 'Houston'];
  function clientValidate(values) {
    const errs = {};
    if (!values.name || String(values.name).trim().length === 0) errs.name = 'Event name is required';
    if (!values.description || String(values.description).trim().length === 0) errs.description = 'Event description is required';
    if (!values.location || String(values.location).trim().length === 0) errs.location = 'Location is required';
    else {
      const loc = String(values.location).toLowerCase();
      const found = allowedCities.some(c => loc.includes(c.toLowerCase()));
      if (!found) errs.location = 'Location must include a Houston-area city: ' + allowedCities.join(', ');
    }
    if (!Array.isArray(values.requiredSkills) || values.requiredSkills.length === 0) errs.requiredSkills = 'Select at least one skill';
    if (!values.urgency) errs.urgency = 'Select an urgency';
    if (!values.date || !/^\d{4}-\d{2}-\d{2}$/.test(values.date)) errs.date = 'Select an event date (YYYY-MM-DD)';
    return errs;
  }


  

  const urgencyOptions = [
    { value: 'Low', label: 'Low' },
    { value: 'Medium', label: 'Medium' },
    { value: 'High', label: 'High' },
    { value: 'Critical', label: 'Critical' },
  ];

  const handleChange = (field, value) => {
    setForm(f => ({ ...f, [field]: value }));
  };


  // react-select for skills
  const handleSkillsSelect = (selected) => {
    setForm(f => ({ ...f, requiredSkills: selected ? selected.map(option => option.value) : [] }));
  };

  // react-select for urgency
  const handleUrgencySelect = (selected) => {
    setForm(f => ({ ...f, urgency: selected ? selected.value : '' }));
  };

  // react-multi-date-picker for date
  const handleDateChange = (date) => {
    setForm(f => ({ ...f, date: date ? date.format('YYYY-MM-DD') : '' }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const errs = clientValidate(form);
    if (Object.keys(errs).length > 0) {
      setLocalErrors(errs);
      return;
    }
    // clear previous local errors
    setLocalErrors({});
    onSubmit(form);
  };

  // merge server errors (props) with local validation errors, local take precedence
  const displayErrors = { ...(errors || {}), ...localErrors };

  return (
    <form className="event-form card fade-in" onSubmit={handleSubmit}>
      <h3 style={{ marginBottom: '1.5rem', color: 'var(--primary-red)', fontWeight: 700, letterSpacing: '0.01em' }}>{submitLabel}</h3>
      <div className="form-group event-form-group-full">
        <label>Event Name <span style={{ color: 'var(--primary-red)' }}>*</span></label>
        <input className="form-input" value={form.name} onChange={e => handleChange('name', e.target.value)} maxLength={100} required placeholder="Enter event name (max 100 chars)" style={{ borderColor: 'var(--primary-red)' }} />
        {displayErrors.name && <div className="event-form-error">{displayErrors.name}</div>}
      </div>
      <div className="form-group event-form-group-full">
        <label>Event Description <span style={{ color: 'var(--primary-red)' }}>*</span></label>
        <textarea className="form-input" value={form.description} onChange={e => handleChange('description', e.target.value)} required rows={4} placeholder="Describe the event" style={{ borderColor: 'var(--primary-red)' }} />
        {displayErrors.description && <div className="event-form-error">{displayErrors.description}</div>}
      </div>
      <div className="form-group event-form-group-full">
        <label>Location <span style={{ color: 'var(--primary-red)' }}>*</span></label>
        <textarea className="form-input" value={form.location} onChange={e => handleChange('location', e.target.value)} required rows={2} placeholder="Enter an address and name if applicable for the event's location." style={{ borderColor: 'var(--primary-red)' }} />
        {displayErrors.location && <div className="event-form-error">{displayErrors.location}</div>}
      </div>
      <div className="form-group event-form-group-full">
        <label>Required Skills <span style={{ color: 'var(--primary-red)' }}>*</span></label>
        <Select
          isMulti
          options={skillOptions}
          value={skillOptions.filter(option => form.requiredSkills.includes(option.value))}
          onChange={handleSkillsSelect}
          className="react-select-container"
          classNamePrefix="react-select"
          placeholder="Select required skills..."
          required
        />
        <div style={{ marginTop: '0.5em' }}>
            {form.requiredSkills.map(skill => (
                <span className="skill-chip" key={skill}>{skill}</span>
            ))}
        </div>
        {displayErrors.requiredSkills && <div className="event-form-error">{displayErrors.requiredSkills}</div>}
      </div>
      <div className="form-group">
        <label>Urgency <span style={{ color: 'var(--primary-red)' }}>*</span></label>
        <Select
          options={urgencyOptions}
          value={urgencyOptions.find(option => option.value === form.urgency) || null}
          onChange={handleUrgencySelect}
          className="react-select-container"
          classNamePrefix="react-select"
          placeholder="Select urgency..."
          required
        />
        {errors.urgency && <div className="event-form-error">{errors.urgency}</div>}
      </div>
      <div className="form-group">
        <label>Event Date <span style={{ color: 'var(--primary-red)' }}>*</span></label>
        <DatePicker
          value={form.date}
          onChange={handleDateChange}
          format="YYYY-MM-DD"
          className="red"
          style={{ width: '100%' }}
          placeholder="Select event date"
          required
        />
        {displayErrors.date && <div className="event-form-error">{displayErrors.date}</div>}
      </div>
      <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
        <button type="submit" className="btn-primary event-form-submit" style={{ background: 'linear-gradient(135deg, var(--primary-red), var(--accent-red))', border: 'none', fontWeight: 600 }}>{submitLabel}</button>
        {onCancel && <button type="button" className="btn-secondary" onClick={onCancel} style={{ border: '1px solid var(--primary-red)', color: 'var(--primary-red)', background: 'var(--white)' }}>Cancel</button>}
      </div>
      {displayErrors.submit && <div style={{ marginTop: '1rem' }} className="event-form-error">{displayErrors.submit}</div>}
    </form>
  );
}
