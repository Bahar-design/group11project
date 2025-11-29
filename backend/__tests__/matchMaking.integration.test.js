// __tests__/matchMaking.integration.test.js

require("dotenv").config();
console.log("JEST DATABASE_URL =", process.env.DATABASE_URL);

// Use pg.Pool directly so we know we're hitting the same DB as psql
const { Pool } = require("pg");

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }, // required by Render
});

const {
  matchByLocation,
  matchBySkills,
  matchByDate,
  totalMatchPercentage,
  rankEventsByMatch,
} = require("../controllers/matchMakingController");

// Use user_id instead of volunteer_id (this matches how your app will behave)
const TEST_USER_ID = 2;   // Sarah's user_id
const TEST_EVENT_ID = 11; // HTown Potluck !

// Map a DB volunteer row -> user object for matchmaking functions
function mapVolunteerRowToUser(row) {
  const skillIds = Array.isArray(row.skill_ids) ? row.skill_ids : [];
  const availability = row.availability;

  let preferredDates = [];
  if (Array.isArray(availability)) {
    preferredDates = availability;
  } else if (availability) {
    preferredDates = [availability];
  }

  return {
    preferredLocations: row.city ? [row.city] : [],
    skills: skillIds.map((id) => String(id)),
    preferredDates,
  };
}

// Map an eventdetails row -> event object for matchmaking functions
function mapEventRowToEvent(row) {
  const evSkillIds = Array.isArray(row.skill_id) ? row.skill_id : [];

  return {
    id: row.event_id,
    title: row.event_name,
    location: row.location,
    date: row.event_date,
    skillsNeeded: evSkillIds.map((id) => String(id)),
  };
}

describe("MatchMakingController DB integration", () => {
  test("rankEventsByMatch sorts real events using real volunteer data", async () => {
    // Debug: see what volunteers Jest can see in this DB
    const debugResult = await pool.query(
      "SELECT volunteer_id, user_id, city FROM volunteerprofile ORDER BY volunteer_id LIMIT 10;"
    );
    console.log("DEBUG volunteers seen by Jest:", debugResult.rows);

    // 1) Get the volunteer row by user_id
    const { rows: vrows } = await pool.query(
      `
        SELECT
          vp.volunteer_id,
          vp.user_id,
          vp.city,
          vp.availability,
          COALESCE(
            array_agg(vs.skill_id) FILTER (WHERE vs.skill_id IS NOT NULL),
            '{}'
          ) AS skill_ids
        FROM volunteerprofile vp
        LEFT JOIN volunteer_skills vs
          ON vs.volunteer_id = vp.volunteer_id
        WHERE vp.user_id = $1
        GROUP BY vp.volunteer_id, vp.user_id, vp.city, vp.availability
      `,
      [TEST_USER_ID]
    );

    console.log("DEBUG volunteer rows for user_id=2:", vrows);

    expect(vrows.length).toBe(1);
    const user = mapVolunteerRowToUser(vrows[0]);

    // 2) Get up to 10 events with dates
    const { rows: erows } = await pool.query(
      `
        SELECT
          event_id,
          event_name,
          location,
          event_date,
          skill_id
        FROM eventdetails
        WHERE event_date IS NOT NULL
        ORDER BY event_date ASC
        LIMIT 10;
      `
    );

    expect(erows.length).toBeGreaterThan(0);
    const events = erows.map(mapEventRowToEvent);

    // 3) Run ranking
    const ranked = rankEventsByMatch(user, events);

    expect(ranked.length).toBe(events.length);
    ranked.forEach((ev) => {
      expect(ev).toHaveProperty("matchPercentage");
      expect(typeof ev.matchPercentage).toBe("number");
      expect(ev.matchPercentage).toBeGreaterThanOrEqual(0);
      expect(ev.matchPercentage).toBeLessThanOrEqual(100);
    });

    for (let i = 1; i < ranked.length; i++) {
      expect(ranked[i - 1].matchPercentage).toBeGreaterThanOrEqual(
        ranked[i].matchPercentage
      );
    }
  });

  test("individual match functions run correctly on real rows", async () => {
    // 1) Same volunteer by user_id
    const { rows: vrows } = await pool.query(
      `
        SELECT
          vp.volunteer_id,
          vp.user_id,
          vp.city,
          vp.availability,
          COALESCE(
            array_agg(vs.skill_id) FILTER (WHERE vs.skill_id IS NOT NULL),
            '{}'
          ) AS skill_ids
        FROM volunteerprofile vp
        LEFT JOIN volunteer_skills vs
          ON vs.volunteer_id = vp.volunteer_id
        WHERE vp.user_id = $1
        GROUP BY vp.volunteer_id, vp.user_id, vp.city, vp.availability
      `,
      [TEST_USER_ID]
    );

    expect(vrows.length).toBe(1);
    const user = mapVolunteerRowToUser(vrows[0]);

    // 2) Specific event id
    const { rows: erows } = await pool.query(
      `
        SELECT
          event_id,
          event_name,
          location,
          event_date,
          skill_id
        FROM eventdetails
        WHERE event_id = $1
      `,
      [TEST_EVENT_ID]
    );

    expect(erows.length).toBe(1);
    const event = mapEventRowToEvent(erows[0]);

    // 3) Run each match function
    const locScore = matchByLocation(user, event);
    const skillScore = matchBySkills(user, event);
    const dateScore = matchByDate(user, event);

    const overall = totalMatchPercentage(locScore, skillScore, dateScore);

    expect(overall).toBeGreaterThanOrEqual(0);
    expect(overall).toBeLessThanOrEqual(100);
  });
});