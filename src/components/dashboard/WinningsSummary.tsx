'use client';

import { useState } from 'react';
import { Winner, MONTH_NAMES } from '@/types';

interface Props {
  winnings: (Winner & { draws?: { month: number; year: number } })[];
}

const statusConfig: Record<string, { label: string; class: string }> = {
  pending: { label: 'Pending verification', class: 'badge-gray' },
  verification_required: { label: 'Under review', class: 'badge-gold' },
  approved: { label: 'Approved', class: 'badge-green' },
  paid: { label: 'Paid ✓', class: 'badge-green' },
  rejected: { label: 'Rejected', class: 'badge-red' },
};

export default function WinningsSummary({ winnings }: Props) {
  const [showProofModal, setShowProofModal] = useState<string | null>(null);
  const [proofUrl, setProofUrl] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const totalWon = winnings.reduce((sum, w) => sum + w.prize_amount, 0);
  const totalPaid = winnings.filter((w) => w.payment_status === 'paid').reduce((sum, w) => sum + w.prize_amount, 0);

  const handleSubmitProof = async (winnerId: string) => {
    if (!proofUrl) return;
    setSubmitting(true);
    const res = await fetch('/api/winners', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ winnerId, action: 'submit_proof', proofUrl }),
    });
    if (res.ok) {
      setShowProofModal(null);
      setProofUrl('');
      window.location.reload();
    }
    setSubmitting(false);
  };

  return (
    <div className="card p-6 md:p-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-display text-2xl font-bold text-charcoal">Winnings</h2>
        <div className="flex gap-4 text-right">
          <div>
            <div className="text-xs text-gray-400">Total won</div>
            <div className="font-display font-bold text-xl text-gold-600">£{totalWon.toFixed(2)}</div>
          </div>
          <div>
            <div className="text-xs text-gray-400">Paid out</div>
            <div className="font-display font-bold text-xl text-forest-600">£{totalPaid.toFixed(2)}</div>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="data-table">
          <thead>
            <tr>
              <th>Draw</th>
              <th>Match</th>
              <th>Prize</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {winnings.map((w) => {
              const config = statusConfig[w.payment_status] || statusConfig.pending;
              return (
                <tr key={w.id}>
                  <td className="font-medium">
                    {w.draws ? `${MONTH_NAMES[w.draws.month - 1]} ${w.draws.year}` : '—'}
                  </td>
                  <td>
                    <span className={`badge ${w.match_type === '5-match' ? 'badge-gold' : 'badge-green'}`}>
                      {w.match_type}
                    </span>
                  </td>
                  <td className="font-bold text-charcoal">£{w.prize_amount.toFixed(2)}</td>
                  <td><span className={config.class}>{config.label}</span></td>
                  <td>
                    {w.payment_status === 'pending' && (
                      <button
                        onClick={() => setShowProofModal(w.id)}
                        className="text-xs text-forest-600 font-medium hover:underline"
                      >
                        Submit proof
                      </button>
                    )}
                    {w.payment_status === 'verification_required' && (
                      <span className="text-xs text-gray-400">Awaiting admin</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Proof submission modal */}
      {showProofModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
            <h3 className="font-display font-bold text-xl text-charcoal mb-2">Submit Verification Proof</h3>
            <p className="text-sm text-gray-500 mb-5">
              Please provide a link to a screenshot of your scores from your golf platform.
            </p>
            <label className="label">Screenshot URL</label>
            <input
              type="url"
              className="input-field mb-4"
              placeholder="https://example.com/my-scores-screenshot.png"
              value={proofUrl}
              onChange={(e) => setProofUrl(e.target.value)}
            />
            <div className="flex gap-3">
              <button onClick={() => setShowProofModal(null)} className="btn-outline flex-1 justify-center text-sm">
                Cancel
              </button>
              <button
                onClick={() => handleSubmitProof(showProofModal)}
                disabled={submitting || !proofUrl}
                className="btn-primary flex-1 justify-center text-sm"
              >
                {submitting ? 'Submitting...' : 'Submit proof'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
