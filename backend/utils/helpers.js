// ── SHIFT TIMINGS & ROSTER DEFINITION ──────────────────────────────────────────
export const SHIFTS = {
  shift_1: {
    id: 'shift_1',
    name: 'Shift 1: Software Developer',
    shortName: 'Shift 1',
    roleLabel: 'Software Developer',
    department: 'Development',
    startTime: '07:00',
    endTime: '11:00',
    startMin: 7 * 60,         // 420 (07:00 AM)
    endMin: 11 * 60,          // 660 (11:00 AM)
    durationHours: 4,
    graceMinutes: 15
  },
  shift_2: {
    id: 'shift_2',
    name: 'Shift 2: BDA Phase 2',
    shortName: 'Shift 2',
    roleLabel: 'BDA / Sales Phase 2',
    department: 'BDA',
    startTime: '11:00',
    endTime: '17:00',
    startMin: 11 * 60,        // 660 (11:00 AM)
    endMin: 17 * 60,          // 1020 (05:00 PM)
    durationHours: 6,
    graceMinutes: 10,         // Grace until 11:10 AM (login after 11:10 AM is marked as Half Day)
    lateLoginLimit: '11:10'
  },
  shift_3: {
    id: 'shift_3',
    name: 'Shift 3: BDA Phase 2 (Evening)',
    shortName: 'Shift 3',
    roleLabel: 'BDA / Sales Evening',
    department: 'BDA',
    startTime: '17:00',
    endTime: '23:00',
    startMin: 17 * 60,        // 1020 (05:00 PM)
    endMin: 23 * 60,          // 1380 (11:00 PM)
    durationHours: 6,
    graceMinutes: 10,         // Grace until 17:10 (05:10 PM)
    lateLoginLimit: '17:10'
  }
}

// ── GEOFENCE CONFIGURATION ───────────────────────────────────────────────────
// Aparaitech Software: Lat 18.596077, Lon 73.718054
export const GEOFENCE = {
  name: 'Aparaitech Software',
  latitude: 18.596077,
  longitude: 73.718054,
  allowedRadiusMeters: 200, // 200 meters office boundary
  googleMapsUrl: 'https://www.google.com/maps/place/Aparaitech+Software/@18.596077,73.718054,18.38z'
}

/**
 * Calculates Great Circle distance between two GPS coordinates using Haversine formula
 */
export const calculateDistanceMeters = (lat1, lon1, lat2 = GEOFENCE.latitude, lon2 = GEOFENCE.longitude) => {
  if (lat1 === undefined || lat1 === null || lon1 === undefined || lon1 === null) return null
  const numLat1 = parseFloat(lat1)
  const numLon1 = parseFloat(lon1)
  const numLat2 = parseFloat(lat2)
  const numLon2 = parseFloat(lon2)
  if (isNaN(numLat1) || isNaN(numLon1) || isNaN(numLat2) || isNaN(numLon2)) return null

  const R = 6371e3 // Earth radius in meters
  const toRad = (deg) => (deg * Math.PI) / 180
  const dLat = toRad(numLat2 - numLat1)
  const dLon = toRad(numLon2 - numLon1)

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(numLat1)) * Math.cos(toRad(numLat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2)

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return Math.round(R * c)
}

// ── TEMPORARY TESTING BYPASS ────────────────────────────────────────────────
// Geofence bypassed for testing for ~15-20 minutes (until 12:25 PM IST)
export const GEOFENCE_DISABLED_UNTIL = new Date('2026-10-04T12:25:00+05:30').getTime()

export const isGeofenceBypassed = () => {
  return Date.now() < GEOFENCE_DISABLED_UNTIL
}

/**
 * Checks whether given coordinates are within the Aparaitech Software geofence perimeter
 */
