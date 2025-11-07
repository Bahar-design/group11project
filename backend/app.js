
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
// Allow only the configured frontend origin(s) in production
const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN || '';

// Build the allowed origins list. FRONTEND_ORIGIN can be a single origin or a comma-separated list.
const allowedOrigins = ['http://localhost:5173']; // keep local dev origin
if (FRONTEND_ORIGIN) {
  const parts = FRONTEND_ORIGIN.split(',').map(s => s.trim()).filter(Boolean);
  parts.forEach(p => allowedOrigins.push(p));
}

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  }
}));





app.use(express.json());  // parse JSON request bodies

// Routes
app.use('/api/user-profile', userProfileRouter);
app.use('/api/login', loginRoutes); // login endpoint
app.use("/api/register", registrationRouter);       //for registration
app.use('/api/notifications', notificationRoutes);
app.use('/api/events', eventRoutes);
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

