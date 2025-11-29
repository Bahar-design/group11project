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

const { clients: sseClients, getLastBroadcast } = require('../utils/sse');

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
  sseClients.add(client);
  // If test clients set a special header, close immediately to avoid hanging unit tests
  if (req.headers['x-test-sse-close']) {
    // write a goodbye and end
    res.write(': test-close\n\n');
    res.end();
    sseClients.delete(client);
    return;
  }

  // keep the connection open
  req.on('close', () => {
    sseClients.delete(client);
  });
});

  // Debug endpoint to return last broadcasted payload (useful to check deployed server state)
  router.get('/debug/last-broadcast', (req, res) => {
    try {
      const last = getLastBroadcast();
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
module.exports._sseClients = sseClients;
