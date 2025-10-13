
import React from "react";
import Hero from './Hero.jsx'
import EventsPanel from "./EventsPanel.jsx";
import SectionCard from "./SectionCard.jsx";
import SkillsAvailability from "./SkillsAvailability.jsx";
import ImpactPanel from "./ImpactPanel.jsx";
import Layout from "../../components/layout.jsx";

import './MatchMaking.css';



//! Chip function moved to Chip.jsx

//! Stat function moved to Stat.jsx


// ! Moved SectionCard moved to SectionCard.jsx


//! Moved EventCard function moved to EventCard

//! Activity Item moved to impact panel


//! Matched Events moved to events panel

//!recent Activites moved to RecentActivites.jsx


// function  Navbar() {
//   return (
//     <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/90 backdrop-blur">
//       <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
//         <div className="flex items-center gap-2 -ml-30">
//           <div className="flex h-13 w-13 items-center justify-center rounded-2xl bg-rose-500 text-white text-[2.5em]">❤</div>
//           <span className="text-lg font-semibold text-slate-800 ">Houston Hearts</span>
//         </div>
//         <nav className="hidden gap-20 text-sm md:flex text-black font-bold">  
//           <a href="#" className="hover:text-slate-900">Home</a>
//           <a href="#" className="hover:text-slate-900">Events</a>
//           <a href="#" className="hover:text-slate-900">Volunteer</a>
//           <a href="#" className="hover:text-slate-900">Impact</a>
//           <a href="#" className="hover:text-slate-900">About</a>
//         </nav>
//         <button className="-mr-10 rounded-full bg-rose-500 px-3 py-1.5 text-md font-bold text-white hover:bg-rose-600">Log Out</button>
//       </div>
//     </header>
//   );
// }

//! moved to the Hero Component


//!impact panel has been moved

// !! Moved to EventsPanel.jsx
//! SkillsAvailability moved to SkillsAvailability.jsx


export default function MatchMaking({ isLoggedIn, user }) {
  return (
  <Layout currentPage="volunteer" user={user} isLoggedIn={isLoggedIn}>
      <div className="min-h-screen bg-slate-50">
        <Hero />
        <main className="mx-auto grid max-w-7xl grid-cols-1 gap-6 px-4 md:grid-cols-3">
          <div>
            <EventsPanel />
            <ImpactPanel />
            <SkillsAvailability />
          </div>
          {/* <div>
            <ImpactPanel />
          </div> */}
          {/* <div className="md:col-span-3">
            <SkillsAvailability />
          </div> */}
        </main>
      </div>
    </Layout>
  );
}

