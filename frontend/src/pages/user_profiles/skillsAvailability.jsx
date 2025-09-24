import React, { useState } from 'react';

const SkillsAvailability = ({ user }) => {
  const [selectedSkills, setSelectedSkills] = useState([
    'bilingual-spanish',
    'leadership'
  ]);
  
  const [timePreference, setTimePreference] = useState('afternoon');
  const [availableDays, setAvailableDays] = useState(['saturday', 'sunday', 'monday-evening']);
  const [specialPreferences, setSpecialPreferences] = useState([
    'emergency-response',
    'families-children'
  ]);

  const skills = [
    { id: 'bilingual-spanish', label: 'Bilingual (Spanish)' },
    { id: 'leadership', label: 'Leadership' },
    { id: 'tailoring', label: 'Tailoring' },
    { id: 'computer-skills', label: 'Computer Skills' },
    { id: 'business-admin', label: 'Business & Admin' },
    { id: 'sewing', label: 'Sewing & Stitching' }
  ];

  const timeOptions = [
    { id: 'morning', label: 'Morning Shifts (12-4pm)' },
    { id: 'afternoon', label: 'Afternoon Shifts (4-8pm)' },
    { id: 'both', label: 'Both Shifts (Flexible)' }
  ];

  const dayOptions = [
    { id: 'monday', label: 'Monday' },
    { id: 'tuesday', label: 'Tuesday' },
    { id: 'wednesday', label: 'Wednesday' },
    { id: 'thursday', label: 'Thursday' },
    { id: 'friday', label: 'Friday' },
    { id: 'saturday', label: 'Saturday' },
    { id: 'sunday', label: 'Sunday' },
    { id: 'monday-evening', label: 'Monday Evenings' }
  ];

  const specialOptions = [
    { id: 'emergency-response', label: 'Emergency disaster response' },
    { id: 'families-children', label: 'Working with families & children' },
    { id: 'provide-transport', label: 'Can provide transportation' },
    { id: 'host-events', label: 'Can host collection events' }
  ];

  const handleSkillToggle = (skillId) => {
    setSelectedSkills(prev => 
      prev.includes(skillId) 
        ? prev.filter(id => id !== skillId)
        : [...prev, skillId]
    );
  };

  const handleDayToggle = (dayId) => {
    setAvailableDays(prev => 
      prev.includes(dayId) 
        ? prev.filter(id => id !== dayId)
        : [...prev, dayId]
    );
  };

  const handleSpecialToggle = (prefId) => {
    setSpecialPreferences(prev => 
      prev.includes(prefId) 
        ? prev.filter(id => id !== prefId)
        : [...prev, prefId]
    );
  };

  const handleSave = () => {
    const data = {
      skills: selectedSkills,
      timePreference,
      availableDays,
      specialPreferences
    };
    console.log('Saving skills and availability:', data);
  };

  return (
    <div>
      <div className="profile-grid">
        <div className="profile-card">
          <div className="profile-card-header">
            <h3 className="profile-card-title">Your Skills</h3>
            <button className="btn-secondary edit-btn" type="button">
              Update Skills
            </button>
          </div>
          <div className="profile-card-content">
            <p style={{ marginBottom: '1.5rem', color: 'var(--text-secondary)' }}>
              Select all skills that apply to help us match you with the perfect volunteer opportunities.
            </p>
            <div className="skills-grid">
              {skills.map((skill) => (
                <div 
                  key={skill.id}
                  className={`skill-item ${selectedSkills.includes(skill.id) ? 'selected' : ''}`}
                >
                  <input
                    type="checkbox"
                    className="skill-checkbox"
                    checked={selectedSkills.includes(skill.id)}
                    onChange={() => handleSkillToggle(skill.id)}
                  />
                  <label>{skill.label}</label>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="profile-card">
          <div className="profile-card-header">
            <h3 className="profile-card-title">Availability Schedule</h3>
            <button className="btn-secondary edit-btn" type="button">
              Update Schedule
            </button>
          </div>
          <div className="profile-card-content">
            <div className="form-group">
              <label>Preferred Time Slots</label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '0.5rem' }}>
                {timeOptions.map((option) => (
                  <label key={option.id} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <input
                      type="radio"
                      name="time-preference"
                      value={option.id}
                      checked={timePreference === option.id}
                      onChange={(e) => setTimePreference(e.target.value)}
                      style={{ accentColor: 'var(--primary-red)' }}
                    />
                    <span>{option.label}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="form-group">
              <label>Available Days</label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.75rem', marginTop: '0.5rem' }}>
                {dayOptions.map((day) => (
                  <label key={day.id} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <input
                      type="checkbox"
                      className="skill-checkbox"
                      checked={availableDays.includes(day.id)}
                      onChange={() => handleDayToggle(day.id)}
                    />
                    <span>{day.label}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="form-group">
              <label>Special Preferences</label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '0.5rem' }}>
                {specialOptions.map((pref) => (
                  <label key={pref.id} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <input
                      type="checkbox"
                      className="skill-checkbox"
                      checked={specialPreferences.includes(pref.id)}
                      onChange={() => handleSpecialToggle(pref.id)}
                    />
                    <span>{pref.label}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div style={{ marginTop: '2rem' }}>
        <button 
          className="btn-primary" 
          style={{ width: '100%', padding: '1.25rem', fontSize: '1.1rem' }}
          onClick={handleSave}
        >
        Save Skills & Availability Updates
        </button>
      </div>
    </div>
  );
};

export default SkillsAvailability;