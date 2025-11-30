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
        // Normalize each row to expected keys so the UI shows matched skills reliably
        const normalize = (r) => {
          const event_skill_names = r.event_skill_names || r.eventSkills || r.event_skill_names || r.event_skill_ids && Array.isArray(r.event_skill_ids) ? r.event_skill_ids : [];
          const matched_skills = r.matched_skills || r.matchedSkills || r.matched || [];
          const urgencyRaw = r.urgency || r.urgency_level || r.urgency_level_id || r.urgency_id;
          return {
            ...r,
            event_skill_names: Array.isArray(event_skill_names) ? event_skill_names : [],
            matched_skills: Array.isArray(matched_skills) ? matched_skills : [],
            urgencyRaw
          };
        };

        const normRows = rows.map(normalize);
        setHistory(normRows);
        // try to set volunteer name from payload
        const nameFromPayload = data.volunteer_full_name || (rows[0] && (rows[0].volunteer_full_name || rows[0].volunteer_name));
        if (nameFromPayload) setVolunteerName(nameFromPayload);

        // Also try to fetch canonical user profile by email (user_table -> volunteerprofile) if available
        try {
          const email = currentUser?.user_email || currentUser?.email || null;
          if (email) {
            const p = await fetch(`${API_BASE}/api/user-profile?email=${encodeURIComponent(email)}`);
            if (p.ok) {
              const pj = await p.json();
              // API returns 'name' for the profile controller
              if (pj && pj.name) setVolunteerName(pj.name);
            }
          }
        } catch (e) {
          // ignore profile fetch failures
        }
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
          const toRow = (r) => {
            const event_skill_names = r.event_skill_names || r.eventSkills || r.event_skill_ids || [];
            const matched_skills = r.matched_skills || r.matchedSkills || r.matched || [];
            return {
              ...r,
              event_skill_names: Array.isArray(event_skill_names) ? event_skill_names : [],
              matched_skills: Array.isArray(matched_skills) ? matched_skills : []
            };
          };

          if (Array.isArray(payload.rows)) {
            const relevant = payload.rows.map(toRow).filter(r => Number(r.volunteer_id) === Number(myUserId));
            if (relevant.length) setHistory(prev => [...relevant, ...prev]);
            if (payload.volunteer_full_name) setVolunteerName(payload.volunteer_full_name);
          } else if (payload && payload.volunteer_id && Number(payload.volunteer_id) === Number(myUserId)) {
            setHistory(prev => [toRow(payload), ...prev]);
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
            <table className="min-w-full text-sm table-auto border-collapse">
              <thead>
                <tr className="text-left text-xs text-slate-500">
                  <th className="pb-2 px-3 border-b border-slate-200">Event Name</th>
                  <th className="pb-2 px-3 border-b border-slate-200">Description</th>
                  <th className="pb-2 px-3 border-b border-slate-200">Location</th>
                  <th className="pb-2 px-3 border-b border-slate-200">Required Skills</th>
                  <th className="pb-2 px-3 border-b border-slate-200">Matched Skills</th>
                  <th className="pb-2 px-3 border-b border-slate-200">Urgency</th>
                  <th className="pb-2 px-3 border-b border-slate-200">Event Date</th>
                  <th className="pb-2 px-3 border-b border-slate-200">Signup Date</th>
                </tr>
              </thead>
              <tbody className="text-slate-700">
                {history.map((h) => {
                  // map urgency raw value to friendly label
                  const urgencyLabel = (u) => {
                    if (!u && u !== 0) return '—';
                    const s = String(u).toLowerCase();
                    if (['3','critical','high'].includes(s)) return 'Critical';
                    if (['2','medium','moderate'].includes(s)) return 'Medium';
                    if (['1','low','minor'].includes(s)) return 'Low';
                    return String(u);
                  };

                  const matched = (h.matched_skills && h.matched_skills.length) ? h.matched_skills : (h.matchedSkills && h.matchedSkills.length ? h.matchedSkills : []);
                  const required = (h.event_skill_names && h.event_skill_names.length) ? h.event_skill_names : (h.eventSkills || []);

                  return (
                    <tr key={h.history_id || `${h.event_id}-${h.signup_date}`} className="border-t border-slate-100">
                      <td className="py-2 px-3 align-top border border-slate-100">{h.event_name || `Event #${h.event_id}`}</td>
                      <td className="py-2 px-3 align-top border border-slate-100 whitespace-normal">{h.description}</td>
                      <td className="py-2 px-3 align-top border border-slate-100">{h.location}</td>
                      <td className="py-2 px-3 align-top border border-slate-100">{required.join(', ')}</td>
                      <td className="py-2 px-3 align-top border border-slate-100">{matched.length ? matched.join(', ') : '—'}</td>
                      <td className="py-2 px-3 align-top border border-slate-100">{urgencyLabel(h.urgencyRaw || h.urgency)}</td>
                      <td className="py-2 px-3 align-top border border-slate-100">{h.event_date ? new Date(h.event_date).toLocaleDateString() : '—'}</td>
                      <td className="py-2 px-3 align-top border border-slate-100">{h.signup_date ? new Date(h.signup_date).toLocaleDateString() : '—'}</td>
                    </tr>
                  );
                })}
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
