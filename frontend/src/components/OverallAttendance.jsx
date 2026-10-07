import React, { useState, useEffect, useRef, useMemo } from 'react'
import Chart from 'chart.js/auto'
import * as XLSX from 'xlsx'
import { subscribeSyncEvents, SYNC_EVENTS } from '../utils/realtimeSync'

function OverallAttendance({ employees, attendance, liveSessions, holidays, onRefresh }) {
  // ── Date Range Helper ──────────────────────────────────────────────────────
  const getTodayStr = () => new Date().toISOString().split('T')[0]
  const getYesterdayStr = () => {
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    return yesterday.toISOString().split('T')[0]
  }

  // ── States ─────────────────────────────────────────────────────────────────
  const [filterType, setFilterType] = useState('today') // 'today' | 'yesterday' | 'week' | 'month' | 'custom'
  const [customStart, setCustomStart] = useState(getTodayStr())
  const [customEnd, setCustomEnd] = useState(getTodayStr())
  const [selectedDept, setSelectedDept] = useState('All')
  const [selectedEmp, setSelectedEmp] = useState('All')
  const [selectedStatus, setSelectedStatus] = useState('All')
  const [searchTerm, setSearchTerm] = useState('')
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1)
  const [rowsPerPage, setRowsPerPage] = useState(10)
  
  // Auto refresh (15 seconds, non-intrusive background sync)
  const REFRESH_INTERVAL_SEC = 15
  const [countdown, setCountdown] = useState(REFRESH_INTERVAL_SEC)
  const [isRefreshing, setIsRefreshing] = useState(false)

  // Chart refs
  const trendChartRef = useRef(null)
  const deptChartRef = useRef(null)
  const pieChartRef = useRef(null)

  const trendChartInstance = useRef(null)
  const deptChartInstance = useRef(null)
  const pieChartInstance = useRef(null)

  // ── Trigger auto refresh every 15s & on live attendance sync event ────────────
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          handleRefresh(false)
          return REFRESH_INTERVAL_SEC
        }
        return prev - 1
      })
    }, 1000)

    const unsubscribe = subscribeSyncEvents(() => {
      handleRefresh(false)
      setCountdown(REFRESH_INTERVAL_SEC)
    }, [SYNC_EVENTS.ATTENDANCE_UPDATED])

    return () => {
      clearInterval(timer)
      unsubscribe()
    }
  }, [onRefresh])

  const handleRefresh = async (isManual = false) => {
    if (isManual) setIsRefreshing(true)
    try {
      if (onRefresh) await onRefresh()
    } catch (err) {
      console.error('Error during attendance refresh:', err)
    } finally {
      if (isManual) {
        setTimeout(() => setIsRefreshing(false), 500)
      }
    }
  }

  // ── Timing utilities ───────────────────────────────────────────────────────
  const timeToMinutes = (timeStr) => {
    if (!timeStr || timeStr === '—') return null
    const [h, m] = timeStr.split(':').map(Number)
    return h * 60 + m
  }

  const parseWorkingHours = (hoursStr) => {
    if (!hoursStr || hoursStr === '—') return 0
    const hMatch = hoursStr.match(/(\d+)h/)
    const mMatch = hoursStr.match(/(\d+)m/)
    const h = hMatch ? parseInt(hMatch[1], 10) : 0
    const m = mMatch ? parseInt(mMatch[1], 10) : 0
    return h * 60 + m
  }

  const minutesToHoursStr = (totalMin) => {
    if (!totalMin) return '0h 0m'
    const h = Math.floor(totalMin / 60)
    const m = Math.round(totalMin % 60)
    return `${h}h ${m}m`
  }

  // Helper: Get list of dates in range
  const getDateRangeArray = (start, end) => {
    const dates = []
    let curr = new Date(start)
    const last = new Date(end)
    while (curr <= last) {
      dates.push(curr.toISOString().split('T')[0])
      curr.setDate(curr.getDate() + 1)
    }
    return dates
  }

  // ── Calculate Start & End Date based on filter selection ───────────────────
  const getDateRange = () => {
    const today = getTodayStr()
    if (filterType === 'today') {
      return { start: today, end: today }
    } else if (filterType === 'yesterday') {
      const yest = getYesterdayStr()
      return { start: yest, end: yest }
    } else if (filterType === 'week') {
      const startOfWeek = new Date()
      startOfWeek.setDate(startOfWeek.getDate() - 6) // Last 7 days
      return { start: startOfWeek.toISOString().split('T')[0], end: today }
    } else if (filterType === 'month') {
      const startOfMonth = new Date()
      startOfMonth.setDate(startOfMonth.getDate() - 29) // Last 30 days
      return { start: startOfMonth.toISOString().split('T')[0], end: today }
    } else {
      return { start: customStart, end: customEnd }
    }
  }

  const { start: dateRangeStart, end: dateRangeEnd } = getDateRange()

  // ── Virtual Attendance Grid Generator (Memoized to prevent render thrashing) ─
  const employeesList = useMemo(() => employees.filter(e => e.role === 'employee'), [employees])
  const dateList = useMemo(() => getDateRangeArray(dateRangeStart, dateRangeEnd), [dateRangeStart, dateRangeEnd])
  const todayStr = useMemo(() => getTodayStr(), [])

  const rawGrid = useMemo(() => {
    const grid = []
    dateList.forEach(dateStr => {
      employeesList.forEach(emp => {
        // Exclude if employee had not joined yet
        if (emp.joinDate && emp.joinDate > dateStr) return

        const attRecord = attendance.find(a => a.employeeEmail?.toLowerCase() === emp.email?.toLowerCase() && a.date === dateStr)
        const liveSession = (dateStr === todayStr) ? liveSessions.find(s => s.employeeEmail?.toLowerCase() === emp.email?.toLowerCase()) : null

        let status = 'Absent'
        let checkIn = '—'
        let checkOut = '—'
        let workingHours = '—'
        let markedBy = '—'

        if (attRecord) {
          checkIn = attRecord.checkIn || '—'
          checkOut = attRecord.checkOut || '—'
          workingHours = attRecord.workingHours || '—'
          markedBy = attRecord.markedBy || 'Employee'

          const inMin = timeToMinutes(checkIn)
          if (attRecord.status === 'half-day') {
            status = 'Half Day'
          } else if (inMin !== null && inMin > 10 * 60 + 15) { // late after 10:15 AM
            status = 'Late'
          } else if (attRecord.status === 'quarter-day') {
            status = 'Late'
          } else {
            status = 'Present'
          }
        } else if (liveSession) {
          checkIn = liveSession.checkInTime || '—'
          markedBy = liveSession.markedBy || 'Employee'
          const inMin = timeToMinutes(checkIn)
          if (inMin !== null && inMin > 10 * 60 + 15) {
            status = 'Late'
          } else {
            status = 'Present'
          }
        } else {
          const isHoliday = holidays.some(h => h.holidayDate === dateStr)
          const isSunday = new Date(dateStr).getDay() === 0

          if (isHoliday) {
            status = 'On Leave'
          } else if (isSunday) {
            status = 'Weekly Off'
          } else {
            status = 'Absent'
          }
        }

        grid.push({
          date: dateStr,
          employeeId: emp.empId,
          name: emp.name,
          email: emp.email,
          department: emp.department || '—',
          designation: emp.designation || 'Associate',
          checkIn,
          checkOut,
          workingHours,
          status,
          markedBy,
          live: !!liveSession
        })
      })
    })
    return grid
  }, [dateList, employeesList, attendance, liveSessions, holidays, todayStr])

  // ── Filtered Attendance Grid ──────────────────────────────────────────────
  const filteredGrid = useMemo(() => {
    const list = rawGrid.filter(row => {
      const matchesDept = selectedDept === 'All' ? true : row.department === selectedDept
      const matchesEmp = selectedEmp === 'All' ? true : row.email === selectedEmp
      const matchesStatus = selectedStatus === 'All' ? true : row.status === selectedStatus
      
      const search = searchTerm.toLowerCase()
      const matchesSearch = searchTerm === '' ? true : (
        row.name.toLowerCase().includes(search) ||
        row.employeeId.toLowerCase().includes(search) ||
        row.department.toLowerCase().includes(search)
      )

      return matchesDept && matchesEmp && matchesStatus && matchesSearch
    })

    list.sort((a, b) => b.date.localeCompare(a.date) || a.name.localeCompare(b.name))
    return list
  }, [rawGrid, selectedDept, selectedEmp, selectedStatus, searchTerm])

  // ── Stats Calculations (Real-time Today) ───────────────────────────────────
  const activeEmployeeCount = employeesList.filter(e => e.status === 'active').length
  
  const todayGrid = rawGrid.filter(r => r.date === todayStr)
  const currentlyWorking = liveSessions.length
  
  // Count Checked In and Checked Out from today's grid
  const presentToday = todayGrid.filter(r => ['Present', 'Late', 'Half Day'].includes(r.status)).length
  const lateToday = todayGrid.filter(r => r.status === 'Late').length
  const checkedOutToday = todayGrid.filter(r => r.checkOut !== '—').length
  const absentToday = todayGrid.filter(r => r.status === 'Absent').length
  const leaveToday = todayGrid.filter(r => r.status === 'On Leave').length
  
  const attendancePercentageToday = activeEmployeeCount > 0 
    ? Math.round((presentToday / activeEmployeeCount) * 100) 
    : 0

  // ── Summary Cards Calculations (Filtered Range Summary) ────────────────────
  const summaryDays = filteredGrid.filter(r => r.status !== 'Weekly Off')
  const totalWorkingDays = [...new Set(summaryDays.map(r => r.date))].length
  
  const presentDaysCount = filteredGrid.filter(r => ['Present', 'Late'].includes(r.status)).length
  const halfDaysCount = filteredGrid.filter(r => r.status === 'Half Day').length
  const absentDaysCount = filteredGrid.filter(r => r.status === 'Absent').length
  const lateDaysCount = filteredGrid.filter(r => r.status === 'Late').length
  const leaveDaysCount = filteredGrid.filter(r => r.status === 'On Leave').length
  
  // Total equivalent present days (Half Day counts as 0.5)
  const equivalentPresentDays = presentDaysCount + (halfDaysCount * 0.5)
  const totalPossibleDays = filteredGrid.filter(r => !['Weekly Off', 'On Leave'].includes(r.status)).length
  
  const rangeAttendancePercentage = totalPossibleDays > 0
    ? Math.round((equivalentPresentDays / totalPossibleDays) * 100)
    : 0

  // Average Working Hours (for present sessions with valid hours)
  const hoursSessions = filteredGrid.filter(r => r.workingHours && r.workingHours !== '—')
  const totalMinutes = hoursSessions.reduce((acc, curr) => acc + parseWorkingHours(curr.workingHours), 0)
  const averageWorkingMinutes = hoursSessions.length > 0 ? totalMinutes / hoursSessions.length : 0
  const averageWorkingHoursStr = minutesToHoursStr(averageWorkingMinutes)

  // ── Pagination ─────────────────────────────────────────────────────────────
  const totalRows = filteredGrid.length
  const totalPages = Math.ceil(totalRows / rowsPerPage) || 1
  const indexOfLastRow = currentPage * rowsPerPage
  const indexOfFirstRow = indexOfLastRow - rowsPerPage
  const paginatedRows = filteredGrid.slice(indexOfFirstRow, indexOfLastRow)

  useEffect(() => {
    setCurrentPage(1)
  }, [filterType, selectedDept, selectedEmp, selectedStatus, searchTerm, rowsPerPage])

  // ── Chart.js Analytics Implementation ──────────────────────────────────────
  useEffect(() => {
    // 1. Destroy old chart instances to avoid canvas overlap
    if (trendChartInstance.current) trendChartInstance.current.destroy()
    if (deptChartInstance.current) deptChartInstance.current.destroy()
    if (pieChartInstance.current) pieChartInstance.current.destroy()

    if (!trendChartRef.current || !deptChartRef.current || !pieChartRef.current) return

    // ── Chart Data Prep ──────────────────────────────────────────────────────
    // A. Daily/Weekly/Monthly Attendance Trend
    // Group rawGrid data in the selected range by date
    const dateGroups = {}
    rawGrid.forEach(row => {
      if (!dateGroups[row.date]) dateGroups[row.date] = { total: 0, present: 0 }
      if (row.status !== 'Weekly Off' && row.status !== 'On Leave') {
        dateGroups[row.date].total += 1
        if (['Present', 'Late', 'Half Day'].includes(row.status)) {
          dateGroups[row.date].present += (row.status === 'Half Day' ? 0.5 : 1)
        }
      }
    })

    const sortedDates = Object.keys(dateGroups).sort()
    const trendLabels = sortedDates.map(d => {
      const [yy, mm, dd] = d.split('-')
      return `${dd}/${mm}`
    })
    const trendData = sortedDates.map(d => {
      const g = dateGroups[d]
      return g.total > 0 ? Math.round((g.present / g.total) * 100) : 0
    })

    // B. Department-wise Attendance
    const deptGroups = {}
    filteredGrid.forEach(row => {
      if (row.status !== 'Weekly Off') {
        if (!deptGroups[row.department]) deptGroups[row.department] = { total: 0, present: 0 }
        deptGroups[row.department].total += 1
        if (['Present', 'Late', 'Half Day'].includes(row.status)) {
          deptGroups[row.department].present += (row.status === 'Half Day' ? 0.5 : 1)
        }
      }
    })
    const deptLabels = Object.keys(deptGroups)
    const deptData = deptLabels.map(dept => {
      const g = deptGroups[dept]
      return g.total > 0 ? Math.round((g.present / g.total) * 100) : 0
    })

    // C. Present vs Absent Pie Chart
    const totalPresentRange = filteredGrid.filter(r => ['Present', 'Late', 'Half Day'].includes(r.status)).length
    const totalAbsentRange = filteredGrid.filter(r => r.status === 'Absent').length

    // ── Update or Instantiate Chart.js Smoothly in-place ─────────────────────
    // Trend Line Chart
    if (trendChartInstance.current) {
      trendChartInstance.current.data.labels = trendLabels.length > 0 ? trendLabels : ['No Data']
      trendChartInstance.current.data.datasets[0].data = trendData.length > 0 ? trendData : [0]
      trendChartInstance.current.update('none')
    } else if (trendChartRef.current) {
      trendChartInstance.current = new Chart(trendChartRef.current.getContext('2d'), {
        type: 'line',
        data: {
          labels: trendLabels.length > 0 ? trendLabels : ['No Data'],
          datasets: [{
            label: 'Attendance Rate %',
            data: trendData.length > 0 ? trendData : [0],
            borderColor: '#1e5a7a',
            backgroundColor: 'rgba(30, 90, 122, 0.08)',
            fill: true,
            tension: 0.35,
            borderWidth: 2,
            pointRadius: 3
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          scales: {
            y: { min: 0, max: 100, grid: { color: '#f1f5f9' }, ticks: { color: '#64748b' } },
            x: { grid: { display: false }, ticks: { color: '#64748b' } }
          }
        }
      })
    }

    // Department Bar Chart
    if (deptChartInstance.current) {
      deptChartInstance.current.data.labels = deptLabels.length > 0 ? deptLabels : ['No Data']
      deptChartInstance.current.data.datasets[0].data = deptData.length > 0 ? deptData : [0]
      deptChartInstance.current.update('none')
    } else if (deptChartRef.current) {
      deptChartInstance.current = new Chart(deptChartRef.current.getContext('2d'), {
        type: 'bar',
        data: {
          labels: deptLabels.length > 0 ? deptLabels : ['No Data'],
          datasets: [{
            label: 'Present Rate %',
            data: deptData.length > 0 ? deptData : [0],
            backgroundColor: '#3b82f6',
            borderRadius: 6
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          scales: {
            y: { min: 0, max: 100, grid: { color: '#f1f5f9' }, ticks: { color: '#64748b' } },
            x: { grid: { display: false }, ticks: { color: '#64748b' } }
          }
        }
      })
    }

    // Pie/Doughnut Chart
    if (pieChartInstance.current) {
      pieChartInstance.current.data.datasets[0].data = [totalPresentRange, totalAbsentRange]
      pieChartInstance.current.update('none')
    } else if (pieChartRef.current) {
      pieChartInstance.current = new Chart(pieChartRef.current.getContext('2d'), {
        type: 'doughnut',
        data: {
          labels: ['Present', 'Absent'],
          datasets: [{
            data: [totalPresentRange, totalAbsentRange],
            backgroundColor: ['#10b981', '#f43f5e'],
            borderWidth: 0
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'bottom',
              labels: { color: '#64748b', boxWidth: 12 }
            }
          }
        }
      })
    }
  }, [filteredGrid, rawGrid])

  // Cleanup charts only on unmount
  useEffect(() => {
    return () => {
      if (trendChartInstance.current) {
        trendChartInstance.current.destroy()
        trendChartInstance.current = null
      }
      if (deptChartInstance.current) {
        deptChartInstance.current.destroy()
        deptChartInstance.current = null
      }
      if (pieChartInstance.current) {
        pieChartInstance.current.destroy()
        pieChartInstance.current = null
      }
    }
  }, [])

  // ── Exports Panel ──────────────────────────────────────────────────────────
  const handleExportExcel = () => {
    if (!filteredGrid.length) {
      alert('No data available to export')
      return
    }
    const exportData = filteredGrid.map(row => ({
      'Date': row.date,
      'Employee ID': row.employeeId,
      'Name': row.name,
      'Department': row.department,
      'Designation': row.designation,
      'Check-In': row.checkIn,
      'Check-Out': row.checkOut,
      'Working Hours': row.workingHours,
      'Status': row.status,
      'Marked By': row.markedBy
    }))
    const ws = XLSX.utils.json_to_sheet(exportData)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Attendance_Dashboard')
    XLSX.writeFile(wb, `Overall_Attendance_${getTodayStr()}.xlsx`)
  }

  const handleExportCSV = () => {
    if (!filteredGrid.length) {
      alert('No data available to export')
      return
    }
    const headers = ['Date', 'Employee ID', 'Name', 'Department', 'Designation', 'Check-In', 'Check-Out', 'Working Hours', 'Status', 'Marked By']
    const csvRows = [headers.join(',')]

    filteredGrid.forEach(row => {
      const values = [
        row.date,
        row.employeeId,
        `"${row.name}"`,
        row.department,
        row.designation,
        row.checkIn,
        row.checkOut,
        row.workingHours,
        row.status,
        row.markedBy
      ]
      csvRows.push(values.join(','))
    })

    const csvBlob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(csvBlob)
    link.setAttribute('href', url)
    link.setAttribute('download', `Overall_Attendance_${getTodayStr()}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handlePrint = () => {
    const printWindow = window.open('', '_blank')
    const html = `
      <html>
        <head>
          <title>Overall Attendance Report - Aparaitech Software</title>
          <style>
            body { font-family: 'Inter', sans-serif; padding: 2rem; color: #0f172a; }
            h1 { font-size: 1.6rem; margin-bottom: 0.5rem; text-align: center; }
            h3 { font-size: 1rem; color: #64748b; margin-bottom: 2rem; text-align: center; }
            table { width: 100%; border-collapse: collapse; margin-top: 1rem; }
            th, td { border: 1px solid #e2e8f0; padding: 10px; text-align: left; font-size: 0.85rem; }
            th { background-color: #f1f5f9; font-weight: bold; }
            tr:nth-child(even) { background-color: #f8fafc; }
            .badge { padding: 4px 8px; border-radius: 4px; font-weight: bold; font-size: 0.72rem; display: inline-block; }
            .badge-present { background-color: #d1fae5; color: #065f46; }
            .badge-absent { background-color: #fee2e2; color: #991b1b; }
            .badge-late { background-color: #fef3c7; color: #92400e; }
            .badge-leave { background-color: #dbeafe; color: #1e40af; }
            .badge-half { background-color: #f3e8ff; color: #6b21a8; }
          </style>
        </head>
        <body>
          <h1>Overall Attendance Report</h1>
          <h3>Generated on ${new Date().toLocaleDateString('en-IN')} | Date Range: ${dateRangeStart} to ${dateRangeEnd}</h3>
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Employee ID</th>
                <th>Name</th>
                <th>Department</th>
                <th>Check-In</th>
                <th>Check-Out</th>
                <th>Hours</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              ${filteredGrid.map(row => `
                <tr>
                  <td>${row.date}</td>
                  <td>${row.employeeId}</td>
                  <td>${row.name}</td>
                  <td>${row.department}</td>
                  <td>${row.checkIn}</td>
                  <td>${row.checkOut}</td>
                  <td>${row.workingHours}</td>
                  <td>
                    <span class="badge ${
                      row.status === 'Present' ? 'badge-present' :
                      row.status === 'Absent' ? 'badge-absent' :
                      row.status === 'Late' ? 'badge-late' :
                      row.status === 'On Leave' ? 'badge-leave' : 'badge-half'
                    }">${row.status}</span>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          <script>
            window.onload = function() {
              window.print();
              window.close();
            }
          </script>
        </body>
      </html>
    `
    printWindow.document.write(html)
    printWindow.document.close()
  }

  // ── Render Badge Helpers ───────────────────────────────────────────────────
  const getStatusBadge = (status, isLive) => {
    const badgeStyle = {
      padding: '4px 10px',
      borderRadius: '20px',
      fontSize: '0.74rem',
      fontWeight: '700',
      display: 'inline-flex',
      alignItems: 'center',
      gap: '5px',
      boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
    }

    if (isLive) {
      return (
        <span style={{ ...badgeStyle, background: '#d1fae5', color: '#065f46', border: '1px solid #10b98130' }}>
          <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10b981', display: 'inline-block', animation: 'pulse 1.5s infinite' }}></span>
          Online
        </span>
      )
    }

    switch (status) {
      case 'Present':
        return <span style={{ ...badgeStyle, background: '#d1fae5', color: '#065f46', border: '1px solid #10b98120' }}>Present</span>
      case 'Absent':
        return <span style={{ ...badgeStyle, background: '#fee2e2', color: '#991b1b', border: '1px solid #ef444420' }}>Absent</span>
      case 'Late':
        return <span style={{ ...badgeStyle, background: '#fef3c7', color: '#92400e', border: '1px solid #f59e0b20' }}>Late</span>
      case 'On Leave':
        return <span style={{ ...badgeStyle, background: '#dbeafe', color: '#1e40af', border: '1px solid #3b82f620' }}>On Leave</span>
      case 'Half Day':
        return <span style={{ ...badgeStyle, background: '#f3e8ff', color: '#6b21a8', border: '1px solid #a855f720' }}>Half Day</span>
      case 'Weekly Off':
        return <span style={{ ...badgeStyle, background: '#f1f5f9', color: '#475569', border: '1px solid #cbd5e120' }}>Weekly Off</span>
      default:
        return <span style={{ ...badgeStyle, background: '#e2e8f0', color: '#475569' }}>{status}</span>
    }
  }

  // Get department unique list
  const deptsList = ['All', ...new Set(employeesList.map(e => e.department))]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.8rem' }}>
      
      {/* ── Real-Time Status & Statistics Grid ─────────────────────────────── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#10b981', display: 'inline-block', animation: 'pulse 1.2s infinite' }}></span>
          Real-Time Attendance Overview (Today)
        </h2>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '0.76rem', color: '#64748b', fontWeight: 600, background: '#f1f5f9', padding: '6px 12px', borderRadius: '20px', border: '1px solid #cbd5e150' }}>
            🔄 Auto-refreshing in <strong style={{ color: '#1e5a7a' }}>{countdown}s</strong>
          </span>
          <button 
            onClick={() => handleRefresh(true)} 
            className="sidebar-nav-btn"
            style={{ padding: '6px 12px', fontSize: '0.76rem', background: '#1e5a7a', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600 }}
          >
            <i className={`fas fa-sync ${isRefreshing ? 'fa-spin' : ''}`}></i> Refresh Now
          </button>
        </div>
      </div>

      <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
        <div className="stat-card" style={{ padding: '1.25rem' }}>
          <div className="icon" style={{ background: '#e0f2fe', color: '#0284c7' }}>👥</div>
          <div className="value" style={{ fontSize: '1.75rem', fontWeight: 800 }}>{activeEmployeeCount}</div>
          <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 500 }}>Total Employees</div>
        </div>
        <div className="stat-card" style={{ padding: '1.25rem' }}>
          <div className="icon" style={{ background: '#d1fae5', color: '#059669' }}>🟢</div>
          <div className="value" style={{ fontSize: '1.75rem', fontWeight: 800, color: '#059669' }}>{presentToday}</div>
          <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 500 }}>Present Today</div>
        </div>
        <div className="stat-card" style={{ padding: '1.25rem' }}>
          <div className="icon" style={{ background: '#fee2e2', color: '#dc2626' }}>🔴</div>
          <div className="value" style={{ fontSize: '1.75rem', fontWeight: 800, color: '#dc2626' }}>{absentToday}</div>
          <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 500 }}>Absent Today</div>
        </div>
        <div className="stat-card" style={{ padding: '1.25rem' }}>
          <div className="icon" style={{ background: '#fef3c7', color: '#d97706' }}>🟡</div>
          <div className="value" style={{ fontSize: '1.75rem', fontWeight: 800, color: '#d97706' }}>{lateToday}</div>
          <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 500 }}>Late Today</div>
        </div>
        <div className="stat-card" style={{ padding: '1.25rem' }}>
          <div className="icon" style={{ background: '#dbeafe', color: '#2563eb' }}>🏖️</div>
          <div className="value" style={{ fontSize: '1.75rem', fontWeight: 800, color: '#2563eb' }}>{leaveToday}</div>
          <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 500 }}>On Leave Today</div>
        </div>
        <div className="stat-card" style={{ padding: '1.25rem' }}>
          <div className="icon" style={{ background: '#f3e8ff', color: '#7c3aed' }}>💼</div>
          <div className="value" style={{ fontSize: '1.75rem', fontWeight: 800, color: '#7c3aed' }}>{currentlyWorking}</div>
          <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 500 }}>Currently Working</div>
        </div>
        <div className="stat-card" style={{ padding: '1.25rem' }}>
          <div className="icon" style={{ background: '#f8fafc', color: '#475569' }}>🏁</div>
          <div className="value" style={{ fontSize: '1.75rem', fontWeight: 800 }}>{checkedOutToday}</div>
          <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 500 }}>Checked Out</div>
        </div>
        <div className="stat-card" style={{ padding: '1.25rem', background: 'linear-gradient(135deg, #1e5a7a, #0f2b3d)', color: 'white' }}>
          <div className="icon" style={{ background: '#ffffff30', color: 'white' }}>📊</div>
          <div className="value" style={{ fontSize: '1.75rem', fontWeight: 800, color: 'white' }}>{attendancePercentageToday}%</div>
          <div style={{ fontSize: '0.8rem', color: '#cbd5e1', fontWeight: 500 }}>Attendance Rate</div>
        </div>
      </div>

      {/* ── Filters Panel ──────────────────────────────────────────────────────── */}
      <div className="section-card" style={{ padding: '1.5rem', borderRadius: '18px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #f1f5f9', paddingBottom: '12px', marginBottom: '14px' }}>
          <h3 style={{ fontSize: '0.94rem', fontWeight: 700, color: '#0f172a', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <i className="fas fa-filter" style={{ color: '#1e5a7a' }}></i> Dashboard Filters & Controls
          </h3>
          <div style={{ display: 'flex', gap: '6px' }}>
            {['today', 'yesterday', 'week', 'month', 'custom'].map(type => (
              <button
                key={type}
                onClick={() => setFilterType(type)}
                style={{
                  padding: '6px 12px',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  background: filterType === type ? '#1e5a7a' : '#ffffff',
                  color: filterType === type ? '#ffffff' : '#64748b',
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  textTransform: 'capitalize'
                }}
              >
                {type === 'week' ? 'Last 7 Days' : type === 'month' ? 'Last 30 Days' : type}
              </button>
            ))}
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', alignItems: 'end' }}>
          {filterType === 'custom' && (
            <>
              <div>
                <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: '6px' }}>Start Date</label>
                <input type="date" className="filter-input" value={customStart} onChange={(e) => setCustomStart(e.target.value)} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: '6px' }}>End Date</label>
                <input type="date" className="filter-input" value={customEnd} onChange={(e) => setCustomEnd(e.target.value)} />
              </div>
            </>
          )}

          <div>
            <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: '6px' }}>Department</label>
            <select className="filter-input" value={selectedDept} onChange={(e) => setSelectedDept(e.target.value)}>
              {deptsList.map(dept => <option key={dept} value={dept}>{dept}</option>)}
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: '6px' }}>Employee</label>
            <select className="filter-input" value={selectedEmp} onChange={(e) => setSelectedEmp(e.target.value)}>
              <option value="All">All Employees</option>
              {employeesList.map(emp => <option key={emp.email} value={emp.email}>{emp.name} ({emp.empId})</option>)}
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: '6px' }}>Attendance Status</label>
            <select className="filter-input" value={selectedStatus} onChange={(e) => setSelectedStatus(e.target.value)}>
              <option value="All">All Statuses</option>
              <option value="Present">Present</option>
              <option value="Absent">Absent</option>
              <option value="Late">Late Check-in</option>
              <option value="On Leave">On Leave</option>
              <option value="Half Day">Half Day</option>
              <option value="Weekly Off">Weekly Off</option>
            </select>
          </div>
        </div>
      </div>

      {/* ── Summary Statistics Cards (Range Specific) ────────────────────────── */}
      <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '1rem' }}>
        <div className="stat-card" style={{ background: '#f8fafc', border: '1px dashed #cbd5e1' }}>
          <div style={{ fontSize: '0.74rem', color: '#64748b', fontWeight: 700 }}>RANGE ATTENDANCE %</div>
          <div className="value" style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a' }}>{rangeAttendancePercentage}%</div>
        </div>
        <div className="stat-card" style={{ background: '#f8fafc', border: '1px dashed #cbd5e1' }}>
          <div style={{ fontSize: '0.74rem', color: '#64748b', fontWeight: 700 }}>TOTAL WORKING DAYS</div>
          <div className="value" style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a' }}>{totalWorkingDays}</div>
        </div>
        <div className="stat-card" style={{ background: '#f8fafc', border: '1px dashed #cbd5e1' }}>
          <div style={{ fontSize: '0.74rem', color: '#64748b', fontWeight: 700 }}>PRESENT DAYS</div>
          <div className="value" style={{ fontSize: '1.5rem', fontWeight: 800, color: '#10b981' }}>{presentDaysCount + halfDaysCount}</div>
        </div>
        <div className="stat-card" style={{ background: '#f8fafc', border: '1px dashed #cbd5e1' }}>
          <div style={{ fontSize: '0.74rem', color: '#64748b', fontWeight: 700 }}>ABSENT DAYS</div>
          <div className="value" style={{ fontSize: '1.5rem', fontWeight: 800, color: '#f43f5e' }}>{absentDaysCount}</div>
        </div>
        <div className="stat-card" style={{ background: '#f8fafc', border: '1px dashed #cbd5e1' }}>
          <div style={{ fontSize: '0.74rem', color: '#64748b', fontWeight: 700 }}>LATE DAYS</div>
          <div className="value" style={{ fontSize: '1.5rem', fontWeight: 800, color: '#d97706' }}>{lateDaysCount}</div>
        </div>
        <div className="stat-card" style={{ background: '#f8fafc', border: '1px dashed #cbd5e1' }}>
          <div style={{ fontSize: '0.74rem', color: '#64748b', fontWeight: 700 }}>LEAVE DAYS</div>
          <div className="value" style={{ fontSize: '1.5rem', fontWeight: 800, color: '#3b82f6' }}>{leaveDaysCount}</div>
        </div>
        <div className="stat-card" style={{ background: '#f8fafc', border: '1px dashed #cbd5e1' }}>
          <div style={{ fontSize: '0.74rem', color: '#64748b', fontWeight: 700 }}>AVG WORKING HOURS</div>
          <div className="value" style={{ fontSize: '1.5rem', fontWeight: 800, color: '#7c3aed' }}>{averageWorkingHoursStr}</div>
        </div>
      </div>

      {/* ── Attendance Charts & Analytics ──────────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
        
        {/* Daily/Range Attendance rate trend */}
        <div className="section-card" style={{ padding: '1.25rem', height: '320px', display: 'flex', flexDirection: 'column' }}>
          <div className="section-header" style={{ marginBottom: '10px' }}>
            <h2 style={{ fontSize: '0.94rem', fontWeight: 700 }}><i className="fas fa-chart-line" style={{ color: '#1e5a7a', marginRight: '6px' }}></i> Attendance rate trend</h2>
          </div>
          <div style={{ flex: 1, position: 'relative' }}>
            <canvas ref={trendChartRef}></canvas>
          </div>
        </div>

        {/* Department-wise attendance */}
        <div className="section-card" style={{ padding: '1.25rem', height: '320px', display: 'flex', flexDirection: 'column' }}>
          <div className="section-header" style={{ marginBottom: '10px' }}>
            <h2 style={{ fontSize: '0.94rem', fontWeight: 700 }}><i className="fas fa-chart-bar" style={{ color: '#3b82f6', marginRight: '6px' }}></i> Department-wise Attendance Rate</h2>
          </div>
          <div style={{ flex: 1, position: 'relative' }}>
            <canvas ref={deptChartRef}></canvas>
          </div>
        </div>

        {/* Present vs Absent Pie */}
        <div className="section-card" style={{ padding: '1.25rem', height: '320px', display: 'flex', flexDirection: 'column' }}>
          <div className="section-header" style={{ marginBottom: '10px' }}>
            <h2 style={{ fontSize: '0.94rem', fontWeight: 700 }}><i className="fas fa-chart-pie" style={{ color: '#10b981', marginRight: '6px' }}></i> Present vs Absent Overview</h2>
          </div>
          <div style={{ flex: 1, position: 'relative' }}>
            <canvas ref={pieChartRef}></canvas>
          </div>
        </div>

      </div>

      {/* ── Searchable Attendance Table Card ────────────────────────────────────── */}
      <div className="section-card" style={{ borderRadius: '18px' }}>
        <div className="section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <h2 style={{ margin: 0, fontSize: '0.94rem', fontWeight: 700 }}>
              <i className="fas fa-table" style={{ color: '#1e5a7a', marginRight: '6px' }}></i> Master Attendance Grid
            </h2>
            <span style={{ fontSize: '0.72rem', background: '#e2e8f0', color: '#475569', padding: '3px 8px', borderRadius: '12px', fontWeight: 600 }}>
              {filteredGrid.length} records found
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            {/* Search Input */}
            <input
              type="text"
              className="filter-input"
              placeholder="🔍 Search Name / Emp ID / Dept"
              style={{ width: '240px', padding: '8px 12px', fontSize: '0.84rem' }}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />

            {/* Export Buttons */}
            <div style={{ display: 'flex', gap: '5px' }}>
              <button onClick={handleExportExcel} className="sidebar-nav-btn" style={{ padding: '8px 12px', fontSize: '0.8rem', background: '#16a34a', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                <i className="fas fa-file-excel"></i> Excel
              </button>
              <button onClick={handleExportCSV} className="sidebar-nav-btn" style={{ padding: '8px 12px', fontSize: '0.8rem', background: '#2563eb', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                <i className="fas fa-file-csv"></i> CSV
              </button>
              <button onClick={handlePrint} className="sidebar-nav-btn" style={{ padding: '8px 12px', fontSize: '0.8rem', background: '#475569', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                <i className="fas fa-print"></i> Print Report
              </button>
            </div>
          </div>
        </div>

        {/* Loading Skeleton only on initial load when data is empty */}
        {employees.length === 0 && (!attendance || attendance.length === 0) ? (
          <div style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} style={{ height: '40px', background: '#f1f5f9', borderRadius: '8px', animation: 'pulse 1.5s infinite' }}></div>
            ))}
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>DATE</th>
                  <th>EMPLOYEE</th>
                  <th>EMP ID</th>
                  <th>DEPARTMENT</th>
                  <th>DESIGNATION</th>
                  <th>CHECK-IN</th>
                  <th>CHECK-OUT</th>
                  <th>WORKING HOURS</th>
                  <th>MARKED BY</th>
                  <th>ATTENDANCE STATUS</th>
                </tr>
              </thead>
              <tbody>
                {paginatedRows.length > 0 ? (
                  paginatedRows.map((row, idx) => {
                    const [yr, mo, dy] = row.date.split('-')
                    const formattedDate = `${dy}-${mo}-${yr}`

                    return (
                      <tr key={`${row.email}_${row.date}_${idx}`}>
                        <td style={{ fontWeight: 600, color: '#334155', fontSize: '0.84rem' }}>{formattedDate}</td>
                        <td style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.84rem' }}>{row.name}</td>
                        <td style={{ fontSize: '0.84rem' }}>{row.employeeId}</td>
                        <td style={{ fontSize: '0.84rem' }}>{row.department}</td>
                        <td style={{ fontSize: '0.84rem', color: '#64748b' }}>{row.designation}</td>
                        <td style={{ fontSize: '0.84rem', color: '#0284c7', fontWeight: 600 }}>{row.checkIn}</td>
                        <td style={{ fontSize: '0.84rem', color: '#0f2b3d', fontWeight: 600 }}>{row.checkOut}</td>
                        <td style={{ fontSize: '0.84rem', fontWeight: 600 }}>{row.workingHours}</td>
                        <td style={{ fontSize: '0.84rem', color: '#64748b' }}>{row.markedBy}</td>
                        <td>{getStatusBadge(row.status, row.live)}</td>
                      </tr>
                    )
                  })
                ) : (
                  <tr>
                    <td colSpan="10" style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8', fontWeight: 500 }}>
                      <div style={{ fontSize: '2.5rem', marginBottom: '10px' }}>📁</div>
                      No attendance records found matching filters
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Panel */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 1.5rem', borderTop: '1px solid #e2e8f0', flexWrap: 'wrap', gap: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.82rem', color: '#64748b' }}>
            <span>Rows per page:</span>
            <select
              value={rowsPerPage}
              onChange={(e) => {
                setRowsPerPage(parseInt(e.target.value, 10))
                setCurrentPage(1)
              }}
              style={{ padding: '4px 8px', borderRadius: '6px', border: '1px solid #cbd5e1', outline: 'none' }}
            >
              {[10, 25, 50, 100].map(size => <option key={size} value={size}>{size}</option>)}
            </select>
            <span style={{ marginLeft: '10px' }}>
              Showing {indexOfFirstRow + 1} - {Math.min(indexOfLastRow, totalRows)} of {totalRows} records
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <button
              onClick={() => setCurrentPage(1)}
              disabled={currentPage === 1}
              style={{
                padding: '6px 10px',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                background: '#ffffff',
                cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                opacity: currentPage === 1 ? 0.5 : 1,
                fontSize: '0.8rem'
              }}
            >
              First
            </button>
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              style={{
                padding: '6px 10px',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                background: '#ffffff',
                cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                opacity: currentPage === 1 ? 0.5 : 1,
                fontSize: '0.8rem'
              }}
            >
              Previous
            </button>
            <span style={{ fontSize: '0.82rem', color: '#475569', fontWeight: 600, padding: '0 8px' }}>
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              style={{
                padding: '6px 10px',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                background: '#ffffff',
                cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                opacity: currentPage === totalPages ? 0.5 : 1,
                fontSize: '0.8rem'
              }}
            >
              Next
            </button>
            <button
              onClick={() => setCurrentPage(totalPages)}
              disabled={currentPage === totalPages}
              style={{
                padding: '6px 10px',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                background: '#ffffff',
                cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                opacity: currentPage === totalPages ? 0.5 : 1,
                fontSize: '0.8rem'
              }}
            >
              Last
            </button>
          </div>
        </div>

      </div>

    </div>
  )
}

export default OverallAttendance
