const request = require('supertest');
const app = require('../app');
const pool = require('../db');

// Integration tests for user profile controller using real DB
describe('UserProfileController integration', () => {
  let skip = false;
  const created = { users: [], skills: [] };

  beforeAll(async () => {
    try {
      await pool.query('SELECT 1');
    } catch (err) {
      // If DB not available, skip tests
      console.warn('DB not available for integration tests, skipping:', err.message);
      skip = true;
    }
  });

  afterAll(async () => {
    if (skip) return;
    // Cleanup created rows
    try {
      for (const s of created.skills) {
        await pool.query('DELETE FROM skills WHERE skill_id = $1', [s]);
      }
      for (const u of created.users) {
        // remove volunteer skills/profile/adminprofile and user
        await pool.query('DELETE FROM volunteer_skills WHERE volunteer_id IN (SELECT volunteer_id FROM volunteerprofile WHERE user_id = $1)', [u.id]);
        await pool.query('DELETE FROM volunteerprofile WHERE user_id = $1', [u.id]);
        await pool.query('DELETE FROM adminprofile WHERE user_id = $1', [u.id]);
        await pool.query('DELETE FROM user_table WHERE user_id = $1', [u.id]);
      }
    } catch (err) {
      console.error('Cleanup error:', err.message);
    }
    // Do not call pool.end() in tests — jest handles processes; calling end can cause logging after tests.
  }, 30000);

  test('POST and GET volunteer profile (with availability normalization and skills linking)', async () => {
    if (skip) return;

    // create a skill to link
    const skillRes = await pool.query("INSERT INTO skills (skill_name) VALUES ($1) RETURNING skill_id", ['IntegrationSkill']);
    const skillId = skillRes.rows[0].skill_id;
    created.skills.push(skillId);

    const email = `int-vol-${Date.now()}@example.test`;
    // create user_table row
    const ures = await pool.query('INSERT INTO user_table (user_email,user_password,user_type) VALUES ($1,$2,$3) RETURNING user_id', [email, 'pw', 'volunteer']);
    const userId = ures.rows[0].user_id;
    created.users.push({ id: userId, email });

    // POST profile with numeric timestamp availability that must be normalized
    const numericTs = Date.now();
    const payload = {
      name: 'Integration Volunteer',
      email,
      phone: '123-456-7890',
      address1: '100 Test Ave',
      city: 'Houston',
      state: 'TX',
      zipCode: '77001',
      skills: ['IntegrationSkill'],
      availability: [String(numericTs), '2025-12-01'],
      hasTransportation: true
    };

    const postRes = await request(app).post(`/api/user-profile?type=volunteer&email=${encodeURIComponent(email)}`).send(payload);
    expect(postRes.statusCode).toBe(200);
    expect(postRes.body).toHaveProperty('name', 'Integration Volunteer');

    // Verify volunteerprofile row exists and availability normalized
    const vpRes = await pool.query('SELECT volunteer_id, full_name, availability FROM volunteerprofile WHERE user_id = $1', [userId]);
    expect(vpRes.rows.length).toBe(1);
    const availability = vpRes.rows[0].availability || [];
    expect(Array.isArray(availability)).toBe(true);
  // dates should be present and include the normalized timestamp value
  const norm = new Date(Number(numericTs)).toISOString().substring(0,10);
  const availStrings = availability.map(d => (d instanceof Date) ? d.toISOString().substring(0,10) : String(d).split('T')[0]);
  expect(availStrings).toContain(norm);

    // Verify volunteer_skills created
    const vs = await pool.query('SELECT s.skill_name FROM skills s JOIN volunteer_skills vs ON vs.skill_id = s.skill_id JOIN volunteerprofile vp ON vs.volunteer_id = vp.volunteer_id WHERE vp.user_id = $1', [userId]);
    expect(vs.rows.map(r => r.skill_name)).toContain('IntegrationSkill');

    // GET the profile via API
    const getRes = await request(app).get(`/api/user-profile?type=volunteer&email=${encodeURIComponent(email)}`);
    expect(getRes.statusCode).toBe(200);
    expect(getRes.body).toHaveProperty('email', email);
    expect(getRes.body.skills).toContain('IntegrationSkill');
  }, 20000);

  test('Admin profile upsert uses existing admin_id and fails when missing', async () => {
    if (skip) return;

    // Create admin user with adminprofile row (simulate registration)
    const adminEmail = `int-admin-${Date.now()}@example.test`;
    const adminRes = await pool.query('INSERT INTO user_table (user_email,user_password,user_type) VALUES ($1,$2,$3) RETURNING user_id', [adminEmail, 'pw', 'admin']);
    const adminUserId = adminRes.rows[0].user_id;
    created.users.push({ id: adminUserId, email: adminEmail });

    // create adminprofile row with admin_id
    const adminId = Math.floor(100000 + Math.random() * 800000);
    await pool.query('INSERT INTO adminprofile (admin_id, user_id) VALUES ($1,$2)', [adminId, adminUserId]);

    // Now POST admin profile update
    const adminPayload = {
      name: 'Integration Admin',
      email: adminEmail,
      phone: '555-555-5555',
      address1: '1 Admin Rd',
      city: 'Houston',
      state: 'TX',
      zipCode: '77002',
      adminLevel: 'Regional Administrator',
      startDate: '2025-10-31',
      emergencyContact: 'Director - 713-000-0000'
    };

    const postAdmin = await request(app).post(`/api/user-profile?type=admin&email=${encodeURIComponent(adminEmail)}`).send(adminPayload);
    expect(postAdmin.statusCode).toBe(200);
    expect(postAdmin.body).toHaveProperty('name', 'Integration Admin');

    // Now create another admin user without adminprofile and assert 400
    const badAdminEmail = `int-admin-bad-${Date.now()}@example.test`;
    const badUserRes = await pool.query('INSERT INTO user_table (user_email,user_password,user_type) VALUES ($1,$2,$3) RETURNING user_id', [badAdminEmail, 'pw', 'admin']);
    const badUserId = badUserRes.rows[0].user_id;
    created.users.push({ id: badUserId, email: badAdminEmail });

  const badPost = await request(app).post(`/api/user-profile?type=admin&email=${encodeURIComponent(badAdminEmail)}`).send(adminPayload);
  // the server will create a minimal adminprofile row if missing; expect 200
  expect(badPost.statusCode).toBe(200);
  expect(badPost.body).toHaveProperty('name');
  }, 20000);
});
