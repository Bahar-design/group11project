// src/pages/Register.jsx
import React from "react";
import Navbar from "../components/Navbar";      //needed for navigation bar

function Register() {
  return (
    <div>
      <Navbar />
      <main
        style={{
          flex: 1,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          paddingTop: "2rem",
        }}
      >
        <div
          style={{
            width: "450px",
            background: "var(--white)",
            padding: "3rem",
            borderRadius: "12px",
            boxShadow: "var(--shadow-medium)",
          }}
        >
          <h2
            style={{
              color: "var(--primary-red)",
              marginBottom: "1.5rem",
            }}
          >
            Register
          </h2>

          <label
            style={{
              display: "block",
              marginBottom: "0.5rem",
              fontWeight: 500,
              color: "var(--text-secondary)",
            }}
          >
            Email
          </label>
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

          <label
            style={{
              display: "block",
              marginBottom: "0.5rem",
              fontWeight: 500,
              color: "var(--text-secondary)",
            }}
          >
            Password
          </label>
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
            style={{ width: "100%", marginTop: "0.5rem" }}
          >
            Register
          </button>

          <p
            style={{
              textAlign: "center",
              marginTop: "1rem",
              fontSize: "0.9rem",
              color: "var(--text-light)",
            }}
          >
            Already have an account?{" "}
            <a
              href="#"
              style={{
                color: "var(--primary-red)",
                textDecoration: "none",
                fontWeight: 500,
              }}
            >
              Sign In
            </a>
          </p>
        </div>
      </main>
    </div>
  );
}

export default Register;
