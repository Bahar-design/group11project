const pool = require('../db');

function buildFilterClauses(filters, params, reportType = '') {
  // reportType can be 'volunteer-participation', 'event-management', or 'event-volunteers'
  const clauses = [];

  // volunteer name filter
  if (filters.volunteer && String(filters.volunteer).trim() !== '') {
    params.push(`%${String(filters.volunteer).toLowerCase()}%`);
    // For volunteer-participation: search volunteer full name or user email
    if (reportType === 'volunteer-participation') {
      clauses.push(`(LOWER(vp.full_name) LIKE $${params.length} OR LOWER(ut.user_email) LIKE $${params.length})`);
    } else if (reportType === 'event-management') {
      // For event-management, search within aggregated volunteers for the event
      clauses.push(
        `EXISTS (SELECT 1 FROM volunteer_history vh2 JOIN user_table ut2 ON vh2.volunteer_id = ut2.user_id LEFT JOIN volunteerprofile vp2 ON ut2.user_id = vp2.user_id WHERE vh2.event_id = ed.event_id AND LOWER(COALESCE(vp2.full_name, ut2.user_email)) LIKE $${params.length})`
      );
    } else if (reportType === 'event-volunteers') {
      clauses.push(`LOWER(COALESCE(vp.full_name, ut.user_email)) LIKE $${params.length}`);
    } else {
      clauses.push(`LOWER(vp.full_name) LIKE $${params.length}`);
    }
  }

  // event name filter
  if (filters.event && String(filters.event).trim() !== '') {
    params.push(`%${String(filters.event).toLowerCase()}%`);
    if (reportType === 'volunteer-participation') {
      // match volunteers who've worked on events with a matching name
      clauses.push(
        `EXISTS (SELECT 1 FROM volunteer_history vh2 JOIN eventdetails ed2 ON vh2.event_id = ed2.event_id WHERE vh2.volunteer_id = vp.volunteer_id AND LOWER(ed2.event_name) LIKE $${params.length})`
      );
    } else {
      clauses.push(`LOWER(ed.event_name) LIKE $${params.length}`);
    }
  }

  // date range handling
  // startDate/endDate are only applied to event_date for event-management
  // and to signup_date for event-volunteers. They must NOT apply to volunteer-participation.
  if (reportType === 'event-management') {
    if (filters.startDate) {
      params.push(filters.startDate);
      clauses.push(`ed.event_date >= $${params.length}`);
    }
    if (filters.endDate) {
      params.push(filters.endDate);
      clauses.push(`ed.event_date <= $${params.length}`);
    }
    if (filters.date && String(filters.date).trim() !== '') {
      params.push(filters.date);
      clauses.push(`ed.event_date = $${params.length}`);
    }
  }

  if (reportType === 'event-volunteers') {
    if (filters.startDate) {
      params.push(filters.startDate);
      clauses.push(`vh.signup_date >= $${params.length}`);
    }
    if (filters.endDate) {
      params.push(filters.endDate);
      clauses.push(`vh.signup_date <= $${params.length}`);
    }
    if (filters.date && String(filters.date).trim() !== '') {
      params.push(filters.date);
      clauses.push(`vh.signup_date = $${params.length}`);
    }
  }

  // location filter: for volunteer-participation search volunteer location, otherwise event location
  if (filters.location && String(filters.location).trim() !== '' && filters.location !== 'all') {
    params.push(`%${String(filters.location).toLowerCase()}%`);
    if (reportType === 'volunteer-participation') {
      clauses.push(`(LOWER(vp.city) LIKE $${params.length} OR LOWER(vp.state_code) LIKE $${params.length})`);
    } else {
      clauses.push(`LOWER(ed.location) LIKE $${params.length}`);
    }
  }

  // skillId filter: numeric id or 'all' - cover both volunteer_skills (s) and event_skills (es)
  if (filters.skillId && filters.skillId !== 'all') {
    const skillNum = Number(filters.skillId);
    if (!Number.isNaN(skillNum)) params.push(skillNum);
    else params.push(filters.skillId);
    clauses.push(`(s.skill_id = $${params.length} OR es.skill_id = $${params.length})`);
  }

  return clauses.length ? clauses.join(' AND ') : '';
}


