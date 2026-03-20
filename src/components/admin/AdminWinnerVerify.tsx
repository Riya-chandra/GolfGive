'use client';

import { useState } from 'react';

interface Props {
  winnerId: string;
  currentStatus: string;
  hasProof: boolean;
}

export default function AdminWinnerVerify({ winnerId, currentStatus, hasProof }: Props) {
  const [status, setStatus] = useState(currentStatus);
  const [loading, setLoading] = useState(false);

  const update = async (newStatus: string) => {
    setLoading(true);
    const res = await fetch('/api/winners', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ winnerId, action: 'admin_verify', paymentStatus: newStatus }),
    });
    if (res.ok) setStatus(newStatus);
    setLoading(false);
  };

  if (status === 'paid') return <span className="text-xs text-green-600 font-medium">✓ Paid</span>;
  if (status === 'rejected') return <span className="text-xs text-red-500">Rejected</span>;

  return (
    <div className="flex gap-1.5 flex-wrap">
      {status === 'verification_required' && hasProof && (
        <>
          <button
            onClick={() => update('approved')}
            disabled={loading}
            className="text-xs font-medium text-green-700 bg-green-50 hover:bg-green-100 px-2.5 py-1 rounded-lg transition-colors"
          >
            ✓ Approve
          </button>
          <button
            onClick={() => update('rejected')}
            disabled={loading}
            className="text-xs font-medium text-red-600 bg-red-50 hover:bg-red-100 px-2.5 py-1 rounded-lg transition-colors"
          >
            ✗ Reject
          </button>
        </>
      )}
      {status === 'approved' && (
        <button
          onClick={() => update('paid')}
          disabled={loading}
          className="text-xs font-medium text-white bg-forest-600 hover:bg-forest-700 px-2.5 py-1.5 rounded-lg transition-colors"
        >
          Mark paid
        </button>
      )}
      {status === 'pending' && (
        <span className="text-xs text-gray-400">Awaiting proof</span>
      )}
    </div>
  );
}
