import DailyReport from '../models/DailyReport.js'
import MailBlastReport from '../models/MailBlastReport.js'
import Attendance from '../models/Attendance.js'
import ActiveSession from '../models/ActiveSession.js'
import Employee from '../models/Employee.js'
import ProductConversion from '../models/ProductConversion.js'
import SystemSetting from '../models/SystemSetting.js'

// Helper for IST Date
const getKolkataDateStr = () => {
  const now = new Date()
  const kolkataStr = now.toLocaleString('en-US', { timeZone: 'Asia/Kolkata' })
  const kDate = new Date(kolkataStr)
  const year = kDate.getFullYear()
  const month = String(kDate.getMonth() + 1).padStart(2, '0')
  const day = String(kDate.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

// ── BDA REVENUE SALARY CRITERIA CONFIGURATION ─────────────────────────────────
export const DEFAULT_BDA_CRITERIA = {
  1: {
    month: 1,
    target: 42000,
    targetConversions: 7,
    belowTargetPercent: 26,
    onTargetPercent: 36,
    excessPercent: 8,
    label: 'Month 1'
  },
  2: {
    month: 2,
    target: 54000,
    targetConversions: 9,
    belowTargetPercent: 25,
    onTargetPercent: 30,
    excessPercent: 8,
    label: 'Month 2'
  },
  3: {
    month: 3,
    target: 72000,
    targetConversions: 12,
    belowTargetPercent: 25,
    onTargetPercent: 30,
    excessPercent: 8,
    label: 'Month 3'
  },
  4: {
    month: 4,
    target: 90000,
    targetConversions: 15,
    belowTargetPercent: 25,
    onTargetPercent: 30,
    excessPercent: 8,
    label: 'Month 4+'
  }
}

export const getTenureMonthFromJoinDate = (joinDateStr) => {
  if (!joinDateStr) return 1
  const join = new Date(joinDateStr)
  if (isNaN(join.getTime())) return 1

  const now = new Date()
  const yearDiff = now.getFullYear() - join.getFullYear()
  const monthDiff = (yearDiff * 12) + (now.getMonth() - join.getMonth())
  const tenure = Math.max(1, monthDiff + 1)
  return Math.min(tenure, 4)
}

export const calculateBdaSalary = (revenue = 0, tenureMonth = 1, criteriaMap = DEFAULT_BDA_CRITERIA) => {
  const m = Math.min(Math.max(1, parseInt(tenureMonth, 10) || 1), 4)
  const rule = criteriaMap[m] || criteriaMap[String(m)] || DEFAULT_BDA_CRITERIA[m]
  const target = Number(rule.target) || 42000
  const belowRate = (Number(rule.belowTargetPercent) || 26) / 100
  const onTargetRate = (Number(rule.onTargetPercent) || 36) / 100
  const excessRate = (Number(rule.excessPercent) || 8) / 100

  const revNum = Math.max(0, Number(revenue) || 0)
  const isAchieved = revNum >= target

  let salary = 0
  let breakdown = {}

  if (isAchieved) {
    const baseSalary = target * onTargetRate
    const excessRevenue = revNum - target
    const excessBonus = excessRevenue * excessRate
    salary = baseSalary + excessBonus
    breakdown = {
      isAchieved: true,
      target,
      baseSalary: Math.round(baseSalary),
      onTargetPercent: rule.onTargetPercent,
      excessRevenue: Math.round(excessRevenue),
      excessPercent: rule.excessPercent,
      excessBonus: Math.round(excessBonus),
      totalSalary: Math.round(salary),
      formula: `(₹${target.toLocaleString('en-IN')} × ${rule.onTargetPercent}%) + (₹${Math.round(excessRevenue).toLocaleString('en-IN')} × ${rule.excessPercent}%) = ₹${Math.round(salary).toLocaleString('en-IN')}`
    }
  } else {
    salary = revNum * belowRate
    breakdown = {
      isAchieved: false,
      target,
      revenue: Math.round(revNum),
      belowTargetPercent: rule.belowTargetPercent,
      totalSalary: Math.round(salary),
      formula: `₹${Math.round(revNum).toLocaleString('en-IN')} × ${rule.belowTargetPercent}% = ₹${Math.round(salary).toLocaleString('en-IN')}`
    }
  }

  return {
    revenue: revNum,
    target,
    tenureMonth: m,
    rule,
    isAchieved,
    salary: Math.round(salary),
    breakdown
  }
}

/**
 * 1. MY PERFORMANCE (For BDA Team / Individual Employees)
 */
export const getMyPerformance = async (req, res) => {
  try {
    const user = req.user
    const email = user.email.toLowerCase()
    const todayStr = getKolkataDateStr()
    const currentMonthPrefix = todayStr.substring(0, 7) // "YYYY-MM"

    // Today's Report
    const todayReport = await DailyReport.findOne({
      employeeEmail: email,
      reportDate: todayStr
    })

    // Current Month Daily Reports
    const monthlyReports = await DailyReport.find({
      employeeEmail: email,
      reportDate: { $regex: `^${currentMonthPrefix}` }
    }).sort({ reportDate: 1 })

    // Aggregate monthly numbers
    let monthlyCalls = 0
    let monthlyCalls3Min = 0
    let monthlyGroups = 0
    let monthlyMembers = 0
    let monthlyConversions = 0
    let monthlyRevenue = 0

    monthlyReports.forEach(r => {
      monthlyCalls += r.connectedCalls || 0
      monthlyCalls3Min += r.callsAbove3Min || 0
      monthlyGroups += r.groupsCreated || 0
      monthlyMembers += r.membersInGroups || 0
      monthlyConversions += r.todayConversions || 0
      monthlyRevenue += r.revenue || 0
    })

    // Mail Blast aggregates for this month
    const mailReports = await MailBlastReport.find({
      employeeEmail: email,
      reportDate: { $regex: `^${currentMonthPrefix}` }
    })

    let totalEmailsSent = 0
    let totalResponses = 0
    let totalBounces = 0

    mailReports.forEach(m => {
      totalEmailsSent += m.emailsSent || 0
      totalResponses += m.responsesReceived || 0
      totalBounces += m.bounceCount || 0
    })

    // Target (Monthly benchmark configured by Admin or Tenure-based for BDA)
    let targetConversions = 10
    let targetRevenue = 60000
    let targetCalls = 500
    let targetNote = 'Monthly Benchmark Goal'
    let tenureMonth = 1
    let monthLabel = 'Month 1'

    try {
      const empRecord = await Employee.findOne({ email: email })
      if (empRecord) {
        tenureMonth = empRecord.tenureMonth || getTenureMonthFromJoinDate(empRecord.joinDate || empRecord.createdAt)
      }
      
      const isBda = !empRecord || !empRecord.department || /bda/i.test(empRecord.department) || /bda/i.test(empRecord.designation || '') || /sales/i.test(empRecord.department || '')
      
      if (isBda) {
        let criteria = DEFAULT_BDA_CRITERIA
        const criteriaSetting = await SystemSetting.findOne({ key: 'bda_salary_criteria' })
        if (criteriaSetting && criteriaSetting.value) {
          criteria = { ...DEFAULT_BDA_CRITERIA, ...criteriaSetting.value }
        }
        const mKey = Math.min(Math.max(1, tenureMonth), 4)
        const rule = criteria[mKey] || criteria[String(mKey)] || DEFAULT_BDA_CRITERIA[mKey]
        
        targetConversions = Number(rule.targetConversions) || 7
        targetRevenue = Number(rule.target) || 42000
        targetCalls = 500
        monthLabel = rule.label || `Month ${mKey}`
        targetNote = `BDA ${monthLabel} Target: ₹${targetRevenue.toLocaleString('en-IN')} (${targetConversions} conversions)`
      } else {
        const setting = await SystemSetting.findOne({ key: 'intern_monthly_target' })
        if (setting && setting.value) {
          if (setting.value.targetConversions) targetConversions = Number(setting.value.targetConversions)
          if (setting.value.targetRevenue !== undefined) targetRevenue = Number(setting.value.targetRevenue)
          if (setting.value.targetCalls) targetCalls = Number(setting.value.targetCalls)
          if (setting.value.note) targetNote = setting.value.note
        }
      }
    } catch (sErr) {
      console.warn('Target lookup notice:', sErr.message)
    }

    const targetAchievedPercent = Math.min(100, Math.round((monthlyRevenue / targetRevenue) * 100))
    const targetConversionsAchievedPercent = Math.min(100, Math.round((monthlyConversions / targetConversions) * 100))

    // Last 7 days trend
    const recentReports = await DailyReport.find({
      employeeEmail: email
    }).sort({ reportDate: -1 }).limit(7)

    const trends = recentReports.reverse().map(r => ({
      date: r.reportDate,
      calls: r.connectedCalls,
      conversions: r.todayConversions,
      revenue: r.revenue
    }))

    return res.status(200).json({
      success: true,
      data: {
        today: {
          submitted: !!todayReport,
          reportDate: todayStr,
          connectedCalls: todayReport?.connectedCalls || 0,
          callsAbove3Min: todayReport?.callsAbove3Min || 0,
          groupsCreated: todayReport?.groupsCreated || 0,
          membersInGroups: todayReport?.membersInGroups || 0,
          todayConversions: todayReport?.todayConversions || 0,
          onboardingConversions: todayReport?.onboardingConversions || 0,
          finalizeConversions: todayReport?.finalizeConversions || 0,
          fullConversions: todayReport?.fullConversions || 0,
          revenue: todayReport?.revenue || 0
        },
        monthly: {
          period: currentMonthPrefix,
          totalReports: monthlyReports.length,
          totalCalls: monthlyCalls,
          callsAbove3Min: monthlyCalls3Min,
          totalGroups: monthlyGroups,
          totalMembers: monthlyMembers,
          totalConversions: monthlyConversions,
          totalRevenue: monthlyRevenue
        },
        mailBlast: {
          totalSent: totalEmailsSent,
          totalResponses: totalResponses,
          totalBounces: totalBounces,
          responseRate: totalEmailsSent > 0 ? ((totalResponses / totalEmailsSent) * 100).toFixed(1) : 0
        },
        targets: {
          tenureMonth,
          monthLabel,
          targetConversions,
          targetRevenue,
          targetCalls,
          achievedPercent: targetAchievedPercent,
          achievedConversionsPercent: targetConversionsAchievedPercent,
          note: targetNote
        },
        trends
      }
    })
  } catch (error) {
    console.error('[Analytics Error] getMyPerformance:', error)
    return res.status(500).json({
      success: false,
      message: 'Failed to compute performance metrics',
      error: error.message
    })
  }
}

/**
 * 2. LEADERBOARD (Top Performers by Conversions, Calls, Mail Blasts)
 */
export const getLeaderboard = async (req, res) => {
  try {
    const { period = 'month' } = req.query
    const todayStr = getKolkataDateStr()
    const currentMonthPrefix = todayStr.substring(0, 7)

    let dateMatch = {}
    if (period === 'today') {
      dateMatch = { reportDate: todayStr }
    } else if (period === 'month') {
      dateMatch = { reportDate: { $regex: `^${currentMonthPrefix}` } }
    }

    // 1. Leaderboard by Conversions & Revenue
    const conversionLeaderboard = await DailyReport.aggregate([
      { $match: dateMatch },
      {
        $group: {
          _id: '$employeeEmail',
          name: { $first: '$employeeName' },
          empId: { $first: '$employeeId' },
          team: { $first: '$teamName' },
          totalConversions: { $sum: '$todayConversions' },
          totalRevenue: { $sum: '$revenue' },
          totalCalls: { $sum: '$connectedCalls' },
          reportsSubmitted: { $sum: 1 }
        }
      },
      { $sort: { totalConversions: -1, totalRevenue: -1, totalCalls: -1 } },
      { $limit: 20 }
    ])

    // 2. Leaderboard by Connected Calls
    const callsLeaderboard = await DailyReport.aggregate([
      { $match: dateMatch },
      {
        $group: {
          _id: '$employeeEmail',
          name: { $first: '$employeeName' },
          empId: { $first: '$employeeId' },
          team: { $first: '$teamName' },
          totalCalls: { $sum: '$connectedCalls' },
          callsAbove3Min: { $sum: '$callsAbove3Min' },
          totalConversions: { $sum: '$todayConversions' }
        }
      },
      { $sort: { totalCalls: -1, callsAbove3Min: -1 } },
      { $limit: 20 }
    ])

    // 3. Leaderboard by Mail Blasts
    const mailBlastLeaderboard = await MailBlastReport.aggregate([
      { $match: dateMatch },
      {
        $group: {
          _id: '$employeeEmail',
          name: { $first: '$employeeName' },
          empId: { $first: '$employeeId' },
          team: { $first: '$teamName' },
          totalEmailsSent: { $sum: '$emailsSent' },
          totalResponses: { $sum: '$responsesReceived' },
          campaignsCount: { $sum: 1 }
        }
      },
      { $sort: { totalEmailsSent: -1, totalResponses: -1 } },
      { $limit: 20 }
    ])

    // 4. Team-wise Ranking
    const teamLeaderboard = await DailyReport.aggregate([
      { $match: dateMatch },
      {
        $group: {
          _id: '$teamName',
          totalConversions: { $sum: '$todayConversions' },
          totalRevenue: { $sum: '$revenue' },
          totalCalls: { $sum: '$connectedCalls' },
          activeMembers: { $addToSet: '$employeeEmail' }
        }
      },
      {
        $project: {
          team: '$_id',
          totalConversions: 1,
          totalRevenue: 1,
          totalCalls: 1,
          memberCount: { $size: '$activeMembers' }
        }
      },
      { $sort: { totalConversions: -1, totalRevenue: -1 } }
    ])

    return res.status(200).json({
      success: true,
      period,
      data: {
        byConversions: conversionLeaderboard,
        byCalls: callsLeaderboard,
        byMailBlasts: mailBlastLeaderboard,
        byTeams: teamLeaderboard
      }
    })
  } catch (error) {
    console.error('[Analytics Error] getLeaderboard:', error)
    return res.status(500).json({
      success: false,
      message: 'Failed to generate leaderboard',
      error: error.message
    })
  }
}

/**
 * 3. REVENUE TRACKER (₹6,000 × Conversions, Employee-wise, Team-wise, Trends)
 */
export const getRevenueTracker = async (req, res) => {
  try {
    const todayStr = getKolkataDateStr()
    const currentMonthPrefix = todayStr.substring(0, 7)

    // Grand totals across all time
    const overallStats = await DailyReport.aggregate([
      {
        $group: {
          _id: null,
          totalConversions: { $sum: '$todayConversions' },
          totalRevenue: { $sum: '$revenue' },
          totalReports: { $sum: 1 }
        }
      }
    ])

    // Conversions pipeline stats
    const conversionStats = await ProductConversion.aggregate([
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: { $add: ['$amount', { $ifNull: ['$finalizeAmount', 0] }] } },
          totalCount: { $sum: 1 }
        }
      }
    ])
    const pcRevenue = conversionStats[0]?.totalRevenue || 0
    const pcCount = conversionStats[0]?.totalCount || 0

    const grandTotalConversions = (overallStats[0]?.totalConversions || 0) + pcCount
    const grandTotalRevenue = (overallStats[0]?.totalRevenue || 0) + pcRevenue

    // Employee-wise revenue breakdown
    const employeeRevenue = await DailyReport.aggregate([
      {
        $group: {
          _id: '$employeeEmail',
          name: { $first: '$employeeName' },
          empId: { $first: '$employeeId' },
          team: { $first: '$teamName' },
          conversions: { $sum: '$todayConversions' },
          revenue: { $sum: '$revenue' },
          reportCount: { $sum: 1 }
        }
      },
      { $sort: { revenue: -1, conversions: -1 } }
    ])

    // Team-wise revenue breakdown
    const teamRevenue = await DailyReport.aggregate([
      {
        $group: {
          _id: '$teamName',
          conversions: { $sum: '$todayConversions' },
          revenue: { $sum: '$revenue' },
          reports: { $sum: 1 }
        }
      },
      { $sort: { revenue: -1 } }
    ])

    // Monthly revenue trend (grouped by YYYY-MM)
    const monthlyTrends = await DailyReport.aggregate([
      {
        $project: {
          month: { $substr: ['$reportDate', 0, 7] },
          todayConversions: 1,
          revenue: 1
        }
      },
      {
        $group: {
          _id: '$month',
          conversions: { $sum: '$todayConversions' },
          revenue: { $sum: '$revenue' }
        }
      },
      { $sort: { _id: 1 } }
    ])

    return res.status(200).json({
      success: true,
      data: {
        summary: {
          totalConversions: grandTotalConversions,
          totalRevenue: grandTotalRevenue,
          revenuePerConversion: 6000,
          currentMonthRevenue: monthlyTrends.find(m => m._id === currentMonthPrefix)?.revenue || 0,
          currentMonthConversions: monthlyTrends.find(m => m._id === currentMonthPrefix)?.conversions || 0,
          splitModel: {
            onboardingRate: 1500,
            finalizeRate: 4500,
            fullRate: 6000
          }
        },
        employeeBreakdown: employeeRevenue,
        teamBreakdown: teamRevenue,
        monthlyTrends: monthlyTrends.map(m => ({
          month: m._id,
          conversions: m.conversions,
          revenue: m.revenue
        }))
      }
    })
  } catch (error) {
    console.error('[Analytics Error] getRevenueTracker:', error)
    return res.status(500).json({
      success: false,
      message: 'Failed to compute revenue tracking',
      error: error.message
    })
  }
}

