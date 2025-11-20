
import React, { useState, useEffect } from 'react';
import EventForm from './EventForm';
import API_BASE from '../../lib/apiBase';
import Layout from '../../components/layout.jsx';
import './events.css';

// Events page uses backend API

export default function EventsPage({ isLoggedIn, user }) {
  const [events, setEvents] = useState([]);
  const [editingEventId, setEditingEventId] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(true);
  // For simplicity, no validation errors
  const [formErrors, setFormErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [openVolunteers, setOpenVolunteers] = useState({});

  useEffect(() => {
    loadEvents();
  }, []);

  async function loadEvents() {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/events`);
      const data = await res.json();
      setEvents(data);
    } catch (err) {
      console.error('Failed to load events', err);
    } finally {
      setLoading(false);
    }
  }

  const handleCreate = async (data) => {
    // data: { name, description, location, requiredSkills, urgency, date }
    try {
  // include admin id as createdBy if available
  const createdBy = user && (user.id || user.user_id) ? (user.id || user.user_id) : null;
  const payload = { ...data, createdBy };
      const res = await fetch(`${API_BASE}/api/events`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      if (!res.ok) {
        // try to read JSON error body for better diagnostics
        let detail = null;
        try { detail = await res.json(); } catch (e) { detail = await res.text(); }
        console.error('Create event failed, server response:', res.status, detail);
        setFormErrors({ submit: detail && (detail.error || detail.message) ? (detail.error || detail.message) : 'Failed to create event' });
        return;
      }
      const created = await res.json();
      // reload events to reflect DB
      await loadEvents();
      setShowCreateForm(false);
      setTimeout(() => setShowCreateForm(true), 500);
    } catch (err) {
      console.error('create event error', err);
      setFormErrors({ submit: 'Failed to create event' });
    }
  };

  const handleEdit = async (id, data) => {
    try {
      const res = await fetch(`${API_BASE}/api/events/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
      if (!res.ok) throw new Error('Update failed');
      await loadEvents();
      setEditingEventId(null);
    } catch (err) {
      console.error('update event error', err);
      setFormErrors({ submit: 'Failed to update event' });
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this event?')) return;
    try {
      const res = await fetch(`${API_BASE}/api/events/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Delete failed');
      await loadEvents();
    } catch (err) {
      console.error('delete event error', err);
    }
  };

  async function toggleVolunteers(eventId) {
    // If already loaded, just toggle visibility
    if (openVolunteers[eventId]) {
      setOpenVolunteers(s => ({ ...s, [eventId]: !s[eventId] }));
      return;
    }
    try {
  const res = await fetch(`${API_BASE}/api/events/${eventId}/volunteers`);
      const list = await res.json();
      setEvents(evts => evts.map(e => e.id === eventId ? { ...e, volunteersList: list, volunteers: list.length } : e));
      setOpenVolunteers(s => ({ ...s, [eventId]: true }));
    } catch (err) {
      console.error('failed to load volunteers', err);
    }
  }

  const handlePrintReport = (event) => {
    window.print(); // For now, just print the page
  };

  return (
  <Layout currentPage="events" user={user} isLoggedIn={isLoggedIn}>
      <div className="events-bg fade-in" style={{ minHeight: '100vh', width: '100%' }}>
        <div className="container" style={{ maxWidth: '1100px', margin: '0 auto', padding: '2.5rem 1rem' }}>
          <div className="events-hero-header">Event Management</div>
          <div className="text-center mb-5" style={{ color: 'var(--text-secondary)', fontSize: '1.15rem', maxWidth: '700px', margin: '0 auto' }}>
            Administrators can create and manage events. Use the form below to add a new event, or manage existing ones.
          </div>

          {/* Create Event Section */}
          {showCreateForm && (
            <div className="events-form-card fade-in">
              <div className="events-section-header">Create Event</div>
              <EventForm
                submitLabel="Create Event"
                onSubmit={handleCreate}
              />
            </div>
          )}

          {/* Events — split into Existing (upcoming) and Past */}
          <div className="events-section-header" style={{ marginTop: '3rem', marginBottom: '2rem' }}>Existing Events</div>
          {loading && <div>Loading events...</div>}
          {events.filter(e => new Date(e.date) >= new Date()).map(event => (
            <div className="event-card fade-in" key={event.id}>
              <div className="event-card-title">{event.name}</div>
              <div className="event-card-details">
                <div style={{ marginBottom: '0.3em' }}><strong>Description:</strong> {event.description}</div>
                <div style={{ marginBottom: '0.3em' }}><strong>Location:</strong> {event.location}</div>
                <div style={{ marginBottom: '0.3em' }}><strong>Date:</strong> {event.date}</div>
                <div style={{ marginBottom: '0.3em' }}><strong>Urgency:</strong> <span style={{ color: 'var(--primary-red)', fontWeight: 500 }}>{event.urgency}</span></div>
                <div style={{ marginBottom: '0.3em' }}><strong>Skills:</strong> {(event.requiredSkills || []).map(skill => <span className="skill-chip" key={skill}>{skill}</span>)}</div>
                <div style={{ marginBottom: '0.3em' }}><strong>Status:</strong> {(event.volunteersList ? event.volunteersList.length : (event.volunteers || 0))} volunteers signed up</div>
                  {event.createdByName && (
                    <div style={{ marginBottom: '0.3em' }}><strong>Created by:</strong> {event.createdByName}</div>
                  )}
                {/* Admin-only participants control (fetches volunteers) */}
                {user && user.userType === 'admin' && (
                  <div style={{ marginTop: '0.5em' }}>
                    <button className="btn-secondary" onClick={() => toggleVolunteers(event.id)}>
                      {openVolunteers[event.id] ? 'Hide participants' : `View participants (${event.volunteersList ? event.volunteersList.length : (event.volunteers || 0)})`}
                    </button>
                    {openVolunteers[event.id] && (
                      <div style={{ marginTop: '0.5em' }}>
                        {/* show either a simple list or a select box */}
                        {(event.volunteersList && event.volunteersList.length > 0) ? (
                          <div style={{ maxHeight: '220px', overflowY: 'auto', border: '1px solid var(--muted)', padding: '0.5rem', borderRadius: '6px' }}>
                            <ul style={{ margin: 0, paddingLeft: '1rem' }}>
                              {event.volunteersList.map((v, i) => (
                                <li key={i} style={{ padding: '0.25rem 0' }}>{v.full_name || v.name || v.email}</li>
                              ))}
                            </ul>
                          </div>
                        ) : (
                          <div style={{ color: 'var(--text-secondary)' }}>No participants yet</div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
              <div className="event-card-actions">
                <button
                  className="btn-secondary"
                  style={{ border: '1.5px solid var(--primary-red)', color: 'var(--primary-red)', background: 'var(--white)', fontWeight: 600 }}
                  onClick={() => setEditingEventId(event.id)}
                  disabled={new Date(event.date) < new Date()}
                  title={new Date(event.date) < new Date() ? 'Past events are read-only (delete only)' : 'Manage event'}
                >
                  Manage
                </button>
                <button className="btn-danger" style={{ marginLeft: '0.5rem' }} onClick={() => handleDelete(event.id)}>Delete</button>
                <button className="btn-primary" style={{ background: 'linear-gradient(135deg, var(--primary-red), var(--accent-red))', border: 'none', fontWeight: 600, marginLeft: '0.5rem' }} onClick={() => handlePrintReport(event)}>Print Report</button>
              </div>
              {/* Edit Form (inline, not popup) */}
              {editingEventId === event.id && (
                <div className="events-form-card fade-in" style={{ marginTop: '2.5rem', marginBottom: 0 }}>
                  <div className="events-section-header">Modify Event</div>
                  <EventForm
                    initialData={event}
                    submitLabel="Modify Event"
                    onSubmit={data => handleEdit(event.id, data)}
                    onCancel={() => setEditingEventId(null)}
                  />
                </div>
              )}
            </div>
          ))}

          {/* Past Events Section */}
          <div className="events-section-header" style={{ marginTop: '3rem', marginBottom: '2rem' }}>Past Events</div>
          {events.filter(e => new Date(e.date) < new Date()).length === 0 && (<div style={{ color: 'var(--text-secondary)' }}>No past events</div>)}
          {events.filter(e => new Date(e.date) < new Date()).map(event => (
            <div className="event-card fade-in" key={`past-${event.id}`}>
              <div className="event-card-title">{event.name}</div>
              <div className="event-card-details">
                <div style={{ marginBottom: '0.3em' }}><strong>Description:</strong> {event.description}</div>
                <div style={{ marginBottom: '0.3em' }}><strong>Location:</strong> {event.location}</div>
                <div style={{ marginBottom: '0.3em' }}><strong>Date:</strong> {event.date}</div>
                <div style={{ marginBottom: '0.3em' }}><strong>Urgency:</strong> <span style={{ color: 'var(--primary-red)', fontWeight: 500 }}>{event.urgency}</span></div>
                <div style={{ marginBottom: '0.3em' }}><strong>Skills:</strong> {(event.requiredSkills || []).map(skill => <span className="skill-chip" key={skill}>{skill}</span>)}</div>
                <div style={{ marginBottom: '0.3em' }}><strong>Status:</strong> {(event.volunteersList ? event.volunteersList.length : (event.volunteers || 0))} volunteers signed up</div>
                {/* Admin-only participants control (fetches volunteers) for past events too */}
                {user && user.userType === 'admin' && (
                  <div style={{ marginTop: '0.5em' }}>
                    <button className="btn-secondary" onClick={() => toggleVolunteers(event.id)}>
                      {openVolunteers[event.id] ? 'Hide participants' : `View participants (${event.volunteersList ? event.volunteersList.length : (event.volunteers || 0)})`}
                    </button>
                    {openVolunteers[event.id] && (
                      <div style={{ marginTop: '0.5em' }}>
                        {(event.volunteersList && event.volunteersList.length > 0) ? (
                          <div style={{ maxHeight: '220px', overflowY: 'auto', border: '1px solid var(--muted)', padding: '0.5rem', borderRadius: '6px' }}>
                            <ul style={{ margin: 0, paddingLeft: '1rem' }}>
                              {event.volunteersList.map((v, i) => (
                                <li key={i} style={{ padding: '0.25rem 0' }}>{v.full_name || v.name || v.email}</li>
                              ))}
                            </ul>
                          </div>
                        ) : (
                          <div style={{ color: 'var(--text-secondary)' }}>No participants yet</div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
              <div className="event-card-actions">
                <button className="btn-secondary" disabled title="Past events are read-only">Manage</button>
                <button className="btn-danger" style={{ marginLeft: '0.5rem' }} onClick={() => handleDelete(event.id)}>Delete</button>
                <button className="btn-primary" style={{ background: 'linear-gradient(135deg, var(--primary-red), var(--accent-red))', border: 'none', fontWeight: 600, marginLeft: '0.5rem' }} onClick={() => handlePrintReport(event)}>Print Report</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );
}
