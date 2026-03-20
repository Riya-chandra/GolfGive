'use client';

import { useState } from 'react';

interface Props {
  userId: string;
  currentStatus: string;
}

export default function AdminUserActions({ userId, currentStatus }: Props) {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(currentStatus);

  const updateStatus = async (newStatus: string) => {
    setLoading(true);
    const res = await fetch('/api/admin/users', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, subscriptionStatus: newStatus }),
    });
    if (res.ok) setStatus(newStatus);
    setLoading(false);
  };

  return (
    <div className="flex gap-2">
      {status !== 'active' && (
        <button
          onClick={() => updateStatus('active')}
          disabled={loading}
          className="text-xs font-medium text-green-700 bg-green-50 hover:bg-green-100 px-2.5 py-1 rounded-lg transition-colors"
        >
          Activate
        </button>
      )}
      {status === 'active' && (
        <button
          onClick={() => updateStatus('cancelled')}
          disabled={loading}
          className="text-xs font-medium text-red-600 bg-red-50 hover:bg-red-100 px-2.5 py-1 rounded-lg transition-colors"
        >
          Cancel
        </button>
      )}
    </div>
  );
}
