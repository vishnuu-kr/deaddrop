'use client';

import { useState, useEffect, useRef, useCallback, use } from 'react';
import { useRouter, useParams } from 'next/navigation';
import dynamic from 'next/dynamic';
import { useLocation } from '@/lib/geo/useLocation';
import { useDeviceOrientation } from '@/lib/geo/useDeviceOrientation';
import { supabase } from '@/lib/supabase/client';
import {
  getDistanceInMeters,
  getBearing,
  formatDistance,
  getCardinalDirection,
} from '@/lib/geo/haversine';

const AgentTacticalMap = dynamic(
  () => import('@/components/DeadDropMap').then((m) => m.AgentTacticalMap),
  { ssr: false, loading: () => <MapSkeleton /> }
);

function MapSkeleton() {
  return (
    <div className="h-64 sm:h-80 bg-[#0A0E17] flex items-center justify-center">
      <div className="text-center">
        <div className="relative w-12 h-12 mx-auto mb-3">
          <div className="absolute inset-0 border-2 border-[#00FF94]/20 rounded-full animate-ring-pulse" />
          <div className="absolute inset-2 bg-[#00FF94]/10 rounded-full animate-ring-pulse" style={{ animationDelay: '0.3s' }} />
        </div>
        <p className="text-white/40 text-xs font-mono">Loading map...</p>
      </div>
    </div>
  );
}

const RADAR_SWITCH_DISTANCE = 500;

