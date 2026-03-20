import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-forest-900 text-white">
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-8 h-8 rounded-full bg-gold-500 flex items-center justify-center">
                <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4 text-forest-900">
                  <circle cx="12" cy="12" r="3" fill="currentColor" />
                  <path d="M12 9V3M12 3C8 3 4 7 4 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  <path d="M19 5L12 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </div>
              <span className="font-display font-bold text-xl">GolfGive</span>
            </div>
            <p className="text-forest-200 text-sm leading-relaxed max-w-xs">
              Where every round you play becomes a force for good. Track your scores, compete for prizes, and fund the causes that matter.
            </p>
            <div className="flex items-center gap-3 mt-5">
              <span className="text-xs text-forest-400">Secure payments by</span>
              <span className="text-sm font-semibold text-white bg-forest-700 px-3 py-1 rounded-full">Stripe</span>
            </div>
          </div>

          {/* Platform */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-widest text-forest-300 mb-4">Platform</h4>
            <ul className="space-y-2.5">
              {[
                ['How It Works', '/how-it-works'],
                ['Charities', '/charities'],
                ['Monthly Draws', '/draws'],
                ['Pricing', '/auth/signup'],
              ].map(([label, href]) => (
                <li key={label}>
                  <Link href={href} className="text-sm text-forest-200 hover:text-gold-400 transition-colors">{label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-widest text-forest-300 mb-4">Legal</h4>
            <ul className="space-y-2.5">
              {[
                ['Privacy Policy', '/privacy'],
                ['Terms of Service', '/terms'],
                ['Cookie Policy', '/cookies'],
                ['Contact Us', '/contact'],
              ].map(([label, href]) => (
                <li key={label}>
                  <Link href={href} className="text-sm text-forest-200 hover:text-gold-400 transition-colors">{label}</Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-forest-700 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-forest-400">
            © {new Date().getFullYear()} GolfGive. All rights reserved. Gambling responsibly — monthly draws are prize-based, not gambling.
          </p>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            <span className="text-xs text-forest-400">All systems operational</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
