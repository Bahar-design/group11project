import React, { useState, useEffect } from "react";
import { Calendar as BigCalendar, momentLocalizer } from "react-big-calendar";
import moment from "moment";
import Modal from "react-modal";
import Header from "../../components/header.jsx";
import Footer from "../../components/footer.jsx";
import API_BASE from "../../lib/apiBase";
import "react-big-calendar/lib/css/react-big-calendar.css";
import "./calendar.css";

const localizer = momentLocalizer(moment);
Modal.setAppElement('#root');

export default function AdminCalendar({ isLoggedIn, user, onLogout }) {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);

  // Add Event form data
  const [newEvent, setNewEvent] = useState({
    event_name: "",
    event_date: "",
    location: "",
    description: "",
    max_volunteers: ""
  });

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/events-with-details`);
      const data = await res.json();
      const formatted = data.map(ev => ({
        id: ev.event_id,
        title: ev.event_name,
        start: new Date(ev.event_date),
        end: new Date(ev.event_date),
        location: ev.location,
        description: ev.description,
        volunteers: ev.volunteers || [],
        skills: ev.skills || []
      }));
      setEvents(formatted);
    } catch (err) {
      console.error(err);
      alert("Failed to load events.");
    } finally {
      setLoading(false);
    }
  };

  const handleSelectEvent = (event) => {
    setSelectedEvent(event);
    setModalOpen(true);
  };

  const handleAddEvent = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_BASE}/api/calendar`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newEvent)
      });
      if (!res.ok) throw new Error("Failed to add event.");
      setAddModalOpen(false);
      setNewEvent({ event_name: "", event_date: "", location: "", description: "", max_volunteers: "" });
      fetchEvents(); // refresh calendar
    } catch (err) {
      console.error(err);
      alert(err.message);
    }
  };

  return (
    <div>
      <Header isLoggedIn={isLoggedIn} user={user} onLogout={onLogout} currentPage="admin-calendar" />

      <div style={{ margin: "20px 60px" }}>
        <button onClick={() => setAddModalOpen(true)} style={{ marginBottom: "20px" }}>
          ➕ Add Event
        </button>

        <div style={{ height: "75vh" }}>
          {loading ? (
            <p>Loading events...</p>
          ) : (
            <BigCalendar
              localizer={localizer}
              events={events}
              startAccessor="start"
              endAccessor="end"
              style={{ height: "100%", width: "100%" }}
              onSelectEvent={handleSelectEvent}
            />
          )}
        </div>
      </div>

      {/* Modal for event details */}
      <Modal isOpen={modalOpen} onRequestClose={() => setModalOpen(false)} contentLabel="Event Details">
        {selectedEvent && (
          <div>
            <h2>{selectedEvent.title}</h2>
            <p><strong>Date:</strong> {selectedEvent.start.toDateString()}</p>
            <p><strong>Location:</strong> {selectedEvent.location}</p>
            <p><strong>Description:</strong> {selectedEvent.description}</p>
            <p><strong>Volunteers:</strong> {selectedEvent.volunteers.join(", ") || "None yet"}</p>
            <p><strong>Required Skills:</strong> {selectedEvent.skills.join(", ") || "None"}</p>
            <button onClick={() => setModalOpen(false)}>Close</button>
          </div>
        )}
      </Modal>

      {/* Modal for adding a new event */}
      <Modal isOpen={addModalOpen} onRequestClose={() => setAddModalOpen(false)} contentLabel="Add Event">
        <form onSubmit={handleAddEvent}>
          <h2>Add New Event</h2>
          <label>Event Name:</label>
          <input type="text" required value={newEvent.event_name}
                 onChange={e => setNewEvent({ ...newEvent, event_name: e.target.value })} />
          <label>Date:</label>
          <input type="date" required value={newEvent.event_date}
                 onChange={e => setNewEvent({ ...newEvent, event_date: e.target.value })} />
          <label>Location:</label>
          <input type="text" value={newEvent.location}
                 onChange={e => setNewEvent({ ...newEvent, location: e.target.value })} />
          <label>Description:</label>
          <textarea value={newEvent.description}
                    onChange={e => setNewEvent({ ...newEvent, description: e.target.value })} />
          <label>Max Volunteers:</label>
          <input type="number" value={newEvent.max_volunteers}
                 onChange={e => setNewEvent({ ...newEvent, max_volunteers: e.target.value })} />

          <div style={{ marginTop: "20px" }}>
            <button type="submit">Save Event</button>
            <button type="button" onClick={() => setAddModalOpen(false)} style={{ marginLeft: "10px" }}>Cancel</button>
          </div>
        </form>
      </Modal>

      <Footer />
    </div>
  );
}
