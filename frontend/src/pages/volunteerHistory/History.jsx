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
    // Accept multiple possible id shapes that might come from different auth flows.
    // Match the behavior used in MatchMaking.jsx: prefer volunteer_id from profile cache when available.
    let currentUser = user;
    if (!currentUser) {
      try {
        currentUser = JSON.parse(localStorage.getItem('user'));
      } catch (e) {
        currentUser = null;
      }
    }

    let myUserId = null;
    // prefer explicit volunteer_id from the user object
    if (currentUser) myUserId = currentUser.volunteer_id || null;

    // fallback: check cached profile (MatchMaking uses 'hh_userProfile')
    if (!myUserId) {
      try {
        const cachedProfile = JSON.parse(localStorage.getItem('hh_userProfile'));
        if (cachedProfile?.volunteer_id) myUserId = cachedProfile.volunteer_id;
      } catch { /* ignore */ }
    }

    // final fallback: user id shapes (user_id, id, userId)
    if (!myUserId && currentUser) myUserId = currentUser.user_id || currentUser.id || currentUser.userId || null;
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
        // API commonly returns { rows, volunteer_full_name } but be defensive
        const rows = Array.isArray(data.rows) ? data.rows : (Array.isArray(data) ? data : []);
        setHistory(rows);
        // try multiple fallback sources for volunteer's display name
        const nameFromPayload = data.volunteer_full_name || (rows[0] && (rows[0].volunteer_full_name || rows[0].volunteer_name));
        const nameFromUser = user?.full_name || user?.fullName || user?.name;
        if (nameFromPayload) setVolunteerName(nameFromPayload);
        else if (nameFromUser) setVolunteerName(nameFromUser);
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
          const payload = JSON.parse(e.data);
          // payload may be a single enriched row or an object with rows
          if (Array.isArray(payload.rows)) {
            const relevant = payload.rows.filter(r => Number(r.volunteer_id) === Number(myUserId));
            if (relevant.length) setHistory(prev => [...relevant, ...prev]);
            // if payload includes volunteer_full_name, update title
            if (payload.volunteer_full_name) setVolunteerName(payload.volunteer_full_name);
          } else if (payload && payload.volunteer_id && Number(payload.volunteer_id) === Number(myUserId)) {
            setHistory(prev => [payload, ...prev]);
            if (payload.volunteer_full_name) setVolunteerName(payload.volunteer_full_name || volunteerName);
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


  const displayName = volunteerName || (history[0] && (history[0].volunteer_name || history[0].volunteer_full_name)) || '';

  return (
    <div>
      <Header isLoggedIn={isLoggedIn} user={user} onLogout={onLogout} currentPage="history" />

      <div style={{ margin: "30px 60px" }}>
  <h1>{displayName ? `${displayName}'s Impact Story` : 'Your Impact Story'}</h1>

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
