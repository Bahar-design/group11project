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

  console.log("Using API_BASE:", API_BASE);


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
      } else {
        // Fetch full profile after login
        const type = data.user?.type;
        const email = data.user?.email;
        if (!type || !email) {
          setMessage("Login succeeded but user type or email missing.");
          return;
        }
        try {
          const profileRes = await fetch(`${API_BASE}/api/user-profile?type=${type}&email=${encodeURIComponent(email)}`);
          if (profileRes.status === 404) {
            // No profile yet for this user — allow navigation with minimal info so they can create one
            const userObj = { userType: type, email };
            onLogin(userObj);
            navigate('/user-profiles');
            return;
          }
          const profileData = await profileRes.json();
          if (!profileRes.ok) {
            setMessage("Login succeeded but failed to load profile.");
            return;
          }
          // Merge login info (type, email) with profile
          const userObj = { ...profileData, userType: type, email };
          onLogin(userObj);
          navigate("/user-profiles");
        } catch (err) {
          setMessage("Login succeeded but error loading profile.");
        }
      }
    } catch (err) {
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