/*
 function buildFilterClauses(filters, params, reportType) {
  const clauses = [];

  // --- SHARED: Date range filters ---
  if (filters.startDate) {
    params.push(filters.startDate);
    clauses.push('ed.event_date >= $' + params.length);
  }

  if (filters.endDate) {
    params.push(filters.endDate);
    clauses.push('ed.event_date <= $' + params.length);
  }

  if (filters.search && filters.search.trim() !== '') {
    const term = `%${filters.search.toLowerCase()}%`;
    params.push(term);

    if (reportType === 'volunteer-participation') {
      clauses.push(`(LOWER(vp.full_name) LIKE $${params.length} 
                     OR LOWER(vp.city) LIKE $${params.length})`);
    }

    else if (reportType === 'event-volunteers') {
      clauses.push(`(LOWER(ed.event_name) LIKE $${params.length}
                     OR LOWER(ed.location) LIKE $${params.length}
                     OR LOWER(vp.full_name) LIKE $${params.length}
                     OR CAST(ed.event_date AS TEXT) LIKE $${params.length})`);
    }

    else if (reportType === 'event-management') {
      clauses.push(`(LOWER(ed.event_name) LIKE $${params.length}
                     OR LOWER(ed.location) LIKE $${params.length}
                     OR CAST(ed.event_date AS TEXT) LIKE $${params.length})`);
    }
  }

  if (filters.location && filters.location !== 'all') {
    params.push(filters.location);
    clauses.push('ed.location = $' + params.length);
  }

  if (filters.skillId && filters.skillId !== 'all') {
    params.push(Number(filters.skillId));
    clauses.push('s.skill_id = $' + params.length);
  }

  return clauses.length ? clauses.join(' AND ') : '';
}

/*


/*
async function getVolunteerParticipation(filters = {}) {
  const params = [];
  const where = buildFilterClauses(filters, params, 'volunteer-participation');

  const sql = `
    SELECT 
      vp.volunteer_id AS volunteer_id,
      vp.full_name AS full_name,
      ut.user_email AS email,
      vp.city AS city,
      vp.state_code AS state_code,
      ARRAY_REMOVE(ARRAY_AGG(DISTINCT s.skill_name), NULL) AS skills,
      ARRAY_REMOVE(ARRAY_AGG(DISTINCT ed.event_name), NULL) AS events_worked,
      COUNT(vh.history_id) AS total_events
    FROM volunteerprofile AS vp
    JOIN user_table AS ut 
      ON vp.user_id = ut.user_id
    LEFT JOIN volunteer_history AS vh 
      ON ut.user_id = vh.volunteer_id
    LEFT JOIN eventdetails AS ed
      ON vh.event_id = ed.event_id
    LEFT JOIN volunteer_skills AS vs 
      ON vp.volunteer_id = vs.volunteer_id
    LEFT JOIN skills AS s 
      ON vs.skill_id = s.skill_id
    ${where ? 'WHERE ' + where : ''}
    GROUP BY 
      vp.volunteer_id, 
      vp.full_name, 
      ut.user_email, 
      vp.city, 
      vp.state_code
    ORDER BY vp.full_name ASC
  `;

  const { rows } = await pool.query(sql, params);

  return rows.map(r => ({
    ...r,
    total_events: Number(r.total_events || 0),
    skills: r.skills || [],
    events_worked: r.events_worked || []
  }));
}
*/


async function getVolunteerParticipation(filters = {}) {
  const params = [];
  const where = buildFilterClauses(filters, params);


  const sql = `
    SELECT 
      vp.volunteer_id AS volunteer_id,
      vp.full_name AS full_name,
      ut.user_email AS email,
      vp.city AS city,
      vp.state_code AS state_code,

      ARRAY_REMOVE(ARRAY_AGG(DISTINCT s.skill_name), NULL) AS skills,

      ARRAY_REMOVE(ARRAY_AGG(DISTINCT ed.event_name), NULL) AS events_worked,

      COUNT(DISTINCT vh.history_id) AS total_events

    FROM volunteerprofile AS vp
    JOIN user_table AS ut 
      ON vp.user_id = ut.user_id

    LEFT JOIN volunteer_history AS vh 
      ON ut.user_id = vh.volunteer_id

    LEFT JOIN eventdetails AS ed
      ON vh.event_id = ed.event_id

    LEFT JOIN volunteer_skills AS vs 
      ON vp.volunteer_id = vs.volunteer_id

    LEFT JOIN skills AS s 
      ON vs.skill_id = s.skill_id

    ${where ? 'WHERE ' + where : ''}

    GROUP BY 
      vp.volunteer_id, 
      vp.full_name, 
      ut.user_email, 
      vp.city, 
      vp.state_code

    ORDER BY vp.full_name ASC
  `;

  const { rows } = await pool.query(sql, params);

  return rows.map(r => ({
    ...r,
    total_events: Number(r.total_events || 0),
    skills: r.skills || [],
    events_worked: r.events_worked || []
  }));
}


