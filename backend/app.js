
// main backend file
const express = require('express');
const cors = require('cors'); // add CORS

const userProfileRouter = require('./routes/userProfile');
const loginRoutes = require('./routes/loginRoutes'); // import login routes
const registrationRouter = require("./routes/registrationRoutes");
const notificationRoutes = require('./routes/notificationRoutes');
const eventRoutes = require('./routes/eventRoutes');
const historyRoutes = require('./routes/historyRoutes');
const calendarRoutes = require('./routes/calendarRoutes');
const matchRoutes = require('./routes/matchRoutes');


const app = express();

// DB pool used by the health route
const pool = require('./db');

// Middleware
// Allow only the configured frontend origin(s) in production
const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN || '';

// Build the allowed origins list. FRONTEND_ORIGIN can be a single origin or a comma-separated list.
// Keep local dev origin and include the common production frontend origin (Vercel) so deployed frontend can reach the API.
const allowedOrigins = ['http://localhost:5173', 'https://group11project.vercel.app']; // keep local dev origin and production
// Parse FRONTEND_ORIGIN if provided (comma-separated list). Use a forgiving parser
// that works whether FRONTEND_ORIGIN is empty or contains one or more origins.
const parts = (FRONTEND_ORIGIN || '').split(',').map(s => s.trim()).filter(Boolean);
parts.forEach(p => allowedOrigins.push(p));

// If FRONTEND_ORIGIN is not set (no extra parts), we'll allow all origins to ease deployment/testing.
// In production you should set FRONTEND_ORIGIN and restrict origins for security.
const allowAllOrigins = parts.length === 0;
app.use(cors({
  origin: function (origin, callback) {
    // If origin is missing (curl, server-to-server) or we allow all, permit
    if (!origin || allowAllOrigins || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    // Otherwise reject and log for diagnostics
    console.warn('Blocked CORS origin:', origin);
    const err = new Error('Not allowed by CORS');
    err.status = 400;
    return callback(err);
  }
}));





app.use(express.json());  // parse JSON request bodies

// Routes
app.use('/api/user-profile', userProfileRouter);
app.use('/api/login', loginRoutes); // login endpoint
app.use("/api/register", registrationRouter);       //for registration
app.use('/api/notifications', notificationRoutes);
app.use('/api/events', eventRoutes);
// Ensure matches route is available on this app instance as well
app.use('/api/matches', matchRoutes);
app.use('/api/volunteer-history', historyRoutes);
app.use('/api/calendar', calendarRoutes);
// Reports endpoints
const reportsRouter = require('./routes/reports');
app.use('/api/reports', reportsRouter);

// Health check route
app.get('/api/health', async (req, res) => {
  try {
    // Simple query to test DB connection
    const result = await pool.query('SELECT NOW()'); 
    res.status(200).json({
      status: 'Backend running!',
      dbTime: result.rows[0].now
    });
  } catch (err) {
    res.status(500).json({
      status: 'Backend running, but DB connection failed',
      error: err.message
    });
  }
});
 
// Error handler
app.use((err, req, res, next) => {
  res.status(err.status || 400).json({ error: err.message || 'Validation error' });
});

// Start server if this file is run directly
// The server start block is integration-only; exclude from unit test coverage
/* istanbul ignore next */
if (require.main === module) {
  const PORT = process.env.PORT || 4000;
  app.listen(PORT, () => {
    console.log(`Backend server running on port ${PORT}`);
  });
}

module.exports = app;

