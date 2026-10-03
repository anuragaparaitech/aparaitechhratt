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
      reportType,
      tasksCompleted = '',
      tasksInProgress = '',
      tasksPending = '',
      hoursWorked = 0,
      blockers = '',
      planTomorrow = '',
      githubPrs = '',
      connectedCalls = 0,
      callsAbove3Min = 0,
      groupsCreated = 0,
      membersInGroups = 0,
      onboardingConversions = 0,
      finalizeConversions = 0,
      fullConversions = 0,
      todayConversions = 0,
      reportDate,
      remarks = ''
    } = req.body

    const isSoftwareReport = reportType === 'software' || user.department === 'Development' || Boolean(tasksCompleted || tasksInProgress || planTomorrow)
    const { dateStr: todayKolkata, timeStr } = getKolkataDateTime()
    const targetDate = reportDate && /^\d{4}-\d{2}-\d{2}$/.test(reportDate) ? reportDate : todayKolkata

    const isAdmin = user.role === 'admin'
    const targetEmail = (isAdmin && req.body.employeeEmail) ? req.body.employeeEmail.toLowerCase() : user.email.toLowerCase()

    // Check if report already exists for targetDate by this employee
    let report = await DailyReport.findOne({
      employeeEmail: targetEmail,
      reportDate: targetDate
    })

    if (isSoftwareReport) {
      if (report) {
        // Update software report
        report.tasksCompleted = tasksCompleted || report.tasksCompleted || ''
        report.tasksInProgress = tasksInProgress || report.tasksInProgress || ''
        report.tasksPending = tasksPending || report.tasksPending || ''
        report.hoursWorked = hoursWorked !== undefined ? Number(hoursWorked) : (report.hoursWorked || 0)
        report.blockers = blockers || report.blockers || ''
        report.planTomorrow = planTomorrow || report.planTomorrow || ''
        report.githubPrs = githubPrs || report.githubPrs || ''
        report.reportTime = timeStr
        report.reportType = 'software'
        if (isAdmin) report.updatedByAdmin = user.name || user.email
        await report.save()

        return res.status(200).json({
          success: true,
          message: 'Software Daily Report updated successfully!',
          data: report
        })
      }

      report = await DailyReport.create({
        employeeId: user.empId || 'EMP',
        employeeEmail: user.email.toLowerCase(),
        employeeName: user.name,
        teamName: user.department || 'Development',
        reportType: 'software',
        reportDate: targetDate,
        reportTime: timeStr,
        tasksCompleted: tasksCompleted || '',
        tasksInProgress: tasksInProgress || '',
        tasksPending: tasksPending || '',
        hoursWorked: hoursWorked ? Number(hoursWorked) : 0,
        blockers: blockers || '',
        planTomorrow: planTomorrow || '',
        githubPrs: githubPrs || '',
        remarks: remarks || ''
      })

      return res.status(201).json({
        success: true,
        message: 'Software Daily Report submitted successfully!',
        data: report
      })
    }

    // ── BDA Report Processing ──
    let onbNum = Math.max(0, parseInt(onboardingConversions, 10) || 0)
    let finNum = Math.max(0, parseInt(finalizeConversions, 10) || 0)
    let fullNum = Math.max(0, parseInt(fullConversions, 10) || 0)
    let conversionsNum = onbNum + finNum + fullNum
    let revenueCalculated = (onbNum * 1500) + (finNum * 4500) + (fullNum * 6000)

    if (conversionsNum === 0 && todayConversions > 0) {
      conversionsNum = Math.max(0, parseInt(todayConversions, 10) || 0)
      revenueCalculated = conversionsNum * 6000
      fullNum = conversionsNum
    }

    if (report) {
      if (!isAdmin) {
        return res.status(403).json({
          success: false,
          message: 'Daily report has already been submitted for this date and cannot be modified. Only administrators can edit submitted reports.'
        })
      }

      report.connectedCalls = Math.max(0, parseInt(connectedCalls, 10) || 0)
      report.callsAbove3Min = Math.max(0, parseInt(callsAbove3Min, 10) || 0)
      report.groupsCreated = Math.max(0, parseInt(groupsCreated, 10) || 0)
      report.membersInGroups = Math.max(0, parseInt(membersInGroups, 10) || 0)
      report.onboardingConversions = onbNum
      report.finalizeConversions = finNum
      report.fullConversions = fullNum
      report.todayConversions = conversionsNum
      report.revenue = revenueCalculated
      report.reportTime = timeStr
      report.remarks = remarks || ''
      report.reportType = 'bda'
      report.updatedByAdmin = user.name || user.email
      await report.save()

      return res.status(200).json({
        success: true,
        message: `Daily report updated by Admin successfully! Revenue recorded: ₹${revenueCalculated.toLocaleString('en-IN')}`,
        data: report
      })
    }

    report = await DailyReport.create({
      employeeId: user.empId || 'EMP',
      employeeEmail: user.email.toLowerCase(),
      employeeName: user.name,
      teamName: user.department || 'BDA',
      reportType: 'bda',
      reportDate: targetDate,
      reportTime: timeStr,
      connectedCalls: Math.max(0, parseInt(connectedCalls, 10) || 0),
      callsAbove3Min: Math.max(0, parseInt(callsAbove3Min, 10) || 0),
      groupsCreated: Math.max(0, parseInt(groupsCreated, 10) || 0),
      membersInGroups: Math.max(0, parseInt(membersInGroups, 10) || 0),
      onboardingConversions: onbNum,
      finalizeConversions: finNum,
      fullConversions: fullNum,
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

    // Employees can only view their own reports unless they are manager/admin/leadership
    const isLeadership = user.role === 'admin' || user.role === 'manager' || user.role === 'hr' || (user.email && user.email.toLowerCase() === 'anunand2004@gmail.com') || String(user.empId) === '7017' || String(user.empId) === 'AP7056'
    if (!isLeadership) {
      query.employeeEmail = user.email.toLowerCase()
    } else if (email) {
      query.employeeEmail = email.toLowerCase()
    }

    if (date) query.reportDate = date
    if (teamName && teamName !== 'all') query.teamName = teamName
    if (req.query.reportType && req.query.reportType !== 'all') query.reportType = req.query.reportType

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
    const { date, email } = req.query
    const { dateStr } = getKolkataDateTime()
    const targetDate = date && /^\d{4}-\d{2}-\d{2}$/.test(date) ? date : dateStr
    const targetEmail = (user.role === 'admin' && email) ? email.toLowerCase() : user.email.toLowerCase()

    const report = await DailyReport.findOne({
      employeeEmail: targetEmail,
      reportDate: targetDate
    })

    return res.status(200).json({
      success: true,
      todayDate: targetDate,
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

// @desc    Admin updates an employee's daily report
// @route   PUT /api/reports/daily/:id
// @access  Private (Admin only)
export const updateDailyReportByAdmin = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Only administrators can edit submitted daily reports.'
      })
    }

    const { id } = req.params
    const {
      connectedCalls,
      callsAbove3Min,
      groupsCreated,
      membersInGroups,
      onboardingConversions,
      finalizeConversions,
      fullConversions,
      remarks,
      reportDate
    } = req.body

    const report = await DailyReport.findById(id)
    if (!report) {
      return res.status(404).json({ success: false, message: 'Daily report not found' })
    }

    if (connectedCalls !== undefined) report.connectedCalls = Math.max(0, parseInt(connectedCalls, 10) || 0)
    if (callsAbove3Min !== undefined) report.callsAbove3Min = Math.max(0, parseInt(callsAbove3Min, 10) || 0)
    if (groupsCreated !== undefined) report.groupsCreated = Math.max(0, parseInt(groupsCreated, 10) || 0)
    if (membersInGroups !== undefined) report.membersInGroups = Math.max(0, parseInt(membersInGroups, 10) || 0)

    let onb = onboardingConversions !== undefined ? Math.max(0, parseInt(onboardingConversions, 10) || 0) : (report.onboardingConversions || 0)
    let fin = finalizeConversions !== undefined ? Math.max(0, parseInt(finalizeConversions, 10) || 0) : (report.finalizeConversions || 0)
    let full = fullConversions !== undefined ? Math.max(0, parseInt(fullConversions, 10) || 0) : (report.fullConversions || 0)

    report.onboardingConversions = onb
    report.finalizeConversions = fin
    report.fullConversions = full
    report.todayConversions = onb + fin + full
    report.revenue = (onb * 1500) + (fin * 4500) + (full * 6000)
    if (remarks !== undefined) report.remarks = remarks
    if (reportDate) report.reportDate = reportDate
    report.updatedByAdmin = req.user.name || req.user.email

    await report.save()

    return res.json({
      success: true,
      message: 'Daily report updated by Admin successfully!',
      data: report
    })
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Server error updating daily report', error: err.message })
  }
}

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

