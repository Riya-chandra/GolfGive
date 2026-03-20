import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getCurrentUser } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase';
import Navbar from '@/components/layout/Navbar';
import ScoreEntry from '@/components/dashboard/ScoreEntry';
import WinningsSummary from '@/components/dashboard/WinningsSummary';
import { GolfScore, Draw, Winner, MONTH_NAMES } from '@/types';

async function getDashboardData(userId: string) {
  const [scoresRes, latestDrawRes, winningsRes] = await Promise.all([
    supabaseAdmin
      .from('golf_scores')
      .select('*')
      .eq('user_id', userId)
      .order('played_date', { ascending: false })
      .limit(5),
    supabaseAdmin
      .from('draws')
      .select('*')
      .eq('status', 'published')
      .order('year', { ascending: false })
      .order('month', { ascending: false })
      .limit(1),
    supabaseAdmin
      .from('winners')
      .select('*, draws(month, year)')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(5),
  ]);

  return {
    scores: (scoresRes.data || []) as GolfScore[],
    latestDraw: (latestDrawRes.data?.[0] || null) as Draw | null,
    winnings: (winningsRes.data || []) as (Winner & { draws: { month: number; year: number } })[],
  };
}

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  const user = await getCurrentUser();
  if (!user) redirect('/auth/login');

  const { scores, latestDraw, winnings } = await getDashboardData(user.id);

  const isActive = user.subscription_status === 'active';
  const totalWon = winnings.reduce((sum: number, w: Winner) => sum + w.prize_amount, 0);
  const pendingPayout = winnings.filter((w: Winner) => ['pending', 'verification_required'].includes(w.payment_status));

  return (
    <>
      <Navbar user={user} />
      <div className="min-h-screen bg-cream pt-16">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-10">

          {/* Header */}
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="font-display text-3xl font-bold text-charcoal">
                Good to see you, {user.full_name.split(' ')[0]} 👋
              </h1>
              <p className="text-gray-500 text-sm mt-1">
                {isActive
                  ? `Your subscription is active${user.subscription_end ? ` until ${new Date(user.subscription_end).toLocaleDateString('en-GB')}` : ''}.`
                  : 'Activate your subscription to enter draws and log scores.'}
              </p>
            </div>
            {!isActive && (
              <Link href="/auth/signup" className="btn-gold text-sm">
                Activate subscription →
              </Link>
            )}
          </div>

          {/* Subscription banner if inactive */}
          {!isActive && (
            <div className="bg-gold-50 border border-gold-200 rounded-2xl p-5 mb-8 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gold-100 rounded-full flex items-center justify-center text-xl">⚠️</div>
                <div>
                  <div className="font-semibold text-charcoal text-sm">No active subscription</div>
                  <div className="text-gray-500 text-xs">Subscribe to enter draws, log scores, and support your charity.</div>
                </div>
              </div>
              <Link href="/auth/signup" className="btn-primary text-sm flex-shrink-0">Subscribe now</Link>
            </div>
          )}

          {/* Stats Row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {[
              { label: 'Subscription', value: user.subscription_status.charAt(0).toUpperCase() + user.subscription_status.slice(1), color: isActive ? 'text-green-600' : 'text-red-500' },
              { label: 'Scores logged', value: `${scores.length}/5`, color: 'text-forest-600' },
              { label: 'Total winnings', value: `£${totalWon.toFixed(2)}`, color: 'text-gold-600' },
              { label: 'Charity', value: user.charities?.name?.split(' ')[0] || 'None selected', color: 'text-forest-600' },
            ].map((stat) => (
              <div key={stat.label} className="stat-card">
                <div className="text-xs text-gray-400 mb-1">{stat.label}</div>
                <div className={`font-display font-bold text-xl ${stat.color}`}>{stat.value}</div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Score Entry - spans 2 cols */}
            <div className="lg:col-span-2">
              <ScoreEntry scores={scores} isActive={isActive} />
            </div>

            {/* Right column */}
            <div className="space-y-6">
              {/* Latest draw results */}
              {latestDraw && latestDraw.winning_numbers?.length > 0 && (
                <div className="card p-6">
                  <h3 className="font-display font-bold text-lg text-charcoal mb-1">Latest Draw</h3>
                  <p className="text-xs text-gray-400 mb-4">
                    {MONTH_NAMES[latestDraw.month - 1]} {latestDraw.year}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {latestDraw.winning_numbers.map((n: number) => {
                      const userScores = scores.map((s: GolfScore) => s.score);
                      const isMatch = userScores.includes(n);
                      return (
                        <div
                          key={n}
                          className={`number-ball text-sm w-10 h-10 ${isMatch ? 'gold' : ''}`}
                          title={isMatch ? 'Your score!' : ''}
                        >
                          {n}
                        </div>
                      );
                    })}
                  </div>
                  {isActive && scores.length > 0 && (
                    <p className="text-xs text-forest-600 mt-3 font-medium">
                      ✨ Gold numbers match your scores
                    </p>
                  )}
                </div>
              )}

              {/* Charity contribution card */}
              <div className="card p-6">
                <h3 className="font-display font-bold text-lg text-charcoal mb-3">Your charity</h3>
                {user.charities ? (
                  <>
                    <div className="font-semibold text-gray-700">{user.charities.name}</div>
                    <div className="flex items-center gap-2 mt-3">
                      <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-forest-500 rounded-full transition-all"
                          style={{ width: `${user.charity_contribution_pct}%` }}
                        />
                      </div>
                      <span className="text-sm font-bold text-forest-600">{user.charity_contribution_pct}%</span>
                    </div>
                    <p className="text-xs text-gray-400 mt-1">of your subscription</p>
                  </>
                ) : (
                  <div className="text-sm text-gray-500">
                    No charity selected.{' '}
                    <Link href="/charities" className="text-forest-600 hover:underline">Choose one →</Link>
                  </div>
                )}
              </div>

              {/* Pending payouts */}
              {pendingPayout.length > 0 && (
                <div className="card p-6 border-gold-300 border-2">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-xl">🏆</span>
                    <h3 className="font-display font-bold text-lg text-charcoal">You won!</h3>
                  </div>
                  {pendingPayout.map((w: Winner) => (
                    <div key={w.id} className="mb-3">
                      <div className="text-sm font-semibold text-charcoal">£{w.prize_amount.toFixed(2)} — {w.match_type}</div>
                      <div className="text-xs text-gray-500">{w.payment_status === 'pending' ? 'Submit proof to claim' : 'Under review'}</div>
                      {w.payment_status === 'pending' && (
                        <Link href="/dashboard/winnings" className="text-xs text-forest-600 font-medium hover:underline">
                          Submit verification →
                        </Link>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Winnings Summary */}
          {winnings.length > 0 && (
            <div className="mt-8">
              <WinningsSummary winnings={winnings} />
            </div>
          )}
        </div>
      </div>
    </>
  );
}
