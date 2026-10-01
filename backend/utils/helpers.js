export const timeToMinutes = (timeStr) => {
  if (!timeStr) return null
  const [h, m] = timeStr.split(':').map(Number)
  return h * 60 + m
}

export const getAttendanceStatus = (checkIn, checkOut) => {
  if (!checkIn || !checkOut) return 'pending'
  
  const inMin = timeToMinutes(checkIn)
  const outMin = timeToMinutes(checkOut)
  
  // Timing rules in minutes
  const quarterStartMorning = 10 * 60 + 15  // 10:15 AM
  const quarterEndMorning = 11 * 60         // 11:00 AM
  const halfStart = 11 * 60                 // 11:00 AM
  const halfEnd = 16 * 60 + 30              // 04:30 PM
  const quarterStartEvening = 17 * 60       // 05:00 PM
  const quarterEndEvening = 19 * 60         // 07:00 PM

  // Rule 1: Quarter Day (check-in 10:15 - 11:00 AM OR check-out 5:00 - 7:00 PM)
  if ((inMin >= quarterStartMorning && inMin <= quarterEndMorning) || 
      (outMin >= quarterStartEvening && outMin <= quarterEndEvening)) {
    return 'quarter-day'
  }
  
  // Rule 2: Half Day (check-in 11:00 AM - 4:30 PM OR check-out <= 4:30 PM)
  if ((inMin >= halfStart && inMin < halfEnd) || 
      (outMin <= halfEnd && outMin > halfStart)) {
    return 'half-day'
  }
  
  // Rule 3: Full Day (else)
  return 'full-day'
}

export const getStatusReason = (checkIn, checkOut) => {
  if (!checkIn || !checkOut) return ''
  
  const inMin = timeToMinutes(checkIn)
  const outMin = timeToMinutes(checkOut)
  
  if (inMin >= 10 * 60 + 15 && inMin <= 11 * 60) {
    return `Quarter Day (Late Check-in at ${checkIn} between 10:15-11:00 AM)`
  }
  if (outMin >= 17 * 60 && outMin <= 19 * 60) {
    return `Quarter Day (Early Check-out at ${checkOut} between 05:00-07:00 PM)`
  }
  if ((inMin >= 11 * 60 && inMin < 16 * 60 + 30) || (outMin <= 16 * 60 + 30 && outMin > 11 * 60)) {
    return `Half Day (Working window within 11:00 AM - 04:30 PM)`
  }
  return `Full Day (Standard Check-in ${checkIn} / Check-out ${checkOut})`
}

export const calcHours = (inT, outT) => {
  const inMin = timeToMinutes(inT)
  const outMin = timeToMinutes(outT)
  
  if (!inMin || !outMin || outMin <= inMin) return '0h 0m'
  
  const diff = outMin - inMin
  return `${Math.floor(diff / 60)}h ${diff % 60}m`
}
