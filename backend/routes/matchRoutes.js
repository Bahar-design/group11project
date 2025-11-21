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
    // 1. Get volunteer profile, including city + preferred work date.
    //    ⚠️ Adjust column names if yours differ:
    //      - city            → user's chosen city (e.g. 'Katy')
    //      - preferred_date  → date selected in calendar
    const { rows: vrows } = await pool.query(
      `
      SELECT 
        volunteer_id,
        city,
        preferred_date
      FROM volunteerprofile
      WHERE volunteer_id = $1
      `,
      [volunteerId]
    );

    if (vrows.length === 0) {
      return res.status(404).json({ error: "Volunteer not found" });
    }

    const volunteer = vrows[0];

    // 2. Get volunteer skills (by name)
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

    // Build "user" object consumed by match functions
    const user = {
      // e.g. ["Katy"]
      preferredLocations: volunteer.city ? [volunteer.city] : [],
      // e.g. ["2026-12-12"]
      preferredDates: volunteer.preferred_date ? [volunteer.preferred_date] : [],
      // e.g. ["Cooking", "Childcare"]
      skills: volunteerSkills,
    };

    // 3. Get all events with their address + required skill
    //    ⚠️ Adjust column names as needed:
    //      - event_id
    //      - event_name
    //      - location        (full address string)
    //      - event_date
    //      - skills_needed   (FK → skills.skill_id)
    const { rows: eventRows } = await pool.query(`
      SELECT 
        e.event_id,
        e.event_name,
        e.location,
        e.event_date,
        e.time_slot,           -- kept for display ONLY (not used for scoring)
        e.volunteers,
        s.skill_name AS skill_name
      FROM eventdetails e
      LEFT JOIN skills s ON e.skills_needed = s.skill_id;
    `);

    // 4. Normalize events and compute match scores
    const scoredEvents = eventRows.map((ev) => {
      const event = {
        id: ev.event_id,
        title: ev.event_name,
        location: ev.location,                  // full address string
        date: ev.event_date,                    // used by matchByDate
        skillsNeeded: ev.skill_name ? [ev.skill_name] : [],

        // Extra fields for frontend display:
        time: ev.time_slot || "",
        volunteers: ev.volunteers || 0,
        skills: ev.skill_name ? [ev.skill_name] : [],
        priority: "LOW", // placeholder if you want to use this later
      };

      const locScore   = matchByLocation(user, event);  // 0 or 1 (city substring)
      const skillScore = matchBySkills(user, event);    // 0..1 (fraction)
      const dateScore  = matchByDate(user, event);      // 0 or 1

      const matchScore = totalMatchPercentage(
        locScore,
        skillScore,
        dateScore
      );

      return { ...event, matchScore };
    });

    // 5. Sort by matchScore descending (best matches first)
    scoredEvents.sort((a, b) => b.matchScore - a.matchScore);

    res.json(scoredEvents);
  } catch (err) {
    console.error("Match routes error:", err);
    res.status(500).json({ error: "Server error while computing matches" });
  }
});

module.exports = router;