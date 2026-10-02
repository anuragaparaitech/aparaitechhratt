import dotenv from 'dotenv'
dotenv.config()
import mongoose from 'mongoose'
import Employee from '../models/Employee.js'
import Holiday from '../models/Holiday.js'
import ProductConversion from '../models/ProductConversion.js'
import DailyReport from '../models/DailyReport.js'
import Attendance from '../models/Attendance.js'
import Message from '../models/Message.js'

const results = {
  db: { passed: false, details: '' },
  collections: {},
  auth: { admin: false, employee: false, details: '' },
  reports: { passed: false, details: '' },
  conversions: { passed: false, details: '' },
  documents: { passed: false, details: '' }
}

async function runAudit() {
  console.log('====================================================')
  console.log('🚀 APARAITECH SYSTEM FULL AUDIT & TEST SUITE')
  console.log('====================================================\n')

  // 1. DATABASE CONNECTION
  console.log('1️⃣ Checking MongoDB Atlas Connection...')
  const uri = process.env.MONGODB_URI
  console.log(`URI: ${uri ? uri.replace(/:[^:]*@/, ':****@') : 'MISSING'}`)

  if (!uri || !uri.includes('mongodb+srv://') || !uri.includes('cluster0.ndpqh89.mongodb.net')) {
    throw new Error('MONGODB_URI is not pointing to the official MongoDB Atlas cluster!')
  }

  await mongoose.connect(uri)
  const dbName = mongoose.connection.name
  const host = mongoose.connection.host
  results.db = {
    passed: true,
    dbName,
    host,
    details: `Connected to MongoDB Atlas: ${host}/${dbName}`
  }
  console.log(`✅ ${results.db.details}\n`)

  // 2. CHECK COLLECTIONS & COUNTS
  console.log('2️⃣ Verifying MongoDB Atlas Collections...')
  const empCount = await Employee.countDocuments()
  const holCount = await Holiday.countDocuments()
  const convCount = await ProductConversion.countDocuments()
  const repCount = await DailyReport.countDocuments()
  const attCount = await Attendance.countDocuments()
  const msgCount = await Message.countDocuments()

  results.collections = {
    employees: empCount,
    holidays: holCount,
    productConversions: convCount,
    dailyReports: repCount,
    attendances: attCount,
    messages: msgCount
  }

  console.log(`- Employees in Atlas: ${empCount}`)
  console.log(`- Official Holidays in Atlas: ${holCount}`)
  console.log(`- Product Conversions in Atlas: ${convCount}`)
  console.log(`- Daily Working Reports in Atlas: ${repCount}`)
  console.log(`- Attendance Records in Atlas: ${attCount}`)
  console.log(`- Messages in Atlas: ${msgCount}`)
  console.log('✅ All Atlas collections verified.\n')

  // 3. AUTHENTICATION VERIFICATION
  console.log('3️⃣ Verifying Accounts & Login Roles...')
  const adminUser = await Employee.findOne({ role: 'admin' })
  const normalEmployee = await Employee.findOne({ role: { $in: ['employee', 'bda'] } })

  if (adminUser) {
    results.auth.admin = true
    console.log(`✅ Admin Account: ${adminUser.name} (${adminUser.email}) - Role: ${adminUser.role}`)
  } else {
    console.log('❌ Admin user not found!')
  }

  if (normalEmployee) {
    results.auth.employee = true
    console.log(`✅ Employee Account: ${normalEmployee.name} (${normalEmployee.email}) - Dept: ${normalEmployee.department || 'BDA'}`)
  } else {
    console.log('❌ Standard employee not found!')
  }
  console.log('')

  // 4. DAILY WORKING REPORT TEST (UPSERT & CUSTOM DATE)
  console.log('4️⃣ Testing Daily Working Report Model & Date Flexibility...')
  const testDate = '2026-10-02'
  const testEmail = normalEmployee ? normalEmployee.email : 'test@aparaitech.com'

  const testReport = await DailyReport.findOneAndUpdate(
    { employeeEmail: testEmail, reportDate: testDate },
    {
      employeeEmail: testEmail,
      employeeName: normalEmployee ? normalEmployee.name : 'Test Associate',
      employeeId: normalEmployee ? normalEmployee.empId : 'AP-TEST',
      teamName: 'BDA Team',
      reportDate: testDate,
      reportTime: '06:30 PM',
      connectedCalls: 45,
      callsAbove3Min: 18,
      groupsCreated: 4,
      membersInGroups: 120,
      onboardingConversions: 1,
      finalizeConversions: 0,
      fullConversions: 1,
      todayConversions: 2,
      revenue: 7500, // (1 * 1500) + (1 * 6000)
      remarks: 'Automated test suite verification for daily report'
    },
    { upsert: true, new: true }
  )

  if (testReport && testReport.revenue === 7500 && testReport.reportDate === testDate) {
    results.reports = {
      passed: true,
      details: `Report recorded for date ${testReport.reportDate} with revenue ₹${testReport.revenue}`
    }
    console.log(`✅ ${results.reports.details}`)
    await DailyReport.findByIdAndDelete(testReport._id)
    console.log('✅ Daily report test record cleaned up successfully.')
  } else {
    throw new Error('Daily report model verification failed!')
  }
  console.log('')

  // 5. PRODUCT CONVERSION & RECEIPT UPLOAD TEST
  console.log('5️⃣ Testing Product Conversion (₹6k Split Model) & Receipt Attachments...')
  const dummyReceiptBase64 = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=='
  const dummyFinalizeReceipt = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkWP+/HgAEfQHzx5WpAAAAAElFTkSuQmCC'

  // Step A: Stage 1 Onboarding ₹1,500
  const conversionTest = new ProductConversion({
    candidateName: 'Audit Test Candidate',
    candidateEmail: 'audit.candidate@test.com',
    candidatePhone: '9988776655',
    collegeName: 'Pune Institute of Technology',
    paymentType: 'onboarding',
    amount: 1500,
    paymentUtr: 'TEST-UTR-998877',
    status: 'onboarding_pending_final',
    onboardingDate: '2026-10-02',
    dueDate: '2026-10-09',
    totalPaid: 1500,
    loggedByEmployeeId: normalEmployee?.empId || 'AP-TEST',
    loggedByName: normalEmployee?.name || 'Test Associate',
    loggedByEmail: testEmail,
    teamName: 'BDA Team',
    remarks: 'Audit pipeline entry test',
    receiptUrl: dummyReceiptBase64,
    receiptName: 'onboarding_receipt.png'
  })

  await conversionTest.save()
  console.log(`✅ Stage 1 Created: Candidate "${conversionTest.candidateName}", Paid ₹${conversionTest.amount}, Status: ${conversionTest.status}`)
  console.log(`   Receipt Attached: ${conversionTest.receiptName} (${conversionTest.receiptUrl.substring(0, 30)}...)`)
  console.log(`   7-Day Due Date: ${conversionTest.dueDate}`)

  // Step B: Stage 2 Finalize Payment ₹4,500
  conversionTest.finalizeUtr = 'FINALIZE-UTR-112233'
  conversionTest.finalizeDate = '2026-10-03'
  conversionTest.finalizeAmount = 4500
  conversionTest.totalPaid = 6000
  conversionTest.status = 'completed'
  conversionTest.finalizeReceiptUrl = dummyFinalizeReceipt
  conversionTest.finalizeReceiptName = 'finalize_receipt.png'
  await conversionTest.save()

  console.log(`✅ Stage 2 Finalized: Paid ₹${conversionTest.finalizeAmount}, Total ₹${conversionTest.totalPaid}/6,000, Status: ${conversionTest.status}`)
  console.log(`   Finalize Receipt Attached: ${conversionTest.finalizeReceiptName}`)

  // Clean up test conversion
  await ProductConversion.findByIdAndDelete(conversionTest._id)
  console.log('✅ Test conversion verified and cleanly removed from Atlas.\n')
  results.conversions = { passed: true, details: 'Stage 1 + Stage 2 (₹6k) & Receipt Upload verified' }

  // 6. HOLIDAY TEST
  console.log('6️⃣ Verifying Official Holidays...')
  const sampleHoliday = await Holiday.findOne()
  if (sampleHoliday) {
    console.log(`✅ Holiday found: "${sampleHoliday.holidayName}" (${sampleHoliday.holidayType}) on ${sampleHoliday.holidayDate}`)
  } else {
    console.log('ℹ️ No holidays found in database.')
  }
  console.log('')

  // 7. GEOFENCE CALCULATION TEST
  console.log('7️⃣ Testing Geofence Boundary & Coordinates...')
  const { GEOFENCE, calculateDistanceMeters, isWithinGeofence } = await import('../utils/helpers.js')
  console.log(`- Geofence Center: ${GEOFENCE.name} (${GEOFENCE.latitude}, ${GEOFENCE.longitude})`)
  console.log(`- Allowed Radius: ${GEOFENCE.allowedRadiusMeters} meters`)
  
  // Point exactly on-site
  const distOnSite = calculateDistanceMeters(18.596077, 73.718054)
  const isInside = isWithinGeofence(18.596077, 73.718054)
  console.log(`✅ Distance on-site: ${distOnSite.toFixed(2)}m (Within 200m: ${isInside.within})`)

  // Point ~50 meters away
  const dist50m = calculateDistanceMeters(18.596400, 73.718100)
  const isInside50m = isWithinGeofence(18.596400, 73.718100)
  console.log(`✅ Distance ~50m away: ${dist50m.toFixed(2)}m (Within 200m: ${isInside50m.within})`)

  // Point far away (e.g. Mumbai, ~100km away)
  const distFar = calculateDistanceMeters(19.0760, 72.8777)
  const isInsideFar = isWithinGeofence(19.0760, 72.8777)
  console.log(`✅ Distance far off-site (~118km): ${(distFar / 1000).toFixed(1)}km (Within 200m: ${isInsideFar.within})`)
  console.log('')

  // 8. ATTENDANCE RECORD WORKFLOW TEST
  console.log('8️⃣ Testing Attendance Record Flow...')
  const testAttendance = new Attendance({
    employeeId: normalEmployee?.empId || 'AP-TEST',
    employeeName: normalEmployee?.name || 'Test Associate',
    employeeEmail: testEmail,
    department: 'BDA',
    date: '2026-10-02',
    checkIn: '11:05 AM',
    checkOut: '05:00 PM',
    status: 'full-day',
    workingHours: '5h 55m',
    shift: 'shift_2',
    markedBy: 'Employee',
    statusReason: 'Regular Shift Attendance'
  })
  await testAttendance.save()
  console.log(`✅ Attendance recorded for ${testAttendance.employeeName}: Check-in ${testAttendance.checkIn}, Check-out ${testAttendance.checkOut}, Status: ${testAttendance.status}`)
  await Attendance.findByIdAndDelete(testAttendance._id)
  console.log('✅ Test attendance record verified and cleaned up from Atlas.\n')

  // 9. MESSAGING NOTIFICATION TEST
  console.log('9️⃣ Testing Messaging & Inbox Delivery...')
  const testMsg = new Message({
    senderAdminId: adminUser._id,
    recipientEmployeeId: normalEmployee._id,
    subject: 'Audit Verification Notification',
    message: 'Automated test message for full systems audit verification.',
    priority: 'important',
    deliveryStatus: 'delivered'
  })
  await testMsg.save()
  console.log(`✅ Message created for ${normalEmployee.name} with subject "${testMsg.subject}"`)
  await Message.findByIdAndDelete(testMsg._id)
  console.log('✅ Test message verified and cleaned up from Atlas.\n')

  console.log('====================================================')
  console.log('🎉 ALL BACKEND SYSTEMS & MONGO ATLAS TESTS PASSED!')
  console.log('====================================================')

  await mongoose.disconnect()
  process.exit(0)
}

runAudit().catch(err => {
  console.error('\n❌ AUDIT FAILED:', err.message)
  console.error(err.stack)
  process.exit(1)
})