/**
 * 4. TEAM OVERVIEW & PENDING REPORTS (For Managers / HR / Admin)
 */
export const getTeamOverview = async (req, res) => {
  try {
    const todayStr = getKolkataDateStr()

    // 1. All active employees
    const activeEmployees = await Employee.find({
      role: 'employee',
      status: 'active'
    }).select('name email empId department shift phone')

    // 2. Today's attendance records
    const todayAttendance = await Attendance.find({ date: todayStr })
    const activeSessions = await ActiveSession.find({})

    // 3. Today's submitted daily reports
    const todayDailyReports = await DailyReport.find({ reportDate: todayStr })
    const submittedEmails = new Set(todayDailyReports.map(r => r.employeeEmail.toLowerCase()))

    // 4. Determine pending reports
    const pendingEmployees = []
    const submittedEmployees = []

    activeEmployees.forEach(emp => {
      const email = emp.email.toLowerCase()
      const attRecord = todayAttendance.find(a => a.employeeEmail === email)
      const isActiveSession = activeSessions.some(s => s.employeeEmail === email)
      const hasReport = submittedEmails.has(email)

      const empStatus = {
        name: emp.name,
        email: emp.email,
        empId: emp.empId,
        team: emp.department,
        shift: emp.shift,
        checkedIn: !!(attRecord || isActiveSession),
        checkInTime: attRecord?.checkIn || (isActiveSession ? 'Active' : '—'),
        hasReport
      }

      if (hasReport) {
        const report = todayDailyReports.find(r => r.employeeEmail.toLowerCase() === email)
        submittedEmployees.push({
          ...empStatus,
          connectedCalls: report.connectedCalls,
          conversions: report.todayConversions,
          revenue: report.revenue,
          reportTime: report.reportTime
        })
      } else {
        pendingEmployees.push(empStatus)
      }
    })

    // Today's company totals
    let todayCalls = 0
    let todayConversions = 0
    let todayRevenue = 0

    todayDailyReports.forEach(r => {
      todayCalls += r.connectedCalls || 0
      todayConversions += r.todayConversions || 0
      todayRevenue += r.revenue || 0
    })

    return res.status(200).json({
      success: true,
      data: {
        date: todayStr,
        metrics: {
          totalActiveEmployees: activeEmployees.length,
          checkedInToday: todayAttendance.length + activeSessions.length,
          reportsSubmitted: todayDailyReports.length,
          reportsPending: pendingEmployees.length,
          todayCalls,
          todayConversions,
          todayRevenue
        },
        submittedEmployees,
        pendingEmployees
      }
    })
  } catch (error) {
    console.error('[Analytics Error] getTeamOverview:', error)
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch team overview',
      error: error.message
    })
  }
}

