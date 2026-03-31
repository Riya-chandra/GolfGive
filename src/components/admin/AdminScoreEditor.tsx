'use client';

import { useState } from 'react';

interface Score {
  id: string;
  score: number;
  played_date: string;
}

interface Props {
  userId: string;
  userName: string;
}

export default function AdminScoreEditor({ userId, userName }: Props) {
  const [open, setOpen] = useState(false);
  const [scores, setScores] = useState<Score[]>([]);
  const [loading, setLoading] = useState(false);
  const [newScore, setNewScore] = useState('');
  const [newDate, setNewDate] = useState('');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  const fetchScores = async () => {
    setLoading(true);
    const res = await fetch(`/api/admin/users/scores?userId=${userId}`);
    const data = await res.json();
    setScores(data.scores || []);
    setLoading(false);
  };

  const openEditor = () => {
    setOpen(true);
    fetchScores();
  };

  const deleteScore = async (scoreId: string) => {
    const res = await fetch(`/api/admin/users/scores?scoreId=${scoreId}`, { method: 'DELETE' });
    if (res.ok) setScores(prev => prev.filter(s => s.id !== scoreId));
  };

  const addScore = async () => {
    const score = Number(newScore);
    if (!score || score < 1 || score > 45) { setMessage('Score must be 1–45'); return; }
    if (!newDate) { setMessage('Date required'); return; }
    setSaving(true); setMessage('');
    const res = await fetch('/api/admin/users/scores', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, score, playedDate: newDate }),
    });
    const data = await res.json();
    setSaving(false);
    if (res.ok) {
      setNewScore(''); setNewDate('');
      fetchScores();
    } else {
      setMessage(data.error || 'Failed to add score');
    }
  };

  return (
    <>
      <button
        onClick={openEditor}
        className="text-xs font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 px-2.5 py-1 rounded-lg transition-colors"
      >
        Scores
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setOpen(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md">
            <button onClick={() => setOpen(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-xl">×</button>

            <h2 className="font-display font-bold text-lg text-charcoal mb-1">Edit Scores</h2>
            <p className="text-xs text-gray-400 mb-5">{userName}</p>

            {/* Score list */}
            {loading ? (
              <div className="space-y-2">
                {[1,2,3].map(i => <div key={i} className="h-10 bg-gray-100 animate-pulse rounded-xl" />)}
              </div>
            ) : scores.length === 0 ? (
              <p className="text-sm text-gray-400 mb-4">No scores logged yet.</p>
            ) : (
              <div className="space-y-2 mb-5">
                {scores.map(s => (
                  <div key={s.id} className="flex items-center justify-between bg-gray-50 rounded-xl px-4 py-2.5">
                    <div>
                      <span className="font-bold text-charcoal text-sm">{s.score} pts</span>
                      <span className="text-xs text-gray-400 ml-2">
                        {new Date(s.played_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: '2-digit' })}
                      </span>
                    </div>
                    <button
                      onClick={() => deleteScore(s.id)}
                      className="text-xs text-red-500 hover:text-red-700 font-medium"
                    >
                      Remove
                    </button>
                  </div>
                ))}
                <p className="text-xs text-gray-400 text-right">{scores.length}/5 scores</p>
              </div>
            )}

            {/* Add new score */}
            <div className="border-t border-gray-100 pt-4">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Add Score</p>
              <div className="flex gap-2 mb-2">
                <input
                  type="number"
                  placeholder="Score (1-45)"
                  value={newScore}
                  onChange={e => setNewScore(e.target.value)}
                  min={1} max={45}
                  className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-forest-400"
                />
                <input
                  type="date"
                  value={newDate}
                  onChange={e => setNewDate(e.target.value)}
                  max={new Date().toISOString().split('T')[0]}
                  className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-forest-400"
                />
              </div>
              {message && <p className="text-xs text-red-500 mb-2">{message}</p>}
              <button
                onClick={addScore}
                disabled={saving}
                className="btn-primary text-sm py-2 w-full"
              >
                {saving ? 'Adding…' : 'Add score'}
              </button>
              <p className="text-xs text-gray-400 mt-2 text-center">If user already has 5, oldest will be replaced.</p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
