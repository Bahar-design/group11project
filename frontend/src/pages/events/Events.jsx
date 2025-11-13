
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
      if (!res.ok) throw new Error('Create failed');
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

          {/* Existing Events Section */}
          <div className="events-section-header" style={{ marginTop: '3rem', marginBottom: '2rem' }}>Existing Events</div>
          {loading && <div>Loading events...</div>}
          {events.map(event => (
            <div className="event-card fade-in" key={event.id}>
              <div className="event-card-title">{event.name}</div>
              <div className="event-card-details">
                <div style={{ marginBottom: '0.3em' }}><strong>Description:</strong> {event.description}</div>
                <div style={{ marginBottom: '0.3em' }}><strong>Location:</strong> {event.location}</div>
                <div style={{ marginBottom: '0.3em' }}><strong>Date:</strong> {event.date}</div>
                <div style={{ marginBottom: '0.3em' }}><strong>Urgency:</strong> <span style={{ color: 'var(--primary-red)', fontWeight: 500 }}>{event.urgency}</span></div>
                <div style={{ marginBottom: '0.3em' }}><strong>Skills:</strong> {(event.requiredSkills || []).map(skill => <span className="skill-chip" key={skill}>{skill}</span>)}</div>
                <div style={{ marginBottom: '0.3em' }}><strong>Status:</strong> {event.volunteers} volunteers signed up</div>
                  {event.createdByName && (
                    <div style={{ marginBottom: '0.3em' }}><strong>Created by:</strong> {event.createdByName}</div>
                  )}
                {event.volunteersList && event.volunteersList.length > 0 && (
                  <div style={{ marginTop: '0.5em' }}>
                    <button className="btn-secondary" onClick={() => toggleVolunteers(event.id)}>
                      {openVolunteers[event.id] ? 'Hide volunteers' : `Show ${event.volunteers} volunteers`}
                    </button>
                    {openVolunteers[event.id] && (
                      <div style={{ marginTop: '0.5em' }}>
                        <select size={Math.min(6, event.volunteersList.length)} style={{ width: '100%' }}>
                          {event.volunteersList.map((v, i) => <option key={i}>{v.name}</option>)}
                        </select>
                      </div>
                    )}
                  </div>
                )}
              </div>
              <div className="event-card-actions">
                <button className="btn-secondary" style={{ border: '1.5px solid var(--primary-red)', color: 'var(--primary-red)', background: 'var(--white)', fontWeight: 600 }} onClick={() => setEditingEventId(event.id)}>Manage</button>
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
        </div>
      </div>
    </Layout>
  );
}