/**
 * 5. GET INTERN MONTHLY TARGET (Configured by Admin)
 */
export const getInternTarget = async (req, res) => {
  try {
    const setting = await SystemSetting.findOne({ key: 'intern_monthly_target' })
    const target = setting ? setting.value : {
      targetConversions: 10,
      targetRevenue: 60000,
      targetCalls: 500,
      note: 'Monthly Intern Benchmark Goal'
    }
    return res.status(200).json({ success: true, target })
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message })
  }
}

/**
 * 6. SET INTERN MONTHLY TARGET (Admin Only)
 */
export const setInternTarget = async (req, res) => {
  try {
    if (req.user.role !== 'admin' && req.user.role !== 'hr') {
      return res.status(403).json({ success: false, message: 'Only admin can configure intern targets' })
    }

    const { targetConversions, targetRevenue, targetCalls, note } = req.body
    const targetConvsNum = Math.max(1, parseInt(targetConversions, 10) || 10)
    const targetRevNum = targetRevenue !== undefined && targetRevenue !== '' 
      ? Math.max(0, parseInt(targetRevenue, 10)) 
      : targetConvsNum * 6000
    const targetCallsNum = Math.max(0, parseInt(targetCalls, 10) || 500)

    const updatedSetting = await SystemSetting.findOneAndUpdate(
      { key: 'intern_monthly_target' },
      {
        key: 'intern_monthly_target',
        value: {
          targetConversions: targetConvsNum,
          targetRevenue: targetRevNum,
          targetCalls: targetCallsNum,
          note: note || ''
        },
        updatedBy: req.user.name || req.user.email,
        updatedAt: new Date()
      },
      { upsert: true, new: true }
    )

    return res.status(200).json({
      success: true,
      message: 'Intern monthly target updated successfully!',
      target: updatedSetting.value
    })
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message })
  }
}

