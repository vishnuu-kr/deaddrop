import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-[var(--color-background)] text-[var(--color-text)] flex flex-col items-center selection:bg-[var(--color-cta)] selection:text-[var(--color-background)]">
      
      {/* -------------------------------------------------------
          BACKGROUND Elements (Pure Minimal Dark)
         ------------------------------------------------------- */}
      <div className="fixed inset-0 pointer-events-none z-0 flex items-center justify-center overflow-hidden">
        <div className="absolute w-full h-full bg-[radial-gradient(circle_at_50%_0%,rgba(34,197,94,0.03)_0%,transparent_50%)]" />
      </div>

      {/* -------------------------------------------------------
          SECTION 1: HERO
         ------------------------------------------------------- */}
      <section className="relative z-10 flex-col items-center text-center pt-40 pb-32 px-6 max-w-5xl mx-auto w-full">
        <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full mb-12 text-xs font-semibold tracking-[0.2em] uppercase border border-white/10 bg-white/[0.02]">
          <span className="relative flex h-2 w-2">
            <span className="animate-pulse absolute inline-flex h-full w-full rounded-full bg-[var(--color-cta)] opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-[var(--color-cta)]"></span>
          </span>
          Protocol Active
        </div>

        <h1 className="text-[clamp(4rem,9vw,8rem)] leading-[0.95] font-bold tracking-tighter mb-8">
          Encrypted drops.<br />
          <span className="text-transparent bg-clip-text bg-gradient-to-br from-white via-white/80 to-white/20">Unseen limits.</span>
        </h1>

        <p className="text-lg md:text-xl text-[var(--color-secondary)] max-w-2xl mx-auto mb-16 leading-relaxed font-light">
          Anonymous geofenced messaging secured by advanced cryptography. 
          No accounts. No logs. Pure client-side privacy.
        </p>

        {/* CTA */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
          <Link href="/create" className="btn-primary text-lg px-12 py-5 shadow-[0_0_40px_-10px_rgba(34,197,94,0.3)]">
            Initialize Drop
          </Link>
          <a href="#how-it-works" className="text-[var(--color-secondary)] hover:text-[var(--color-text)] uppercase tracking-wider text-sm font-semibold transition-colors duration-300">
            Learn More &#8595;
          </a>
        </div>
      </section>

      {/* -------------------------------------------------------
          SECTION 2: FEATURES GRID
         ------------------------------------------------------- */}
      <section className="relative z-10 w-full py-32 px-6 border-t border-white/5">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-24 gap-8 text-center md:text-left">
             <div>
               <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-4 text-[var(--color-text)]">Military-Grade Security</h2>
               <p className="text-[var(--color-secondary)] text-lg max-w-xl mx-auto md:mx-0">Built around principles of zero-trust architecture and ephemeral storage.</p>
             </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-16">
            
            <div className="relative group pt-8 text-center md:text-left">
              <div className="absolute top-0 left-0 w-full h-[1px] bg-white/10 transition-colors duration-500 group-hover:bg-white/30 hidden md:block"></div>
              <div className="absolute top-0 left-0 w-0 h-[2px] bg-[var(--color-cta)] group-hover:w-1/3 transition-all duration-500 ease-out hidden md:block"></div>
              
              <div className="text-[var(--color-cta)] mb-8 opacity-80 group-hover:opacity-100 transition-opacity flex justify-center md:justify-start">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/></svg>
              </div>
              <h3 className="font-bold text-2xl mb-4 text-[var(--color-text)]">Zero Knowledge</h3>
              <p className="text-[var(--color-secondary)] leading-relaxed font-light">
                We never touch your keys. Decryption happens purely on your local device. The server only sees unreadable ciphertext.
              </p>
            </div>
            
            <div className="relative group pt-8 text-center md:text-left">
              <div className="absolute top-0 left-0 w-full h-[1px] bg-white/10 transition-colors duration-500 group-hover:bg-white/30 hidden md:block"></div>
              <div className="absolute top-0 left-0 w-0 h-[2px] bg-[var(--color-cta)] group-hover:w-1/3 transition-all duration-500 ease-out hidden md:block"></div>
              
              <div className="text-[var(--color-cta)] mb-8 opacity-80 group-hover:opacity-100 transition-opacity flex justify-center md:justify-start">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
              </div>
              <h3 className="font-bold text-2xl mb-4 text-[var(--color-text)]">Geofenced</h3>
              <p className="text-[var(--color-secondary)] leading-relaxed font-light">
                Messages are mathematically locked to exact GPS coordinates. Recipients must be physically present to unlock them.
              </p>
            </div>
            
            <div className="relative group pt-8 text-center md:text-left">
              <div className="absolute top-0 left-0 w-full h-[1px] bg-white/10 transition-colors duration-500 group-hover:bg-white/30 hidden md:block"></div>
              <div className="absolute top-0 left-0 w-0 h-[2px] bg-[var(--color-cta)] group-hover:w-1/3 transition-all duration-500 ease-out hidden md:block"></div>
              
              <div className="text-[var(--color-cta)] mb-8 opacity-80 group-hover:opacity-100 transition-opacity flex justify-center md:justify-start">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
              </div>
              <h3 className="font-bold text-2xl mb-4 text-[var(--color-text)]">Ephemeral</h3>
              <p className="text-[var(--color-secondary)] leading-relaxed font-light">
                Drops burn instantly after reading. Leftover data is purged from servers continuously. No backups, no recovery.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* -------------------------------------------------------
          SECTION 3: THE PROTOCOL
         ------------------------------------------------------- */}
      <section id="how-it-works" className="relative z-10 w-full py-32 px-6 border-t border-white/5">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-24 gap-8 text-center md:text-left">
            <div>
              <h2 className="text-4xl md:text-5xl font-bold mb-4 tracking-tight">The Protocol</h2>
              <p className="text-[var(--color-secondary)] text-lg max-w-xl mx-auto md:mx-0">A frictionless three-step process to pure anonymity.</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-16">
            
            {/* Step 1 */}
            <div className="relative group pt-8 text-center md:text-left">
              <div className="absolute top-0 left-0 w-full h-[1px] bg-white/10 transition-colors duration-500 hidden md:block"></div>
              <div className="absolute top-0 left-0 w-0 h-[2px] bg-[var(--color-cta)] group-hover:w-full transition-all duration-700 ease-out hidden md:block"></div>
              
              <div className="text-6xl font-bold text-white/[0.03] mb-6 group-hover:text-[var(--color-cta)]/20 transition-colors duration-500">01</div>
              <h3 className="text-2xl font-bold mb-4 text-[var(--color-text)]">Encrypt</h3>
              <p className="text-[var(--color-secondary)] leading-relaxed font-light">
                Write your message. The app generates a local AES-GCM key and encrypts it immediately, directly inside your browser. No plaintext ever leaves your device.
              </p>
            </div>

            {/* Step 2 */}
            <div className="relative group pt-8 text-center md:text-left">
              <div className="absolute top-0 left-0 w-full h-[1px] bg-white/10 transition-colors duration-500 hidden md:block"></div>
              <div className="absolute top-0 left-0 w-0 h-[2px] bg-[var(--color-cta)] group-hover:w-full transition-all duration-700 ease-out hidden md:block"></div>
              
              <div className="text-6xl font-bold text-white/[0.03] mb-6 group-hover:text-[var(--color-cta)]/20 transition-colors duration-500">02</div>
              <h3 className="text-2xl font-bold mb-4 text-[var(--color-text)]">Drop</h3>
              <p className="text-[var(--color-secondary)] leading-relaxed font-light">
                Select a geographic radius. The ciphertext is uploaded, and the decryption key is safely embedded in a unique, shareable URL.
              </p>
            </div>

            {/* Step 3 */}
            <div className="relative group pt-8 text-center md:text-left">
              <div className="absolute top-0 left-0 w-full h-[1px] bg-white/10 transition-colors duration-500 hidden md:block"></div>
              <div className="absolute top-0 left-0 w-0 h-[2px] bg-[var(--color-cta)] group-hover:w-full transition-all duration-700 ease-out hidden md:block"></div>
              
              <div className="text-6xl font-bold text-white/[0.03] mb-6 group-hover:text-[var(--color-cta)]/20 transition-colors duration-500">03</div>
              <h3 className="text-2xl font-bold mb-4 text-[var(--color-text)]">Retrieve</h3>
              <p className="text-[var(--color-secondary)] leading-relaxed font-light">
                Share the URL. To decrypt, the recipient must be physically inside the bounds of the geofence. Once read, the data burns forever.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* -------------------------------------------------------
          SECTION 4: CTA FINAL
         ------------------------------------------------------- */}
      <section className="relative z-10 w-full py-40 px-6 border-t border-white/5 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,rgba(34,197,94,0.05)_0%,transparent_60%)]"></div>
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <h2 className="text-[clamp(3rem,6vw,5rem)] leading-none font-bold mb-8 tracking-tighter">Leave no trace.</h2>
          <p className="text-xl text-[var(--color-secondary)] mb-12 font-light max-w-xl mx-auto">
            Start using DeadDrop to securely share ephemeral information right now.
          </p>
          <Link href="/create" className="btn-primary text-xl px-12 py-5 shadow-[0_0_40px_-10px_rgba(34,197,94,0.3)]">
            Initialize Drop
          </Link>
        </div>
      </section>

      {/* -------------------------------------------------------
          FOOTER
         ------------------------------------------------------- */}
      <footer className="relative z-10 w-full border-t border-white/5 py-10 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
           <div className="flex items-center gap-3 text-sm font-bold text-[var(--color-text)]">
             <div className="p-[6px] bg-[var(--color-cta)] text-black rounded-lg">
               <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                 <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
                 <path d="M12 22V12"/>
                 <polyline points="8 8 12 12 16 8"/>
               </svg>
             </div>
             <span className="uppercase tracking-[0.2em] text-xs">DeadDrop</span>
           </div>
           
           <p className="text-xs text-[var(--color-secondary)] font-light uppercase tracking-widest">
             Military-Grade Anonymous Geofenced Messaging
           </p>

           <a 
            href="https://foundree.dev" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="pill-wrapper"
          >
            <div className="foundree-pill group">
              <span className="foundree-pill-text group-hover:text-[var(--color-text)] transition-colors duration-300">Built by Foundree</span>
            </div>
          </a>
        </div>
      </footer>
    </div>
  );
}
