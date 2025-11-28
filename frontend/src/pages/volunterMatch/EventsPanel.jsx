import SectionCard from "./SectionCard";
import EventCard from "./EventCard";

export default function EventsPanel({
  events,
  joinedMap,
  loading,
  error,
  user,
}) {
  return (
    <SectionCard
      title={
        <div className="flex items-center gap-2 content-start text-4xl">
          <span>🧩 Matched Events For You</span>
        </div>
      }
    >
      {loading ? (
        <p className="text-sm text-slate-500">Loading matched events...</p>
      ) : error ? (
        <p className="text-sm text-red-500">{error}</p>
      ) : events.length === 0 ? (
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