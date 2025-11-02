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
      // Register the user
      const res = await fetch(`${API_BASE}/api/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, admin_id: adminID }),
      });

        let data;
        try {
          data = await res.json();
        } catch (parseErr) {
          console.error('Registration: failed to parse JSON response', parseErr);
          setMessage(`Registration failed: unexpected response (status ${res.status})`);
          return;
        }

        if (!res.ok) {
          console.error('Registration failed:', res.status, data);
          setMessage(data.message || `Registration failed (status ${res.status})`);
          return;
        }

      // Automatically log in the user with minimal info if onLogin handler provided
      if (data && data.user) {
        const userObj = {
          email: data.user.email,
          userType: data.user.type, // 'admin' or 'volunteer'
        };
        if (typeof onLogin === 'function') {
          try {
            onLogin(userObj);
          } catch (err) {
            console.error('onLogin handler threw:', err);
          }
        }
        // Ensure React state from onLogin is applied before navigating so
        // the user-profiles page receives the updated `user` prop.
        Promise.resolve().then(() => navigate('/user-profiles'));
      } else {
        console.warn('Registration: no user object returned from API', data);
        navigate('/user-profiles'); // still navigate but user may be empty
      }

    } catch (err) {
      console.error('Registration network error:', err);
      setMessage(`Network error: ${err.message || 'Could not reach server'}`);
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
