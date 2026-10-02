import Attendance from '../models/Attendance.js'
import ActiveSession from '../models/ActiveSession.js'
import Employee from '../models/Employee.js'
import Holiday from '../models/Holiday.js'
import AuditLog from '../models/AuditLog.js'
import { getAttendanceStatus, getStatusReason, calcHours, timeToMinutes, SHIFTS, GEOFENCE, isWithinGeofence } from '../utils/helpers.js'
import {
  sendCheckInEmail,
  sendCheckOutEmail,
  sendFullDayEmail,
  sendHalfDayEmail,
  sendEarlyCheckoutEmail,
  sendAdminCheckoutEmail,
  sendManualCheckoutWarning,
  sendTestEmail,
  sendAdminMarkedCheckInEmail,
  sendAdminMarkedCheckOutEmail,
  sendAdminPhysicalLogoutEmail
} from '../services/emailService.js'
import {
  getKolkataTimeDetails,
  runCheckInReminders,
  runCheckOutReminders,
  runSystemAutoCheckout,
  REMINDER_CHECKIN_TIME,
  REMINDER_CHECKIN_LIMIT,
  REMINDER_CHECKOUT_TIME,
  REMINDER_CHECKOUT_LIMIT,
  AUTO_CHECKOUT_TIME
} from '../services/schedulerService.js'

export const getAttendanceRecords = async (req, res) => {
  const { email } = req.query
  
  // Debug log: API request received
  console.log(`[API Request] GET /api/attendance received. Query:`, req.query)

  try {
    // req.user is already populated by protect middleware
    const requester = req.user
    const role = requester.role
    const userEmail = requester.email

    console.log(`[API Request] Requester User Email: ${userEmail}, Role: ${role}`)

    if (role !== 'admin') {
      // If it's an employee, they can only request their own email logs
      if (role === 'employee') {
        if (!email || email.toLowerCase() !== userEmail.toLowerCase()) {
          console.warn(`[API Auth Error] Employee ${userEmail} is forbidden from accessing logs of ${email}`)
          return res.status(403).json({
            success: false,
            data: [],
            message: "Forbidden: Employees can only access their own attendance logs"
          })
        }
      } else {
        console.warn(`[API Auth Error] Invalid role: ${role}`)
        return res.status(403).json({
          success: false,
          data: [],
          message: "Forbidden: Invalid authorization role"
        })
      }
    }

    // Database Query Validation
    let query = {}
    if (email) {
      query.employeeEmail = email.toLowerCase()
    }
    
    const records = await Attendance.find(query).sort({ date: -1 })
    const liveSessions = await ActiveSession.find({})

    console.log(`[API Success] Query execution status: SUCCESS. Database response: retrieved ${records.length} records.`)

    return res.status(200).json({
      success: true,
      data: records,
      liveSessions: liveSessions,
      message: "Attendance logs fetched successfully"
    })
  } catch (error) {
    console.error(`[API Error] Error fetching attendance logs details:`, error.stack)
    return res.status(500).json({
      success: false,
      data: [],
      message: "Unable to fetch attendance logs"
    })
  }
}

