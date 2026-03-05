const express = require('express');
const axios = require('axios');

const router = express.Router();

// Symptom-to-condition knowledge base
// Built from publicly available medical resources (Mayo Clinic, WebMD, CDC)
const SYMPTOM_CONDITIONS = {
  fever: [
    { condition: 'Influenza (Flu)', confidence: 0.85, urgency: 'moderate', description: 'Viral infection causing high fever, body aches, and fatigue.' },
    { condition: 'COVID-19', confidence: 0.8, urgency: 'moderate', description: 'Respiratory illness caused by SARS-CoV-2. Fever is a hallmark symptom.' },
    { condition: 'Bacterial Infection', confidence: 0.7, urgency: 'moderate', description: 'Various bacterial infections can cause fever as the body fights off pathogens.' },
    { condition: 'Common Cold', confidence: 0.5, urgency: 'low', description: 'Mild respiratory infection. Fever is less common than with flu.' },
  ],
  headache: [
    { condition: 'Tension Headache', confidence: 0.85, urgency: 'low', description: 'Most common type — dull, aching pain, often from stress or poor posture.' },
    { condition: 'Migraine', confidence: 0.7, urgency: 'moderate', description: 'Intense throbbing headache, often with nausea, vomiting, or light sensitivity.' },
    { condition: 'Sinusitis', confidence: 0.6, urgency: 'low', description: 'Inflammation of sinuses causing pressure and pain around the face.' },
    { condition: 'Dehydration', confidence: 0.55, urgency: 'low', description: 'Insufficient fluid intake can trigger headaches. Drink water first.' },
  ],
  cough: [
    { condition: 'Common Cold', confidence: 0.85, urgency: 'low', description: 'Viral infection of upper respiratory tract. Cough is very common.' },
    { condition: 'Bronchitis', confidence: 0.7, urgency: 'moderate', description: 'Inflammation of bronchial tubes causing persistent cough with mucus.' },
    { condition: 'Asthma', confidence: 0.6, urgency: 'moderate', description: 'Chronic condition with airway inflammation causing wheezing and coughing.' },
    { condition: 'COVID-19', confidence: 0.75, urgency: 'moderate', description: 'Dry cough is a hallmark symptom of COVID-19.' },
    { condition: 'Allergies', confidence: 0.65, urgency: 'low', description: 'Allergic reactions can trigger persistent coughing and throat irritation.' },
  ],
  fatigue: [
    { condition: 'Anemia', confidence: 0.7, urgency: 'moderate', description: 'Low red blood cell count reduces oxygen delivery, causing persistent tiredness.' },
    { condition: 'Hypothyroidism', confidence: 0.65, urgency: 'moderate', description: 'Underactive thyroid slows metabolism, leading to fatigue and sluggishness.' },
    { condition: 'Sleep Deprivation', confidence: 0.85, urgency: 'low', description: 'Most common cause — insufficient or poor quality sleep.' },
    { condition: 'Depression', confidence: 0.6, urgency: 'moderate', description: 'Mental health conditions often manifest as physical exhaustion.' },
    { condition: 'Diabetes', confidence: 0.5, urgency: 'moderate', description: 'High blood sugar can cause fatigue as cells cannot use glucose properly.' },
  ],
  'chest pain': [
    { condition: 'Muscle Strain', confidence: 0.6, urgency: 'low', description: 'Overuse or injury to chest muscles — common and not dangerous.' },
    { condition: 'Acid Reflux (GERD)', confidence: 0.65, urgency: 'low', description: 'Stomach acid backing up into esophagus can mimic heart pain.' },
    { condition: 'Anxiety / Panic Attack', confidence: 0.6, urgency: 'moderate', description: 'Anxiety can cause chest tightness and pain that feels like heart trouble.' },
    { condition: 'Angina / Heart Disease', confidence: 0.4, urgency: 'high', description: 'Reduced blood flow to heart. SEEK MEDICAL ATTENTION if severe or with arm pain.' },
  ],
  nausea: [
    { condition: 'Gastroenteritis', confidence: 0.8, urgency: 'low', description: 'Stomach flu — viral or bacterial infection of digestive tract.' },
    { condition: 'Food Poisoning', confidence: 0.75, urgency: 'moderate', description: 'Contaminated food causes rapid onset nausea, vomiting, and diarrhea.' },
    { condition: 'Motion Sickness', confidence: 0.7, urgency: 'low', description: 'Inner ear imbalance during travel causing nausea.' },
    { condition: 'Pregnancy', confidence: 0.5, urgency: 'low', description: 'Morning sickness is common in early pregnancy.' },
    { condition: 'Migraine', confidence: 0.55, urgency: 'moderate', description: 'Migraines often accompanied by significant nausea or vomiting.' },
  ],
  'sore throat': [
    { condition: 'Strep Throat', confidence: 0.75, urgency: 'moderate', description: 'Bacterial infection requiring antibiotics. Causes severe throat pain and fever.' },
    { condition: 'Viral Pharyngitis', confidence: 0.85, urgency: 'low', description: 'Most sore throats are viral — no antibiotics needed, resolves on own.' },
    { condition: 'Tonsillitis', confidence: 0.6, urgency: 'moderate', description: 'Inflammation of tonsils, often with white patches and difficulty swallowing.' },
    { condition: 'Allergies', confidence: 0.5, urgency: 'low', description: 'Post-nasal drip from allergies can irritate the throat.' },
  ],
  dizziness: [
    { condition: 'Vertigo (BPPV)', confidence: 0.75, urgency: 'low', description: 'Benign positional vertigo — crystals in inner ear cause spinning sensation.' },
    { condition: 'Dehydration', confidence: 0.7, urgency: 'low', description: 'Low fluid intake reduces blood volume, causing lightheadedness.' },
    { condition: 'Low Blood Pressure', confidence: 0.65, urgency: 'moderate', description: 'Standing up quickly causes blood to pool in legs, causing dizziness.' },
    { condition: 'Anemia', confidence: 0.55, urgency: 'moderate', description: 'Low red blood cells can cause dizziness due to reduced oxygen to brain.' },
    { condition: 'Inner Ear Infection', confidence: 0.6, urgency: 'moderate', description: 'Labyrinthitis or vestibular neuritis causes severe dizziness.' },
  ],
  rash: [
    { condition: 'Contact Dermatitis', confidence: 0.8, urgency: 'low', description: 'Allergic or irritant reaction to something touching the skin.' },
    { condition: 'Eczema (Atopic Dermatitis)', confidence: 0.7, urgency: 'low', description: 'Chronic skin condition causing itchy, inflamed patches.' },
    { condition: 'Psoriasis', confidence: 0.55, urgency: 'low', description: 'Autoimmune condition causing scaly, red skin plaques.' },
    { condition: 'Hives (Urticaria)', confidence: 0.65, urgency: 'moderate', description: 'Raised, itchy welts from allergic reaction — watch for throat swelling.' },
    { condition: 'Shingles', confidence: 0.4, urgency: 'high', description: 'Reactivation of chickenpox virus. Painful rash in a band pattern.' },
  ],
  'shortness of breath': [
    { condition: 'Asthma', confidence: 0.75, urgency: 'moderate', description: 'Airway inflammation and narrowing causing breathing difficulty.' },
    { condition: 'Anxiety / Panic Attack', confidence: 0.7, urgency: 'moderate', description: 'Anxiety causes rapid, shallow breathing that feels like shortness of breath.' },
    { condition: 'COPD', confidence: 0.5, urgency: 'high', description: 'Chronic obstructive pulmonary disease. Seek evaluation if persistent.' },
    { condition: 'Heart Failure', confidence: 0.35, urgency: 'high', description: 'Fluid buildup in lungs. SEEK IMMEDIATE CARE if sudden onset with chest pain.' },
    { condition: 'Anemia', confidence: 0.6, urgency: 'moderate', description: 'Low oxygen-carrying capacity leads to breathlessness on exertion.' },
  ],
};

