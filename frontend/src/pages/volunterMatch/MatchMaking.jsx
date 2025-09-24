import React from "react";



function Chip({ children }) {
  return (
    <span className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-700">
      {children}
    </span>
  );
}

function Stat({ label, value }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-slate-500">{label}</span>
      <span className="font-semibold text-slate-800">{value}</span>
    </div>
  );
}

function SectionCard({ title, right, children, className = "" }) {
  return (
    <section className={`rounded-2xl border border-slate-200 bg-white p-4 shadow-lg md:p-5 shadow-black ${className}`}>
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-800 md:text-base">{title}</h3>
        {right}
      </div>
      {children}
    </section>
  );
}

function EventCard({ event }) {
  return (
    <div className="rounded-xl border border-slate-200 p-4 transition-colors hover:bg-red-400">
      <div className="mb-2 flex items-start justify-between gap-3">
        <div>
          <h4 className="text-sm font-semibold text-slate-900">{event.title}</h4>
          <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-slate-500">
            <div className="flex items-center gap-1">
              <span className="i">📍</span>
              <span>{event.location}</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="i">🕒</span>
              <span>{event.time}</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="i">👥</span>
              <span>{event.volunteers} volunteers</span>
            </div>
          </div>
        </div>
        {event.priority && (
          <span className={`rounded-full px-2 py-1 text-[10px] font-semibold ${
            event.priority === "HIGH" ? "bg-rose-100 text-rose-700" : "bg-amber-100 text-amber-700"
          }`}>
            {event.priority} PRIORITY
          </span>
        )}
      </div>

      <div className="mt-2 text-xs text-slate-600">
        <span className="font-medium text-slate-700">Skills Needed:</span> {event.skills.join(", ")}
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <Chip>{event.matchScore}% Perfect Match</Chip>
        <button className="rounded-xl bg-rose-500 px-3 py-1.5 text-xs font-semibold text-white hover:bg-rose-600">
          Join the Drive
        </button>
      </div>
    </div>
  );
}

function ActivityItem({ activity }) {
  return (
    <div className="flex items-start justify-between gap-3 rounded-lg border border-slate-200 p-3">
      <div>
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <span>{activity.date}</span>
          <span className="h-1 w-1 rounded-full bg-slate-300" />
          <span>{activity.location}</span>
        </div>
        <div className="mt-0.5 text-sm font-medium text-slate-800">{activity.title}</div>
        <div className="mt-1 text-xs text-slate-500">Impact: {activity.impact}</div>
      </div>
      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-50 text-[10px] font-bold text-amber-700">
        {activity.rating.toFixed(1)}
      </div>
    </div>
  );
}

const matchedEvents = [
  {
    title: "Holiday Clothing Drive",
    location: "Downtown Houston",
    time: "Dec 21, 2025 · 4–6pm",
    volunteers: 62,
    skills: ["Customer Service", "Organization", "Bilingual"],
    matchScore: 97,
    priority: "HIGH",
  },
  {
    title: "Winter Coat Sorting",
    location: "Sugar Land Center",
    time: "Dec 24, 2025 · 12–3pm",
    volunteers: 44,
    skills: ["Organization", "Attention to Detail"],
    matchScore: 84,
    priority: "MEDIUM",
  },
  {
    title: "Winter Coat Sorting",
    location: "Sugar Land Center",
    time: "Dec 24, 2025 · 12–3pm",
    volunteers: 44,
    skills: ["Organization", "Attention to Detail"],
    matchScore: 84,
    priority: "MEDIUM",
  },
];

const recentActivities = [
  {
    title: "Halloween Costume Drive",
    date: "Oct 31, 2025",
    location: "Downtown Houston",
    rating: 5.0,
    impact: "Helped 48 families · 4 hours volunteered",
  },
  {
    title: "Monday Madness Collection",
    date: "Oct 28, 2025",
    location: "Sugar Land",
    rating: 4.8,
    impact: "Sorted 200+ items · 4 hours volunteered",
  },
];

const skills = ["Customer Service", "Organization", "Bilingual (Spanish)", "Leadership"];

function  Navbar() {
  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
        <div className="flex items-center gap-2 -ml-30">
          <div className="flex h-13 w-13 items-center justify-center rounded-2xl bg-rose-500 text-white text-[2.5em]">❤</div>
          <span className="text-lg font-semibold text-slate-800 ">Houston Hearts</span>
        </div>
        <nav className="hidden gap-20 text-sm md:flex text-black font-bold">  
          <a href="#" className="hover:text-slate-900">Home</a>
          <a href="#" className="hover:text-slate-900">Events</a>
          <a href="#" className="hover:text-slate-900">Volunteer</a>
          <a href="#" className="hover:text-slate-900">Impact</a>
          <a href="#" className="hover:text-slate-900">About</a>
        </nav>
        <button className="-mr-10 rounded-full bg-rose-500 px-3 py-1.5 text-md font-bold text-white hover:bg-rose-600">Log Out</button>
      </div>
    </header>
  );
}

function Hero() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-8 text-center">
      <h1 className="text-5xl font-extrabold tracking-tight text-red-600 ">Your Volunteer Hub Matches/Impact</h1>
      <p className="mx-auto mt-2 max-w-xl text-xs text-slate-500 md:text-sm ">
        Discover personalized volunteer opportunities and track your community impact.
      </p>
    </div>
  );
}

