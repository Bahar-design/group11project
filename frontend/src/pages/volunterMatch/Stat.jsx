// import SkillsAvailability from "./SkillsAvailability";

export default function Stat({ label, value }) {
    return (
      <div className="flex items-center justify-between text-sm">
        <span className="text-slate-500">{label}</span>
        <span className="font-semibold text-slate-800">{value}</span>
      </div>
    );
  }