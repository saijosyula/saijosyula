import { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale, LinearScale, PointElement, LineElement,
  BarElement, Title, Tooltip, Legend, Filler
);

function StatCard({ label, value, icon, sub, color = 'blue' }) {
  const colors = {
    blue: 'bg-blue-50 text-blue-700 border-blue-100',
    red: 'bg-red-50 text-red-700 border-red-100',
    green: 'bg-green-50 text-green-700 border-green-100',
    amber: 'bg-amber-50 text-amber-700 border-amber-100',
  };
  return (
    <div className={`card border ${colors[color]}`}>
      <div className="flex items-center gap-2 mb-1">
        <span className="text-xl">{icon}</span>
        <span className="text-sm font-medium opacity-80">{label}</span>
      </div>
      <div className="text-2xl font-bold mt-1">{value}</div>
      {sub && <div className="text-xs opacity-70 mt-1">{sub}</div>}
    </div>
  );
}

function formatNum(n) {
  if (!n && n !== 0) return '—';
  if (n >= 1e9) return (n / 1e9).toFixed(2) + 'B';
  if (n >= 1e6) return (n / 1e6).toFixed(2) + 'M';
  if (n >= 1e3) return (n / 1e3).toFixed(1) + 'K';
  return n.toLocaleString();
}

