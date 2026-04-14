'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

export default function AppleNav() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  const navItems = [
    { href: '/', label: 'Home', icon: 'home' },
    { href: '/create', label: 'Create', icon: 'plus' },
  ];

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

  return (
    <>
      <nav
        className="fixed top-0 left-0 right-0 z-[9999] bg-[#050810]/80 backdrop-blur-xl border-b border-white/[0.06]"
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
            <div className="p-2 rounded-xl bg-[#00FF94]/8 border border-[#00FF94]/15 group-hover:bg-[#00FF94]/12 transition-colors duration-200">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-[#00FF94]" aria-hidden="true">
                <path d="M12 2L2 7l10 5 10-5-10-5z"/>
                <path d="M2 17l10 5 10-5"/>
                <path d="M2 12l10 5 10-5"/>
              </svg>
            </div>
            <span className="font-display font-bold tracking-tight text-white">DeadDrop</span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden sm:flex items-center gap-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`relative flex items-center gap-2.5 px-4 py-2.5 text-sm font-medium rounded-xl transition-all duration-200 active:scale-[0.97] ${
                    isActive
                      ? 'text-[#00FF94] bg-[#00FF94]/8'
                      : 'text-white/60 hover:text-white hover:bg-white/[0.06]'
                  }`}
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
            className="sm:hidden flex items-center justify-center w-11 h-11 rounded-xl hover:bg-white/[0.06] active:bg-white/[0.1] transition-colors"
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
          className="fixed inset-0 z-[9998] bg-black/60 backdrop-blur-sm animate-fade-in sm:hidden"
          onClick={() => setMenuOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Mobile Menu Panel */}
      {menuOpen && (
        <div className="fixed top-16 left-0 right-0 z-[9999] bg-[#0d1117]/95 backdrop-blur-xl border-b border-white/[0.08] shadow-2xl animate-fade-in-down sm:hidden">
          <div className="px-4 py-4 space-y-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMenuOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3.5 rounded-xl text-base font-medium transition-all duration-200 active:scale-[0.98] ${
                    isActive
                      ? 'text-[#00FF94] bg-[#00FF94]/8'
                      : 'text-white/70 hover:text-white hover:bg-white/[0.06]'
                  }`}
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
