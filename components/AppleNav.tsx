'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

const NavIcon = ({ type, size = 20 }: { type: string; size?: number }) => {
  if (type === 'home') {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
        <polyline points="9,22 9,12 15,12 15,22"/>
      </svg>
    );
  }
  if (type === 'plus') {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <line x1="12" y1="5" x2="12" y2="19"/>
        <line x1="5" y1="12" x2="19" y2="12"/>
      </svg>
    );
  }
  if (type === 'menu') {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <line x1="4" y1="6" x2="20" y2="6"/>
        <line x1="4" y1="12" x2="20" y2="12"/>
        <line x1="4" y1="18" x2="20" y2="18"/>
      </svg>
    );
  }
  if (type === 'close') {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <line x1="18" y1="6" x2="6" y2="18"/>
        <line x1="6" y1="6" x2="18" y2="18"/>
      </svg>
    );
  }
  return null;
};

export default function AppleNav() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  const navItems = [
    { href: '/', label: 'Home', icon: 'home' },
    { href: '/create', label: 'Create', icon: 'plus' },
  ];

  return (
    <>
      <nav
        className="fixed top-0 left-0 right-0 z-[9999] bg-[var(--color-background)]/80 backdrop-blur-xl border-b border-white/[0.05]"
        role="navigation"
        aria-label="Main navigation"
      >
        <div className="w-full max-w-[1200px] mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          {/* Logo */}
          <Link
            href="/"
            className="group flex items-center gap-3 text-sm font-semibold transition-all duration-200 py-2 px-3 rounded-xl hover:bg-white/[0.04] active:scale-[0.98]"
            aria-label="DeadDrop Home"
          >
            <div className="p-[6px] rounded-xl bg-gradient-to-b from-[var(--color-cta)] to-emerald-600 text-black shadow-[0_0_15px_rgba(34,197,94,0.4)] group-hover:shadow-[0_0_25px_rgba(34,197,94,0.6)] transition-all duration-300">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
                <path d="M12 22V12"/>
                <polyline points="8 8 12 12 16 8"/>
              </svg>
            </div>
            <span className="font-heading font-bold tracking-[0.1em] text-[var(--color-text)] uppercase text-xs">DeadDrop</span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden sm:flex items-center gap-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`relative flex items-center gap-2.5 px-4 py-2.5 text-sm font-medium rounded-xl transition-all duration-200 active:scale-[0.97] ${isActive ? 'text-[var(--color-cta)] bg-[var(--color-cta)]/10' : 'text-[var(--color-secondary)] hover:text-[var(--color-primary)] hover:bg-white/[0.05]'}`}
                  aria-current={isActive ? 'page' : undefined}
                >
                  <NavIcon type={item.icon} size={18} />
                  {item.label}
                </Link>
              );
            })}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="sm:hidden flex items-center justify-center w-11 h-11 rounded-xl text-white hover:bg-white/[0.05] active:bg-white/[0.1] transition-colors"
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={menuOpen}
          >
            <NavIcon type={menuOpen ? 'close' : 'menu'} size={20} />
          </button>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      {menuOpen && (
        <div
          className="fixed inset-0 z-[9998] bg-black/60 backdrop-blur-sm sm:hidden"
          onClick={() => setMenuOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Mobile Menu Panel */}
      {menuOpen && (
        <div className="fixed top-16 left-0 right-0 z-[9999] bg-[var(--color-background)]/95 backdrop-blur-xl border-b border-white/[0.05] shadow-2xl sm:hidden">
          <div className="px-4 py-4 space-y-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMenuOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3.5 rounded-xl text-base font-medium transition-all duration-200 active:scale-[0.98] ${isActive ? 'text-[var(--color-cta)] bg-[var(--color-cta)]/10' : 'text-[var(--color-secondary)] hover:text-white hover:bg-white/[0.05]'}`}
                  aria-current={isActive ? 'page' : undefined}
                >
                  <NavIcon type={item.icon} size={20} />
                  {item.label}
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </>
  );
}


