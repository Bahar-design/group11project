// Proxy API requests from frontend to backend during development
const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  app.use(
    '/api',
    createProxyMiddleware({
  target: process.env.VITE_API_BASE || 'http://localhost:4000',
      changeOrigin: true,
    })
  );
};
