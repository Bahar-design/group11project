// group11project/frontend/src/pages/about/about.jsx`
//* in the about page we must detail what our volunteer services offer
//* 1. Task urgency and priority
//* 2. user proper notification and messaging paths
//* 3. user match making capabilities
//* 4. volunteer history
//* 
//*
import React from "react";
import "./about.css";
import Layout from "../../components/layout.jsx"; // note the .jsx

export default function About({ isLoggedIn, onLogout, user }) {
  return (
    <Layout currentPage="about" isLoggedIn={isLoggedIn} onLogout={onLogout} user={user}>
      <section className="flex">
        <h1 className="items-center ">About Houston Hearts</h1>
        <p>We connect volunteers with local events using skills, availability, and proximity.</p>
      </section>
    </Layout>
  );
}


//! properly connected now!!!!