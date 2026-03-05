# 🫀 HealthPulse AI

> AI-powered medical information platform — symptom analysis, FDA drug lookup, global disease statistics, and real-time drug recalls.

[![Node.js](https://img.shields.io/badge/Node.js-339933?style=flat-square&logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-61DAFB?style=flat-square&logo=react&logoColor=black)](https://reactjs.org/)
[![Express](https://img.shields.io/badge/Express.js-000000?style=flat-square&logo=express&logoColor=white)](https://expressjs.com/)
[![OpenFDA](https://img.shields.io/badge/OpenFDA-005EA2?style=flat-square)](https://open.fda.gov/)
[![Docker](https://img.shields.io/badge/Docker-2496ED?style=flat-square&logo=docker&logoColor=white)](https://docker.com/)

---

## 🚀 Features

| Feature | Description |
|---|---|
| **AI Symptom Checker** | Enter symptoms → NLP analysis → ranked conditions with urgency & confidence scores |
| **FDA Drug Lookup** | Search 20,000+ drugs from FDA label database with full prescribing information |
| **Disease Statistics Dashboard** | Live global COVID-19 stats, country breakdowns, and historical charts via Disease.sh |
| **FDA Drug Recalls** | Real-time enforcement actions from FDA (Class I, II, III classifications) |
| **Adverse Events** | FDA FAERS database integration — top reported reactions per drug |

---

## 🛠 Tech Stack

**Frontend**
- React 18 + Vite
- Tailwind CSS
- Chart.js + react-chartjs-2
- React Router v6

**Backend**
- Node.js + Express
- In-memory caching (node-cache)
- Rate limiting (express-rate-limit)

**External APIs (all free, no key required)**
- [OpenFDA API](https://open.fda.gov/apis/) — Drug labels, adverse events, enforcement
- [Disease.sh API](https://disease.sh/) — COVID-19 global & country statistics
- [FDA FAERS](https://open.fda.gov/data/faers/) — Adverse event reporting system

**DevOps**
- Docker + docker-compose
- nginx (static file serving + API proxy)

---

## 🏗 Architecture

```
healthpulse-ai/
├── frontend/               # React + Vite + Tailwind
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Home.jsx
│   │   │   ├── SymptomChecker.jsx
│   │   │   ├── DrugLookup.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   └── Recalls.jsx
│   │   ├── components/
│   │   │   ├── Navbar.jsx
│   │   │   └── Footer.jsx
│   │   └── App.jsx
│   └── Dockerfile
├── backend/                # Node.js + Express
│   ├── routes/
│   │   ├── drugs.js        # OpenFDA drug label + events + recalls
│   │   ├── symptoms.js     # NLP symptom analysis engine
│   │   ├── stats.js        # Disease.sh + FDA FAERS stats
│   │   └── health.js       # Server health check
│   ├── server.js
│   └── Dockerfile
└── docker-compose.yml
```

---

## ⚡ Quick Start

### Option 1 — Docker (Recommended)

```bash
git clone https://github.com/saijosyula/healthpulse-ai.git
cd healthpulse-ai
docker-compose up --build
```

Visit: `http://localhost:5173`

### Option 2 — Local Development

**Backend:**
```bash
cd backend
cp .env.example .env
npm install
npm run dev          # Starts on http://localhost:5000
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev          # Starts on http://localhost:5173
```

---

## 🔌 API Reference

All endpoints are prefixed with `/api`.

### Drugs
| Endpoint | Description |
|---|---|
| `GET /api/drugs/search?q=aspirin` | Search drugs by brand/generic name |
| `GET /api/drugs/:name/details` | Full label info for a drug |
| `GET /api/drugs/:name/adverse-events` | FDA FAERS adverse event reports |
| `GET /api/drugs/recalls/recent` | Latest FDA drug recalls |

### Symptoms
| Endpoint | Description |
|---|---|
| `POST /api/symptoms/analyze` | Analyze symptoms → possible conditions |
| `GET /api/symptoms/list` | List all known symptoms |

### Statistics
| Endpoint | Description |
|---|---|
| `GET /api/stats/covid/global` | Global COVID-19 statistics |
| `GET /api/stats/covid/countries` | Per-country breakdown |
| `GET /api/stats/covid/historical?days=30` | Historical case timeline |
| `GET /api/stats/fda/drug-events?term=aspirin` | Top adverse reactions for a drug |

---

## 💡 How the Symptom Analysis Works

The AI symptom engine uses a multi-signal approach:

1. **Normalization** — synonyms and colloquialisms are mapped to canonical terms
2. **Knowledge Base Matching** — symptoms are matched against a curated medical knowledge base derived from Mayo Clinic and CDC guidelines
3. **Multi-symptom Boosting** — when multiple symptoms point to the same condition, confidence increases
4. **Urgency Scoring** — conditions are tagged low / moderate / high urgency to flag emergencies

> ⚠️ This is a rule-based NLP system for educational purposes. It is not a medical diagnostic tool.

---

## ⚠️ Disclaimer

HealthPulse AI is for **educational and informational purposes only**. It does not provide medical advice, diagnosis, or treatment. Always consult a qualified healthcare professional.

---

## 👨‍💻 Built By

**Sai Josyula** — CS Senior @ University of Arizona

[![LinkedIn](https://img.shields.io/badge/LinkedIn-saijosyula-0077B5?style=flat-square&logo=linkedin)](https://linkedin.com/in/saijosyula)
[![GitHub](https://img.shields.io/badge/GitHub-saijosyula-181717?style=flat-square&logo=github)](https://github.com/saijosyula)
