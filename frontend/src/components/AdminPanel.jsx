import React, { useState, useEffect, useRef } from 'react'
import Chart from 'chart.js/auto'
import * as XLSX from 'xlsx'
import { employeeAPI, attendanceAPI, holidayAPI, faceAPI, reportsAPI, analyticsAPI } from '../services/api'
import { API_URL } from '../services/api'
import AddEmployeeModal from './AddEmployeeModal'
import MarkAttendanceModal from './MarkAttendanceModal'
import HolidayTable from './HolidayTable'
import HolidayFormModal from './HolidayFormModal'
import EmployeeProfileModal from './EmployeeProfileModal'
import OverallAttendance from './OverallAttendance'
import { SHIFTS, GEOFENCE } from '../utils/shiftsAndGeo'

function AdminPanel({ currentUser, showToast, activeSection = 'overview', onSectionChange }) {
  // Helper: is this section currently visible?
  const show = (id) => activeSection === id
  const setSection = (id) => {
    if (onSectionChange) onSectionChange(id)
  }

  const [employees, setEmployees] = useState([])
  const [attendance, setAttendance] = useState([])
  const [liveSessions, setLiveSessions] = useState([])
  const [lastLiveUpdate, setLastLiveUpdate] = useState(null)
  const [liveDetailEmp, setLiveDetailEmp] = useState(null) // popup for detail view

  // Search & Filter States
  const [liveSearch, setLiveSearch] = useState('')
  const [empSearch, setEmpSearch] = useState('')
  const [empShiftFilter, setEmpShiftFilter] = useState('')
  const [attNameSearch, setAttNameSearch] = useState('')
  const [attDateFilter, setAttDateFilter] = useState('')
  const [attStatusFilter, setAttStatusFilter] = useState('')
  const [attDeptFilter, setAttDeptFilter] = useState('')
  const [attShiftFilter, setAttShiftFilter] = useState('')
  const [autoNameSearch, setAutoNameSearch] = useState('')
  const [autoDateFilter, setAutoDateFilter] = useState('')
  const [loadingLogs, setLoadingLogs] = useState(false)
  const [logsError, setLogsError] = useState(false)

  // Working Portal States in Admin Panel
  const [dailyReports, setDailyReports] = useState([])
  const [mailBlastReports, setMailBlastReports] = useState([])
  const [revenueData, setRevenueData] = useState(null)
  const [teamOverview, setTeamOverview] = useState(null)
  const [dailyDateFilter, setDailyDateFilter] = useState(() => new Date().toISOString().split('T')[0])
  const [dailySearch, setDailySearch] = useState('')
  const [dailyTeamFilter, setDailyTeamFilter] = useState('')
  const [mailDateFilter, setMailDateFilter] = useState('')
  const [mailSearch, setMailSearch] = useState('')
  const [mailStatusFilter, setMailStatusFilter] = useState('')

  // View More / View Less Pagination Limits
  const [empLimit, setEmpLimit] = useState(5)
  const [autoLimit, setAutoLimit] = useState(5)
  const [attLimit, setAttLimit] = useState(5)
  const [dailyLimit, setDailyLimit] = useState(10)
  const [mailLimit, setMailLimit] = useState(10)

  // Reset limits when filters change
  useEffect(() => {
    setEmpLimit(5)
  }, [empSearch, empShiftFilter])

  useEffect(() => {
    setAutoLimit(5)
  }, [autoNameSearch, autoDateFilter])

  useEffect(() => {
    setAttLimit(5)
  }, [attNameSearch, attDateFilter, attStatusFilter, attDeptFilter, attShiftFilter])

  useEffect(() => {
    setDailyLimit(10)
  }, [dailySearch, dailyDateFilter, dailyTeamFilter])

  useEffect(() => {
    setMailLimit(10)
  }, [mailSearch, mailDateFilter, mailStatusFilter])

  // Modal States
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [isMarkOpen, setIsMarkOpen] = useState(false)
  const [selectedEmp, setSelectedEmp] = useState(null)

  // Holiday States
  const [holidays, setHolidays] = useState([])
  const [isHolidayOpen, setIsHolidayOpen] = useState(false)
  const [selectedHoliday, setSelectedHoliday] = useState(null)

  // Missing Checkouts State
  const [missingCheckouts, setMissingCheckouts] = useState([])

  // Employee Profile States
  const [profileEmp, setProfileEmp] = useState(null)
  const [isProfileOpen, setIsProfileOpen] = useState(false)

  // Chart Ref
  const chartRef = useRef(null)
  const chartInstance = useRef(null)

  // Fetch initial data
  const fetchData = async () => {
    setLoadingLogs(true)
    setLogsError(false)
    try {
      const [empsData, attsData, holsData, missingData, dailyData, mailData, teamData, revData] = await Promise.all([
        employeeAPI.getAll().catch(() => ({ employees: [] })),
        attendanceAPI.getAll().catch(() => ({ records: [], liveSessions: [] })),
        holidayAPI.getAll().catch(() => ({ holidays: [] })),
        attendanceAPI.getMissingCheckouts().catch(() => ({ missing: [] })),
        reportsAPI.getDaily().catch(() => ({ data: [] })),
        reportsAPI.getMailBlast().catch(() => ({ data: [] })),
        analyticsAPI.getTeamOverview().catch(() => null),
        analyticsAPI.getRevenueTracker().catch(() => null)
      ])

      setEmployees(empsData.employees || [])
      setAttendance(Array.isArray(attsData) ? attsData : (attsData.data || attsData.records || []))
      setLiveSessions(Array.isArray(attsData) ? [] : (attsData.liveSessions || []))
      setLastLiveUpdate(new Date())
      setHolidays(holsData.holidays || [])
      setMissingCheckouts(missingData.missing || [])
      setDailyReports(dailyData.data || [])
      setMailBlastReports(mailData.data || [])
      if (teamData?.success) setTeamOverview(teamData.data)
      if (revData?.success) setRevenueData(revData.data)
    } catch (err) {
      console.error(err)
      setLogsError(true)
      const errorMsg = err.response?.data?.message || err.message || 'Failed to fetch database logs'
      showToast(`❌ ${errorMsg}`, '#dc2626')
    } finally {
      setLoadingLogs(false)
    }
  }

  useEffect(() => {
    fetchData()

    // Polling interval (every 15 seconds)
    const interval = setInterval(async () => {
      try {
        const attsData = await attendanceAPI.getAll()
        setLiveSessions(Array.isArray(attsData) ? [] : (attsData.liveSessions || []))
        setLastLiveUpdate(new Date())
      } catch (err) {
        console.error('Polling error', err)
      }
    }, 15000)

    return () => clearInterval(interval)
  }, [])

  // Render & Update Chart.js Monthly Overview
  useEffect(() => {
    if (!chartRef.current) return

    const currentMonth = new Date().toISOString().slice(0, 7)
    const monthRecords = attendance.filter(r => r.date.startsWith(currentMonth))
    const full = monthRecords.filter(r => r.status === 'full-day').length
    const half = monthRecords.filter(r => r.status === 'half-day').length
    const quarter = monthRecords.filter(r => r.status === 'quarter-day').length

    if (chartInstance.current) {
      chartInstance.current.destroy()
    }

    const ctx = chartRef.current.getContext('2d')
    chartInstance.current = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: ['Full Day', 'Half Day', 'Quarter Day'],
        datasets: [{
          data: [full, half, quarter],
          backgroundColor: ['#22c55e', '#f59e0b', '#a855f7'],
          borderWidth: 0
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              color: '#475569',
              font: {
                family: 'Inter',
                size: 11
              }
            }
          }
        }
      }
    })

    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy()
      }
    }
  }, [attendance, activeSection])

  // Stat Counters
  const totalRecords = attendance.length
  const fullDays = attendance.filter(r => r.status === 'full-day').length
  const halfDays = attendance.filter(r => r.status === 'half-day').length
  const quarterDays = attendance.filter(r => r.status === 'quarter-day').length
  const totalEmployees = employees.filter(e => e.role === 'employee').length
  const activeEmployees = employees.filter(e => e.role === 'employee' && e.status === 'active').length
  const checkedInNow = liveSessions.length

  // Filtered Lists
  const filteredLive = liveSessions.filter(emp => 
    (emp.name || '').toLowerCase().includes(liveSearch.toLowerCase()) ||
    (emp.empId || '').toLowerCase().includes(liveSearch.toLowerCase())
  )

  const filteredEmployees = employees.filter(emp => {
    if (emp.role === 'admin') return false
    const match = empSearch.toLowerCase()
    const textMatch = (
      (emp.name || '').toLowerCase().includes(match) ||
      (emp.empId || '').toLowerCase().includes(match) ||
      (emp.email || '').toLowerCase().includes(match)
    )
    const empShift = emp.shift || (emp.department === 'Development' || emp.department === 'Software Development' ? 'shift_1' : 'shift_2')
    const shiftMatch = empShiftFilter ? empShift === empShiftFilter : true
    return textMatch && shiftMatch
  })

  const filteredAttendance = [...attendance].filter(rec => {
    const nameMatch = (rec.employeeName || '').toLowerCase().includes(attNameSearch.toLowerCase())
    const dateMatch = attDateFilter ? rec.date === attDateFilter : true
    const statusMatch = attStatusFilter ? rec.status === attStatusFilter : true
    const deptMatch = attDeptFilter ? (rec.department || '') === attDeptFilter : true
    const recShift = rec.shift || (rec.department === 'Development' || rec.department === 'Software Development' ? 'shift_1' : 'shift_2')
    const shiftMatch = attShiftFilter ? recShift === attShiftFilter : true
    return nameMatch && dateMatch && statusMatch && deptMatch && shiftMatch
  }).sort((a, b) => b.date.localeCompare(a.date))

  const autoCheckoutRecords = [...attendance].filter(rec => {
    if (rec.statusReason !== 'System Auto Checkout') return false
    const nameMatch = (rec.employeeName || '').toLowerCase().includes(autoNameSearch.toLowerCase()) || 
                      (rec.employeeId || '').toLowerCase().includes(autoNameSearch.toLowerCase())
    const dateMatch = autoDateFilter ? rec.date === autoDateFilter : true
    return nameMatch && dateMatch
  }).sort((a, b) => b.date.localeCompare(a.date))

  // Filtered Daily Reports
  const filteredDaily = dailyReports.filter(r => {
    const dateMatch = dailyDateFilter ? r.reportDate === dailyDateFilter : true
    const teamMatch = dailyTeamFilter ? r.teamName === dailyTeamFilter : true
    const match = dailySearch.toLowerCase()
    const textMatch = match ? (
      (r.employeeName || '').toLowerCase().includes(match) ||
      (r.employeeId || '').toLowerCase().includes(match) ||
      (r.remarks || '').toLowerCase().includes(match)
    ) : true
    return dateMatch && teamMatch && textMatch
  })

  // Filtered Mail Blast Reports
  const filteredMail = mailBlastReports.filter(m => {
    const dateMatch = mailDateFilter ? m.reportDate === mailDateFilter : true
    const statusMatch = mailStatusFilter ? m.status === mailStatusFilter : true
    const match = mailSearch.toLowerCase()
    const textMatch = match ? (
      (m.employeeName || '').toLowerCase().includes(match) ||
      (m.employeeId || '').toLowerCase().includes(match) ||
      (m.collegeName || '').toLowerCase().includes(match) ||
      (m.templateUsed || '').toLowerCase().includes(match)
    ) : true
    return dateMatch && statusMatch && textMatch
  })

  // Department list for dropdown filter
  const departments = [...new Set(employees.filter(e => e.role === 'employee').map(e => e.department))]

  // Event Handlers
  const handleToggleStatus = async (email) => {
    try {
      const response = await employeeAPI.toggleStatus(email)
      showToast(`✅ Status updated to ${response.status}`, '#1e5a7a')
      fetchData()
    } catch (err) {
      console.error(err)
      showToast('❌ Failed to toggle employee status', '#dc2626')
    }
  }

  const handleDeleteEmployee = async (email, name) => {
    if (!window.confirm(`⚠️ Delete ${name} and all their attendance records? This cannot be undone!`)) return
    try {
      await employeeAPI.delete(email)
      showToast(`🗑️ Employee ${name} deleted`, '#dc2626')
      fetchData()
    } catch (err) {
      console.error(err)
      showToast('❌ Failed to delete employee', '#dc2626')
    }
  }

  const handleDeleteAttendance = async (id) => {
    if (!window.confirm('Delete this attendance record?')) return
    try {
      await attendanceAPI.deleteRecord(id)
      showToast('🗑️ Record deleted', '#dc2626')
      fetchData()
    } catch (err) {
      console.error(err)
      showToast('❌ Failed to delete record', '#dc2626')
    }
  }

  const handleClearAllAttendance = async () => {
    const confirmMessage = '⚠️ CRITICAL ACTION: Are you sure you want to delete ALL attendance records for all employees? This cannot be undone!'
    if (!window.confirm(confirmMessage)) return

    try {
      await attendanceAPI.clearAll()
      showToast('🗑️ All attendance records cleared', '#dc2626')
      fetchData()
    } catch (err) {
      console.error(err)
      showToast('❌ Failed to clear attendance records', '#dc2626')
    }
  }

  const handleDeleteAllEmployees = async () => {
    const confirmMessage = '🚨 EXTREME DANGER: Are you sure you want to DELETE ALL EMPLOYEES? This will wipe the entire workforce database!'
    if (!window.confirm(confirmMessage)) return

    try {
      const res = await employeeAPI.deleteAll()
      showToast(`🗑️ ${res.message || 'All employees deleted'}`, '#dc2626')
      fetchData()
    } catch (err) {
      console.error(err)
      showToast('❌ Failed to delete all employees', '#dc2626')
    }
  }

  const handleDeleteHoliday = async (id) => {
    if (!window.confirm('Are you sure you want to delete this holiday?')) return
    try {
      await holidayAPI.delete(id)
      showToast('🗑️ Holiday removed', '#dc2626')
      fetchData()
    } catch (err) {
      console.error(err)
      showToast('❌ Failed to remove holiday', '#dc2626')
    }
  }

  const handleManualCheckout = async (email, name) => {
    if (!window.confirm(`⚠️ Force check-out for ${name}?`)) return
    try {
      await attendanceAPI.performManualCheckout(email, currentUser.name)
      showToast(`✅ ${name} has been manually checked out`, '#15803d')
      fetchData()
    } catch (err) {
      console.error(err)
      showToast('❌ Failed to manually check out employee', '#dc2626')
    }
  }

  // Export spreadsheet using SheetJS
  const getTodayStr = () => new Date().toISOString().split('T')[0]

  const handleExportAllAttendance = () => {
    if (!attendance.length) {
      alert('No attendance data available to export')
      return
    }
    const data = [['Date', 'Emp ID', 'Employee', 'Department', 'Shift', 'Check-In', 'Check-Out', 'Hours', 'Status', 'Location', 'Reason']]
    attendance.forEach(r => {
      const sKey = r.shift || (r.department === 'Development' || r.department === 'Software Development' ? 'shift_1' : 'shift_2')
      const shiftName = SHIFTS[sKey]?.name || r.shift || '—'
      const loc = r.locationDistanceMeters !== undefined && r.locationDistanceMeters !== null
        ? `${r.locationVerified ? 'Office' : 'Remote'} (${r.locationDistanceMeters}m)`
        : '—'
      data.push([
        r.date, r.employeeId, r.employeeName, r.department, shiftName, r.checkIn, r.checkOut, r.workingHours, r.status, loc, r.statusReason
      ])
    })
    const ws = XLSX.utils.aoa_to_sheet(data)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Attendance')
    XLSX.writeFile(wb, `Attendance_${getTodayStr()}.xlsx`)
    showToast('📊 Exported Full Attendance Sheet', '#15803d')
  }

  const handleExportFiltered = () => {
    if (!filteredAttendance.length) {
      alert('No filtered attendance records to export')
      return
    }
    const data = [['Date', 'Emp ID', 'Employee', 'Dept', 'Shift', 'Check-In', 'Check-Out', 'Hours', 'Status', 'Location']]
    filteredAttendance.forEach(r => {
      const sKey = r.shift || (r.department === 'Development' || r.department === 'Software Development' ? 'shift_1' : 'shift_2')
      const shiftName = SHIFTS[sKey]?.name || r.shift || '—'
      const loc = r.locationDistanceMeters !== undefined && r.locationDistanceMeters !== null
        ? `${r.locationVerified ? 'Office' : 'Remote'} (${r.locationDistanceMeters}m)`
        : '—'
      data.push([
        r.date, r.employeeId, r.employeeName, r.department, shiftName, r.checkIn, r.checkOut, r.workingHours, r.status, loc
      ])
    })
    const ws = XLSX.utils.aoa_to_sheet(data)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Filtered_Attendance')
    XLSX.writeFile(wb, `Filtered_Attendance.xlsx`)
    showToast('📊 Filtered Export Complete', '#2c6e9e')
  }

  const handleExportEmployees = () => {
    const activeEmps = employees.filter(e => e.role === 'employee')
    if (!activeEmps.length) {
      alert('No employee data available to export')
      return
    }
    const data = [['Emp ID', 'Name', 'Email', 'Department', 'Shift', 'Status']]
    activeEmps.forEach(e => {
      const sKey = e.shift || (e.department === 'Development' || e.department === 'Software Development' ? 'shift_1' : 'shift_2')
      const shiftName = SHIFTS[sKey]?.name || e.shift || '—'
      data.push([
        e.empId, e.name, e.email, e.department, shiftName, e.status
      ])
    })
    const ws = XLSX.utils.aoa_to_sheet(data)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Employees')
    XLSX.writeFile(wb, `Employees_${getTodayStr()}.xlsx`)
    showToast('📊 Exported Employee Data', '#16a34a')
  }

  // Export Daily Reports to Excel
  const handleExportDailyReports = () => {
    if (!filteredDaily.length) {
      alert('No daily reports to export for current filter')
      return
    }
    const data = [['Date', 'Time', 'Employee Name', 'Emp ID', 'Team', 'Connected Calls', 'Calls >3m', 'Groups Created', 'Members', 'Conversions', 'Revenue (INR)', 'Remarks']]
    filteredDaily.forEach(r => {
      data.push([
        r.reportDate, r.reportTime, r.employeeName, r.employeeId, r.teamName, r.connectedCalls, r.callsAbove3Min, r.groupsCreated, r.membersInGroups, r.todayConversions, r.revenue, r.remarks || ''
      ])
    })
    const ws = XLSX.utils.aoa_to_sheet(data)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Daily_Reports')
    XLSX.writeFile(wb, `Daily_Reports_${getTodayStr()}.xlsx`)
    showToast('📊 Exported Daily Reports to Excel', '#16a34a')
  }

  // Export Mail Blast Reports to Excel
  const handleExportMailBlast = () => {
    if (!filteredMail.length) {
      alert('No mail blast records to export for current filter')
      return
    }
    const data = [['Date', 'Time', 'Employee Name', 'Emp ID', 'Team', 'Emails Sent', 'Target Type', 'College Name', 'Template', 'Responses', 'Bounces', 'Status', 'Remarks']]
    filteredMail.forEach(m => {
      data.push([
        m.reportDate, m.reportTime, m.employeeName, m.employeeId, m.teamName, m.emailsSent, m.targetType, m.collegeName || '', m.templateUsed || '', m.responsesReceived, m.bounceCount, m.status, m.remarks || ''
      ])
    })
    const ws = XLSX.utils.aoa_to_sheet(data)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Mail_Blast')
    XLSX.writeFile(wb, `Mail_Blast_${getTodayStr()}.xlsx`)
    showToast('📊 Exported Mail Blast Reports to Excel', '#0284c7')
  }

  // Holiday Stats Calculations
  const currentYear = new Date().getFullYear().toString()
  const holidaysThisYear = holidays.filter(h => h.holidayDate.startsWith(currentYear)).length
  const todayStrStr = new Date().toISOString().split('T')[0]
  const upcomingHolidays = holidays
    .filter(h => h.holidayDate >= todayStrStr)
    .sort((a, b) => a.holidayDate.localeCompare(b.holidayDate))
  const nextHoliday = upcomingHolidays.length > 0 ? upcomingHolidays[0] : null

  // Working Portal Aggregates
  const totalDailyCalls = filteredDaily.reduce((acc, r) => acc + (r.connectedCalls || 0), 0)
  const totalDailyConversions = filteredDaily.reduce((acc, r) => acc + (r.todayConversions || 0), 0)
  const totalDailyRevenue = filteredDaily.reduce((acc, r) => acc + (r.revenue || 0), 0)

  const totalMailSent = filteredMail.reduce((acc, m) => acc + (m.emailsSent || 0), 0)
  const totalMailResponses = filteredMail.reduce((acc, m) => acc + (m.responsesReceived || 0), 0)

  // ── Section label map for breadcrumb ────────────────────────────────────
  const SECTION_LABELS = {
    overview:     { icon: 'fa-tachometer-alt',      label: 'Executive Command & Overview' },
    live:         { icon: 'fa-eye',                 label: 'Live Checked-In Today' },
    dailyReports: { icon: 'fa-clipboard-check',     label: 'Daily Working Reports Compliance' },
    mailBlast:    { icon: 'fa-mail-bulk',           label: 'Mail Blast Outreach Campaigns' },
    revenue:      { icon: 'fa-rupee-sign',          label: 'Commercial Revenue & Conversions' },
    employees:    { icon: 'fa-users',               label: 'Employee Directory & Access Control' },
    attendance:   { icon: 'fa-calendar-check',      label: 'Master Attendance Logs & History' },
    overall:      { icon: 'fa-chart-line',          label: 'Overall Attendance Analytics' },
    missing:      { icon: 'fa-exclamation-triangle', label: 'Missing Checkouts Resolver' },
    autocheckout: { icon: 'fa-robot',               label: 'Automatic Checkout Records' },
    holidays:     { icon: 'fa-umbrella-beach',      label: 'Company Holiday Management' },
    data:         { icon: 'fa-database',            label: 'System Data Management' },
  }
  const currentSection = SECTION_LABELS[activeSection] || SECTION_LABELS.overview

  return (
    <div id="adminPanel" style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>

      {/* ── Section Breadcrumb with Live IST Clock ───────────────────────────── */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '12px 20px',
        background: '#ffffff',
        border: '1px solid #e2e8f0', borderRadius: '16px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.02)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '36px', height: '36px', borderRadius: '10px',
            background: 'linear-gradient(135deg, #1e5a7a, #0f2b3d)',
            color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '1rem'
          }}>
            <i className={`fas ${currentSection.icon}`}></i>
          </div>
          <div>
            <div style={{ fontWeight: 800, color: '#0f172a', fontSize: '1.05rem' }}>{currentSection.label}</div>
            <div style={{ fontSize: '0.72rem', color: '#64748b' }}>Aparaitech Software Administrator Control Suite</div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button
            onClick={fetchData}
            title="Refresh All Database Records"
            style={{
              background: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: '10px',
              padding: '7px 14px', fontSize: '0.8rem', fontWeight: '700', color: '#334155',
              cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px'
            }}
          >
            <i className={`fas fa-sync-alt ${loadingLogs ? 'fa-spin' : ''}`}></i> Refresh
          </button>
        </div>
      </div>

      {/* ── Top Interactive Navigation Pill Bar ──────────────────────────────── */}
      <div className="admin-quick-pills" style={{
        display: 'flex',
        gap: '8px',
        overflowX: 'auto',
        paddingBottom: '4px',
        scrollbarWidth: 'none'
      }}>
        {[
          { id: 'overview', icon: 'fa-tachometer-alt', label: 'Overview' },
          { id: 'live', icon: 'fa-eye', label: 'Live Check-Ins', badge: liveSessions.length ? `${liveSessions.length} Active` : null, badgeColor: '#22c55e' },
          { id: 'dailyReports', icon: 'fa-clipboard-check', label: 'Daily Reports', badge: teamOverview?.metrics?.reportsPending ? `${teamOverview.metrics.reportsPending} Pending` : null, badgeColor: '#ef4444' },
          { id: 'mailBlast', icon: 'fa-mail-bulk', label: 'Mail Blasts' },
          { id: 'revenue', icon: 'fa-rupee-sign', label: 'Revenue' },
          { id: 'employees', icon: 'fa-users', label: 'Employees' },
          { id: 'attendance', icon: 'fa-calendar-check', label: 'Attendance Logs' },
          { id: 'missing', icon: 'fa-exclamation-triangle', label: 'Missing Checkouts', badge: missingCheckouts.length ? `${missingCheckouts.length}` : null, badgeColor: '#ea580c' },
          { id: 'autocheckout', icon: 'fa-robot', label: 'Auto Checkout' },
          { id: 'holidays', icon: 'fa-umbrella-beach', label: 'Holidays' },
          { id: 'data', icon: 'fa-database', label: 'Data Management' }
        ].map(pill => (
          <button
            key={pill.id}
            onClick={() => setSection(pill.id)}
            style={{
              padding: '9px 15px',
              borderRadius: '12px',
              border: activeSection === pill.id ? '1px solid #1e5a7a' : '1px solid #e2e8f0',
              background: activeSection === pill.id ? 'linear-gradient(135deg, #1e5a7a, #0f2b3d)' : '#ffffff',
              color: activeSection === pill.id ? '#ffffff' : '#475569',
              fontWeight: '700',
              fontSize: '0.82rem',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: activeSection === pill.id ? '0 4px 12px rgba(30, 90, 122, 0.25)' : 'none',
              transition: 'all 0.2s'
            }}
          >
            <i className={`fas ${pill.icon}`}></i>
            {pill.label}
            {pill.badge && (
              <span style={{
                background: pill.badgeColor || '#ef4444',
                color: '#ffffff',
                padding: '2px 7px',
                borderRadius: '10px',
                fontSize: '0.68rem',
                fontWeight: '800'
              }}>
                {pill.badge}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ── 1. EXECUTIVE OVERVIEW (When activeSection === 'overview') ─────────── */}
      {show('overview') && (<>
        {/* Executive Real-Time Operations Banner */}
        <div style={{
          background: 'linear-gradient(135deg, #0a192f 0%, #1e3a8a 60%, #2563eb 100%)',
          borderRadius: '24px',
          padding: '2rem 2.25rem',
          color: '#ffffff',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1.5rem',
          boxShadow: '0 20px 35px -10px rgba(10, 25, 47, 0.3)'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
              <span style={{
                background: '#22c55e', color: '#ffffff', padding: '3px 10px',
                borderRadius: '20px', fontSize: '0.72rem', fontWeight: '800', letterSpacing: '0.05em'
              }}>
                ● SYSTEM OPERATIONAL
              </span>
              <span style={{ color: '#93c5fd', fontSize: '0.78rem' }}>
                Optenix Geofence (200m) Active • Shift Automation Active
              </span>
            </div>
            <h1 style={{ margin: 0, fontSize: '1.85rem', fontWeight: '800', letterSpacing: '-0.02em' }}>
              Aparaitech Executive Command Center
            </h1>
            <p style={{ margin: '6px 0 0', fontSize: '0.9rem', color: '#cbd5e1' }}>
              Unified management for live attendance, daily performance submissions, outreach campaigns, and revenue tracking
            </p>
          </div>

          <div style={{
            display: 'flex',
            gap: '1.5rem',
            background: 'rgba(255, 255, 255, 0.08)',
            backdropFilter: 'blur(10px)',
            padding: '12px 22px',
            borderRadius: '16px',
            border: '1px solid rgba(255, 255, 255, 0.15)'
          }}>
            <div>
              <div style={{ fontSize: '0.7rem', color: '#93c5fd', textTransform: 'uppercase', fontWeight: '700' }}>Active Workforce</div>
              <div style={{ fontSize: '1.6rem', fontWeight: '900', color: '#ffffff' }}>
                {activeEmployees} <span style={{ fontSize: '0.85rem', color: '#cbd5e1' }}>/ {totalEmployees}</span>
              </div>
            </div>
            <div style={{ width: '1px', background: 'rgba(255, 255, 255, 0.15)' }} />
            <div>
              <div style={{ fontSize: '0.7rem', color: '#93c5fd', textTransform: 'uppercase', fontWeight: '700' }}>Checked In Now</div>
              <div style={{ fontSize: '1.6rem', fontWeight: '900', color: '#4ade80' }}>
                {checkedInNow}
              </div>
            </div>
            <div style={{ width: '1px', background: 'rgba(255, 255, 255, 0.15)' }} />
            <div>
              <div style={{ fontSize: '0.7rem', color: '#93c5fd', textTransform: 'uppercase', fontWeight: '700' }}>Total Revenue</div>
              <div style={{ fontSize: '1.6rem', fontWeight: '900', color: '#38bdf8' }}>
                ₹{(revenueData?.summary?.totalRevenue || 0).toLocaleString('en-IN')}
              </div>
            </div>
          </div>
        </div>

        {/* Pending Daily Reports Alert Banner */}
        {teamOverview && teamOverview.metrics?.reportsPending > 0 && (
          <div style={{
            background: '#fef2f2',
            borderLeft: '5px solid #ef4444',
            borderRadius: '16px',
            padding: '14px 20px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '12px',
            boxShadow: '0 4px 12px rgba(239, 68, 68, 0.05)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div style={{
                width: '42px', height: '42px', borderRadius: '12px',
                background: '#fee2e2', color: '#dc2626', display: 'flex',
                alignItems: 'center', justifyContent: 'center', fontSize: '1.25rem'
              }}>
                <i className="fas fa-exclamation-triangle"></i>
              </div>
              <div>
                <div style={{ fontWeight: '800', fontSize: '0.95rem', color: '#991b1b' }}>
                  Compliance Oversight: {teamOverview.metrics.reportsPending} Active Employees Have Pending Daily Reports
                </div>
                <div style={{ fontSize: '0.82rem', color: '#b91c1c' }}>
                  {teamOverview.metrics.reportsSubmitted} submitted today • Today's Revenue: ₹{(teamOverview.metrics.todayRevenue || 0).toLocaleString('en-IN')}
                </div>
              </div>
            </div>
            <button
              onClick={() => setSection('dailyReports')}
              style={{
                background: '#dc2626', color: '#ffffff', border: 'none',
                padding: '9px 18px', borderRadius: '10px', fontWeight: '700',
                fontSize: '0.84rem', cursor: 'pointer'
              }}
            >
              Review Pending Reports
            </button>
          </div>
        )}

        {/* Quick Executive Actions Toolbar */}
        <div style={{
          background: '#ffffff',
          borderRadius: '20px',
          padding: '1.25rem 1.5rem',
          border: '1px solid #e2e8f0',
          boxShadow: '0 2px 10px rgba(0,0,0,0.02)',
          display: 'flex',
          flexWrap: 'wrap',
          gap: '10px',
          alignItems: 'center'
        }}>
          <span style={{ fontWeight: 800, fontSize: '0.85rem', color: '#0f172a', marginRight: '6px' }}>
            ⚡ Executive Actions:
          </span>
          <button className="g-button success" onClick={() => setIsAddOpen(true)} style={{ padding: '8px 16px', fontSize: '0.82rem' }}>
            <i className="fas fa-user-plus"></i> Add New Employee
          </button>
          <button className="g-button" onClick={() => setSection('live')} style={{ background: '#1e5a7a', padding: '8px 16px', fontSize: '0.82rem' }}>
            <i className="fas fa-eye"></i> Monitor Live ({checkedInNow})
          </button>
          <button className="g-button" onClick={() => setSection('dailyReports')} style={{ background: '#2563eb', padding: '8px 16px', fontSize: '0.82rem' }}>
            <i className="fas fa-clipboard-check"></i> Daily Reports Hub
          </button>
          <button className="g-button" onClick={() => setSection('mailBlast')} style={{ background: '#0284c7', padding: '8px 16px', fontSize: '0.82rem' }}>
            <i className="fas fa-mail-bulk"></i> Mail Blast Logs
          </button>
          <button className="g-button excel" onClick={handleExportAllAttendance} style={{ padding: '8px 16px', fontSize: '0.82rem' }}>
            <i className="fas fa-file-excel"></i> Export Attendance
          </button>
        </div>

        {/* Stats Grid: Attendance Totals */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="icon">📋</div>
            <div className="value">{totalRecords}</div>
            <div style={{ fontSize: '0.8rem', color: '#64748b' }}>Total Records</div>
          </div>
          <div className="stat-card">
            <div className="icon">✅</div>
            <div className="value">{fullDays}</div>
            <div style={{ fontSize: '0.8rem', color: '#64748b' }}>Full Days</div>
          </div>
          <div className="stat-card">
            <div className="icon">⚠️</div>
            <div className="value">{halfDays}</div>
            <div style={{ fontSize: '0.8rem', color: '#64748b' }}>Half Days</div>
          </div>
          <div className="stat-card">
            <div className="icon">🟡</div>
            <div className="value">{quarterDays}</div>
            <div style={{ fontSize: '0.8rem', color: '#64748b' }}>Quarter Days</div>
          </div>
          <div className="stat-card">
            <div className="icon">👥</div>
            <div className="value">{totalEmployees}</div>
            <div style={{ fontSize: '0.8rem', color: '#64748b' }}>Total Staff</div>
          </div>
          <div className="stat-card">
            <div className="icon">🟢</div>
            <div className="value">{activeEmployees}</div>
            <div style={{ fontSize: '0.8rem', color: '#64748b' }}>Active Staff</div>
          </div>
          <div className="stat-card">
            <div className="icon">🔴</div>
            <div className="value">{checkedInNow}</div>
            <div style={{ fontSize: '0.8rem', color: '#64748b' }}>Checked In Now</div>
          </div>
        </div>

        {/* Split View: Monthly Attendance Chart & Live Checked-In Stream */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
          gap: '1.25rem'
        }}>
          {/* Monthly Doughnut Chart */}
          <div className="section-card" style={{ margin: 0 }}>
            <div className="section-header">
              <h2><i className="fas fa-chart-pie" style={{ marginRight: '8px' }}></i> Monthly Attendance Distribution</h2>
            </div>
            <div className="chart-container" style={{ maxHeight: '240px', display: 'flex', justifyContent: 'center' }}>
              <canvas ref={chartRef} width="280" height="180"></canvas>
            </div>
          </div>

          {/* Real-time Live Stream Widget */}
          <div className="section-card" style={{ margin: 0, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <div className="section-header">
                <h2>
                  <i className="fas fa-satellite-dish" style={{ color: '#16a34a', marginRight: '8px' }}></i>
                  Active Checked-In Staff Stream
                </h2>
                <button
                  onClick={() => setSection('live')}
                  style={{ background: 'transparent', border: 'none', color: '#2563eb', fontWeight: '700', fontSize: '0.8rem', cursor: 'pointer' }}
                >
                  View Full Live Monitor ({liveSessions.length}) ↗
                </button>
              </div>

              {liveSessions.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '2.5rem 1rem', color: '#94a3b8' }}>
                  <div style={{ fontSize: '2rem', marginBottom: '6px' }}>☕</div>
                  No employees are currently checked in.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '200px', overflowY: 'auto' }}>
                  {liveSessions.slice(0, 5).map(emp => {
                    const sKey = emp.shift || (emp.department === 'Development' ? 'shift_1' : 'shift_2')
                    const sInfo = SHIFTS[sKey] || SHIFTS.shift_1
                    return (
                      <div
                        key={emp.employeeEmail}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '8px 12px',
                          borderRadius: '10px',
                          background: '#f8fafc',
                          border: '1px solid #e2e8f0'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#22c55e' }}></span>
                          <div>
                            <div style={{ fontWeight: '700', fontSize: '0.86rem', color: '#0a192f' }}>{emp.name}</div>
                            <div style={{ fontSize: '0.72rem', color: '#64748b' }}>{emp.empId} • {emp.department}</div>
                          </div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <span style={{
                            background: sInfo.color, color: '#fff', fontSize: '0.7rem',
                            fontWeight: '700', padding: '2px 6px', borderRadius: '4px'
                          }}>
                            {sInfo.name.split(':')[0]}
                          </span>
                          <div style={{ fontSize: '0.72rem', color: '#16a34a', fontWeight: '700', marginTop: '2px' }}>
                            {emp.checkInTime}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

            <div style={{ marginTop: '12px', paddingTop: '10px', borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', fontSize: '0.76rem', color: '#64748b' }}>
              <span>Office Geofence: <strong>{GEOFENCE.name}</strong></span>
              <span>Updated: <strong>{lastLiveUpdate ? lastLiveUpdate.toLocaleTimeString() : '—'}</strong></span>
            </div>
          </div>
        </div>
      </>)}

      {/* ── 2. DEDICATED DAILY REPORTS SECTION (activeSection === 'dailyReports') ─ */}
      {show('dailyReports') && (<>
        <div className="section-card">
          <div className="section-header" style={{ flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h2><i className="fas fa-clipboard-check" style={{ color: '#2563eb', marginRight: '8px' }}></i> Employee Daily Working Reports</h2>
              <p style={{ margin: '2px 0 0', fontSize: '0.8rem', color: '#64748b' }}>
                Track call volume, groups formed, candidate conversions, and ₹6,000 unit revenue
              </p>
            </div>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
              <input
                type="date"
                className="filter-input"
                value={dailyDateFilter}
                onChange={(e) => setDailyDateFilter(e.target.value)}
              />
              <input
                type="text"
                className="filter-input"
                placeholder="🔍 Search name / ID / remarks"
                value={dailySearch}
                onChange={(e) => setDailySearch(e.target.value)}
                style={{ width: '200px' }}
              />
              <button
                className="g-button excel"
                onClick={handleExportDailyReports}
                style={{ padding: '8px 16px', fontSize: '0.82rem' }}
              >
                <i className="fas fa-file-excel"></i> Export Excel
              </button>
            </div>
          </div>

          {/* Daily Reports Summary Strip */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
            gap: '10px',
            marginBottom: '1.25rem',
            background: '#f8fafc',
            padding: '12px',
            borderRadius: '14px',
            border: '1px solid #e2e8f0'
          }}>
            <div>
              <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: '700' }}>REPORTS FILED</div>
              <div style={{ fontSize: '1.3rem', fontWeight: '800', color: '#0a192f' }}>{filteredDaily.length}</div>
            </div>
            <div>
              <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: '700' }}>CONNECTED CALLS</div>
              <div style={{ fontSize: '1.3rem', fontWeight: '800', color: '#2563eb' }}>{totalDailyCalls}</div>
            </div>
            <div>
              <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: '700' }}>CONVERSIONS</div>
              <div style={{ fontSize: '1.3rem', fontWeight: '800', color: '#16a34a' }}>{totalDailyConversions}</div>
            </div>
            <div>
              <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: '700' }}>TOTAL REVENUE</div>
              <div style={{ fontSize: '1.3rem', fontWeight: '900', color: '#15803d' }}>₹{totalDailyRevenue.toLocaleString('en-IN')}</div>
            </div>
          </div>

          {/* Daily Reports Table */}
          <div style={{ overflowX: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>DATE & TIME</th>
                  <th>EMPLOYEE</th>
                  <th>TEAM</th>
                  <th>CONNECTED CALLS</th>
                  <th>&gt;3 MIN CALLS</th>
                  <th>GROUPS CREATED</th>
                  <th>MEMBERS</th>
                  <th>CONVERSIONS</th>
                  <th>REVENUE (₹6K)</th>
                  <th>REMARKS</th>
                </tr>
              </thead>
              <tbody>
                {filteredDaily.length > 0 ? (
                  filteredDaily.slice(0, dailyLimit).map(r => (
                    <tr key={r._id}>
                      <td>
                        <strong>{r.reportDate}</strong>
                        <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>{r.reportTime}</div>
                      </td>
                      <td>
                        <strong>{r.employeeName}</strong>
                        <div style={{ fontSize: '0.72rem', color: '#64748b' }}>{r.employeeId}</div>
                      </td>
                      <td>{r.teamName || 'BDA'}</td>
                      <td><strong>{r.connectedCalls}</strong></td>
                      <td>{r.callsAbove3Min}</td>
                      <td>{r.groupsCreated}</td>
                      <td>{r.membersInGroups}</td>
                      <td>
                        <span style={{
                          background: r.todayConversions > 0 ? '#dcfce7' : '#f1f5f9',
                          color: r.todayConversions > 0 ? '#15803d' : '#64748b',
                          padding: '3px 8px', borderRadius: '6px', fontWeight: '800'
                        }}>
                          {r.todayConversions}
                        </span>
                      </td>
                      <td style={{ color: '#2563eb', fontWeight: '800' }}>
                        ₹{(r.revenue || 0).toLocaleString('en-IN')}
                      </td>
                      <td style={{ maxWidth: '220px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {r.remarks || '—'}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="10" style={{ textAlign: 'center', padding: '28px', color: '#64748b' }}>
                      No daily reports match the selected filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* View More / View Less for Daily Reports */}
          {filteredDaily.length > 10 && (
            <div style={{ display: 'flex', justifyContent: 'center', gap: '15px', marginTop: '1.2rem' }}>
              {dailyLimit > 10 && (
                <button
                  className="g-button"
                  style={{ background: '#475569', display: 'flex', alignItems: 'center', gap: '6px' }}
                  onClick={() => setDailyLimit(prev => Math.max(10, prev - 10))}
                >
                  <i className="fas fa-chevron-up"></i> View Less
                </button>
              )}
              {dailyLimit < filteredDaily.length && (
                <button
                  className="g-button"
                  style={{ background: '#1e5a7a', display: 'flex', alignItems: 'center', gap: '6px' }}
                  onClick={() => setDailyLimit(prev => Math.min(filteredDaily.length, prev + 10))}
                >
                  <i className="fas fa-chevron-down"></i> View More ({filteredDaily.length - dailyLimit} remaining)
                </button>
              )}
            </div>
          )}
        </div>
      </>)}

      {/* ── 3. DEDICATED MAIL BLAST SECTION (activeSection === 'mailBlast') ──── */}
      {show('mailBlast') && (<>
        <div className="section-card">
          <div className="section-header" style={{ flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h2><i className="fas fa-mail-bulk" style={{ color: '#0284c7', marginRight: '8px' }}></i> Mail Blast Outreach Campaigns</h2>
              <p style={{ margin: '2px 0 0', fontSize: '0.8rem', color: '#64748b' }}>
                Email outreach campaigns, targeted colleges, and candidate response logs
              </p>
            </div>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
              <input
                type="date"
                className="filter-input"
                value={mailDateFilter}
                onChange={(e) => setMailDateFilter(e.target.value)}
              />
              <input
                type="text"
                className="filter-input"
                placeholder="🔍 Search name / college / template"
                value={mailSearch}
                onChange={(e) => setMailSearch(e.target.value)}
                style={{ width: '220px' }}
              />
              <button
                className="g-button excel"
                onClick={handleExportMailBlast}
                style={{ padding: '8px 16px', fontSize: '0.82rem' }}
              >
                <i className="fas fa-file-excel"></i> Export Excel
              </button>
            </div>
          </div>

          {/* Mail Blast Summary Strip */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
            gap: '10px',
            marginBottom: '1.25rem',
            background: '#f8fafc',
            padding: '12px',
            borderRadius: '14px',
            border: '1px solid #e2e8f0'
          }}>
            <div>
              <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: '700' }}>TOTAL CAMPAIGNS</div>
              <div style={{ fontSize: '1.3rem', fontWeight: '800', color: '#0a192f' }}>{filteredMail.length}</div>
            </div>
            <div>
              <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: '700' }}>EMAILS SENT</div>
              <div style={{ fontSize: '1.3rem', fontWeight: '800', color: '#0284c7' }}>{totalMailSent.toLocaleString('en-IN')}</div>
            </div>
            <div>
              <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: '700' }}>RESPONSES GOT</div>
              <div style={{ fontSize: '1.3rem', fontWeight: '800', color: '#16a34a' }}>{totalMailResponses}</div>
            </div>
            <div>
              <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: '700' }}>RESPONSE RATE</div>
              <div style={{ fontSize: '1.3rem', fontWeight: '800', color: '#7c3aed' }}>
                {totalMailSent > 0 ? ((totalMailResponses / totalMailSent) * 100).toFixed(1) : 0}%
              </div>
            </div>
          </div>

          {/* Mail Blast Table */}
          <div style={{ overflowX: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>DATE & TIME</th>
                  <th>EMPLOYEE</th>
                  <th>TARGET TYPE</th>
                  <th>COLLEGE / RECIPIENTS</th>
                  <th>TEMPLATE USED</th>
                  <th>EMAILS SENT</th>
                  <th>RESPONSES</th>
                  <th>BOUNCES</th>
                  <th>STATUS</th>
                  <th>REMARKS</th>
                </tr>
              </thead>
              <tbody>
                {filteredMail.length > 0 ? (
                  filteredMail.slice(0, mailLimit).map(m => (
                    <tr key={m._id}>
                      <td>
                        <strong>{m.reportDate}</strong>
                        <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>{m.reportTime}</div>
                      </td>
                      <td>
                        <strong>{m.employeeName}</strong>
                        <div style={{ fontSize: '0.72rem', color: '#64748b' }}>{m.employeeId}</div>
                      </td>
                      <td>
                        <span style={{
                          background: m.targetType === 'College-wise' ? '#eff6ff' : '#f1f5f9',
                          color: m.targetType === 'College-wise' ? '#2563eb' : '#475569',
                          padding: '2px 7px', borderRadius: '6px', fontWeight: '700', fontSize: '0.74rem'
                        }}>
                          {m.targetType}
                        </span>
                      </td>
                      <td style={{ maxWidth: '180px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {m.collegeName || 'Random Audience'}
                      </td>
                      <td style={{ maxWidth: '180px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {m.templateUsed || 'Standard Template'}
                      </td>
                      <td><strong>{m.emailsSent}</strong></td>
                      <td style={{ color: '#16a34a', fontWeight: '700' }}>{m.responsesReceived}</td>
                      <td style={{ color: '#ef4444' }}>{m.bounceCount}</td>
                      <td>
                        <span style={{
                          background: m.status === 'Completed' ? '#dcfce7' : '#fef3c7',
                          color: m.status === 'Completed' ? '#15803d' : '#b45309',
                          padding: '3px 8px', borderRadius: '6px', fontWeight: '700', fontSize: '0.74rem'
                        }}>
                          {m.status}
                        </span>
                      </td>
                      <td style={{ maxWidth: '180px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {m.remarks || '—'}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="10" style={{ textAlign: 'center', padding: '28px', color: '#64748b' }}>
                      No mail blast reports recorded for current filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* View More / View Less for Mail Blast */}
          {filteredMail.length > 10 && (
            <div style={{ display: 'flex', justifyContent: 'center', gap: '15px', marginTop: '1.2rem' }}>
              {mailLimit > 10 && (
                <button
                  className="g-button"
                  style={{ background: '#475569', display: 'flex', alignItems: 'center', gap: '6px' }}
                  onClick={() => setMailLimit(prev => Math.max(10, prev - 10))}
                >
                  <i className="fas fa-chevron-up"></i> View Less
                </button>
              )}
              {mailLimit < filteredMail.length && (
                <button
                  className="g-button"
                  style={{ background: '#1e5a7a', display: 'flex', alignItems: 'center', gap: '6px' }}
                  onClick={() => setMailLimit(prev => Math.min(filteredMail.length, prev + 10))}
                >
                  <i className="fas fa-chevron-down"></i> View More ({filteredMail.length - mailLimit} remaining)
                </button>
              )}
            </div>
          )}
        </div>
      </>)}

      {/* ── 4. DEDICATED REVENUE SECTION (activeSection === 'revenue') ────────── */}
      {show('revenue') && (<>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Revenue KPI Summary */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '1rem'
          }}>
            <div style={{ background: '#ffffff', borderRadius: '18px', padding: '1.5rem', border: '1px solid #e2e8f0' }}>
              <div style={{ color: '#64748b', fontSize: '0.78rem', fontWeight: '700' }}>TOTAL VERIFIED REVENUE</div>
              <div style={{ fontSize: '2rem', fontWeight: '900', color: '#059669', margin: '6px 0 2px' }}>
                ₹{(revenueData?.summary?.totalRevenue || 0).toLocaleString('en-IN')}
              </div>
              <div style={{ fontSize: '0.76rem', color: '#64748b' }}>Cumulative commercial admissions</div>
            </div>

            <div style={{ background: '#ffffff', borderRadius: '18px', padding: '1.5rem', border: '1px solid #e2e8f0' }}>
              <div style={{ color: '#64748b', fontSize: '0.78rem', fontWeight: '700' }}>TOTAL CONVERSIONS</div>
              <div style={{ fontSize: '2rem', fontWeight: '900', color: '#0a192f', margin: '6px 0 2px' }}>
                {revenueData?.summary?.totalConversions || 0}
              </div>
              <div style={{ fontSize: '0.76rem', color: '#64748b' }}>Confirmed product conversions (₹6,000 product)</div>
            </div>

            <div style={{ background: '#ffffff', borderRadius: '18px', padding: '1.5rem', border: '1px solid #e2e8f0' }}>
              <div style={{ color: '#64748b', fontSize: '0.78rem', fontWeight: '700' }}>CURRENT MONTH REVENUE</div>
              <div style={{ fontSize: '2rem', fontWeight: '900', color: '#d97706', margin: '6px 0 2px' }}>
                ₹{(revenueData?.summary?.currentMonthRevenue || 0).toLocaleString('en-IN')}
              </div>
              <div style={{ fontSize: '0.76rem', color: '#64748b' }}>
                {revenueData?.summary?.currentMonthConversions || 0} conversions this month
              </div>
            </div>

            <div style={{ background: '#eff6ff', borderRadius: '18px', padding: '1.5rem', border: '1px solid #bfdbfe' }}>
              <div style={{ color: '#1e40af', fontSize: '0.78rem', fontWeight: '700' }}>UNIT CONVERSION RATE</div>
              <div style={{ fontSize: '2rem', fontWeight: '900', color: '#1d4ed8', margin: '6px 0 2px' }}>
                ₹6,000 INR
              </div>
              <div style={{ fontSize: '0.76rem', color: '#1e40af' }}>Standard rate per admission</div>
            </div>
          </div>

          {/* Associate & Team Breakdown */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '1.25rem' }}>
            <div className="section-card" style={{ margin: 0 }}>
              <div className="section-header">
                <h2><i className="fas fa-sitemap" style={{ marginRight: '8px' }}></i> Team Revenue Contribution</h2>
              </div>
              <div style={{ overflowX: 'auto' }}>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>TEAM</th>
                      <th>CONVERSIONS</th>
                      <th>REVENUE (₹)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(revenueData?.teamBreakdown || []).map(t => (
                      <tr key={t._id}>
                        <td><strong>{t._id || 'BDA'}</strong></td>
                        <td><span style={{ background: '#dcfce7', color: '#15803d', padding: '3px 8px', borderRadius: '6px', fontWeight: '700' }}>{t.conversions}</span></td>
                        <td style={{ color: '#059669', fontWeight: '800' }}>₹{(t.revenue || 0).toLocaleString('en-IN')}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="section-card" style={{ margin: 0 }}>
              <div className="section-header">
                <h2><i className="fas fa-users-cog" style={{ marginRight: '8px' }}></i> Associate Portfolio Revenue</h2>
              </div>
              <div style={{ overflowX: 'auto', maxHeight: '350px' }}>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>ASSOCIATE</th>
                      <th>TEAM</th>
                      <th>CONVERSIONS</th>
                      <th>REVENUE</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(revenueData?.employeeBreakdown || []).map(emp => (
                      <tr key={emp._id}>
                        <td>
                          <strong>{emp.name}</strong>
                          <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>{emp.empId}</div>
                        </td>
                        <td>{emp.team}</td>
                        <td><span style={{ background: '#dcfce7', color: '#15803d', padding: '3px 8px', borderRadius: '6px', fontWeight: '700' }}>{emp.conversions}</span></td>
                        <td style={{ color: '#059669', fontWeight: '800' }}>₹{(emp.revenue || 0).toLocaleString('en-IN')}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </>)}

      {/* ── 5. OVERALL ATTENDANCE ANALYTICS (show('overall')) ────────────────── */}
      {show('overall') && (
        <OverallAttendance 
          employees={employees}
          attendance={attendance}
          liveSessions={liveSessions}
          holidays={holidays}
          onRefresh={fetchData}
        />
      )}

      {/* ── 6. LIVE CHECK-INS TODAY (show('live')) ───────────────────────────── */}
      {show('live') && (<>
      <div className="section-card">
        <div className="section-header">
          <h2>
            <i className="fas fa-eye" style={{ marginRight: '8px' }}></i> Live Checked-In Today
            <span className="live-badge" style={{ marginLeft: '8px' }}>LIVE</span>
            <span style={{ fontSize: '0.72rem', fontWeight: 400, color: '#64748b', marginLeft: '12px' }}>
              {filteredLive.length} employee{filteredLive.length !== 1 ? 's' : ''} checked in
            </span>
          </h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            {lastLiveUpdate && (
              <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
                🔄 Updated {lastLiveUpdate.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
              </span>
            )}
            <input
              type="text"
              className="filter-input"
              placeholder="🔍 Search name / ID"
              style={{ width: '220px' }}
              value={liveSearch}
              onChange={(e) => setLiveSearch(e.target.value)}
            />
          </div>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>EMPLOYEE</th>
                <th>EMP ID</th>
                <th>DEPARTMENT</th>
                <th>SHIFT</th>
                <th>DATE</th>
                <th>CHECK-IN TIME</th>
                <th>LOCATION</th>
                <th>STATUS</th>
                <th>DETAILS</th>
              </tr>
            </thead>
            <tbody>
              {filteredLive.length > 0 ? (
                filteredLive.map(emp => {
                  const [yr, mo, dy] = (emp.date || '').split('-')
                  const formattedDate = emp.date ? `${dy}-${mo}-${yr}` : '—'

                  const formatTime = (t) => {
                    if (!t) return '—'
                    const [hStr, mStr] = t.split(':')
                    const h = parseInt(hStr, 10)
                    const ampm = h >= 12 ? 'PM' : 'AM'
                    const h12 = h % 12 === 0 ? 12 : h % 12
                    return `${String(h12).padStart(2, '0')}:${mStr} ${ampm}`
                  }

                  const sKey = emp.shift || (emp.department === 'Development' || emp.department === 'Software Development' ? 'shift_1' : 'shift_2')
                  const sInfo = SHIFTS[sKey] || SHIFTS.shift_1

                  return (
                    <tr
                      key={emp.employeeEmail}
                      style={{ cursor: 'pointer' }}
                      title="Click to view details"
                      onClick={() => setLiveDetailEmp(emp)}
                    >
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <div style={{
                            width: '36px', height: '36px', borderRadius: '50%',
                            background: 'linear-gradient(135deg, #1e5a7a, #2563eb)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            color: '#fff', fontWeight: 700, fontSize: '0.8rem', flexShrink: 0
                          }}>
                            {(emp.name || '?').charAt(0).toUpperCase()}
                          </div>
                          <strong>{emp.name}</strong>
                        </div>
                      </td>
                      <td><strong>{emp.empId}</strong></td>
                      <td>{emp.department}</td>
                      <td>
                        <span style={{
                          display: 'inline-block',
                          background: sInfo.color,
                          color: '#fff',
                          fontSize: '0.72rem',
                          fontWeight: 700,
                          padding: '2px 7px',
                          borderRadius: '6px'
                        }}>
                          {sInfo.name.split(':')[0]}
                        </span>
                      </td>
                      <td style={{ fontWeight: 600, color: '#1e5a7a' }}>{formattedDate}</td>
                      <td>
                        <span className="status-badge status-checkedin" style={{ background: '#dcfce7', color: '#16a34a', border: '1px solid #bbf7d0' }}>
                          🟢 {formatTime(emp.checkInTime)}
                        </span>
                      </td>
                      <td>
                        {emp.latitude && emp.longitude ? (
                          <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#16a34a' }}>
                            📍 Office Coordinates
                          </span>
                        ) : (
                          <span style={{ color: '#94a3b8', fontSize: '0.75rem' }}>—</span>
                        )}
                      </td>
                      <td><span className="live-badge">● Active</span></td>
                      <td>
                        <button
                          className="mark-btn"
                          style={{ padding: '4px 10px', fontSize: '0.76rem', background: '#1e5a7a' }}
                          onClick={(e) => { e.stopPropagation(); setLiveDetailEmp(emp) }}
                        >
                          <i className="fas fa-info-circle" style={{ marginRight: '4px' }}></i>View
                        </button>
                      </td>
                    </tr>
                  )
                })
              ) : (
                <tr>
                  <td colSpan="9" style={{ textAlign: 'center', color: '#64748b', padding: '28px' }}>
                    <div style={{ fontSize: '2rem', marginBottom: '6px' }}>🕐</div>
                    No employees have checked in today yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Live Detail Popup Modal ────────────────────────────────────────── */}
      {liveDetailEmp && (() => {
        const emp = liveDetailEmp
        const [yr, mo, dy] = (emp.date || '').split('-')
        const formattedDate = emp.date ? `${dy}-${mo}-${yr}` : '—'
        const formatTime = (t) => {
          if (!t) return '—'
          const [hStr, mStr] = t.split(':')
          const h = parseInt(hStr, 10)
          const ampm = h >= 12 ? 'PM' : 'AM'
          const h12 = h % 12 === 0 ? 12 : h % 12
          return `${String(h12).padStart(2, '0')}:${mStr} ${ampm}`
        }
        const todayStr = new Date().toISOString().split('T')[0]
        const attRec = attendance.find(r => r.employeeEmail === emp.employeeEmail && r.date === todayStr)

        return (
          <div
            style={{
              position: 'fixed', inset: 0, zIndex: 9999,
              background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(4px)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px'
            }}
            onClick={() => setLiveDetailEmp(null)}
          >
            <div
              style={{
                background: '#fff', borderRadius: '16px', padding: '2rem',
                width: '100%', maxWidth: '420px', boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
                position: 'relative'
              }}
              onClick={e => e.stopPropagation()}
            >
              <button
                onClick={() => setLiveDetailEmp(null)}
                style={{
                  position: 'absolute', top: '14px', right: '14px',
                  background: '#f1f5f9', border: 'none', borderRadius: '50%',
                  width: '32px', height: '32px', cursor: 'pointer',
                  fontSize: '1rem', color: '#475569', display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}
              >✕</button>

              <div style={{ textAlign: 'center', marginBottom: '1.4rem' }}>
                <div style={{
                  width: '70px', height: '70px', borderRadius: '50%',
                  background: 'linear-gradient(135deg, #1e5a7a, #2563eb)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: '#fff', fontWeight: 800, fontSize: '1.6rem',
                  margin: '0 auto 10px'
                }}>
                  {(emp.name || '?').charAt(0).toUpperCase()}
                </div>
                <h3 style={{ margin: '0 0 2px', color: '#0f172a', fontSize: '1.15rem' }}>{emp.name}</h3>
                <p style={{ margin: 0, color: '#64748b', fontSize: '0.85rem' }}>{emp.employeeEmail}</p>
                <span className="live-badge" style={{ display: 'inline-block', marginTop: '6px' }}>● Currently Active</span>
              </div>

              {[
                { icon: '🪪', label: 'Employee ID', value: emp.empId },
                { icon: '🏢', label: 'Department', value: emp.department },
                {
                  icon: '⏰', label: 'Assigned Shift',
                  value: (() => {
                    const sKey = emp.shift || (emp.department === 'Development' || emp.department === 'Software Development' ? 'shift_1' : 'shift_2')
                    return SHIFTS[sKey]?.name || '—'
                  })()
                },
                { icon: '📅', label: 'Check-In Date', value: formattedDate },
                { icon: '⏰', label: 'Check-In Time', value: formatTime(emp.checkInTime) },
                { icon: '🚪', label: 'Check-Out Time', value: attRec?.checkOut ? formatTime(attRec.checkOut) : 'Not yet checked out' },
                { icon: '📊', label: 'Attendance Status', value: attRec?.status ? attRec.status.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()) : 'Checked In (Pending)' },
                {
                  icon: '📍', label: 'Office Geofence',
                  value: attRec?.locationDistanceMeters !== undefined && attRec?.locationDistanceMeters !== null
                    ? `${attRec.locationVerified ? '✅ Office Premises' : '⚠️ Remote'} (${attRec.locationDistanceMeters}m from ${GEOFENCE.name})`
                    : 'Coordinates Recorded'
                },
                {
                  icon: '🔍', label: 'Face Verification',
                  value: attRec?.faceVerified === true
                    ? `✅ Verified (${attRec.faceScore || 0}% confidence)`
                    : attRec?.faceVerified === false
                      ? `❌ Failed (${attRec.faceScore || 0}% confidence)`
                      : '—'
                },
              ].map(({ icon, label, value }) => (
                <div key={label} style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
                  padding: '8px 0', borderBottom: '1px solid #f1f5f9'
                }}>
                  <span style={{ color: '#64748b', fontSize: '0.84rem', display: 'flex', gap: '6px', alignItems: 'center' }}>
                    <span>{icon}</span> {label}
                  </span>
                  <span style={{ fontWeight: 600, color: '#0f172a', fontSize: '0.84rem', textAlign: 'right', maxWidth: '55%' }}>{value}</span>
                </div>
              ))}

              <button
                onClick={() => setLiveDetailEmp(null)}
                className="g-button"
                style={{ width: '100%', marginTop: '1.2rem', background: '#1e5a7a', justifyContent: 'center' }}
              >
                Close
              </button>
            </div>
          </div>
        )
      })()}
      </>)}

      {/* ── 7. EMPLOYEE DIRECTORY (show('employees')) ────────────────────────── */}
      {show('employees') && (<>
      <div className="section-card">
        <div className="section-header">
          <h2><i className="fas fa-users" style={{ marginRight: '8px' }}></i> Employee Data & Workforce Directory</h2>
          <div className="filter-bar">
            <input 
              type="text" 
              className="filter-input" 
              placeholder="🔍 Name / ID / Email" 
              value={empSearch}
              onChange={(e) => setEmpSearch(e.target.value)}
            />
            <select
              className="filter-input"
              value={empShiftFilter}
              onChange={(e) => setEmpShiftFilter(e.target.value)}
              style={{ maxWidth: '240px' }}
            >
              <option value="">All Shifts</option>
              <option value="shift_1">Shift 1 (07:00 AM - 11:00 AM) • Software</option>
              <option value="shift_2">Shift 2 (11:00 AM - 05:00 PM) • BDA Phase 1</option>
              <option value="shift_3">Shift 3 (05:00 PM - 11:00 PM) • BDA Phase 2</option>
            </select>
            <button className="g-button success" onClick={() => setIsAddOpen(true)}>
              <i className="fas fa-user-plus"></i> Add Employee
            </button>
            <button className="g-button excel" onClick={handleExportEmployees} style={{ background: '#16a34a' }}>
              <i className="fas fa-download"></i> Export Directory
            </button>
          </div>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>EMP ID</th>
                <th>NAME</th>
                <th>EMAIL</th>
                <th>DEPT</th>
                <th>SHIFT</th>
                <th>STATUS</th>
                <th>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {filteredEmployees.length > 0 ? (
                filteredEmployees.slice(0, empLimit).map(emp => (
                  <tr key={emp.email}>
                    <td><strong>{emp.empId}</strong></td>
                    <td>{emp.name}</td>
                    <td>{emp.email}</td>
                    <td>{emp.department}</td>
                    <td>
                      {(() => {
                        const sKey = emp.shift || (emp.department === 'Development' || emp.department === 'Software Development' ? 'shift_1' : 'shift_2')
                        const sInfo = SHIFTS[sKey] || SHIFTS.shift_1
                        return (
                          <span style={{
                            display: 'inline-block',
                            background: sInfo.color,
                            color: '#fff',
                            fontSize: '0.72rem',
                            fontWeight: 700,
                            padding: '3px 8px',
                            borderRadius: '6px'
                          }}>
                            {sInfo.name.split(':')[0]}
                          </span>
                        )
                      })()}
                    </td>
                    <td>
                      <span className={`status-badge ${emp.status === 'active' ? 'status-active' : 'status-inactive'}`}>
                        {emp.status}
                      </span>
                    </td>
                    <td>
                      <button 
                        className="btn-icon" 
                        title={emp.status === 'active' ? 'Disable Account' : 'Enable Account'} 
                        onClick={() => handleToggleStatus(emp.email)}
                      >
                        <i className={`fas ${emp.status === 'active' ? 'fa-ban' : 'fa-check-circle'}`}></i>
                      </button>
                      <button 
                        className="mark-btn" 
                        onClick={() => {
                          setSelectedEmp(emp)
                          setIsMarkOpen(true)
                        }}
                        style={{ marginRight: '6px' }}
                      >
                        <i className="fas fa-pen-alt" style={{ marginRight: '4px' }}></i> Mark
                      </button>
                      <button 
                        className="mark-btn" 
                        onClick={() => {
                          setProfileEmp(emp)
                          setIsProfileOpen(true)
                        }}
                        style={{ background: '#2563eb', marginRight: '6px' }}
                      >
                        <i className="fas fa-user-cog" style={{ marginRight: '4px' }}></i> Profile
                      </button>
                      <button 
                        className="btn-icon" 
                        style={{ color: '#e11d48' }} 
                        title="Delete Employee" 
                        onClick={() => handleDeleteEmployee(emp.email, emp.name)}
                      >
                        <i className="fas fa-user-minus"></i>
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', color: '#64748b', padding: '20px' }}>No employees found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* View More / View Less for Employee Data */}
        {filteredEmployees.length > 5 && (
          <div style={{ display: 'flex', justifyContent: 'center', gap: '15px', marginTop: '1.2rem', paddingBottom: '0.8rem', flexWrap: 'wrap' }}>
            {empLimit > 5 && (
              <button 
                className="g-button"
                style={{ background: '#475569', display: 'flex', alignItems: 'center', gap: '6px' }}
                onClick={() => setEmpLimit(prev => Math.max(5, prev - 5))}
              >
                <i className="fas fa-chevron-up"></i> View Less
              </button>
            )}
            {empLimit < filteredEmployees.length && (
              <button 
                className="g-button"
                style={{ background: '#1e5a7a', display: 'flex', alignItems: 'center', gap: '6px' }}
                onClick={() => setEmpLimit(prev => Math.min(filteredEmployees.length, prev + 5))}
              >
                <i className="fas fa-chevron-down"></i> View More ({filteredEmployees.length - empLimit} remaining)
              </button>
            )}
          </div>
        )}
      </div>
      </>)}

      {/* ── 8. MASTER ATTENDANCE LOGS (show('attendance')) ───────────────────── */}
      {show('attendance') && (<>
      <div className="section-card">
        <div className="section-header">
          <h2><i className="fas fa-calendar-alt" style={{ marginRight: '8px' }}></i> Master Attendance Logs & History</h2>
          <div className="filter-bar">
            <input 
              type="text" 
              className="filter-input" 
              placeholder="🔍 Employee Name" 
              value={attNameSearch}
              onChange={(e) => setAttNameSearch(e.target.value)}
            />
            <input 
              type="date" 
              className="filter-input" 
              value={attDateFilter}
              onChange={(e) => setAttDateFilter(e.target.value)}
            />
            <select 
              className="filter-input dept-filter" 
              value={attDeptFilter}
              onChange={(e) => setAttDeptFilter(e.target.value)}
            >
              <option value="">All Departments</option>
              {departments.map(dept => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>
            <select 
              className="filter-input" 
              value={attStatusFilter}
              onChange={(e) => setAttStatusFilter(e.target.value)}
            >
              <option value="">All Status</option>
              <option value="full-day">Full Day</option>
              <option value="half-day">Half Day</option>
              <option value="quarter-day">Quarter Day</option>
            </select>
            <select 
              className="filter-input" 
              value={attShiftFilter}
              onChange={(e) => setAttShiftFilter(e.target.value)}
            >
              <option value="">All Shifts</option>
              <option value="shift_1">Shift 1 (07:00 AM - 11:00 AM)</option>
              <option value="shift_2">Shift 2 (11:00 AM - 05:00 PM)</option>
              <option value="shift_3">Shift 3 (05:00 PM - 11:00 PM)</option>
            </select>
            <button 
              className="g-button excel" 
              onClick={handleExportFiltered} 
              style={{ background: '#2c6e9e' }}
            >
              <i className="fas fa-download"></i> Export Filtered
            </button>
          </div>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>DATE</th>
                <th>EMP ID</th>
                <th>EMPLOYEE</th>
                <th>DEPT</th>
                <th>SHIFT</th>
                <th>CHECK-IN</th>
                <th>CHECK-OUT</th>
                <th>HOURS</th>
                <th>STATUS</th>
                <th>LOCATION</th>
                <th>VERIFICATION</th>
                <th>ACTION</th>
              </tr>
            </thead>
            <tbody>
              {loadingLogs ? (
                <tr>
                  <td colSpan="12" style={{ textAlign: 'center', color: '#64748b', padding: '20px' }}>
                    <i className="fas fa-spinner fa-spin" style={{ marginRight: '8px' }}></i> Loading attendance logs...
                  </td>
                </tr>
              ) : logsError ? (
                <tr>
                  <td colSpan="12" style={{ textAlign: 'center', color: '#dc2626', padding: '20px', fontWeight: 'bold' }}>
                    ⚠️ Unable to load attendance logs. Please try again.
                  </td>
                </tr>
              ) : filteredAttendance.length > 0 ? (
                filteredAttendance.slice(0, attLimit).map(rec => {
                  let cls = 'status-quarter'
                  let txt = rec.status || '—'
                  let badgeStyle = undefined

                  if (rec.status === 'full-day') {
                    cls = 'status-full'
                    txt = 'Full Day'
                  } else if (rec.status === 'half-day') {
                    cls = 'status-half'
                    txt = 'Half Day'
                  } else if (rec.status === 'quarter-day') {
                    cls = 'status-quarter'
                    txt = 'Quarter Day'
                  } else if (rec.status === 'holiday') {
                    cls = ''
                    txt = 'Holiday'
                    badgeStyle = { background: '#dbeafe', color: '#1d4ed8', padding: '4px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 'bold' }
                  } else if (rec.status === 'worked-on-holiday') {
                    cls = ''
                    txt = 'Worked on Holiday'
                    badgeStyle = { background: '#f3e8ff', color: '#7e22ce', padding: '4px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 'bold' }
                  }

                  return (
                    <tr key={rec._id}>
                      <td>{rec.date}</td>
                      <td><strong>{rec.employeeId || '—'}</strong></td>
                      <td>{rec.employeeName}</td>
                      <td>{rec.department}</td>
                      <td>
                        {(() => {
                          const sKey = rec.shift || (rec.department === 'Development' || rec.department === 'Software Development' ? 'shift_1' : 'shift_2')
                          const sInfo = SHIFTS[sKey] || SHIFTS.shift_1
                          return (
                            <span style={{
                              display: 'inline-block',
                              background: sInfo.color,
                              color: '#fff',
                              fontSize: '0.72rem',
                              fontWeight: 700,
                              padding: '2px 7px',
                              borderRadius: '6px'
                            }}>
                              {sInfo.name.split(':')[0]}
                            </span>
                          )
                        })()}
                      </td>
                      <td>{rec.checkIn}</td>
                      <td>
                        {rec.checkOut || '—'}
                        {rec.logoutType === 'Admin Physical Logout' && (
                          <div style={{ fontSize: '0.68rem', color: '#b45309', fontWeight: 'bold', marginTop: '2px' }}>
                            [Admin Physical Logout]
                          </div>
                        )}
                      </td>
                      <td>{rec.workingHours || '—'}</td>
                      <td><span className={`status-badge ${cls}`} style={badgeStyle}>{txt}</span></td>
                      <td>
                        {rec.locationDistanceMeters !== undefined && rec.locationDistanceMeters !== null ? (
                          <div style={{ fontSize: '0.78rem' }}>
                            <span style={{ fontWeight: 600, color: rec.locationVerified ? '#16a34a' : '#dc2626' }}>
                              {rec.locationVerified ? '📍 Office' : '⚠️ Remote'}
                            </span>
                            <div style={{ fontSize: '0.7rem', color: '#64748b' }}>
                              {rec.locationDistanceMeters}m
                            </div>
                          </div>
                        ) : (
                          <span style={{ color: '#94a3b8', fontSize: '0.78rem' }}>—</span>
                        )}
                      </td>
                      <td>
                        {rec.faceVerified !== null && rec.faceVerified !== undefined ? (
                          <span style={{
                            fontSize: '0.75rem', fontWeight: 700,
                            color: rec.faceVerified ? '#16a34a' : '#dc2626'
                          }}>
                            {rec.faceVerified ? `✅ Verified` : `❌ Unverified`}
                          </span>
                        ) : (
                          <span style={{ color: '#94a3b8', fontSize: '0.75rem' }}>—</span>
                        )}
                      </td>
                      <td>
                        <button 
                          className="btn-icon" 
                          style={{ color: '#e11d48' }} 
                          title="Delete Record" 
                          onClick={() => handleDeleteAttendance(rec._id)}
                        >
                          <i className="fas fa-trash"></i>
                        </button>
                      </td>
                    </tr>
                  )
                })
              ) : (
                <tr>
                  <td colSpan="12" style={{ textAlign: 'center', color: '#64748b', padding: '20px' }}>
                    No attendance records match the current filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* View More / View Less for Attendance Logs */}
        {filteredAttendance.length > 5 && (
          <div style={{ display: 'flex', justifyContent: 'center', gap: '15px', marginTop: '1.2rem', paddingBottom: '0.8rem', flexWrap: 'wrap' }}>
            {attLimit > 5 && (
              <button 
                className="g-button"
                style={{ background: '#475569', display: 'flex', alignItems: 'center', gap: '6px' }}
                onClick={() => setAttLimit(prev => Math.max(5, prev - 5))}
              >
                <i className="fas fa-chevron-up"></i> View Less
              </button>
            )}
            {attLimit < filteredAttendance.length && (
              <button 
                className="g-button"
                style={{ background: '#1e5a7a', display: 'flex', alignItems: 'center', gap: '6px' }}
                onClick={() => setAttLimit(prev => Math.min(filteredAttendance.length, prev + 5))}
              >
                <i className="fas fa-chevron-down"></i> View More ({filteredAttendance.length - attLimit} remaining)
              </button>
            )}
          </div>
        )}
      </div>
      </>)}

      {/* ── 9. MISSING CHECKOUTS RESOLVER (show('missing')) ─────────────────── */}
      {show('missing') && (<>
      <div className="section-card" style={{ borderLeft: '4px solid #ea580c' }}>
        <div className="section-header">
          <h2>
            <i className="fas fa-exclamation-triangle" style={{ color: '#ea580c', marginRight: '8px' }}></i> 
            Missing Checkouts Resolver (Pending Action)
            {missingCheckouts.length > 0 && (
              <span className="live-badge" style={{ background: '#ea580c', marginLeft: '8px', color: 'white' }}>{missingCheckouts.length} PENDING</span>
            )}
          </h2>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>DATE</th>
                <th>EMP ID</th>
                <th>NAME</th>
                <th>EMAIL</th>
                <th>DEPT</th>
                <th>CHECK-IN</th>
                <th>ACTION</th>
              </tr>
            </thead>
            <tbody>
              {missingCheckouts.length > 0 ? (
                missingCheckouts.map(emp => (
                  <tr key={emp._id}>
                    <td>{emp.date}</td>
                    <td><strong>{emp.empId}</strong></td>
                    <td>{emp.name}</td>
                    <td>{emp.email}</td>
                    <td>{emp.department}</td>
                    <td><span className="status-badge status-checkedin">🔴 {emp.checkInTime}</span></td>
                    <td>
                      <button 
                        className="g-button danger" 
                        onClick={() => handleManualCheckout(emp.email, emp.name)}
                        style={{ padding: '6px 12px', borderRadius: '20px', fontSize: '0.75rem', background: '#ea580c', border: 'none', cursor: 'pointer' }}
                      >
                        <i className="fas fa-sign-out-alt" style={{ marginRight: '4px' }}></i> Force Check Out
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', color: '#64748b', padding: '20px' }}>
                    No missing checkouts recorded (All check-ins resolved successfully).
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      </>)}

      {/* ── 10. AUTO CHECKOUT RECORDS (show('autocheckout')) ────────────────── */}
      {show('autocheckout') && (<>
      <div className="section-card">
        <div className="section-header">
          <h2><i className="fas fa-robot" style={{ marginRight: '8px' }}></i> Automatic System Checkout Records</h2>
          <div className="filter-bar">
            <input 
              type="text" 
              className="filter-input" 
              placeholder="🔍 Search name / ID" 
              value={autoNameSearch}
              onChange={(e) => setAutoNameSearch(e.target.value)}
            />
            <input 
              type="date" 
              className="filter-input" 
              value={autoDateFilter}
              onChange={(e) => setAutoDateFilter(e.target.value)}
            />
          </div>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>DATE</th>
                <th>EMP ID</th>
                <th>EMPLOYEE</th>
                <th>CHECK-IN</th>
                <th>AUTO CHECK-OUT</th>
                <th>HOURS</th>
                <th>STATUS</th>
                <th>SYSTEM REASON</th>
              </tr>
            </thead>
            <tbody>
              {autoCheckoutRecords.length > 0 ? (
                autoCheckoutRecords.slice(0, autoLimit).map(rec => (
                  <tr key={rec._id}>
                    <td>{rec.date}</td>
                    <td><strong>{rec.employeeId}</strong></td>
                    <td>{rec.employeeName}</td>
                    <td>{rec.checkIn}</td>
                    <td>{rec.checkOut}</td>
                    <td>{rec.workingHours}</td>
                    <td><span className="status-badge status-quarter">{rec.status}</span></td>
                    <td><span style={{ color: '#ea580c', fontWeight: 'bold' }}>{rec.statusReason}</span></td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" style={{ textAlign: 'center', color: '#64748b', padding: '20px' }}>
                    No automatic checkout records found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* View More / View Less for Auto-Checkout */}
        {autoCheckoutRecords.length > 5 && (
          <div style={{ display: 'flex', justifyContent: 'center', gap: '15px', marginTop: '1.2rem', paddingBottom: '0.8rem', flexWrap: 'wrap' }}>
            {autoLimit > 5 && (
              <button 
                className="g-button"
                style={{ background: '#475569', display: 'flex', alignItems: 'center', gap: '6px' }}
                onClick={() => setAutoLimit(prev => Math.max(5, prev - 5))}
              >
                <i className="fas fa-chevron-up"></i> View Less
              </button>
            )}
            {autoLimit < autoCheckoutRecords.length && (
              <button 
                className="g-button"
                style={{ background: '#1e5a7a', display: 'flex', alignItems: 'center', gap: '6px' }}
                onClick={() => setAutoLimit(prev => Math.min(autoCheckoutRecords.length, prev + 5))}
              >
                <i className="fas fa-chevron-down"></i> View More ({autoCheckoutRecords.length - autoLimit} remaining)
              </button>
            )}
          </div>
        )}
      </div>
      </>)}

      {/* ── 11. HOLIDAY MANAGEMENT (show('holidays')) ───────────────────────── */}
      {show('holidays') && (<>
      <div className="section-card">
        <div className="section-header">
          <h2><i className="fas fa-umbrella-beach" style={{ marginRight: '8px' }}></i> Company Holiday Management</h2>
          <button className="g-button success" onClick={() => {
            setSelectedHoliday(null)
            setIsHolidayOpen(true)
          }}>
            <i className="fas fa-plus"></i> Declare Holiday
          </button>
        </div>

        <div className="employee-stats-summary" style={{ background: '#f1f5f9', borderRadius: '20px', padding: '1.2rem', marginBottom: '1.5rem', display: 'flex', gap: '2.5rem', flexWrap: 'wrap', color: '#1e293b' }}>
          <div>
            <strong style={{ fontSize: '0.8rem', color: '#64748b', textTransform: 'uppercase' }}>📅 Holidays ({currentYear})</strong>
            <br />
            <span style={{ fontSize: '1.5rem', fontWeight: 800, color: '#1e5a7a' }}>{holidaysThisYear}</span>
          </div>
          <div>
            <strong style={{ fontSize: '0.8rem', color: '#64748b', textTransform: 'uppercase' }}>🔔 Next Holiday</strong>
            <br />
            <span style={{ fontSize: '1rem', fontWeight: 700, color: '#1e5a7a' }}>
              {nextHoliday ? `${nextHoliday.holidayName} (${nextHoliday.holidayDate})` : 'No upcoming holidays'}
            </span>
          </div>
        </div>

        <HolidayTable 
          holidays={holidays} 
          onEditClick={(holiday) => {
            setSelectedHoliday(holiday)
            setIsHolidayOpen(true)
          }} 
          onDeleteClick={handleDeleteHoliday} 
          isAdmin={true} 
        />
      </div>
      </>)}

      {/* ── 12. SYSTEM DATA MANAGEMENT (show('data')) ───────────────────────── */}
      {show('data') && (<>
      <div className="section-card">
        <div className="section-header">
          <h2><i className="fas fa-database" style={{ marginRight: '8px' }}></i> System Data Management & Purge Controls</h2>
        </div>
        <div className="action-buttons-group">
          <button className="g-button excel" onClick={handleExportAllAttendance}>
            <i className="fas fa-file-excel"></i> Export All Attendance
          </button>
          <button className="g-button success" onClick={handleExportEmployees}>
            <i className="fas fa-users"></i> Export Employees
          </button>
          <button className="g-button danger" onClick={handleClearAllAttendance}>
            <i className="fas fa-trash"></i> Clear All Attendance
          </button>
          <button className="g-button danger" onClick={handleDeleteAllEmployees} style={{ background: '#b91c1c' }}>
            <i className="fas fa-user-slash"></i> Delete All Employees
          </button>
        </div>
      </div>
      </>)}

      {/* ── Modals (always rendered, controlled by open state) ───────────── */}
      <AddEmployeeModal 
        isOpen={isAddOpen} 
        onClose={() => setIsAddOpen(false)} 
        onEmployeeAdded={fetchData} 
        showToast={showToast} 
      />

      <MarkAttendanceModal 
        isOpen={isMarkOpen} 
        onClose={() => {
          setIsMarkOpen(false)
          setSelectedEmp(null)
        }} 
        employee={selectedEmp} 
        onAttendanceMarked={fetchData} 
        showToast={showToast} 
      />

      <HolidayFormModal 
        isOpen={isHolidayOpen}
        onClose={() => {
          setIsHolidayOpen(false)
          setSelectedHoliday(null)
        }}
        onHolidaySaved={fetchData}
        holidayToEdit={selectedHoliday}
        showToast={showToast}
      />

      <EmployeeProfileModal
        isOpen={isProfileOpen}
        onClose={() => {
          setIsProfileOpen(false)
          setProfileEmp(null)
        }}
        employee={profileEmp}
        isAdmin={true}
        showToast={showToast}
        onUpdated={fetchData}
      />
    </div>
  )
}

export default AdminPanel
