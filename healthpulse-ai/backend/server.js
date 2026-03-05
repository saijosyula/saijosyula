require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

const drugsRouter = require('./routes/drugs');
const symptomsRouter = require('./routes/symptoms');
const statsRouter = require('./routes/stats');
const healthRouter = require('./routes/health');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  methods: ['GET', 'POST'],
}));
app.use(morgan('dev'));
app.use(express.json());

// Rate limiting — protects the free APIs we proxy
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again later.' },
});
app.use('/api', limiter);

// Routes
app.use('/api/drugs', drugsRouter);
app.use('/api/symptoms', symptomsRouter);
app.use('/api/stats', statsRouter);
app.use('/api/health', healthRouter);

// Root
app.get('/', (req, res) => {
  res.json({
    name: 'HealthPulse AI API',
    version: '1.0.0',
    status: 'running',
    endpoints: {
      drugs: '/api/drugs',
      symptoms: '/api/symptoms',
      stats: '/api/stats',
      health: '/api/health',
    },
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal server error', message: err.message });
});

app.listen(PORT, () => {
  console.log(`HealthPulse AI backend running on http://localhost:${PORT}`);
});

module.exports = app;
