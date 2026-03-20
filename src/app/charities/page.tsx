import Link from 'next/link';
import { supabaseAdmin } from '@/lib/supabase';
import { getSession } from '@/lib/auth';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Charity } from '@/types';

async function getCharities() {
  const { data } = await supabaseAdmin
    .from('charities')
    .select('*, charity_events(*)')
    .eq('is_active', true)
    .order('is_featured', { ascending: false })
    .order('total_raised', { ascending: false });
  return (data || []) as (Charity & { charity_events: { id: string; title: string; event_date: string; location?: string }[] })[];
}

const categoryColors: Record<string, string> = {
  Environment: 'bg-green-100 text-green-700',
  'Youth & Sport': 'bg-blue-100 text-blue-700',
  'Veterans & Health': 'bg-orange-100 text-orange-700',
  'Health & Research': 'bg-red-100 text-red-700',
  Education: 'bg-purple-100 text-purple-700',
};

export const dynamic = 'force-dynamic';

export default async function CharitiesPage() {
  const session = await getSession();
  const charities = await getCharities();

  return (
    <>
      <Navbar user={session ? { full_name: '', role: session.role, email: session.email } : null} />

      {/* Header */}
      <section className="pt-28 pb-16 bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="max-w-2xl">
            <span className="text-forest-600 text-sm font-semibold uppercase tracking-widest">Where your money goes</span>
            <h1 className="font-display text-5xl font-black text-charcoal mt-3 mb-4">
              Causes that<br />
              <em className="not-italic text-forest-600">matter.</em>
            </h1>
            <p className="text-gray-500 text-lg leading-relaxed">
              Every GolfGive subscription supports one of our vetted charity partners. At least 10% of your subscription goes directly to your chosen cause — you can always give more.
            </p>
          </div>
        </div>
      </section>

      {/* Charities grid */}
      <section className="bg-cream py-16">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          {/* Featured */}
          {charities.filter(c => c.is_featured).length > 0 && (
            <>
              <h2 className="font-display text-2xl font-bold text-charcoal mb-6 flex items-center gap-3">
                <span>✨</span> Featured Charities
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-14">
                {charities.filter(c => c.is_featured).map(charity => (
                  <CharityCard key={charity.id} charity={charity} featured />
                ))}
              </div>
            </>
          )}

          {/* All */}
          <h2 className="font-display text-2xl font-bold text-charcoal mb-6">All Charities</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {charities.map(charity => (
              <CharityCard key={charity.id} charity={charity} />
            ))}
          </div>
        </div>
      </section>

      {/* CTA banner */}
      <section className="bg-forest-900 py-14">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="font-display text-3xl font-bold text-white mb-4">
            Ready to play with purpose?
          </h2>
          <p className="text-forest-200 mb-8">
            Subscribe to GolfGive and start supporting your chosen charity with every round you play.
          </p>
          <Link href="/auth/signup" className="btn-gold">
            Choose your charity →
          </Link>
        </div>
      </section>

      <Footer />
    </>
  );
}

function CharityCard({ charity, featured }: {
  charity: Charity & { charity_events?: { id: string; title: string; event_date: string; location?: string }[] };
  featured?: boolean;
}) {
  const catColor = categoryColors[charity.category || ''] || 'bg-gray-100 text-gray-600';
  const upcomingEvents = charity.charity_events?.filter(
    e => new Date(e.event_date) >= new Date()
  ).slice(0, 2) || [];

  return (
    <Link href={`/charities/${charity.slug}`} className="card-hover block group">
      {/* Cover */}
      <div className={`h-44 relative overflow-hidden ${featured ? 'h-52' : ''}`}
        style={{ background: 'linear-gradient(135deg, #1a5c28, #2d8535)' }}
      >
        <div className="absolute inset-0 flex items-center justify-center opacity-10 text-9xl select-none">
          {charity.category === 'Environment' ? '🌿' :
           charity.category === 'Youth & Sport' ? '⛳' :
           charity.category === 'Veterans & Health' ? '🎖️' :
           charity.category === 'Health & Research' ? '🔬' : '📚'}
        </div>
        {charity.is_featured && (
          <div className="absolute top-3 right-3 bg-gold-500 text-charcoal text-xs font-bold px-3 py-1 rounded-full">
            Featured
          </div>
        )}
        <div className="absolute bottom-3 left-3">
          <span className={`badge text-xs ${catColor}`}>{charity.category}</span>
        </div>
      </div>

      {/* Content */}
      <div className="p-5">
        <h3 className="font-display font-bold text-lg text-charcoal mb-2 group-hover:text-forest-600 transition-colors leading-tight">
          {charity.name}
        </h3>
        <p className="text-gray-500 text-sm leading-relaxed line-clamp-3 mb-4">
          {charity.short_description || charity.description}
        </p>

        {/* Raised */}
        <div className="mb-3">
          <div className="flex justify-between text-xs mb-1">
            <span className="text-gray-400">Total raised</span>
            <span className="font-semibold text-forest-600">£{charity.total_raised.toFixed(0)}</span>
          </div>
          <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-forest-500 to-forest-400 rounded-full"
              style={{ width: `${Math.min((charity.total_raised / 10000) * 100, 100)}%` }}
            />
          </div>
        </div>

        {/* Upcoming events */}
        {upcomingEvents.length > 0 && (
          <div className="border-t border-gray-100 pt-3 mt-3">
            <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Upcoming events</div>
            {upcomingEvents.map(ev => (
              <div key={ev.id} className="text-xs text-gray-500 flex gap-2 items-center mb-1">
                <span className="text-forest-500">📅</span>
                <span>{ev.title} · {new Date(ev.event_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}</span>
              </div>
            ))}
          </div>
        )}

        <div className="flex items-center gap-1 text-xs font-medium text-forest-600 mt-3 group-hover:gap-2 transition-all">
          Learn more
          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </div>
    </Link>
  );
}
