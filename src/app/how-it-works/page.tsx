import Link from 'next/link';

import { getSession } from '@/lib/auth';

import Navbar from '@/components/layout/Navbar';

import Footer from '@/components/layout/Footer';

export const dynamic = 'force-dynamic';

export default async function HowItWorksPage() {
  const session = await getSession();

  return (
    <>
      <Navbar user={session ? { full_name: '', role: session.role, email: session.email } : null} />

      {/* Hero */}
      <section className="pt-28 pb-16 bg-white">
        <div className="max-w-3xl mx-auto px-4 md:px-8 text-center">
          <span className="text-forest-600 text-sm font-semibold uppercase tracking-widest">Simple by design</span>
          <h1 className="font-display text-5xl font-black text-charcoal mt-3 mb-4">
            How GolfGive works
          </h1>
          <p className="text-gray-500 text-lg leading-relaxed">
            A subscription platform that combines golf performance tracking, prize draws, and meaningful charitable giving into one seamless experience.
          </p>
        </div>
      </section>

      {/* Step-by-step */}
      <section className="bg-cream py-16 md:py-24">
        <div className="max-w-4xl mx-auto px-4 md:px-8">
          {[
            {
              step: '01',
              icon: '📋',
              title: 'Subscribe and choose your cause',
              desc: 'Choose a monthly (£9.99) or annual (£99.99) plan and select the charity you want to support. At least 10% of your subscription goes directly to them — you can give up to 100% if you choose.',
              detail: 'Plans include: full score tracking, monthly prize draw entry, charity contribution dashboard, and winner verification system.',
            },
            {
              step: '02',
              icon: '⛳',
              title: 'Log your Stableford scores',
              desc: 'After each round of golf, log your Stableford score (1–45 range) and the date it was played. GolfGive keeps your most recent 5 scores automatically — when you add a 6th, your oldest score drops off.',
              detail: 'Your 5 scores become your personal "draw ticket" — the numbers used in each monthly draw.',
            },
            {
              step: '03',
              icon: '🎯',
              title: 'Enter the monthly draw automatically',
              desc: 'Every month, five winning numbers are drawn from the 1–45 Stableford range. Your entry is automatic — you just need an active subscription and at least one score logged.',
              detail: 'We support two draw types: pure random (lottery-style), and algorithmic (weighted by the most/least common scores across all players).',
            },
            {
              step: '04',
              icon: '🏆',
              title: 'Match numbers and win prizes',
              desc: 'Check your dashboard after each draw to see how your scores matched the winning numbers. Match 3, 4, or all 5 to win a share of the prize pool.',
              detail: (
                <div className="grid grid-cols-3 gap-3 mt-3">
                  {[
                    { match: '3 Numbers', share: '25%', desc: 'Split among all 3-match winners' },
                    { match: '4 Numbers', share: '35%', desc: 'Split among all 4-match winners' },
                    { match: '5 Numbers', share: '40%', desc: 'Jackpot — rolls over if unclaimed' },
                  ].map((t) => (
                    <div key={t.match} className="bg-white rounded-xl p-3 border border-gray-100 text-center">
                      <div className="font-display font-black text-2xl text-forest-600">{t.share}</div>
                      <div className="font-semibold text-xs text-charcoal mt-1">{t.match}</div>
                      <div className="text-xs text-gray-400 mt-0.5">{t.desc}</div>
                    </div>
                  ))}
                </div>
              ),
            },
            {
              step: '05',
              icon: '✅',
              title: 'Claim your prize',
              desc: "If you win, you'll see a notification in your dashboard. Winners need to submit a screenshot of their scores from their golf platform for verification. Our admin team reviews submissions within 48 hours.",
              detail: 'Verification flow: Submit proof → Admin review → Approved → Paid. Jackpot winners go through enhanced verification.',
            },
            {
              step: '06',
              icon: '❤️',
              title: 'Your charity receives contributions',
              desc: "Every month, your chosen charity receives your contribution automatically. You can view your total giving in your dashboard, and you can change your charity or increase your contribution percentage at any time.",
              detail: 'Minimum contribution: 10%. You can go all the way up to 100% if you want your entire subscription to go to your cause. Independent donations (not tied to gameplay) are also available.',
            },
          ].map((item, i) => (
            <div
              key={item.step}
              className={`flex gap-6 md:gap-10 mb-14 ${i % 2 === 1 ? 'flex-row-reverse' : ''}`}
            >
              {/* Step number + icon */}
              <div className="flex-shrink-0 flex flex-col items-center gap-3">
                <div className="w-16 h-16 rounded-2xl bg-white border-2 border-gray-100 flex items-center justify-center text-3xl shadow-sm">
                  {item.icon}
                </div>
                {i < 5 && (
                  <div className="w-px flex-1 min-h-8 bg-gradient-to-b from-gray-200 to-transparent" />
                )}
              </div>

              {/* Content */}
              <div className={`flex-1 pb-4 ${i === 5 ? '' : 'border-b border-gray-100'}`}>
                <div className="font-display font-black text-5xl text-gray-100 leading-none mb-2 select-none">
                  {item.step}
                </div>
                <h2 className="font-display text-2xl font-bold text-charcoal mb-3 -mt-2">{item.title}</h2>
                <p className="text-gray-500 leading-relaxed mb-3">{item.desc}</p>
                {typeof item.detail === 'string' ? (
                  <div className="text-sm text-gray-400 bg-gray-50 rounded-xl px-4 py-3 leading-relaxed">{item.detail}</div>
                ) : item.detail}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="bg-white py-16 md:py-20">
        <div className="max-w-3xl mx-auto px-4 md:px-8">
          <h2 className="font-display text-3xl font-bold text-charcoal mb-10 text-center">Common questions</h2>
          <div className="space-y-4">
            {[
              {
                q: 'Do I need to manually enter my draw entry each month?',
                a: "No. Your current 5 scores are automatically used as your draw entry each month. As long as your subscription is active and you have at least one score logged, you're entered."
              },
              {
                q: 'What happens if nobody wins the jackpot?',
                a: 'The jackpot rolls over to the following month. The 4-match and 3-match pools do not roll over — they are redistributed the next month based on fresh subscriber counts.'
              },
              {
                q: 'Can I change my charity at any time?',
                a: 'Yes. You can update your chosen charity and contribution percentage from your dashboard settings at any time. Changes take effect from your next billing cycle.'
              },
              {
                q: 'What is Stableford format?',
                a: 'Stableford is a scoring system in golf where points are awarded based on performance relative to a fixed score at each hole. Scores typically range from 0 to 45 for a full round — we accept scores between 1 and 45.'
              },
              {
                q: 'How are prizes paid out?',
                a: 'Prizes are paid via bank transfer after identity and score verification. The verification process involves submitting a screenshot of your scores from your golf club or tracking platform.'
              },
              {
                q: 'Is this gambling?',
                a: 'No. GolfGive is a subscription platform where your natural golf scores are used as your entry numbers. It\'s prize-based participation, not gambling. No additional purchases are required to participate in draws.'
              },
            ].map((faq) => (
              <details key={faq.q} className="card group">
                <summary className="px-6 py-4 cursor-pointer font-semibold text-charcoal flex items-center justify-between list-none">
                  {faq.q}
                  <svg className="w-4 h-4 text-gray-400 group-open:rotate-180 transition-transform flex-shrink-0 ml-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </summary>
                <div className="px-6 pb-5 text-gray-500 text-sm leading-relaxed border-t border-gray-50 pt-3">{faq.a}</div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="hero-gradient py-16">
        <div className="max-w-2xl mx-auto px-4 text-center">
          <h2 className="font-display text-4xl font-bold text-white mb-4">Ready to start?</h2>
          <p className="text-forest-200 mb-8">Join for £9.99/month. Cancel any time.</p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link href="/auth/signup" className="btn-gold">Subscribe now →</Link>
            <Link href="/charities" className="inline-flex items-center gap-2 text-white/80 hover:text-white transition-colors font-medium py-3 px-6">
              Explore charities
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}
