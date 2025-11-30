// Simple SSE helper used by routes and controllers to share client set
const clients = new Set();
let lastBroadcast = null;

function broadcast(obj) {
  // store last broadcast for quick debugging
  lastBroadcast = obj;
  const payload = typeof obj === 'string' ? obj : JSON.stringify(obj);
  for (const c of Array.from(clients)) {
    try {
      // If response has finished, remove client
      /* istanbul ignore if */
      if (c.res && c.res.finished) {
        clients.delete(c);
        continue;
      }
      c.res.write(`data: ${payload}\n\n`);
    } catch (e) {
      // remove client on write failure
      /* istanbul ignore next */
      try { clients.delete(c); } catch(_){ }
    }
  }
}

function getLastBroadcast() {
  return lastBroadcast;
}

module.exports = { clients, broadcast, getLastBroadcast };
