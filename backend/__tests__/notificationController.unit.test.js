jest.mock('../db', () => ({
  query: jest.fn()
}));

const pool = require('../db');
const notif = require('../controllers/notificationController');

// helper
function mockReqRes({ params = {}, query = {}, body = {} } = {}) {
  const req = { params, query, body };
  const res = { status: jest.fn().mockReturnThis(), json: jest.fn().mockReturnThis() };
  return [req, res];
}

describe('notificationController - unit tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    if (notif.__getMessages) notif.__getMessages().length = 0;
  });

  // ---------------------------
  // sendMessage
  // ---------------------------
  test('sendMessage returns 400 when fields are missing', async () => {
    const [req, res] = mockReqRes({ body: { from: '', to: '', message: '' } });
    await notif.sendMessage(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  test('sendMessage inserts into DB successfully', async () => {
    pool.query.mockResolvedValueOnce({
      rows: [{ message_from: 'a@b.com', message_text: 'hi there' }]
    });

    const [req, res] = mockReqRes({
      body: { from: 'a@b.com', to: ['x@y.com'], message: 'hi there' }
    });

    await notif.sendMessage(req, res);

    expect(pool.query).toHaveBeenCalledWith(
      expect.stringContaining('INSERT INTO notifications'),
      expect.any(Array)
    );

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ message: 'Message sent' })
    );
  });

  test('sendMessage handles DB error', async () => {
    pool.query.mockRejectedValueOnce(new Error('DB insert failed'));
    const [req, res] = mockReqRes({
      body: { from: 'a@b.com', to: ['c@d.com'], message: 'hello' }
    });

    await notif.sendMessage(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ message: expect.stringContaining('Server error') })
    );
  });

  // ---------------------------
  // getUserNotifications
  // ---------------------------
  test('getUserNotifications returns 400 if email missing', async () => {
    const [req, res] = mockReqRes({ query: {} });
    await notif.getUserNotifications(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  test('getUserNotifications returns rows', async () => {
    pool.query.mockResolvedValueOnce({ rows: [{ message_ID: 1, message_text: 'x' }] });

    const [req, res] = mockReqRes({ query: { email: 'a@b.com' } });
    await notif.getUserNotifications(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(expect.any(Array));
  });

  test('getUserNotifications handles DB error', async () => {
    pool.query.mockRejectedValueOnce(new Error('DB failure'));
    const [req, res] = mockReqRes({ query: { email: 'bad@b.com' } });

    await notif.getUserNotifications(req, res);
    expect(res.status).toHaveBeenCalledWith(500);
  });

  // ---------------------------
  // deleteNotification
  // ---------------------------
  test('deleteNotification 404 when not found', async () => {
    pool.query.mockResolvedValueOnce({ rows: [] });

    const [req, res] = mockReqRes({ params: { id: '9' } });
    await notif.deleteNotification(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
  });

  test('deleteNotification success', async () => {
    pool.query.mockResolvedValueOnce({ rows: [{ message_ID: 1 }] });

    const [req, res] = mockReqRes({ params: { id: '1' } });
    await notif.deleteNotification(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
  });

  test('deleteNotification handles DB error', async () => {
    pool.query.mockRejectedValueOnce(new Error('DB delete failed'));

    const [req, res] = mockReqRes({ params: { id: '9' } });
    await notif.deleteNotification(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
  });

  // ---------------------------
  // markMessageAsSent
  // ---------------------------
  test('markMessageAsSent returns 404 if not found', async () => {
    pool.query.mockResolvedValueOnce({ rowCount: 0 });

    const [req, res] = mockReqRes({ params: { id: '999' } });
    await notif.markMessageAsSent(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
  });

  test('markMessageAsSent updates successfully', async () => {
    pool.query.mockResolvedValueOnce({
      rowCount: 1,
      rows: [{ message_ID: 1, message_sent: true }]
    });

    const [req, res] = mockReqRes({ params: { id: '1' } });
    await notif.markMessageAsSent(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
  });

  // ---------------------------
  // getVolunteers
  // ---------------------------
  test('getVolunteers returns DB rows', async () => {
    pool.query.mockResolvedValueOnce({ rows: [{ user_id: 1, email: 'v@v.com' }] });

    const [req, res] = mockReqRes();
    await notif.getVolunteers(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
  });

  test('getVolunteers returns empty array when DB returns none', async () => {
    pool.query.mockResolvedValueOnce({ rows: [] });

    const [req, res] = mockReqRes();
    await notif.getVolunteers(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(expect.any(Array));
  });

  // ---------------------------
  // getAdmins
  // ---------------------------
  test('getAdmins returns fallback users when DB empty', async () => {
    pool.query.mockResolvedValueOnce({ rows: [] });

    const [req, res] = mockReqRes();
    await notif.getAdmins(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
  });

});

// ---------------------------
// FALLBACK TESTS for volunteers & admins
// ---------------------------
test('getVolunteers uses fallback when DB empty', async () => {
  pool.query.mockResolvedValueOnce({ rows: [] });

  const [req, res] = mockReqRes();
  await notif.getVolunteers(req, res);

  expect(res.status).toHaveBeenCalledWith(200);
  expect(res.json.mock.calls[0][0].length).toBeGreaterThan(0);
});

test('getAdmins uses fallback when DB empty', async () => {
  pool.query.mockResolvedValueOnce({ rows: [] });

  const [req, res] = mockReqRes();
  await notif.getAdmins(req, res);

  expect(res.status).toHaveBeenCalledWith(200);
  expect(res.json.mock.calls[0][0].length).toBeGreaterThan(0);
});
