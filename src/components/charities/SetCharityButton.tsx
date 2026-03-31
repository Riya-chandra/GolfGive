'use client';

import { useState } from 'react';

interface Props {
  charityId: string;
}

export default function SetCharityButton({ charityId }: Props) {
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const setCharity = async () => {
    setLoading(true);
    const res = await fetch('/api/user/profile', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ charityId }),
    });
    setLoading(false);
    if (res.ok) {
      setDone(true);
      setTimeout(() => window.location.href = '/dashboard', 800);
    }
  };

  if (done) return <span className="text-xs text-green-600 font-medium">✓ Charity updated!</span>;

  return (
    <button
      onClick={setCharity}
      disabled={loading}
      className="text-xs text-forest-600 hover:underline font-medium disabled:opacity-50"
    >
      {loading ? 'Saving…' : 'Set as my charity →'}
    </button>
  );
}
