'use client';

import { useState, useEffect, useCallback } from 'react';

interface Props {
  drawId: string;
  isActive: boolean;
  hasScores: boolean;
}

export default function DrawEntryButton({ drawId, isActive, hasScores }: Props) {
  const [entered, setEntered] = useState(false);
  const [entryScores, setEntryScores] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [entering, setEntering] = useState(false);
  const [message, setMessage] = useState('');

  const checkEntry = useCallback(async () => {
    try {
      const res = await fetch(`/api/draws/enter?drawId=${drawId}`);
      const data = await res.json();
      if (res.ok) {
        setEntered(data.entered);
        setEntryScores(data.entry?.scores_snapshot || []);
      }
    } catch {
      // Not logged in or error
    } finally {
      setLoading(false);
    }
  }, [drawId]);

  useEffect(() => {
    checkEntry();
  }, [checkEntry]);

  const enterDraw = async () => {
    if (!isActive) {
      setMessage('You need an active subscription to enter draws.');
      return;
    }
    if (!hasScores) {
      setMessage('You need to log at least 1 score before entering a draw.');
      return;
    }

    setEntering(true); setMessage('');
    const res = await fetch('/api/draws/enter', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ drawId }),
    });
    const data = await res.json();
    setEntering(false);

    if (res.ok) {
      setEntered(true);
      setEntryScores(data.scoresSnapshot || []);
      setMessage(data.message);
    } else {
      setMessage(data.error || 'Failed to enter draw');
    }
  };

  if (loading) {
    return <div className="h-10 bg-gray-100 animate-pulse rounded-xl w-36" />;
  }

  if (entered) {
    return (
      <div>
        <div className="inline-flex items-center gap-2 bg-forest-50 border border-forest-200 text-forest-700 rounded-xl px-4 py-2.5 text-sm font-semibold">
          <span className="text-base">✅</span>
          Entered
        </div>
        {entryScores.length > 0 && (
          <div className="flex gap-1 mt-2 flex-wrap">
            {entryScores.map((s, i) => (
              <span key={i} className="text-xs bg-forest-100 text-forest-700 px-2 py-0.5 rounded-full font-medium">{s}</span>
            ))}
          </div>
        )}
        <button
          onClick={enterDraw}
          disabled={entering}
          className="mt-2 text-xs text-forest-600 hover:underline block"
        >
          {entering ? 'Updating…' : 'Update with latest scores'}
        </button>
        {message && <p className="text-xs text-forest-600 mt-1">{message}</p>}
      </div>
    );
  }

  return (
    <div>
      <button
        onClick={enterDraw}
        disabled={entering || !isActive || !hasScores}
        className={`btn-primary text-sm py-2.5 px-5 ${(!isActive || !hasScores) ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        {entering ? 'Entering…' : 'Enter this draw →'}
      </button>
      {message && (
        <p className={`text-xs mt-2 ${message.includes('uccess') ? 'text-green-600' : 'text-red-500'}`}>
          {message}
        </p>
      )}
      {!isActive && (
        <p className="text-xs text-gray-400 mt-1">Active subscription required</p>
      )}
      {isActive && !hasScores && (
        <p className="text-xs text-gray-400 mt-1">Log a score first to enter</p>
      )}
    </div>
  );
}
