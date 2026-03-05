const express = require('express');
const axios = require('axios');
const NodeCache = require('node-cache');

const router = express.Router();
// cache results for 1 hour so we don't keep hitting the FDA API for the same queries
const cache = new NodeCache({ stdTTL: 3600 });

const OPENFDA_BASE = 'https://api.fda.gov/drug';

// pulled this out into its own function since every route needs the same
// cache-check -> fetch -> cache-set pattern
async function fetchOpenFDA(url, cacheKey) {
  const cached = cache.get(cacheKey);
  if (cached) return cached;

  const response = await axios.get(url, { timeout: 10000 });
  cache.set(cacheKey, response.data);
  return response.data;
}

// search by brand name OR generic name - FDA query syntax uses + as OR here
// took me a while to figure out their query syntax lol
router.get('/search', async (req, res) => {
  try {
    const { q, limit = 10 } = req.query;
    if (!q || q.trim().length < 2) {
      return res.status(400).json({ error: 'Query must be at least 2 characters' });
    }

    const query = encodeURIComponent(q.trim());
    const cacheKey = `search_${query}_${limit}`;
    const url = `${OPENFDA_BASE}/label.json?search=openfda.brand_name:"${query}"+openfda.generic_name:"${query}"&limit=${Math.min(limit, 20)}`;

    const data = await fetchOpenFDA(url, cacheKey);

    const results = (data.results || []).map((item) => ({
      id: item.id,
      brandName: item.openfda?.brand_name?.[0] || 'Unknown',
      genericName: item.openfda?.generic_name?.[0] || 'Unknown',
      manufacturer: item.openfda?.manufacturer_name?.[0] || 'Unknown',
      drugClass: item.openfda?.pharm_class_epc?.[0] || null,
      purpose: item.purpose?.[0]?.slice(0, 300) || null,
      warnings: item.warnings?.[0]?.slice(0, 500) || null,
      dosage: item.dosage_and_administration?.[0]?.slice(0, 500) || null,
      rxcui: item.openfda?.rxcui?.[0] || null,
      substanceName: item.openfda?.substance_name?.[0] || null,
    }));

    res.json({ total: data.meta?.results?.total || results.length, results });
  } catch (err) {
    if (err.response?.status === 404) {
      return res.json({ total: 0, results: [] });
    }
    console.error('Drug search error:', err.message);
    res.status(500).json({ error: 'Failed to fetch drug data' });
  }
});

// full drug label - returns everything the FDA has on file for this drug
router.get('/:name/details', async (req, res) => {
  try {
    const name = encodeURIComponent(req.params.name);
    const cacheKey = `details_${name}`;
    const url = `${OPENFDA_BASE}/label.json?search=openfda.brand_name:"${name}"+openfda.generic_name:"${name}"&limit=1`;

    const data = await fetchOpenFDA(url, cacheKey);
    const item = data.results?.[0];

    if (!item) {
      return res.status(404).json({ error: 'Drug not found' });
    }

    res.json({
      brandName: item.openfda?.brand_name?.[0] || 'Unknown',
      genericName: item.openfda?.generic_name?.[0] || 'Unknown',
      manufacturer: item.openfda?.manufacturer_name?.[0] || 'Unknown',
      drugClass: item.openfda?.pharm_class_epc || [],
      substanceName: item.openfda?.substance_name || [],
      purpose: item.purpose || [],
      indications: item.indications_and_usage || [],
      dosage: item.dosage_and_administration || [],
      warnings: item.warnings || [],
      contraindications: item.contraindications || [],
      adverseReactions: item.adverse_reactions || [],
      drugInteractions: item.drug_interactions || [],
      pregnancyWarning: item.pregnancy || [],
      storage: item.storage_and_handling || [],
    });
  } catch (err) {
    if (err.response?.status === 404) {
      return res.status(404).json({ error: 'Drug not found' });
    }
    res.status(500).json({ error: 'Failed to fetch drug details' });
  }
});

// FAERS = FDA Adverse Event Reporting System
// this was the coolest part of the openFDA API to me - real patient reports
router.get('/:name/adverse-events', async (req, res) => {
  try {
    const { name } = req.params;
    const { limit = 5 } = req.query;
    const cacheKey = `adverse_${name}_${limit}`;
    const url = `${OPENFDA_BASE}/event.json?search=patient.drug.medicinalproduct:"${encodeURIComponent(name)}"&limit=${Math.min(limit, 10)}&sort=receivedate:desc`;

    const data = await fetchOpenFDA(url, cacheKey);

    const events = (data.results || []).map((event) => ({
      date: event.receivedate,
      serious: event.serious === '1',
      seriousnessReason: [
        event.seriousnessdeath === '1' ? 'Death' : null,
        event.seriousnesshospitalization === '1' ? 'Hospitalization' : null,
        event.seriousnesslifethreatening === '1' ? 'Life-threatening' : null,
        event.seriousnessdisabling === '1' ? 'Disabling' : null,
      ].filter(Boolean),
      reactions: (event.patient?.reaction || []).map((r) => r.reactionmeddrapt),
      country: event.occurcountry,
    }));

    res.json({ total: data.meta?.results?.total || 0, events });
  } catch (err) {
    if (err.response?.status === 404) {
      return res.json({ total: 0, events: [] });
    }
    res.status(500).json({ error: 'Failed to fetch adverse events' });
  }
});

// FDA enforcement = drug recalls. sorting by newest first
router.get('/recalls/recent', async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    const cacheKey = `recalls_${limit}`;
    const url = `${OPENFDA_BASE}/enforcement.json?limit=${Math.min(limit, 20)}&sort=report_date:desc`;

    const data = await fetchOpenFDA(url, cacheKey);

    const recalls = (data.results || []).map((r) => ({
      recallNumber: r.recall_number,
      productDescription: r.product_description?.slice(0, 200),
      reason: r.reason_for_recall?.slice(0, 300),
      status: r.status,
      classification: r.classification,
      reportDate: r.report_date,
      recallingFirm: r.recalling_firm,
      distributionPattern: r.distribution_pattern?.slice(0, 200),
    }));

    res.json({ total: data.meta?.results?.total || 0, recalls });
  } catch (err) {
    if (err.response?.status === 404) {
      return res.json({ total: 0, recalls: [] });
    }
    res.status(500).json({ error: 'Failed to fetch recalls' });
  }
});

module.exports = router;
