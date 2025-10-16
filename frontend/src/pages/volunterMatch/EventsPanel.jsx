import SectionCard from "./SectionCard";
import EventCard from "./EventCard";
import matchedEvents from './matchedEvents';


export default function EventsPanel() {
    return (
      <SectionCard
        title={<div className="flex items-center gap-2 content-start text-4xl"><span>🧩 Matched Events For You</span></div>}
        className=""
      >
        <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
          {matchedEvents.map( (e, i) => (
            <EventCard key={i} event={e} />
          ))}
        </div>
      </SectionCard>
    );
  }