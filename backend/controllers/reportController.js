import DailyReport from '../models/DailyReport.js'
import MailBlastReport from '../models/MailBlastReport.js'
import Employee from '../models/Employee.js'

// Helper to get Kolkata / IST date and time
const getKolkataDateTime = () => {
  const now = new Date()
  const kolkataStr = now.toLocaleString('en-US', { timeZone: 'Asia/Kolkata' })
  const kDate = new Date(kolkataStr)
  
  const year = kDate.getFullYear()
  const month = String(kDate.getMonth() + 1).padStart(2, '0')
  const day = String(kDate.getDate()).padStart(2, '0')
  const dateStr = `${year}-${month}-${day}`
  
  let hours = kDate.getHours()
  const minutes = String(kDate.getMinutes()).padStart(2, '0')
  const ampm = hours >= 12 ? 'PM' : 'AM'
  hours = hours % 12 || 12
  const timeStr = `${String(hours).padStart(2, '0')}:${minutes} ${ampm}`
  
  return { dateStr, timeStr }
}

// ── DAILY REPORT CONTROLLERS ──────────────────────────────────────────────────

export const submitDailyReport = async (req, res) => {
  try {
    const user = req.user
    const {
      connectedCalls = 0,
      callsAbove3Min = 0,
      groupsCreated = 0,
      membersInGroups = 0,
      todayConversions = 0,
      remarks = ''
    } = req.body

    const { dateStr, timeStr } = getKolkataDateTime()
    const conversionsNum = Math.max(0, parseInt(todayConversions, 10) || 0)
    const revenueCalculated = conversionsNum * 6000 // ₹6,000 per conversion

    // Check if report already exists for today by this employee -> upsert
    let report = await DailyReport.findOne({
      employeeEmail: user.email.toLowerCase(),
      reportDate: dateStr
    })

    if (report) {
      report.connectedCalls = Math.max(0, parseInt(connectedCalls, 10) || 0)
      report.callsAbove3Min = Math.max(0, parseInt(callsAbove3Min, 10) || 0)
      report.groupsCreated = Math.max(0, parseInt(groupsCreated, 10) || 0)
      report.membersInGroups = Math.max(0, parseInt(membersInGroups, 10) || 0)
      report.todayConversions = conversionsNum
      report.revenue = revenueCalculated
      report.reportTime = timeStr
      report.remarks = remarks || ''
      await report.save()

      return res.status(200).json({
        success: true,
        message: `Daily report updated successfully! Revenue recorded: ₹${revenueCalculated.toLocaleString('en-IN')}`,
        data: report
      })
    }

    report = await DailyReport.create({
      employeeId: user.empId || 'EMP',
      employeeEmail: user.email.toLowerCase(),
      employeeName: user.name,
      teamName: user.department || 'BDA',
      reportDate: dateStr,
      reportTime: timeStr,
      connectedCalls: Math.max(0, parseInt(connectedCalls, 10) || 0),
      callsAbove3Min: Math.max(0, parseInt(callsAbove3Min, 10) || 0),
      groupsCreated: Math.max(0, parseInt(groupsCreated, 10) || 0),
      membersInGroups: Math.max(0, parseInt(membersInGroups, 10) || 0),
      todayConversions: conversionsNum,
      revenue: revenueCalculated,
      remarks: remarks || ''
    })

    return res.status(201).json({
      success: true,
      message: `Daily report submitted successfully! Revenue recorded: ₹${revenueCalculated.toLocaleString('en-IN')}`,
      data: report
    })
  } catch (error) {
    console.error('[Report API Error] submitDailyReport:', error)
    return res.status(500).json({
      success: false,
      message: 'Failed to submit daily report',
      error: error.message
    })
  }
}

export const getDailyReports = async (req, res) => {
  try {
    const user = req.user
    const { date, email, teamName, search } = req.query

    let query = {}

    // Employees can only view their own reports unless they are manager/admin
    if (user.role === 'employee') {
      query.employeeEmail = user.email.toLowerCase()
    } else if (email) {
      query.employeeEmail = email.toLowerCase()
    }

    if (date) query.reportDate = date
    if (teamName) query.teamName = teamName

    if (search) {
      query.$or = [
        { employeeName: { $regex: search, $options: 'i' } },
        { employeeId: { $regex: search, $options: 'i' } },
        { teamName: { $regex: search, $options: 'i' } }
      ]
    }

    const reports = await DailyReport.find(query).sort({ reportDate: -1, createdAt: -1 })

    return res.status(200).json({
      success: true,
      count: reports.length,
      data: reports
    })
  } catch (error) {
    console.error('[Report API Error] getDailyReports:', error)
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch daily reports',
      error: error.message
    })
  }
}

