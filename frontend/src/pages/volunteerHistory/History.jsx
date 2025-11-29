import React, { useEffect, useState } from "react";
import Header from "../../components/header";
import Footer from "../../components/footer";
import API_BASE from "../../lib/apiBase";
import "./volunteerHistory.css";

export default function VolunteerHistory({ user, isLoggedIn, onLogout }) {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

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
  const fetchHistory = async () => {

    if (!user?.user_id) return;  // <-- CORRECT PROPERTY

    try {
      const res = await fetch(`${API_BASE}/api/volunteer-history/my/${user.user_id}`);
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


  return (
    <div>
      <Header isLoggedIn={isLoggedIn} user={user} onLogout={onLogout} currentPage="history" />

      <div style={{ margin: "30px 60px" }}>
        <h1>Volunteer History</h1>

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
                <th style={{ borderBottom: "1px solid #ccc", padding: "8px" }}>Event Date</th>
                <th style={{ borderBottom: "1px solid #ccc", padding: "8px" }}>Location</th>
                <th style={{ borderBottom: "1px solid #ccc", padding: "8px" }}>Signup Date</th>
              </tr>
            </thead>
            <tbody>
              {history.map((h) => (
                <tr key={h.history_id}>
                  <td style={{ borderBottom: "1px solid #eee", padding: "8px" }}>{h.event_name}</td>
                  <td style={{ borderBottom: "1px solid #eee", padding: "8px" }}>
                    {new Date(h.event_date).toLocaleDateString()}
                  </td>
                  <td style={{ borderBottom: "1px solid #eee", padding: "8px" }}>{h.location}</td>
                  <td style={{ borderBottom: "1px solid #eee", padding: "8px" }}>
                    {new Date(h.signup_date).toLocaleDateString()}
                  </td>
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
