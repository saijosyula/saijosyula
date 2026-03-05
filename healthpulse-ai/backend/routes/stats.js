const express = require('express');
const axios = require('axios');
const NodeCache = require('node-cache');

const router = express.Router();
const cache = new NodeCache({ stdTTL: 1800 }); // Cache 30 minutes

const DISEASE_SH_BASE = 'https://disease.sh/v3/covid-19';

async function fetchWithCache(url, cacheKey, ttl = 1800) {
  const cached = cache.get(cacheKey);
  if (cached) return cached;

  const response = await axios.get(url, { timeout: 10000 });
  cache.set(cacheKey, response.data, ttl);
  return response.data;
}

// GET /api/stats/covid/global
router.get('/covid/global', async (req, res) => {
  try {
    const data = await fetchWithCache(`${DISEASE_SH_BASE}/all`, 'covid_global');
    res.json({
      cases: data.cases,
      deaths: data.deaths,
      recovered: data.recovered,
      active: data.active,
      critical: data.critical,
      casesPerMillion: data.casesPerOneMillion,
      deathsPerMillion: data.deathsPerOneMillion,
      tests: data.tests,
      population: data.population,
      updatedAt: new Date(data.updated).toISOString(),
    });
  } catch (err) {
    console.error('COVID global stats error:', err.message);
    res.status(500).json({ error: 'Failed to fetch global COVID statistics' });
  }
});

// GET /api/stats/covid/countries?limit=10&sort=cases
router.get('/covid/countries', async (req, res) => {
  try {
    const { limit = 10, sort = 'cases' } = req.query;
    const validSort = ['cases', 'deaths', 'recovered', 'active', 'critical'].includes(sort)
      ? sort
      : 'cases';

    const data = await fetchWithCache(
      `${DISEASE_SH_BASE}/countries?sort=${validSort}`,
      `covid_countries_${validSort}`
    );

    const countries = data.slice(0, Math.min(Number(limit), 50)).map((c) => ({
      country: c.country,
      flag: c.countryInfo?.flag,
      cases: c.cases,
      deaths: c.deaths,
      recovered: c.recovered,
      active: c.active,
      critical: c.critical,
      casesPerMillion: c.casesPerOneMillion,
      deathsPerMillion: c.deathsPerOneMillion,
      population: c.population,
    }));

    res.json({ countries, updatedAt: new Date().toISOString() });
  } catch (err) {
    console.error('COVID countries error:', err.message);
    res.status(500).json({ error: 'Failed to fetch country statistics' });
  }
});

// GET /api/stats/covid/historical?days=30
router.get('/covid/historical', async (req, res) => {
  try {
    const { days = 30 } = req.query;
    const validDays = Math.min(Math.max(Number(days), 7), 120);

    const data = await fetchWithCache(
      `${DISEASE_SH_BASE}/historical/all?lastdays=${validDays}`,
      `covid_historical_${validDays}`
    );

    // Convert objects to sorted arrays for charting
    const formatTimeline = (obj) =>
      Object.entries(obj || {})
        .map(([date, value]) => ({ date, value }))
        .sort((a, b) => new Date(a.date) - new Date(b.date));

    res.json({
      cases: formatTimeline(data.cases),
      deaths: formatTimeline(data.deaths),
      recovered: formatTimeline(data.recovered),
      days: validDays,
    });
  } catch (err) {
    console.error('COVID historical error:', err.message);
    res.status(500).json({ error: 'Failed to fetch historical data' });
  }
});

// GET /api/stats/covid/vaccines
router.get('/covid/vaccines', async (req, res) => {
  try {
    const data = await fetchWithCache(
      'https://disease.sh/v3/covid-19/vaccine/coverage?lastdays=30',
      'covid_vaccines_30'
    );

    const timeline = Object.entries(data || {})
      .map(([date, value]) => ({ date, value }))
      .sort((a, b) => new Date(a.date) - new Date(b.date));

    res.json({ timeline });
  } catch (err) {
    console.error('Vaccine stats error:', err.message);
    res.status(500).json({ error: 'Failed to fetch vaccine data' });
  }
});

// GET /api/stats/fda/drug-events?term=aspirin
// Drug adverse event counts from OpenFDA — great for showing most reported events
router.get('/fda/drug-events', async (req, res) => {
  try {
    const { term = 'aspirin', limit = 10 } = req.query;
    const cacheKey = `fda_events_${term}_${limit}`;
    const url = `https://api.fda.gov/drug/event.json?search=patient.drug.medicinalproduct:"${encodeURIComponent(term)}"&count=patient.reaction.reactionmeddrapt.exact&limit=${Math.min(limit, 20)}`;

    const data = await fetchWithCache(url, cacheKey, 3600);

    res.json({
      drug: term,
      topReactions: (data.results || []).map((r) => ({
        reaction: r.term,
        count: r.count,
      })),
    });
  } catch (err) {
    if (err.response?.status === 404) {
      return res.json({ drug: req.query.term, topReactions: [] });
    }
    console.error('FDA events count error:', err.message);
    res.status(500).json({ error: 'Failed to fetch FDA event data' });
  }
});

module.exports = router;
