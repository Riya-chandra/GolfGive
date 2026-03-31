import Link from 'next/link';
<<<<<<< HEAD
import { supabaseAdmin } from '@/lib/supabase';
import { getSession } from '@/lib/auth';
import Navbar from '@/components/layout/Navbar';
=======

import { supabaseAdmin } from '@/lib/supabase';

import { getSession } from '@/lib/auth';

import Navbar from '@/components/layout/Navbar';

>>>>>>> 3fda15e (added)
import Footer from '@/components/layout/Footer';

import { Charity, Draw, MONTH_NAMES } from '@/types';

async function getHomeData() {
  const [charitiesRes, drawsRes] = await Promise.all([
    supabaseAdmin.from('charities').select('*').eq('is_featured', true).eq('is_active', true).limit(3),
    supabaseAdmin.from('draws').select('*').eq('status', 'published').order('year', { ascending: false }).order('month', { ascending: false }).limit(1),
  ]);
  return {
    charities: (charitiesRes.data || []) as Charity[],
    latestDraw: (drawsRes.data?.[0] || null) as Draw | null,
  };
}

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const session = await getSession();
  const { charities, latestDraw } = await getHomeData();

  return (
    <>
      <Navbar user={session ? { full_name: '', role: session.role, email: session.email } : null} />

      {/* ── HERO ─────────────────────────────────── */}
      <section className="hero-gradient noise min-h-screen flex items-center relative overflow-hidden">
        {/* Abstract decorative circles */}
        <div className="absolute top-1/4 right-0 w-96 h-96 rounded-full bg-white/5 -translate-y-1/2 translate-x-1/3 blob" />
        <div className="absolute bottom-0 left-0 w-72 h-72 rounded-full bg-gold-500/10 translate-y-1/2 -translate-x-1/4" />
        <div className="absolute top-20 left-1/2 w-1 h-1 bg-gold-400 rounded-full" style={{ boxShadow: '0 0 40px 20px rgba(201,162,39,0.15)' }} />

        {/* Floating score number decorations */}
        <div className="absolute top-32 right-16 opacity-20 hidden lg:block">
          {[28, 34, 21].map((n, i) => (
            <div
              key={n}
              className="number-ball mb-3"
              style={{ animationDelay: `${i * 0.5}s`, animation: 'float 6s ease-in-out infinite' }}
            >
              {n}
            </div>
          ))}
        </div>

        <div className="max-w-7xl mx-auto px-4 md:px-8 pt-24 pb-20 relative z-10">
          <div className="max-w-3xl">
            {/* Eyebrow */}
            <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-1.5 mb-8 backdrop-blur-sm">
              <span className="w-2 h-2 bg-gold-400 rounded-full animate-pulse" />
              <span className="text-white/90 text-xs font-medium tracking-wide">Monthly draws. Real prizes. Real impact.</span>
            </div>

            {/* Headline */}
            <h1 className="font-display text-5xl md:text-7xl font-black text-white leading-[1.05] mb-6">
              Golf that{' '}
              <em className="not-italic" style={{ color: 'var(--color-gold-light)' }}>gives</em>
              <br />
              back.
            </h1>

            <p className="text-forest-200 text-lg md:text-xl leading-relaxed mb-10 max-w-xl">
              Enter your Stableford scores each month. Compete in our prize draw. A portion of every subscription goes directly to a charity you choose.
            </p>

            {/* Stats row */}
            <div className="flex flex-wrap gap-6 mb-10">
              {[
                { val: '£10K+', label: 'Given to charities' },
                { val: '5 Charities', label: 'Currently supported' },
                { val: 'Monthly', label: 'Prize draws' },
              ].map((s) => (
                <div key={s.label}>
                  <div className="text-2xl font-display font-bold text-gold-400">{s.val}</div>
                  <div className="text-xs text-forest-300 mt-0.5">{s.label}</div>
                </div>
              ))}
            </div>

            {/* CTA buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <Link href="/auth/signup" className="btn-gold text-base py-3.5 px-8">
                Start for £9.99/month →
              </Link>
              <Link href="/how-it-works" className="inline-flex items-center gap-2 text-white/80 hover:text-white transition-colors font-medium py-3.5 px-6">
                How it works
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-white/40">
          <span className="text-xs tracking-widest uppercase">Scroll</span>
          <div className="w-px h-8 bg-white/30 animate-pulse" />
        </div>
      </section>

      {/* ── HOW IT WORKS ─────────────────────────── */}
      <section className="bg-cream py-20 md:py-28">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="text-center mb-16">
            <span className="text-forest-600 text-sm font-semibold uppercase tracking-widest">Simple by design</span>
            <h2 className="font-display text-4xl md:text-5xl font-bold text-charcoal mt-3">
              Three steps. Infinite impact.
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
            {[
              {
                step: '01',
                icon: '🏌️',
                title: 'Play golf & log scores',
                desc: 'Enter your last 5 Stableford scores after each round. Our system keeps your most recent 5 automatically.',
              },
              {
                step: '02',
                icon: '🎯',
                title: 'Enter the monthly draw',
                desc: 'Your 5 scores become your entry numbers. Match 3, 4, or all 5 of the winning numbers to win prizes.',
              },
              {
                step: '03',
                icon: '❤️',
                title: 'Support a charity',
                desc: 'At least 10% of your subscription goes to a charity of your choice. You can always give more.',
              },
            ].map((item) => (
              <div key={item.step} className="card p-8 relative group hover:shadow-md transition-all duration-300">
                <div className="absolute top-6 right-6 font-display font-black text-6xl text-gray-50 select-none group-hover:text-forest-50 transition-colors">
                  {item.step}
                </div>
                <div className="text-4xl mb-4">{item.icon}</div>
                <h3 className="font-display text-xl font-bold text-charcoal mb-2">{item.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRIZE POOLS ──────────────────────────── */}
      <section className="bg-white py-20 md:py-28">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <span className="text-forest-600 text-sm font-semibold uppercase tracking-widest">Win real prizes</span>
              <h2 className="font-display text-4xl md:text-5xl font-bold text-charcoal mt-3 mb-6">
                The more who play,<br />
                <em className="not-italic text-forest-600">the bigger the pot.</em>
              </h2>
              <p className="text-gray-500 text-base leading-relaxed mb-8">
                Every subscription contributes to the monthly prize pool. Three ways to win — and the jackpot rolls over if nobody hits all five numbers.
              </p>
              <Link href="/auth/signup" className="btn-primary">
                Join the draw
              </Link>
            </div>

            <div className="space-y-4">
              {[
                { match: '5 Numbers', share: '40%', label: 'Jackpot', rollover: true, color: 'bg-gold-500', textColor: 'text-charcoal' },
                { match: '4 Numbers', share: '35%', label: 'Major Prize', rollover: false, color: 'bg-forest-600', textColor: 'text-white' },
                { match: '3 Numbers', share: '25%', label: 'Prize', rollover: false, color: 'bg-forest-400', textColor: 'text-white' },
              ].map((tier) => (
                <div
                  key={tier.match}
                  className={`${tier.color} rounded-2xl p-5 flex items-center justify-between`}
                >
                  <div>
                    <div className={`text-xs font-semibold uppercase tracking-wider ${tier.textColor} opacity-70 mb-1`}>{tier.label}</div>
                    <div className={`font-display text-xl font-bold ${tier.textColor}`}>{tier.match} Matched</div>
                    {tier.rollover && (
                      <div className={`text-xs ${tier.textColor} opacity-60 mt-1`}>Jackpot rolls over if unclaimed</div>
                    )}
                  </div>
                  <div className={`font-display text-4xl font-black ${tier.textColor}`}>{tier.share}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── LATEST DRAW RESULTS ───────────────────── */}
      {latestDraw && latestDraw.winning_numbers?.length > 0 && (
        <section className="bg-forest-900 py-16">
          <div className="max-w-7xl mx-auto px-4 md:px-8 text-center">
            <span className="text-forest-300 text-sm font-semibold uppercase tracking-widest">Latest Draw</span>
            <h2 className="font-display text-3xl font-bold text-white mt-2 mb-8">
              {MONTH_NAMES[latestDraw.month - 1]} {latestDraw.year} Winning Numbers
            </h2>
            <div className="flex items-center justify-center gap-3 flex-wrap">
              {latestDraw.winning_numbers.map((n) => (
                <div key={n} className="number-ball gold text-lg w-14 h-14">{n}</div>
              ))}
            </div>
            <p className="text-forest-300 text-sm mt-6">
              Total prize pool: <span className="text-gold-400 font-semibold">£{latestDraw.total_pool.toFixed(2)}</span>
            </p>
            <Link href="/draws" className="inline-flex items-center gap-2 text-forest-300 hover:text-white text-sm mt-4 transition-colors">
              View all draw history →
            </Link>
          </div>
        </section>
      )}

      {/* ── FEATURED CHARITIES ───────────────────── */}
      {charities.length > 0 && (
        <section className="bg-cream py-20 md:py-28">
          <div className="max-w-7xl mx-auto px-4 md:px-8">
            <div className="flex items-end justify-between mb-12">
              <div>
                <span className="text-forest-600 text-sm font-semibold uppercase tracking-widest">Choose your cause</span>
                <h2 className="font-display text-4xl font-bold text-charcoal mt-2">Featured charities</h2>
              </div>
              <Link href="/charities" className="text-sm font-medium text-forest-600 hover:underline hidden md:block">
                View all →
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {charities.map((charity) => (
                <Link
                  key={charity.id}
                  href={`/charities/${charity.slug}`}
                  className="card-hover group block"
                >
                  <div className="h-40 bg-gradient-to-br from-forest-700 to-forest-900 relative overflow-hidden">
                    <div className="absolute inset-0 flex items-center justify-center text-6xl opacity-20">🌿</div>
                    <div className="absolute top-3 left-3">
                      <span className="badge-gold">{charity.category}</span>
                    </div>
                  </div>
                  <div className="p-5">
                    <h3 className="font-display font-bold text-lg text-charcoal mb-2 group-hover:text-forest-600 transition-colors">
                      {charity.name}
                    </h3>
                    <p className="text-gray-500 text-sm leading-relaxed line-clamp-2">
                      {charity.short_description}
                    </p>
                    <div className="mt-4 flex items-center gap-2">
                      <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-forest-500 rounded-full" style={{ width: '60%' }} />
                      </div>
                      <span className="text-xs text-gray-400">£{charity.total_raised.toFixed(0)} raised</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            <div className="text-center mt-8 md:hidden">
              <Link href="/charities" className="btn-outline text-sm">View all charities</Link>
            </div>
          </div>
        </section>
      )}

      {/* ── PRICING ──────────────────────────────── */}
      <section className="bg-white py-20 md:py-28" id="pricing">
        <div className="max-w-4xl mx-auto px-4 md:px-8 text-center">
          <span className="text-forest-600 text-sm font-semibold uppercase tracking-widest">Simple pricing</span>
          <h2 className="font-display text-4xl md:text-5xl font-bold text-charcoal mt-3 mb-4">
            One subscription.<br />Everything included.
          </h2>
          <p className="text-gray-500 mb-12">Score tracking, monthly prize draws, charity contributions. No hidden fees.</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto">
            {/* Monthly */}
            <div className="card p-8 text-left">
              <div className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Monthly</div>
              <div className="font-display text-4xl font-black text-charcoal mb-1">
                £9.99 <span className="text-lg font-normal text-gray-400">/mo</span>
              </div>
              <p className="text-gray-500 text-sm mb-6">Billed monthly. Cancel anytime.</p>
              <ul className="space-y-2.5 mb-8">
                {['Score tracking & history', 'Monthly prize draws', 'Choose your charity', 'Winner verification'].map((f) => (
                  <li key={f} className="flex items-center gap-2.5 text-sm text-gray-600">
                    <svg className="w-4 h-4 text-forest-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                    </svg>
                    {f}
                  </li>
                ))}
              </ul>
              <Link href="/auth/signup?plan=monthly" className="btn-outline w-full justify-center">
                Start monthly
              </Link>
            </div>

            {/* Yearly */}
            <div className="card p-8 text-left border-2 border-forest-600 relative">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-forest-600 text-white text-xs font-bold px-4 py-1 rounded-full">
                Save 17%
              </div>
              <div className="text-sm font-semibold text-forest-600 uppercase tracking-wider mb-3">Annual</div>
              <div className="font-display text-4xl font-black text-charcoal mb-1">
                £99.99 <span className="text-lg font-normal text-gray-400">/yr</span>
              </div>
              <p className="text-gray-500 text-sm mb-6">That's £8.33/month. Billed annually.</p>
              <ul className="space-y-2.5 mb-8">
                {['Everything in Monthly', 'Priority draw entry', 'Annual giving certificate', 'Early access to features'].map((f) => (
                  <li key={f} className="flex items-center gap-2.5 text-sm text-gray-600">
                    <svg className="w-4 h-4 text-forest-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                    </svg>
                    {f}
                  </li>
                ))}
              </ul>
              <Link href="/auth/signup?plan=yearly" className="btn-primary w-full justify-center">
                Start annually →
              </Link>
            </div>
          </div>

          <p className="text-xs text-gray-400 mt-6">
            14-day money back guarantee · Secure checkout via Stripe · Cancel anytime
          </p>
        </div>
      </section>

      {/* ── FINAL CTA ────────────────────────────── */}
      <section className="hero-gradient py-20 md:py-28 relative overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center opacity-5">
          <div className="font-display font-black text-[20rem] text-white select-none">⛳</div>
        </div>
        <div className="max-w-3xl mx-auto px-4 md:px-8 text-center relative z-10">
          <h2 className="font-display text-4xl md:text-6xl font-black text-white mb-6">
            Your next round<br />could change a life.
          </h2>
          <p className="text-forest-200 text-lg mb-10">
            Join hundreds of golfers turning their passion into purpose.
          </p>
          <Link href="/auth/signup" className="btn-gold text-base py-4 px-10 text-lg">
            Get started today →
          </Link>
        </div>
      </section>

      <Footer />
    </>
  );
}