/**
 * 7. GET BDA SALARY CRITERIA & EMPLOYEE PAYOUT SHEET (Admin/HR Only)
 */
export const getBdaSalaryCriteria = async (req, res) => {
  try {
    if (req.user.role !== 'admin' && req.user.role !== 'hr') {
      return res.status(403).json({ success: false, message: 'Access denied. Admin or HR only.' })
    }

    const setting = await SystemSetting.findOne({ key: 'bda_salary_criteria' })
    const criteria = setting && setting.value ? { ...DEFAULT_BDA_CRITERIA, ...setting.value } : DEFAULT_BDA_CRITERIA

    const todayStr = getKolkataDateStr()
    const currentMonthPrefix = todayStr.substring(0, 7) // "YYYY-MM"

    // Find all BDA employees
    const bdaEmployees = await Employee.find({
      $or: [
        { department: { $regex: 'bda|sales|business', $options: 'i' } },
        { designation: { $regex: 'bda|sales|business', $options: 'i' } }
      ]
    }).select('empId name email department designation joinDate tenureMonth status phone')

    // Get current month daily reports to compute employee revenues
    const monthlyReports = await DailyReport.find({
      reportDate: { $regex: `^${currentMonthPrefix}` }
    })

    // Map monthly metrics by email
    const metricsByEmail = {}
    monthlyReports.forEach(r => {
      const em = (r.employeeEmail || '').toLowerCase()
      if (!metricsByEmail[em]) {
        metricsByEmail[em] = { revenue: 0, conversions: 0, calls: 0, reportsCount: 0 }
      }
      metricsByEmail[em].revenue += (r.revenue || 0)
      metricsByEmail[em].conversions += (r.todayConversions || 0)
      metricsByEmail[em].calls += (r.connectedCalls || 0)
      metricsByEmail[em].reportsCount += 1
    })

    // Calculate BDA salary for each employee
    const employeesWithSalary = bdaEmployees.map(emp => {
      const email = emp.email.toLowerCase()
      const metrics = metricsByEmail[email] || { revenue: 0, conversions: 0, calls: 0, reportsCount: 0 }
      const tenureMonth = emp.tenureMonth || getTenureMonthFromJoinDate(emp.joinDate || emp.createdAt)
      const calculation = calculateBdaSalary(metrics.revenue, tenureMonth, criteria)

      return {
        _id: emp._id,
        empId: emp.empId,
        name: emp.name,
        email: emp.email,
        phone: emp.phone,
        department: emp.department,
        designation: emp.designation,
        joinDate: emp.joinDate,
        status: emp.status,
        tenureMonth,
        monthlyRevenue: metrics.revenue,
        monthlyConversions: metrics.conversions,
        monthlyCalls: metrics.calls,
        reportsSubmitted: metrics.reportsCount,
        calculation
      }
    })

    return res.status(200).json({
      success: true,
      currentMonth: currentMonthPrefix,
      criteria,
      employees: employeesWithSalary
    })
  } catch (err) {
    console.error('[Analytics Error] getBdaSalaryCriteria:', err)
    return res.status(500).json({ success: false, message: err.message })
  }
}

