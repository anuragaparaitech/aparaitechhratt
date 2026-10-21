import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'
import mongoose from 'mongoose'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

dotenv.config({ path: path.join(__dirname, '../.env') })

async function check() {
  await mongoose.connect(process.env.MONGODB_URI)

  const employees = await mongoose.connection.db.collection('employees').find({
    department: 'BDA'
  }).sort({ empId: 1 }).toArray()

  console.log(`=== BDA EMPLOYEES AUDIT (${employees.length} employees) ===\n`)

  const reports = await mongoose.connection.db.collection('dailyreports').find({}).toArray()

  for (const emp of employees) {
    const empReports = reports.filter(r => 
      (r.employeeEmail && r.employeeEmail.toLowerCase() === emp.email.toLowerCase()) ||
      (r.employeeId && r.employeeId === emp.empId)
    ).sort((a, b) => (b.reportDate || '').localeCompare(a.reportDate || ''))

    console.log(`Employee: ${emp.name} | ID: ${emp.empId} | Email: ${emp.email} | Reports Count: ${empReports.length}`)
    if (empReports.length > 0) {
      console.log(`   Latest Report: Date=${empReports[0].reportDate} Time=${empReports[0].reportTime} Calls=${empReports[0].connectedCalls} >3m=${empReports[0].callsAbove3Min} Groups=${empReports[0].groupsCreated} Conv=${empReports[0].todayConversions} Rev=₹${empReports[0].revenue}`)
      const dates = empReports.map(r => r.reportDate).join(', ')
      console.log(`   Dates (${empReports.length}): ${dates}`)
    } else {
      console.log(`   NO REPORTS SUBMITTED YET`)
    }
  }

  await mongoose.disconnect()
}

check().catch(console.error)
