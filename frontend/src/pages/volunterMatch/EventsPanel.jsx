// frontend/src/pages/volunteer/EventsPanel.jsx
import SectionCard from "./SectionCard";
import EventCard from "./EventCard";

export default function EventsPanel({
  events,
  joinedMap,
  loading,
  error,
  user,
  sortMode,
  setSortMode,
}) {
  return (
    <SectionCard
      title={
        <div className="flex items-center justify-between gap-[345px] text-2xl md:text-4xl">
          {/* Left: title */}
          <div className="flex items-center gap-2">
            <span>🧩 Matched Events For You</span>
          </div>

          {/* Right: filter buttons */}
          <div className="flex items-center gap-2 text-xs sm:text-sm ">
            <button
              type="button"
              onClick={() => setSortMode("percentage")}
              className={`px-3 py-1 border rounded-md transition
                ${
                  sortMode === "percentage"
                    ? "bg-slate-900 text-white border-slate-900"
                    : "bg-white text-slate-700 border-slate-300 hover:bg-slate-100"
                }`}
            >
              Match %
            </button>
            <button
              type="button"
              onClick={() => setSortMode("priority")}
              className={`px-3 py-1 border rounded-md transition
                ${
                  sortMode === "priority"
                    ? "bg-slate-900 text-white border-slate-900"
                    : "bg-white text-slate-700 border-slate-300 hover:bg-slate-100"
                }`}
            >
              Priority
            </button>
          </div>
        </div>
      }
    >
      {loading ? (
        <p className="text-sm text-slate-500">Loading matched events...</p>
      ) : error ? (
        <p className="text-sm text-red-500">{error}</p>
      ) : !events || events.length === 0 ? (
        <p className="text-sm text-slate-500">No matched events yet.</p>
      ) : (
        <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
          {events.map((e) => {
            const eventId = e.id ?? e.event_id;
            const joinInfo = joinedMap?.[eventId] || {};
            return (
              <EventCard
                key={eventId}
                event={e}
                user={user}
                initialJoined={!!joinInfo.joined}
                initialHistoryId={joinInfo.history_id || null}
              />
            );
          })}
        </div>
      )}
    </SectionCard>
  );
}