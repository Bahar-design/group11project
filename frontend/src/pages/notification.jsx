//notifications.jsx
import React from "react";
import NavBar from "../components/NavBar.jsx"; //ma need it later for navbar 

export default function Notifications() {
  return (
    <div>

      <main style={{ display: "flex", justifyContent: "center", alignItems: "flex-start", paddingTop: "2rem" }}>
        <div
          style={{
            width: "600px",
            background: "var(--white)",
            padding: "2rem",
            borderRadius: "12px",
            boxShadow: "var(--shadow-medium)",
          }}
        >
          <h2 style={{ color: "var(--primary-red)", marginBottom: "1.5rem" }}>Notifications</h2>

          {/* Notifications */}
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <div
              style={{
                padding: "1rem",
                border: "1px solid var(--medium-silver)",
                borderRadius: "8px",
                background: "var(--warm-bg)",
              }}
            >
              <p style={{ margin: 0, fontWeight: 500 }}>New Event Assigned</p>
              <small style={{ color: "var(--text-light)" }}>
                You are assigned to the Clothing Drive on Sep 19, 2025.
              </small>
            </div>

            <div
              style={{
                padding: "1rem",
                border: "1px solid var(--medium-silver)",
                borderRadius: "8px",
                background: "var(--warm-bg)",
              }}
            >
              <p style={{ margin: 0, fontWeight: 500 }}>Event Update</p>
              <small style={{ color: "var(--text-light)" }}>
                The Monday Madness donation event time has changed to 11:00 AM.
              </small>
            </div>

            <div
              style={{
                padding: "1rem",
                border: "1px solid var(--medium-silver)",
                borderRadius: "8px",
                background: "var(--warm-bg)",
              }}
            >
              <p style={{ margin: 0, fontWeight: 500 }}>Reminder</p>
              <small style={{ color: "var(--text-light)" }}>
                Don't forget to submit your volunteer report by Friday.
              </small>
            </div>
          </div>

          {/* Delete all Notifications */}
          <button className="btn" style={{ marginTop: "2rem", width: "100%" }}>
            Delete All
          </button>
        </div>
      </main>
    </div>
  );
}
