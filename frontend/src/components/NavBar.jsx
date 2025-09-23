import React from "react";

export default function NavBar() {
  return (
    <nav className="navbar">
      <div className="nav-container">
        <div className="logo">
          <div className="logo-icon">H</div>
          Houston Clothing Drive
        </div>
        <div className="nav-links">
          <a href="/">Home</a>
          <a href="/volunteers">Volunteers</a>
          <a href="/donations">Donations</a>
          <a href="/events">Events</a>
          <button className="btn">Login</button>
        </div>
      </div>
    </nav>
  );
}
