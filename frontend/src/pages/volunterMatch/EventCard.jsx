// frontend/src/pages/volunteer/EventCard.jsx
import React, { useState } from "react";
import Chip from "./Chip";
import API_BASE from "../../lib/apiBase";

export default function EventCard({
  event,
  user,
  initialJoined = false,
  initialHistoryId = null,
}) {
  // "idle" | "joining" | "joined" | "can-unjoin" | "unjoining" | "unjoined"
  const [status, setStatus] = useState(
    initialJoined ? "can-unjoin" : "idle"
  );
  const [error, setError] = useState("");
  const [historyId, setHistoryId] = useState(initialHistoryId);

  const eventId = event.id ?? event.event_id;

  const joinedLike =
    status === "joining" ||
    status === "joined" ||
    status === "can-unjoin" ||
    status === "unjoining";

  let buttonText = "Join The Drive!";
  let disabled = false;

  if (status === "joining") {
    buttonText = "Joining...";
    disabled = true;
  } else if (status === "joined") {
    buttonText = "Drive Joined!";
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

    const userId = user.id ?? user.user_id;
    if (!userId) {
      setError("No user id found. Please log in again.");
      return;
    }

    if (!eventId) {
      setError("No event id found for this card.");
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

        const res = await fetch(
          `${API_BASE}/api/volunteer-history/${historyId}`,
          {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
          }
        );

        if (!res.ok) {
          const text = await res.text();
          throw new Error(text || "Unjoin failed");
        }

        setStatus("unjoined");

        // After 10 seconds, reset back to idle
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

    // Otherwise we are JOINING
    try {
      setStatus("joining");

      const res = await fetch(`${API_BASE}/api/volunteer-history`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: userId,
          event_id: eventId,
        }),
      });

      if (!res.ok) {
        const text = await res.text();
        console.error("Join failed response:", res.status, text);
        throw new Error(text || "Join failed");
      }

      const created = await res.json();
      setHistoryId(created.history_id);

      setStatus("joined");

      // After 10 seconds, allow unjoin
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
    <div className="rounded-xl border border-slate-200 p-4 transition-colors hover:bg-red-400">
      <div className="mb-2 flex items-start justify-between gap-3">
        <div>
          <h4 className="text-sm font-semibold text-slate-900 ">
            {event.title}
          </h4>
          <div className="mt-10 flex flex-wrap items-center text-xs text-slate-500">
            <div className="flex items-center gap-1">
              <span>📍</span>
              <span>{event.location}</span>
            </div>
            <div className="flex items-center gap-1">
              <span>🕒</span>
              <span>{event.time}</span>
            </div>
            <div className="flex items-center gap-1">
              <span>👥</span>
              <span>{event.volunteers} volunteers</span>
            </div>
          </div>
        </div>
        {event.priority && (
          <span
            className={`rounded-full px-2 py-1 text-[10px] font-semibold ${
              event.priority === "HIGH"
                ? "bg-rose-100 text-rose-700"
                : "bg-amber-100 text-amber-700"
            }`}
          >
            {event.priority} PRIORITY
          </span>
        )}
      </div>

      <div className="mt-2 text-xs text-slate-600">
        <span className="font-medium text-slate-700">Skills Needed:</span>{" "}
        {event.skills.join(", ")}
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <Chip>{event.matchScore}% Perfect Match</Chip>

        <button
          onClick={handleJoinClick}
          disabled={disabled}
          className={`!rounded-full px-6 py-3 text-sm font-semibold text-white transition
            ${
              joinedLike
                ? "bg-green-500 hover:bg-green-600"
                : "bg-rose-500 hover:bg-rose-600"
            }`}
        >
          {buttonText}
        </button>
      </div>

      {error && (
        <p className="mt-2 text-xs text-red-700">
          {error}
        </p>
      )}
    </div>
  );
}