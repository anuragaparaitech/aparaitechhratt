import cron from 'node-cron'
import Employee from '../models/Employee.js'
import ActiveSession from '../models/ActiveSession.js'
import Attendance from '../models/Attendance.js'
import Holiday from '../models/Holiday.js'
import EmailLog from '../models/EmailLog.js'
import AuditLog from '../models/AuditLog.js'
import { sendCheckInReminder, sendCheckOutReminder, sendAutoCheckoutEmail } from './emailService.js'
import { getAttendanceStatus, calcHours } from '../utils/helpers.js'

// Hardcoded Attendance Timings (Asia/Kolkata timezone, 24-hour format)
export const REMINDER_CHECKIN_TIME = "10:00"
export const REMINDER_CHECKIN_LIMIT = "10:15"
export const REMINDER_CHECKOUT_TIME = "19:00"
export const REMINDER_CHECKOUT_LIMIT = "19:30"
export const AUTO_CHECKOUT_TIME = "20:00"


// Helper to get local date strings for Asia/Kolkata
export const getKolkataTimeDetails = () => {
  const now = new Date()
  const options = { timeZone: 'Asia/Kolkata', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }
  
  // Format to: MM/DD/YYYY, HH:MM:SS
  const formatter = new Intl.DateTimeFormat('en-US', options)
  const parts = formatter.formatToParts(now)
  
  const year = parts.find(p => p.type === 'year').value
  const month = parts.find(p => p.type === 'month').value
  const day = parts.find(p => p.type === 'day').value
  const hour = parts.find(p => p.type === 'hour').value
  const minute = parts.find(p => p.type === 'minute').value
  
  const dateStr = `${year}-${month}-${day}` // YYYY-MM-DD
  const timeStr = `${hour}:${minute}` // HH:MM
  const dayOfWeek = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Kolkata' })).getDay() // 0-6 (0=Sun, 6=Sat)

  return { dateStr, timeStr, dayOfWeek }
}

// 1. Process Check-In Reminders
export const runCheckInReminders = async (triggeredBy = 'SYSTEM') => {
  const { dateStr } = getKolkataTimeDetails()
  
  try {
    // Skip if today is a holiday
    const isHoliday = await Holiday.findOne({ holidayDate: dateStr })
    if (isHoliday) {
      console.log(`📅 Today (${dateStr}) is a declared holiday (${isHoliday.holidayName}). Skipping Check-In Reminders.`)
      return
    }

    const employees = await Employee.find({ role: 'employee', status: 'active' })
    let countSent = 0

    // Set today boundaries for email logs query
    const startOfDay = new Date(new Date().setHours(0, 0, 0, 0))
    const endOfDay = new Date(new Date().setHours(23, 59, 59, 999))

    for (const employee of employees) {
      // Check if employee checked in today
      const hasActive = await ActiveSession.findOne({ employeeEmail: employee.email, date: dateStr })
      const hasAttendance = await Attendance.findOne({ employeeEmail: employee.email, date: dateStr })

      if (!hasActive && !hasAttendance) {
        // Check if we already sent a reminder email today
        const alreadySent = await EmailLog.findOne({
          recipient: employee.email,
          subject: 'Reminder: Please Check In',
          timestamp: { $gte: startOfDay, $lte: endOfDay }
        })

        if (!alreadySent) {
          await sendCheckInReminder(employee)
          countSent++
        }
      }
    }

    // Write audit log
    const audit = new AuditLog({
      action: triggeredBy === 'SYSTEM' ? 'CHECKIN_REMINDER_CRON' : 'MANUAL_WEBHOOK_TRIGGER',
      details: `Processed check-in reminders on date ${dateStr}. Sent reminders to ${countSent} employees.`,
      performedBy: triggeredBy
    })
    await audit.save()
    console.log(`⏰ [Check-In Scheduler] Completed. Reminders sent to ${countSent} employees.`)
  } catch (error) {
    console.error('❌ Scheduler Check-In Reminder Error:', error.message)
  }
}

// 2. Process Check-Out Reminders
export const runCheckOutReminders = async (triggeredBy = 'SYSTEM') => {
  const { dateStr, timeStr } = getKolkataTimeDetails()
  
  // Failsafe constraint: do not execute before 7:00 PM
  const checkOutReminderConfig = REMINDER_CHECKOUT_TIME
  if (timeStr < checkOutReminderConfig && triggeredBy !== 'test-admin@aparaitech.com') {
    console.log(`⚠️ Failsafe: Prevented check-out reminders execution before 7:00 PM. Current time: ${timeStr}`)
    return
  }
  
  try {
    // Skip if today is a holiday
    const isHoliday = await Holiday.findOne({ holidayDate: dateStr })
    if (isHoliday) {
      console.log(`📅 Today (${dateStr}) is a declared holiday. Skipping Check-Out Reminders.`)
      return
    }

    const employees = await Employee.find({ role: 'employee', status: 'active' })
    let countSent = 0

    const startOfDay = new Date(new Date().setHours(0, 0, 0, 0))
    const endOfDay = new Date(new Date().setHours(23, 59, 59, 999))

    for (const employee of employees) {
      // Check if employee has an active checked-in session today (with no checkout yet)
      const session = await ActiveSession.findOne({ employeeEmail: employee.email, date: dateStr })

      if (session) {
        // Check if we already sent a check-out reminder email today
        const alreadySent = await EmailLog.findOne({
          recipient: employee.email,
          subject: 'Reminder: Please Check Out',
          timestamp: { $gte: startOfDay, $lte: endOfDay }
        })

        if (!alreadySent) {
          await sendCheckOutReminder(employee)
          countSent++
        }
      }
    }

    // Write audit log
    const audit = new AuditLog({
      action: triggeredBy === 'SYSTEM' ? 'CHECKOUT_REMINDER_CRON' : 'MANUAL_WEBHOOK_TRIGGER',
      details: `Processed check-out reminders on date ${dateStr}. Sent reminders to ${countSent} employees.`,
      performedBy: triggeredBy
    })
    await audit.save()
    console.log(`⏰ [Check-Out Scheduler] Completed. Reminders sent to ${countSent} employees.`)
  } catch (error) {
    console.error('❌ Scheduler Check-Out Reminder Error:', error.message)
  }
}

