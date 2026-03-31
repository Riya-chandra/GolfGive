'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Charity } from '@/types';

interface Props {
  currentCharityId: string | null;
  currentCharityName: string | null;
  currentPct: number;
}

export default function CharitySettings({ currentCharityId, currentCharityName, currentPct }: Props) {
  const [charities, setCharities] = useState<Charity[]>([]);
  const [charityId, setCharityId] = useState(currentCharityId || '');
  const [pct, setPct] = useState(currentPct);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');
  const [showEdit, setShowEdit] = useState(false);

  useEffect(() => {
    if (showEdit && charities.length === 0) {
      fetch('/api/charities')
        .then(r => r.json())
        .then(d => setCharities(d.charities || []));
    }
  }, [showEdit, charities.length]);

  const save = async () => {
    setSaving(true); setError(''); setSaved(false);
    const res = await fetch('/api/user/profile', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ charityId: charityId || null, contributionPct: pct }),
    });
    const data = await res.json();
    setSaving(false);
    if (!res.ok) { setError(data.error || 'Failed to save'); return; }
    setSaved(true);
    setShowEdit(false);
    setTimeout(() => setSaved(false), 3000);
    // Reload to reflect new charity name
    window.location.reload();
  };

  if (!showEdit) {
    return (
      <div>
        {currentCharityName ? (
          <>
            <div className="font-semibold text-gray-700">{currentCharityName}</div>
            <div className="flex items-center gap-2 mt-3">
              <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-forest-500 rounded-full transition-all"
                  style={{ width: `${currentPct}%` }}
                />
              </div>
              <span className="text-sm font-bold text-forest-600">{currentPct}%</span>
            </div>
            <p className="text-xs text-gray-400 mt-1">of your subscription</p>
          </>
        ) : (
          <div className="text-sm text-gray-500 mb-3">
            No charity selected.{' '}
            <Link href="/charities" className="text-forest-600 hover:underline">Browse charities →</Link>
          </div>
        )}
        {saved && <p className="text-xs text-green-600 font-medium mt-2">✓ Saved!</p>}
        <button
          onClick={() => setShowEdit(true)}
          className="mt-3 text-xs text-forest-600 font-medium hover:underline"
        >
          {currentCharityName ? 'Change charity or %' : 'Choose a charity'} →
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Charity selector */}
      <div>
        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-2">
          Choose Charity
        </label>
        {charities.length === 0 ? (
          <div className="text-xs text-gray-400">Loading charities…</div>
        ) : (
          <select
            value={charityId}
            onChange={e => setCharityId(e.target.value)}
            className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2.5 bg-white focus:outline-none focus:ring-2 focus:ring-forest-400"
          >
            <option value="">— None —</option>
            {charities.map((c: Charity) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        )}
      </div>

      {/* Contribution slider */}
      <div>
        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-2">
          Contribution: <span className="text-forest-600 font-bold">{pct}%</span>
          <span className="font-normal text-gray-400"> (min 10%)</span>
        </label>
        <input
          type="range"
          min={10}
          max={100}
          step={5}
          value={pct}
          onChange={e => setPct(Number(e.target.value))}
          className="w-full accent-forest-600"
        />
        <div className="flex justify-between text-xs text-gray-400 mt-1">
          <span>10%</span>
          <span>50%</span>
          <span>100%</span>
        </div>
      </div>

      {error && <p className="text-xs text-red-500">{error}</p>}

      <div className="flex gap-2 pt-1">
        <button
          onClick={save}
          disabled={saving}
          className="btn-primary text-xs py-2 px-4 flex-1"
        >
          {saving ? 'Saving…' : 'Save changes'}
        </button>
        <button
          onClick={() => { setShowEdit(false); setCharityId(currentCharityId || ''); setPct(currentPct); }}
          className="text-xs text-gray-400 hover:text-gray-600 px-3"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
