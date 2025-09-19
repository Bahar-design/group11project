// src/pages/calendar.jsx
import React, { useState } from "react";
import NavBar from "../components/NavBar";

const monthNames = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December"
];

export default function Calendar() {
  const today = new Date();
  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();

  const [monthOffset, setMonthOffset] = useState(0);

  function calendarDays() {
    const date = new Date(currentYear, currentMonth + monthOffset, 1);
    const firstDayIndex = date.getDay();
    const daysInMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();

    const daysArray = Array(firstDayIndex).fill(null);
    for (let i = 1; i <= daysInMonth; i++) daysArray.push(i);

    return daysArray;
  }

  return (
    <div>
      <main style={{ flex: 1, display: "flex", justifyContent: "center", alignItems: "flex-start", paddingTop: "2rem" }}>
        <div style={{
          width: "700px",
          background: "var(--white)",
          padding: "2rem",
          borderRadius: "12px",
          boxShadow: "var(--shadow-medium)"
        }}>
          <h2 style={{ color: "var(--primary-red)", marginBottom: "1.5rem" }}>Event Calendar</h2>

          {/* Month navigation */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
            <button className="btn" onClick={() => setMonthOffset(monthOffset - 1)}>◀</button>
            <h3 style={{ margin: 0 }}>
              {monthNames[(currentMonth + monthOffset + 12) % 12]} {currentYear + Math.floor((currentMonth + monthOffset)/12)}
            </h3>
            <button className="btn" onClick={() => setMonthOffset(monthOffset + 1)}>▶</button>
          </div>

          {/* Calendar grid */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "0.5rem" }}>
            {["Sun","Mon","Tue","Wed","Thu","Fri","Sat"].map(d => (
              <div key={d} style={{ fontWeight: "600", textAlign: "center" }}>{d}</div>
            ))}
            {calendarDays().map((day, idx) => (
              <div key={idx} style={{
                height: "50px",
                textAlign: "center",
                lineHeight: "50px",
                borderRadius: "8px",
                background: day ? "var(--warm-bg)" : "transparent",
                color: day ? "var(--text-primary)" : "transparent"
              }}>
                {day || ""}
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