// 3. Process System Auto Checkouts (After 8:00 PM)
export const runSystemAutoCheckout = async (triggeredBy = 'SYSTEM') => {
  const { dateStr, timeStr } = getKolkataTimeDetails()
  
  // Failsafe constraint: do not execute before 8:00 PM
  const autoCheckoutConfig = AUTO_CHECKOUT_TIME
  if (timeStr < autoCheckoutConfig && triggeredBy !== 'SYSTEM_CRON_TRIGGER') {
    console.log(`⚠️ Failsafe: Prevented system auto checkout execution before 8:00 PM. Current time: ${timeStr}`)
    return
  }
  
  try {
    // Find all active sessions where date is today or prior
    const sessions = await ActiveSession.find({ date: { $lte: dateStr } })
    let countCheckedOut = 0
    const autoCheckoutTime = AUTO_CHECKOUT_TIME

    for (const session of sessions) {
      const employee = await Employee.findOne({ email: session.employeeEmail.toLowerCase() })
      
      const status = getAttendanceStatus(session.checkInTime, autoCheckoutTime)
      const workingHours = calcHours(session.checkInTime, autoCheckoutTime)
      const statusReason = 'System Auto Checkout'

      // Update or create Attendance
      let record = await Attendance.findOne({ employeeEmail: session.employeeEmail.toLowerCase(), date: session.date })
      if (record) {
        record.checkIn = session.checkInTime
        record.checkOut = autoCheckoutTime
        record.status = status
        record.workingHours = workingHours
        record.statusReason = statusReason
        await record.save()
      } else {
        record = new Attendance({
          employeeId: employee ? employee.empId : session.empId,
          employeeName: employee ? employee.name : session.name,
          employeeEmail: session.employeeEmail,
          department: employee ? employee.department : session.department,
          date: session.date,
          checkIn: session.checkInTime,
          checkOut: autoCheckoutTime,
          status: status,
          workingHours: workingHours,
          statusReason: statusReason
        })
        await record.save()
      }

      // Delete session
      await ActiveSession.deleteOne({ _id: session._id })

      // Audit Log
      const audit = new AuditLog({
        action: 'SYSTEM_AUTO_CHECKOUT',
        details: `System Auto Checkout executed for ${session.name} (${session.employeeEmail}) for date ${session.date}. Checkout time set to ${autoCheckoutTime}.`,
        performedBy: triggeredBy
      })
      await audit.save()

      // Send warning notification
      try {
        await sendAutoCheckoutEmail(employee || { name: session.name, email: session.employeeEmail })
      } catch (emailErr) {
        console.error('Non-blocking auto checkout notification email error:', emailErr.message)
      }

      countCheckedOut++
    }

    console.log(`⏰ [Auto Checkout Scheduler] Completed. Automatically checked out ${countCheckedOut} employee sessions.`)
  } catch (error) {
    console.error('❌ Scheduler Auto Checkout Error:', error.message)
  }
}

// Initialize Scheduler Daemon
export const initScheduler = () => {
  console.log('⏰ Initializing Attendance Reminder Cron Daemon (Asia/Kolkata local time check)...')
  
  // Run every minute to check if the current local time matches the configured reminder times
  cron.schedule('* * * * *', async () => {
    const { timeStr, dayOfWeek } = getKolkataTimeDetails()
    
    // Only run on working days (Monday = 1, Tuesday = 2, ..., Saturday = 6)
    if (dayOfWeek === 0) return

    const checkInReminderConfig = REMINDER_CHECKIN_TIME
    const checkOutReminderConfig = REMINDER_CHECKOUT_TIME
    const autoCheckoutConfig = AUTO_CHECKOUT_TIME

    if (timeStr === checkInReminderConfig) {
      console.log(`⏰ [Cron Trigger] Current local time matches Check-In Reminder time (${checkInReminderConfig}). Starting...`)
      await runCheckInReminders('SYSTEM')
    }

    if (timeStr === checkOutReminderConfig) {
      console.log(`⏰ [Cron Trigger] Current local time matches Check-Out Reminder time (${checkOutReminderConfig}). Starting...`)
      await runCheckOutReminders('SYSTEM')
    }

    if (timeStr === autoCheckoutConfig) {
      console.log(`⏰ [Cron Trigger] Current local time matches System Auto Checkout time (${autoCheckoutConfig}). Starting...`)
      await runSystemAutoCheckout('SYSTEM')
    }
  })
}
