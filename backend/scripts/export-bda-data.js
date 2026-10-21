import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'
import fs from 'fs'
import mongoose from 'mongoose'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

dotenv.config({ path: path.join(__dirname, '../.env') })

async function exportData() {
  await mongoose.connect(process.env.MONGODB_URI)
  console.log('Connected to MongoDB Atlas')

  const employees = await mongoose.connection.db.collection('employees').find({
    department: 'BDA',
    empId: { $ne: 'ADMIN001' } // Exclude root admin
  }).sort({ empId: 1 }).toArray()

  console.log(`Found ${employees.length} BDA associates`)

  const reports = await mongoose.connection.db.collection('dailyreports').find({}).toArray()
  const attendances = await mongoose.connection.db.collection('attendances').find({}).toArray()
  const conversions = await mongoose.connection.db.collection('productconversions').find({}).toArray()

  const result = []

  for (const emp of employees) {
    const empReports = reports.filter(r => 
      (r.employeeEmail && r.employeeEmail.toLowerCase() === emp.email.toLowerCase()) ||
      (r.employeeId && r.employeeId === emp.empId)
    ).sort((a, b) => (b.reportDate || '').localeCompare(a.reportDate || ''))

    const empAttendances = attendances.filter(a => 
      (a.employeeEmail && a.employeeEmail.toLowerCase() === emp.email.toLowerCase()) ||
      (a.employeeId && a.employeeId === emp.empId)
    )

    const empConversions = conversions.filter(c => 
      (c.employeeEmail && c.employeeEmail.toLowerCase() === emp.email.toLowerCase()) ||
      (c.employeeId && c.employeeId === emp.empId)
    )

    // Calculate aggregated metrics
    const totalReports = empReports.length
    const totalCalls = empReports.reduce((sum, r) => sum + (Number(r.connectedCalls) || 0), 0)
    const totalCallsAbove3Min = empReports.reduce((sum, r) => sum + (Number(r.callsAbove3Min) || 0), 0)
    const totalGroups = empReports.reduce((sum, r) => sum + (Number(r.groupsCreated) || 0), 0)
    const totalMembers = empReports.reduce((sum, r) => sum + (Number(r.membersInGroups) || 0), 0)
    const totalConversions = empReports.reduce((sum, r) => sum + (Number(r.todayConversions) || 0), 0)
    const totalRevenue = empReports.reduce((sum, r) => sum + (Number(r.revenue) || 0), 0)

    const presentDays = empAttendances.filter(a => a.status === 'full-day' || a.status === 'half-day' || a.checkIn).length

    result.push({
      empId: emp.empId,
      name: emp.name,
      email: emp.email,
      phone: emp.phone || '—',
      dob: emp.dob || '—',
      department: emp.department || 'BDA',
      designation: emp.designation || 'Business Development Associate',
      shift: emp.shift || 'shift_2',
      joinDate: emp.joinDate || '2026-10-01',
      status: emp.status || 'active',
      summary: {
        totalReports,
        totalCalls,
        totalCallsAbove3Min,
        qualityCallRate: totalCalls > 0 ? Math.round((totalCallsAbove3Min / totalCalls) * 100) : 0,
        totalGroups,
        totalMembers,
        totalConversions,
        totalRevenue,
        presentDays
      },
      reports: empReports.map(r => ({
        reportDate: r.reportDate,
        reportTime: r.reportTime,
        slotNumber: r.slotNumber || 1,
        slotName: r.slotName || 'Daily Work Report',
        connectedCalls: Number(r.connectedCalls) || 0,
        callsAbove3Min: Number(r.callsAbove3Min) || 0,
        groupsCreated: Number(r.groupsCreated) || 0,
        membersInGroups: Number(r.membersInGroups) || 0,
        todayConversions: Number(r.todayConversions) || 0,
        revenue: Number(r.revenue) || 0,
        remarks: r.remarks || '—'
      }))
    })
  }

  const outputPath = path.join(__dirname, 'bda_reports_data.json')
  fs.writeFileSync(outputPath, JSON.stringify(result, null, 2))
  console.log(`Saved enriched data to ${outputPath}`)

  await mongoose.disconnect()
}

exportData().catch(console.error)
