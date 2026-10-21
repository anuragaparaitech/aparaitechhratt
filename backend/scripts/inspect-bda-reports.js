import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'
import mongoose from 'mongoose'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

dotenv.config({ path: path.join(__dirname, '../.env') })

async function check() {
  await mongoose.connect(process.env.MONGODB_URI)
  console.log('Connected to MongoDB Atlas')

  const employees = await mongoose.connection.db.collection('employees').find({}).toArray()
  console.log(`Total employees: ${employees.length}`)
  
  const depts = {}
  employees.forEach(e => {
    depts[e.department] = (depts[e.department] || 0) + 1
  })
  console.log('Departments:', JSON.stringify(depts, null, 2))

  const bdaEmployees = employees.filter(e => 
    (e.department && e.department.toLowerCase().includes('bda')) ||
    (e.designation && e.designation.toLowerCase().includes('bda')) ||
    (e.role && e.role.toLowerCase().includes('bda'))
  )
  console.log(`\nFound ${bdaEmployees.length} BDA employees:`)
  bdaEmployees.forEach(e => {
    console.log(` - [${e.empId}] ${e.name} (${e.email}) | Shift: ${e.shift} | Status: ${e.status}`)
  })

  const dailyReports = await mongoose.connection.db.collection('dailyreports').find({}).toArray()
  console.log(`\nTotal Daily Reports in DB: ${dailyReports.length}`)

  // Group reports by reportDate
  const reportsByDate = {}
  dailyReports.forEach(r => {
    reportsByDate[r.reportDate] = (reportsByDate[r.reportDate] || 0) + 1
  })
  console.log('Reports count by date:', JSON.stringify(reportsByDate, null, 2))

  // Check unique employees who submitted reports
  const reportsByEmp = {}
  dailyReports.forEach(r => {
    reportsByEmp[r.employeeEmail] = (reportsByEmp[r.employeeEmail] || 0) + 1
  })
  console.log('\nReports count by employee email:', JSON.stringify(reportsByEmp, null, 2))

  // Sample latest reports
  console.log('\nSample latest 3 daily reports:')
  const latestReports = await mongoose.connection.db.collection('dailyreports')
    .find({})
    .sort({ createdAt: -1 })
    .limit(3)
    .toArray()
  console.log(JSON.stringify(latestReports, null, 2))

  await mongoose.disconnect()
}

check().catch(console.error)