export const getTodayDailyStatus = async (req, res) => {
  try {
    const user = req.user
    const { dateStr } = getKolkataDateTime()

    const report = await DailyReport.findOne({
      employeeEmail: user.email.toLowerCase(),
      reportDate: dateStr
    })

    return res.status(200).json({
      success: true,
      todayDate: dateStr,
      submitted: !!report,
      report: report || null
    })
  } catch (error) {
    console.error('[Report API Error] getTodayDailyStatus:', error)
    return res.status(500).json({
      success: false,
      message: 'Failed to check report status',
      error: error.message
    })
  }
}

// ── MAIL BLAST REPORT CONTROLLERS ─────────────────────────────────────────────

export const submitMailBlastReport = async (req, res) => {
  try {
    const user = req.user
    const {
      emailsSent = 0,
      targetType = 'Random',
      collegeName = '',
      templateUsed = '',
      responsesReceived = 0,
      bounceCount = 0,
      status = 'Completed',
      remarks = ''
    } = req.body

    const { dateStr, timeStr } = getKolkataDateTime()

    const report = await MailBlastReport.create({
      employeeId: user.empId || 'EMP',
      employeeEmail: user.email.toLowerCase(),
      employeeName: user.name,
      teamName: user.department || 'BDA',
      reportDate: dateStr,
      reportTime: timeStr,
      emailsSent: Math.max(0, parseInt(emailsSent, 10) || 0),
      targetType: targetType === 'College-wise' ? 'College-wise' : 'Random',
      collegeName: collegeName ? collegeName.trim() : '',
      templateUsed: templateUsed ? templateUsed.trim() : '',
      responsesReceived: Math.max(0, parseInt(responsesReceived, 10) || 0),
      bounceCount: Math.max(0, parseInt(bounceCount, 10) || 0),
      status: status === 'Pending' ? 'Pending' : 'Completed',
      remarks: remarks || ''
    })

    return res.status(201).json({
      success: true,
      message: 'Mail blast report recorded successfully!',
      data: report
    })
  } catch (error) {
    console.error('[Report API Error] submitMailBlastReport:', error)
    return res.status(500).json({
      success: false,
      message: 'Failed to submit mail blast report',
      error: error.message
    })
  }
}

export const getMailBlastReports = async (req, res) => {
  try {
    const user = req.user
    const { date, email, collegeName, status, search } = req.query

    let query = {}

    if (user.role === 'employee') {
      query.employeeEmail = user.email.toLowerCase()
    } else if (email) {
      query.employeeEmail = email.toLowerCase()
    }

    if (date) query.reportDate = date
    if (collegeName) query.collegeName = { $regex: collegeName, $options: 'i' }
    if (status) query.status = status

    if (search) {
      query.$or = [
        { employeeName: { $regex: search, $options: 'i' } },
        { collegeName: { $regex: search, $options: 'i' } },
        { templateUsed: { $regex: search, $options: 'i' } }
      ]
    }

    const reports = await MailBlastReport.find(query).sort({ reportDate: -1, createdAt: -1 })

    return res.status(200).json({
      success: true,
      count: reports.length,
      data: reports
    })
  } catch (error) {
    console.error('[Report API Error] getMailBlastReports:', error)
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch mail blast reports',
      error: error.message
    })
  }
}

export const getCollegesList = async (req, res) => {
  try {
    const defaultColleges = [
      'COEP Tech University, Pune',
      'MIT World Peace University (MIT-WPU), Pune',
      'PICT (Pune Institute of Computer Technology)',
      'Sinhgad Institute of Technology (SKNCOE)',
      'Cummins College of Engineering, Pune',
      'DY Patil College of Engineering, Akurdi / Pimpri',
      'Bharati Vidyapeeth College of Engineering, Pune',
      'VIT / VIIT Pune',
      'Indira Institute of Management (ICCS), Pune',
      'PCCOE (Pimpri Chinchwad College of Engineering)',
      'JSPM Rajarshi Shahu College of Engineering, Tathawade',
      'Symbiosis Institute of Technology (SIT), Pune',
      'Modern College of Engineering, Pune',
      'GH Raisoni College of Engineering, Pune',
      'Trinity College of Engineering & Research, Pune'
    ]

    const dbColleges = await MailBlastReport.distinct('collegeName', {
      collegeName: { $nin: ['', null, 'Other / Custom College'] }
    })

    const allColleges = Array.from(new Set([...defaultColleges, ...dbColleges])).sort()

    return res.status(200).json({
      success: true,
      count: allColleges.length,
      data: allColleges
    })
  } catch (error) {
    console.error('[Report API Error] getCollegesList:', error)
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch colleges list',
      error: error.message
    })
  }
}