export const checkIn = async (req, res) => {
  const { email, checkInTime, latitude, longitude } = req.body
  const today = new Date().toISOString().split('T')[0]
  
  try {
    const employee = await Employee.findOne({ email: email.toLowerCase() })
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' })
    }

    // Geofence Validation: Optenix Tech Solution (Lat: 18.596077, Lon: 73.718054, Radius: 200m)
    let locationVerified = null
    let locationDistanceMeters = null
    if (latitude !== undefined && longitude !== undefined && latitude !== null && longitude !== null) {
      const geoCheck = isWithinGeofence(latitude, longitude)
      locationDistanceMeters = geoCheck.distance
      locationVerified = geoCheck.within

      // 250m threshold allows reasonable tolerance for indoor smartphone GPS drift
      if (!geoCheck.within && geoCheck.distance > 250) {
        console.warn(`[Geofence Block] ${employee.email} attempted check-in ${geoCheck.distance}m away from ${geoCheck.officeName}`)
        return res.status(403).json({
          message: `Location outside office premises (${geoCheck.officeName}). You are ${geoCheck.distance}m away (allowed within ${geoCheck.allowedRadius}m). Attendance must be marked at office.`,
          distance: geoCheck.distance,
          allowedRadius: geoCheck.allowedRadius,
          officeName: geoCheck.officeName
        })
      }
    }
    
    // Check if employee is already checked in for today
    const existingSession = await ActiveSession.findOne({ employeeEmail: email.toLowerCase(), date: today })
    if (existingSession) {
      return res.status(400).json({ message: 'Employee is already checked in' })
    }
    
    // Check if employee has already completed attendance for today
    const completedAttendance = await Attendance.findOne({ employeeEmail: email.toLowerCase(), date: today })
    if (completedAttendance) {
      return res.status(400).json({ message: 'Attendance already completed for today' })
    }

    const assignedShift = employee.shift || (employee.department === 'Development' ? 'shift_1' : 'shift_2')
    const shiftInfo = SHIFTS[assignedShift] || SHIFTS.shift_1
    
    const session = new ActiveSession({
      employeeEmail: employee.email,
      empId: employee.empId,
      name: employee.name,
      department: employee.department,
      checkInTime,
      date: today,
      shift: assignedShift,
      latitude: latitude || null,
      longitude: longitude || null
    })
    await session.save()

    // Create a pending attendance record in the database immediately on check-in
    const attendanceRecord = new Attendance({
      employeeId: employee.empId,
      employeeName: employee.name,
      employeeEmail: employee.email,
      department: employee.department,
      date: today,
      checkIn: checkInTime,
      checkOut: '',
      workingHours: '—',
      status: 'pending',
      statusReason: `Active check-in [${shiftInfo.name}]`,
      shift: assignedShift,
      latitude: latitude || null,
      longitude: longitude || null,
      locationVerified,
      locationDistanceMeters
    })
    await attendanceRecord.save()

    // Asynchronously send check-in email without blocking the API response
    sendCheckInEmail(employee, checkInTime, today, 'pending').catch(err => {
      console.error('Non-blocking check-in email error:', err.message)
    })
    
    res.status(201).json({
      message: 'Checked in successfully',
      session,
      shift: shiftInfo,
      geofence: locationDistanceMeters !== null ? {
        verified: locationVerified,
        distanceMeters: locationDistanceMeters,
        officeName: GEOFENCE.name
      } : null
    })
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

export const checkOut = async (req, res) => {
  const { email, checkOutTime, latitude, longitude } = req.body
  const today = new Date().toISOString().split('T')[0]
  
  try {
    const session = await ActiveSession.findOne({ employeeEmail: email.toLowerCase(), date: today })
    if (!session) {
      return res.status(400).json({ message: 'No active check-in found for today' })
    }

    const employee = await Employee.findOne({ email: email.toLowerCase() })

    // Geofence Validation if coordinates provided
    let locationVerified = null
    let locationDistanceMeters = null
    if (latitude !== undefined && longitude !== undefined && latitude !== null && longitude !== null) {
      const geoCheck = isWithinGeofence(latitude, longitude)
      locationDistanceMeters = geoCheck.distance
      locationVerified = geoCheck.within

      if (!geoCheck.within && geoCheck.distance > 250) {
        console.warn(`[Geofence Block] ${email} attempted check-out ${geoCheck.distance}m away from ${geoCheck.officeName}`)
        return res.status(403).json({
          message: `Location outside office premises (${geoCheck.officeName}). You are ${geoCheck.distance}m away (allowed within ${geoCheck.allowedRadius}m).`,
          distance: geoCheck.distance,
          allowedRadius: geoCheck.allowedRadius,
          officeName: geoCheck.officeName
        })
      }
    }
    
    // Check if today is a holiday
    const isHolidayObj = await Holiday.findOne({ holidayDate: today })
    let isHoliday = false
    if (isHolidayObj) {
      if (isHolidayObj.appliesTo === 'All Employees') {
        isHoliday = true
      } else {
        isHoliday = isHolidayObj.employeeIds.some(emailStr => emailStr.toLowerCase() === email.toLowerCase())
      }
    }

    const assignedShift = session.shift || (employee && employee.shift) || (session.department === 'Development' ? 'shift_1' : 'shift_2')
    const shiftInfo = SHIFTS[assignedShift] || SHIFTS.shift_1

    // Calculate status and reason according to assigned shift
    let status = getAttendanceStatus(session.checkInTime, checkOutTime, assignedShift)
    let statusReason = getStatusReason(session.checkInTime, checkOutTime, assignedShift)
    
    if (isHoliday) {
      status = 'worked-on-holiday'
      statusReason = `Worked on Holiday: ${isHolidayObj.holidayName}`
    }

    const workingHours = calcHours(session.checkInTime, checkOutTime)
    
    // Check if record exists
    let record = await Attendance.findOne({ employeeEmail: email.toLowerCase(), date: today })
    
    if (record) {
      record.checkIn = session.checkInTime
      record.checkOut = checkOutTime
      record.status = status
      record.workingHours = workingHours
      record.statusReason = statusReason
      record.shift = assignedShift
      if (latitude !== undefined) record.latitude = latitude
      if (longitude !== undefined) record.longitude = longitude
      if (locationVerified !== null) record.locationVerified = locationVerified
      if (locationDistanceMeters !== null) record.locationDistanceMeters = locationDistanceMeters
      await record.save()
    } else {
      record = new Attendance({
        employeeId: session.empId,
        employeeName: session.name,
        employeeEmail: session.employeeEmail,
        department: session.department,
        date: today,
        checkIn: session.checkInTime,
        checkOut: checkOutTime,
        status,
        workingHours,
        statusReason,
        shift: assignedShift,
        latitude: latitude || null,
        longitude: longitude || null,
        locationVerified,
        locationDistanceMeters
      })
      await record.save()
    }
    
    // Remove active check-in session
    await ActiveSession.deleteOne({ _id: session._id })

    // Calculate if early checkout based on assigned shift end time
    const expectedOutMin = shiftInfo.endMin - shiftInfo.graceMinutes
    const checkoutMinutes = timeToMinutes(checkOutTime)
    const isEarly = !isHoliday && checkoutMinutes ? (checkoutMinutes < expectedOutMin) : false
    const earlyDiff = isEarly ? (expectedOutMin - checkoutMinutes) : 0

    // Trigger email alerts asynchronously without blocking the client response
    const triggerCheckoutEmails = async () => {
      try {
        const employee = await Employee.findOne({ email: email.toLowerCase() })
        if (!employee) return

        // 1. Send Check-Out summary email to employee
        await sendCheckOutEmail(employee, record)

        // 2. Send HR / Admin alert email
        await sendAdminCheckoutEmail(employee, record, isEarly)

        // 3. Status-based employee emails
        if (status === 'full-day') {
          await sendFullDayEmail(employee, record)
        } else if (status === 'half-day') {
          await sendHalfDayEmail(employee, record)
        }

        // 4. Send early checkout notification email if applicable
        if (isEarly) {
          await sendEarlyCheckoutEmail(employee, record, earlyDiff)
        }
      } catch (err) {
        console.error('Non-blocking checkout email trigger error:', err.message)
      }
    }

    triggerCheckoutEmails()
    
    res.status(200).json({ message: 'Checked out successfully', record })
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

export const manualMark = async (req, res) => {
  const { email, date, status, checkIn, checkOut, shift } = req.body
  
  try {
    const employee = await Employee.findOne({ email: email.toLowerCase() })
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' })
    }

    const assignedShift = shift || employee.shift || (employee.department === 'Development' ? 'shift_1' : 'shift_2')
    
    let finalStatus = status
    if (checkIn && !checkOut) {
      finalStatus = 'pending'
    } else if (!finalStatus && checkIn && checkOut) {
      finalStatus = getAttendanceStatus(checkIn, checkOut, assignedShift)
    }
    if (!finalStatus) finalStatus = 'full-day'

    let statusReason = 'Manually marked by Admin'
    if (status === 'holiday') {
      statusReason = 'Manual Holiday Declaration'
    } else if (status === 'worked-on-holiday') {
      statusReason = 'Manual Worked on Holiday'
    } else if (checkIn && !checkOut) {
      statusReason = 'Active check-in (pending check-out)'
    } else if (checkIn && checkOut) {
      statusReason = getStatusReason(checkIn, checkOut, assignedShift) || `Manually marked by Admin (${checkIn} - ${checkOut})`
    }
    
    const workingHours = (status === 'holiday' || !checkOut) ? '—' : calcHours(checkIn, checkOut)
    const finalCheckOut = checkOut || ''
    
    let record = await Attendance.findOne({ employeeEmail: email.toLowerCase(), date })
    
    if (record) {
      record.checkIn = checkIn
      record.checkOut = finalCheckOut
      record.status = finalStatus
      record.workingHours = workingHours
      record.statusReason = statusReason
      record.shift = assignedShift
      record.markedBy = 'Admin'
      await record.save()
    } else {
      record = new Attendance({
        employeeId: employee.empId,
        employeeName: employee.name,
        employeeEmail: employee.email,
        department: employee.department,
        date,
        checkIn,
        checkOut: finalCheckOut,
        status: finalStatus,
        workingHours,
        statusReason,
        shift: assignedShift,
        markedBy: 'Admin'
      })
      await record.save()
    }

    // Asynchronous non-blocking helper to send email notification and track status
    const triggerAdminMarkedEmails = async (recordId) => {
      try {
        const currentRecord = await Attendance.findById(recordId)
        if (!currentRecord) return

        const emp = await Employee.findOne({ email: email.toLowerCase() })
        if (!emp) return

        let hasUpdates = false

        // 1. Send Check-In Email if checkIn exists and hasn't been sent yet
        if (checkIn && !currentRecord.adminCheckInEmailSent) {
          const success = await sendAdminMarkedCheckInEmail(emp, checkIn, date)
          if (success) {
            currentRecord.adminCheckInEmailSent = true
            hasUpdates = true
            console.log(`✉️ Manual Check-In email sent to ${emp.email}`)
          } else {
            console.warn(`❌ Failed to send manual Check-In email to ${emp.email}`)
          }
        }

        // 2. Send Check-Out Email if checkOut exists and hasn't been sent yet
        if (checkOut && !currentRecord.adminCheckOutEmailSent) {
          const success = await sendAdminMarkedCheckOutEmail(emp, checkOut, date)
          if (success) {
            currentRecord.adminCheckOutEmailSent = true
            hasUpdates = true
            console.log(`✉️ Manual Check-Out email sent to ${emp.email}`)
          } else {
            console.warn(`❌ Failed to send manual Check-Out email to ${emp.email}`)
          }
        }

        if (hasUpdates) {
          await currentRecord.save()
        }
      } catch (err) {
        console.error('Non-blocking admin marked email trigger error:', err.message)
      }
    }

    // Fire off asynchronously without blocking API response
    triggerAdminMarkedEmails(record._id)

    
    // Manage active session if manual override is for today
    const today = new Date().toISOString().split('T')[0]
    if (date === today) {
      if (checkIn && !checkOut) {
        let session = await ActiveSession.findOne({ employeeEmail: email.toLowerCase(), date: today })
        if (!session) {
          session = new ActiveSession({
            employeeEmail: employee.email,
            empId: employee.empId,
            name: employee.name,
            department: employee.department,
            checkInTime: checkIn,
            date: today
          })
        } else {
          session.checkInTime = checkIn
        }
        await session.save()
      } else {
        await ActiveSession.deleteOne({ employeeEmail: email.toLowerCase(), date: today })
      }
    }
    
    res.status(200).json({ message: 'Attendance recorded manually', record })
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

export const deleteRecord = async (req, res) => {
  const { id } = req.params
  
  try {
    const record = await Attendance.findById(id)
    if (!record) {
      return res.status(404).json({ message: 'Record not found' })
    }
    
    await Attendance.deleteOne({ _id: id })
    res.status(200).json({ message: 'Attendance record deleted' })
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

export const clearAll = async (req, res) => {
  try {
    await Attendance.deleteMany({})
    await ActiveSession.deleteMany({})
    res.status(200).json({ message: 'All attendance records cleared' })
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

export const getMissingCheckouts = async (req, res) => {
  console.log(`[API Request] GET /api/attendance/missing-checkout received.`)
  try {
    const { dateStr, timeStr } = getKolkataTimeDetails()
    const sessions = await ActiveSession.find({ date: { $lte: dateStr } })
    const limitTime = REMINDER_CHECKOUT_LIMIT
    
    const missing = sessions.filter(s => {
      if (s.date < dateStr) return true
      return timeStr >= limitTime
    })

    const result = []
    for (const session of missing) {
      const employee = await Employee.findOne({ email: session.employeeEmail.toLowerCase() })
      result.push({
        _id: session._id,
        empId: employee ? employee.empId : '—',
        name: session.employeeName,
        email: session.employeeEmail,
        department: employee ? employee.department : '—',
        checkInTime: session.checkInTime,
        date: session.date
      })
    }

    console.log(`[API Success] GET /api/attendance/missing-checkout retrieved: ${result.length} missing sessions.`)
    res.status(200).json({ success: true, missing: result })
  } catch (error) {
    console.error(`[API Error] GET /api/attendance/missing-checkout failed:`, error.stack)
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

export const performManualCheckout = async (req, res) => {
  const { email, adminName } = req.body
  if (!email) {
    return res.status(400).json({ message: 'Employee email is required' })
  }

  try {
    const session = await ActiveSession.findOne({ employeeEmail: email.toLowerCase() })
    if (!session) {
      return res.status(404).json({ message: 'No active check-in session found for this employee' })
    }

    const employee = await Employee.findOne({ email: email.toLowerCase() })
    const checkOutTime = REMINDER_CHECKOUT_LIMIT

    // Validation: prevent accidental status changes if normal checkout already completed
    let record = await Attendance.findOne({ employeeEmail: email.toLowerCase(), date: session.date })
    if (record && record.status !== 'pending' && record.checkOut) {
      return res.status(400).json({ message: 'Employee has already completed a valid checkout for today' })
    }

    const prevStatus = record ? record.status : 'pending'

    // Server time check for 7:30 PM rule
    const { timeStr } = getKolkataTimeDetails()
    const currentMin = timeToMinutes(timeStr)
    const limitMin = timeToMinutes('19:30')
    const isAfter730PM = currentMin > limitMin

    let status = getAttendanceStatus(session.checkInTime, checkOutTime)
    let statusReason = 'Manually checked out by Admin (Forgot to check out)'
    let finalLogoutType = 'Normal'

    if (isAfter730PM) {
      status = 'half-day'
      statusReason = 'Admin Physical Logout After 7:30 PM – Marked as Half Day'
      finalLogoutType = 'Admin Physical Logout'
    }

    const workingHours = calcHours(session.checkInTime, checkOutTime)

    if (record) {
      record.checkIn = session.checkInTime
      record.checkOut = checkOutTime
      record.status = status
      record.workingHours = workingHours
      record.statusReason = statusReason
      record.markedBy = 'Admin'
      record.logoutType = finalLogoutType
      await record.save()
    } else {
      record = new Attendance({
        employeeId: employee ? employee.empId : session.empId,
        employeeName: employee ? employee.name : session.name,
        employeeEmail: session.employeeEmail,
        department: employee ? employee.department : session.department,
        date: session.date,
        checkIn: session.checkInTime,
        checkOut: checkOutTime,
        status: status,
        workingHours: workingHours,
        statusReason: statusReason,
        markedBy: 'Admin',
        logoutType: finalLogoutType
      })
      await record.save()
    }

    await ActiveSession.deleteOne({ _id: session._id })

    // Structured Audit Log Details
    const auditDetails = `Admin Physical Logout Action details:
- Admin Name: ${adminName || 'Admin'}
- Employee Name: ${employee ? employee.name : session.name}
- Logout Time: ${timeStr} (Kolkata time)
- Previous Status: ${prevStatus}
- New Status: ${status}
- Reason: ${statusReason}`

    const audit = new AuditLog({
      action: 'MANUAL_CHECKOUT',
      details: auditDetails,
      performedBy: adminName || 'Admin'
    })
    await audit.save()

    try {
      if (isAfter730PM) {
        await sendAdminPhysicalLogoutEmail(employee || { name: session.name, email: session.employeeEmail }, session.date)
      } else {
        await sendManualCheckoutWarning(employee || { name: session.name, email: session.employeeEmail }, session.date)
      }
    } catch (err) {
      console.error('Non-blocking manual checkout email failure:', err.message)
    }

    res.status(200).json({ success: true, message: 'Employee checked out manually by Administrator', record })
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

export const triggerCheckInReminders = async (req, res) => {
  const { adminEmail } = req.body
  try {
    await runCheckInReminders(adminEmail || 'WEBHOOK')
    res.status(200).json({ success: true, message: 'Check-In reminders processed successfully' })
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

export const triggerCheckOutReminders = async (req, res) => {
  const { adminEmail } = req.body
  try {
    await runCheckOutReminders(adminEmail || 'WEBHOOK')
    res.status(200).json({ success: true, message: 'Check-Out reminders processed successfully' })
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

export const triggerAutoCheckout = async (req, res) => {
  const { adminEmail } = req.body
  try {
    await runSystemAutoCheckout(adminEmail || 'WEBHOOK')
    res.status(200).json({ success: true, message: 'System auto checkout processed successfully' })
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

export const triggerTestEmail = async (req, res) => {
  const { toEmail } = req.body
  if (!toEmail) {
    return res.status(400).json({ success: false, message: 'Recipient email (toEmail) is required' })
  }

  try {
    console.log(`🧪 Received trigger request for test email to: ${toEmail}`)
    const success = await sendTestEmail(toEmail)
    if (success) {
      res.status(200).json({ success: true, message: `Test email sent successfully to ${toEmail}!` })
    } else {
      res.status(500).json({ success: false, message: 'Failed to send test email. Check server log outputs for diagnostics.' })
    }
  } catch (error) {
    res.status(500).json({ success: false, message: `Server error while sending test email: ${error.message}` })
  }
}

