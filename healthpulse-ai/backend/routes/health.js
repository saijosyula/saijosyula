const express = require('express');
const router = express.Router();

// GET /api/health — server health check
router.get('/', (req, res) => {
  res.json({
    status: 'ok',
    uptime: Math.floor(process.uptime()),
    timestamp: new Date().toISOString(),
    memory: {
      used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024) + 'MB',
      total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024) + 'MB',
    },
    externalAPIs: {
      openFDA: 'https://api.fda.gov',
      diseaseSh: 'https://disease.sh',
    },
  });
});

module.exports = router;
