// --- same imports above ---
require("dotenv").config();
const { Pool } = require("pg");

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

const {
  matchByLocation,
  matchBySkills,
  matchByDate,
  totalMatchPercentage,
  rankEventsByMatch,
} = require("../controllers/matchMakingController");

const TEST_USER_ID = 2;
const TEST_EVENT_ID = 11;

function mapVolunteerRowToUser(row) {
  const skillIds = Array.isArray(row.skill_ids) ? row.skill_ids : [];
  return {
    preferredLocations: row.city ? [row.city] : [],
    skills: skillIds.map((id) => String(id)),
    preferredDates: Array.isArray(row.availability)
      ? row.availability
      : row.availability
      ? [row.availability]
      : [],
  };
}

function mapEventRowToEvent(row) {
  return {
    id: row.event_id,
    title: row.event_name,
    location: row.location,
    date: row.event_date,
    skillsNeeded: Array.isArray(row.skill_id)
      ? row.skill_id.map((id) => String(id))
      : [],
  };
}

describe("MatchMakingController DB integration", () => {
  test("rankEventsByMatch sorts real events using real volunteer data", async () => {
    const { rows: vrows } = await pool.query(
      `
      SELECT
        vp.volunteer_id,
        vp.user_id,
        vp.city,
        vp.availability,
        COALESCE(array_agg(vs.skill_id) FILTER (WHERE vs.skill_id IS NOT NULL), '{}') AS skill_ids
      FROM volunteerprofile vp
      LEFT JOIN volunteer_skills vs ON vs.volunteer_id = vp.volunteer_id
      WHERE vp.user_id = $1
      GROUP BY vp.volunteer_id, vp.user_id, vp.city, vp.availability
      `,
      [TEST_USER_ID]
    );

    if (vrows.length === 0) {
      console.warn("⚠ TEST SKIPPED: No volunteer exists with user_id =", TEST_USER_ID);
      return;
    }

    const user = mapVolunteerRowToUser(vrows[0]);

    const { rows: erows } = await pool.query(
      `
        SELECT event_id, event_name, location, event_date, skill_id
        FROM eventdetails
        WHERE event_date IS NOT NULL
        ORDER BY event_date ASC
        LIMIT 10;
      `
    );

    if (erows.length === 0) {
      console.warn("⚠ TEST SKIPPED: No events exist with event_date");
      return;
    }

    const events = erows.map(mapEventRowToEvent);

    const ranked = rankEventsByMatch(user, events);

    expect(ranked.length).toBe(events.length);

    for (let i = 1; i < ranked.length; i++) {
      expect(ranked[i - 1].matchPercentage).toBeGreaterThanOrEqual(ranked[i].matchPercentage);
    }
  });

  test("individual match functions run correctly on real rows", async () => {
    const { rows: vrows } = await pool.query(
      `
      SELECT
        vp.volunteer_id,
        vp.user_id,
        vp.city,
        vp.availability,
        COALESCE(array_agg(vs.skill_id) FILTER (WHERE vs.skill_id IS NOT NULL), '{}') AS skill_ids
      FROM volunteerprofile vp
      LEFT JOIN volunteer_skills vs ON vs.volunteer_id = vp.volunteer_id
      WHERE vp.user_id = $1
      GROUP BY vp.volunteer_id, vp.user_id, vp.city, vp.availability
      `,
      [TEST_USER_ID]
    );

    if (vrows.length === 0) {
      console.warn("⚠ TEST SKIPPED: No volunteer exists with user_id =", TEST_USER_ID);
      return;
    }

    const user = mapVolunteerRowToUser(vrows[0]);

    const { rows: erows } = await pool.query(
      `
      SELECT event_id, event_name, location, event_date, skill_id
      FROM eventdetails
      WHERE event_id = $1
      `,
      [TEST_EVENT_ID]
    );

    if (erows.length === 0) {
      console.warn("⚠ TEST SKIPPED: Event not found, id =", TEST_EVENT_ID);
      return;
    }

    const event = mapEventRowToEvent(erows[0]);

    const overall = totalMatchPercentage(
      matchByLocation(user, event),
      matchBySkills(user, event),
      matchByDate(user, event)
    );

    expect(overall).toBeGreaterThanOrEqual(0);
    expect(overall).toBeLessThanOrEqual(100);
  });
});
