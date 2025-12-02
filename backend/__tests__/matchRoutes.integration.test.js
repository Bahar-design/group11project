// backend/__tests__/matchRoutes.integration.test.js
const request = require("supertest");
const app = require("../app");
const pool = require("../db");

jest.setTimeout(30000); // give DB enough time

describe("GET /api/matches/:userId (integration)", () => {
  let testUserId;
  let testVolunteerId;
  let cookingSkillId;
  let firstAidSkillId;

  beforeAll(async () => {
    // Clean up any leftovers from previous runs (in the right FK order)
    await pool.query(
      `
      DELETE FROM volunteer_skills
      WHERE volunteer_id IN (
        SELECT volunteer_id
        FROM volunteerprofile
        WHERE user_id = 9001
      )
      `
    );
    await pool.query(
      `DELETE FROM volunteerprofile WHERE user_id = 9001`
    );
    await pool.query(
      `DELETE FROM eventdetails WHERE event_name LIKE 'Test Match %'`
    );
    await pool.query(
      `DELETE FROM skills WHERE skill_name IN ('Cooking_TEST', 'First Aid_TEST')`
    );

    // 1) Insert test skills
    const skillResult = await pool.query(
      `
      INSERT INTO skills (skill_name)
      VALUES ('Cooking_TEST'), ('First Aid_TEST')
      RETURNING skill_id, skill_name
      `
    );

    cookingSkillId = skillResult.rows.find(
      (r) => r.skill_name === "Cooking_TEST"
    ).skill_id;
    firstAidSkillId = skillResult.rows.find(
      (r) => r.skill_name === "First Aid_TEST"
    ).skill_id;

    // 2) Insert a volunteerprofile row for a fake test user
    // volunteerprofile schema (relevant columns from your description):
    // - volunteer_id (pk)
    // - user_id (int)
    // - full_name, address1, city, statecode, zipcode, preference,
    //   availability (DATE), has_transportation, emergency_contact, phone
    testUserId = 9001; // unlikely to collide with real user ids

    const volunteerResult = await pool.query(
      `
      INSERT INTO volunteerprofile (
        user_id,
        full_name,
        address1,
        city,
        statecode,
        zipcode,
        preference,
        availability,
        has_transportation,
        emergency_contact,
        phone
      )
      VALUES (
        $1,
        'Test User',
        '123 Test St',
        'Houston',
        'TX',
        '77024',
        'Testing matches',
        '2025-12-05',
        TRUE,
        'Test Contact',
        '555-0000'
      )
      RETURNING volunteer_id
      `,
      [testUserId]
    );

    testVolunteerId = volunteerResult.rows[0].volunteer_id;

    // 3) Give this volunteer the Cooking_TEST skill
    await pool.query(
      `
      INSERT INTO volunteer_skills (volunteer_id, skill_id)
      VALUES ($1, $2)
      `,
      [testVolunteerId, cookingSkillId]
    );

    // 4) Insert two events into eventdetails:
    // eventdetails relevant columns:
    // - event_id (pk)
    // - event_name
    // - description
    // - location
    // - urgency (smallint: 1–4)
    // - event_date (DATE)
    // - created_by (we'll assume 1 is a valid/nullable value)
    // - volunteers (int)
    // - skill_id (int[] - list of required skills)
    await pool.query(
      `
      INSERT INTO eventdetails
        (event_name, description, location, urgency, event_date, created_by, volunteers, skill_id)
      VALUES
        (
          'Test Match Good',
          'Good match: same city, date, and skill',
          'Houston',
          3,                    -- high urgency
          '2025-12-05',
          1,
          0,
          ARRAY[$1]::int[]      -- requires Cooking_TEST
        ),
        (
          'Test Match Bad',
          'Bad match: different city, date, and skill',
          'Dallas',
          1,                    -- low urgency
          '2025-12-10',
          1,
          0,
          ARRAY[$2]::int[]      -- requires First Aid_TEST
        )
      `,
      [cookingSkillId, firstAidSkillId]
    );
  });

  afterAll(async () => {
    // Clean up test data (same order as beforeAll)
    await pool.query(
      `
      DELETE FROM volunteer_skills
      WHERE volunteer_id IN (
        SELECT volunteer_id
        FROM volunteerprofile
        WHERE user_id = 9001
      )
      `
    );
    await pool.query(
      `DELETE FROM volunteerprofile WHERE user_id = 9001`
    );
    await pool.query(
      `DELETE FROM eventdetails WHERE event_name LIKE 'Test Match %'`
    );
    await pool.query(
      `DELETE FROM skills WHERE skill_name IN ('Cooking_TEST', 'First Aid_TEST')`
    );

    await pool.end();
  });

  test("returns 404 when volunteer profile is not found", async () => {
    const res = await request(app).get("/api/matches/999999");

    expect(res.statusCode).toBe(404);
    expect(res.body).toHaveProperty("error");
    expect(res.body.error).toMatch(/volunteer profile not found/i);
  });

  test("returns 200 and sorted matches for a valid user", async () => {
    const res = await request(app).get(`/api/matches/${testUserId}`);

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThanOrEqual(2);

    const [first, second] = res.body;

    // Shape based on matchRoutes.js
    expect(first).toHaveProperty("id");
    expect(first).toHaveProperty("title");
    expect(first).toHaveProperty("location");
    expect(first).toHaveProperty("date");
    expect(first).toHaveProperty("urgency");     // 1–4
    expect(first).toHaveProperty("matchScore");  // combined percentage

    // Should be sorted by matchScore descending
    expect(first.matchScore).toBeGreaterThanOrEqual(second.matchScore);

    // And the "Good" event should rank above the "Bad" one
    const titles = res.body.map((e) => e.title);
    const indexGood = titles.indexOf("Test Match Good");
    const indexBad = titles.indexOf("Test Match Bad");

    expect(indexGood).toBeGreaterThanOrEqual(0);
    expect(indexBad).toBeGreaterThanOrEqual(0);
    expect(indexGood).toBeLessThan(indexBad);
  });
});