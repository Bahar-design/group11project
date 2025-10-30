import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../../components/layout.jsx";
import API_BASE from '../../lib/apiBase';
import "./registration.css";
import { Link } from "react-router-dom"; 

export default function Registration({ isLoggedIn, user, onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [adminID, setAdminID] = useState(""); 
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      setMessage("Error: Enter an Email and Password");
      return;
    }

    try {
      //Register the user
      const res = await fetch(`${API_BASE}/api/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, admin_ID: adminID }),
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage(data.message || "Registration failed");
        return;
      }

      //Automatically log in the user
      const loginRes = await fetch(`${API_BASE}/api/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const loginData = await loginRes.json();

      if (!loginRes.ok) {
        setMessage("Registered, but login failed: " + loginData.message);
        return;
      }

      //Fetch full profile
      try {
        const type = loginData.user?.type;
        const emailFromLogin = loginData.user?.email;

        const profileRes = await fetch(`${API_BASE}/api/user-profile?type=${type}&email=${encodeURIComponent(emailFromLogin)}`);

        if (profileRes.status === 404) {
          const userObj = { name: '', email: emailFromLogin, userType: type };
          onLogin(userObj);
          navigate('/user-profiles');
          return;
        }

        const profileData = await profileRes.json();
        if (!profileRes.ok) {
          setMessage('Login succeeded but failed to load profile.');
          return;
        }

        const userObj = { ...profileData, userType: type, email: emailFromLogin };
        onLogin(userObj);
        navigate('/user-profiles');

      } catch (err) {
        setMessage('Login succeeded but error loading profile.');
      }

    } catch (err) {
      console.error(err);
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
