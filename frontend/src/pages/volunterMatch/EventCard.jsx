// frontend/src/pages/volunteer/EventCard.jsx
import React, { useState } from "react";
import API_BASE from "../../lib/apiBase"; // adjust relative path if needed
import Chip from "./Chip";

export default function EventCard({ event, user }) {
  const [status, setStatus] = useState("idle");
  // "idle" | "joining" | "joined" | "can-unjoin" | "unjoining" | "unjoined"
  const [error, setError] = useState("");
  const [historyId, setHistoryId] = useState(null);

  const dateStr = event.date
    ? new Date(event.date).toLocaleDateString()
    : "Date TBA";

  const matchLabel =
    event.matchScore != null ? `${event.matchScore}% match` : "Match N/A";

  const urgencyLabel = (() => {
    switch (event.urgency) {
      case 4:
        return "Critical";
      case 3:
        return "High";
      case 2:
        return "Medium";
      case 1:
      default:
        return "Low";
    }
  })();

  let buttonText = "Join The Drive";
  let disabled = false;

  if (status === "joining") {
    buttonText = "Joining...";
    disabled = true;
  } else if (status === "joined") {
    buttonText = "Drive Joined";
    disabled = true;
  } else if (status === "can-unjoin") {
    buttonText = "Unjoin";
    disabled = false;
  } else if (status === "unjoining") {
    buttonText = "Unjoining...";
    disabled = true;
  } else if (status === "unjoined") {
    buttonText = "Unjoined";
    disabled = true;
  }

  async function handleJoinClick() {
    setError("");

    if (!user) {
      setError("Please log in to join events.");
      return;
    }

    // IMPORTANT: use volunteer_id for this table, not user_id
    const volunteerId = user.volunteer_id;
    if (!volunteerId) {
      setError("No volunteer profile found. Please complete your volunteer profile first.");
      return;
    }

    // If we're in can-unjoin, clicking means UNJOIN
    if (status === "can-unjoin") {
      if (!historyId) {
        setError("Cannot unjoin: no history record id found.");
        return;
      }

      try {
        setStatus("unjoining");
        const res = await fetch(`${API_BASE}/api/volunteer-history/${historyId}`, {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
        });

        if (!res.ok) {
          const text = await res.text();
          throw new Error(text || "Unjoin failed");
        }

        // Optionally we could remove this event from the UI here if you want.
        setStatus("unjoined");

        // after 10 seconds, reset back to "Join The Drive"
        setTimeout(() => {
          setStatus("idle");
          setHistoryId(null);
        }, 10000);
      } catch (err) {
        console.error("Unjoin error:", err);
        setError("Failed to unjoin event. Please try again.");
        setStatus("can-unjoin");
      }

      return;
    }

    // Otherwise, we are joining
    try {
      setStatus("joining");

      const res = await fetch(`${API_BASE}/api/volunteer-history`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          volunteer_id: volunteerId,
          event_id: event.id,
        }),
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || "Join failed");
      }

      const created = await res.json();
      setHistoryId(created.history_id); // so we know what to DELETE later
      setStatus("joined");

      // after 10 seconds, allow unjoin
      setTimeout(() => {
        setStatus("can-unjoin");
      }, 10000);
    } catch (err) {
      console.error("Join error:", err);
      setError("Failed to join event. Please try again.");
      setStatus("idle");
    }
  }

  return (
    <article className="rounded-xl bg-white p-4 shadow-sm border border-slate-200">
      <header className="flex items-center justify-between gap-3 mb-1">
        <h2 className="font-semibold text-lg">{event.title}</h2>
        <div className="flex items-center gap-2">
          <Chip label={matchLabel} type="match" />
          <Chip label={urgencyLabel} type="urgency" />
        </div>
      </header>

      <p className="text-sm text-slate-600 mb-1">{event.location}</p>
      <p className="text-xs text-slate-500 mb-2">{dateStr}</p>

      {Array.isArray(event.skills) && event.skills.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-3">
          {event.skills.map((skill) => (
            <Chip key={skill} label={skill} type="skill" />
          ))}
        </div>
      )}

      <div className="flex items-center justify-between mt-2">
        <button
          type="button"
          onClick={handleJoinClick}
          disabled={disabled}
          className={`px-3 py-1.5 rounded-full text-sm font-medium ${
            disabled
              ? "bg-slate-300 text-slate-700 cursor-not-allowed"
              : status === "can-unjoin"
              ? "bg-red-500 text-white hover:bg-red-600"
              : "bg-emerald-500 text-white hover:bg-emerald-600"
          }`}
        >
          {buttonText}
        </button>

        {typeof event.volunteers === "number" && (
          <span className="text-xs text-slate-500">
            {event.volunteers} volunteers
          </span>
        )}
      </div>

      {error && (
        <p className="mt-2 text-xs text-red-500">
          {error}
        </p>
      )}
    </article>
  );
}