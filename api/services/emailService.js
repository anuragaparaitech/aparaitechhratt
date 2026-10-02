import transporter, { resolveEmailConfig } from '../config/mail.js'
import EmailLog from '../models/EmailLog.js'
import path from 'path'
import nodemailer from 'nodemailer'
import fs from 'fs'
import { getCheckInTemplate } from '../templates/checkInTemplate.js'
import { getCheckOutTemplate } from '../templates/checkOutTemplate.js'
import { getFullDayTemplate } from '../templates/fullDayTemplate.js'
import { getHalfDayTemplate } from '../templates/halfDayTemplate.js'
import { getEarlyCheckoutTemplate } from '../templates/earlyCheckoutTemplate.js'
import { getAdminTemplate } from '../templates/adminTemplate.js'
import { getHolidayTemplate } from '../templates/holidayTemplate.js'
import { getManualCheckoutWarningTemplate } from '../templates/manualCheckoutWarningTemplate.js'
import { getAutoCheckoutTemplate } from '../templates/autoCheckoutTemplate.js'
import { getAdminMessageTemplate } from '../templates/adminMessageTemplate.js'
import { getAdminMarkedCheckInTemplate } from '../templates/adminMarkedCheckInTemplate.js'
import { getAdminMarkedCheckOutTemplate } from '../templates/adminMarkedCheckOutTemplate.js'
import { getAdminPhysicalLogoutTemplate } from '../templates/adminPhysicalLogoutTemplate.js'
import Employee from '../models/Employee.js'

// Generic helper to send mail and log to MongoDB
const sendMailHelper = async (to, subject, html) => {
  const { host, port, user, pass, from: fromEmail, fromName } = resolveEmailConfig()

  // Validate email config
  if (!host || !port || !user || !pass || !fromEmail) {
    const errorMsg = 'SMTP Configuration validation failed: EMAIL_HOST, EMAIL_PORT, EMAIL_USER, EMAIL_PASSWORD, or EMAIL_FROM is missing.'
    console.error(`❌ [Mailer Error] ${errorMsg}`)
    const log = new EmailLog({
      recipient: to,
      subject,
      status: 'failure',
      errorMessage: errorMsg
    })
    await log.save()
    return false
  }

  // 1. If password key starts with xkeysib, attempt sending via Brevo REST API (highly reliable)
  if (pass && pass.startsWith('xkeysib-')) {
    try {
      console.log(`✉️ Attempting to send email via Brevo REST API: "${subject}" to ${to}`)
      const response = await fetch('https://api.brevo.com/v3/smtp/email', {
        method: 'POST',
        headers: {
          'accept': 'application/json',
          'api-key': pass,
          'content-type': 'application/json'
        },
        body: JSON.stringify({
          sender: {
            name: fromName.trim(),
            email: fromEmail.trim()
          },
          to: [
            {
              email: to.trim()
            }
          ],
          subject: subject,
          htmlContent: html
        })
      })

      const responseData = await response.json()
      
      if (response.ok) {
        console.log(`✉️ Email sent successfully via Brevo REST API: "${subject}" to ${to}`)
        const log = new EmailLog({
          recipient: to,
          subject,
          status: 'success'
        })
        await log.save()
        return true
      } else {
        throw new Error(responseData.message || JSON.stringify(responseData))
      }
    } catch (brevoError) {
      console.error(`❌ Brevo REST API send failed: ${brevoError.message}. Attempting SMTP fallback...`)
    }
  }

  // 2. Fallback to standard Nodemailer SMTP
  const fromAddress = `"${fromName.trim()}" <${fromEmail.trim()}>`

  const mailOptions = {
    from: fromAddress,
    to,
    subject,
    html
  }

  try {
    const info = await transporter.sendMail(mailOptions)
    console.log(`✉️ Email sent successfully via SMTP: "${subject}" to ${to}`)
    
    // Log success in DB
    const log = new EmailLog({
      recipient: to,
      subject,
      status: 'success'
    })
    await log.save()
    return true
  } catch (error) {
    console.error(`❌ Failed to send email via SMTP fallback: "${subject}" to ${to}. Error: ${error.message}`)
    
    // Log failure in DB
    const log = new EmailLog({
      recipient: to,
      subject,
      status: 'failure',
      errorMessage: error.message
    })
    await log.save()
    return false
  }
}

