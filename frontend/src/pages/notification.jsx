// src/pages/notifications.jsx
import React from "react";
import NavBar from "../components/NavBar.jsx"; // Reuse the central NavBar

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

          {/* Notification items */}
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
                You have been assigned to the Clothing Drive on Sep 20, 2025.
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
                The donation collection time has changed to 10:00 AM.
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

          {/* Clear all notifications button */}
          <button className="btn" style={{ marginTop: "2rem", width: "100%" }}>
            Clear All
          </button>
        </div>
      </main>
    </div>
  );
}
