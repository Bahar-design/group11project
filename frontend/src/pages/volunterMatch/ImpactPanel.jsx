import { useEffect, useState } from "react";
import SectionCard from "./SectionCard";
import API_BASE from "../../lib/apiBase";

function ActivityItem({ activity }) {
  return (
    <div className="flex items-start justify-between gap-3 rounded-lg border border-slate-200 p-3">
      <div>
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <span>
            {activity.signup_date
              ? new Date(activity.signup_date).toLocaleDateString()
              : "—"}
          </span>
          <span className="h-1 w-1 rounded-full bg-slate-300" />
          <span>{activity.location || "—"}</span>
        </div>
        <div className="mt-0.5 text-sm font-medium text-slate-800">
          {activity.event_name || `Event #${activity.event_id}`}
        </div>
        <div className="mt-1 text-xs text-slate-500">
          Status: {activity.status || "—"}
        </div>
      </div>

      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-50 text-[10px] font-bold text-amber-700">
        {activity.hours_worked ? `${activity.hours_worked}h` : "✓"}
      </div>
    </div>
  );
}

export default function ImpactPanel({ user }) {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Accept different id shapes coming from various auth flows
    let currentUser = user;
    if (!currentUser) {
      try {
        currentUser = JSON.parse(localStorage.getItem('user'));
      } catch (e) {
        currentUser = null;
      }
    }

    let myUserId = null;
    if (currentUser) myUserId = currentUser.user_id || currentUser.id || null;

    if (!myUserId) {
      try {
        const cached = JSON.parse(localStorage.getItem('hh_userProfile'));
        if (cached?.user_id) myUserId = cached.user_id;
        else if (cached?.volunteer_id) myUserId = cached.volunteer_id;
      } catch (e) { /* ignore */ }
    }

    if (!myUserId && currentUser) myUserId = currentUser.volunteer_id || null;
    if (!myUserId) {
      setHistory([]);
      setLoading(false);
      return;
    }

    const fetchHistory = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/volunteer-history/my/${myUserId}`);
        if (!res.ok) {
          console.warn('Volunteer history request failed', res.status);
          setHistory([]);
          return;
        }
        const data = await res.json();
        // normalize shapes: could be { rows, volunteer_full_name } or an array
        const rows = Array.isArray(data) ? data : (Array.isArray(data?.rows) ? data.rows : []);
        setHistory(rows);
      } catch (err) {
        console.error("Failed to load volunteer history:", err);
        setHistory([]);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [user]);

  // Total impact calculation
  const totalImpact = {
    families: history.length * 3, // Example: 3 families per event
    hours: history.reduce((sum, h) => sum + (Number(h.hours_worked) || 0), 0),
    items: history.length * 50,   // Example: 50 items per event
  };

  return (
    <SectionCard
      title={
        <div className="flex items-center gap-2">
          <span>🎉 Your Impact Story</span>
        </div>
      }
      className="h-full"
      right={
        <div className="text-right text-xs">
          <div className="font-bold text-slate-900">
            {history.length
              ? (totalImpact.hours / history.length).toFixed(1)
              : "—"}
          </div>
          <div className="text-slate-500">Avg Hours</div>
        </div>
      }
    >
      {loading ? (
        <p className="text-sm text-slate-500">Loading your history...</p>
      ) : history.length === 0 ? (
        <p className="text-sm text-slate-500">No activity found yet.</p>
      ) : (
        <div className="space-y-3">
          {history.map((a) => (
            <ActivityItem key={a.history_id || `${a.event_id}-${a.signup_date}`} activity={a} />
          ))}

          <div className="rounded-xl border border-slate-200 p-3">
            <div className="mb-2 text-sm font-semibold text-slate-800">
              Total Impact This Year
            </div>
            <div className="grid grid-cols-3 gap-3 text-center text-xs">
              <div className="rounded-lg bg-emerald-50 p-3">
                <div className="font-bold text-emerald-700">
                  {totalImpact.families}
                </div>
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
      )}
    </SectionCard>
  );
}
