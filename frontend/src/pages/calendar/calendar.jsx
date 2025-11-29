/*
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
        // Fetch both calendar + events tables at once
        const [calendarRes, eventsRes] = await Promise.all([
          fetch(`${API_BASE}/api/calendar`),
          fetch(`${API_BASE}/api/events`)
        ]);
  
        const calendarData = await calendarRes.json();
        const eventsData = await eventsRes.json();
  
        // Format calendar table data
        const formattedCalendar = calendarData.map(ev => ({
          id: `cal-${ev.id}`,
          title: ev.name,
          start: new Date(ev.date),
          end: new Date(ev.date),
          location: ev.location,
          description: ev.description,
          urgency: ev.urgency,
          volunteers: ev.volunteers,
          requiredSkills: ev.requiredSkills,
        }));
  
        // Format events table data
        const formattedEvents = eventsData.map(ev => ({
          id: `evt-${ev.id}`,
          title: ev.name,
          start: new Date(ev.date),
          end: new Date(ev.date),
          location: ev.location,
          description: ev.description,
          urgency: ev.urgency,
          volunteers: ev.volunteers,
          requiredSkills: ev.requiredSkills,
        }));
  
        // Combine both into one array
        setEvents([...formattedCalendar, ...formattedEvents]);
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
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      zIndex: 1000
    },
    content: {
      top: "20%",
      left: "25%",
      right: "25%",
      bottom: "20%",
      backgroundColor: "#fff",
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
      {selectedEvent.urgency && <p><strong>Urgency:</strong> {selectedEvent.urgency}</p>}
      {selectedEvent.volunteers !== undefined && <p><strong>Volunteers:</strong> {selectedEvent.volunteers}</p>}
      {selectedEvent.requiredSkills?.length > 0 && <p><strong>Skills:</strong> {selectedEvent.requiredSkills.join(", ")}</p>}

      <button onClick={() => setModalOpen(false)}>Close</button>
    </div>
  )}
</Modal>



      <Footer />
    </div>
  );
}
*/
import React, { useState, useEffect } from "react";
import { Calendar as Calendars, momentLocalizer } from "react-big-calendar";
import moment from "moment";
import Modal from "react-modal";
import Footer from "../../components/footer.jsx";
import Header from "../../components/header.jsx";
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

useEffect(() => {
  const fetchEvents = async () => {
    try {
      // Hardcode backend URL because API_BASE is empty
      const res = await fetch(`http://localhost:4000/api/calendar`);
      
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }

      const data = await res.json();

      if (!Array.isArray(data)) {
        throw new Error("Invalid response format");
      }

      const formatted = data.map(ev => ({
        id: ev.event_id,
        title: ev.event_name,
        start: new Date(ev.event_date),
        end: new Date(ev.event_date),
        location: ev.location,
        description: ev.description,
        max_volunteers: ev.max_volunteers,
      }));

      setEvents(formatted);
    } catch (err) {
      console.error("Calendar fetch error:", err);
      setMessage("Failed to load events");
    } finally {
      setLoading(false);
    }
  };

  fetchEvents();
}, []);


  const handleSelectEvent = event => {
    setSelectedEvent(event);
    setModalOpen(true);
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
            onSelectEvent={handleSelectEvent}
          />
        )}
      </div>

      <Modal
        isOpen={modalOpen}
        onRequestClose={() => setModalOpen(false)}
        contentLabel="Event Details"
        style={{
          overlay: { backgroundColor: "rgba(0,0,0,0.5)", zIndex: 1000 },
          content: {
            top: "20%",
            left: "25%",
            right: "25%",
            bottom: "20%",
            backgroundColor: "#fff",
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
            <p><strong>Max Volunteers:</strong> {selectedEvent.max_volunteers}</p>

            <button onClick={() => setModalOpen(false)}>Close</button>
          </div>
        )}
      </Modal>

      <Footer />
    </div>
  );
}
