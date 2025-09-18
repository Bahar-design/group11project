import React from "react";
import "./Login.css"; // optional, if you move styles out of inline

function Navbar() {
  return (
    <nav className="navbar">
      <div className="nav-container">
        <div className="logo">
          <div className="logo-icon">H</div>
          Houston Clothing Drive
        </div>
        <div className="nav-links">
          <a href="#">Home</a>
          <a href="#">Volunteers</a>
          <a href="#">Donations</a>
          <a href="#">Events</a>
          <button className="btn">Login</button>
        </div>
      </div>
    </nav>
  );
}

export default function Login() {
  return (
    <div>
      <Navbar />
      <main style={{ display: "flex", justifyContent: "center", marginTop: "2rem" }}>
        <div
          style={{
            width: "450px",
            background: "var(--white)",
            padding: "3rem",
            borderRadius: "12px",
            boxShadow: "var(--shadow-medium)",
          }}
        >
          <h2 style={{ color: "var(--primary-red)", marginBottom: "1.5rem" }}>Login</h2>

          <label style={{ display: "block", marginBottom: "0.5rem" }}>Username or Email</label>
          <input type="text" placeholder="Enter your username or email" />

          <label style={{ display: "block", marginBottom: "0.5rem", marginTop: "1rem" }}>Password</label>
          <input type="password" placeholder="Enter your password" />

          <button type="submit" className="btn" style={{ width: "100%", marginTop: "1rem" }}>
            Sign In
          </button>

          <p style={{ textAlign: "center", marginTop: "1rem" }}>
            Don’t have an account?{" "}
            <a href="#" style={{ color: "var(--primary-red)", fontWeight: 500 }}>
              Register
            </a>
          </p>
        </div>
      </main>
    </div>
  );
}
