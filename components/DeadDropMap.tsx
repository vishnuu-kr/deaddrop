'use client';

import { useEffect, useRef } from 'react';
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMap,
  useMapEvents,
  Circle,
  ZoomControl,
} from 'react-leaflet';
import L from 'leaflet';

// Fix Leaflet's broken default marker paths in bundlers
import iconMarker from 'leaflet/dist/images/marker-icon.png';
import iconRetina from 'leaflet/dist/images/marker-icon-2x.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: iconMarker.src,
  iconRetinaUrl: iconRetina.src,
  shadowUrl: iconShadow.src,
});

// Custom target marker with enhanced styling
const targetIcon = L.divIcon({
  className: 'custom-marker',
  html: `<div class="relative group">
    <div class="w-5 h-5 bg-[#00FF94] rounded-full border-[3px] border-white/90 shadow-lg relative z-10" style="box-shadow: 0 0 20px rgba(0,255,148,0.5), 0 2px 8px rgba(0,0,0,0.4)"></div>
    <div class="absolute inset-0 w-5 h-5 bg-[#00FF94] rounded-full animate-ping opacity-25" style="box-shadow: 0 0 16px rgba(0,255,148,0.4)"></div>
    <div class="absolute -inset-2 w-9 h-9 rounded-full border border-[#00FF94]/20"></div>
  </div>`,
  iconSize: [20, 20],
  iconAnchor: [10, 10],
  popupAnchor: [0, -14],
});

// Custom user marker
const userIcon = L.divIcon({
  className: 'custom-marker',
  html: `<div class="relative">
    <div class="w-5 h-5 bg-[#58A6FF] rounded-full border-[3px] border-white/90 shadow-lg" style="box-shadow: 0 0 20px rgba(88,166,255,0.5), 0 2px 8px rgba(0,0,0,0.4)"></div>
    <div class="absolute inset-0 w-5 h-5 bg-[#58A6FF] rounded-full animate-ping opacity-25" style="box-shadow: 0 0 16px rgba(88,166,255,0.4)"></div>
    <div class="absolute -inset-3 w-11 h-11 rounded-full border border-[#58A6FF]/15"></div>
  </div>`,
  iconSize: [20, 20],
  iconAnchor: [10, 10],
  popupAnchor: [0, -14],
});

// Esri World Imagery - Free for reasonable usage, no API key needed
const TACTICAL_SATELLITE_URL =
  'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';

// Map updater for fly-to behavior
function MapUpdater({
  center,
  zoom,
}: {
  center: [number, number];
  zoom?: number;
}) {
  const map = useMap();

  useEffect(() => {
    map.flyTo(center, zoom ?? map.getZoom(), {
      duration: 1.2,
      easeLinearity: 0.25,
    });
  }, [center[0], center[1], zoom, map]);

  return null;
}

