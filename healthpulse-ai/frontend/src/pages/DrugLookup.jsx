import { useState } from 'react';
import axios from 'axios';

function DrugCard({ drug, onSelect }) {
  return (
    <div
      onClick={() => onSelect(drug)}
      className="card cursor-pointer hover:border-blue-200 hover:shadow-md transition-all border border-slate-100"
    >
      <div className="flex justify-between items-start gap-3">
        <div className="flex-1">
          <h3 className="font-semibold text-slate-800 text-base">{drug.brandName}</h3>
          {drug.genericName !== drug.brandName && (
            <p className="text-sm text-slate-500 mt-0.5">Generic: {drug.genericName}</p>
          )}
          {drug.drugClass && (
            <span className="inline-block mt-2 text-xs bg-purple-50 text-purple-700 border border-purple-100 px-2 py-0.5 rounded-full">
              {drug.drugClass}
            </span>
          )}
        </div>
        <span className="text-xs text-slate-400 whitespace-nowrap">{drug.manufacturer}</span>
      </div>
      {drug.purpose && (
        <p className="text-sm text-slate-500 mt-3 line-clamp-2 leading-relaxed">{drug.purpose}</p>
      )}
      <p className="text-xs text-blue-600 mt-3 font-medium">Click to view full details →</p>
    </div>
  );
}

