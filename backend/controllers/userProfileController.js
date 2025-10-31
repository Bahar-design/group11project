const { validateUserProfile } = require('../validators/userProfileValidator');
const pool = require('../db');

/**
 * GET /user-profile?type=volunteer|admin&email=...
 * If email provided, attempt to look up by user email -> user_table -> profile
 * Otherwise, returns a generic profile based on type.
 */
async function getUserProfile(req, res, next) {
  const type = req.query.type === 'admin' ? 'admin' : 'volunteer';
  // Accept email from query param, or fallback to the request body (frontend may POST the email in the form)
  let email = req.query.email;
  if (!email && req.body && typeof req.body.email === 'string') {
    email = req.body.email.trim();
    console.log('updateUserProfile: using email from request body:', email);
  }

  if (!email) {
    return res.status(400).json({ message: 'Email query parameter is required' });
  }

  try {
    // Find the user_id by email
    const userResult = await pool.query(
      'SELECT user_id, user_type FROM user_table WHERE user_email = $1',
      [email]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    const user = userResult.rows[0];

    if (user.user_type === 'volunteer' && type === 'volunteer') {
      // Join VolunteerProfile and skills
      const vp = await pool.query(
        `SELECT vp.volunteer_id, vt.user_email, vp.full_name, vp.phone, vp.address1, vp.address2, vp.city, vp.state_code, vp.zip_code, vp.preferences, vp.availability, vp.travel_radius, vp.has_transportation, vp.emergency_contact, vp.primary_location
         FROM volunteerprofile vp
         JOIN user_table ut ON ut.user_id = vp.user_id
         JOIN user_table vt ON vt.user_id = ut.user_id
         WHERE vp.user_id = $1`,
        [user.user_id]
      );

          if (vp.rows.length === 0) {
              // User exists but hasn't created a volunteer profile yet.
              // Return a minimal, empty profile so frontend can render the profile page and allow creation.
              const out = {
                name: '',
                email: email,
                phone: '',
                address1: '',
                address2: '',
                city: '',
                state: '',
                zipCode: '',
                emergencyContact: '',
                skills: [],
                preferences: '',
                availability: [],
                travelRadius: '',
                hasTransportation: false,
                primaryLocation: '',
                userType: 'volunteer',
                stats: {
                  familiesHelped: 0,
                  hoursVolunteered: 0,
                  averageRating: 0,
                  eventsJoined: 0
                }
              };
              return res.json(out);
      }

      const profile = vp.rows[0];

      // fetch skills
        const skillsRes = await pool.query(
          `SELECT s.skill_name FROM skills s JOIN volunteer_skills vs ON vs.skill_id = s.skill_id WHERE vs.volunteer_id = $1`,
          [profile.volunteer_id]
        );

        let skills = [];
        if (skillsRes && Array.isArray(skillsRes.rows) && skillsRes.rows.length > 0) {
          skills = skillsRes.rows.map(r => r.skill_name);
        } else if (Array.isArray(value.skills) && value.skills.length > 0) {
          skills = value.skills;
        }

      const out = {
        name: profile.full_name,
        email: email,
        phone: profile.phone || '',
        address1: profile.address1,
        address2: profile.address2 || '',
        city: profile.city,
        state: profile.state_code,
        zipCode: profile.zip_code,
        emergencyContact: profile.emergency_contact || '',
        skills,
        preferences: profile.preferences || '',
        availability: profile.availability || [],
        travelRadius: profile.travel_radius || '',
        hasTransportation: !!profile.has_transportation,
        primaryLocation: profile.primary_location || '',
        userType: 'volunteer',
        stats: {
          familiesHelped: 0,
          hoursVolunteered: 0,
          averageRating: 0,
          eventsJoined: 0
        }
      };

      return res.json(out);
    }

    if (user.user_type === 'admin' && type === 'admin') {
      const ap = await pool.query(
        `SELECT ap.admin_id, ut.user_email, ap.full_name, ap.phone, ap.address1, ap.address2, ap.city, ap.state_code, ap.zip_code, ap.admin_level, ap.department, ap.start_date, ap.emergency_contact
         FROM adminprofile ap
         JOIN user_table ut ON ut.user_id = ap.user_id
         WHERE ap.user_id = $1`,
        [user.user_id]
      );

          if (ap.rows.length === 0) {
    // No admin profile yet -- return an empty admin profile so frontend can render the creation UI.
    const out = {
      name: '',
      email: email,
      phone: '',
      address1: '',
      address2: '',
      city: '',
      state: '',
      zipCode: '',
      adminLevel: '',
      department: '',
      startDate: '',
      emergencyContact: '',
      regions: [],
      userType: 'admin',
      stats: {
        eventsManaged: 0,
        volunteersCoordinated: 0,
        familiesImpacted: 0,
        successRate: 0
      }
    };
    return res.json(out);
        }

      const profile = ap.rows[0];
      const out = {
        name: profile.full_name,
        email: email,
        phone: profile.phone || '',
        address1: profile.address1,
        address2: profile.address2 || '',
        city: profile.city,
        state: profile.state_code,
        zipCode: profile.zip_code,
        adminLevel: profile.admin_level || '',
        department: profile.department || '',
        startDate: profile.start_date ? profile.start_date.toISOString().substring(0,10) : '',
        emergencyContact: profile.emergency_contact || '',
        regions: [],
        userType: 'admin',
        stats: {
          eventsManaged: 0,
          volunteersCoordinated: 0,
          familiesImpacted: 0,
          successRate: 0
        }
      };

      return res.json(out);
    }

    // If types mismatch, return 400
    return res.status(400).json({ message: 'Requested profile type does not match user type' });
  } catch (err) {
    console.error('DB error fetching profile:', err.message || err, 'code=', err.code || 'n/a');
        return res.status(500).json({ message: 'Server error fetching profile' });
  }
}


/**
 * POST /user-profile?type=volunteer|admin&email=...
 * Validates input, then upserts the profile and skill links inside a transaction.
 */
async function updateUserProfile(req, res, next) {
  const type = req.query.type === 'admin' ? 'admin' : 'volunteer';
  // Accept email from query param, or fallback to the request body (frontend may post the email in the form)
  let email = req.query.email;
  if (!email && req.body && typeof req.body.email === 'string') {
    email = req.body.email.trim();
    console.log('updateUserProfile: using email from request body:', email);
  }

  // Pass user type to validator
  const { error, value } = validateUserProfile(req.body, type);
  if (error) {
    error.status = 400;
    return next(error);
  }

  // Require email so DB is always used as the source of truth.
  if (!email) {
    const e = new Error('Email query parameter is required to update profile');
    e.status = 400;
    return next(e);
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Require that the associated user account already exists in user_table.
    // Do NOT auto-create users here — user registration/login should create the user row.
    const userRes = await client.query('SELECT user_id FROM user_table WHERE user_email = $1', [email]);
    if (userRes.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ message: 'User not found' });
    }
    const userId = userRes.rows[0].user_id;
    // ensure user_type is correct
    await client.query('UPDATE user_table SET user_type = $1 WHERE user_id = $2', [type, userId]);

    if (type === 'volunteer') {
      // Upsert VolunteerProfile (by user_id)
    const upsertVP = `
  INSERT INTO volunteerprofile (user_id, full_name, phone, address1, address2, city, state_code, zip_code, preferences, availability, travel_radius, has_transportation, emergency_contact, primary_location)
  VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14)
        ON CONFLICT (user_id) DO UPDATE SET
          full_name = EXCLUDED.full_name,
          phone = EXCLUDED.phone,
          address1 = EXCLUDED.address1,
          address2 = EXCLUDED.address2,
          city = EXCLUDED.city,
          state_code = EXCLUDED.state_code,
          zip_code = EXCLUDED.zip_code,
          preferences = EXCLUDED.preferences,
          availability = EXCLUDED.availability,
          travel_radius = EXCLUDED.travel_radius,
          has_transportation = EXCLUDED.has_transportation,
          emergency_contact = EXCLUDED.emergency_contact,
          primary_location = EXCLUDED.primary_location
        RETURNING volunteer_id;
      `;

      // Normalize availability to array of YYYY-MM-DD strings for Postgres date[]
      // Normalize availability to array of YYYY-MM-DD strings for Postgres date[]
      const availabilityParam = Array.isArray(value.availability)
        ? value.availability.map(d => {
            if (!d) return null;
            // Millisecond timestamp (number)
            if (typeof d === 'number' && !Number.isNaN(d)) {
              const dt = new Date(Number(d));
              if (!Number.isNaN(dt.getTime())) return dt.toISOString().substring(0,10);
              return null;
            }
            // Numeric string timestamp
            if (typeof d === 'string' && /^\d{10,13}$/.test(d)) {
              const dt = new Date(Number(d));
              if (!Number.isNaN(dt.getTime())) return dt.toISOString().substring(0,10);
            }
            if (typeof d === 'string') {
              // ISO string or YYYY-MM-DD
              return d.split('T')[0];
            }
            if (d instanceof Date) {
              return d.toISOString().substring(0,10);
            }
            // react-multi-date-picker DateObject support (year/month/day)
            if (typeof d === 'object' && d.year && d.month && d.day) {
              const month = String(d.month.number || d.month).padStart(2, '0');
              const day = String(d.day).padStart(2, '0');
              return `${d.year}-${month}-${day}`;
            }
            // DateObject with format method
            if (d && typeof d.format === 'function') {
              try {
                return d.format('YYYY-MM-DD');
              } catch (formatErr) {
                // fall through
              }
            }
            // fallback to string
            return String(d).split('T')[0];
          }).filter(Boolean)
        : [];

      const vpRes = await client.query(upsertVP, [
        userId,
        value.name,
        value.phone || null,
        value.address1,
        value.address2 || null,
        value.city,
        value.state,
        value.zipCode,
        value.preferences || null,
        availabilityParam,
        value.travelRadius || null,
        value.hasTransportation,
        value.emergencyContact || null,
        value.primaryLocation || null
      ]);

      const volunteerId = vpRes.rows[0].volunteer_id;

      // Replace skills: delete existing and insert new links (skills table already seeded)
      await client.query('DELETE FROM volunteer_skills WHERE volunteer_id = $1', [volunteerId]);
      if (Array.isArray(value.skills) && value.skills.length > 0) {
        // map skill names to ids
        // Fetch all skills once and match case-insensitively
        const skillRows = await client.query(`SELECT skill_id, skill_name FROM skills`);
        const nameToId = new Map(skillRows.rows.map(r => [r.skill_name.toLowerCase(), r.skill_id]));

        for (const s of value.skills) {
          const sid = nameToId.get(String(s).toLowerCase());
          if (sid) {
            try {
              await client.query('INSERT INTO volunteer_skills (volunteer_id, skill_id) VALUES ($1,$2) ON CONFLICT DO NOTHING', [volunteerId, sid]);
            } catch (skillErr) {
              // Log and continue; don't fail the whole profile save because of one skill link
              console.error('Failed to link skill', s, 'to volunteer', volunteerId, skillErr);
            }
          } else {
            console.warn('Unknown skill name, skipping:', s);
          }
        }
      }

      await client.query('COMMIT');

      // return the newly stored profile
        const skillsRes = await pool.query(
          `SELECT s.skill_name FROM skills s JOIN volunteer_skills vs ON vs.skill_id = s.skill_id WHERE vs.volunteer_id = $1`,
          [volunteerId]
        );
        let skills = [];
        if (skillsRes && Array.isArray(skillsRes.rows) && skillsRes.rows.length > 0) {
          skills = skillsRes.rows.map(r => r.skill_name);
        } else if (Array.isArray(value.skills) && value.skills.length > 0) {
          skills = value.skills;
        }

      const out = {
        name: value.name,
        email,
        address1: value.address1,
        address2: value.address2 || '',
        city: value.city,
        state: value.state,
        zipCode: value.zipCode,
        emergencyContact: value.emergencyContact || '',
        skills,
        preferences: value.preferences || '',
        availability: availabilityParam || [],
        travelRadius: value.travelRadius || '',
        hasTransportation: !!value.hasTransportation,
        userType: 'volunteer',
        stats: {
          familiesHelped: 0,
          hoursVolunteered: 0,
          averageRating: 0,
          eventsJoined: 0
        }
      };

      return res.json(out);
    }

    // admin
    if (type === 'admin') {
    // Ensure admin_id exists (should have been created during registration)
    const existingAdminRes = await client.query('SELECT admin_id, start_date FROM adminprofile WHERE user_id = $1', [userId]);
    const existingAdmin = existingAdminRes.rows[0];
    if (!existingAdmin || !existingAdmin.admin_id) {
      await client.query('ROLLBACK');
      return res.status(400).json({ message: 'Admin account not initialized. Please register as admin first (admin_id missing).' });
    }

    // Use existing admin_id and preserve start_date if present
    const adminIdParam = existingAdmin.admin_id;
    const existingStartDate = existingAdmin.start_date || null;

    const upsertAP = `
  INSERT INTO adminprofile (admin_id, user_id, full_name, phone, address1, address2, city, state_code, zip_code, admin_level, start_date, emergency_contact)
  VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
        ON CONFLICT (user_id) DO UPDATE SET
          full_name = EXCLUDED.full_name,
          phone = EXCLUDED.phone,
          address1 = EXCLUDED.address1,
          address2 = EXCLUDED.address2,
          city = EXCLUDED.city,
          state_code = EXCLUDED.state_code,
          zip_code = EXCLUDED.zip_code,
          admin_level = EXCLUDED.admin_level,
          start_date = EXCLUDED.start_date,
          emergency_contact = EXCLUDED.emergency_contact
        RETURNING admin_id;
      `;

      const apRes = await client.query(upsertAP, [
        adminIdParam,
        userId,
        value.name,
        value.phone || null,
        value.address1,
        value.address2 || null,
        value.city,
        value.state,
        value.zipCode,
        value.adminLevel || null,
        value.startDate || existingStartDate || null,
        value.emergencyContact || null
      ]);

      const adminId = apRes.rows[0].admin_id;
      await client.query('COMMIT');

      const out = {
        name: value.name,
        email,
        address1: value.address1,
        address2: value.address2 || '',
        city: value.city,
        state: value.state,
        zipCode: value.zipCode,
        adminLevel: value.adminLevel || '',
        department: value.department || '',
        startDate: value.startDate || '',
        emergencyContact: value.emergencyContact || '',
        regions: value.regions || [],
        userType: 'admin',
        stats: {
          eventsManaged: 0,
          volunteersCoordinated: 0,
          familiesImpacted: 0,
          successRate: 0
        }
      };

      return res.json(out);
    }

    await client.query('ROLLBACK');
    return res.status(400).json({ message: 'Unknown profile type' });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('DB error updating profile:', err.message || err, 'code=', err.code || 'n/a');
    // Surface the DB error message to the client for debugging (safe for dev; consider hiding in prod)
    return res.status(500).json({ message: 'Server error updating profile', error: err.message });
  } finally {
    client.release();
  }
}

module.exports = { getUserProfile, updateUserProfile };