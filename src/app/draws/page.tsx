import { supabaseAdmin } from '@/lib/supabase';

import { getSession } from '@/lib/auth';

import Navbar from '@/components/layout/Navbar';

import Footer from '@/components/layout/Footer';

import { Draw, MONTH_NAMES } from '@/types';

async function getDrawsData() {
  const [drawsRes, winnersRes] = await Promise.all([
    supabaseAdmin
      .from('draws')
      .select('*')
      .eq('status', 'published')
      .order('year', { ascending: false })
      .order('month', { ascending: false }),
    supabaseAdmin
      .from('winners')
      .select('draw_id, match_type, prize_amount, payment_status')
      .in('payment_status', ['paid', 'approved', 'verification_required', 'pending']),
  ]);

  return {
    draws: (drawsRes.data || []) as Draw[],
    winners: (drawsRes.data ? winnersRes.data || [] : []) as Array<{
    draw_id: string;
    match_type: string;
    prize_amount: number;
    payment_status: string;
  }>,
  };
}

export const dynamic = 'force-dynamic';

export default async function DrawsPage() {
  const session = await getSession();
  const { draws, winners } = await getDrawsData();

  // Group winners by draw
  const winnersByDraw: Record<string, typeof winners> = {};
  winners.forEach((w) => {
    if (!winnersByDraw[w.draw_id]) winnersByDraw[w.draw_id] = [];
    winnersByDraw[w.draw_id].push(w);
  });

  return (
    <>
      <Navbar user={session ? { full_name: '', role: session.role, email: session.email } : null} />

      {/* Header */}
      <section className="pt-28 pb-14 hero-gradient relative overflow-hidden">
        <div className="absolute top-1/2 right-16 -translate-y-1/2 opacity-10 text-[16rem] select-none hidden lg:block">🎯</div>
        <div className="max-w-7xl mx-auto px-4 md:px-8 relative z-10">
          <span className="text-forest-300 text-sm font-semibold uppercase tracking-widest">Results & History</span>
          <h1 className="font-display text-5xl font-black text-white mt-2 mb-4">
            Monthly Draws
          </h1>
          <p className="text-forest-200 text-lg max-w-xl leading-relaxed">
            Each month, five winning numbers are drawn from the Stableford score range (1–45). Match 3, 4, or all 5 to win a share of the prize pool.
          </p>
        </div>
      </section>

      {/* How it works quick explainer */}
      <section className="bg-white border-b border-gray-100 py-8">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="grid grid-cols-3 gap-6 text-center max-w-2xl mx-auto">
            {[
              { match: '3 Numbers', prize: '25% pool', color: 'bg-gray-100 text-gray-700' },
              { match: '4 Numbers', prize: '35% pool', color: 'bg-forest-100 text-forest-700' },
              { match: '5 Numbers', prize: '40% Jackpot', color: 'bg-gold-100 text-gold-700' },
            ].map((t) => (
              <div key={t.match} className="flex flex-col items-center gap-2">
                <span className={`badge ${t.color} text-xs`}>{t.match}</span>
                <span className="text-sm font-semibold text-charcoal">{t.prize}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Draws list */}
      <section className="bg-cream py-14">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          {draws.length === 0 ? (
            <div className="text-center py-20">
              <div className="text-6xl mb-4">🎯</div>
              <h2 className="font-display text-2xl font-bold text-charcoal mb-2">No draws yet</h2>
              <p className="text-gray-500">Check back soon — draws run monthly.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {draws.map((draw, idx) => {
                const drawWinners = winnersByDraw[draw.id] || [];
                const hasJackpot = draw.jackpot_rolled_over;
                const isLatest = idx === 0;

                return (
                  <div
                    key={draw.id}
                    className={`card p-6 md:p-8 ${isLatest ? 'border-2 border-forest-500' : ''}`}
                  >
                    {/* Header row */}
                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-6">
                      <div>
                        <div className="flex items-center gap-3 mb-1">
                          <h2 className="font-display text-2xl font-bold text-charcoal">
                            {MONTH_NAMES[draw.month - 1]} {draw.year}
                          </h2>
                          {isLatest && <span className="badge badge-green">Latest</span>}
                          {hasJackpot && <span className="badge badge-gold">Jackpot rolled over</span>}
                        </div>
                        <div className="text-xs text-gray-400 capitalize">
                          {draw.draw_type} draw ·{' '}
                          {draw.published_at
                            ? `Published ${new Date(draw.published_at).toLocaleDateString('en-GB')}`
                            : 'Published'}
                        </div>
                      </div>
                      <div className="flex gap-6 text-right flex-wrap">
                        <div>
                          <div className="text-xs text-gray-400">Total pool</div>
                          <div className="font-display font-bold text-xl text-charcoal">£{draw.total_pool.toFixed(2)}</div>
                        </div>
                        <div>
                          <div className="text-xs text-gray-400">Jackpot</div>
                          <div className="font-display font-bold text-xl text-gold-600">£{draw.jackpot_pool.toFixed(2)}</div>
                        </div>
                        <div>
                          <div className="text-xs text-gray-400">Winners</div>
                          <div className="font-display font-bold text-xl text-forest-600">{drawWinners.length}</div>
                        </div>
                      </div>
                    </div>

                    {/* Winning numbers */}
                    <div className="mb-6">
                      <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Winning Numbers</div>
                      <div className="flex flex-wrap gap-3">
                        {draw.winning_numbers.map((n: number) => (
                          <div key={n} className={`number-ball w-14 h-14 text-lg ${isLatest ? 'gold' : ''}`}>
                            {n}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Prize pools */}
                    <div className="grid grid-cols-3 gap-3">
                      {[
                        { label: '5-Match (Jackpot)', amount: draw.jackpot_pool, color: 'bg-gold-50 border-gold-200', textColor: 'text-gold-700' },
                        { label: '4-Match', amount: draw.four_match_pool, color: 'bg-forest-50 border-forest-200', textColor: 'text-forest-700' },
                        { label: '3-Match', amount: draw.three_match_pool, color: 'bg-gray-50 border-gray-200', textColor: 'text-gray-700' },
                      ].map((tier) => {
                        const tierWinners = drawWinners.filter((w: { match_type: string }) => {
                          if (tier.label.includes('5')) return w.match_type === '5-match';
                          if (tier.label.includes('4')) return w.match_type === '4-match';
                          return w.match_type === '3-match';
                        });
                        return (
                          <div key={tier.label} className={`rounded-xl border ${tier.color} p-3 text-center`}>
                            <div className={`font-bold text-lg ${tier.textColor}`}>£{tier.amount.toFixed(2)}</div>
                            <div className="text-xs text-gray-500 mt-0.5">{tier.label}</div>
                            <div className="text-xs text-gray-400 mt-1">
                              {tierWinners.length > 0 ? `${tierWinners.length} winner(s)` : 'No winners'}
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {draw.rollover_amount > 0 && (
                      <p className="text-xs text-amber-600 mt-3 font-medium">
                        ℹ️ Includes £{draw.rollover_amount.toFixed(2)} rolled over from previous month
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      <Footer />
    </>
  );
}
