import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'
import mongoose from 'mongoose'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
dotenv.config({ path: path.join(__dirname, '../.env') })

async function clearTasksAndRevenue() {
  console.log('Connecting to MongoDB Atlas...')
  await mongoose.connect(process.env.MONGODB_URI)
  console.log('Connected.')

  const db = mongoose.connection.db

  console.log('\n--- BEFORE CLEAR ---')
  console.log('tasks count:', await db.collection('tasks').countDocuments())
  console.log('productconversions count:', await db.collection('productconversions').countDocuments())
  console.log('dailyreports count:', await db.collection('dailyreports').countDocuments())
  console.log('employees count (UNTOUCHED):', await db.collection('employees').countDocuments())
  console.log('attendances count (UNTOUCHED):', await db.collection('attendances').countDocuments())

  // 1. Clear tasks collection
  const taskRes = await db.collection('tasks').deleteMany({})
  console.log(`\nDeleted ${taskRes.deletedCount} tasks.`)

  // 2. Clear productconversions collection (Revenue pipeline)
  const convRes = await db.collection('productconversions').deleteMany({})
  console.log(`Deleted ${convRes.deletedCount} product conversions (revenue records).`)

  // 3. Clear test daily reports (which contained test conversions and revenue)
  const repRes = await db.collection('dailyreports').deleteMany({})
  console.log(`Deleted ${repRes.deletedCount} test daily reports.`)

  console.log('\n--- AFTER CLEAR ---')
  console.log('tasks count:', await db.collection('tasks').countDocuments())
  console.log('productconversions count:', await db.collection('productconversions').countDocuments())
  console.log('dailyreports count:', await db.collection('dailyreports').countDocuments())
  console.log('employees count (STILL 22):', await db.collection('employees').countDocuments())
  console.log('attendances count (STILL 0):', await db.collection('attendances').countDocuments())

  await mongoose.disconnect()
  console.log('\nDatabase disconnect. Clean complete.')
}

clearTasksAndRevenue().catch(err => {
  console.error('Clear failed:', err)
  process.exit(1)
})
