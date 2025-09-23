//registration.jsx
import React from "react";
import NavBar from "../components/NavBar.jsx"; // Use your central NavBar

export default function Registration() {
  return (
    <div>

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
          <h2 style={{ color: "var(--primary-red)", marginBottom: "1.5rem" }}>Register</h2>

          <label style={{ display: "block", marginBottom: "0.5rem" }}>Email</label>
          <input
            type="email"
            placeholder="Enter your email"
            style={{
              width: "100%",
              padding: "0.75rem",
              border: "1px solid var(--medium-silver)",
              borderRadius: "8px",
              marginBottom: "1rem",
              fontSize: "1rem",
            }}
          />

          <label style={{ display: "block", marginBottom: "0.5rem", marginTop: "1rem" }}>Password</label>
          <input
            type="password"
            placeholder="Enter your password"
            style={{
              width: "100%",
              padding: "0.75rem",
              border: "1px solid var(--medium-silver)",
              borderRadius: "8px",
              marginBottom: "1rem",
              fontSize: "1rem",
            }}
          />

          <button
            type="submit"
            className="btn"
            style={{ width: "100%", marginTop: "1rem" }}
          >
            Register
          </button>

          <p style={{ textAlign: "center", marginTop: "1rem" }}>
            Already have an account?{" "}
            <a href="#" style={{ color: "var(--primary-red)", fontWeight: 500 }}>
              Sign In
            </a>
          </p>
        </div>
      </main>
    </div>
  );
}
