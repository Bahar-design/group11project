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

// GET /api/matches/:userId
// :userId is the USERS table id, NOT volunteer_id
// This route:
// 1. Finds the volunteerprofile row for this user_id
// 2. Loads their skills
// 3. Loads all events + required skills
// 4. Computes a matchScore for each event
// 5. Returns events sorted best → worst match
router.get("/:userId", async (req, res) => {
  const userId = req.params.userId;

  try {
    // 1. Find the volunteerprofile row for this user_id
    const { rows: vrows } = await pool.query(
      `
      SELECT 
        volunteer_id,
        city,
        availability
      FROM volunteerprofile
      WHERE user_id = $1
      `,
      [userId]
    );

    if (vrows.length === 0) {
      return res
        .status(404)
        .json({ error: "Volunteer profile not found for this user" });
    }

    const volunteer = vrows[0];
    const volunteerId = volunteer.volunteer_id; // <-- used for skills, etc.

    // 2. Normalize availability -> preferredDates[]
    // availability is stored as DATE in the DB (YYYY-MM-DD)
    let preferredDates = [];

    if (typeof volunteer.availability === "string") {
      // e.g. "2025-12-03" or "2025-12-03, 2025-12-04"
      preferredDates = volunteer.availability
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
    } else if (volunteer.availability instanceof Date) {
      preferredDates = [volunteer.availability.toISOString().slice(0, 10)];
    } else if (Array.isArray(volunteer.availability)) {
      preferredDates = volunteer.availability.map((d) =>
        d instanceof Date ? d.toISOString().slice(0, 10) : String(d)
      );
    }

    // 3. Get all volunteer skills using volunteer_id
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
      preferredDates, // array of YYYY-MM-DD strings
      skills: volunteerSkills,
    };

    // 4. Get all events with their date + location + skill names (via skill_id integer[])
    // eventdetails schema (relevant columns):
    // - event_id        int (PK)
    // - event_name      varchar(100)
    // - location        text
    // - urgency         smallint (1=Low,2=Medium,3=High,4=Critical)
    // - event_date      date
    // - volunteers      int
    // - skill_id        int[]  (skills needed for the event)
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

    // 5. Score each event
    const scoredEvents = eventRows.map((ev) => {
      const skillNames = Array.isArray(ev.skill_names) ? ev.skill_names : [];

      const event = {
        id: ev.event_id,
        title: ev.event_name,
        location: ev.location,
        date: ev.event_date, // Date from PG → serialized by Express
        skillsNeeded: skillNames,

        // extra fields your frontend may use
        volunteers: ev.volunteers || 0,
        skills: skillNames,
        priority: "LOW", // if you ever want to map urgency → label, you can here
        urgency: ev.urgency, // 1–4 (1=Low, 4=Critical)
      };

      const locScore = matchByLocation(user, event);
      const skillScore = matchBySkills(user, event);
      const dateScore = matchByDate(user, event);

      const matchScore = totalMatchPercentage(
        locScore,
        skillScore,
        dateScore
        // you *could* later pass urgency into this if you want urgency to affect scoring
      );

      return { ...event, matchScore };
    });

    // 6. Sort best → worst match
    scoredEvents.sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0));

    res.json(scoredEvents);
  } catch (err) {
    console.error("Match routes error:", err);
    res.status(500).json({ error: "Server error while computing matches" });
  }
});

module.exports = router;