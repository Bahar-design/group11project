// src/pages/calendar.jsx
import React, { useState, useEffect } from "react";
import { Calendar as Calendars, momentLocalizer } from "react-big-calendar";
import moment from "moment";
import Footer from "../../components/footer.jsx";
import Header from "../../components/header.jsx";
import API_BASE from "../../lib/apiBase"; // ✅ same as registration page
import "react-big-calendar/lib/css/react-big-calendar.css";
import "./calendar.css";

const localizer = momentLocalizer(moment);

export default function MyCalendar({ isLoggedIn, user, onLogout }) {
  const [events, setEvents] = useState([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  // ✅ Fetch events from backend
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/calendar`, {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        });

        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          console.error("Failed to fetch events:", res.status, errData);
          setMessage(errData.error || `Failed to load events (status ${res.status})`);
          return;
        }

        const data = await res.json();

        // Transform DB fields to react-big-calendar format
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
        console.error("Network error fetching events:", err);
        setMessage(`Network error: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  return (
    <div>
      <Header
        isLoggedIn={isLoggedIn}
        user={user}
        onLogout={onLogout}
        currentPage="calendar"
      />

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
          />
        )}
      </div>

      <Footer />
    </div>
  );
}
