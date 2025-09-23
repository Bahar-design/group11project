//notifications/Notifications.jsx
import React from "react";
import NavBar from "../../components/NavBar.jsx";  //may need navbar later
import "./notifications.css";

export default function Notifications() {
  return (
    <div>

      <main className="notifications-container">
        <div className="notifications-card">
          <h2 style={{ color: "var(--primary-red)", marginBottom: "1.5rem" }}>
            My Notifications
          </h2>

          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <div className="notification-item" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <p className="notification-title">New Event Assignments</p>
                <small className="notification-text">
                  You are assigned to the Clothing Drive on Sep 19, 2025.
                </small>
              </div>
              <button className="delete-btn">Delete</button>
            </div>

            <div className="notification-item" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <p className="notification-title">Event Update</p>
                <small className="notification-text">
                  Event update: The Monday Madness donation event time has changed to 11:00 AM.
                </small>
              </div>
              <button className="delete-btn">Delete</button>
            </div>

            <div className="notification-item" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <p className="notification-title">Reminder</p>
                <small className="notification-text">
                  Reminder to submit your volunteer report by this Friday.
                </small>
              </div>
              <button className="delete-btn">Delete</button>
            </div>
          </div>

{/*<button className="btn delete-btn" style={{ marginTop: "2rem", width: "100%" }}>
  Delete All
  </button>   */ }
        </div>
      </main>
    </div>
  );
}
