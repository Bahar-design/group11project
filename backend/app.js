
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


const app = express();

// DB pool used by the health route
const pool = require('./db');

// Middleware
// Allow only the configured frontend origin in production. Fallback to '*' for local dev.
const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN || '*';
console.log('Using FRONTEND_ORIGIN =', FRONTEND_ORIGIN);
app.use(cors({ origin: FRONTEND_ORIGIN }));
app.use(express.json());  // parse JSON request bodies

// Routes
app.use('/api/user-profile', userProfileRouter);
app.use('/api/login', loginRoutes); // login endpoint
app.use("/api/register", registrationRouter);       //for registration
app.use('/api/notifications', notificationRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/volunteer-history', historyRoutes);
app.use('/api/calendar', calendarRoutes);

// Health check route
app.get('/api/health', async (req, res) => {
  try {
    // Simple query to test DB connection
    const result = await pool.query('SELECT NOW()'); 
    res.json({
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
if (require.main === module) {
  const PORT = process.env.PORT || 4000;
  app.listen(PORT, () => {
    console.log(`Backend server running on port ${PORT}`);
  });
}

module.exports = app;

