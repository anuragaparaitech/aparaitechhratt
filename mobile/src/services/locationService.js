import { OFFICE_GEOFENCE } from '../config/env';

/**
 * Calculates distance in meters between two GPS coordinates using the Haversine formula.
 */
export function getDistanceMeters(lat1, lon1, lat2, lon2) {
  const R = 6371e3; // Earth's radius in meters
  const toRad = (value) => (value * Math.PI) / 180;

  const φ1 = toRad(lat1);
  const φ2 = toRad(lat2);
  const Δφ = toRad(lat2 - lat1);
  const Δλ = toRad(lon2 - lon1);

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return Math.round(R * c);
}

/**
 * Verifies if user coordinate is within the 200m office geofence.
 */
export function verifyGeofence(userLat, userLng) {
  if (!userLat || !userLng) {
    return {
      inside: false,
      distance: null,
      message: 'Location data unavailable'
    };
  }

  const distance = getDistanceMeters(
    userLat,
    userLng,
    OFFICE_GEOFENCE.latitude,
    OFFICE_GEOFENCE.longitude
  );

  const inside = distance <= OFFICE_GEOFENCE.radiusMeters;

  return {
    inside,
    distance,
    maxRadius: OFFICE_GEOFENCE.radiusMeters,
    officeName: OFFICE_GEOFENCE.name,
    message: inside
      ? `✅ Inside Office Zone (${distance}m from center)`
      : `⚠️ Outside Office Zone (${distance}m away, max allowed ${OFFICE_GEOFENCE.radiusMeters}m)`
  };
}