async function getEventVolunteerAssignments(filters = {}) {
  const params = [];
  const where = buildFilterClauses(filters, params, 'event-volunteers');



  const sql = `
    SELECT
      ed.event_id,
      ed.event_name,
      ed.location AS event_location,
      ed.event_date,
      vh.history_id,
      ut.user_id AS user_id,
      vp.volunteer_id AS volunteer_profile_id,
      COALESCE(vp.full_name, ut.user_email) AS full_name,
      ut.user_email AS email,
      COALESCE(vp.city, '') AS volunteer_city,
      vh.signup_date,
      COALESCE(vskills.skills, ARRAY[]::text[]) AS skills
    FROM eventdetails ed
    LEFT JOIN volunteer_history vh ON ed.event_id = vh.event_id
    LEFT JOIN user_table ut ON vh.volunteer_id = ut.user_id
    LEFT JOIN volunteerprofile vp ON ut.user_id = vp.user_id
    LEFT JOIN LATERAL (
      SELECT ARRAY_REMOVE(ARRAY_AGG(DISTINCT s.skill_name), NULL) AS skills
      FROM volunteer_skills vss
      JOIN skills s ON vss.skill_id = s.skill_id
      WHERE vss.volunteer_id = vp.volunteer_id
    ) vskills ON true
    ${where 
      ? `WHERE ${where} AND vh.history_id IS NOT NULL`
      : `WHERE vh.history_id IS NOT NULL`
    }
    ORDER BY ed.event_date ASC, vp.full_name ASC;
  `;

  const { rows } = await pool.query(sql, params);

  return rows.map(r => ({
    event_id: r.event_id,
    event_name: r.event_name,
    event_location: r.event_location,
    event_date: r.event_date ? new Date(r.event_date).toISOString().slice(0,10) : null,
    volunteer_id: r.volunteer_profile_id || r.user_id,
    volunteer_profile_id: r.volunteer_profile_id || null,
    user_id: r.user_id,
    full_name: r.full_name,
    email: r.email,
    volunteer_city: r.volunteer_city,
    skills: r.skills || [],
    signup_date: r.signup_date ? new Date(r.signup_date).toISOString().slice(0,10) : null
  }));
}


async function getEventManagement(filters = {}) {
  const params = [];
  const where = buildFilterClauses(filters, params, 'event-management');


  const sql = `
    SELECT ed.event_id, ed.event_name, ed.description, ed.location, ed.event_date, ed.urgency,
      COUNT(DISTINCT vh.history_id) as total_volunteers,
      ARRAY_REMOVE(ARRAY_AGG(DISTINCT s.skill_name), NULL) as required_skills,
      ARRAY_REMOVE(ARRAY_AGG(DISTINCT COALESCE(vp.full_name, ut.user_email)), NULL) as volunteers
    FROM eventdetails ed
    LEFT JOIN volunteer_history vh ON ed.event_id = vh.event_id
    LEFT JOIN user_table ut ON vh.volunteer_id = ut.user_id
    LEFT JOIN volunteerprofile vp ON ut.user_id = vp.user_id
    LEFT JOIN event_skills es ON ed.event_id = es.event_id
    LEFT JOIN skills s ON es.skill_id = s.skill_id
    ${where ? 'WHERE ' + where : ''}
    GROUP BY ed.event_id, ed.event_name, ed.description, ed.location, ed.event_date, ed.urgency
    ORDER BY ed.event_date ASC
  `;

  const { rows } = await pool.query(sql, params);
  const URGENCY_MAP_REVERSE = { 1: 'Low', 2: 'Medium', 3: 'High', 4: 'Critical' };

  return rows.map(r => ({
    ...r,
    total_volunteers: Number(r.total_volunteers || 0),
    volunteers: r.volunteers || [],
    required_skills: r.required_skills || [],
    event_date: r.event_date ? (new Date(r.event_date)).toISOString().slice(0,10) : null,
    urgency: URGENCY_MAP_REVERSE[r.urgency] || r.urgency
  }));
}

async function getSkills(eventId = null) {
  if (eventId) {
    const sql = `
      SELECT s.skill_id, s.skill_name
      FROM event_skills es
      JOIN skills s ON es.skill_id = s.skill_id
      WHERE es.event_id = $1
      ORDER BY s.skill_name ASC
    `;
    const { rows } = await pool.query(sql, [eventId]);
    return rows;
  }

  const sql = `
    SELECT skill_id, skill_name
    FROM skills
    ORDER BY skill_name ASC
  `;
  const { rows } = await pool.query(sql);
  return rows;
}

async function getLocations() {
  // Return distinct event locations from eventdetails table for frontend suggestions
  const sql = `
    SELECT DISTINCT location
    FROM eventdetails
    WHERE location IS NOT NULL
    ORDER BY location ASC
  `;
  const { rows } = await pool.query(sql);
  // normalize to array of strings
  return rows.map(r => r.location);
}

module.exports = {
  getVolunteerParticipation,
  getEventVolunteerAssignments,
  getEventManagement,
  getSkills,
  getLocations
};
