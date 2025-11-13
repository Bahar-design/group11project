// AdminVolunteerHistory.jsx
import React, { useEffect, useState } from "react";
import Header from "../../components/header";
import Footer from "../../components/footer";
import API_BASE from "../../lib/apiBase";
import "./adminhistory.css"; // your provided CSS

export default function AdminVolunteerHistory({ user, isLoggedIn, onLogout }) {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const fetchHistory = async () => {
      if (!user) return;

      try {
        // Admin endpoint: fetch all volunteer history
        const res = await fetch(`${API_BASE}/api/volunteer-history`);
        if (!res.ok) throw new Error("Failed to fetch history");
        const data = await res.json();

        // Optional: sort by event date descending
        const sortedData = data.sort((a, b) => new Date(b.event_date) - new Date(a.event_date));
        setHistory(sortedData);
      } catch (err) {
        console.error(err);
        setMessage("Failed to load volunteer history");
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [user]);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div>
      <Header isLoggedIn={isLoggedIn} user={user} onLogout={onLogout} currentPage="history" />

      <div className="volunteer-history-container">
        <h1>Volunteer History</h1>

        {loading ? (
          <p>Loading history...</p>
        ) : message ? (
          <p className="volunteer-history-message">{message}</p>
        ) : history.length === 0 ? (
          <p className="volunteer-history-message">No volunteer history found.</p>
        ) : (
          <>
            <table className="volunteer-history-table">
              <thead>
                <tr>
                  <th>Volunteer Name</th>
                  <th>Event Name</th>
                  <th>Event Date</th>
                  <th>Location</th>
                  <th>Signup Date</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {history.map((h) => (
                  <tr key={h.history_id}>
                    <td>{h.full_name}</td>
                    <td>{h.event_name}</td>
                    <td>{new Date(h.event_date).toLocaleDateString()}</td>
                    <td>{h.location}</td>
                    <td>{new Date(h.signup_date).toLocaleDateString()}</td>
                    <td>{h.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <button onClick={handlePrint} style={{ marginTop: "20px" }}>
              🖨️ Print Report
            </button>
          </>
        )}
      </div>

      <Footer />
    </div>
  );
}
