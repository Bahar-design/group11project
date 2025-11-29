// Simple SSE helper used by routes and controllers to share client set
const clients = new Set();

function broadcast(obj) {
  const payload = typeof obj === 'string' ? obj : JSON.stringify(obj);
  clients.forEach(c => {
    try {
      c.res.write(`data: ${payload}\n\n`);
    } catch (e) {
      // ignore write errors
    }
  });
}

module.exports = { clients, broadcast };