function DrugDetail({ drug, onClose }) {
  const [adverseEvents, setAdverseEvents] = useState(null);
  const [loadingEvents, setLoadingEvents] = useState(false);

  const loadAdverseEvents = async () => {
    setLoadingEvents(true);
    try {
      const { data } = await axios.get(`/api/drugs/${encodeURIComponent(drug.brandName)}/adverse-events?limit=5`);
      setAdverseEvents(data);
    } catch {
      setAdverseEvents({ events: [], total: 0 });
    } finally {
      setLoadingEvents(false);
    }
  };

  const Section = ({ title, items, icon }) => {
    if (!items || items.length === 0) return null;
    const text = items.join(' ').trim();
    if (!text) return null;
    return (
      <div className="border-t border-slate-100 pt-4">
        <h4 className="font-semibold text-slate-700 mb-2 flex items-center gap-2">
          <span>{icon}</span> {title}
        </h4>
        <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap">{text.slice(0, 800)}{text.length > 800 ? '...' : ''}</p>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-start justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full my-8">
        <div className="flex items-center justify-between p-6 border-b border-slate-100">
          <div>
            <h2 className="text-xl font-bold text-slate-800">{drug.brandName}</h2>
            <p className="text-sm text-slate-500 mt-0.5">{drug.genericName}</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700 text-2xl leading-none">×</button>
        </div>

        <div className="p-6 space-y-4">
          {drug.manufacturer && (
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <span>🏭</span> <span>{drug.manufacturer}</span>
            </div>
          )}
          {drug.drugClass && drug.drugClass.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {drug.drugClass.map((dc) => (
                <span key={dc} className="text-xs bg-purple-50 text-purple-700 border border-purple-100 px-2.5 py-1 rounded-full">{dc}</span>
              ))}
            </div>
          )}

          <Section title="Purpose / Uses" items={drug.purpose} icon="🎯" />
          <Section title="Indications" items={drug.indications} icon="📋" />
          <Section title="Dosage" items={drug.dosage} icon="💉" />
          <Section title="Warnings" items={drug.warnings} icon="⚠️" />
          <Section title="Contraindications" items={drug.contraindications} icon="🚫" />
          <Section title="Adverse Reactions" items={drug.adverseReactions} icon="⚡" />
          <Section title="Drug Interactions" items={drug.drugInteractions} icon="🔄" />
          <Section title="Pregnancy Warning" items={drug.pregnancyWarning} icon="🤰" />
          <Section title="Storage" items={drug.storage} icon="🗃️" />

          {/* FDA Adverse Events */}
          <div className="border-t border-slate-100 pt-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-semibold text-slate-700">FDA Adverse Event Reports</h4>
              {!adverseEvents && (
                <button
                  onClick={loadAdverseEvents}
                  disabled={loadingEvents}
                  className="text-xs btn-secondary py-1.5 px-3"
                >
                  {loadingEvents ? 'Loading...' : 'Load Reports'}
                </button>
              )}
            </div>
            {adverseEvents && (
              adverseEvents.events.length === 0 ? (
                <p className="text-sm text-slate-400">No adverse event reports found for this drug.</p>
              ) : (
                <div className="space-y-3">
                  <p className="text-xs text-slate-400">{adverseEvents.total.toLocaleString()} total reports in FDA FAERS database</p>
                  {adverseEvents.events.map((ev, i) => (
                    <div key={i} className="bg-slate-50 rounded-lg p-3 text-sm">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`w-2 h-2 rounded-full ${ev.serious ? 'bg-red-400' : 'bg-green-400'}`} />
                        <span className="text-slate-500 text-xs">{ev.date} · {ev.country || 'Unknown country'}</span>
                        {ev.seriousnessReason.length > 0 && (
                          <span className="text-xs text-red-600 font-medium">{ev.seriousnessReason.join(', ')}</span>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {ev.reactions.slice(0, 5).map((r) => (
                          <span key={r} className="text-xs bg-white border border-slate-200 text-slate-600 px-2 py-0.5 rounded-full">{r}</span>
                        ))}
                        {ev.reactions.length > 5 && (
                          <span className="text-xs text-slate-400">+{ev.reactions.length - 5} more</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function DrugLookup() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selected, setSelected] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const search = async (e) => {
    e.preventDefault();
    if (!query.trim() || query.trim().length < 2) return;
    setLoading(true);
    setError('');
    setResults(null);
    try {
      const { data } = await axios.get(`/api/drugs/search?q=${encodeURIComponent(query)}&limit=10`);
      setResults(data);
    } catch (err) {
      setError(err.response?.data?.error || 'Search failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const selectDrug = async (drug) => {
    setDetailLoading(true);
    try {
      const { data } = await axios.get(`/api/drugs/${encodeURIComponent(drug.brandName)}/details`);
      setSelected(data);
    } catch {
      setSelected(drug);
    } finally {
      setDetailLoading(false);
    }
  };

  const EXAMPLE_DRUGS = ['aspirin', 'ibuprofen', 'metformin', 'lisinopril', 'amoxicillin', 'atorvastatin'];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-800 mb-2">Drug Information Lookup</h1>
        <p className="text-slate-500">
          Search the FDA drug database for label information, warnings, dosage, and adverse event reports.
          Powered by <strong>OpenFDA</strong>.
        </p>
      </div>

      {/* Search */}
      <form onSubmit={search} className="card mb-6">
        <div className="flex gap-3">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by brand name or generic name..."
            className="input-field text-base"
          />
          <button type="submit" disabled={loading || !query.trim()} className="btn-primary whitespace-nowrap">
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Searching
              </span>
            ) : 'Search'}
          </button>
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          {EXAMPLE_DRUGS.map((drug) => (
            <button
              key={drug}
              type="button"
              onClick={() => { setQuery(drug); }}
              className="text-xs px-3 py-1 rounded-full border border-slate-200 text-slate-600 hover:border-blue-300 hover:text-blue-700 transition-colors"
            >
              {drug}
            </button>
          ))}
        </div>
      </form>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-4 mb-6 text-sm">{error}</div>
      )}

      {results && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-slate-500">
              {results.total > 0
                ? `Showing ${results.results.length} of ${results.total.toLocaleString()} results for "${query}"`
                : `No results found for "${query}"`}
            </p>
          </div>
          {results.results.length === 0 ? (
            <div className="card text-center py-12 text-slate-400">
              <div className="text-4xl mb-3">💊</div>
              <p>No FDA drug records found. Try a different name.</p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 gap-4">
              {results.results.map((drug, i) => (
                <DrugCard key={i} drug={drug} onSelect={selectDrug} />
              ))}
            </div>
          )}
        </div>
      )}

      {detailLoading && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center">
          <div className="bg-white rounded-2xl p-8 flex items-center gap-4 shadow-2xl">
            <span className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
            <span className="font-medium text-slate-700">Loading drug details...</span>
          </div>
        </div>
      )}

      {selected && <DrugDetail drug={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}
