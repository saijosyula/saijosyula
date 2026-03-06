# HealthPulse AI

Search symptoms, look up FDA drug info, check drug recalls, and see global disease stats — all pulling from real government APIs.

**[→ Live Demo](https://saijosyulafront.onrender.com/)**

Built this as a portfolio project to get comfortable with full-stack development and working with external APIs. Ended up being a lot more interesting than I expected once I started digging into what the FDA actually makes publicly available.

[![Node.js](https://img.shields.io/badge/Node.js-339933?style=flat-square&logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-61DAFB?style=flat-square&logo=react&logoColor=black)](https://reactjs.org/)
[![Express](https://img.shields.io/badge/Express.js-000000?style=flat-square&logo=express&logoColor=white)](https://expressjs.com/)
[![OpenFDA](https://img.shields.io/badge/OpenFDA-005EA2?style=flat-square)](https://open.fda.gov/)
[![Docker](https://img.shields.io/badge/Docker-2496ED?style=flat-square&logo=docker&logoColor=white)](https://docker.com/)

---

## Features

**Symptom Checker** — type in symptoms, get back a list of possible conditions with confidence scores and urgency levels. The matching logic is something I wrote myself (not a third-party AI service) — it maps synonyms, matches against a medical knowledge base, and weights results when multiple symptoms point to the same condition.

**Drug Lookup** — search any medication and pull its full FDA label. Dosage, warnings, interactions, and actual adverse event reports that patients have filed with the FDA.

**Disease Dashboard** — COVID-19 stats by country with charts. You can filter the historical view from 14 to 90 days.

**Drug Recalls** — current FDA recall notices sorted by severity class (Class I is the serious ones).

---

## How It Works

The frontend is React. When you search for something, it hits my Express backend, which calls the relevant government API, cleans up the response, and returns just what the UI needs. I added caching so repeated searches don't keep hammering the free APIs.

```
browser → React frontend → my Express backend → OpenFDA / Disease.sh API
                                              ← cleaned-up JSON back
```

No API keys required for any of this — OpenFDA and Disease.sh are both fully public.

---

## Stack

- **Frontend:** React + Vite, Tailwind CSS, Chart.js
- **Backend:** Node.js + Express, node-cache for response caching
- **Data:** OpenFDA API, Disease.sh
- **Deployment:** Docker + docker-compose

---

## Project Structure

```
healthpulse-ai/
├── frontend/src/
│   ├── pages/
│   │   ├── Home.jsx
│   │   ├── SymptomChecker.jsx
│   │   ├── DrugLookup.jsx
│   │   ├── Dashboard.jsx
│   │   └── Recalls.jsx
│   └── components/
│       ├── Navbar.jsx
│       └── Footer.jsx
├── backend/routes/
│   ├── drugs.js        # OpenFDA drug labels + adverse events + recalls
│   ├── symptoms.js     # symptom matching logic
│   ├── stats.js        # Disease.sh + FDA FAERS
│   └── health.js       # health check endpoint
└── docker-compose.yml
```

---

## API Endpoints

| Endpoint | Description |
|---|---|
| `GET /api/drugs/search?q=aspirin` | Search FDA drug database |
| `GET /api/drugs/:name/details` | Full drug label |
| `GET /api/drugs/:name/adverse-events` | Patient-reported side effects |
| `GET /api/drugs/recalls/recent` | Recent FDA recalls |
| `POST /api/symptoms/analyze` | Analyze symptoms |
| `GET /api/stats/covid/global` | Global COVID totals |
| `GET /api/stats/covid/countries` | By country |
| `GET /api/stats/covid/historical?days=30` | Historical data for charts |

---

## Disclaimer

This is for informational purposes only — not medical advice. Talk to a doctor.

---

## About

Sai Josyula — CS senior at University of Arizona, graduating May 2026.

[![LinkedIn](https://img.shields.io/badge/LinkedIn-saijosyula-0077B5?style=flat-square&logo=linkedin)](https://linkedin.com/in/saijosyula)
[![GitHub](https://img.shields.io/badge/GitHub-saijosyula-181717?style=flat-square&logo=github)](https://github.com/saijosyula)
