const express = require('express');
const userProfileRouter = require('./routes/userProfile');

const app = express();
app.use(express.json());

// User Profile routes
app.use('/api/user-profile', userProfileRouter);

// Error handler
app.use((err, req, res, next) => {
  res.status(err.status || 400).json({ error: err.message || 'Validation error' });
});

module.exports = app;

if (require.main === module) {
  const PORT = process.env.PORT || 4000;
  app.listen(PORT, () => {
    console.log(`Backend server running on port ${PORT}`);
  });
}
