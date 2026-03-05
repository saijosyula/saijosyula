import { useState } from 'react';
import axios from 'axios';

const SUGGESTED_SYMPTOMS = [
  'fever', 'headache', 'cough', 'fatigue', 'sore throat',
  'nausea', 'dizziness', 'rash', 'chest pain', 'shortness of breath',
];

const URGENCY_CONFIG = {
  low: { label: 'Low Urgency', className: 'badge-low', icon: '✅' },
  moderate: { label: 'Moderate', className: 'badge-moderate', icon: '⚠️' },
  high: { label: 'High Urgency', className: 'badge-high', icon: '🚨' },
};

function ConfidenceBar({ confidence }) {
  const pct = Math.round(confidence * 100);
  const color = pct >= 75 ? 'bg-blue-500' : pct >= 50 ? 'bg-yellow-400' : 'bg-slate-300';
  return (
    <div className="flex items-center gap-2 mt-2">
      <div className="flex-1 bg-slate-100 rounded-full h-1.5 overflow-hidden">
        <div className={`${color} h-full rounded-full transition-all`} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-xs font-medium text-slate-500 w-10 text-right">{pct}%</span>
    </div>
  );
}

export default function SymptomChecker() {
  const [input, setInput] = useState('');
  const [symptoms, setSymptoms] = useState([]);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const addSymptom = (sym) => {
    const trimmed = sym.trim().toLowerCase();
    if (trimmed && !symptoms.includes(trimmed) && symptoms.length < 10) {
      setSymptoms((prev) => [...prev, trimmed]);
    }
    setInput('');
  };

  const removeSymptom = (sym) => {
    setSymptoms((prev) => prev.filter((s) => s !== sym));
    setResult(null);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      if (input.trim()) addSymptom(input);
    }
  };

  const analyze = async () => {
    if (symptoms.length === 0) return;
    setLoading(true);
    setError('');
    setResult(null);
    try {
      const { data } = await axios.post('/api/symptoms/analyze', { symptoms });
      setResult(data);
    } catch (err) {
      setError(err.response?.data?.error || 'Analysis failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setSymptoms([]);
    setResult(null);
    setError('');
    setInput('');
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-800 mb-2">AI Symptom Checker</h1>
        <p className="text-slate-500">
          Enter your symptoms below and our AI will analyze them to suggest possible conditions with
          confidence levels and urgency ratings.
        </p>
      </div>

      {/* Input section */}
      <div className="card mb-6">
        <label className="block text-sm font-semibold text-slate-700 mb-3">
          Your Symptoms <span className="font-normal text-slate-400">({symptoms.length}/10)</span>
        </label>

        {/* Symptom tags */}
        {symptoms.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-3">
            {symptoms.map((sym) => (
              <span
                key={sym}
                className="inline-flex items-center gap-1.5 bg-blue-50 text-blue-700 border border-blue-200 px-3 py-1 rounded-full text-sm font-medium"
              >
                {sym}
                <button
                  onClick={() => removeSymptom(sym)}
                  className="text-blue-400 hover:text-blue-700 transition-colors leading-none"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        )}

        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a symptom and press Enter..."
            className="input-field"
            disabled={symptoms.length >= 10}
          />
          <button
            onClick={() => input.trim() && addSymptom(input)}
            disabled={!input.trim() || symptoms.length >= 10}
            className="btn-secondary whitespace-nowrap"
          >
            Add
          </button>
        </div>
        <p className="text-xs text-slate-400 mt-2">Press Enter or comma to add each symptom</p>

        {/* Quick suggestions */}
        <div className="mt-4">
          <p className="text-xs text-slate-500 mb-2 font-medium">Common symptoms:</p>
          <div className="flex flex-wrap gap-2">
            {SUGGESTED_SYMPTOMS.filter((s) => !symptoms.includes(s)).map((sym) => (
              <button
                key={sym}
                onClick={() => addSymptom(sym)}
                className="text-xs px-3 py-1 rounded-full border border-slate-200 text-slate-600 hover:border-blue-400 hover:text-blue-700 hover:bg-blue-50 transition-colors"
              >
                + {sym}
              </button>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 mt-5">
          <button
            onClick={analyze}
            disabled={symptoms.length === 0 || loading}
            className="btn-primary"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Analyzing...
              </span>
            ) : (
              'Analyze Symptoms'
            )}
          </button>
          {symptoms.length > 0 && (
            <button onClick={reset} className="btn-secondary">
              Clear All
            </button>
          )}
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-4 mb-6 text-sm">
          {error}
        </div>
      )}

      {/* Results */}
      {result && (
        <div>
          {/* Emergency warning */}
          {result.emergencyWarning && (
            <div className="bg-red-50 border border-red-300 rounded-xl p-5 mb-6 flex gap-3">
              <span className="text-2xl">🚨</span>
              <div>
                <p className="font-semibold text-red-800">Emergency Warning</p>
                <p className="text-sm text-red-700 mt-1">{result.emergencyWarning}</p>
              </div>
            </div>
          )}

          <div className="card">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-slate-800">Analysis Results</h2>
              <span className="text-xs text-slate-400">
                {result.conditions.length} possible conditions
              </span>
            </div>

            <div className="space-y-4">
              {result.conditions.map((cond, i) => {
                const urgency = URGENCY_CONFIG[cond.urgency] || URGENCY_CONFIG.low;
                return (
                  <div
                    key={cond.condition}
                    className="border border-slate-100 rounded-xl p-4 hover:border-blue-100 hover:bg-slate-50/50 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-3 mb-1">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 bg-blue-100 text-blue-700 rounded-full text-xs flex items-center justify-center font-bold">
                          {i + 1}
                        </span>
                        <h3 className="font-semibold text-slate-800">{cond.condition}</h3>
                      </div>
                      <span className={urgency.className}>
                        {urgency.icon} {urgency.label}
                      </span>
                    </div>
                    <p className="text-sm text-slate-500 mt-2 leading-relaxed">{cond.description}</p>
                    <ConfidenceBar confidence={cond.confidence} />
                    <div className="mt-2 flex flex-wrap gap-1">
                      {cond.matchedSymptoms.map((s) => (
                        <span key={s} className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-5 p-4 bg-blue-50 rounded-lg border border-blue-100">
              <p className="text-xs text-blue-700 leading-relaxed">
                <strong>Disclaimer:</strong> {result.disclaimer}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