// 1. Employee Check-In Email
export const sendCheckInEmail = async (employee, time, date, status) => {
  const html = getCheckInTemplate({
    name: employee.name,
    empId: employee.empId,
    date,
    time,
    department: employee.department,
    status
  })
  return sendMailHelper(employee.email, '✅ Check-In Successful – Attendance Recorded', html)
}

// 2. Employee Check-Out Email
export const sendCheckOutEmail = async (employee, record) => {
  const html = getCheckOutTemplate({
    name: employee.name,
    empId: employee.empId,
    date: record.date,
    checkIn: record.checkIn,
    checkOut: record.checkOut,
    workingHours: record.workingHours,
    status: record.status
  })
  return sendMailHelper(employee.email, '✅ Check-Out Successful – Attendance Summary', html)
}

// 3. Full-Day Confirmation Email
export const sendFullDayEmail = async (employee, record) => {
  const html = getFullDayTemplate({
    name: employee.name,
    date: record.date,
    workingHours: record.workingHours
  })
  return sendMailHelper(employee.email, 'Full-Day Attendance Confirmation', html)
}

// 4. Half-Day Attendance Notification Email
export const sendHalfDayEmail = async (employee, record) => {
  const html = getHalfDayTemplate({
    name: employee.name,
    date: record.date,
    workingHours: record.workingHours,
    requiredHours: '9h 0m' // 9:30 AM to 6:30 PM is 9 hours
  })
  return sendMailHelper(employee.email, 'Half-Day Attendance Notification', html)
}

// 5. Early Check-Out Notification Email
export const sendEarlyCheckoutEmail = async (employee, record, diffMin) => {
  const html = getEarlyCheckoutTemplate({
    name: employee.name,
    date: record.date,
    actualOut: record.checkOut,
    expectedOut: '18:30',
    diffMin,
    status: record.status
  })
  return sendMailHelper(employee.email, 'Early Check-Out Notification', html)
}

// 6. Admin Notification Email
export const sendAdminCheckoutEmail = async (employee, record, isEarly) => {
  const hrEmail = process.env.HR_EMAIL || 'admin@aparaitech.com'
  const html = getAdminTemplate({
    name: employee.name,
    empId: employee.empId,
    department: employee.department,
    checkIn: record.checkIn,
    checkOut: record.checkOut,
    workingHours: record.workingHours,
    status: record.status,
    isEarly
  })
  return sendMailHelper(hrEmail, `🔔 HR Alert: Employee Checkout - ${employee.name}`, html)
}

// 7. Holiday Announcement Email
export const sendHolidayEmail = async (employee, holiday) => {
  const html = getHolidayTemplate({
    holidayName: holiday.holidayName,
    date: holiday.holidayDate,
    holidayType: holiday.holidayType,
    description: holiday.description,
    isPaidHoliday: holiday.isPaidHoliday
  })
  return sendMailHelper(employee.email, `📢 New Company Holiday Announcement: ${holiday.holidayName}`, html)
}

// 8. Attendance Check-In Reminder Email
export const sendCheckInReminder = async (employee) => {
  const html = `
    <div style="font-family: 'Inter', Arial, sans-serif; line-height: 1.6; color: #1e293b; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; padding: 25px; box-shadow: 0 4px 10px rgba(0,0,0,0.03);">
      <div style="border-bottom: 2px solid #e2e8f0; padding-bottom: 15px; margin-bottom: 20px;">
        <h2 style="color: #ea580c; margin: 0;">⚡ APARAITECH SOFTWARE</h2>
        <span style="font-size: 0.8rem; color: #64748b; font-weight: bold; text-transform: uppercase;">Attendance Policy Reminder</span>
      </div>
      <p>Dear <strong>${employee.name}</strong>,</p>
      <p>Our records indicate that you have not checked in today. Please complete your check-in before <strong>10:15 AM</strong> to avoid attendance issues.</p>
      <p style="background: #f8fafc; border-left: 4px solid #cbd5e1; padding: 12px; font-size: 0.9rem; color: #475569; border-radius: 4px;">
        💡 <em>If you have already checked in, please ignore this email.</em>
      </p>
      <p style="margin-top: 25px;">Regards,<br/><strong>HR Team</strong></p>
    </div>
  `
  return sendMailHelper(employee.email, 'Reminder: Please Check In', html)
}

