'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { encryptPayload } from '@/lib/crypto/encryption';
import { supabase } from '@/lib/supabase/client';

const OperatorMap = dynamic(
  () => import('@/components/DeadDropMap').then((m) => m.OperatorMap),
  { ssr: false, loading: () => <MapSkeleton /> }
);

function MapSkeleton() {
  return (
    <div className="h-full min-h-[400px] bg-[#0A0E17] flex items-center justify-center">
      <div className="text-center">
        <div className="relative w-16 h-16 mx-auto mb-4">
          <div className="absolute inset-0 border-2 border-[#00FF94]/20 rounded-full animate-ring-pulse" />
          <div className="absolute inset-3 bg-[#00FF94]/10 rounded-full animate-ring-pulse" style={{ animationDelay: '0.3s' }} />
        </div>
        <p className="text-white/40 text-sm font-mono">Loading map...</p>
      </div>
    </div>
  );
}

// Step indicator component
function StepIndicator({ currentStep, totalSteps }: { currentStep: number; totalSteps: number }) {
  const steps = [
    { num: 1, label: 'Location' },
    { num: 2, label: 'Message' },
    { num: 3, label: 'Deploy' },
    { num: 4, label: 'Complete' },
  ];

  return (
    <nav aria-label="Progress steps" className="hidden sm:block">
      <ol className="flex flex-wrap sm:flex-nowrap items-center justify-center xl:gap-0 gap-2" role="list">
        {steps.map((step, idx) => (
          <li key={step.num} className="flex items-center">
            <div className="flex flex-col items-center">
              <div
                className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-xs sm:text-sm font-bold font-mono transition-all duration-300 ${
                  step.num < currentStep
                    ? 'bg-[#00FF94] text-[#020408] shadow-[0_0_16px_rgba(0,255,148,0.3)]'
                    : step.num === currentStep
                    ? 'bg-[#00FF94]/15 border-2 border-[#00FF94]/50 text-[#00FF94] shadow-[0_0_12px_rgba(0,255,148,0.15)]'
                    : 'bg-white/[0.04] border border-white/[0.08] text-white/25'
                }`}
                aria-label={`Step ${step.num}: ${step.label} — ${step.num < currentStep ? 'Completed' : step.num === currentStep ? 'Current' : 'Upcoming'}`}
              >
                {step.num < currentStep ? (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <polyline points="20,6 9,17 4,12"/>
                  </svg>
                ) : (
                  step.num
                )}
              </div>
              <span className={`mt-2 micro-text text-center ${
                step.num <= currentStep ? 'text-[#00FF94]' : 'text-white/25'
              }`}>
                {step.label}
              </span>
            </div>
            {idx < steps.length - 1 && (
              <div className={`w-8 sm:w-12 h-0.5 mx-2 sm:mx-3 xl:mx-4 mt-[-20px] transition-colors duration-300 hidden sm:block ${
                step.num < currentStep ? 'bg-[#00FF94]/40' : 'bg-white/[0.06]'
              }`} aria-hidden="true" />
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}

export default function CreatePage() {
  const router = useRouter();
  const [target, setTarget] = useState<{ lat: number; lng: number } | null>(null);
  const [message, setMessage] = useState('');
  const [radius, setRadius] = useState(100);
  const [step, setStep] = useState<'map' | 'message' | 'deploying' | 'done'>('map');
  const [burnerLink, setBurnerLink] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleTargetSelect = useCallback((lat: number, lng: number) => {
    setTarget({ lat, lng });
  }, []);

  const handleUseMyLocation = useCallback(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setTarget({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        () => setError('Could not get your location. Please enable location services.')
      );
    }
  }, []);

  const handleDeploy = useCallback(async () => {
    if (!target || !message.trim()) return;
    setStep('deploying');
    setError(null);

    try {
      const { encryptedPayload, iv, keyString } = await encryptPayload(message);

      console.log('[Create] Saving drop with target:', target, 'radius:', radius);

      const { data: drop, error: dbError } = await supabase
        .from('dead_drops')
        .insert({
          encrypted_payload: encryptedPayload,
          iv,
          target_location: `POINT(${target.lng} ${target.lat})`,
          unlock_radius: radius,
        } as any)
        .select('id')
        .single() as { data: { id: string } | null; error: any };

      if (dbError || !drop) {
        throw new Error(dbError?.message || 'Failed to create drop');
      }

      const origin = window.location.origin;
      setBurnerLink(`${origin}/track/${drop.id}#${keyString}`);
      setStep('done');
    } catch (err: any) {
      setError(err.message || 'Deployment failed');
      setStep('message');
    }
  }, [target, message, radius]);

  const handleCopyLink = useCallback(async () => {
    await navigator.clipboard.writeText(burnerLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [burnerLink]);

  const currentStepNumber = step === 'map' ? 1 : step === 'message' ? 2 : step === 'deploying' ? 3 : 4;

  // ═══════════════════════════════════════════════════════════
  // STEP 1 — Map / Location
  // ═══════════════════════════════════════════════════════════
  if (step === 'map') {
    return (
      <div className="bg-[#020408] min-h-[calc(100dvh-64px)] flex flex-col">
        {/* Header */}
        <div className="pt-8 pb-6 px-4 sm:px-6 text-center animate-fade-in-down">
          <StepIndicator currentStep={currentStepNumber} totalSteps={4} />
          <h1 className="section-heading text-white mt-6 mb-2">
            Set target coordinates
          </h1>
          <p className="subtitle text-white/50 text-sm sm:text-base">
            Click the map to drop a pin, or use your current location.
          </p>
        </div>

        {/* Map Container */}
        <div className="flex-1 w-full relative flex flex-col min-h-[60vh] overflow-hidden">
          <div className="flex-1 w-full h-full relative min-h-[60vh]">
            <div className="absolute inset-0 z-0 w-full h-full">
              <OperatorMap
                target={target}
                onTargetSelect={handleTargetSelect}
                radius={radius}
              />
            </div>
          </div>

          {/* Bottom Control Panel */}
          <div className="bg-[#020408] sm:absolute sm:bottom-0 sm:left-0 sm:right-0 sm:z-[1000] p-4 sm:bg-transparent">
            <div className="glass-panel-strong p-4 sm:p-6 rounded-2xl w-full max-w-[900px] mx-auto border-t sm:border border-white/5 shadow-2xl">
              <div className="max-w-[700px] mx-auto">
                {!target ? (
                  <div className="text-center py-4">
                    <div className="inline-flex p-4 rounded-2xl bg-[#00FF94]/5 border border-[#00FF94]/10 mb-4">
                      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-[#00FF94]/60" aria-hidden="true">
                        <circle cx="12" cy="12" r="10"/>
                        <circle cx="12" cy="12" r="3"/>
                      </svg>
                    </div>
                    <p className="caption text-white/40 mb-4">No target selected</p>
                    <button
                      onClick={handleUseMyLocation}
                      className="btn-secondary text-sm"
                      aria-label="Use current GPS location"
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <circle cx="12" cy="12" r="10"/>
                        <circle cx="12" cy="12" r="3" fill="currentColor"/>
                      </svg>
                      Use current location
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4 animate-fade-in-up">
                    {/* Target info row */}
                    <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
                      <div className="flex-1 glass-panel-subtle py-3 px-4 rounded-xl">
                        <p className="micro-text text-white/40 mb-1">TARGET LOCKED</p>
                        <p className="text-white font-mono text-sm sm:text-base">
                          {target.lat.toFixed(6)}, {target.lng.toFixed(6)}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-[#00FF94]/5 border border-[#00FF94]/15">
                        <span className="relative flex h-2.5 w-2.5">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00FF94] opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#00FF94]"></span>
                        </span>
                        <span className="micro-text text-[#00FF94]">Locked</span>
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-3 pt-2">
                        <span className="micro-text text-white/40">
                          UNLOCK RADIUS
                        </span>
                        <span className="text-[#00FF94] font-mono text-base font-bold">
                          {radius}m
                        </span>
                      </div>
                      <input
                        type="range"
                        min="10"
                        max="500"
                        value={radius}
                        onChange={(e) => setRadius(Number(e.target.value))}
                        className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-[#00FF94]"
                        aria-label={`Unlock radius: ${radius} meters`}
                      />
                      <div className="flex justify-between mt-2">
                        <span className="micro-text text-white/25">10m</span>
                        <span className="micro-text text-white/25">500m</span>
                      </div>
                    </div>

                    {/* Continue button */}
                    <button
                      onClick={() => setStep('message')}
                      className="btn-primary w-full text-sm mt-4"
                      aria-label="Continue to message step"
                    >
                      Continue
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="M5 12h14"/>
                        <path d="m12 5 7 7-7 7"/>
                      </svg>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════════
  // STEP 2 — Message / Encrypt
  // ═══════════════════════════════════════════════════════════
  if (step === 'message') {
    return (
      <div className="bg-[#020408] min-h-[calc(100dvh-64px)] flex flex-col items-center justify-center px-4 sm:px-6 py-12">
        <div className="max-w-[560px] w-full animate-fade-in-up">
          <StepIndicator currentStep={currentStepNumber} totalSteps={4} />

          {/* Header */}
          <div className="text-center mt-8 mb-8">
            <div className="inline-flex p-3 rounded-2xl bg-[#00FF94]/5 border border-[#00FF94]/10 mb-4">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-[#00FF94]" aria-hidden="true">
                <rect width="18" height="11" x="3" y="11" rx="2" ry="2"/>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
              </svg>
            </div>
            <h2 className="section-heading text-white mb-3">
              Encrypt your message
            </h2>
            <p className="subtitle text-white/50 text-sm">
              Encrypted locally with AES-256-GCM. Never sent in plaintext.
            </p>
          </div>

          {/* Error banner */}
          {error && (
            <div className="glass-panel-subtle border-l-2 border-l-[#F85149] bg-[#F85149]/5 p-4 mb-6 animate-fade-in-up" role="alert" aria-live="assertive">
              <div className="flex items-start gap-3">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#F85149" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0 mt-0.5" aria-hidden="true">
                  <circle cx="12" cy="12" r="10"/>
                  <line x1="12" x2="12" y1="8" y2="12"/>
                  <line x1="12" x2="12.01" y1="16" y2="16"/>
                </svg>
                <p className="caption text-[#F85149]">
                  {error}
                </p>
              </div>
            </div>
          )}

          {/* Message textarea */}
          <div className="mb-6">
            <label htmlFor="secret-message" className="sr-only">Secret message</label>
            <textarea
              id="secret-message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Enter your secret message..."
              rows={6}
              className="textarea-field w-full rounded-xl mb-2"
            />
            <p className="micro-text text-white/25 text-right">
              {message.length} characters
            </p>
          </div>

          {/* Summary card */}
          <div className="glass-panel-subtle p-5 mb-8 rounded-xl">
            <p className="micro-text text-[#00FF94] mb-4 font-bold">Drop Summary</p>
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: 'Target', value: `${target?.lat.toFixed(4)}, ${target?.lng.toFixed(4)}`, color: 'text-white' },
                { label: 'Radius', value: `${radius}m`, color: 'text-[#00FF94]' },
                { label: 'Expiry', value: '24 hours', color: 'text-white' },
                { label: 'Encryption', value: 'AES-256', color: 'text-white' },
              ].map((item) => (
                <div key={item.label}>
                  <span className="micro-text text-white/35">{item.label}</span>
                  <p className={`font-mono text-sm mt-1 ${item.color}`}>{item.value}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => setStep('map')}
              className="btn-secondary flex-1 text-sm"
              aria-label="Go back to map"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="m15 18-6-6 6-6"/>
              </svg>
              Back
            </button>
            <button
              onClick={handleDeploy}
              disabled={!message.trim()}
              className="btn-primary flex-1 text-sm disabled:opacity-40 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none"
              aria-label="Deploy encrypted message"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M12 2L2 7l10 5 10-5-10-5z"/>
                <path d="M2 17l10 5 10-5"/>
              </svg>
              Deploy
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════════
  // STEP 3 — Deploying (Loading)
  // ═══════════════════════════════════════════════════════════
  if (step === 'deploying') {
    return (
      <div className="bg-[#020408] min-h-[calc(100dvh-64px)] flex items-center justify-center relative overflow-hidden">
        {/* Background glow */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(0,255,148,0.06)_0%,transparent_70%)]" aria-hidden="true" />

        <div className="text-center relative z-10 animate-fade-in-up">
          {/* Animated encryption rings */}
          <div className="relative w-24 h-24 mx-auto mb-8">
            <div className="absolute inset-0 border-2 border-[#00FF94]/15 rounded-full animate-ring-pulse" />
            <div className="absolute inset-3 border-2 border-[#00FF94]/30 rounded-full animate-ring-pulse" style={{ animationDelay: '0.2s' }} />
            <div className="absolute inset-6 bg-[#00FF94]/8 rounded-full animate-ring-pulse" style={{ animationDelay: '0.4s' }} />
            <div className="absolute inset-0 flex items-center justify-center">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#00FF94" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="animate-pulse">
                <rect width="18" height="11" x="3" y="11" rx="2" ry="2"/>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
              </svg>
            </div>
          </div>

          <p className="text-[#00FF94] text-lg font-mono font-semibold mb-2">
            Encrypting...
          </p>
          <p className="caption text-white/40">
            AES-256-GCM encryption in progress
          </p>
        </div>
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════════
  // STEP 4 — Done / Burner Link
  // ═══════════════════════════════════════════════════════════
  return (
    <div className="bg-[#020408] min-h-[calc(100dvh-64px)] flex items-center justify-center px-4 sm:px-6 py-12">
      <div className="max-w-[560px] w-full text-center animate-fade-in-up">
        {/* Success icon */}
        <div className="w-20 h-20 sm:w-24 sm:h-24 mx-auto mb-8 rounded-full border-2 border-[#00FF94]/50 flex items-center justify-center bg-[#00FF94]/5 shadow-[0_0_30px_rgba(0,255,148,0.2)]">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#00FF94" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <polyline points="20,6 9,17 4,12"/>
          </svg>
        </div>

        <span className="micro-text text-[#00FF94] tracking-widest mb-4 block">
          Deployment Complete
        </span>
        <h2 className="section-heading text-white mb-3">
          Drop deployed successfully
        </h2>
        <p className="subtitle text-white/50 mb-10 text-sm sm:text-base">
          Share this burner link with the Agent. It self-destructs after first read.
        </p>

        {/* Burner link card */}
        <div className="glass-panel-strong p-5 mb-6 text-left rounded-xl">
          <div className="flex items-center gap-2.5 mb-4">
            <div className="p-2 rounded-lg bg-[#00FF94]/6">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#00FF94" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
                <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
              </svg>
            </div>
            <p className="micro-text text-[#00FF94] font-bold">
              Burner Link
            </p>
          </div>

          <div className="flex items-center gap-3 bg-[#020408]/80 rounded-xl p-3 border border-white/[0.06]">
            <input
              type="text"
              readOnly
              value={burnerLink}
              className="flex-1 bg-transparent text-[#00FF94] text-sm font-mono truncate focus:outline-none"
              aria-label="Burner link URL"
            />
            <button
              onClick={handleCopyLink}
              className={`btn-primary text-sm whitespace-nowrap px-4 ${copied ? 'bg-[#00E685]' : ''}`}
              aria-label={copied ? 'Link copied to clipboard' : 'Copy burner link to clipboard'}
            >
              {copied ? (
                <>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <polyline points="20,6 9,17 4,12"/>
                  </svg>
                  Copied!
                </>
              ) : (
                <>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <rect width="14" height="14" x="8" y="8" rx="2" ry="2"/>
                    <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/>
                  </svg>
                  Copy
                </>
              )}
            </button>
          </div>
        </div>

        {/* Info notes */}
        <div className="glass-panel-subtle p-4 mb-10 text-left space-y-3 rounded-xl">
          {[
            { icon: 'info', text: 'The key is in the URL hash — never sent to the server.' },
            { icon: 'warning', text: 'This link self-destructs after first read or 24 hours.' },
          ].map((item, idx) => (
            <div key={idx} className="flex items-start gap-3">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`flex-shrink-0 mt-0.5 ${item.icon === 'info' ? 'text-[#58A6FF]' : 'text-[#F0B90B]'}`} aria-hidden="true">
                {item.icon === 'info' ? (
                  <>
                    <circle cx="12" cy="12" r="10"/>
                    <line x1="12" x2="12" y1="8" y2="12"/>
                    <line x1="12" x2="12.01" y1="16" y2="16"/>
                  </>
                ) : (
                  <>
                    <path d="M12 16v-4"/>
                    <path d="M12 8h.01"/>
                    <path d="M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"/>
                  </>
                )}
              </svg>
              <p className="caption text-white/50">{item.text}</p>
            </div>
          ))}
        </div>

        {/* Action buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={() => {
              setTarget(null);
              setMessage('');
              setStep('map');
            }}
            className="btn-primary text-sm"
            aria-label="Create new drop"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <line x1="12" y1="5" x2="12" y2="19"/>
              <line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            New drop
          </button>
          <button
            onClick={() => router.push('/')}
            className="btn-secondary text-sm"
            aria-label="Return to home page"
          >
            Home
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M5 12h14"/>
              <path d="m12 5 7 7-7 7"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