function ImpactPanel() {
  const totalImpact = {
    families: 127,
    hours: 52,
    items: 800,
  };

  return (
    <SectionCard
      title={
        <div className="flex items-center gap-2">
          <span>🎉 Your Impact Story</span>
        </div>
      }
      className="h-full"
      right={<div className="text-right text-xs"><div className="font-bold text-slate-900">4.9</div><div className="text-slate-500">Average Rating</div></div>}
    >
      <div className="space-y-3">
        {recentActivities.map((a, idx) => (
          <ActivityItem key={idx} activity={a} />
        ))}

        <div className="rounded-xl border border-slate-200 p-3">
          <div className="mb-2 text-sm font-semibold text-slate-800">Total Impact This Year</div>
          <div className="grid grid-cols-3 gap-3 text-center text-xs">
            <div className="rounded-lg bg-emerald-50 p-3">
              <div className="font-bold text-emerald-700">{totalImpact.families}</div>
              <div className="text-slate-600">families helped</div>
            </div>
            <div className="rounded-lg bg-sky-50 p-3">
              <div className="font-bold text-sky-700">{totalImpact.hours}h</div>
              <div className="text-slate-600">hours volunteered</div>
            </div>
            <div className="rounded-lg bg-amber-50 p-3">
              <div className="font-bold text-amber-700">{totalImpact.items}+</div>
              <div className="text-slate-600">items processed</div>
            </div>
          </div>
        </div>
      </div>
    </SectionCard>
  );
}

function EventsPanel() {
  return (
    <SectionCard
      title={<div className="flex items-center gap-2 content-start text-4xl"><span>🧩 Matched Events For You</span></div>}
      right={<div className="text-sm text-black-500">Welcome back, Sarah!</div>}
      className=""
    >
      <div className="space-y-4">
        {matchedEvents.map((e, i) => (
          <EventCard key={i} event={e} />
        ))}
      </div>
    </SectionCard>
  );
}

function SkillsAvailability() {
  return (
    <SectionCard title={<span>🧭 Your Skills & Availability</span>}>
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <div className="mb-2 text-xs font-semibold text-slate-700">Your Skills</div>
          <div className="flex flex-wrap gap-2">
            {skills.map((s) => (
              <Chip key={s}>{s}</Chip>
            ))}
          </div>
        </div>
        <div>
          <div className="mb-2 text-xs font-semibold text-slate-700">Availability</div>
          <div className="space-y-2 text-sm">
            <Stat label="Location" value="Sugar Land (20 mile radius)" />
            <Stat label="Preferred Times" value="Afternoon shifts (4–8pm)" />
            <Stat label="Days Available" value="Weekends, Monday evenings" />
          </div>
        </div>
      </div>
    </SectionCard>
  );
}

function Footer() {
  return (
    <footer className="mt-12 border-t border-slate-200 bg-slate-900 text-slate-200">
      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-8 px-4 py-10 md:grid-cols-4">
        <div>
          <div className="mb-3 flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-rose-500 text-white">❤</div>
            <span className="text-sm font-semibold">Houston Hearts</span>
          </div>
          <p className="text-xs text-slate-400">
            Connecting hearts through clothing donations. Every item shared is a story of hope, dignity, and community care across Houston.
          </p>
        </div>
        <div>
          <div className="mb-3 text-sm font-semibold text-white">Get Involved</div>
          <ul className="space-y-2 text-xs text-slate-300">
            <li><a href="#" className="hover:underline">Volunteer Opportunities</a></li>
            <li><a href="#" className="hover:underline">Upcoming Events</a></li>
            <li><a href="#" className="hover:underline">Donation Guidelines</a></li>
            <li><a href="#" className="hover:underline">Become a Team Leader</a></li>
          </ul>
        </div>
        <div>
          <div className="mb-3 text-sm font-semibold text-white">Service Areas</div>
          <ul className="space-y-2 text-xs text-slate-300">
            <li>Downtown Houston</li>
            <li>Sugar Land Community</li>
            <li>Katy Neighborhoods</li>
            <li>Greater Houston Metro</li>
          </ul>
        </div>
        <div>
          <div className="mb-3 text-sm font-semibold text-white">Connect With Us</div>
          <ul className="space-y-2 text-xs text-slate-300">
            <li><a href="mailto:volunteer@houstonhearts.org" className="hover:underline">volunteer@houstonhearts.org</a></li>
            <li>(713) 555‑HELP</li>
            <li>Emergency: (713) 555‑URGENT</li>
            <li>Houston, TX 77001</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-slate-800" />
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 text-xs text-slate-400">
        <div>© {new Date().getFullYear()} Houston Hearts. All rights reserved.</div>
        <div className="text-slate-500">24/7 Crisis Support — for urgent clothing needs during disasters</div>
      </div>
    </footer>
  );
}

export default function MatchMaking() {
  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <Hero />

      <main className="mx-auto grid max-w-6xl grid-cols-1 gap-6 px-4 md:grid-cols-3">
        <div className="md:col-span-3">
          <EventsPanel />
        </div>
        <div className="md:col-span-3">
          <ImpactPanel />
        </div>
        {/* <div className="md:col-span-3">
          <SkillsAvailability />
        </div> */}
      </main>

      <Footer />
    </div>
  );
}
