/**
 * DeadDrop Geospatial Utilities
 * Haversine formula + bearing calculation for compass navigation
 */

/**
 * Calculate distance between two coordinates in meters (Haversine)
 */
export function getDistanceInMeters(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371e3; // Earth radius in meters
  const toRad = (deg: number) => deg * (Math.PI / 180);

  const phi1 = toRad(lat1);
  const phi2 = toRad(lat2);
  const deltaPhi = toRad(lat2 - lat1);
  const deltaLambda = toRad(lon2 - lon1);

  const a =
    Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
    Math.cos(phi1) * Math.cos(phi2) * Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Calculate bearing from point A to point B (degrees from north, 0-360)
 * Used for the compass arrow in radar mode
 */
export function getBearing(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const toRad = (deg: number) => deg * (Math.PI / 180);
  const toDeg = (rad: number) => rad * (180 / Math.PI);

  const phi1 = toRad(lat1);
  const phi2 = toRad(lat2);
  const deltaLambda = toRad(lon2 - lon1);

  const y = Math.sin(deltaLambda) * Math.cos(phi2);
  const x =
    Math.cos(phi1) * Math.sin(phi2) -
    Math.sin(phi1) * Math.cos(phi2) * Math.cos(deltaLambda);

  const bearing = toDeg(Math.atan2(y, x));
  return (bearing + 360) % 360; // Normalize to 0-360
}

/**
 * Check if user is within the unlock radius
 */
export function isWithinRadius(
  userLat: number,
  userLon: number,
  targetLat: number,
  targetLon: number,
  unlockRadius: number
): boolean {
  const distance = getDistanceInMeters(userLat, userLon, targetLat, targetLon);
  return distance <= unlockRadius;
}

/**
 * Format distance for human-readable display
 */
export function formatDistance(meters: number): string {
  if (meters < 1000) {
    return `${Math.round(meters)}m`;
  }
  return `${(meters / 1000).toFixed(2)}km`;
}

/**
 * Get cardinal direction from bearing
 */
export function getCardinalDirection(bearing: number): string {
  const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
  const index = Math.round(bearing / 45) % 8;
  return directions[index];
}

/**
 * Validate location accuracy (anti-spoofing)
 */
export function validateAccuracy(accuracy: number): {
  isValid: boolean;
  reason?: string;
} {
  if (accuracy <= 0) {
    return { isValid: false, reason: 'Invalid accuracy reading' };
  }
  // Suspiciously perfect accuracy suggests spoofing
  if (accuracy < 3) {
    return { isValid: false, reason: 'Location accuracy suspiciously precise' };
  }
  // Too inaccurate to be reliable
  if (accuracy > 500) {
    return { isValid: false, reason: 'Location accuracy too low' };
  }
  return { isValid: true };
}
