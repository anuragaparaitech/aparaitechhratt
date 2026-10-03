import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
dotenv.config({ path: path.join(__dirname, '../.env') })
import mongoose from 'mongoose'
import Task from '../models/Task.js'
import ProductConversion from '../models/ProductConversion.js'
import DailyReport from '../models/DailyReport.js'
import Employee from '../models/Employee.js'
import Attendance from '../models/Attendance.js'

async function inspect() {
  await mongoose.connect(process.env.MONGODB_URI)
  console.log('Connected to MongoDB Atlas')

  const taskCount = await Task.countDocuments()
  const convCount = await ProductConversion.countDocuments()
  const reportCount = await DailyReport.countDocuments()
  const empCount = await Employee.countDocuments()
  const attCount = await Attendance.countDocuments()

  console.log(`Tasks: ${taskCount}`)
  console.log(`ProductConversions (Revenue/Pipelines): ${convCount}`)
  console.log(`DailyReports: ${reportCount}`)
  console.log(`Employees (DO NOT TOUCH): ${empCount}`)
  console.log(`Attendance (DO NOT TOUCH): ${attCount}`)

  // Sample tasks
  const sampleTasks = await Task.find({}).limit(5).select('title assignedToName assignedToEmail status')
  console.log('Sample Tasks:', JSON.stringify(sampleTasks, null, 2))

  // Sample ProductConversions
  const sampleConvs = await ProductConversion.find({}).limit(5).select('candidateName amount paymentType status')
  console.log('Sample ProductConversions:', JSON.stringify(sampleConvs, null, 2))

  // Check DailyReport revenue fields
  const sampleReportsWithRevenue = await DailyReport.find({
    $or: [{ revenue: { $gt: 0 } }, { todayConversions: { $gt: 0 } }]
  }).limit(5).select('employeeName reportDate revenue todayConversions reportType')
  console.log('Sample Reports with Revenue:', JSON.stringify(sampleReportsWithRevenue, null, 2))

  await mongoose.disconnect()
}

inspect().catch(err => {
  console.error('Inspection error:', err)
  process.exit(1)
})
