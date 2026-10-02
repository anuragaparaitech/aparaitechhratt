import dotenv from 'dotenv'
dotenv.config()
import mongoose from 'mongoose'

async function purgePreOctData() {
  console.log('====================================================')
  console.log('🧹 PURGING DATA PRIOR TO OCTOBER 1, 2026 (ATLAS DB)')
  console.log('====================================================\n')

  const uri = process.env.MONGODB_URI
  await mongoose.connect(uri)
  console.log('Connected to Atlas:', mongoose.connection.name)

  const cutoffDateStr = '2026-10-01'
  const cutoffISODate = new Date('2026-10-01T00:00:00.000Z')

  // 1. Clean Holidays before 2026-10-01
  const holidayCol = mongoose.connection.db.collection('holidays')
  const preOctHolidays = await holidayCol.find({ holidayDate: { $lt: cutoffDateStr } }).toArray()
  console.log(`- Found ${preOctHolidays.length} holidays prior to ${cutoffDateStr}:`)
  preOctHolidays.forEach(h => console.log(`   • ${h.holidayName} (${h.holidayDate})`))
  
  const delHolidays = await holidayCol.deleteMany({ holidayDate: { $lt: cutoffDateStr } })
  console.log(`✅ Deleted ${delHolidays.deletedCount} pre-Oct 1 holidays from Atlas.\n`)

  // 2. Clean Attendance before 2026-10-01
  const attendanceCol = mongoose.connection.db.collection('attendances')
  const delAttendance = await attendanceCol.deleteMany({ date: { $lt: cutoffDateStr } })
  console.log(`✅ Deleted ${delAttendance.deletedCount} pre-Oct 1 attendance records from Atlas.`)

  // 3. Clean Daily Reports before 2026-10-01
  const reportCol = mongoose.connection.db.collection('dailyreports')
  const delReports = await reportCol.deleteMany({ reportDate: { $lt: cutoffDateStr } })
  console.log(`✅ Deleted ${delReports.deletedCount} pre-Oct 1 daily reports from Atlas.`)

  // 4. Clean Product Conversions before 2026-10-01
  const conversionCol = mongoose.connection.db.collection('productconversions')
  const delConversions = await conversionCol.deleteMany({ onboardingDate: { $lt: cutoffDateStr } })
  console.log(`✅ Deleted ${delConversions.deletedCount} pre-Oct 1 product conversions from Atlas.`)

  // 5. Clean Messages created before 2026-10-01
  const messageCol = mongoose.connection.db.collection('messages')
  const delMessages = await messageCol.deleteMany({ createdAt: { $lt: cutoffISODate } })
  console.log(`✅ Deleted ${delMessages.deletedCount} pre-Oct 1 messages from Atlas.`)

  // 6. Clean Active Sessions
  const sessionCol = mongoose.connection.db.collection('activesessions')
  const delSessions = await sessionCol.deleteMany({ checkInDate: { $lt: cutoffDateStr } })
  console.log(`✅ Deleted ${delSessions.deletedCount} stale pre-Oct 1 active sessions from Atlas.`)

  // 7. Verify remaining document counts in Atlas
  console.log('\n📊 Current MongoDB Atlas Document Counts:')
  const collections = await mongoose.connection.db.listCollections().toArray()
  for (const c of collections) {
    const col = mongoose.connection.db.collection(c.name)
    const count = await col.countDocuments()
    console.log(`   - ${c.name}: ${count}`)
  }

  await mongoose.disconnect()
  console.log('\n🎉 Atlas pre-October data purge complete!')
}

purgePreOctData().catch(err => {
  console.error('Purge error:', err)
  process.exit(1)
})
