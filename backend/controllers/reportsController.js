const pool = require('../db');

function buildFilterClauses(filters, params) {
  const clauses = [];
  if (filters.search) {
    params.push(`%${filters.search.toLowerCase()}%`);
    clauses.push('LOWER(vp.full_name) LIKE $' + params.length);
  }
  if (filters.location && filters.location !== 'all') {
    params.push(filters.location);
    clauses.push('vp.city = $' + params.length);
  }
  if (filters.skill && filters.skill !== 'all') {
    params.push(filters.skill);
    clauses.push('s.skill_name = $' + params.length);
  }
  if (filters.startDate) {
    params.push(filters.startDate);
    clauses.push('ed.event_date >= $' + params.length);
  }
  if (filters.endDate) {
    params.push(filters.endDate);
    clauses.push('ed.event_date <= $' + params.length);
  }
  return clauses.length ? clauses.join(' AND ') : '';
}

async function getVolunteerParticipation(filters = {}) {
  const params = [];
  const where = buildFilterClauses(filters, params);

  const sql = `
    SELECT vp.volunteer_id, vp.full_name, vp.email, vp.city, vp.state_code,
           COUNT(vh.event_id) as total_events,
           COALESCE(SUM(vh.hours_worked),0) as total_hours,
           ARRAY_REMOVE(ARRAY_AGG(DISTINCT s.skill_name), NULL) as skills
    FROM volunteerprofile vp
    LEFT JOIN volunteer_history vh ON vp.volunteer_id = vh.volunteer_id
    LEFT JOIN volunteer_skills vs ON vp.volunteer_id = vs.volunteer_id
    LEFT JOIN skills s ON vs.skill_id = s.skill_id
    LEFT JOIN eventdetails ed ON vh.event_id = ed.event_id
    ${where ? 'WHERE ' + where : ''}
    GROUP BY vp.volunteer_id, vp.full_name, vp.email, vp.city, vp.state_code
    ORDER BY vp.full_name ASC
  `;

  const { rows } = await pool.query(sql, params);
  return rows.map(r => ({
    ...r,
    total_events: Number(r.total_events || 0),
    total_hours: Number(r.total_hours || 0),
    skills: r.skills || []
  }));
}

async function getVolunteerHistory(filters = {}) {
  const params = [];
  const where = buildFilterClauses(filters, params);

  const sql = `
    SELECT vp.volunteer_id, vp.full_name, vp.email, ed.event_id, ed.event_name, ed.location, ed.event_date, vh.hours_worked, vh.signup_date, vh.notes
    FROM volunteer_history vh
    JOIN volunteerprofile vp ON vh.volunteer_id = vp.volunteer_id
    JOIN eventdetails ed ON vh.event_id = ed.event_id
    ${where ? 'WHERE ' + where : ''}
    ORDER BY vp.volunteer_id, ed.event_date DESC
  `;

  const { rows } = await pool.query(sql, params);
  return rows.map(r => ({
    ...r,
    hours_worked: r.hours_worked ? Number(r.hours_worked) : 0
  }));
}

async function getEventManagement(filters = {}) {
  const params = [];
  const where = buildFilterClauses(filters, params);

  const sql = `
    SELECT ed.event_id, ed.event_name, ed.description, ed.location, ed.event_date, ed.urgency,
           COUNT(vh.volunteer_id) as total_volunteers,
           COALESCE(SUM(vh.hours_worked),0) as total_hours,
           ARRAY_REMOVE(ARRAY_AGG(DISTINCT s.skill_name), NULL) as required_skills
    FROM eventdetails ed
    LEFT JOIN volunteer_history vh ON ed.event_id = vh.event_id
    LEFT JOIN event_skills es ON ed.event_id = es.event_id
    LEFT JOIN skills s ON es.skill_id = s.skill_id
    ${where ? 'WHERE ' + where : ''}
    GROUP BY ed.event_id, ed.event_name, ed.description, ed.location, ed.event_date, ed.urgency
    ORDER BY ed.event_date ASC
  `;

  const { rows } = await pool.query(sql, params);
  return rows.map(r => ({
    ...r,
    total_volunteers: Number(r.total_volunteers || 0),
    total_hours: Number(r.total_hours || 0),
    required_skills: r.required_skills || []
  }));
}

async function getSkills(eventId = null) {
  // If eventId provided, return skills required for that event; otherwise return all skills
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

module.exports = {
  getVolunteerParticipation,
  getVolunteerHistory,
  getEventManagement, 
  getSkills
};
