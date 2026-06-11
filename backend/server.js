const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// TEMPORARY CORS (for testing)
app.use(
  cors({
    origin: true,
    credentials: true,
  })
);

// Routes
app.get('/', (req, res) => {
  res.send('Spotlight Salon API is running 🚀');
});

app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/services', require('./routes/serviceRoutes'));
app.use('/api/appointments', require('./routes/appointmentRoutes'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Salon API is running' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: err.message || 'Internal server error' });
});

// Start server
const PORT = process.env.PORT || 5001;

app.listen(PORT, () => {
  console.log(
    `✅ Server running on port ${PORT} in ${
      process.env.NODE_ENV || 'development'
    } mode`
  );
});

module.exports = app;
