// frontend/src/pages/volunteer/MatchMaking.jsx (path based on your imports)
import React, { useEffect, useState } from "react";
import Hero from "./Hero.jsx";
import EventsPanel from "./EventsPanel.jsx";
import SkillsAvailability from "./SkillsAvailability.jsx";
import ImpactPanel from "./ImpactPanel.jsx";
import SectionCard from "./SectionCard.jsx";
import Layout from "../../components/layout.jsx";
import API_BASE from "../../lib/apiBase"; // ✅ make sure this path matches your project

import "./MatchMaking.css";

export default function MatchMaking({ isLoggedIn, user, onLogout }) {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    // get user either from props or from localStorage (after refresh)
    let currentUser = user;
    if (!currentUser) {
      try {
        currentUser = JSON.parse(localStorage.getItem("user"));
      } catch {
        currentUser = null;
      }
    }

    if (!currentUser || (!currentUser.id && !currentUser.user_id)) {
      setError("Please log in to see your matched events.");
      setLoading(false);
      return;
    }

    const volunteerId = currentUser.id || currentUser.user_id;

    async function fetchMatches() {
      try {
        setLoading(true);
        setError("");

        const res = await fetch(`${API_BASE}/api/matches/${volunteerId}`);
        if (!res.ok) {
          const text = await res.text();
          throw new Error(`Server responded ${res.status}: ${text}`);
        }

        const data = await res.json();
        // backend already sorts by matchScore, but sort again just in case
        data.sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0));
        setEvents(data);
      } catch (err) {
        console.error("Failed to load matched events:", err);
        setError(err.message || "Failed to load matched events.");
      } finally {
        setLoading(false);
      }
    }

    fetchMatches();
  }, [user]);

  return (
    <Layout
      currentPage="volunteer"
      user={user}
      isLoggedIn={isLoggedIn}
      onLogout={onLogout}
    >
      <div className="min-h-screen bg-slate-50">
        <Hero />
        <main className="mx-auto grid max-w-7xl grid-cols-1 gap-6 px-4 md:grid-cols-3">
          <div>
            {/* 🔽 pass events + loading + error into EventsPanel */}
            <EventsPanel events={events} loading={loading} error={error} />
            <ImpactPanel />
            {/* <SkillsAvailability /> */}
          </div>
        </main>
      </div>
    </Layout>
  );
}