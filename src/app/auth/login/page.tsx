'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error); return; }
      router.push(data.redirectTo);
      router.refresh();
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-cream flex">
      {/* Left Panel */}
      <div className="hidden lg:flex lg:w-1/2 hero-gradient items-center justify-center relative overflow-hidden">
        <div className="absolute top-1/3 right-0 w-80 h-80 rounded-full bg-white/5 translate-x-1/2 blob" />
        <div className="text-center px-12 relative z-10">
          <Link href="/" className="inline-flex items-center gap-2.5 mb-12">
            <div className="w-10 h-10 rounded-full bg-gold-500 flex items-center justify-center">
              <span className="text-forest-900 font-bold text-lg">G</span>
            </div>
            <span className="font-display font-bold text-2xl text-white">GolfGive</span>
          </Link>
          <h2 className="font-display text-4xl font-bold text-white mb-4 leading-tight">
            Welcome back,<br />champion.
          </h2>
          <p className="text-forest-200 leading-relaxed">
            Log in to enter scores, check draw results, and see your charity impact.
          </p>
          <div className="mt-10 flex justify-center gap-4">
            {[28, 34, 21, 19, 30].map((n) => (
              <div key={n} className="number-ball">{n}</div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Panel */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <Link href="/" className="lg:hidden flex items-center gap-2 mb-10">
            <div className="w-8 h-8 rounded-full bg-forest-600 flex items-center justify-center">
              <span className="text-white font-bold text-sm">G</span>
            </div>
            <span className="font-display font-bold text-xl text-charcoal">GolfGive</span>
          </Link>

          <h1 className="font-display text-3xl font-bold text-charcoal mb-2">Sign in</h1>
          <p className="text-gray-500 text-sm mb-8">
            Don't have an account?{' '}
            <Link href="/auth/signup" className="text-forest-600 font-medium hover:underline">Sign up free</Link>
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">Email address</label>
              <input
                type="email"
                className="input-field"
                placeholder="you@example.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
                autoComplete="email"
              />
            </div>
            <div>
              <label className="label">Password</label>
              <input
                type="password"
                className="input-field"
                placeholder="••••••••"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                required
                autoComplete="current-password"
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3">
                {error}
              </div>
            )}

            {/* Test credentials hint */}
            <div className="bg-forest-50 border border-forest-100 text-forest-700 text-xs rounded-xl px-4 py-3">
              <span className="font-semibold">Test admin:</span> admin@golfcharity.com / Admin@123<br/>
              <span className="font-semibold">Test user:</span> user@golfcharity.com / User@123
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full justify-center py-3.5 mt-2"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="spinner w-4 h-4 border-2" />
                  Signing in...
                </span>
              ) : 'Sign in →'}
            </button>
          </form>

          <p className="text-xs text-gray-400 text-center mt-8">
            By signing in you agree to our{' '}
            <Link href="/terms" className="underline">Terms of Service</Link> and{' '}
            <Link href="/privacy" className="underline">Privacy Policy</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
