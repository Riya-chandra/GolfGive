import { notFound } from 'next/navigation';
<<<<<<< HEAD
import Link from 'next/link';
import { supabaseAdmin } from '@/lib/supabase';
import { getSession } from '@/lib/auth';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

=======

import Link from 'next/link';

import { supabaseAdmin } from '@/lib/supabase';

import { getSession } from '@/lib/auth';

import Navbar from '@/components/layout/Navbar';

import Footer from '@/components/layout/Footer';

import DonateButton from '@/components/charities/DonateButton';

import SetCharityButton from '@/components/charities/SetCharityButton';

>>>>>>> 3fda15e (added)
export const dynamic = 'force-dynamic';

export default async function CharityDetailPage({ params }: { params: { slug: string } }) {
  const session = await getSession();

  const { data: charity } = await supabaseAdmin
    .from('charities')
    .select('*, charity_events(*)')
    .eq('slug', params.slug)
    .eq('is_active', true)
    .single();

  if (!charity) notFound();

  const upcomingEvents = (charity.charity_events || [])
    .filter((e: { event_date: string }) => new Date(e.event_date) >= new Date())
    .sort((a: { event_date: string }, b: { event_date: string }) => new Date(a.event_date).getTime() - new Date(b.event_date).getTime());

  const pastEvents = (charity.charity_events || [])
    .filter((e: { event_date: string }) => new Date(e.event_date) < new Date())
    .sort((a: { event_date: string }, b: { event_date: string }) => new Date(b.event_date).getTime() - new Date(a.event_date).getTime())
    .slice(0, 3);

  return (
    <>
      <Navbar user={session ? { full_name: '', role: session.role, email: session.email } : null} />

      {/* Hero */}
      <section className="pt-16 relative">
        <div
          className="h-72 md:h-96 relative overflow-hidden"
          style={{ background: 'linear-gradient(135deg, #0f3517 0%, #1a5c28 50%, #1e6b26 100%)' }}
        >
          <div className="absolute inset-0 flex items-center justify-center opacity-10 text-[20rem] select-none">
            {charity.category === 'Environment' ? '🌿' :
             charity.category === 'Youth & Sport' ? '⛳' :
             charity.category === 'Veterans & Health' ? '🎖️' :
             charity.category === 'Health & Research' ? '🔬' : '📚'}
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
          <div className="absolute bottom-8 left-0 right-0 max-w-7xl mx-auto px-4 md:px-8">
            <Link href="/charities" className="inline-flex items-center gap-1.5 text-white/70 text-sm mb-4 hover:text-white transition-colors">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              All charities
            </Link>
            <div className="flex items-end justify-between gap-4 flex-wrap">
              <div>
                {charity.is_featured && (
                  <span className="badge bg-gold-500 text-charcoal text-xs mb-3 block w-fit">✨ Featured Charity</span>
                )}
                <h1 className="font-display text-4xl md:text-5xl font-black text-white">{charity.name}</h1>
                {charity.category && (
                  <span className="text-white/70 text-sm mt-2 block">{charity.category}</span>
                )}
              </div>
              <div className="text-right">
                <div className="text-white/60 text-xs">Total raised</div>
                <div className="font-display text-3xl font-black text-gold-400">£{charity.total_raised.toFixed(0)}</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="bg-cream py-14">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">

            {/* Main content */}
            <div className="lg:col-span-2">
              <div className="card p-8 mb-6">
                <h2 className="font-display text-2xl font-bold text-charcoal mb-4">About {charity.name}</h2>
                <p className="text-gray-600 leading-relaxed text-base whitespace-pre-line">{charity.description}</p>
                {charity.website && (
                  <a
                    href={charity.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-forest-600 font-medium text-sm mt-5 hover:underline"
                  >
                    Visit website →
                  </a>
                )}
              </div>

              {/* Upcoming events */}
              {upcomingEvents.length > 0 && (
                <div className="card p-8 mb-6">
                  <h2 className="font-display text-2xl font-bold text-charcoal mb-5">
                    🏌️ Upcoming Golf Events
                  </h2>
                  <div className="space-y-4">
                    {upcomingEvents.map((ev: { id: string; title: string; description?: string; event_date: string; location?: string }) => (
                      <div key={ev.id} className="flex gap-4 p-4 bg-forest-50 rounded-xl border border-forest-100">
                        <div className="flex-shrink-0 text-center">
                          <div className="bg-forest-600 text-white rounded-xl w-12 h-12 flex flex-col items-center justify-center">
                            <div className="text-xs font-bold leading-none">
                              {new Date(ev.event_date).toLocaleDateString('en-GB', { day: '2-digit' })}
                            </div>
                            <div className="text-xs leading-none opacity-80">
                              {new Date(ev.event_date).toLocaleDateString('en-GB', { month: 'short' })}
                            </div>
                          </div>
                        </div>
                        <div>
                          <h3 className="font-semibold text-charcoal">{ev.title}</h3>
                          {ev.location && <div className="text-xs text-gray-500 mt-0.5">📍 {ev.location}</div>}
                          {ev.description && <p className="text-sm text-gray-500 mt-2">{ev.description}</p>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Past events */}
              {pastEvents.length > 0 && (
                <div className="card p-8">
                  <h2 className="font-display text-xl font-bold text-charcoal mb-4">Past Events</h2>
                  <div className="space-y-3">
                    {pastEvents.map((ev: { id: string; title: string; event_date: string; location?: string }) => (
                      <div key={ev.id} className="flex gap-3 items-center text-gray-400 text-sm py-2 border-b border-gray-100 last:border-0">
                        <span>📅</span>
                        <span className="font-medium text-gray-500">{ev.title}</span>
                        <span className="ml-auto text-xs">
                          {new Date(ev.event_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </span>
                        {ev.location && <span className="text-xs">· {ev.location}</span>}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-5">
<<<<<<< HEAD
              {/* Donate card */}
=======
              {/* Subscribe & give card */}
>>>>>>> 3fda15e (added)
              <div className="card p-6 border-2 border-forest-600">
                <h3 className="font-display font-bold text-xl text-charcoal mb-2">Support {charity.name.split(' ')[0]}</h3>
                <p className="text-sm text-gray-500 mb-5">
                  Subscribe to GolfGive and choose this charity to receive a portion of every subscription.
                </p>
                <Link
                  href={`/auth/signup?charity=${charity.id}`}
<<<<<<< HEAD
                  className="btn-primary w-full justify-center"
=======
                  className="btn-primary w-full justify-center block text-center"
>>>>>>> 3fda15e (added)
                >
                  Subscribe & give →
                </Link>
                {session && (
                  <div className="mt-3 text-center">
<<<<<<< HEAD
                    <UpdateCharityButton charityId={charity.id} charityName={charity.name} />
=======
                    <SetCharityButton charityId={charity.id} />
>>>>>>> 3fda15e (added)
                  </div>
                )}
              </div>

<<<<<<< HEAD
=======
              {/* Independent donation card */}
              <div className="card p-6">
                <h3 className="font-display font-bold text-lg text-charcoal mb-1">One-off donation</h3>
                <p className="text-sm text-gray-400 mb-4">
                  Not a subscriber? You can still donate directly to {charity.name.split(' ')[0]} — 100% goes to the charity.
                </p>
                <DonateButton
                  charityId={charity.id}
                  charityName={charity.name}
                  isLoggedIn={!!session}
                />
              </div>

>>>>>>> 3fda15e (added)
              {/* Stats */}
              <div className="card p-6">
                <h3 className="font-semibold text-sm text-gray-500 uppercase tracking-wider mb-4">Impact</h3>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-500">Raised this year</span>
                      <span className="font-bold text-charcoal">£{charity.total_raised.toFixed(0)}</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-forest-500 rounded-full"
                        style={{ width: `${Math.min((charity.total_raised / 10000) * 100, 100)}%` }}
                      />
                    </div>
                  </div>
                  <div className="text-xs text-gray-400">
                    Every subscriber who chooses this charity contributes at least 10% of their monthly subscription.
                  </div>
                </div>
              </div>

              {/* Back link */}
              <Link href="/charities" className="flex items-center gap-2 text-sm text-forest-600 hover:underline font-medium">
                ← View all charities
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}

<<<<<<< HEAD
function UpdateCharityButton({ charityId, charityName }: { charityId: string; charityName: string }) {
  return (
    <form action={async () => {
      'use server';
      // This would update the user's selected charity
      // In production: use a proper server action with session
    }}>
      <button type="button" className="text-xs text-forest-600 hover:underline font-medium">
        Set as my charity
      </button>
    </form>
  );
}
=======
// SetCharityButton is imported from @/components/charities/SetCharityButton
>>>>>>> 3fda15e (added)
