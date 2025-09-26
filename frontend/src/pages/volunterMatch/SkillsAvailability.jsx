import Chip from "./Chip";
import SectionCard from "./SectionCard";
import Stat from './Stat.jsx'
import  matchedEvents  from "./matchedEvents";

export default function SkillsAvailability() {

    const allSkills = [...new Set(matchedEvents.flatMap((e) => e.skills))];

    return (
      <SectionCard title={<span>🧭 Your Skills & Availability</span>}>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <div className="mb-2 text-xs font-semibold text-slate-700">Your Skills</div>
            <div className="flex flex-wrap gap-2">
              {allSkills.map((s) => (
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