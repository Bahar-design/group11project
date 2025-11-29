const express = require('express');
const {
  getVolunteerHistory,
  getVolunteerHistoryByVolunteer,
  createVolunteerRecord,
  updateVolunteerRecord,
  deleteVolunteerRecord
} = require('../controllers/volunteerHistory');

const router = express.Router();

const { clients: sseClients } = require('../utils/sse');

router.get('/stream', (req, res) => {
  // Headers for SSE
  res.set({
    'Connection': 'keep-alive',
    'Cache-Control': 'no-cache',
    'Content-Type': 'text/event-stream'
  });
  res.flushHeaders && res.flushHeaders();

  const id = Date.now();
  const client = { id, res };
  sseClients.add(client);

  // keep the connection open
  req.on('close', () => {
    sseClients.delete(client);
  });
});

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
