import { useState, useEffect } from 'react';
import api from '../lib/api';

const CLASS_CONFIG = {
  'Class I': {
    label: 'Class I',
    desc: 'Most serious — health consequences are probable',
    className: 'bg-red-50 text-red-700 border-red-200',
    dot: 'bg-red-500',
  },
  'Class II': {
    label: 'Class II',
    desc: 'May cause temporary adverse health consequences',
    className: 'bg-amber-50 text-amber-700 border-amber-200',
    dot: 'bg-amber-500',
  },
  'Class III': {
    label: 'Class III',
    desc: 'Unlikely to cause adverse health consequences',
    className: 'bg-green-50 text-green-700 border-green-200',
    dot: 'bg-green-500',
  },
};

function RecallCard({ recall }) {
  const [expanded, setExpanded] = useState(false);
  const cls = CLASS_CONFIG[recall.classification] || CLASS_CONFIG['Class III'];

  return (
    <div className={`border rounded-xl p-5 ${cls.className}`}>
      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="flex items-center gap-2">
          <span className={`w-2.5 h-2.5 rounded-full ${cls.dot} shrink-0 mt-1`} />
          <span className="text-xs font-semibold uppercase tracking-wide opacity-70">{recall.classification}</span>
        </div>
        <span className="text-xs opacity-60 whitespace-nowrap">{recall.reportDate}</span>
      </div>

      <h3 className="font-semibold text-sm mb-1 leading-snug">
        {recall.productDescription}
      </h3>
      <p className="text-xs opacity-70 mb-1">{recall.recallingFirm}</p>

      <p className="text-xs mt-2 leading-relaxed">
        <strong>Reason:</strong> {recall.reason}
      </p>

      {expanded && recall.distributionPattern && (
        <p className="text-xs mt-2 leading-relaxed opacity-80">
          <strong>Distribution:</strong> {recall.distributionPattern}
        </p>
      )}

      <div className="flex items-center justify-between mt-3">
        <span className="text-xs opacity-60">#{recall.recallNumber} · Status: {recall.status}</span>
        {recall.distributionPattern && (
          <button
            onClick={() => setExpanded(!expanded)}
            className="text-xs underline opacity-70 hover:opacity-100"
          >
            {expanded ? 'Less' : 'More info'}
          </button>
        )}
      </div>
    </div>
  );
}

export default function Recalls() {
  const [recalls, setRecalls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      try {
        const { data } = await api.get('/api/drugs/recalls/recent?limit=20');
        setRecalls(data.recalls || []);
      } catch (err) {
        setError('Failed to load recall data. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  const filtered = filter === 'all' ? recalls : recalls.filter((r) => r.classification === filter);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-800 mb-2">FDA Drug Recalls</h1>
        <p className="text-slate-500">
          Latest drug recall enforcement actions from the{' '}
          <strong>FDA Enforcement Report</strong>, updated automatically via OpenFDA.
        </p>
      </div>

      {/* Classification guide */}
      <div className="grid sm:grid-cols-3 gap-4 mb-6">
        {Object.values(CLASS_CONFIG).map((c) => (
          <div key={c.label} className={`border rounded-xl p-4 ${c.className}`}>
            <p className="font-semibold text-sm">{c.label}</p>
            <p className="text-xs opacity-75 mt-1">{c.desc}</p>
          </div>
        ))}
      </div>

      {/* Filter buttons */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {['all', 'Class I', 'Class II', 'Class III'].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`text-sm px-4 py-2 rounded-lg transition-colors font-medium ${
              filter === f
                ? 'bg-blue-600 text-white'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            {f === 'all' ? 'All Classes' : f}
          </button>
        ))}
        <span className="ml-auto text-sm text-slate-400 self-center">
          {filtered.length} recalls shown
        </span>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-4 mb-6 text-sm">
          {error}
        </div>
      )}

      {loading ? (
        <div className="text-center py-16">
          <span className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin inline-block mb-4" />
          <p className="text-slate-500">Loading FDA recall data...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="card text-center py-12 text-slate-400">
          <div className="text-4xl mb-3">✅</div>
          <p>No recalls found for this classification.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((recall, i) => (
            <RecallCard key={i} recall={recall} />
          ))}
        </div>
      )}

      <p className="mt-8 text-xs text-center text-slate-400">
        Data sourced from OpenFDA Drug Enforcement API. Always verify at{' '}
        <a
          href="https://www.fda.gov/safety/recalls-market-withdrawals-safety-alerts"
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-500 hover:underline"
        >
          FDA.gov
        </a>
      </p>
    </div>
  );
}
