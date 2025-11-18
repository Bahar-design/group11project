const reports = require('../controllers/reportsController');
const pool = require('../db');

jest.mock('../db');

describe('reportsController functions', () => {
  beforeEach(() => jest.resetAllMocks());

  test('getVolunteerParticipation with no filters maps numeric fields', async () => {
    pool.query.mockResolvedValueOnce({ rows: [ { volunteer_id: 5, full_name: 'Zed', email: 'z@x.com', city: 'C', state_code: 'TX', total_events: '3', skills: ['A'] } ] });
    const res = await reports.getVolunteerParticipation({});
    expect(pool.query).toHaveBeenCalled();
    expect(res[0].total_events).toBe(3);
    expect(Array.isArray(res[0].skills)).toBe(true);
  });

  test('getVolunteerParticipation with search and skill builds WHERE clause', async () => {
    pool.query.mockResolvedValueOnce({ rows: [] });
    await reports.getVolunteerParticipation({ search: 'john', skill: 'Leadership' });
    expect(pool.query).toHaveBeenCalled();
    const calledSql = pool.query.mock.calls[0][0];
    expect(/WHERE/i.test(calledSql)).toBe(true);
  });

  test('getVolunteerHistory formats dates and urgency', async () => {
    pool.query.mockResolvedValueOnce({ rows: [ { volunteer_id: 2, full_name: 'A', event_id: 10, event_name: 'E', event_date: '2025-01-01', urgency: 2 } ] });
    const res = await reports.getVolunteerHistory({});
    expect(res[0].event_date).toBe('2025-01-01');
    expect(res[0].urgency).toBe('Medium');
  });

  test('getEventManagement maps totals and skills', async () => {
    pool.query.mockResolvedValueOnce({ rows: [ { event_id: 11, event_name: 'Ev', total_volunteers: '5', required_skills: ['S'] } ] });
    const res = await reports.getEventManagement({ location: 'Downtown' });
    expect(pool.query).toHaveBeenCalled();
    expect(res[0].total_volunteers).toBe(5);
    expect(Array.isArray(res[0].required_skills)).toBe(true);
  });
});
