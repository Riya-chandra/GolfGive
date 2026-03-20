'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

interface NavProps {
  user?: { full_name: string; role: string; email: string } | null;
}

export default function Navbar({ user }: NavProps) {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/');
    router.refresh();
  };

  const isHome = pathname === '/';

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled || !isHome
          ? 'bg-white/95 backdrop-blur-md shadow-sm border-b border-gray-100'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 md:px-8 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-full bg-forest-600 flex items-center justify-center shadow-sm group-hover:bg-forest-700 transition-colors">
            <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4 text-white" xmlns="http://www.w3.org/2000/svg">
              <circle cx="12" cy="12" r="3" fill="currentColor" />
              <path d="M12 9V3M12 21v-3M12 3C8 3 4 7 4 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              <path d="M19 5L12 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </div>
          <span
            className={`font-display font-bold text-xl tracking-tight ${
              scrolled || !isHome ? 'text-charcoal' : 'text-white'
            }`}
          >
            GolfGive
          </span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-8">
          {['Charities', 'How It Works', 'Draws'].map((item) => (
            <Link
              key={item}
              href={`/${item.toLowerCase().replace(/ /g, '-')}`}
              className={`text-sm font-medium transition-colors hover:text-forest-600 ${
                scrolled || !isHome ? 'text-gray-600' : 'text-white/80'
              }`}
            >
              {item}
            </Link>
          ))}
        </div>

        {/* CTA */}
        <div className="hidden md:flex items-center gap-3">
          {user ? (
            <>
              {user.role === 'admin' && (
                <Link href="/admin" className="text-sm font-medium text-forest-600 hover:underline">
                  Admin
                </Link>
              )}
              <Link href="/dashboard" className="btn-primary text-sm py-2 px-5">
                Dashboard
              </Link>
              <button onClick={handleLogout} className="text-sm text-gray-500 hover:text-red-500 transition-colors">
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                href="/auth/login"
                className={`text-sm font-medium transition-colors ${
                  scrolled || !isHome ? 'text-gray-600 hover:text-forest-600' : 'text-white/80 hover:text-white'
                }`}
              >
                Log in
              </Link>
              <Link href="/auth/signup" className="btn-primary text-sm py-2 px-5">
                Start Free
              </Link>
            </>
          )}
        </div>

        {/* Mobile menu toggle */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className={`md:hidden p-2 rounded-lg ${scrolled || !isHome ? 'text-charcoal' : 'text-white'}`}
        >
          {menuOpen ? (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 px-4 py-4 flex flex-col gap-3 shadow-md">
          <Link href="/charities" className="text-gray-700 text-sm font-medium py-2" onClick={() => setMenuOpen(false)}>Charities</Link>
          <Link href="/how-it-works" className="text-gray-700 text-sm font-medium py-2" onClick={() => setMenuOpen(false)}>How It Works</Link>
          <Link href="/draws" className="text-gray-700 text-sm font-medium py-2" onClick={() => setMenuOpen(false)}>Draws</Link>
          <hr className="border-gray-100" />
          {user ? (
            <>
              <Link href="/dashboard" className="btn-primary text-sm justify-center" onClick={() => setMenuOpen(false)}>Dashboard</Link>
              <button onClick={handleLogout} className="text-sm text-red-500 font-medium py-1">Logout</button>
            </>
          ) : (
            <>
              <Link href="/auth/login" className="text-sm text-gray-600 font-medium py-1" onClick={() => setMenuOpen(false)}>Log in</Link>
              <Link href="/auth/signup" className="btn-primary text-sm justify-center" onClick={() => setMenuOpen(false)}>Get Started</Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
}
