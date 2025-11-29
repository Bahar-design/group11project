import React, { useEffect, useState } from "react";
import Header from "../../components/header";
import Footer from "../../components/footer";
import API_BASE from "../../lib/apiBase";
import "./volunteerHistory.css";

export default function VolunteerHistory({ user, isLoggedIn, onLogout }) {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [volunteerName, setVolunteerName] = useState("");

  /*
  useEffect(() => {
    const fetchHistory = async () => {


      if (!user?.id) return;

      try {
        const res = await fetch(`${API_BASE}/api/volunteer-history/my/${user.id}`);

        if (!res.ok) throw new Error("Failed to fetch history");
        const data = await res.json();
        setHistory(data);
      } catch (err) {
        console.error(err);
        setMessage("Failed to load volunteer history");
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [user]);

*/

  useEffect(() => {
    const myUserId = user?.user_id || user?.id || user?.userId || null;
    if (!myUserId) {
      // ensure we don't stay stuck on the loading screen when no user id is available
      setMessage("Please log in to view your volunteer history.");
      setLoading(false);
      return;
    }

    let evtSource;

    const fetchHistory = async () => {
      try {
  const res = await fetch(`${API_BASE}/api/volunteer-history/my/${myUserId}`);
        if (!res.ok) throw new Error("Failed to fetch history");

        const data = await res.json();
        // API returns { rows, volunteer_full_name }
        const rows = data.rows || data;
        setHistory(rows);
        if (data.volunteer_full_name) setVolunteerName(data.volunteer_full_name);
      } catch (err) {
        console.error(err);
        setMessage("Failed to load volunteer history");
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();

    // connect to SSE stream to receive new volunteer_history rows
    try {
      evtSource = new EventSource(`${API_BASE.replace(/\/$/, '')}/api/volunteer-history/stream`);
      evtSource.onmessage = (e) => {
        try {
          const newRow = JSON.parse(e.data);
          // Only append rows relevant to this user
          if (Number(newRow.volunteer_id) === Number(myUserId)) {
            // To compute matched skills on frontend, rely on returned fields if present
            setHistory((prev) => [newRow, ...prev]);
          }
        } catch (err) {
          // ignore JSON parse errors
        }
      };
      evtSource.onerror = () => { /* ignore errors - keep trying */ };
    } catch (err) {
      // browsers that don't support EventSource will fail silently
      console.warn('SSE not available', err);
    }

    return () => {
      if (evtSource) evtSource.close();
    };
  }, [user]);


  return (
    <div>
      <Header isLoggedIn={isLoggedIn} user={user} onLogout={onLogout} currentPage="history" />

      <div style={{ margin: "30px 60px" }}>
  <h1>{volunteerName ? `${volunteerName}'s Volunteer History` : 'Your Volunteer History'}</h1>

        {loading ? (
          <p>Loading history...</p>
        ) : message ? (
          <p style={{ color: "var(--primary-red)" }}>{message}</p>
        ) : history.length === 0 ? (
          <p>You haven’t attended any events yet.</p>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <th style={{ borderBottom: "1px solid #ccc", padding: "8px" }}>Event Name</th>
                <th style={{ borderBottom: "1px solid #ccc", padding: "8px" }}>Event Description</th>
                <th style={{ borderBottom: "1px solid #ccc", padding: "8px" }}>Location</th>
                <th style={{ borderBottom: "1px solid #ccc", padding: "8px" }}>Required Skills</th>
                <th style={{ borderBottom: "1px solid #ccc", padding: "8px" }}>Matched Skills</th>
                <th style={{ borderBottom: "1px solid #ccc", padding: "8px" }}>Urgency</th>
                <th style={{ borderBottom: "1px solid #ccc", padding: "8px" }}>Event Date</th>
                <th style={{ borderBottom: "1px solid #ccc", padding: "8px" }}>Signup Date</th>
              </tr>
            </thead>
            <tbody>
              {history.map((h) => (
                <tr key={h.history_id}>
                  <td style={{ borderBottom: "1px solid #eee", padding: "8px" }}>{h.event_name}</td>
                  <td style={{ borderBottom: "1px solid #eee", padding: "8px" }}>{h.description}</td>
                  <td style={{ borderBottom: "1px solid #eee", padding: "8px" }}>{h.location}</td>
                  <td style={{ borderBottom: "1px solid #eee", padding: "8px" }}>{(h.event_skill_ids || []).join(', ')}</td>
                  <td style={{ borderBottom: "1px solid #eee", padding: "8px" }}>{(h.matched_skills || []).join(', ')}</td>
                  <td style={{ borderBottom: "1px solid #eee", padding: "8px" }}>{h.urgency}</td>
                  <td style={{ borderBottom: "1px solid #eee", padding: "8px" }}>{new Date(h.event_date).toLocaleDateString()}</td>
                  <td style={{ borderBottom: "1px solid #eee", padding: "8px" }}>{new Date(h.signup_date).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
  </div>

      <Footer />
    </div>
  );
}
