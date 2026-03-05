import { Link } from 'react-router-dom';

const FEATURES = [
  {
    icon: '🔍',
    title: 'Symptom Checker',
    description:
      'Enter your symptoms and our AI analyzes them against a medical knowledge base to suggest possible conditions — with urgency levels and descriptions.',
    href: '/symptom-checker',
    cta: 'Check Symptoms',
    color: 'blue',
  },
  {
    icon: '💊',
    title: 'Drug Information',
    description:
      'Search any medication in the FDA drug database. Get label information, warnings, dosage, interactions, and adverse event reports.',
    href: '/drug-lookup',
    cta: 'Search Drugs',
    color: 'emerald',
  },
  {
    icon: '📊',
    title: 'Disease Statistics',
    description:
      'Live global health statistics dashboard with interactive charts — COVID-19 cases, vaccination rates, and country breakdowns.',
    href: '/dashboard',
    cta: 'View Dashboard',
    color: 'violet',
  },
  {
    icon: '⚠️',
    title: 'FDA Drug Recalls',
    description:
      'Stay informed with the latest FDA drug recall notices — including classification, reason, and distribution patterns.',
    href: '/recalls',
    cta: 'View Recalls',
    color: 'amber',
  },
];

const STATS = [
  { value: '20,000+', label: 'FDA Drug Labels', icon: '💊' },
  { value: '10M+', label: 'Adverse Event Reports', icon: '📋' },
  { value: '200+', label: 'Countries Tracked', icon: '🌍' },
  { value: 'Real-time', label: 'Data Updates', icon: '⚡' },
];

export default function Home() {
  return (
    <div>
      {/* Hero */}
      <section className="relative bg-gradient-to-br from-blue-700 via-blue-600 to-indigo-700 text-white overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-72 h-72 bg-white rounded-full blur-3xl" />
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-blue-300 rounded-full blur-3xl" />
        </div>
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 py-20 text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-2 text-sm font-medium mb-8">
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
            Live data from OpenFDA &amp; Disease.sh
          </div>
          <h1 className="text-4xl sm:text-6xl font-bold mb-6 leading-tight">
            AI-Powered Health
            <br />
            <span className="text-blue-200">Information Platform</span>
          </h1>
          <p className="text-lg sm:text-xl text-blue-100 max-w-2xl mx-auto mb-10 leading-relaxed">
            Understand your symptoms, look up medications from the FDA database, and track global
            disease statistics — all powered by real public health APIs.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/symptom-checker" className="btn-primary bg-white text-blue-700 hover:bg-blue-50 text-base px-8 py-3">
              Check Your Symptoms →
            </Link>
            <Link to="/drug-lookup" className="btn-secondary bg-white/10 border-white/30 text-white hover:bg-white/20 text-base px-8 py-3">
              Search Drug Database
            </Link>
          </div>
        </div>
      </section>

      {/* Stats bar */}
      <section className="bg-white border-b border-slate-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {STATS.map(({ value, label, icon }) => (
              <div key={label}>
                <div className="text-2xl mb-1">{icon}</div>
                <div className="text-2xl font-bold text-slate-800">{value}</div>
                <div className="text-sm text-slate-500">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Feature cards */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-slate-800 mb-3">Everything You Need</h2>
          <p className="text-slate-500 max-w-xl mx-auto">
            Four powerful tools backed by real government health data — no accounts, no paywalls.
          </p>
        </div>
        <div className="grid sm:grid-cols-2 gap-6">
          {FEATURES.map(({ icon, title, description, href, cta }) => (
            <div key={title} className="card hover:shadow-md transition-shadow group">
              <div className="text-3xl mb-4">{icon}</div>
              <h3 className="text-lg font-semibold text-slate-800 mb-2">{title}</h3>
              <p className="text-slate-500 text-sm leading-relaxed mb-5">{description}</p>
              <Link
                to={href}
                className="text-blue-600 font-medium text-sm hover:text-blue-800 transition-colors group-hover:underline"
              >
                {cta} →
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* Disclaimer */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 pb-16">
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 text-center">
          <p className="text-amber-800 text-sm font-medium">
            ⚠️ <strong>Medical Disclaimer:</strong> HealthPulse AI provides general health information
            for educational purposes only. It is not a substitute for professional medical diagnosis,
            advice, or treatment. Always consult a qualified healthcare provider for medical concerns.
          </p>
        </div>
      </section>
    </div>
  );
}
