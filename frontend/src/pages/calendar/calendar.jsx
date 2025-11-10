import React, { useState, useEffect } from "react";
import { Calendar as Calendars, momentLocalizer } from "react-big-calendar";
import moment from "moment";
import Modal from "react-modal"; // <- add modal
import Footer from "../../components/footer.jsx";
import Header from "../../components/header.jsx";
import API_BASE from "../../lib/apiBase";
import "react-big-calendar/lib/css/react-big-calendar.css";
import "./calendar.css";

const localizer = momentLocalizer(moment);
Modal.setAppElement('#root');

export default function MyCalendar({ isLoggedIn, user, onLogout }) {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [attending, setAttending] = useState(false);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/calendar`);
        const data = await res.json();
        const formatted = data.map(ev => ({
          id: ev.event_id,
          title: ev.event_name,
          start: new Date(ev.event_date),
          end: new Date(ev.event_date),
          location: ev.location,
          description: ev.description,
        }));
        setEvents(formatted);
      } catch (err) {
        console.error(err);
        setMessage("Failed to load events");
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, []);

  const handleSelectEvent = (event) => {
    setSelectedEvent(event);
    setModalOpen(true);
    setAttending(false);
  };

  const handleAttend = async () => {
    if (!user?.volunteer_id) return;
    try {
      const res = await fetch(`${API_BASE}/api/calendar/attend`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          volunteer_id: user.volunteer_id,
          event_id: selectedEvent.id,
        }),
      });
      const data = await res.json();
      setMessage(data.message);
      setAttending(true);
    } catch (err) {
      console.error(err);
      setMessage("Failed to attend event");
    }
  };

  return (
    <div>
      <Header isLoggedIn={isLoggedIn} user={user} onLogout={onLogout} currentPage="calendar" />

      <div style={{ height: "80vh", margin: "30px 60px 50px" }}>
        {loading ? (
          <p>Loading events...</p>
        ) : message ? (
          <p style={{ color: "var(--primary-red)" }}>{message}</p>
        ) : (
          <Calendars
            localizer={localizer}
            events={events}
            startAccessor="start"
            endAccessor="end"
            style={{ height: "100%", width: "100%" }}
            onSelectEvent={handleSelectEvent} // <- add this
          />
        )}
      </div>

      <Modal
  isOpen={modalOpen}
  onRequestClose={() => setModalOpen(false)}
  contentLabel="Event Details"
  style={{
    overlay: {
      backgroundColor: 'rgba(0, 0, 0, 0.5)', // dark semi-transparent overlay
      zIndex: 1000
    },
    content: {
      top: "20%",
      left: "25%",
      right: "25%",
      bottom: "20%",
      backgroundColor: "#fff",   // white background
      color: "#333",
      padding: "30px",
      borderRadius: "10px",
      boxShadow: "0 4px 20px rgba(0,0,0,0.3)",
      overflow: "auto"
    }
  }}
>
  {selectedEvent && (
    <div>
      <h2>{selectedEvent.title}</h2>
      <p><strong>Date:</strong> {selectedEvent.start.toDateString()}</p>
      <p><strong>Location:</strong> {selectedEvent.location}</p>
      <p>{selectedEvent.description}</p>

      {!attending ? (
        <button onClick={handleAttend}>I’m attending</button>
      ) : (
        <p style={{ color: "green" }}>You are attending this event!</p>
      )}

      <button onClick={() => setModalOpen(false)}>Close</button>
    </div>
  )}
</Modal>


      <Footer />
    </div>
  );
}
