
import React, { useState } from 'react';
import EventForm from './EventForm';
import Layout from '../../components/layout.jsx';
import './events.css';

// Dummy events data (copy from managementTools.jsx)
const initialEvents = [
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

export default function EventsPage() {
  const [events, setEvents] = useState(initialEvents);
  const [editingEventId, setEditingEventId] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(true);
  // For simplicity, no validation errors
  const [formErrors, setFormErrors] = useState({});

  const handleCreate = (data) => {
    setEvents(evts => [
      ...evts,
      { ...data, id: Date.now(), volunteers: [], status: '0/10 volunteers signed up' }
    ]);
    setShowCreateForm(false);
    setTimeout(() => setShowCreateForm(true), 500); // Reset form
  };

  const handleEdit = (id, data) => {
    setEvents(evts => evts.map(e => e.id === id ? { ...e, ...data } : e));
    setEditingEventId(null);
  };

  const handlePrintReport = (event) => {
    window.print(); // For now, just print the page
  };

  return (
    <Layout currentPage="events">
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
          {events.map(event => (
            <div className="event-card fade-in" key={event.id}>
              <div className="event-card-title">{event.name}</div>
              <div className="event-card-details">
                <div style={{ marginBottom: '0.3em' }}><strong>Description:</strong> {event.description}</div>
                <div style={{ marginBottom: '0.3em' }}><strong>Location:</strong> {event.location}</div>
                <div style={{ marginBottom: '0.3em' }}><strong>Date:</strong> {event.date}</div>
                <div style={{ marginBottom: '0.3em' }}><strong>Urgency:</strong> <span style={{ color: 'var(--primary-red)', fontWeight: 500 }}>{event.urgency}</span></div>
                <div style={{ marginBottom: '0.3em' }}><strong>Skills:</strong> {event.requiredSkills.map(skill => <span className="skill-chip" key={skill}>{skill}</span>)}</div>
                <div style={{ marginBottom: '0.3em' }}><strong>Status:</strong> {event.status}</div>
              </div>
              <div className="event-card-actions">
                <button className="btn-secondary" style={{ border: '1.5px solid var(--primary-red)', color: 'var(--primary-red)', background: 'var(--white)', fontWeight: 600 }} onClick={() => setEditingEventId(event.id)}>Manage</button>
                <button className="btn-primary" style={{ background: 'linear-gradient(135deg, var(--primary-red), var(--accent-red))', border: 'none', fontWeight: 600 }} onClick={() => handlePrintReport(event)}>Print Report</button>
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
