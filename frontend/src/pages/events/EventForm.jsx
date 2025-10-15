
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
    onSubmit(form);
  };

  return (
    <form className="event-form card fade-in" onSubmit={handleSubmit}>
      <h3 style={{ marginBottom: '1.5rem', color: 'var(--primary-red)', fontWeight: 700, letterSpacing: '0.01em' }}>{submitLabel}</h3>
      <div className="form-group event-form-group-full">
        <label>Event Name <span style={{ color: 'var(--primary-red)' }}>*</span></label>
        <input className="form-input" value={form.name} onChange={e => handleChange('name', e.target.value)} maxLength={100} required placeholder="Enter event name (max 100 chars)" style={{ borderColor: 'var(--primary-red)' }} />
        {errors.name && <div className="event-form-error">{errors.name}</div>}
      </div>
      <div className="form-group event-form-group-full">
        <label>Event Description <span style={{ color: 'var(--primary-red)' }}>*</span></label>
        <textarea className="form-input" value={form.description} onChange={e => handleChange('description', e.target.value)} required rows={4} placeholder="Describe the event" style={{ borderColor: 'var(--primary-red)' }} />
        {errors.description && <div className="event-form-error">{errors.description}</div>}
      </div>
      <div className="form-group event-form-group-full">
        <label>Location <span style={{ color: 'var(--primary-red)' }}>*</span></label>
        <textarea className="form-input" value={form.location} onChange={e => handleChange('location', e.target.value)} required rows={2} placeholder="Event location" style={{ borderColor: 'var(--primary-red)' }} />
        {errors.location && <div className="event-form-error">{errors.location}</div>}
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
        {errors.requiredSkills && <div className="event-form-error">{errors.requiredSkills}</div>}
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
        {errors.date && <div className="event-form-error">{errors.date}</div>}
      </div>
      <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
        <button type="submit" className="btn-primary event-form-submit" style={{ background: 'linear-gradient(135deg, var(--primary-red), var(--accent-red))', border: 'none', fontWeight: 600 }}>{submitLabel}</button>
        {onCancel && <button type="button" className="btn-secondary" onClick={onCancel} style={{ border: '1px solid var(--primary-red)', color: 'var(--primary-red)', background: 'var(--white)' }}>Cancel</button>}
      </div>
    </form>
  );
}
