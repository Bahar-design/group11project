
// main backend file
const express = require('express');
const cors = require('cors'); // add CORS
const userProfileRouter = require('./routes/userProfile');
const loginRoutes = require('./routes/loginRoutes'); // import login routes
const registrationRouter = require("./routes/registrationRoutes");


const app = express();

// Middleware
app.use(cors());          // allow cross-origin requests from frontend
app.use(express.json());  // parse JSON request bodies

// Routes
app.use('/api/user-profile', userProfileRouter);
app.use('/api/auth', loginRoutes); // login endpoint
app.use("/api/register", registrationRouter);       //for registration
 
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