export default function Dashboard() {
  const [global, setGlobal] = useState(null);
  const [countries, setCountries] = useState([]);
  const [historical, setHistorical] = useState(null);
  const [adverseStats, setAdverseStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [days, setDays] = useState(30);
  const [drugQuery, setDrugQuery] = useState('aspirin');
  const [drugInput, setDrugInput] = useState('aspirin');

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      try {
        const [g, c, h] = await Promise.all([
          axios.get('/api/stats/covid/global'),
          axios.get('/api/stats/covid/countries?limit=10&sort=cases'),
          axios.get(`/api/stats/covid/historical?days=${days}`),
        ]);
        setGlobal(g.data);
        setCountries(c.data.countries || []);
        setHistorical(h.data);
      } catch (err) {
        console.error('Dashboard fetch error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, [days]);

  useEffect(() => {
    const fetchAdverse = async () => {
      try {
        const { data } = await axios.get(`/api/stats/fda/drug-events?term=${encodeURIComponent(drugQuery)}&limit=10`);
        setAdverseStats(data);
      } catch {
        setAdverseStats(null);
      }
    };
    fetchAdverse();
  }, [drugQuery]);

  const chartOptions = {
    responsive: true,
    plugins: { legend: { position: 'top' } },
    scales: { y: { beginAtZero: false } },
  };

  const lineData = historical && {
    labels: historical.cases.slice(-days).map((d) => d.date),
    datasets: [
      {
        label: 'Cases',
        data: historical.cases.slice(-days).map((d) => d.value),
        borderColor: '#3b82f6',
        backgroundColor: 'rgba(59,130,246,0.1)',
        fill: true,
        tension: 0.3,
        pointRadius: 0,
      },
      {
        label: 'Deaths',
        data: historical.deaths.slice(-days).map((d) => d.value),
        borderColor: '#ef4444',
        backgroundColor: 'rgba(239,68,68,0.08)',
        fill: true,
        tension: 0.3,
        pointRadius: 0,
      },
    ],
  };

  const barData = countries.length > 0 && {
    labels: countries.slice(0, 10).map((c) => c.country),
    datasets: [
      {
        label: 'Total Cases',
        data: countries.slice(0, 10).map((c) => c.cases),
        backgroundColor: 'rgba(59,130,246,0.7)',
        borderRadius: 6,
      },
      {
        label: 'Active Cases',
        data: countries.slice(0, 10).map((c) => c.active),
        backgroundColor: 'rgba(245,158,11,0.7)',
        borderRadius: 6,
      },
    ],
  };

  const adverseBarData = adverseStats?.topReactions?.length > 0 && {
    labels: adverseStats.topReactions.map((r) => r.reaction.slice(0, 25)),
    datasets: [
      {
        label: 'Report Count',
        data: adverseStats.topReactions.map((r) => r.count),
        backgroundColor: 'rgba(139,92,246,0.7)',
        borderRadius: 6,
      },
    ],
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-20 text-center">
        <span className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin inline-block mb-4" />
        <p className="text-slate-500">Loading live health statistics...</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-800 mb-2">Disease Statistics Dashboard</h1>
        <p className="text-slate-500">
          Live global health data from{' '}
          <a href="https://disease.sh" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
            Disease.sh
          </a>{' '}
          and FDA adverse event reports.
        </p>
      </div>

      {/* Global stats */}
      {global && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <StatCard label="Total Cases" value={formatNum(global.cases)} icon="🦠" sub="worldwide" color="blue" />
          <StatCard label="Deaths" value={formatNum(global.deaths)} icon="💔" sub="worldwide" color="red" />
          <StatCard label="Recovered" value={formatNum(global.recovered)} icon="✅" sub="worldwide" color="green" />
          <StatCard label="Active" value={formatNum(global.active)} icon="⚡" sub={`${formatNum(global.critical)} critical`} color="amber" />
        </div>
      )}

      {/* Historical chart */}
      {lineData && (
        <div className="card mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-slate-800">Global Cases Over Time</h2>
            <div className="flex gap-2">
              {[14, 30, 60, 90].map((d) => (
                <button
                  key={d}
                  onClick={() => setDays(d)}
                  className={`text-xs px-3 py-1.5 rounded-lg transition-colors ${days === d ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                >
                  {d}d
                </button>
              ))}
            </div>
          </div>
          <Line data={lineData} options={chartOptions} />
        </div>
      )}

      {/* Country bar chart */}
      {barData && (
        <div className="card mb-6">
          <h2 className="font-semibold text-slate-800 mb-4">Top 10 Countries by Cases</h2>
          <Bar data={barData} options={{ ...chartOptions, indexAxis: 'x' }} />
        </div>
      )}

      {/* Countries table */}
      {countries.length > 0 && (
        <div className="card mb-6 overflow-x-auto">
          <h2 className="font-semibold text-slate-800 mb-4">Country Breakdown</h2>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-slate-500 border-b border-slate-100">
                <th className="pb-3 pr-4">Country</th>
                <th className="pb-3 pr-4 text-right">Cases</th>
                <th className="pb-3 pr-4 text-right">Deaths</th>
                <th className="pb-3 pr-4 text-right">Recovered</th>
                <th className="pb-3 text-right">Active</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {countries.map((c) => (
                <tr key={c.country} className="hover:bg-slate-50">
                  <td className="py-2.5 pr-4 font-medium flex items-center gap-2">
                    {c.flag && <img src={c.flag} alt="" className="w-5 h-3 object-cover rounded-sm" />}
                    {c.country}
                  </td>
                  <td className="py-2.5 pr-4 text-right text-blue-600">{formatNum(c.cases)}</td>
                  <td className="py-2.5 pr-4 text-right text-red-500">{formatNum(c.deaths)}</td>
                  <td className="py-2.5 pr-4 text-right text-green-600">{formatNum(c.recovered)}</td>
                  <td className="py-2.5 text-right text-amber-600">{formatNum(c.active)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* FDA Adverse Events */}
      <div className="card">
        <div className="flex items-start justify-between flex-wrap gap-4 mb-4">
          <div>
            <h2 className="font-semibold text-slate-800">FDA Adverse Event Reports</h2>
            <p className="text-sm text-slate-500 mt-0.5">Top reported reactions for a drug (from FDA FAERS database)</p>
          </div>
          <form
            onSubmit={(e) => { e.preventDefault(); setDrugQuery(drugInput); }}
            className="flex gap-2"
          >
            <input
              value={drugInput}
              onChange={(e) => setDrugInput(e.target.value)}
              className="input-field text-sm w-32"
              placeholder="Drug name..."
            />
            <button type="submit" className="btn-primary text-sm py-1.5 px-4">Go</button>
          </form>
        </div>
        {adverseBarData ? (
          <Bar data={adverseBarData} options={{ ...chartOptions, plugins: { legend: { display: false } } }} />
        ) : (
          <p className="text-slate-400 text-sm text-center py-8">No data for this drug. Try another name.</p>
        )}
      </div>
    </div>
  );
}