// ============================================================
// Tactical Compass - Device Orientation Aware (SVG Redesign)
// ============================================================
function TacticalCompass({
  distance,
  bearing,
}: {
  distance: number;
  bearing: number;
}) {
  const { orientation, requestPermission, error: orientError } = useDeviceOrientation();
  const [permissionRequested, setPermissionRequested] = useState(false);

  const deviceHeading = orientation.heading;

  const handleRequestPermission = async () => {
    await requestPermission();
    setPermissionRequested(true);
  };

  const cardinalDir = getCardinalDirection(bearing);
  const size = 300;
  const center = size / 2;
  const cardRotation = deviceHeading !== null ? -deviceHeading : 0;
  const arrowRotation = deviceHeading !== null ? bearing - deviceHeading : bearing;

  return (
    <div className="flex flex-col items-center space-y-6 py-6 animate-fade-in-up w-full">
      <div className="relative flex items-center justify-center mt-4">
        {/* Outer Scanner UI */}
        <div className="absolute inset-0 bg-[#00FF94]/5 rounded-full blur-[40px] pointer-events-none" />

        {/* COMPASS SVG */}
        <svg 
          width={size} 
          height={size} 
          viewBox={`0 0 ${size} ${size}`} 
          className="relative z-10 max-w-[85vw] max-h-[85vw] drop-shadow-[0_0_12px_rgba(0,255,148,0.2)]"
        >
          {deviceHeading !== null && (
            <polygon 
              points={`${center},4 ${center-6},16 ${center+6},16`} 
              fill="#00FF94" 
              className="animate-pulse"
            />
          )}

          {/* INNER ROTATING CARD (Ticks & N/E/S/W) */}
          <g 
            style={{ 
              transform: `rotate(${cardRotation}deg)`, 
              transformOrigin: `${center}px ${center}px`,
              transition: 'transform 0.15s linear'
            }}
          >
            {/* Outer and Inner Track Boundaries */}
            <circle cx={center} cy={center} r={center * 0.85} stroke="rgba(0, 255, 148, 0.2)" strokeWidth="1.5" fill="none" />
            <circle cx={center} cy={center} r={center * 0.70} stroke="rgba(0, 255, 148, 0.08)" strokeWidth="1" fill="none" />
            <circle cx={center} cy={center} r={center * 0.82} stroke="rgba(0, 255, 148, 0.05)" strokeWidth="10" fill="none" />
            
            {/* Ticks Array */}
            {Array.from({ length: 72 }).map((_, i) => {
               const angle = i * 5;
               const isMajor = angle % 90 === 0;
               const isMid = angle % 30 === 0;
               const y1 = isMajor ? center * 0.15 : isMid ? center * 0.15 + 4 : center * 0.15 + 8;
               return (
                 <line 
                   key={angle}
                   x1={center} 
                   y1={y1} 
                   x2={center} 
                   y2={center * 0.15 + 18}
                   stroke={isMajor ? '#00FF94' : isMid ? 'rgba(0, 255, 148, 0.55)' : 'rgba(0, 255, 148, 0.25)'}
                   strokeWidth={isMajor ? 2.5 : 1.5}
                   transform={`rotate(${angle} ${center} ${center})`}
                 />
               );
            })}

            {/* Main Cardinal Labels */}
            {['N', 'E', 'S', 'W'].map((card, i) => {
               const angle = i * 90;
               const yPos = center * 0.15 + 34;
               return (
                 <text
                   key={card}
                   x={center}
                   y={yPos}
                   fill={card === 'N' ? '#F85149' : 'rgba(0,255,148,0.95)'}
                   fontSize={card === 'N' ? '20' : '18'}
                   fontWeight="800"
                   fontFamily='"JetBrains Mono", monospace'
                   textAnchor="middle"
                   dominantBaseline="middle"
                   style={{ textShadow: card === 'N' ? '0 0 10px rgba(248,81,73,0.5)' : '0 0 10px rgba(0,255,148,0.4)' }}
                   transform={`rotate(${angle} ${center} ${center}) rotate(${-angle} ${center} ${yPos})`} 
                 >
                   {card}
                 </text>
               );
            })}

            {/* Inter-cardinal Labels */}
            {['NE', 'SE', 'SW', 'NW'].map((card, i) => {
               const angle = i * 90 + 45;
               const yPos = center * 0.15 + 32;
               return (
                 <text
                   key={card}
                   x={center}
                   y={yPos}
                   fill="rgba(0,255,148,0.45)"
                   fontSize="12"
                   fontWeight="600"
                   fontFamily='"JetBrains Mono", monospace'
                   textAnchor="middle"
                   dominantBaseline="middle"
                   transform={`rotate(${angle} ${center} ${center}) rotate(${-angle} ${center} ${yPos})`} 
                 >
                   {card}
                 </text>
               );
            })}
          </g>

          {/* DYNAMIC ARROW (Bearing Direction) */}
          <g 
            style={{ 
              transform: `rotate(${arrowRotation}deg)`, 
              transformOrigin: `${center}px ${center}px`,
              transition: 'transform 0.15s ease-out'
            }}
          >
            {/* Center Anchor Base */}
            <circle cx={center} cy={center} r="7" fill="#00FF94" className="drop-shadow-[0_0_8px_rgba(0,255,148,1)]" />
            <circle cx={center} cy={center} r="24" fill="none" stroke="#00FF94" strokeWidth="1" strokeDasharray="3,4" opacity="0.6"/>
            
            {/* Arrow Stem */}
            <line 
              x1={center} y1={center} 
              x2={center} y2={center * 0.35} 
              stroke="#00FF94" 
              strokeWidth="4" 
              strokeLinecap="round" 
              className="drop-shadow-[0_0_12px_rgba(0,255,148,0.8)]"
            />
            {/* Arrowhead */}
            <polygon 
              points={`${center},${center * 0.28} ${center - 9},${center * 0.42} ${center + 9},${center * 0.42}`} 
              fill="#00FF94" 
              className="drop-shadow-[0_0_12px_rgba(0,255,148,0.8)]"
            />
          </g>
          
          {/* Middle Reticle Dead-Center Sub-dot */}
          <circle cx={center} cy={center} r="3" fill="#0A0E17" />
        </svg>

        {deviceHeading !== null && (
          <div className="absolute top-0 right-0 sm:-right-4 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#00FF94]/10 text-[#00FF94] border border-[#00FF94]/30 backdrop-blur-md">
            SYS: ON
          </div>
        )}
      </div>

      <div className="flex flex-col items-center">
        {!permissionRequested && deviceHeading === null && !orientError && (
          <button
            onClick={handleRequestPermission}
            className="btn-secondary text-xs py-2 px-5 mb-4"
            aria-label="Enable compass orientation"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
              <circle cx="12" cy="12" r="10"/>
              <path d="M12 16v-4"/>
              <path d="M12 8h.01"/>
            </svg>
            Enable Compass
          </button>
        )}

        <div className="text-center mt-2 bg-[#00FF94]/[0.02] border border-[#00FF94]/10 rounded-[2rem] px-8 py-5 backdrop-blur-md min-w-[220px] shadow-[0_8px_32px_rgba(0,255,148,0.03)]">
          <p className="text-[#00FF94] text-5xl sm:text-6xl font-bold font-display tracking-tight drop-shadow-[0_0_24px_rgba(0,255,148,0.3)]" style={{ lineHeight: 1.1 }}>
            {Math.round(bearing)}°
          </p>
          <p className="text-white/50 text-xs sm:text-sm mt-3 font-mono uppercase tracking-[0.2em] font-semibold flex items-center justify-center">
            {cardinalDir} 
            <span className="mx-3 w-1 h-1 rounded-full bg-[#00FF94]/30"></span> 
            {formatDistance(distance)}
          </p>
        </div>

        {orientError && (
          <p className="micro-text text-[#F85149] mt-5 flex items-center bg-[#F85149]/10 px-4 py-2 rounded-full border border-[#F85149]/20">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
               <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            {orientError}
          </p>
        )}
      </div>
    </div>
  );
}