// 9. Attendance Check-Out Reminder Email
export const sendCheckOutReminder = async (employee) => {
  const html = `
    <div style="font-family: 'Inter', Arial, sans-serif; line-height: 1.6; color: #1e293b; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; padding: 25px; box-shadow: 0 4px 10px rgba(0,0,0,0.03);">
      <div style="border-bottom: 2px solid #e2e8f0; padding-bottom: 15px; margin-bottom: 20px;">
        <h2 style="color: #ea580c; margin: 0;">⚡ APARAITECH SOFTWARE</h2>
        <span style="font-size: 0.8rem; color: #64748b; font-weight: bold; text-transform: uppercase;">Attendance Policy Reminder</span>
      </div>
      <p>Dear <strong>${employee.name}</strong>,</p>
      <p>Our records indicate that you have not checked out today. Please complete your check-out before <strong>7:30 PM</strong>.</p>
      <p style="background: #f8fafc; border-left: 4px solid #cbd5e1; padding: 12px; font-size: 0.9rem; color: #475569; border-radius: 4px;">
        💡 <em>If you have already checked out, please ignore this email.</em>
      </p>
      <p style="margin-top: 25px;">Regards,<br/><strong>HR Team</strong></p>
    </div>
  `
  return sendMailHelper(employee.email, 'Reminder: Please Check Out', html)
}

// 10. Manual Checkout Warning Email
export const sendManualCheckoutWarning = async (employee, date) => {
  const html = getManualCheckoutWarningTemplate({
    name: employee.name,
    date
  })
  return sendMailHelper(employee.email, 'Manual Check-Out Completed', html)
}

// 11. System Automatic Checkout Email
export const sendAutoCheckoutEmail = async (employee) => {
  const html = getAutoCheckoutTemplate({
    name: employee.name
  })
  return sendMailHelper(employee.email, 'Automatic Check-Out Completed', html)
}

// 12. Admin Message / Broadcast Email
export const sendAdminMessageEmail = async (recipient, subject, body, attachmentPath = null, adminName = "Administration") => {
  let toEmail = ''
  let employeeName = 'Employee'
  
  if (recipient && typeof recipient === 'object') {
    toEmail = recipient.email
    employeeName = recipient.name
  } else {
    toEmail = recipient
    try {
      const employee = await Employee.findOne({ email: toEmail.toLowerCase() })
      if (employee) {
        employeeName = employee.name
      }
    } catch (err) {
      console.error('Error resolving employee details for admin email:', err.message)
    }
  }

  const { host, port, user, pass, from, fromName } = resolveEmailConfig()
  const portalUrl = process.env.PORTAL_URL || process.env.FRONTEND_URL || 'http://localhost:5173'

  // Validate email config
  if (!host || !port || !user || !pass || !from) {
    const errorMsg = 'SMTP Configuration validation failed: EMAIL_HOST, EMAIL_PORT, EMAIL_USER, EMAIL_PASSWORD, or EMAIL_FROM is missing.'
    console.error(`❌ [Mailer Error] ${errorMsg}`)
    throw new Error(errorMsg)
  }

  const dateTime = new Date().toLocaleString('en-US', {
    timeZone: 'Asia/Kolkata',
    dateStyle: 'medium',
    timeStyle: 'short'
  })

  const html = getAdminMessageTemplate({
    employeeName,
    subject,
    message: body,
    dateTime,
    adminName,
    portalUrl
  })

  const to = toEmail

  // 1. Try Brevo REST API first if configured and has a Brevo API key format
  if (pass && pass.startsWith('xkeysib-')) {
    try {
      let attachmentsPayload = undefined
      if (attachmentPath) {
        const absolutePath = path.resolve(attachmentPath)
        const fileBuffer = fs.readFileSync(absolutePath)
        attachmentsPayload = [
          {
            name: path.basename(attachmentPath),
            content: fileBuffer.toString('base64')
          }
        ]
      }

      const response = await fetch('https://api.brevo.com/v3/smtp/email', {
        method: 'POST',
        headers: {
          'accept': 'application/json',
          'api-key': pass,
          'content-type': 'application/json'
        },
        body: JSON.stringify({
          sender: {
            name: 'Aparaitech Messaging Center',
            email: from
          },
          to: [
            {
              email: to
            }
          ],
          subject: `[Admin Message] ${subject}`,
          htmlContent: html,
          attachment: attachmentsPayload
        })
      })

      const responseData = await response.json()
      if (response.ok) {
        console.log(`✉️ Email sent successfully via Brevo REST API: "${subject}" to ${to}`)
        return true
      } else {
        throw new Error(responseData.message || JSON.stringify(responseData))
      }
    } catch (brevoError) {
      console.error(`❌ Brevo REST API send failed: ${brevoError.message}. Attempting SMTP fallback...`)
    }
  }


  // 2. Fallback to Nodemailer SMTP
  const customTransporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: {
      user,
      pass
    }
  })

  const mailOptions = {
    from: `"Aparaitech Messaging Center" <${from}>`,
    to,
    subject: `[Admin Message] ${subject}`,
    html
  }

  if (attachmentPath) {
    const absolutePath = path.resolve(attachmentPath)
    mailOptions.attachments = [
      {
        filename: path.basename(attachmentPath),
        path: absolutePath
      }
    ]
  }

  return customTransporter.sendMail(mailOptions)
}