/**
 * 8. UPDATE BDA SALARY CRITERIA (Admin Only)
 */
export const updateBdaSalaryCriteria = async (req, res) => {
  try {
    if (req.user.role !== 'admin' && req.user.role !== 'hr') {
      return res.status(403).json({ success: false, message: 'Only admin can configure BDA salary criteria' })
    }

    const { criteria } = req.body
    if (!criteria || typeof criteria !== 'object') {
      return res.status(400).json({ success: false, message: 'Invalid criteria data provided' })
    }

    // Merge with defaults to ensure valid schema
    const updatedCriteria = { ...DEFAULT_BDA_CRITERIA }
    for (const m of [1, 2, 3, 4]) {
      if (criteria[m]) {
        updatedCriteria[m] = {
          month: m,
          target: Math.max(0, parseInt(criteria[m].target, 10) || DEFAULT_BDA_CRITERIA[m].target),
          targetConversions: Math.max(0, parseInt(criteria[m].targetConversions, 10) || DEFAULT_BDA_CRITERIA[m].targetConversions),
          belowTargetPercent: Math.max(0, parseFloat(criteria[m].belowTargetPercent) || DEFAULT_BDA_CRITERIA[m].belowTargetPercent),
          onTargetPercent: Math.max(0, parseFloat(criteria[m].onTargetPercent) || DEFAULT_BDA_CRITERIA[m].onTargetPercent),
          excessPercent: Math.max(0, parseFloat(criteria[m].excessPercent) || DEFAULT_BDA_CRITERIA[m].excessPercent),
          label: criteria[m].label || DEFAULT_BDA_CRITERIA[m].label
        }
      }
    }

    const updatedSetting = await SystemSetting.findOneAndUpdate(
      { key: 'bda_salary_criteria' },
      {
        key: 'bda_salary_criteria',
        value: updatedCriteria,
        updatedBy: req.user.name || req.user.email,
        updatedAt: new Date()
      },
      { upsert: true, new: true }
    )

    return res.status(200).json({
      success: true,
      message: 'BDA revenue salary criteria updated successfully!',
      criteria: updatedSetting.value
    })
  } catch (err) {
    console.error('[Analytics Error] updateBdaSalaryCriteria:', err)
    return res.status(500).json({ success: false, message: err.message })
  }
}

