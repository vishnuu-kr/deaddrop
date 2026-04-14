import Link from 'next/link';

export default function Home() {
  return (
    <div className="bg-[#020408]">
      {/* ═══════════════════════════════════════════════════════
          HERO SECTION — Immersive Dark Protocol
         ═══════════════════════════════════════════════════════ */}
      <section className="min-h-[100dvh] flex flex-col items-center justify-center text-center px-4 sm:px-6 py-24 relative overflow-hidden bg-glow-strong">
        {/* Animated grid background */}
        <div className="absolute inset-0 bg-grid opacity-60" aria-hidden="true" />

        {/* Animated scanline */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
          <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#00FF94] to-transparent opacity-40 animate-scan" />
        </div>

        {/* Radial glow behind content */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(0,255,148,0.06)_0%,transparent_70%)] pointer-events-none" aria-hidden="true" />

        {/* Floating particles (decorative) */}
        <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
          <div className="absolute top-1/4 left-1/4 w-1 h-1 bg-[#00FF94]/20 rounded-full animate-float" style={{ animationDelay: '0s' }} />
          <div className="absolute top-1/3 right-1/3 w-1.5 h-1.5 bg-[#00FF94]/15 rounded-full animate-float" style={{ animationDelay: '1s' }} />
          <div className="absolute bottom-1/3 left-1/3 w-1 h-1 bg-[#00D4FF]/20 rounded-full animate-float" style={{ animationDelay: '2s' }} />
        </div>

        <div className="relative z-10 max-w-[800px] mx-auto animate-fade-in">
          {/* Protocol status badge */}
          <div className="inline-flex items-center gap-2.5 mb-8 px-4 py-2.5 rounded-full bg-[#00FF94]/5 border border-[#00FF94]/20 backdrop-blur-sm">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00FF94] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#00FF94]"></span>
            </span>
            <span className="micro-text text-[#00FF94] tracking-wider">
              Encrypted Protocol Active
            </span>
          </div>

          {/* Main headline */}
          <h1 className="hero-headline text-white mb-6">
            <span className="text-gradient text-shadow-glow">DeadDrop</span>
          </h1>

          {/* Subtitle */}
          <p className="subtitle text-white/50 max-w-lg mx-auto mb-12 text-base sm:text-lg leading-relaxed">
            Anonymous geofenced messaging.<br className="hidden sm:block" />
            Zero accounts. Zero identities. Zero traces.
          </p>

          {/* CTA buttons */}
          <div className="flex flex-col sm:flex-row items-center gap-4 flex-wrap justify-center">
            <Link href="/create" className="btn-primary text-sm w-full sm:w-auto text-center justify-center flex" aria-label="Create a new dead drop">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M12 2L2 7l10 5 10-5-10-5z"/>
                <path d="M2 17l10 5 10-5"/>
                <path d="M2 12l10 5 10-5"/>
              </svg>
              Create a Drop
            </Link>
            <Link href="#how-it-works" className="btn-secondary text-sm w-full sm:w-auto text-center justify-center flex" aria-label="Learn how DeadDrop works">
              Learn more
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M6 9l6 6 6-6"/>
              </svg>
            </Link>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce opacity-50">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M12 5v14"/>
            <path d="m19 12-7 7-7-7"/>
          </svg>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          HOW IT WORKS — Three Step Protocol
         ═══════════════════════════════════════════════════════ */}
      <section id="how-it-works" className="bg-[#0A0E17] py-20 sm:py-28 px-4 sm:px-6 relative">
        <div className="max-w-[1200px] mx-auto">
          {/* Section header */}
          <div className="text-center mb-14 sm:mb-20 animate-fade-in-up">
            <span className="micro-text text-[#00FF94] tracking-widest mb-4 block">
              Protocol Steps
            </span>
            <h2 className="section-heading text-white mb-4">
              How it works
            </h2>
            <p className="subtitle text-white/50 max-w-2xl mx-auto text-base sm:text-lg">
              Three steps to deploy an encrypted message drop
            </p>
          </div>

          {/* Steps grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6">
            {[
              {
                step: '01',
                title: 'Drop a pin',
                desc: 'Click anywhere on the map to set your target coordinates. Adjust the unlock radius from 10m to 500m.',
                icon: (
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/>
                    <circle cx="12" cy="10" r="3"/>
                  </svg>
                ),
              },
              {
                step: '02',
                title: 'Encrypt & deploy',
                desc: 'Your message is encrypted locally with AES-256-GCM. Only the ciphertext reaches the server.',
                icon: (
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <rect width="18" height="11" x="3" y="11" rx="2" ry="2"/>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                  </svg>
                ),
              },
              {
                step: '03',
                title: 'Share the link',
                desc: 'The burner link contains the decryption key in its URL hash — never sent to any server.',
                icon: (
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
                    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
                  </svg>
                ),
              },
            ].map((item, idx) => (
              <div
                key={item.step}
                className="card-tactical text-center animate-fade-in-up"
                style={{ animationDelay: `${idx * 0.1}s` }}
              >
                {/* Step number */}
                <div className="inline-flex items-center justify-center mb-5">
                  <div className="w-12 h-12 rounded-full border-2 border-[#00FF94]/40 flex items-center justify-center bg-[#00FF94]/5 shadow-[0_0_16px_rgba(0,255,148,0.15)]">
                    <span className="text-[#00FF94] font-mono text-sm font-bold">
                      {item.step}
                    </span>
                  </div>
                </div>

                {/* Icon */}
                <div className="text-[#00FF94]/80 mb-4 flex justify-center">
                  {item.icon}
                </div>

                <h3 className="card-heading text-white mb-3">
                  {item.title}
                </h3>

                <p className="caption text-white/45 leading-relaxed max-w-[280px] mx-auto">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          SECURITY FEATURES — Bento Grid Architecture
         ═══════════════════════════════════════════════════════ */}
      <section className="bg-[#020408] py-20 sm:py-28 px-4 sm:px-6 relative bg-grid">
        <div className="max-w-[1200px] mx-auto">
          {/* Section header */}
          <div className="text-center mb-14 sm:mb-20 animate-fade-in-up">
            <span className="micro-text text-[#00FF94] tracking-widest mb-4 block">
              Security Architecture
            </span>
            <h2 className="section-heading text-white mb-4">
              Zero knowledge.
            </h2>
            <p className="subtitle text-white/50 max-w-2xl mx-auto text-base sm:text-lg">
              The server never sees your message, your key, or your identity.
              It only stores encrypted coordinates.
            </p>
          </div>

          {/* Bento grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 max-w-[1000px] mx-auto">
            {[
              {
                label: 'Encryption',
                value: 'AES-256-GCM',
                icon: (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"/>
                  </svg>
                )
              },
              {
                label: 'Key exchange',
                value: 'URL hash fragment',
                icon: (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
                    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
                  </svg>
                )
              },
              {
                label: 'Identity',
                value: 'None required',
                icon: (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
                    <circle cx="9" cy="7" r="4"/>
                    <line x1="17" x2="17" y1="8" y2="13"/>
                    <line x1="14" x2="20" y1="10.5" y2="10.5"/>
                  </svg>
                )
              },
              {
                label: 'Expiry',
                value: '24 hours',
                icon: (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <circle cx="12" cy="12" r="10"/>
                    <polyline points="12,6 12,12 16,14"/>
                  </svg>
                )
              },
              {
                label: 'Self-destruct',
                value: 'On first read',
                icon: (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M12 16v-4"/>
                    <path d="M12 8h.01"/>
                    <path d="M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"/>
                  </svg>
                )
              },
              {
                label: 'Server knowledge',
                value: 'Ciphertext only',
                icon: (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <rect width="18" height="11" x="3" y="11" rx="2" ry="2"/>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                  </svg>
                )
              },
            ].map((item, idx) => (
              <div
                key={item.label}
                className="card-tactical group cursor-default animate-fade-in-up"
                style={{ animationDelay: `${idx * 0.05}s` }}
              >
                <div className="flex items-start gap-3.5">
                  <div className="p-2.5 rounded-xl bg-[#00FF94]/6 border border-[#00FF94]/10 text-[#00FF94]/80 flex-shrink-0 transition-colors duration-200 group-hover:bg-[#00FF94]/10 group-hover:text-[#00FF94]">
                    {item.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="micro-text text-white/40 mb-1.5">
                      {item.label}
                    </p>
                    <p className="card-heading text-white text-lg">
                      {item.value}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          CTA SECTION — Final Conversion
         ═══════════════════════════════════════════════════════ */}
      <section className="bg-[#0A0E17] py-20 sm:py-28 px-4 sm:px-6 relative overflow-hidden">
        {/* Background glow */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(0,255,148,0.05)_0%,transparent_70%)] pointer-events-none" aria-hidden="true" />

        <div className="max-w-[640px] mx-auto text-center relative z-10 animate-fade-in-up">
          <span className="micro-text text-[#00FF94] tracking-widest mb-4 block">
            Ready to deploy?
          </span>
          <h2 className="section-heading text-white mb-4">
            Create your first drop
          </h2>
          <p className="subtitle text-white/50 mb-10 text-base sm:text-lg">
            Set up an encrypted dead-drop in seconds. No accounts needed.
          </p>
          <Link href="/create" className="btn-primary text-sm" aria-label="Create your first dead drop">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M12 2L2 7l10 5 10-5-10-5z"/>
              <path d="M2 17l10 5 10-5"/>
              <path d="M2 12l10 5 10-5"/>
            </svg>
            Create a Drop
          </Link>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          FOOTER
         ═══════════════════════════════════════════════════════ */}
      <footer className="bg-[#020408] py-10 px-4 sm:px-6 border-t border-white/[0.04]">
        <div className="max-w-[1200px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-[#00FF94]/6">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-[#00FF94]" aria-hidden="true">
                <path d="M12 2L2 7l10 5 10-5-10-5z"/>
                <path d="M2 17l10 5 10-5"/>
                <path d="M2 12l10 5 10-5"/>
              </svg>
            </div>
            <span className="micro-text text-white/30 tracking-wide">
              DeadDrop
            </span>
          </div>
          <p className="caption text-white/30 text-center">
            Anonymous geofenced messaging. No accounts. No identities. No traces.
          </p>
          <div className="flex items-center gap-1.5">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full rounded-full bg-[#00FF94] opacity-40"></span>
            </span>
            <span className="micro-text text-[#00FF94]/50">
              Active
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
