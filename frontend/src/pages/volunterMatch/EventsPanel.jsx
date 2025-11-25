// frontend/src/pages/volunteer/EventsPanel.jsx
import React from "react";
import SectionCard from "./SectionCard";
import EventCard from "./EventCard";

export default function EventsPanel({ events = [], loading, error }) {
  return (
    <SectionCard
      title={
        <div className="flex items-center gap-2 content-start text-4xl">
          <span>🧩 Matched Events For You</span>
        </div>
      }
      className=""
    >
      <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
        {loading && <p>Loading your matched events...</p>}

        {!loading && error && (
          <p className="text-sm text-red-500">{error}</p>
        )}

        {!loading && !error && events.length === 0 && (
          <p className="text-sm text-slate-600">
            No matched events found yet. Try updating your skills or availability.
          </p>
        )}

        {!loading &&
          !error &&
          events.length > 0 &&
          events.map((e, i) => <EventCard key={e.id ?? i} event={e} />)}
      </div>
    </SectionCard>
  );
}