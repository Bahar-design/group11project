// group11project/frontend/src/pages/about/about.jsx
import React from "react";
import "./about.css";
import Layout from "../../components/layout.jsx"; // note the .jsx

export default function About({ isLoggedIn, onLogout, user }) {
  return (
    <Layout currentPage="about" isLoggedIn={isLoggedIn} onLogout={onLogout} user={user}>
      <section className="container" style={{ padding: "2rem 1rem" }}>
        <h1>About Houston Hearts</h1>
        <p>We connect volunteers with local events using skills, availability, and proximity.</p>
      </section>
    </Layout>
  );
}