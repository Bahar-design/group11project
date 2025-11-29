// Simple SSE helper used by routes and controllers to share client set
const clients = new Set();

function broadcast(obj) {
  const payload = typeof obj === 'string' ? obj : JSON.stringify(obj);
  for (const c of Array.from(clients)) {
    try {
      // If response has finished, remove client
      if (c.res.finished) {
        clients.delete(c);
        continue;
      }
      c.res.write(`data: ${payload}\n\n`);
    } catch (e) {
      // remove client on write failure
      try { clients.delete(c); } catch(_){}
    }
  }
}

module.exports = { clients, broadcast };