// Normalize symptom input for matching
function normalizeSymptom(sym) {
  return sym.toLowerCase().trim()
    .replace(/\s+/g, ' ')
    .replace(/aches?/g, 'pain')
    .replace(/tired(ness)?/g, 'fatigue')
    .replace(/runny nose/g, 'congestion')
    .replace(/throwing up/g, 'nausea')
    .replace(/vomiting/g, 'nausea')
    .replace(/dizzy/g, 'dizziness')
    .replace(/breathless/g, 'shortness of breath')
    .replace(/hard to breathe/g, 'shortness of breath');
}

// Find matching conditions from symptom list
function analyzeSymptoms(symptoms) {
  const conditionMap = new Map();

  symptoms.forEach((rawSym) => {
    const sym = normalizeSymptom(rawSym);

    // Direct match
    let matches = SYMPTOM_CONDITIONS[sym];

    // Partial match if no direct match
    if (!matches) {
      const key = Object.keys(SYMPTOM_CONDITIONS).find(
        (k) => sym.includes(k) || k.includes(sym)
      );
      matches = key ? SYMPTOM_CONDITIONS[key] : [];
    }

    matches.forEach(({ condition, confidence, urgency, description }) => {
      if (conditionMap.has(condition)) {
        const existing = conditionMap.get(condition);
        // Boost confidence when multiple symptoms point to same condition
        conditionMap.set(condition, {
          ...existing,
          confidence: Math.min(0.97, existing.confidence + confidence * 0.3),
          matchedSymptoms: [...existing.matchedSymptoms, rawSym],
        });
      } else {
        conditionMap.set(condition, {
          condition,
          confidence,
          urgency,
          description,
          matchedSymptoms: [rawSym],
        });
      }
    });
  });

  return Array.from(conditionMap.values())
    .sort((a, b) => b.confidence - a.confidence)
    .slice(0, 6);
}

