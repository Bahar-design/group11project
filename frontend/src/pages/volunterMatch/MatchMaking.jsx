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
    let volunteerId = currentUser.user_id || currentUser.id || null;

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

    if (!volunteerId) {
      volunteerId = currentUser.volunteer_id || null;
    }

    if (!volunteerId) {
      setError("No volunteer identifier found. Please log in again.");
      setLoading(false);
      return;
    }

    async function fetchData() {
      try {
        setLoading(true);
        setError("");

        const matchesRes = await fetch(`${API_BASE}/api/matches/${volunteerId}`);

        if (!matchesRes.ok) {
          const text = await matchesRes.text();
          throw new Error(`Failed to load matches: ${matchesRes.status} ${text}`);
        }
        const matches = await matchesRes.json();

        let history = [];
        try {
          const historyRes = await fetch(
            `${API_BASE}/api/volunteer-history/my/${volunteerId}`
          );
          if (historyRes.ok) {
            const hdata = await historyRes.json();
            if (Array.isArray(hdata)) {
              history = hdata;
            } else if (hdata && Array.isArray(hdata.rows)) {
              history = hdata.rows;
            } else {
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

        const map = {};
        for (const h of history) {
          map[h.event_id] = {
            joined: true,
            history_id: h.history_id,
          };
        }

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

        {/* 🔥 Stack EventsPanel and ImpactPanel vertically */}
        <main className="mx-auto max-w-7xl px-4 py-8">
          <div className="flex flex-col gap-8"> 
            <div>
              <EventsPanel
                events={events}
                joinedMap={joinedMap}
                loading={loading}
                error={error}
                user={user}
              />
            </div>

            <div>
              <ImpactPanel user={user} />
            </div>
          </div>
        </main>
      </div>
    </Layout>
  );
}