jest.mock('../db');
const pool = require('../db');
const notif = require('../controllers/notificationController');

function makeReqRes(params = {}, body = {}) {
  return [{ params, query: {}, body }, { status: jest.fn().mockReturnThis(), json: jest.fn().mockReturnThis() }];
}

describe('notificationController unit tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // reset in-memory messages
    if (notif.__getMessages) notif.__getMessages().length = 0;
  });

  test('sendMessage returns 400 on missing fields', async () => {
    const [req, res] = makeReqRes({}, { from: '', to: null, message: '' });
    await notif.sendMessage(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  test('sendMessage returns 201 and msg when DB insert resolves', async () => {
    // Simulate DB insert returning a row with message_from/message_text
    pool.query = jest.fn().mockResolvedValue({ rows: [{ message_from: 'a@b', message_text: 'hi' }] });
    const [req, res] = makeReqRes({}, { from: 'a@b', to: ['c@d'], message: 'hi' });
    await notif.sendMessage(req, res);
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalled();
    const arg = res.json.mock.calls[0][0];
    expect(arg).toHaveProperty('msg');
    expect(arg.msg).toMatchObject({ from: 'a@b', message: 'hi' });
  });

  test('getAdminInbox falls back to in-memory messages when DB missing', async () => {
    // ensure a fallback user exists in loginController
    const { users } = require('../controllers/loginController');
    // push a test message into in-memory messages
    if (notif.__getMessages) notif.__getMessages().push({ id: 1, from: 'x@x', to: [users[1].email], message: 'hello' });

    pool.query = jest.fn().mockResolvedValue({ rows: [] }); // simulate missing DB user
    const [req, res] = makeReqRes({ adminId: '2' }, {});
    await notif.getAdminInbox(req, res);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalled();
    const arg = res.json.mock.calls[0][0];
    expect(Array.isArray(arg)).toBe(true);
  });
});
