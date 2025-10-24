// Proxy API requests from frontend to backend during development
const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  app.use(
    '/api',
    createProxyMiddleware({
      // When running the dev server you can set VITE_API_BASE in your shell
      // to proxy API calls to a remote backend. Otherwise default to localhost.
      target: process.env.VITE_API_BASE || 'http://localhost:4000',
      changeOrigin: true,
    })
  );
};