// Map resizer - forces Leaflet to recalculate container size after mount
function MapResizer() {
  const map = useMap();
  useEffect(() => {
    map.invalidateSize();
    const t1 = setTimeout(() => map.invalidateSize(), 150);
    const t2 = setTimeout(() => map.invalidateSize(), 400);
    const t3 = setTimeout(() => map.invalidateSize(), 800);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [map]);
  return null;
}

// Enhanced popup styling
function StyledPopup({ children }: { children: React.ReactNode }) {
  return (
    <div className="font-mono text-xs bg-[#0d1117] text-white px-3 py-2.5 rounded-lg border border-white/10 shadow-lg">
      {children}
    </div>
  );
}

// ============================================================
// OPERATOR MAP - Click to target, select radius
// ============================================================
export function OperatorMap({
  target,
  onTargetSelect,
  radius,
}: {
  target: { lat: number; lng: number } | null;
  onTargetSelect: (lat: number, lng: number) => void;
  radius: number;
}) {
  const mapRef = useRef<L.Map>(null);

  useEffect(() => {
    // On mount, locate user and fly to them if no target is set yet
    if (!target && mapRef.current) {
      mapRef.current.locate({ setView: true, maxZoom: 14 });
    }
  }, [target]);

  return (
    <div className="relative w-full h-full bg-[#0A0E17]">
      <MapContainer
        center={[40.7128, -74.006]}
        zoom={14}
        ref={mapRef}
        style={{ width: '100%', height: '100%', minHeight: '400px', zIndex: 1 }}
        zoomControl={false}
        zoomAnimation={true}
        fadeAnimation={true}
        markerZoomAnimation={true}
      >
        <MapResizer />
        <ZoomControl position="bottomright" />
        <TileLayer
          url={TACTICAL_SATELLITE_URL}
          attribution='Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
          className="map-tiles"
        />

        <ClickHandler onSelect={onTargetSelect} />

        {target && (
          <>
            <Marker position={[target.lat, target.lng]} icon={targetIcon}>
              <Popup>
                <StyledPopup>
                  <p className="font-bold text-[#00FF94] mb-1 text-xs uppercase tracking-wider">Target Locked</p>
                  <p className="text-white/70 font-mono">
                    {target.lat.toFixed(6)}, {target.lng.toFixed(6)}
                  </p>
                  <p className="text-white/50 mt-1.5 text-[10px]">Radius: {radius}m</p>
                </StyledPopup>
              </Popup>
            </Marker>
            <Circle
              center={[target.lat, target.lng]}
              radius={radius}
              pathOptions={{
                color: '#00FF94',
                fillColor: '#00FF94',
                fillOpacity: 0.06,
                weight: 2,
                dashArray: '5, 5',
              }}
            />
            <MapUpdater center={[target.lat, target.lng]} zoom={14} />
          </>
        )}
      </MapContainer>
    </div>
  );
}

function ClickHandler({
  onSelect,
}: {
  onSelect: (lat: number, lng: number) => void;
}) {
  useMapEvents({
    click(e) {
      onSelect(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

// ============================================================
// AGENT TACTICAL MAP - Show user + target + radius
// ============================================================
export function AgentTacticalMap({
  userLocation,
  target,
  radius,
}: {
  userLocation: { lat: number; lng: number } | null;
  target: { lat: number; lng: number };
  radius: number;
}) {
  const center: [number, number] = [target.lat, target.lng];

  return (
    <div className="relative w-full h-full bg-[#0A0E17]">
      <MapContainer
        center={center}
        zoom={15}
        style={{ width: '100%', height: '100%', minHeight: '400px', zIndex: 1 }}
        zoomControl={false}
        zoomAnimation={true}
        fadeAnimation={true}
        markerZoomAnimation={true}
      >
        <MapResizer />
        <ZoomControl position="bottomright" />
        <TileLayer
          url={TACTICAL_SATELLITE_URL}
          attribution='Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
          className="map-tiles"
        />

        {/* User position */}
        {userLocation && (
          <Marker
            position={[userLocation.lat, userLocation.lng]}
            icon={userIcon}
          >
            <Popup>
              <StyledPopup>
                <p className="font-bold text-[#58A6FF] mb-1 text-xs uppercase tracking-wider">You Are Here</p>
                <p className="text-white/70 font-mono">
                  {userLocation.lat.toFixed(6)}, {userLocation.lng.toFixed(6)}
                </p>
              </StyledPopup>
            </Popup>
          </Marker>
        )}

        {/* Target position */}
        <Marker position={[target.lat, target.lng]} icon={targetIcon}>
          <Popup>
            <StyledPopup>
              <p className="font-bold text-[#00FF94] mb-1 text-xs uppercase tracking-wider">Dead Drop</p>
              <p className="text-white/70 font-mono">
                {target.lat.toFixed(6)}, {target.lng.toFixed(6)}
              </p>
              <p className="text-white/50 mt-1.5 text-[10px]">Radius: {radius}m</p>
            </StyledPopup>
          </Popup>
        </Marker>

        {/* Unlock radius circle */}
        <Circle
          center={[target.lat, target.lng]}
          radius={radius}
          pathOptions={{
            color: '#00FF94',
            fillColor: '#00FF94',
            fillOpacity: 0.06,
            weight: 2,
            dashArray: '6, 6',
          }}
        />
      </MapContainer>
    </div>
  );
}