// ============================================================
// Main Track Page
// ============================================================
export default function TrackPage({ params: paramsPromise }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const params = use(paramsPromise);
  const dropId = params?.id;

  const [drop, setDrop] = useState<{
    id: string;
    target_latitude: number;
    target_longitude: number;
    unlock_radius: number;
    is_burned: boolean;
  } | null>(null);
  const [keyString, setKeyString] = useState<string | null>(null);
  const [decryptedMessage, setDecryptedMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [burning, setBurning] = useState(false);
  const [burned, setBurned] = useState(false);
  const [showMap, setShowMap] = useState(false);

  const hasBurnedRef = useRef(false);

  // Mock location for desktop testing (uncomment to test)
  // const [location, setLocation] = useState<LocationData | null>({
  //   latitude: 40.7128,  // Replace with a point near your target
  //   longitude: -74.006,
  //   accuracy: 20,
  //   timestamp: Date.now(),
  //   heading: null,
  //   speed: null,
  // });

  const { location, error: locationError } = useLocation({
    enableHighAccuracy: true,
    timeout: 10000,
    maximumAge: 0,
  });

  // Debug: log location updates
  useEffect(() => {
    if (location) {
      console.log('[Track] GPS location:', location);
    }
  }, [location]);

  useEffect(() => {
    if (locationError) {
      console.warn('[Track] Location error:', locationError.code, locationError.message);
    }
  }, [locationError]);

  useEffect(() => {
    const hash = window.location.hash.slice(1);
    if (!hash) {
      // For testing: allow viewing without key
      console.warn('[Track] No decryption key found - showing compass only mode');
      setKeyString(null);
      setLoading(false);
      return;
    }
    setKeyString(hash);
  }, []);

  useEffect(() => {
    console.log('[Track] useEffect triggered. dropId:', dropId);
    if (!dropId) return;
    const fetchDrop = async () => {
      console.log('[Track] fetchDrop called for:', dropId);
      try {
        const { data, error } = await Promise.race([
          supabase
            .from('dead_drops')
            .select('id, target_location, unlock_radius, is_burned')
            .eq('id', dropId)
            .single() as unknown as Promise<{ data: any | null; error: any }>,
          new Promise((_, reject) => setTimeout(() => reject(new Error('Supabase request timed out')), 10000))
        ]) as { data: any | null; error: any };

        if (error || !data) {
          setError('Dead drop not found.');
          setLoading(false);
          return;
        }
        if (data.is_burned) {
          setBurned(true);
          setLoading(false);
          return;
        }

        const raw = data.target_location;
        let lat: number;
        let lng: number;

        console.log('[Track] Raw target_location:', JSON.stringify(raw), typeof raw);

        // Supabase returns PostGIS GEOGRAPHY as WKB hex string:
        // "0101000020E6100000xxxxxxxxxxxxxxxxyyyyyyyyyyyyyyyy"
        // Format: 01 (little endian) + 01000020 (Point with SRID) + E6100000 (SRID 4326) + 8 bytes lng + 8 bytes lat
        if (typeof raw === 'string' && raw.startsWith('0101')) {
          // WKB hex parser for Point
          // Bytes 0-1: endianness (01 = little endian)
          // Bytes 2-9: geometry type (01000020 = Point with SRID flag)
          // Bytes 10-17: SRID (E6100000 = 4326 in little endian)
          // Bytes 18-33: X coordinate (longitude) as little-endian double
          // Bytes 34-49: Y coordinate (latitude) as little-endian double
          try {
            const lngHex = raw.substring(18, 34);
            const latHex = raw.substring(34, 50);

            // Convert little-endian hex to double
            function hexToDoubleLE(hex: string): number {
              const buffer = new ArrayBuffer(8);
              const view = new DataView(buffer);
              for (let i = 0; i < 8; i++) {
                view.setUint8(i, parseInt(hex.substring(i * 2, i * 2 + 2), 16));
              }
              return view.getFloat64(0, true);
            }

            lng = hexToDoubleLE(lngHex);
            lat = hexToDoubleLE(latHex);

            console.log('[Track] Decoded WKB:', { lng, lat });
          } catch (e) {
            console.error('[Track] Failed to parse WKB hex:', e);
            lat = 0;
            lng = 0;
          }
        }
        // Handle GeoJSON format: { type: "Point", coordinates: [lng, lat] }
        else if (raw && typeof raw === 'object' && Array.isArray((raw as any).coordinates)) {
          lng = (raw as any).coordinates[0];
          lat = (raw as any).coordinates[1];
        }
        // Handle PostGIS string: "POINT(lng lat)"
        else if (typeof raw === 'string') {
          const match = raw.match(/POINT\(\s*([-+]?\d*\.?\d+)\s+([-+]?\d*\.?\d+)\s*\)/);
          if (match) {
            lng = parseFloat(match[1]);
            lat = parseFloat(match[2]);
          } else {
            console.warn('[Track] Could not parse PostGIS point string:', raw);
            lat = 0;
            lng = 0;
          }
        }
        // Fallback
        else {
          console.warn('[Track] Unknown target_location format:', raw);
          lat = 0;
          lng = 0;
        }

        setDrop({
          id: data.id,
          target_latitude: lat,
          target_longitude: lng,
          unlock_radius: data.unlock_radius,
          is_burned: data.is_burned,
        });
        console.log('[Track] Parsed coordinates:', { lat, lng, raw });
        setLoading(false);
      } catch (err: any) {
        console.error('[Track] Error during fetchDrop:', err);
        setError(err.message || 'Failed to fetch drop data.');
        setLoading(false);
      }
    };
    fetchDrop();
  }, [dropId]);

  useEffect(() => {
    if (!location || !drop) return;
    const d = getDistanceInMeters(
      location.latitude, location.longitude,
      drop.target_latitude, drop.target_longitude
    );
    if (d < RADAR_SWITCH_DISTANCE) setShowMap(true);
  }, [location, drop]);

  useEffect(() => {
    if (!location || !drop || !keyString || hasBurnedRef.current || burned) return;
    const d = getDistanceInMeters(
      location.latitude, location.longitude,
      drop.target_latitude, drop.target_longitude
    );
    if (d < drop.unlock_radius * 2) handleDecrypt();
  }, [location, drop, keyString, burned]);

  const handleDecrypt = useCallback(async () => {
    if (!drop || !keyString || !location) return;
    if (hasBurnedRef.current) return;

    const d = getDistanceInMeters(
      location.latitude, location.longitude,
      drop.target_latitude, drop.target_longitude
    );

    if (d > drop.unlock_radius + 50) {
      setError(`${formatDistance(d)} away. Get within ${drop.unlock_radius}m.`);
      return;
    }

    setBurning(true);
    setError(null);

    try {
      const { data: enc, error: fetchErr } = await supabase
        .from('dead_drops')
        .select('encrypted_payload, iv')
        .eq('id', drop.id)
        .single() as { data: { encrypted_payload: string; iv: string } | null; error: any };

      if (fetchErr || !enc?.encrypted_payload) {
        throw new Error('Payload not available.');
      }

      const { decryptPayload } = await import('@/lib/crypto/encryption');
      const plaintext = await decryptPayload(enc.encrypted_payload, enc.iv, keyString);
      setDecryptedMessage(plaintext);

      await fetch('/api/burn', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dropId: drop.id,
          latitude: location.latitude,
          longitude: location.longitude,
        }),
      });

      hasBurnedRef.current = true;
      setBurned(true);
      
      // Auto-destruct message from screen after 30 seconds
      setTimeout(() => {
        setDecryptedMessage(null);
      }, 30000);
    } catch (err: any) {
      setError(err.message || 'Decryption failed.');
    } finally {
      setBurning(false);
    }
  }, [drop, keyString, location]);

  const distance = location && drop
    ? getDistanceInMeters(location.latitude, location.longitude, drop.target_latitude, drop.target_longitude)
    : null;

  const bearing = location && drop
    ? getBearing(location.latitude, location.longitude, drop.target_latitude, drop.target_longitude)
    : null;

  // Debug distance calculation
  useEffect(() => {
    if (distance !== null && drop) {
      console.log('[Track] Distance calc:', {
        userLat: location?.latitude,
        userLng: location?.longitude,
        targetLat: drop.target_latitude,
        targetLng: drop.target_longitude,
        distance,
      });
    }
  }, [distance, drop, location]);

  const canUnlock = distance !== null && drop ? distance <= drop.unlock_radius : false;

  // ═══════════════════════════════════════════════════════════
  // BURNED STATE
  // ═══════════════════════════════════════════════════════════
  if (burned && !decryptedMessage) {
    return (
      <div className="bg-[#020408] min-h-[calc(100dvh-64px)] flex items-center justify-center px-4 sm:px-6">
        <div className="text-center animate-fade-in-up max-w-[480px]">
          <div className="w-20 h-20 sm:w-24 mx-auto mb-8 rounded-full border-2 border-[#F85149]/30 flex items-center justify-center bg-[#F85149]/5 shadow-[0_0_24px_rgba(248,81,73,0.15)]">
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#F85149" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M12 16v-4"/>
              <path d="M12 8h.01"/>
              <path d="M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"/>
            </svg>
          </div>

          <span className="micro-text text-[#F85149] tracking-widest mb-4 block">
            Message Burned
          </span>
          <h1 className="section-heading text-white mb-3">
            No traces remain.
          </h1>
          <p className="subtitle text-white/45 mb-8 text-sm sm:text-base">
            This dead drop has been permanently destroyed.
          </p>

          <button
            onClick={() => router.push('/')}
            className="btn-secondary text-sm"
            aria-label="Return to home"
          >
            Return to base
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M5 12h14"/>
              <path d="m12 5 7 7-7 7"/>
            </svg>
          </button>
        </div>
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════════
  // LOADING STATE
  // ═══════════════════════════════════════════════════════════
  if (loading) {
    return (
      <div className="bg-[#020408] min-h-[calc(100dvh-64px)] flex items-center justify-center">
        <div className="text-center animate-fade-in-up">
          <div className="relative w-20 h-20 mx-auto mb-6">
            <div className="absolute inset-0 border-2 border-[#00FF94]/15 rounded-full animate-ring-pulse" />
            <div className="absolute inset-3 border-2 border-[#00FF94]/30 rounded-full animate-ring-pulse" style={{ animationDelay: '0.2s' }} />
            <div className="absolute inset-6 bg-[#00FF94]/8 rounded-full animate-ring-pulse" style={{ animationDelay: '0.4s' }} />
          </div>
          <p className="text-[#00FF94] font-mono text-sm">
            Acquiring drop data...
          </p>
        </div>
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════════
  // ERROR STATE
  // ═══════════════════════════════════════════════════════════
  if (error && !decryptedMessage) {
    return (
      <div className="bg-[#020408] min-h-[calc(100dvh-64px)] flex items-center justify-center px-4 sm:px-6">
        <div className="text-center max-w-[480px] animate-fade-in-up">
          <div className="w-20 h-20 mx-auto mb-8 rounded-full border-2 border-[#F85149]/25 flex items-center justify-center bg-[#F85149]/5">
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#F85149" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <circle cx="12" cy="12" r="10"/>
              <path d="m15 9-6 6"/>
              <path d="m9 9 6 6"/>
            </svg>
          </div>

          <div className="glass-panel-subtle border-l-2 border-l-[#F85149] p-4 mb-8 text-left">
            <p className="caption text-[#F85149]">
              {error}
            </p>
          </div>

          <button
            onClick={() => router.push('/')}
            className="btn-secondary text-sm"
            aria-label="Return to home"
          >
            Return to base
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M5 12h14"/>
              <path d="m12 5 7 7-7 7"/>
            </svg>
          </button>
        </div>
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════════
  // DECRYPTED STATE
  // ═══════════════════════════════════════════════════════════
  if (decryptedMessage) {
    return (
      <div className="bg-[#020408] min-h-[calc(100dvh-64px)] flex items-center justify-center px-4 sm:px-6 py-12">
        <div className="max-w-[560px] w-full text-center animate-fade-in-up">
          <div className="w-20 h-20 mx-auto mb-8 rounded-full border-2 border-[#00FF94]/50 flex items-center justify-center bg-[#00FF94]/5 shadow-[0_0_24px_rgba(0,255,148,0.2)]">
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#00FF94" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <rect width="18" height="11" x="3" y="11" rx="2" ry="2"/>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
            </svg>
          </div>

          <span className="micro-text text-[#00FF94] tracking-widest mb-4 block">
            Message Decrypted
          </span>
          <h2 className="section-heading text-white mb-6">
            Decrypted Message
          </h2>

          <div className="glass-panel-strong p-6 sm:p-8 mb-8 text-left rounded-xl border-l-2 border-l-[#00FF94]">
            <p className="text-base sm:text-lg text-white leading-relaxed whitespace-pre-wrap break-words">
              {decryptedMessage}
            </p>
          </div>

          <p className="micro-text text-white/25 mb-8">
            This link has been burned and the message will self-destruct in 30 seconds.
          </p>

          <button
            onClick={() => router.push('/')}
            className="btn-primary text-sm"
            aria-label="Return to home"
          >
            Done
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M5 12h14"/>
              <path d="m12 5 7 7-7 7"/>
            </svg>
          </button>
        </div>
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════════
  // TRACKING STATE (Active Navigation)
  // ═══════════════════════════════════════════════════════════
  return (
    <div className="bg-[#020408] min-h-[calc(100dvh-64px)] flex flex-col">
      {/* Status Bar */}
      <div className="px-4 sm:px-6 py-3.5 flex items-center justify-between border-b border-white/[0.06] bg-[#0d1117]/60 backdrop-blur-xl">
        <div className="flex items-center gap-2.5">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00FF94] opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#00FF94]"></span>
          </span>
          <span className="micro-text text-[#00FF94]">
            {drop?.unlock_radius}m radius
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className={`w-2.5 h-2.5 rounded-full ${location ? 'bg-[#58A6FF]' : 'bg-[#F85149]'} ${location ? 'animate-pulse' : ''}`} />
          <span className="micro-text text-white/40">
            {location ? 'GPS Active' : 'Acquiring...'}
          </span>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 w-full relative flex flex-col min-h-[60vh] overflow-hidden">
        {showMap && drop ? (
          /* ── Map View ─────────────────────────────────── */
          <div className="flex-1 w-full h-full relative min-h-[60vh]">
            <div className="absolute inset-0 z-0 h-full w-full">
              <AgentTacticalMap
                userLocation={location ? { lat: location.latitude, lng: location.longitude } : null}
                target={{ lat: drop.target_latitude, lng: drop.target_longitude }}
                radius={drop.unlock_radius}
              />
            </div>
            {distance !== null && (
              <div className="absolute bottom-32 sm:bottom-36 left-1/2 -translate-x-1/2 z-[1000] text-center animate-fade-in-up pointer-events-none">
                <div className="glass-panel-strong px-6 py-3 rounded-xl">
                  <p className="text-[#00FF94] text-3xl sm:text-4xl font-bold font-display tracking-tight text-shadow-glow" style={{ lineHeight: 1.1 }}>
                    {formatDistance(distance)}
                  </p>
                  <p className="micro-text text-white/40 mt-1">
                    Distance to target
                  </p>
                </div>
              </div>
            )}
          </div>
        ) : (
          /* ── Compass View ─────────────────────────────── */
          <div className="flex-1 flex flex-col items-center justify-center relative bg-grid">
            {distance !== null && bearing !== null && drop && drop.target_latitude !== 0 ? (
              <TacticalCompass distance={distance} bearing={bearing} />
            ) : (
              <div className="text-center py-16 animate-fade-in-up px-4">
                <div className="relative w-16 h-16 mx-auto mb-6">
                  <div className="absolute inset-0 border-2 border-[#00FF94]/15 rounded-full animate-ring-pulse" />
                  <div className="absolute inset-3 bg-[#00FF94]/8 rounded-full animate-ring-pulse" style={{ animationDelay: '0.3s' }} />
                </div>
                <p className="text-white/40 font-mono text-sm mb-2">
                  {location ? 'Calculating bearing...' : 'Waiting for GPS...'}
                </p>
                <p className="text-white/25 text-xs font-mono max-w-[260px] mx-auto">
                  {location
                    ? 'Target coordinates may be at origin (0, 0)'
                    : 'GPS requires a mobile device or HTTPS connection. Try on your phone.'}
                </p>
                {/* Debug info */}
                {drop && (
                  <div className="mt-4 text-[10px] font-mono text-white/20">
                    Target: {drop.target_latitude.toFixed(6)}, {drop.target_longitude.toFixed(6)}
                  </div>
                )}
              </div>
            )}
            <button
              onClick={() => setShowMap(true)}
              className="btn-secondary text-xs mt-4"
              aria-label="Switch to map view"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <polygon points="3 11 22 2 13 21 11 13 3 11"/>
              </svg>
              Map view
            </button>
          </div>
        )}

        {/* Bottom Action Bar */}
        <div className="px-4 sm:px-6 pb-5 pt-3 border-t border-white/[0.06] bg-[#0d1117]/60 backdrop-blur-xl">
          <button
            onClick={handleDecrypt}
            disabled={!canUnlock || burning || !keyString}
            className={`w-full py-4 rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-2.5 touch-manipulation ${
              canUnlock && !burning
                ? 'btn-primary'
                : 'bg-white/[0.04] text-white/30 cursor-not-allowed border border-white/[0.06]'
            }`}
            aria-label={canUnlock ? 'Unlock message' : `${formatDistance(distance || 0)} to target`}
          >
            {burning ? (
              <>
                <svg className="animate-spin-slow" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
                </svg>
                Decrypting...
              </>
            ) : canUnlock ? (
              <>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <rect width="18" height="11" x="3" y="11" rx="2" ry="2"/>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                </svg>
                Unlock Message
              </>
            ) : (
              <>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <circle cx="12" cy="12" r="10"/>
                  <polyline points="12,6 12,12 16,14"/>
                </svg>
                {formatDistance(distance || 0)}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
