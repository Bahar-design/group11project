// frontend/src/pages/volunteer/MatchMaking.jsx
import React, { useEffect, useState } from "react";
import Hero from "./Hero.jsx";
import EventsPanel from "./EventsPanel.jsx";
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
    // 1️⃣ Get current user (props or localStorage)
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

  // 2️⃣ Try to find volunteer identifier from multiple places
  // Prefer authoritative user_id/id shapes that map to volunteer_history.volunteer_id
  let volunteerId = currentUser.user_id || currentUser.id || null;

    // Fallback: check cached profile if your app stores it
    if (!volunteerId) {
      try {
        const cachedProfile = JSON.parse(
          localStorage.getItem("hh_userProfile")
        );
        if (cachedProfile?.volunteer_id) {
          volunteerId = cachedProfile.volunteer_id;
        }
      } catch {
        // ignore
      }
    }

    // Fallback: legacy volunteer_id property
    if (!volunteerId) {
      volunteerId = currentUser.volunteer_id || null;
    }

    if (!volunteerId) {
      setError("No volunteer identifier found. Please log in again.");
      setLoading(false);
      return;
    }

  // resolved volunteer id will be used below; no debug banner

    async function fetchData() {
      try {
        setLoading(true);
        setError("");

        // 3️⃣ Fetch matched events (this was already working before)
        const matchesRes = await fetch(`${API_BASE}/api/matches/${volunteerId}`);
        //const matchesRes = await fetch(`${API_BASE}/api/matches/${currentUser.user_id}`);

        if (!matchesRes.ok) {
          const text = await matchesRes.text();
          throw new Error(`Failed to load matches: ${matchesRes.status} ${text}`);
        }
        const matches = await matchesRes.json();

        // 4️⃣ Fetch volunteer history for this same ID
        let history = [];
        try {
          const historyRes = await fetch(
            `${API_BASE}/api/volunteer-history/my/${volunteerId}`
          );
          if (historyRes.ok) {
            const hdata = await historyRes.json();
            // API may return { rows, volunteer_full_name } or an array
            if (Array.isArray(hdata)) {
              history = hdata;
            } else if (hdata && Array.isArray(hdata.rows)) {
              history = hdata.rows;
            } else {
              // unexpected shape; ignore
              history = [];
            }
          } else {
            console.warn(
              "Failed to load volunteer history:",
              historyRes.status
            );
          }
        } catch (e) {
          console.warn("Error loading volunteer history:", e);
        }

  // no debug UI; use history for joinedMap

        // 5️⃣ Build joinedMap: event_id -> { joined: true, history_id }
        const map = {};
        for (const h of history) {
          map[h.event_id] = {
            joined: true,
            history_id: h.history_id,
          };
        }

        // 6️⃣ Sort matches by matchScore just in case
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
            <EventsPanel
              events={events}
              joinedMap={joinedMap}
              loading={loading}
              error={error}
              user={user}
            />
            <ImpactPanel user={user} />
          </div>
        </main>
      </div>
    </Layout>
  );
}

