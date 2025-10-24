import React, { useState } from "react";
import Layout from "../../components/layout.jsx";
import "./registration.css";
import { Link } from "react-router-dom"; 

export default function Registration({ isLoggedIn, user }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [adminID, setAdminID] = useState(""); 
  const [message, setMessage] = useState("");

  const handleRegister = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      setMessage("Error: Enter an Email and Password");
      return;
    }

    try {
  const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:4000';
  const res = await fetch(`${API_BASE}/api/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, adminID }),  
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage(data.message || "Registration failed");
      } else {
        setMessage(data.message);                  // backend message 
      }
    } catch (err) {
      setMessage("Error connecting to backend");
    }
  };


  return (
  <Layout currentPage="register" user={user} isLoggedIn={isLoggedIn}>
      <main className="registration-main">
        <div className="registration-card">
          <h2>Register</h2>

          <form onSubmit={handleRegister}>
            <label>Email</label>
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <label>Password</label>
            <input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            <label><span className="required-star">*</span>Admin ID </label>
            <input
              type="text"
              placeholder="Enter Admin ID if applicable"
              value={adminID}
              onChange={(e) => setAdminID(e.target.value)}
            />
            <span className="input-hint">*Optional for volunteers</span>


            <button type="submit" className="btn">Register</button>
          </form>

          {message && <p style={{ color: "var(--primary-red)", marginTop: "1rem" }}>{message}</p>}

          <p>
            Already have an account? <Link to="/login">Sign In</Link>
          </p>
        </div>
      </main>
    </Layout>
  );
}