// Test SMTP / REST API Connection by sending a test email
export const sendTestEmail = async (toEmail) => {
  const subject = '🧪 Aparaitech HRMS - SMTP Test Email'
  const html = `
    <div style="font-family: 'Inter', Arial, sans-serif; line-height: 1.6; color: #1e293b; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; padding: 25px; box-shadow: 0 4px 10px rgba(0,0,0,0.03);">
      <div style="border-bottom: 2px solid #e2e8f0; padding-bottom: 15px; margin-bottom: 20px;">
        <h2 style="color: #2563eb; margin: 0;">⚡ APARAITECH SOFTWARE</h2>
        <span style="font-size: 0.8rem; color: #64748b; font-weight: bold; text-transform: uppercase;">Diagnostic Mail System</span>
      </div>
      <p>Hello,</p>
      <p>This is a test email sent from the **Aparaitech HRMS** portal to verify that your mail configuration is fully functional.</p>
      <p style="background: #f0fdf4; border-left: 4px solid #16a34a; padding: 12px; font-size: 0.9rem; color: #166534; border-radius: 4px;">
        ✅ <strong>SMTP / REST API connection is successful!</strong>
      </p>
      <p style="font-size: 0.8rem; color: #64748b; margin-top: 20px;">
        Timestamp: ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })} (Asia/Kolkata)
      </p>
    </div>
  `
  return sendMailHelper(toEmail, subject, html)
}

// 12. Admin Marked Check-In Email
export const sendAdminMarkedCheckInEmail = async (employee, time, date) => {
  const html = getAdminMarkedCheckInTemplate({
    name: employee.name,
    time,
    date
  })
  return sendMailHelper(employee.email, 'Attendance Marked - Check-In', html)
}

// 13. Admin Marked Check-Out Email
export const sendAdminMarkedCheckOutEmail = async (employee, time, date) => {
  const html = getAdminMarkedCheckOutTemplate({
    name: employee.name,
    time,
    date
  })
  return sendMailHelper(employee.email, 'Attendance Marked - Check-Out', html)
}

// 14. Admin Physical Logout Email (marked as Half Day)
export const sendAdminPhysicalLogoutEmail = async (employee, date) => {
  const html = getAdminPhysicalLogoutTemplate({
    name: employee.name,
    date
  })
  return sendMailHelper(employee.email, 'Attendance Updated', html)
}

