import DailyReport from '../models/DailyReport.js'
import MailBlastReport from '../models/MailBlastReport.js'
import Attendance from '../models/Attendance.js'
import ActiveSession from '../models/ActiveSession.js'
import Employee from '../models/Employee.js'
import ProductConversion from '../models/ProductConversion.js'

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

    // Target (Monthly benchmark: 10 conversions = ₹60,000)
    const targetConversions = 10
    const targetRevenue = targetConversions * 6000
    const targetAchievedPercent = Math.min(100, Math.round((monthlyConversions / targetConversions) * 100))

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
          targetConversions,
          targetRevenue,
          achievedPercent: targetAchievedPercent
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