// POST /api/symptoms/analyze
// Body: { symptoms: ["fever", "cough", "fatigue"] }
router.post('/analyze', async (req, res) => {
  try {
    const { symptoms } = req.body;

    if (!symptoms || !Array.isArray(symptoms) || symptoms.length === 0) {
      return res.status(400).json({ error: 'Please provide an array of symptoms' });
    }

    if (symptoms.length > 10) {
      return res.status(400).json({ error: 'Maximum 10 symptoms allowed per analysis' });
    }

    const cleaned = symptoms.map((s) => String(s).trim()).filter((s) => s.length > 1);
    if (cleaned.length === 0) {
      return res.status(400).json({ error: 'No valid symptoms provided' });
    }

    const results = analyzeSymptoms(cleaned);
    const hasHighUrgency = results.some((r) => r.urgency === 'high');

    res.json({
      symptoms: cleaned,
      conditions: results,
      disclaimer: 'This analysis is for informational purposes only and does not constitute medical advice. Always consult a qualified healthcare professional for diagnosis and treatment.',
      emergencyWarning: hasHighUrgency
        ? 'One or more possible conditions flagged as high urgency. If symptoms are severe, seek immediate medical attention or call 911.'
        : null,
      analyzedAt: new Date().toISOString(),
    });
  } catch (err) {
    console.error('Symptom analysis error:', err);
    res.status(500).json({ error: 'Analysis failed. Please try again.' });
  }
});

// GET /api/symptoms/list
// Returns all known symptoms in the knowledge base
router.get('/list', (req, res) => {
  res.json({
    symptoms: Object.keys(SYMPTOM_CONDITIONS),
    total: Object.keys(SYMPTOM_CONDITIONS).length,
  });
});

module.exports = router;