export const isWithinGeofence = (lat, lon, allowedRadius = GEOFENCE.allowedRadiusMeters) => {
  const isBypassed = isGeofenceBypassed()
  const dist = calculateDistanceMeters(lat, lon)

  if (isBypassed) {
    return {
      within: true,
      distance: dist !== null ? dist : 0,
      allowedRadius,
      officeName: GEOFENCE.name,
      bypassed: true
    }
  }

  if (dist === null) {
    return {
      within: false,
      distance: null,
      reason: 'GPS coordinates not provided'
    }
  }
  return {
    within: dist <= allowedRadius,
    distance: dist,
    allowedRadius,
    officeName: GEOFENCE.name
  }
}


export const timeToMinutes = (timeStr) => {
  if (!timeStr) return null
  const [h, m] = timeStr.split(':').map(Number)
  return h * 60 + m
}

export const calcHours = (inT, outT) => {
  const inMin = timeToMinutes(inT)
  const outMin = timeToMinutes(outT)
  if (!inMin || !outMin || outMin <= inMin) return '0h 0m'
  const diff = outMin - inMin
  return `${Math.floor(diff / 60)}h ${diff % 60}m`
}

/**
 * Determine attendance classification based on the employee's assigned shift
 */
export const getAttendanceStatus = (checkIn, checkOut, shiftId = 'shift_1') => {
  if (!checkIn || !checkOut) return 'pending'
  const inMin = timeToMinutes(checkIn)
  const outMin = timeToMinutes(checkOut)
  if (!inMin || !outMin || outMin <= inMin) return 'pending'

  const shift = SHIFTS[shiftId] || SHIFTS.shift_1
  const workedMinutes = outMin - inMin
  const requiredMinutes = shift.durationHours * 60
  const ratio = workedMinutes / requiredMinutes

  const cutoffMin = shift.startMin + (shift.graceMinutes !== undefined ? shift.graceMinutes : 15)
  const isLateLogin = inMin > cutoffMin

  // If checked in after the grace cutoff (e.g. after 11:10 AM for BDA Phase 2):
  // Rule: "bda phase 2 ka attendance login time 11.10 am tk hai uske baad half day"
  if (isLateLogin) {
    if (ratio >= 0.45) {
      return 'half-day'
    }
    return 'quarter-day'
  }

  // Full day: worked at least 75% of shift duration and checked in on time
  if (ratio >= 0.75) {
    return 'full-day'
  }
  // Half day: worked at least 45% of shift duration
  if (ratio >= 0.45) {
    return 'half-day'
  }
  // Otherwise Quarter day
  return 'quarter-day'
}

/**
 * Detailed explanation for status badge
 */
export const getStatusReason = (checkIn, checkOut, shiftId = 'shift_1') => {
  if (!checkIn || !checkOut) return ''
  const shift = SHIFTS[shiftId] || SHIFTS.shift_1
  const status = getAttendanceStatus(checkIn, checkOut, shiftId)
  const worked = calcHours(checkIn, checkOut)

  const inMin = timeToMinutes(checkIn)
  const outMin = timeToMinutes(checkOut)
  const cutoffMin = shift.startMin + (shift.graceMinutes !== undefined ? shift.graceMinutes : 15)
  const isLate = inMin > cutoffMin
  const isEarlyOut = outMin < (shift.endMin - (shift.graceMinutes !== undefined ? shift.graceMinutes : 15))

  const lateMinutes = isLate ? inMin - shift.startMin : 0
  const earlyMinutes = isEarlyOut ? shift.endMin - outMin : 0

  if (status === 'full-day') {
    return `Full Day (${shift.name} | Total: ${worked})`
  }
  if (status === 'half-day') {
    const notes = []
    if (isLate) {
      const h = Math.floor(cutoffMin / 60)
      const m = cutoffMin % 60
      const cutoffStr = `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`
      notes.push(`Late Login after ${cutoffStr} (${lateMinutes}m late)`)
    } else if (lateMinutes > 0) {
      notes.push(`Late by ${lateMinutes}m`)
    }
    if (earlyMinutes > 0) notes.push(`Left early by ${earlyMinutes}m`)
    return `Half Day (${shift.name} | Total: ${worked}${notes.length ? ' - ' + notes.join(', ') : ''})`
  }
  return `Quarter Day (${shift.name} | Total: ${worked} / ${shift.durationHours}h standard)`
}
