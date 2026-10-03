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

  const sampleEmps = await mongoose.connection.db.collection('employees').find({}).limit(5).project({ name: 1, email: 1, password: 1, plainPassword: 1, passcode: 1 }).toArray()
  console.log('Sample Employees passwords & passcodes:', JSON.stringify(sampleEmps, null, 2))

  await mongoose.disconnect()
}

inspect().catch(err => {
  console.error('Inspection error:', err)
  process.exit(1)
})