/**
 * 9. UPDATE EMPLOYEE TENURE MONTH (Admin/HR Only)
 */
export const updateEmployeeTenureMonth = async (req, res) => {
  try {
    if (req.user.role !== 'admin' && req.user.role !== 'hr') {
      return res.status(403).json({ success: false, message: 'Only admin can update employee tenure month' })
    }

    const { empId, email, tenureMonth } = req.body
    const tenureNum = Math.min(12, Math.max(1, parseInt(tenureMonth, 10) || 1))

    const query = empId ? { empId } : { email: (email || '').toLowerCase() }
    const updatedEmp = await Employee.findOneAndUpdate(
      query,
      { tenureMonth: tenureNum },
      { new: true }
    )

    if (!updatedEmp) {
      return res.status(404).json({ success: false, message: 'Employee not found' })
    }

    return res.status(200).json({
      success: true,
      message: `Updated tenure to Month ${tenureNum} for ${updatedEmp.name}`,
      employee: {
        empId: updatedEmp.empId,
        name: updatedEmp.name,
        email: updatedEmp.email,
        tenureMonth: updatedEmp.tenureMonth
      }
    })
  } catch (err) {
    console.error('[Analytics Error] updateEmployeeTenureMonth:', err)
    return res.status(500).json({ success: false, message: err.message })
  }
}

