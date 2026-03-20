'use client';

import { useState } from 'react';
import { Draw, MONTH_NAMES } from '@/types';

interface Props {
  draws: Draw[];
}

export default function AdminDrawManager({ draws: initialDraws }: Props) {
  const [draws, setDraws] = useState<Draw[]>(initialDraws);
  const [loading, setLoading] = useState<string | null>(null);
  const [simResult, setSimResult] = useState<{
    winningNumbers: number[];
    method: string;
    matches: { fiveMatch: string[]; fourMatch: string[]; threeMatch: string[] };
  } | null>(null);
  const [message, setMessage] = useState('');

  // Create new draw form
  const today = new Date();
  const [newDraw, setNewDraw] = useState({
    month: today.getMonth() + 1,
    year: today.getFullYear(),
    drawType: 'random',
  });
  const [showCreateForm, setShowCreateForm] = useState(false);

  const showMsg = (msg: string) => {
    setMessage(msg);
    setTimeout(() => setMessage(''), 4000);
  };

  const handleCreate = async () => {
    setLoading('create');
    const res = await fetch('/api/draws', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'create', ...newDraw }),
    });
    const data = await res.json();
    if (res.ok) {
      setDraws([data.draw, ...draws]);
      setShowCreateForm(false);
      showMsg('✅ Draw created successfully');
    } else {
      showMsg(`❌ ${data.error}`);
    }
    setLoading(null);
  };

  const handleSimulate = async (drawId: string) => {
    setLoading(drawId);
    setSimResult(null);
    const res = await fetch('/api/draws', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'simulate', drawId }),
    });
    const data = await res.json();
    if (res.ok) {
      setSimResult(data);
      setDraws(draws.map(d => d.id === drawId ? { ...d, status: 'simulated', winning_numbers: data.winningNumbers } : d));
      showMsg('🎯 Simulation complete. Review numbers before publishing.');
    } else {
      showMsg(`❌ ${data.error}`);
    }
    setLoading(null);
  };

  const handlePublish = async (drawId: string) => {
    if (!confirm('Publish this draw? This will notify all winners and cannot be undone.')) return;
    setLoading(drawId + '-publish');
    const res = await fetch('/api/draws', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'publish', drawId }),
    });
    const data = await res.json();
    if (res.ok) {
      setDraws(draws.map(d => d.id === drawId ? { ...d, status: 'published' } : d));
      setSimResult(null);
      showMsg(`✅ Draw published! ${data.winnersCount} winner(s) found.${data.jackpotRolledOver ? ' Jackpot rolls over.' : ''}`);
    } else {
      showMsg(`❌ ${data.error}`);
    }
    setLoading(null);
  };

  const statusBadge = (status: string) => {
    const cfg: Record<string, string> = {
      upcoming: 'badge-gray',
      simulated: 'badge-gold',
      published: 'badge-green',
    };
    return <span className={`badge ${cfg[status] || 'badge-gray'}`}>{status}</span>;
  };

  return (
    <div className="card p-6 md:p-8">
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h2 className="font-display text-2xl font-bold text-charcoal">Draw Manager</h2>
          <p className="text-gray-500 text-sm mt-1">Create, simulate, and publish monthly draws</p>
        </div>
        <button
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="btn-primary text-sm py-2 px-4"
        >
          + New Draw
        </button>
      </div>

      {/* Message */}
      {message && (
        <div className={`rounded-xl px-4 py-3 mb-4 text-sm font-medium ${
          message.startsWith('❌') ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-forest-50 text-forest-700 border border-forest-200'
        }`}>
          {message}
        </div>
      )}

      {/* Create form */}
      {showCreateForm && (
        <div className="bg-gray-50 rounded-2xl p-5 mb-6 border border-gray-100">
          <h3 className="font-semibold text-sm text-charcoal mb-4">Create new draw</h3>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="label text-xs">Month</label>
              <select
                className="input-field text-sm"
                value={newDraw.month}
                onChange={(e) => setNewDraw({ ...newDraw, month: parseInt(e.target.value) })}
              >
                {MONTH_NAMES.map((m, i) => (
                  <option key={m} value={i + 1}>{m}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label text-xs">Year</label>
              <input
                type="number"
                className="input-field text-sm"
                value={newDraw.year}
                onChange={(e) => setNewDraw({ ...newDraw, year: parseInt(e.target.value) })}
                min={2024}
                max={2030}
              />
            </div>
            <div>
              <label className="label text-xs">Draw type</label>
              <select
                className="input-field text-sm"
                value={newDraw.drawType}
                onChange={(e) => setNewDraw({ ...newDraw, drawType: e.target.value })}
              >
                <option value="random">Random</option>
                <option value="algorithmic">Algorithmic</option>
              </select>
            </div>
          </div>
          <div className="flex gap-3 mt-4">
            <button onClick={() => setShowCreateForm(false)} className="btn-outline text-sm py-2 px-4">Cancel</button>
            <button
              onClick={handleCreate}
              disabled={loading === 'create'}
              className="btn-primary text-sm py-2 px-4"
            >
              {loading === 'create' ? 'Creating...' : 'Create Draw'}
            </button>
          </div>
        </div>
      )}

      {/* Simulation result */}
      {simResult && (
        <div className="bg-forest-50 border-2 border-forest-200 rounded-2xl p-5 mb-6">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xl">🎯</span>
            <h3 className="font-semibold text-forest-800">Simulation Result ({simResult.method})</h3>
          </div>
          <div className="flex flex-wrap gap-2 mb-4">
            {simResult.winningNumbers.map((n) => (
              <div key={n} className="number-ball w-12 h-12">{n}</div>
            ))}
          </div>
          <div className="grid grid-cols-3 gap-3 text-center">
            {[
              { label: '5 Match (Jackpot)', count: simResult.matches.fiveMatch.length, color: 'text-gold-600' },
              { label: '4 Match', count: simResult.matches.fourMatch.length, color: 'text-forest-600' },
              { label: '3 Match', count: simResult.matches.threeMatch.length, color: 'text-gray-600' },
            ].map((m) => (
              <div key={m.label} className="bg-white rounded-xl p-3">
                <div className={`font-bold text-2xl ${m.color}`}>{m.count}</div>
                <div className="text-xs text-gray-400 mt-0.5">{m.label}</div>
              </div>
            ))}
          </div>
          {simResult.matches.fiveMatch.length === 0 && (
            <p className="text-sm text-amber-700 bg-amber-50 rounded-lg px-3 py-2 mt-3 font-medium">
              ⚠️ No jackpot winner — jackpot will roll over to next month.
            </p>
          )}
        </div>
      )}

      {/* Draws table */}
      <div className="overflow-x-auto">
        <table className="data-table">
          <thead>
            <tr>
              <th>Draw Period</th>
              <th>Type</th>
              <th>Pool</th>
              <th>Winning Numbers</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {draws.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center text-gray-400 py-10">
                  No draws created yet. Create your first draw above.
                </td>
              </tr>
            ) : draws.map((draw) => (
              <tr key={draw.id}>
                <td className="font-semibold">
                  {MONTH_NAMES[draw.month - 1]} {draw.year}
                </td>
                <td className="capitalize text-sm text-gray-500">{draw.draw_type}</td>
                <td className="font-medium text-charcoal">£{draw.total_pool.toFixed(2)}</td>
                <td>
                  {draw.winning_numbers?.length > 0 ? (
                    <div className="flex gap-1.5 flex-wrap">
                      {draw.winning_numbers.map((n) => (
                        <span
                          key={n}
                          className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-forest-600 text-white text-xs font-bold"
                        >
                          {n}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <span className="text-gray-300 text-sm">Not drawn yet</span>
                  )}
                </td>
                <td>{statusBadge(draw.status)}</td>
                <td>
                  <div className="flex gap-2 flex-wrap">
                    {draw.status === 'upcoming' && (
                      <button
                        onClick={() => handleSimulate(draw.id)}
                        disabled={loading === draw.id}
                        className="text-xs font-medium text-forest-700 bg-forest-50 hover:bg-forest-100 px-3 py-1.5 rounded-lg transition-colors"
                      >
                        {loading === draw.id ? '...' : 'Simulate'}
                      </button>
                    )}
                    {draw.status === 'simulated' && (
                      <>
                        <button
                          onClick={() => handleSimulate(draw.id)}
                          disabled={loading === draw.id}
                          className="text-xs font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 px-3 py-1.5 rounded-lg transition-colors"
                        >
                          Re-run
                        </button>
                        <button
                          onClick={() => handlePublish(draw.id)}
                          disabled={loading === draw.id + '-publish'}
                          className="text-xs font-medium text-white bg-forest-600 hover:bg-forest-700 px-3 py-1.5 rounded-lg transition-colors"
                        >
                          {loading === draw.id + '-publish' ? '...' : 'Publish'}
                        </button>
                      </>
                    )}
                    {draw.status === 'published' && (
                      <span className="text-xs text-gray-400">Published</span>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
