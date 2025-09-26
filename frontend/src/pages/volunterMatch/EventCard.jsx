import Chip from "./Chip";


export default function EventCard({ event }) {
    return (
      <div className="rounded-xl border border-slate-200 p-4 transition-colors hover:bg-red-400">
        <div className="mb-2 flex items-start justify-between gap-3">
            <div>
                <h4 className="text-sm font-semibold text-slate-900 ">{event.title}</h4>
                <div className="mt-10 flex flex-wrap items-center text-xs text-slate-500"> 
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
            )
          }
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