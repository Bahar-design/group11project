import Chip from "./Chip";
import { useState }from "react" 


export default function EventCard({ event }) {
  //* for onlick action 
  const [joined, setJoined] = useState(false); 

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
  
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <Chip>{event.matchScore}% Perfect Match</Chip>  {/*this is were in the future we will insert the percentage! also the children object is the content wrapped inside of <Chip>*/}
          {/* to add rounded corners added ! to overide parent or component library styling */}
          <button
            onClick={ () => setJoined(!joined)}
            className={`!rounded-full px-6 py-3 text-sm font-semibold text-white transition
            ${ joined ? "bg-green-500 hover:bg-green-600" : "bg-rose-500 hover:bg-rose-600"}`}
            >
            {joined ? "Drive Joined!" : "Join The Drive!"}
          </button>
        </div>
      </div>
    );
  }
