
import React from "react";
import Hero from './Hero.jsx'
import EventsPanel from "./EventsPanel.jsx";
import SectionCard from "./SectionCard.jsx";
import SkillsAvailability from "./SkillsAvailability.jsx";
import ImpactPanel from "./ImpactPanel.jsx";
import Layout from "../../components/layout.jsx";

import './MatchMaking.css';


export default function MatchMaking({ isLoggedIn, user }) {
  return (
  <Layout currentPage="volunteer" user={user} isLoggedIn={isLoggedIn}>
      <div className="min-h-screen bg-slate-50">
        <Hero />
        <main className="mx-auto grid max-w-7xl grid-cols-1 gap-6 px-4 md:grid-cols-3">
          <div>
            <EventsPanel />
            <ImpactPanel />
            {/* <SkillsAvailability /> */}
          </div>
        </main>
      </div>
    </Layout>
  );
}

