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

      const data = await res.json();

      if (!res.ok) {
        setMessage(data.message || "Login failed");
        return;
      }

      // Minimal info only, no profile fetch
      const userObj = {
        email: data.user.email,
        userType: data.user.type,   // 'admin' or 'volunteer'
      };

      onLogin(userObj);
      navigate('/user-profiles');

    } catch (err) {
      console.error(err);
      setMessage("Error connecting to backend");
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
        </div>
      </main>
    </Layout>
  );
}
