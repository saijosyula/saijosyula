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

// cors needed so my react frontend on 5173 can talk to this server on 5000
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  methods: ['GET', 'POST'],
}));
app.use(morgan('dev'));
app.use(express.json());

// added rate limiting because openFDA only allows 240 req/min without an API key
// 200 per 15min window is way under that limit so we should be fine
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again later.' },
});
app.use('/api', limiter);

app.use('/api/drugs', drugsRouter);
app.use('/api/symptoms', symptomsRouter);
app.use('/api/stats', statsRouter);
app.use('/api/health', healthRouter);

// just a root route so i can confirm the server is up
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

app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// global error handler - without this the whole server crashes on unhandled errors
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal server error', message: err.message });
});

app.listen(PORT, () => {
  console.log(`HealthPulse AI backend running on http://localhost:${PORT}`);
});

module.exports = app;
