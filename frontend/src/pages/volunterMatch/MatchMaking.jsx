// frontend/src/pages/volunteer/MatchMaking.jsx
import React, { useEffect, useState } from "react";
import Hero from "./Hero.jsx";
import EventsPanel from "./EventsPanel.jsx";
import SkillsAvailability from "./SkillsAvailability.jsx";
import ImpactPanel from "./ImpactPanel.jsx";
import Layout from "../../components/layout.jsx";
import API_BASE from "../../lib/apiBase";

import "./MatchMaking.css";

export default function MatchMaking({ isLoggedIn, user, onLogout }) {
  const [events, setEvents] = useState([]);
  const [joinedMap, setJoinedMap] = useState({}); // event_id -> { joined, history_id }
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

    if (!currentUser) {
      setError("Please log in to see your matched events.");
      setLoading(false);
      return;
    }

    // ✅ Prefer volunteer_id (the volunteerprofile PK used by /api/matches and /api/volunteer-history/my)
    const volunteerId =
      currentUser.volunteer_id || currentUser.id || currentUser.user_id;

    if (!volunteerId) {
      setError("No volunteer profile found. Please complete your profile.");
      setLoading(false);
      return;
    }

    async function fetchData() {
      try {
        setLoading(true);
        setError("");

        // 1️⃣ Fetch matched events for this volunteer
        const matchesRes = await fetch(`${API_BASE}/api/matches/${volunteerId}`);
        if (!matchesRes.ok) {
          const text = await matchesRes.text();
          throw new Error(`Failed to load matches: ${matchesRes.status} ${text}`);
        }
        const matches = await matchesRes.json();

        // 2️⃣ Fetch volunteer history for this volunteer
        let history = [];
        try {
          const historyRes = await fetch(
            `${API_BASE}/api/volunteer-history/my/${volunteerId}`
          );
          if (historyRes.ok) {
            history = await historyRes.json();
          } else {
            console.warn(
              "Failed to load volunteer history:",
              historyRes.status
            );
          }
        } catch (e) {
          console.warn("Error loading volunteer history:", e);
        }

        // 3️⃣ Build a map: event_id -> { joined: true, history_id }
        const map = {};
        for (const h of history) {
          map[h.event_id] = {
            joined: true,
            history_id: h.history_id,
          };
        }

        // 4️⃣ Sort events by matchScore (backend already does it, but double-check)
        matches.sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0));

        setEvents(matches);
        setJoinedMap(map);
      } catch (err) {
        console.error("Failed to load matched events:", err);
        setError(err.message || "Failed to load matched events.");
      } finally {
        setLoading(false);
      }
    }

    fetchData();
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
            {/* 🔽 pass events + loading + error + joinedMap + user into EventsPanel */}
            <EventsPanel
              events={events}
              joinedMap={joinedMap}
              loading={loading}
              error={error}
              user={user}
            />
            <ImpactPanel />
            {/* <SkillsAvailability /> */}
          </div>
        </main>
      </div>
    </Layout>
  );
}