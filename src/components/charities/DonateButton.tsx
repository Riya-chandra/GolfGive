'use client';

import { useState } from 'react';

interface Props {
  charityId: string;
  charityName: string;
  isLoggedIn: boolean;
}

const PRESET_AMOUNTS = [5, 10, 25, 50];

export default function DonateButton({ charityId, charityName, isLoggedIn }: Props) {
  const [showModal, setShowModal] = useState(false);
  const [amount, setAmount] = useState<number | ''>('');
  const [customAmount, setCustomAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const finalAmount = amount !== '' ? amount : Number(customAmount);

  const handleDonate = async () => {
    if (!isLoggedIn) {
      window.location.href = '/auth/login?redirect=/charities';
      return;
    }
    if (!finalAmount || finalAmount < 1) {
      setError('Please enter a valid amount (minimum £1)');
      return;
    }

    setLoading(true); setError('');
    const res = await fetch('/api/donations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ charityId, amount: finalAmount }),
    });
    const data = await res.json();
    setLoading(false);

    if (res.ok && data.url) {
      window.location.href = data.url;
    } else {
      setError(data.error || 'Failed to process donation');
    }
  };

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="btn-gold text-sm"
      >
        ❤️ Donate independently
      </button>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowModal(false)}
          />

          {/* Modal */}
          <div className="relative bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-xl"
            >
              ×
            </button>

            <div className="text-center mb-5">
              <div className="text-3xl mb-2">❤️</div>
              <h2 className="font-display font-bold text-xl text-charcoal">Donate to</h2>
              <p className="text-forest-600 font-semibold text-sm">{charityName}</p>
              <p className="text-gray-400 text-xs mt-1">Independent donation — not tied to gameplay</p>
            </div>

            {/* Preset amounts */}
            <div className="grid grid-cols-4 gap-2 mb-4">
              {PRESET_AMOUNTS.map(a => (
                <button
                  key={a}
                  onClick={() => { setAmount(a); setCustomAmount(''); }}
                  className={`rounded-xl py-2.5 text-sm font-bold border-2 transition-all ${
                    amount === a
                      ? 'border-forest-500 bg-forest-50 text-forest-700'
                      : 'border-gray-200 bg-white text-gray-600 hover:border-forest-300'
                  }`}
                >
                  £{a}
                </button>
              ))}
            </div>

            {/* Custom amount */}
            <div className="mb-4">
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-medium">£</span>
                <input
                  type="number"
                  placeholder="Custom amount"
                  value={customAmount}
                  onChange={e => { setCustomAmount(e.target.value); setAmount(''); }}
                  min={1}
                  className="w-full pl-7 pr-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-forest-400"
                />
              </div>
            </div>

            {error && <p className="text-xs text-red-500 mb-3">{error}</p>}

            <button
              onClick={handleDonate}
              disabled={loading || (!finalAmount || finalAmount < 1)}
              className={`btn-primary w-full py-3 text-sm ${(!finalAmount || finalAmount < 1) ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {loading
                ? 'Processing…'
                : isLoggedIn
                  ? `Donate £${finalAmount || '—'} →`
                  : 'Log in to donate →'}
            </button>

            <p className="text-xs text-gray-400 text-center mt-3">
              Secure payment via Stripe. 100% goes to {charityName}.
            </p>
          </div>
        </div>
      )}
    </>
  );
}
