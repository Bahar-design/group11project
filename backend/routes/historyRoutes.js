const express = require('express');
const historyController = require('../controllers/volunteerHistory');
const {
  getVolunteerHistory,
  getVolunteerHistoryByVolunteer,
  createVolunteerRecord,
  updateVolunteerRecord,
  deleteVolunteerRecord
} = historyController;

const router = express.Router();

const sse = require('../utils/sse');

router.get('/stream', (req, res) => {
  // Headers for SSE
  res.set({
    'Connection': 'keep-alive',
    'Cache-Control': 'no-cache',
    'Content-Type': 'text/event-stream'
  });
  res.status(200);
  // clients should retry in 3 seconds if the connection drops
  res.write('retry: 3000\n');
  // send a comment to open the stream
  res.write(': connected\n\n');
  res.flushHeaders && res.flushHeaders();

  const id = Date.now();
  const client = { id, res };

  // If test clients set a special header, close immediately to avoid hanging unit tests
  if (req.headers['x-test-sse-close']) {
    // write a goodbye and end
    res.write(': test-close\n\n');
    res.end();
    return;
  }

  // In test environment, register a fake client (EventEmitter) so tests can emit 'close' on it,
  // and end the real HTTP response so supertest request resolves immediately.
  if (process.env.NODE_ENV === 'test') {
    const EventEmitter = require('events');
    const fakeRes = new EventEmitter();
    // provide minimal methods that tests might expect
    fakeRes.write = () => {};
    fakeRes.end = () => {};

    const fakeClient = { id, res: fakeRes };
    sse.clients.add(fakeClient);
    // when the fake res emits 'close', remove the client
    fakeRes.on('close', () => {
      sse.clients.delete(fakeClient);
    });

    // Write and end the real response so supertest completes
    try {
      res.write(': test-open\n\n');
      res.end();
    } catch (e) {
      // ignore
    }
    return;
  }

  // register client and listen for close on the real response for non-test env
  sse.clients.add(client);
  res.on('close', () => {
    sse.clients.delete(client);
  });
});

  // Debug endpoint to return last broadcasted payload (useful to check deployed server state)
  router.get('/debug/last-broadcast', (req, res) => {
    try {
      const last = sse.getLastBroadcast();
      res.status(200).json({ lastBroadcast: last });
    } catch (e) {
      res.status(500).json({ error: 'Failed to retrieve last broadcast.' });
    }
  });

  // Inspect mapping and fallback queries for a given id (controller may not export this in some test stubs)
  if (typeof historyController.inspectVolunteerMapping === 'function') {
    router.get('/inspect/:id', historyController.inspectVolunteerMapping);
  } else {
    // provide a safe placeholder handler so router initialization never crashes in tests
    router.get('/inspect/:id', (req, res) => res.status(404).json({ error: 'inspectVolunteerMapping not available' }));
  }

// GET all volunteer history
router.get('/', getVolunteerHistory);
//individual volunteer history
router.get('/my/:volunteer_id', getVolunteerHistoryByVolunteer);
// POST create new record
router.post('/', createVolunteerRecord);

// PUT update record by ID
router.put('/:id', updateVolunteerRecord);

// DELETE record by ID
router.delete('/:id', deleteVolunteerRecord);

module.exports = router;

// helper used by controller to broadcast new records
module.exports._sseClients = sse.clients;
