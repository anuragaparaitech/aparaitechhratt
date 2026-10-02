// ── SHIFT DEFINITIONS ────────────────────────────────────────────────────────
export const SHIFTS = {
  shift_1: {
    id: 'shift_1',
    name: 'Shift 1: Software Developer',
    label: 'Shift 1 (07:00 AM - 11:00 AM)',
    department: 'Development',
    roleLabel: 'Software Developer',
    startTime: '07:00',
    endTime: '11:00',
    duration: '4 Hours',
    durationHours: 4,
    color: '#0284c7'
  },
  shift_2: {
    id: 'shift_2',
    name: 'Shift 2: BDA Phase 1',
    label: 'Shift 2 (11:00 AM - 05:00 PM)',
    department: 'BDA',
    roleLabel: 'BDA / Sales Phase 1',
    startTime: '11:00',
    endTime: '17:00',
    duration: '6 Hours',
    durationHours: 6,
    color: '#16a34a'
  },
  shift_3: {
    id: 'shift_3',
    name: 'Shift 3: BDA Phase 2',
    label: 'Shift 3 (05:00 PM - 11:00 PM)',
    department: 'BDA',
    roleLabel: 'BDA / Sales Phase 2',
    startTime: '17:00',
    endTime: '23:00',
    duration: '6 Hours',
    durationHours: 6,
    color: '#d97706'
  }
}

// ── GEOFENCE CONFIGURATION ───────────────────────────────────────────────────
// Optenix Tech Solution: https://www.google.com/maps/place/Optenix+Tech+Solution/@18.5966851,73.7186756,18.38z/data=!4m6!3m5!1s0x3bc2bb006c6157fb:0x5482f6d4f4b3809b!8m2!3d18.5962139!4d73.7185487
export const GEOFENCE = {
  name: 'Optenix Tech Solution',
  latitude: 18.596077,
  longitude: 73.718054,
  allowedRadiusMeters: 200, // 200m office perimeter
  mapsUrl: 'https://www.google.com/maps/place/Optenix+Tech+Solution/@18.596077,73.718054,18.38z'
}

/**
 * Great-circle distance using Haversine formula
 */
export const calculateDistanceMeters = (lat1, lon1, lat2 = GEOFENCE.latitude, lon2 = GEOFENCE.longitude) => {
  if (lat1 === undefined || lat1 === null || lon1 === undefined || lon1 === null) return null
  const numLat1 = parseFloat(lat1)
  const numLon1 = parseFloat(lon1)
  const numLat2 = parseFloat(lat2)
  const numLon2 = parseFloat(lon2)
  if (isNaN(numLat1) || isNaN(numLon1) || isNaN(numLat2) || isNaN(numLon2)) return null

  const R = 6371e3 // Earth radius in meters
  const toRad = (x) => (x * Math.PI) / 180
  const dLat = toRad(numLat2 - numLat1)
  const dLon = toRad(numLon2 - numLon1)

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(numLat1)) * Math.cos(toRad(numLat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2)

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return Math.round(R * c)
}

/**
 * Check if given latitude and longitude are within the office geofence
 */
export const checkGeofence = (latitude, longitude, maxDistance = GEOFENCE.allowedRadiusMeters) => {
  const distance = calculateDistanceMeters(latitude, longitude)
  if (distance === null) {
    return {
      verified: false,
      distance: null,
      message: 'Location data not available'
    }
  }
  const isInside = distance <= maxDistance
  return {
    verified: isInside,
    distance,
    allowedRadius: maxDistance,
    officeName: GEOFENCE.name,
    message: isInside
      ? `Within office premises (${distance}m from ${GEOFENCE.name})`
      : `Outside office premises (${distance}m away; max ${maxDistance}m allowed)`
  }
}

/**
 * Get current browser GPS location with promise and error handling
 */
export const getCurrentGpsLocation = (timeoutMs = 8000) => {
  return new Promise((resolve) => {
    if (!navigator.geolocation) {
      resolve({ success: false, error: 'Geolocation not supported by device' })
      return
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude, accuracy } = pos.coords
        const geoResult = checkGeofence(latitude, longitude)
        resolve({
          success: true,
          latitude,
          longitude,
          accuracy,
          distance: geoResult.distance,
          isWithinGeofence: geoResult.verified,
          geoMessage: geoResult.message
        })
      },
      (err) => {
        let msg = 'Failed to retrieve location'
        if (err.code === 1) msg = 'Location permission denied by user'
        else if (err.code === 2) msg = 'Location position unavailable'
        else if (err.code === 3) msg = 'Location request timed out'
        resolve({
          success: false,
          error: msg,
          code: err.code
        })
      },
      {
        enableHighAccuracy: true,
        timeout: timeoutMs,
        maximumAge: 15000
      }
    )
  })
}
