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
  const [volunteerName, setVolunteerName] = useState("");

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
        const rows = Array.isArray(data.rows) ? data.rows : (Array.isArray(data) ? data : []);
        setHistory(rows);
        // try to set volunteer name from payload
        const nameFromPayload = data.volunteer_full_name || (rows[0] && (rows[0].volunteer_full_name || rows[0].volunteer_name));
        if (nameFromPayload) setVolunteerName(nameFromPayload);
      } catch (err) {
        console.error("Failed to load volunteer history:", err);
        setHistory([]);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();

    // subscribe to SSE stream for live updates (so joins appear immediately)
    let evtSource;
    try {
      evtSource = new EventSource(`${API_BASE.replace(/\/$/, '')}/api/volunteer-history/stream`);
      evtSource.onmessage = (e) => {
        try {
          const payload = JSON.parse(e.data);
          if (Array.isArray(payload.rows)) {
            const relevant = payload.rows.filter(r => Number(r.volunteer_id) === Number(myUserId));
            if (relevant.length) setHistory(prev => [...relevant, ...prev]);
            if (payload.volunteer_full_name) setVolunteerName(payload.volunteer_full_name);
          } else if (payload && payload.volunteer_id && Number(payload.volunteer_id) === Number(myUserId)) {
            setHistory(prev => [payload, ...prev]);
            if (payload.volunteer_full_name) setVolunteerName(payload.volunteer_full_name || volunteerName);
          }
        } catch (err) { /* ignore parse errors */ }
      };
      evtSource.onerror = () => { /* ignore errors */ };
    } catch (err) {
      console.warn('SSE not available for ImpactPanel', err);
    }

    return () => {
      if (evtSource) evtSource.close();
    };
  }, [user]);

  return (
    <SectionCard
      title={
        <div className="flex items-center gap-2">
          <span>🎉 {volunteerName ? `${volunteerName}'s Volunteer History` : 'Your Volunteer History'}</span>
        </div>
      }
      className="h-full"
      right={
        <div className="text-right text-xs">
          <div className="font-bold text-slate-900">{history.length}</div>
          <div className="text-slate-500">Events</div>
        </div>
      }
    >
      {loading ? (
        <p className="text-sm text-slate-500">Loading your history...</p>
      ) : history.length === 0 ? (
        <p className="text-sm text-slate-500">No activity found yet.</p>
      ) : (
        <div className="space-y-3">
          {/* Tabular list similar to History.jsx but compact for the side panel */}
          <div className="overflow-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-slate-500">
                  <th className="pb-2">Event Name</th>
                  <th className="pb-2">Description</th>
                  <th className="pb-2">Location</th>
                  <th className="pb-2">Required Skills</th>
                  <th className="pb-2">Matched Skills</th>
                  <th className="pb-2">Urgency</th>
                  <th className="pb-2">Event Date</th>
                  <th className="pb-2">Signup Date</th>
                </tr>
              </thead>
              <tbody className="text-slate-700">
                {history.map((h) => (
                  <tr key={h.history_id || `${h.event_id}-${h.signup_date}`} className="border-t border-slate-100">
                    <td className="py-2 pr-3">{h.event_name}</td>
                    <td className="py-2 pr-3">{h.description}</td>
                    <td className="py-2 pr-3">{h.location}</td>
                    <td className="py-2 pr-3">{(h.event_skill_names || []).join(', ')}</td>
                    <td className="py-2 pr-3">{(h.matched_skills || []).join(', ')}</td>
                    <td className="py-2 pr-3">{h.urgency}</td>
                    <td className="py-2 pr-3">{h.event_date ? new Date(h.event_date).toLocaleDateString() : '—'}</td>
                    <td className="py-2 pr-3">{h.signup_date ? new Date(h.signup_date).toLocaleDateString() : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="rounded-xl border border-slate-200 p-3">
            <div className="mb-2 text-sm font-semibold text-slate-800">
              Total Impact This Year
            </div>
            <div className="grid grid-cols-1 gap-3 text-center text-xs">
              <div className="rounded-lg bg-emerald-50 p-3">
                <div className="font-bold text-emerald-700">{history.length}</div>
                <div className="text-slate-600">events participated</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </SectionCard>
  );
}
