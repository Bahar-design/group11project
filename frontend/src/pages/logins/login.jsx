import React, { useState } from "react";
import Layout from "../../components/layout.jsx";
import API_BASE from '../../lib/apiBase';
import "./login.css";
import { Link, useNavigate } from "react-router-dom";

export default function Login({ onLogin, isLoggedIn, user }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    //to make sure webpage doesn’t accidentally reuse old login data
    localStorage.removeItem("user");
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("hh_userProfile");
    

    if (!email || !password) {
      setMessage("Error: type in Email and Password");
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/api/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      let data;
      try {
        data = await res.json();
      } catch (parseErr) {
        console.error('Login: failed to parse JSON response', parseErr);
        setMessage(`Login failed: unexpected response (status ${res.status})`);
        return;
      }

      if (!res.ok) {
        console.error('Login failed:', res.status, data);
        setMessage(data.message || `Login failed (status ${res.status})`);
        return;
      }

      // Normalize user object shape so the rest of the app can rely on consistent fields.
      // Keep both camelCase and snake_case keys to be defensive against mixed usage.
      const userObj = {
        id: data.user.id || data.user.user_id || null,
        user_id: data.user.id || data.user.user_id || null,
        email: data.user.email,
        userType: data.user.type || data.user.userType || data.user.user_type || null,
        user_type: data.user.type || data.user.userType || data.user.user_type || null,
      };

      // Clear any stale cached profile so header initials don't come from a previously stored admin profile.
      try { localStorage.removeItem('hh_userProfile'); } catch (e) { /* ignore */ }

      onLogin(userObj);
      // Save login info so refresh doesn't log user out
      localStorage.setItem("user", JSON.stringify(userObj));
      localStorage.setItem("isLoggedIn", "true");

      // Delay navigation slightly to ensure parent state updates propagate
      // and the UserProfiles component gets the `user` prop.
      Promise.resolve().then(() => navigate('/user-profiles'));

    } catch (err) {
      console.error('Login network error:', err);
      setMessage(`Network error: ${err.message || 'Could not reach server'}`);
    }
  };

  return (
    <Layout currentPage="login" isLoggedIn={isLoggedIn} onLogin={onLogin} user={user}>
      <main className="login-main">
        <div className="login-card">
          <h2>Login</h2>

          <form onSubmit={handleLogin}>
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

            <button type="submit" className="btn">Sign In</button>
          </form>

          {message && <p style={{ color: "var(--primary-red)", marginTop: "1rem" }}>{message}</p>}

          <p>
            Don’t have an account? <Link to="/register">Register</Link>
          </p>
          <p>
          Change your password? <Link to="/change-password">Update Password</Link>
          </p>
        </div>
      </main>
    </Layout>
  );
}
