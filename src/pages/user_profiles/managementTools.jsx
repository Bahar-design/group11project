import React, { useState } from 'react';
import Select from 'react-select';
import DatePicker from 'react-multi-date-picker';
import 'react-multi-date-picker/styles/colors/red.css';
import './userProfile.css';

const ManagementTools = ({ user }) => {
  const [loading, setLoading] = useState({});
  const [showEventModal, setShowEventModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [eventForm, setEventForm] = useState({
    name: '',
    description: '',
    location: '',
    requiredSkills: [],
    urgency: '',
    date: null
  });
  const [eventFormErrors, setEventFormErrors] = useState({});
  const [expandedEvent, setExpandedEvent] = useState(null);

  const quickActions = [
    { id: 'create-event', label: 'Create New Event', icon: '📅' },
    { id: 'send-alert', label: 'Send Volunteer Alert', icon: '📱' },
    { id: 'generate-report', label: 'Generate Event Report', icon: '📊' },
    { id: 'manage-volunteers', label: 'Manage Volunteers', icon: '👥' },
    { id: 'weather-alerts', label: 'Check Weather Alerts', icon: '🌤️' },
    { id: 'view-analytics', label: 'View Performance Analytics', icon: '📈' }
  ];

  const recentActivities = [
    {
      title: 'Created Holiday Drive Event',
      time: '2 hours ago',
      badge: { text: 'NEW', color: 'var(--primary-red)', bg: 'var(--warm-red)' },
      action: 'Event created for Dec 23, Downtown Houston',
      status: '6/12 volunteers signed up',
      borderColor: 'var(--primary-red)'
    },
    {
      title: 'Sent Emergency Weather Alert',
      time: '1 day ago',
      badge: { text: 'ALERT', color: 'var(--warning)', bg: '#fffbeb' },
      action: 'Notified 45 volunteers about weather delay',
      status: 'Event rescheduled successfully',
      borderColor: 'var(--warning)'
    },
    {
      title: 'Approved New Volunteer',
      time: '3 days ago',
      badge: { text: '✓ DONE', color: 'var(--success)', bg: '#f0fdf4' },
      action: 'Background check completed for James Miller',
      status: 'Skills: Customer Service, Leadership',
      borderColor: 'var(--success)'
    }
  ];

  const managementTools = [
    {
      icon: '📊',
      title: 'Volunteer Management',
      description: 'View performance metrics, approve new volunteers, and manage team assignments.',
      buttonText: 'Access Dashboard'
    },
    {
      icon: '🌤️',
      title: 'Weather Integration',
      description: 'Monitor weather conditions and set up automatic alerts for event cancellations.',
      buttonText: 'Weather Dashboard'
    },
    {
      icon: '📱',
      title: 'Communication Hub',
      description: 'Send targeted notifications, emergency alerts, and volunteer updates.',
      buttonText: 'Message Center'
    },
    {
      icon: '📈',
      title: 'Impact Analytics',
      description: 'Generate detailed reports on community impact and volunteer performance.',
      buttonText: 'Analytics Suite'
    }
  ];

  const handleQuickAction = async (actionId) => {
    if (actionId === 'create-event') {
      setShowEventModal(true);
      return;
    }
    if (actionId === 'generate-report') {
      setShowReportModal(true);
      return;
    }
    setLoading(prev => ({ ...prev, [actionId]: true }));
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    setLoading(prev => ({ ...prev, [actionId]: false }));
    console.log('Quick action executed:', actionId);
  };
  // Dummy event data for reports
  const dummyEvents = [
    {
      id: 1,
      name: 'Holiday Drive',
      description: 'Annual holiday event to distribute gifts and food.',
      location: 'Downtown Houston',
      requiredSkills: ['Organization & Sorting', 'Customer Service'],
      urgency: 'High',
      date: '2025-12-23',
      volunteers: [
        { name: 'James Miller', hours: 5 },
        { name: 'Sarah Lee', hours: 4 }
      ],
      status: '6/12 volunteers signed up'
    },
    {
      id: 2,
      name: 'Food Bank Support',
      description: 'Help sort and distribute food donations.',
      location: 'Sugar Land',
      requiredSkills: ['Organization & Sorting'],
      urgency: 'Medium',
      date: '2025-10-15',
      volunteers: [
        { name: 'Alex Kim', hours: 3 }
      ],
      status: '3/8 volunteers signed up'
    }
  ];

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

  const handleEventFormChange = (field, value) => {
    setEventForm(prev => ({ ...prev, [field]: value }));
  };

  const validateEventForm = () => {
    const errors = {};
    if (!eventForm.name || eventForm.name.trim() === '') errors.name = 'Event name is required.';
    if (!eventForm.description || eventForm.description.trim() === '') errors.description = 'Event description is required.';
    if (!eventForm.location || eventForm.location.trim() === '') errors.location = 'Location is required.';
    if (!eventForm.requiredSkills || eventForm.requiredSkills.length === 0) errors.requiredSkills = 'At least one skill is required.';
    if (!eventForm.urgency) errors.urgency = 'Urgency is required.';
    if (!eventForm.date) errors.date = 'Event date is required.';
    return errors;
  };

  const handleEventFormSubmit = (e) => {
    e.preventDefault();
    const errors = validateEventForm();
    setEventFormErrors(errors);
    if (Object.keys(errors).length > 0) return;
    // Simulate event creation
    alert('Event created!');
    setShowEventModal(false);
    setEventForm({
      name: '',
      description: '',
      location: '',
      requiredSkills: [],
      urgency: '',
      date: null
    });
    setEventFormErrors({});
  };

  const handlePrintReport = (event) => {
    // For demo, just alert. In real app, use window.print() or a print library.
    alert(`Printing report for: ${event.name}`);
  };

  const handleToolAccess = (toolTitle) => {
    console.log('Accessing tool:', toolTitle);
    // navigate to the specific tool or open a modal
  };

  return (
    <div>
      {/* Create New Event Modal */}
      {showEventModal && (
        <div className="modal-overlay">
          <div className="profile-card event-modal">
            <div className="profile-card-header event-modal-header">
              <h3 className="profile-card-title">Create New Event</h3>
              <button className="btn-secondary event-modal-close-btn" onClick={() => setShowEventModal(false)}>Close</button>
            </div>
            <div className="profile-card-content">
              <div className="event-modal-description">
                <strong>Administrators can create and manage events.</strong>
              </div>
              <form onSubmit={handleEventFormSubmit} className="event-form">
                <div className="form-group event-form-group-full">
                  <label>Event Name*</label>
                  <input
                    type="text"
                    className="form-input"
                    maxLength={100}
                    value={eventForm.name}
                    onChange={e => handleEventFormChange('name', e.target.value)}
                    required
                  />
                  {eventFormErrors.name && <div className="event-form-error">{eventFormErrors.name}</div>}
                </div>
                <div className="form-group event-form-group-full">
                  <label>Event Description*</label>
                  <textarea
                    className="form-input event-form-textarea"
                    value={eventForm.description}
                    onChange={e => handleEventFormChange('description', e.target.value)}
                    rows={4}
                    required
                  />
                  {eventFormErrors.description && <div className="event-form-error">{eventFormErrors.description}</div>}
                </div>
                <div className="form-group event-form-group-full">
                  <label>Location*</label>
                  <textarea
                    className="form-input event-form-location-textarea"
                    value={eventForm.location}
                    onChange={e => handleEventFormChange('location', e.target.value)}
                    rows={2}
                    required
                  />
                  {eventFormErrors.location && <div className="event-form-error">{eventFormErrors.location}</div>}
                </div>
                <div className="form-group event-form-group-full">
                  <label>Required Skills*</label>
                  <Select
                    isMulti
                    options={skillOptions}
                    value={skillOptions.filter(option => eventForm.requiredSkills.includes(option.value))}
                    onChange={selected => handleEventFormChange('requiredSkills', selected ? selected.map(option => option.value) : [])}
                    className="react-select-container"
                    classNamePrefix="react-select"
                    placeholder="Select required skills..."
                  />
                  {eventFormErrors.requiredSkills && <div className="event-form-error">{eventFormErrors.requiredSkills}</div>}
                </div>
                <div className="form-group">
                  <label>Urgency*</label>
                  <Select
                    options={urgencyOptions}
                    value={urgencyOptions.find(option => option.value === eventForm.urgency) || null}
                    onChange={selected => handleEventFormChange('urgency', selected ? selected.value : '')}
                    className="react-select-container"
                    classNamePrefix="react-select"
                    placeholder="Select urgency..."
                  />
                  {eventFormErrors.urgency && <div className="event-form-error">{eventFormErrors.urgency}</div>}
                </div>
                <div className="form-group">
                  <label>Event Date*</label>
                  <DatePicker
                    value={eventForm.date}
                    onChange={date => handleEventFormChange('date', date)}
                    format="YYYY-MM-DD"
                    className="red"
                    style={{ width: '100%' }}
                    placeholder="Select event date"
                  />
                  {eventFormErrors.date && <div className="event-form-error">{eventFormErrors.date}</div>}
                </div>
                <button className="btn-primary event-form-submit" type="submit">Create Event</button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Generate Event Report Modal */}
      {showReportModal && (
        <div className="modal-overlay">
          <div className="profile-card report-modal">
            <div className="profile-card-header report-modal-header">
              <h3 className="profile-card-title">Event Reports</h3>
              <button className="btn-secondary report-modal-close-btn" onClick={() => setShowReportModal(false)}>Close</button>
            </div>
            <div className="profile-card-content">
              <div className="report-modal-description">
                <strong>Click an event to view details and print the report.</strong>
              </div>
              <div className="report-events-container">
                {dummyEvents.map(event => (
                  <div key={event.id} className="report-event-item">
                    <div className="report-event-header" onClick={() => setExpandedEvent(expandedEvent === event.id ? null : event.id)}>
                      <div>
                        <div className="report-event-title">{event.name}</div>
                        <div className="report-event-meta">{event.date} | {event.location}</div>
                      </div>
                      <button className="btn-secondary report-event-print-btn" onClick={e => { e.stopPropagation(); handlePrintReport(event); }}>Print this report</button>
                    </div>
                    {expandedEvent === event.id && (
                      <div className="report-event-details">
                        <div><strong>Description:</strong> {event.description}</div>
                        <div><strong>Required Skills:</strong> {event.requiredSkills.join(', ')}</div>
                        <div><strong>Urgency:</strong> {event.urgency}</div>
                        <div><strong>Status:</strong> {event.status}</div>
                        <div style={{ marginTop: '0.5rem' }}><strong>Volunteers:</strong></div>
                        <ul className="report-event-volunteers-list">
                          {event.volunteers.map((v, i) => (
                            <li key={i}>{v.name} ({v.hours} hours)</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="profile-grid">
        <div className="profile-card">
          <div className="profile-card-header">
            <h3 className="profile-card-title">Quick Actions</h3>
          </div>
          <div className="profile-card-content">
            <div className="quick-actions-grid">
              {quickActions.map((action) => (
                <button
                  key={action.id}
                  className={`${action.id.includes('create') || action.id.includes('send') ? 'btn-primary' : 'btn-secondary'} quick-action-btn ${loading[action.id] ? 'quick-action-btn-loading' : ''}`}
                  style={{ 
                    opacity: loading[action.id] ? 0.7 : 1,
                    cursor: loading[action.id] ? 'not-allowed' : 'pointer'
                  }}
                  onClick={() => handleQuickAction(action.id)}
                  disabled={loading[action.id] || action.id === 'create-event' && showEventModal || action.id === 'generate-report' && showReportModal}
                >
                  {loading[action.id] ? (
                    <>
                      <div className="loading"></div>
                      Processing...
                    </>
                  ) : (
                    <>
                      {action.icon} {action.label}
                    </>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="profile-card">
          <div className="profile-card-header">
            <h3 className="profile-card-title">Recent Management Activity</h3>
          </div>
          <div className="profile-card-content">
            <div className="activity-list">
              {recentActivities.map((activity, index) => (
                <div 
                  key={index}
                  className="activity-item" 
                  style={{ borderLeftColor: activity.borderColor }}
                >
                  <div className="activity-header">
                    <div>
                      <div className="activity-title">{activity.title}</div>
                      <div className="activity-date">{activity.time}</div>
                    </div>
                    <div 
                      className="activity-badge" 
                      style={{ 
                        background: activity.badge.bg, 
                        color: activity.badge.color 
                      }}
                    >
                      {activity.badge.text}
                    </div>
                  </div>
                  <div className="activity-details">
                    <strong>Action:</strong> {activity.action}<br/>
                    <strong>Status:</strong> {activity.status}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="management-tools-section">
        <div className="profile-card">
          <div className="profile-card-header">
            <h3 className="profile-card-title">Administrative Tools</h3>
          </div>
          <div className="profile-card-content">
            <div className="admin-tools-grid">
              {managementTools.map((tool, index) => (
                <div key={index} className="admin-tool-item">
                  <h4 className="admin-tool-title">
                    {tool.icon} {tool.title}
                  </h4>
                  <p className="admin-tool-description">
                    {tool.description}
                  </p>
                  <button 
                    className="btn-secondary admin-tool-button"
                    onClick={() => handleToolAccess(tool.title)}
                  >
                    {tool.buttonText}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManagementTools;