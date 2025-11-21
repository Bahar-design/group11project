// backend/routes/matchRoutes.js
const express = require("express");
const router = express.Router();
const pool = require("../db");

const {
  matchByLocation,
  matchBySkills,
  matchByDate,
  totalMatchPercentage,
} = require("../controllers/matchMakingController");

// GET /api/matches/:volunteerId
router.get("/:volunteerId", async (req, res) => {
  const volunteerId = req.params.volunteerId;

  try {
    // 1. Get volunteer profile (city + availability)
    const { rows: vrows } = await pool.query(
      `
      SELECT 
        volunteer_id,
        city,
        availability
      FROM volunteerprofile
      WHERE volunteer_id = $1
      `,
      [volunteerId]
    );

    if (vrows.length === 0) {
      return res.status(404).json({ error: "Volunteer not found" });
    }

    const volunteer = vrows[0];

    // 🔥 Normalize availability -> preferredDates[]
    let preferredDates = [];

    if (typeof volunteer.availability === "string") {
      // "12/12/2026, 12/14/2026"
      preferredDates = volunteer.availability
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
    } else if (volunteer.availability instanceof Date) {
      // single DATE column
      preferredDates = [volunteer.availability.toISOString().slice(0, 10)];
    } else if (Array.isArray(volunteer.availability)) {
      // if it's a Postgres array of dates
      preferredDates = volunteer.availability.map((d) =>
        d instanceof Date ? d.toISOString().slice(0, 10) : String(d)
      );
    } else {
      preferredDates = [];
    }

    // 2. Get all volunteer skills
    const { rows: skillRows } = await pool.query(
      `
      SELECT s.skill_name
      FROM volunteer_skills vs
      JOIN skills s ON s.skill_id = vs.skill_id
      WHERE vs.volunteer_id = $1
      `,
      [volunteerId]
    );

    const volunteerSkills = skillRows.map((r) => r.skill_name);

    // Build user object for match functions
    const user = {
      preferredLocations: volunteer.city ? [volunteer.city] : [],
      preferredDates, // normalized array
      skills: volunteerSkills,
    };

    // 3. Get all events with their date + location + skill names (via skill_id integer[])
      const { rows: eventRows } = await pool.query(`
        SELECT 
          e.event_id,
          e.event_name,
          e.location,
          e.event_date,
          e.urgency,
          e.volunteers,
          COALESCE(
            array_agg(s.skill_name) FILTER (WHERE s.skill_name IS NOT NULL),
            '{}'::text[]
          ) AS skill_names
        FROM eventdetails e
        -- unnest the integer[] skill_id into individual ids
        LEFT JOIN LATERAL unnest(e.skill_id) AS sid(skill_id) ON true
        LEFT JOIN skills s ON s.skill_id = sid.skill_id
        GROUP BY
          e.event_id,
          e.event_name,
          e.location,
          e.event_date,
          e.urgency,
          e.volunteers;
      `);

    // 4. Score each event
    const scoredEvents = eventRows.map((ev) => {
      const skillNames = Array.isArray(ev.skill_names) ? ev.skill_names : [];
    
      const event = {
        id: ev.event_id,
        title: ev.event_name,
        location: ev.location,
        date: ev.event_date,
        skillsNeeded: skillNames,        // used by matchBySkills
    
        // display fields:
        volunteers: ev.volunteers || 0,
        skills: skillNames,              // for frontend display
        priority: "LOW",                 // you can map from urgency later if you want
        urgency: ev.urgency,
      };
    
      const locScore = matchByLocation(user, event);
      const skillScore = matchBySkills(user, event);
      const dateScore = matchByDate(user, event);
    
      const matchScore = totalMatchPercentage(
        locScore,
        skillScore,
        dateScore
      );
    
      return { ...event, matchScore };
    });

    // 5. Sort best → worst match
    scoredEvents.sort((a, b) => b.matchScore - a.matchScore);

    res.json(scoredEvents);
  } catch (err) {
    console.error("Match routes error:", err);
    res.status(500).json({ error: "Server error while computing matches" });
  }
});

module.exports = router;