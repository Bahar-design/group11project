// Lightweight pg mock to satisfy pool.query and client.query calls in tests.
// It implements a Pool class with query() and connect() methods.

class MockPool {
  constructor() {
    this._data = {
      user_table: [],
      volunteerprofile: [],
      volunteer_skills: [],
      eventdetails: [],
      event_skills: [],
      notification: [],
      skills: []
    };
    this._nextIds = {
      user_table: 100,
      volunteerprofile: 100,
      eventdetails: 100,
      notification: 100,
      skills: 10
    };
  }

  async connect() {
    const self = this;
    return Promise.resolve({
      query: async (text, params) => self.query(text, params),
      release: () => {}
    });
  }

  async query(text, params) {
    text = (text || '').trim();
    const lt = text.toLowerCase();

    // If test code checks for real DB availability using SELECT 1, simulate DB not available
    if (/^select 1$/i.test(lt)) {
      throw new Error('Simulated no real DB');
    }

    // transaction control
    if (/^begin$/.test(lt) || /^commit$/.test(lt) || /^rollback$/.test(lt)) {
      return { rows: [], rowCount: 0 };
    }

    // INSERT INTO user_table ... RETURNING user_id
    if (/insert into user_table/i.test(text)) {
      const email = params && params[0] ? params[0] : `user${Date.now()}@example.test`;
      const id = this._nextIds.user_table++;
      this._data.user_table.push({ user_id: id, user_email: email, user_password: params && params[1] ? params[1] : null, user_type: params && params[2] ? params[2] : 'volunteer' });
      return { rows: [{ user_id: id }], rowCount: 1 };
    }

    // SELECT NOW()
    if (/select now\(\)/i.test(text)) {
      return { rows: [{ now: new Date().toISOString() }], rowCount: 1 };
    }

    // SELECT user by email
    if (/select .* from user_table/i.test(text) && /where .*user_email/i.test(text) && params && params[0]) {
      const u = this._data.user_table.find(x => x.user_email === params[0]);
      return { rows: u ? [u] : [], rowCount: u ? 1 : 0 };
    }

    // DELETE FROM user_table WHERE user_id = $1
    if (/delete from user_table/i.test(text)) {
      const id = params && params[0];
      this._data.user_table = this._data.user_table.filter(r => r.user_id !== id);
      return { rows: [], rowCount: 1 };
    }

    // INSERT volunteerprofile RETURNING volunteer_id
    if (/insert into volunteerprofile/i.test(text) && /returning volunteer_id/i.test(text)) {
      const id = this._nextIds.volunteerprofile++;
      const user_id = params && params[0] ? params[0] : null;
      this._data.volunteerprofile.push({ volunteer_id: id, user_id });
      return { rows: [{ volunteer_id: id }], rowCount: 1 };
    }

    // INSERT INTO skills ... RETURNING skill_id
    if (/insert into skills/i.test(text) && /returning skill_id/i.test(text)) {
      const name = params && params[0] ? params[0] : `skill${Date.now()}`;
      const id = this._nextIds.skills++;
      this._data.skills.push({ skill_id: id, skill_name: name });
      return { rows: [{ skill_id: id }], rowCount: 1 };
    }

    // SELECT skill by name
    if (/select skill_id from skills where skill_name =/i.test(text) && params && params[0]) {
      const found = this._data.skills.find(s => s.skill_name === params[0]);
      return { rows: found ? [{ skill_id: found.skill_id }] : [], rowCount: found ? 1 : 0 };
    }

    // SELECT skill_id, skill_name FROM skills WHERE skill_id = ANY($1::int[])
    if (/select skill_id, skill_name from skills where skill_id = any/i.test(text) && params && Array.isArray(params[0])) {
      const ids = params[0];
      const rows = this._data.skills.filter(s => ids.includes(s.skill_id));
      return { rows, rowCount: rows.length };
    }

    // DELETE FROM event_skills WHERE event_id = $1
    if (/delete from event_skills where event_id/i.test(text) && params && params[0]) {
      const eventId = params[0];
      this._data.event_skills = this._data.event_skills.filter(e => e.event_id !== eventId);
      return { rows: [], rowCount: 1 };
    }

    // INSERT INTO event_skills
    if (/insert into event_skills/i.test(text)) {
      const eventId = params && params[0];
      const skillId = params && params[1];
      this._data.event_skills.push({ event_id: eventId, skill_id: skillId });
      return { rows: [], rowCount: 1 };
    }

    // Generic SELECT from volunteerprofile
    if (/select .* from volunteerprofile/i.test(text)) {
      return { rows: this._data.volunteerprofile.slice(), rowCount: this._data.volunteerprofile.length };
    }

    // Generic SELECT from skills
    if (/select .* from skills/i.test(text)) {
      return { rows: this._data.skills.slice(), rowCount: this._data.skills.length };
    }

    // INSERT INTO eventdetails ... RETURNING *
    if (/insert into eventdetails/i.test(text) && /returning \*/i.test(text)) {
      const id = this._nextIds.eventdetails++;
      const event = {
        event_id: id,
        event_name: params && params[0] ? params[0] : 'Untitled',
        description: params && params[1] ? params[1] : '',
        location: params && params[2] ? params[2] : '',
        urgency: params && params[3] ? params[3] : 1,
        event_date: params && params[4] ? new Date(params[4]) : null,
        created_by: params && params[5] ? params[5] : null,
        volunteers: params && params[6] ? params[6] : 0,
        skill_id: params && params[7] ? params[7] : []
      };
      this._data.eventdetails.push(event);
      return { rows: [event], rowCount: 1 };
    }

    // No implicit seeded events here. Tests should explicitly populate the mock
    // via pool.query.mockResolvedValueOnce(...) or by calling INSERT queries.

    // DELETE FROM <table> RETURNING * (for events delete)
    if (/delete from eventdetails/i.test(text) && /returning \*/i.test(text)) {
      const id = params && params[0];
      const idx = this._data.eventdetails.findIndex(e => e.event_id === id);
      if (idx === -1) return { rows: [], rowCount: 0 };
      const removed = this._data.eventdetails.splice(idx, 1);
      return { rows: removed, rowCount: 1 };
    }

    // UPDATE eventdetails ... RETURNING *
    if (/update eventdetails/i.test(text) && /returning \*/i.test(text)) {
      const id = params && params[7];
      const idx = this._data.eventdetails.findIndex(e => e.event_id === id);
      if (idx === -1) return { rows: [], rowCount: 0 };
      const ev = this._data.eventdetails[idx];
      ev.event_name = params[0];
      ev.description = params[1];
      ev.location = params[2];
      ev.urgency = params[3];
      ev.event_date = params[4] ? new Date(params[4]) : ev.event_date;
  // params mapping: event_name, description, location, urgency, event_date, skill_ids..., id
  ev.skill_id = params[5];
      return { rows: [ev], rowCount: 1 };
    }

    // SELECT * FROM eventdetails ORDER BY event_date ASC
    if (/select \* from eventdetails/i.test(text)) {
      return { rows: this._data.eventdetails.slice().sort((a,b)=> (a.event_date && b.event_date) ? a.event_date - b.event_date : 0), rowCount: this._data.eventdetails.length };
    }

    // SELECT * FROM eventdetails WHERE event_id = $1
    if (/select \* from eventdetails where event_id =/i.test(text) && params && params[0]) {
      const id = params[0];
      const found = this._data.eventdetails.find(e => e.event_id === id);
      return { rows: found ? [found] : [], rowCount: found ? 1 : 0 };
    }

    // SELECT vp.volunteer_id, vp.full_name, u.user_email FROM event_signups ...
    if (/select vp.volunteer_id, vp.full_name, u.user_email from event_signups/i.test(text)) {
      // If an event id param provided, return a mocked volunteer for that event
      const evId = params && params[0];
      if (evId) {
        return { rows: [{ volunteer_id: 501, full_name: 'Mock Volunteer', user_email: 'mv@example.com' }], rowCount: 1 };
      }
      // otherwise return empty — tests expect [] when no table exists or no signups
      return { rows: [], rowCount: 0 };
    }

    // Fallback
    return { rows: [], rowCount: 0 };
  }
}

module.exports = { Pool: MockPool };
