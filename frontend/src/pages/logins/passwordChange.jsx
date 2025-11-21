import React, { useState } from "react";
import Layout from "../../components/layout.jsx";
import API_BASE from "../../lib/apiBase";
import "./login.css"; 
import { useNavigate, Link } from "react-router-dom";

export default function PasswordChange({ isLoggedIn, user }) {
  const [email, setEmail] = useState("");
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNew, setConfirmNew] = useState("");
  const [message, setMessage] = useState("");

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (newPassword !== confirmNew) {
      setMessage("New passwords do not match.");
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/api/login/change-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, oldPassword, newPassword }),
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage(data.message || "Error changing password.");
        return;
      }

      setMessage("Password updated! Redirecting to login...");
      setTimeout(() => navigate("/login"), 1500);
    } catch (err) {
      setMessage("Server error");
    }
  };

  return (
    <Layout currentPage="change-password" isLoggedIn={isLoggedIn} user={user}>
      <main className="login-main">
        <div className="login-card">
          <h2>Change Password</h2>

          <form onSubmit={handleSubmit}>
            <label>Email</label>
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <label>Old Password</label>
            <input
              type="password"
              placeholder="Enter your old password"
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              required
            />

            <label>New Password</label>
            <input
              type="password"
              placeholder="Enter your new password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />

            <label>Confirm New Password</label>
            <input
              type="password"
              placeholder="Confirm your new password"
              value={confirmNew}
              onChange={(e) => setConfirmNew(e.target.value)}
              required
            />

            <button type="submit" className="btn">Change Password</button>
          </form>

          {message && (
            <p style={{ color: "var(--primary-red)", marginTop: "1rem" }}>
              {message}
            </p>
          )}

          <p>
            Back to <Link to="/login">Login</Link>
          </p>
        </div>
      </main>
    </Layout>
  );
}
