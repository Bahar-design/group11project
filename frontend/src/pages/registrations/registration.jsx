import React, { useState } from "react";
import Layout from "../../components/layout.jsx";
import "./registration.css";

export default function Registration() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  const handleRegister = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch("http://localhost:4000/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage(data.message || "Registration failed");
      } else {
        setMessage("Registration successful!");
      }
    } catch (err) {
      setMessage("Error connecting to backend");
    }
  };

  return (
    <Layout currentPage="register">
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

            <button type="submit" className="btn">Register</button>
          </form>

          {message && <p style={{ color: "var(--primary-red)", marginTop: "1rem" }}>{message}</p>}

          <p>
            Already have an account? <a href="#">Sign In</a>
          </p>
        </div>
      </main>
    </Layout>
  );
}
