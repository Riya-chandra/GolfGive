'use client';

import { useState } from 'react';
import { GolfScore } from '@/types';

interface Props {
  scores: GolfScore[];
  isActive: boolean;
}

export default function ScoreEntry({ scores: initialScores, isActive }: Props) {
  const [scores, setScores] = useState<GolfScore[]>(initialScores);
  const [newScore, setNewScore] = useState('');
  const [newDate, setNewDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newScore || !newDate) return;
    
    const scoreVal = parseInt(newScore);
<<<<<<< HEAD
    if (isNaN(scoreVal) || scoreVal < 1 || scoreVal > 45) {
=======
    if (scoreVal < 1 || scoreVal > 45) {
      setError('Score must be between 1 and 45');
      return;
>>>>>>> 3fda15e (added)
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const res = await fetch('/api/scores', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ score: scoreVal, playedDate: newDate }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error);
        return;
      }

      // Update local state - add new score and keep only 5
      const updated = [data.score, ...scores].slice(0, 5);
      setScores(updated);
      setNewScore('');
      setSuccess('Score added! Your draw entry is updated.');
      setTimeout(() => setSuccess(''), 3000);
    } catch {
      setError('Failed to save score. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (scoreId: string) => {
    const confirmed = window.confirm('Remove this score?');
    if (!confirmed) return;

    const res = await fetch(`/api/scores?id=${scoreId}`, { method: 'DELETE' });
    if (res.ok) {
      setScores(scores.filter((s) => s.id !== scoreId));
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  return (
    <div className="card p-6 md:p-8">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h2 className="font-display text-2xl font-bold text-charcoal">Your Scores</h2>
          <p className="text-gray-500 text-sm mt-1">
            {scores.length}/5 scores logged · Most recent first · Stableford format (1–45)
          </p>
        </div>
        <div className={`badge ${scores.length === 5 ? 'badge-green' : 'badge-gray'}`}>
          {scores.length === 5 ? '✓ Draw ready' : `${5 - scores.length} more needed`}
        </div>
      </div>

      {/* Score list */}
      <div className="space-y-2.5 mb-6">
        {scores.length === 0 && (
          <div className="text-center py-10 border-2 border-dashed border-gray-200 rounded-xl">
            <div className="text-4xl mb-3">🏌️</div>
            <p className="text-gray-400 text-sm">No scores yet. Add your first round below.</p>
          </div>
        )}
        {scores.map((score, index) => (
          <div
            key={score.id}
            className="score-item flex items-center justify-between bg-gray-50 rounded-xl px-4 py-3 group"
            style={{ animationDelay: `${index * 0.05}s` }}
          >
            <div className="flex items-center gap-4">
              {/* Rank indicator */}
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                index === 0 ? 'bg-gold-100 text-gold-700' : 'bg-gray-200 text-gray-500'
              }`}>
                {index + 1}
              </div>
              <div>
                <div className="font-semibold text-charcoal text-sm">{formatDate(score.played_date)}</div>
                <div className="text-xs text-gray-400">Stableford</div>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="number-ball text-sm w-11 h-11">{score.score}</div>
              {isActive && (
                <button
                  onClick={() => handleDelete(score.id)}
                  className="text-gray-300 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
                  title="Remove score"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Note about rolling window */}
      {scores.length === 5 && (
        <p className="text-xs text-gray-400 mb-5 bg-gray-50 rounded-lg px-3 py-2">
          ℹ️ Adding a new score will automatically remove your oldest score to maintain your 5-score window.
        </p>
      )}

      {/* Add score form */}
      {isActive ? (
        <form onSubmit={handleAdd} className="border-t border-gray-100 pt-5">
          <h3 className="font-semibold text-sm text-gray-700 mb-3">Log a new round</h3>
          <div className="flex gap-3 flex-wrap">
            <div className="flex-1 min-w-32">
              <label className="label text-xs">Stableford score</label>
              <input
                type="number"
                min={1}
                max={45}
                className="input-field"
                placeholder="e.g. 28"
                value={newScore}
                onChange={(e) => setNewScore(e.target.value)}
                required
              />
            </div>
            <div className="flex-1 min-w-40">
              <label className="label text-xs">Date played</label>
              <input
                type="date"
                className="input-field"
                value={newDate}
                max={new Date().toISOString().split('T')[0]}
                onChange={(e) => setNewDate(e.target.value)}
                required
              />
            </div>
            <div className="flex items-end">
              <button
                type="submit"
                disabled={loading}
                className="btn-primary text-sm py-3 px-5 whitespace-nowrap"
              >
                {loading ? '...' : '+ Add score'}
              </button>
            </div>
          </div>

          {error && <p className="text-red-500 text-xs mt-2">{error}</p>}
          {success && (
            <p className="text-forest-600 text-xs mt-2 font-medium animate-fade-in">{success}</p>
          )}
        </form>
      ) : (
        <div className="border-t border-gray-100 pt-5 text-center">
          <p className="text-gray-400 text-sm">Subscribe to start logging scores and entering draws.</p>
        </div>
      )}
    </div>
  );
}
