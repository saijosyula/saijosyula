# 🫀 HealthPulse AI

A full-stack web app that lets you look up symptoms, search the FDA drug database, track global disease statistics, and view real drug recall alerts — all in one place, powered by real government health data.

[![Node.js](https://img.shields.io/badge/Node.js-339933?style=flat-square&logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-61DAFB?style=flat-square&logo=react&logoColor=black)](https://reactjs.org/)
[![Express](https://img.shields.io/badge/Express.js-000000?style=flat-square&logo=express&logoColor=white)](https://expressjs.com/)
[![OpenFDA](https://img.shields.io/badge/OpenFDA-005EA2?style=flat-square)](https://open.fda.gov/)
[![Docker](https://img.shields.io/badge/Docker-2496ED?style=flat-square&logo=docker&logoColor=white)](https://docker.com/)

---

## Why I Built This

I've always been interested in how AI and software can make health information more accessible. Most medical websites are either paywalled, overwhelming, or just not built well. I wanted to build something that pulls from real, trusted government sources (the FDA and WHO-backed APIs) and presents that data in a clean, usable way.

This project also let me explore building a proper full-stack app from scratch — handling API calls, caching responses, building a clean UI, and containerizing everything with Docker.

---

## What It Does

### 🔍 Symptom Checker
Type in your symptoms (like "fever, headache, fatigue") and the app analyzes them against a medical knowledge base to suggest possible conditions. Each result shows a confidence percentage, urgency level (Low / Moderate / High), and a plain-English description. If something looks serious, it shows a warning to seek medical attention.

### 💊 Drug Lookup
Search any medication by name and pull its full FDA-approved label — including what it's used for, dosage instructions, warnings, drug interactions, and real adverse event reports filed by patients with the FDA.

### 📊 Disease Statistics Dashboard
Live global health data with interactive charts. See total COVID-19 cases, deaths, and recoveries by country, plus a historical timeline you can filter from 14 to 90 days.

### ⚠️ FDA Drug Recalls
The latest drug recall notices straight from the FDA — filtered by severity class (Class I is most serious, Class III is least). Updated automatically via the OpenFDA API.

---

## How It Works (Simple Version)

The app has two main parts:

**Frontend** — what you see in the browser. Built with React. When you type in a symptom or drug name, it sends a request to my backend.

**Backend** — a Node.js server that acts as a middleman. It takes your request, calls the appropriate free government API (OpenFDA or Disease.sh), cleans up the response, and sends back only the data the frontend needs. It also caches results so we don't hammer the free APIs with repeat requests.

```
You (browser)
    ↓  type "aspirin"
React frontend
    ↓  GET /api/drugs/search?q=aspirin
Node.js + Express backend
    ↓  fetch from api.fda.gov
OpenFDA (free FDA API)
    ↓  returns raw drug data
Backend cleans it up
    ↓  sends back clean JSON
Frontend displays results
```

The symptom checker doesn't call an external API — I built that logic myself. It normalizes what you type (so "dizzy" maps to "dizziness"), matches against a knowledge base I put together from Mayo Clinic and CDC references, and boosts confidence scores when multiple symptoms point to the same condition.

---

## Tech Stack

| Layer | What I Used | Why |
|---|---|---|
| Frontend | React + Vite + Tailwind CSS | Fast dev experience, clean styling without a lot of custom CSS |
| Backend | Node.js + Express | Familiar, great for building REST APIs quickly |
| Charts | Chart.js + react-chartjs-2 | Best free charting library for React |
| Caching | node-cache (in-memory) | Avoids hitting the free APIs repeatedly for the same data |
| Data | OpenFDA API + Disease.sh | Both completely free, no API key needed, real government data |
| Containers | Docker + docker-compose | Makes it easy for anyone to run locally with one command |

---

## Running It Locally

You need **Node.js** (v18+) and **npm** installed. That's it — no paid services, no API keys.

### Option 1 — Run with Docker (easiest)

```bash
git clone https://github.com/saijosyula/healthpulse-ai.git
cd healthpulse-ai
docker-compose up --build
```

Then open `http://localhost:5173` in your browser.

### Option 2 — Run without Docker

Open two terminal windows:

**Terminal 1 — Backend:**
```bash
cd healthpulse-ai/backend
cp .env.example .env
npm install
npm run dev
```

**Terminal 2 — Frontend:**
```bash
cd healthpulse-ai/frontend
npm install
npm run dev
```

Then open `http://localhost:5173`.

---

## Project Structure

```
healthpulse-ai/
│
├── frontend/                  ← React app (what users see)
│   └── src/
│       ├── pages/
│       │   ├── Home.jsx           ← landing page
│       │   ├── SymptomChecker.jsx ← symptom input + results
│       │   ├── DrugLookup.jsx     ← FDA drug search
│       │   ├── Dashboard.jsx      ← charts + stats
│       │   └── Recalls.jsx        ← FDA recall alerts
│       └── components/
│           ├── Navbar.jsx
│           └── Footer.jsx
│
├── backend/                   ← Node.js API server
│   └── routes/
│       ├── drugs.js           ← talks to OpenFDA drug API
│       ├── symptoms.js        ← symptom analysis logic
│       ├── stats.js           ← talks to Disease.sh + FDA FAERS
│       └── health.js          ← server status check
│
└── docker-compose.yml         ← runs both frontend + backend together
```

---

## API Endpoints

These are the routes my backend exposes. The frontend calls these — they never touch the external APIs directly.

| Method | Endpoint | What it does |
|---|---|---|
| GET | `/api/drugs/search?q=aspirin` | Search FDA drug database |
| GET | `/api/drugs/:name/details` | Full label for a specific drug |
| GET | `/api/drugs/:name/adverse-events` | Patient-reported side effects from FDA |
| GET | `/api/drugs/recalls/recent` | Latest FDA drug recalls |
| POST | `/api/symptoms/analyze` | Analyze symptoms, get possible conditions |
| GET | `/api/stats/covid/global` | Global COVID totals |
| GET | `/api/stats/covid/countries` | Stats by country |
| GET | `/api/stats/covid/historical?days=30` | Case history for charts |

---

## Data Sources

All data is free and from official sources:

- **[OpenFDA](https://open.fda.gov/)** — The FDA's public API. Covers drug labels, adverse event reports (FAERS), and enforcement/recall actions.
- **[Disease.sh](https://disease.sh/)** — Open-source disease statistics API. Pulls from WHO, Johns Hopkins, and other official sources.

No API keys needed. No sign-ups. No cost.

---

## Disclaimer

This app is for **educational and informational purposes only**. It is not a substitute for professional medical advice, diagnosis, or treatment. Always talk to a real doctor if you have health concerns.

---

## About Me

I'm Sai Josyula, a CS senior at the University of Arizona graduating in May 2026. I'm interested in backend development, cloud infrastructure, and AI applications — especially in healthcare.

[![LinkedIn](https://img.shields.io/badge/LinkedIn-saijosyula-0077B5?style=flat-square&logo=linkedin)](https://linkedin.com/in/saijosyula)
[![GitHub](https://img.shields.io/badge/GitHub-saijosyula-181717?style=flat-square&logo=github)](https://github.com/saijosyula)
[![Email](https://img.shields.io/badge/Email-saijosyula@arizona.edu-D14836?style=flat-square&logo=gmail)](mailto:saijosyula@arizona.edu)
