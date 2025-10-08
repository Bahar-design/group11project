import React, { useState } from "react";
import Layout from "../../components/layout.jsx";
import "./login.css";
import { Link } from "react-router-dom";              //for the registration link

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();

    // Frontend check: show error if email or password is empty
    if (!email || !password) {
      setMessage("Error: type in Email and Password");
      return; // stop the function here
    }

    try {
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/auth`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage(data.message);
      } else {
        setMessage(`Welcome ${data.user.name}!`);
      }
    } catch (err) {
      setMessage("Error connecting to backend");
    }
  };


  return (
    <Layout currentPage="login">
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

