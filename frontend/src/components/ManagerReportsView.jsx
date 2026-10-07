import React, { useState, useEffect } from 'react'
import { analyticsAPI, reportsAPI } from '../services/api'
import { useAutoRefresh, SYNC_EVENTS } from '../utils/realtimeSync'

function ManagerReportsView({ currentUser, showToast }) {
  const [loading, setLoading] = useState(true)
  const [teamOverview, setTeamOverview] = useState(null)
  const [dailyReports, setDailyReports] = useState([])
  const [mailBlastReports, setMailBlastReports] = useState([])
  const [activeTab, setActiveTab] = useState('pending') // 'pending' | 'submitted' | 'mailBlast'
  const [filterDate, setFilterDate] = useState(() => new Date().toISOString().split('T')[0])
  const [search, setSearch] = useState('')

  const fetchReports = async (isSilent = false) => {
    if (!isSilent) setLoading(true)
    try {
      const overviewRes = await analyticsAPI.getTeamOverview()
      if (overviewRes?.success) setTeamOverview(overviewRes.data)

      const dailyRes = await reportsAPI.getDaily({ date: filterDate, search })
      if (dailyRes?.success) setDailyReports(dailyRes.data || [])

      const mailRes = await reportsAPI.getMailBlast({ date: filterDate, search })
      if (mailRes?.success) setMailBlastReports(mailRes.data || [])
    } catch (err) {
      console.error('Manager reports error:', err)
      if (!isSilent) showToast('❌ Failed to fetch manager overview data', '#dc2626')
    } finally {
      if (!isSilent) setLoading(false)
    }
  }

  useEffect(() => {
    fetchReports(false)
  }, [filterDate])

  // Live Auto-Refresh every 5 seconds, on window focus, and on DAILY_REPORT_SUBMITTED
  useAutoRefresh(() => {
    fetchReports(true)
  }, {
    intervalMs: 5000,
    eventTypes: [SYNC_EVENTS.DAILY_REPORT_SUBMITTED],
    onFocus: true,
    enabled: true
  })

  const exportDailyCSV = () => {
    if (dailyReports.length === 0) {
      showToast('⚠️ No records to export', '#f59e0b')
      return
    }
    const headers = ['Date', 'Time', 'Employee Name', 'Emp ID', 'Team', 'Connected Calls', 'Calls >3m', 'Groups Created', 'Group Members', 'Conversions', 'Revenue (INR)', 'Remarks']
    const rows = dailyReports.map(r => [
      r.reportDate,
      r.reportTime,
      `"${r.employeeName}"`,
      r.employeeId,
      r.teamName,
      r.connectedCalls,
      r.callsAbove3Min,
      r.groupsCreated,
      r.membersInGroups,
      r.todayConversions,
      r.revenue,
      `"${(r.remarks || '').replace(/"/g, '""')}"`
    ])
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n')
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement('a')
    link.setAttribute('href', encodedUri)
    link.setAttribute('download', `Aparaitech_Team_Daily_Reports_${filterDate}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    showToast('📊 Daily reports exported', '#22c55e')
  }

  const exportMailCSV = () => {
    if (mailBlastReports.length === 0) {
      showToast('⚠️ No records to export', '#f59e0b')
      return
    }
    const headers = ['Date', 'Time', 'Employee Name', 'Emp ID', 'Team', 'Emails Sent', 'Target Type', 'College Name', 'Template', 'Responses', 'Bounces', 'Status', 'Remarks']
    const rows = mailBlastReports.map(m => [
      m.reportDate,
      m.reportTime,
      `"${m.employeeName}"`,
      m.employeeId,
      m.teamName,
      m.emailsSent,
      m.targetType,
      `"${m.collegeName || ''}"`,
      `"${m.templateUsed || ''}"`,
      m.responsesReceived,
      m.bounceCount,
      m.status,
      `"${(m.remarks || '').replace(/"/g, '""')}"`
    ])
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n')
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement('a')
    link.setAttribute('href', encodedUri)
    link.setAttribute('download', `Aparaitech_Team_Mail_Blast_${filterDate}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    showToast('📊 Mail blast reports exported', '#22c55e')
  }

  const metrics = teamOverview?.metrics || {}

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', width: '100%' }}>
      {/* Top Banner */}
      <div style={{
        background: 'linear-gradient(135deg, #0a192f 0%, #0f172a 100%)',
        borderRadius: '24px',
        padding: '2rem 2.25rem',
        color: '#ffffff',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '1rem',
        border: '1px solid rgba(255, 255, 255, 0.1)'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <span style={{
              background: '#0284c7',
              color: '#ffffff',
              padding: '4px 12px',
              borderRadius: '20px',
              fontSize: '0.74rem',
              fontWeight: '700',
              textTransform: 'uppercase',
              letterSpacing: '0.08em'
            }}>
              Manager & HR Command Center
            </span>
          </div>
          <h1 style={{ margin: 0, fontSize: '1.85rem', fontWeight: '800', letterSpacing: '-0.02em' }}>
            Team Reports & Compliance Overview
          </h1>
          <p style={{ margin: '6px 0 0', fontSize: '0.9rem', color: '#cbd5e1' }}>
            Monitor daily employee submissions, pending compliance alerts, outreach logs, and commercial conversions
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={fetchReports}
            style={{
              background: '#1e293b',
              color: '#ffffff',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              padding: '10px 18px',
              borderRadius: '12px',
              fontWeight: '700',
              fontSize: '0.85rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <i className="fas fa-sync-alt"></i> Refresh Data
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '1rem'
      }}>
        <div style={{ background: '#ffffff', borderRadius: '16px', padding: '1.25rem', border: '1px solid #e2e8f0' }}>
          <div style={{ color: '#64748b', fontSize: '0.75rem', fontWeight: '700' }}>TOTAL ACTIVE TEAM</div>
          <div style={{ fontSize: '1.8rem', fontWeight: '800', color: '#0a192f', marginTop: '6px' }}>
            {metrics.totalActiveEmployees || 0}
          </div>
          <div style={{ fontSize: '0.76rem', color: '#64748b' }}>Registered active staff</div>
        </div>

        <div style={{ background: '#ffffff', borderRadius: '16px', padding: '1.25rem', border: '1px solid #e2e8f0' }}>
          <div style={{ color: '#64748b', fontSize: '0.75rem', fontWeight: '700' }}>CHECKED IN TODAY</div>
          <div style={{ fontSize: '1.8rem', fontWeight: '800', color: '#2563eb', marginTop: '6px' }}>
            {metrics.checkedInToday || 0}
          </div>
          <div style={{ fontSize: '0.76rem', color: '#64748b' }}>Present at office/shift</div>
        </div>

        <div style={{ background: '#ffffff', borderRadius: '16px', padding: '1.25rem', border: '1px solid #e2e8f0' }}>
          <div style={{ color: '#64748b', fontSize: '0.75rem', fontWeight: '700' }}>REPORTS SUBMITTED</div>
          <div style={{ fontSize: '1.8rem', fontWeight: '800', color: '#059669', marginTop: '6px' }}>
            {metrics.reportsSubmitted || 0}
          </div>
          <div style={{ fontSize: '0.76rem', color: '#059669', fontWeight: '600' }}>Daily reports filed</div>
        </div>

        <div style={{ background: metrics.reportsPending > 0 ? '#fef2f2' : '#ffffff', borderRadius: '16px', padding: '1.25rem', border: `1px solid ${metrics.reportsPending > 0 ? '#fecaca' : '#e2e8f0'}` }}>
          <div style={{ color: metrics.reportsPending > 0 ? '#dc2626' : '#64748b', fontSize: '0.75rem', fontWeight: '700' }}>REPORTS PENDING</div>
          <div style={{ fontSize: '1.8rem', fontWeight: '800', color: metrics.reportsPending > 0 ? '#dc2626' : '#0a192f', marginTop: '6px' }}>
            {metrics.reportsPending || 0}
          </div>
          <div style={{ fontSize: '0.76rem', color: metrics.reportsPending > 0 ? '#ef4444' : '#64748b', fontWeight: '600' }}>
            {metrics.reportsPending > 0 ? 'Requires attention!' : 'All clear'}
          </div>
        </div>

        <div style={{ background: '#eff6ff', borderRadius: '16px', padding: '1.25rem', border: '1px solid #bfdbfe' }}>
          <div style={{ color: '#1e40af', fontSize: '0.75rem', fontWeight: '700' }}>TODAY'S TEAM REVENUE</div>
          <div style={{ fontSize: '1.8rem', fontWeight: '900', color: '#1d4ed8', marginTop: '6px' }}>
            ₹{(metrics.todayRevenue || 0).toLocaleString('en-IN')}
          </div>
          <div style={{ fontSize: '0.76rem', color: '#1e40af' }}>
            {metrics.todayConversions || 0} conversions today
          </div>
        </div>
      </div>

      {/* Filter and Tab Bar */}
      <div style={{
        background: '#ffffff',
        borderRadius: '16px',
        padding: '1rem',
        border: '1px solid #e2e8f0',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '12px'
      }}>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={() => setActiveTab('pending')}
            style={{
              padding: '8px 16px',
              borderRadius: '10px',
              border: 'none',
              background: activeTab === 'pending' ? '#ef4444' : '#f8fafc',
              color: activeTab === 'pending' ? '#ffffff' : '#64748b',
              fontWeight: '700',
              fontSize: '0.84rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <i className="fas fa-exclamation-circle"></i> Pending Reports ({teamOverview?.pendingEmployees?.length || 0})
          </button>

          <button
            onClick={() => setActiveTab('submitted')}
            style={{
              padding: '8px 16px',
              borderRadius: '10px',
              border: 'none',
              background: activeTab === 'submitted' ? '#0a192f' : '#f8fafc',
              color: activeTab === 'submitted' ? '#ffffff' : '#64748b',
              fontWeight: '700',
              fontSize: '0.84rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <i className="fas fa-check-double"></i> Submitted Daily Reports ({dailyReports.length})
          </button>

          <button
            onClick={() => setActiveTab('mailBlast')}
            style={{
              padding: '8px 16px',
              borderRadius: '10px',
              border: 'none',
              background: activeTab === 'mailBlast' ? '#0284c7' : '#f8fafc',
              color: activeTab === 'mailBlast' ? '#ffffff' : '#64748b',
              fontWeight: '700',
              fontSize: '0.84rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <i className="fas fa-mail-bulk"></i> Mail Blast Campaign Logs ({mailBlastReports.length})
          </button>
        </div>

        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <input
            type="date"
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
            style={{
              padding: '7px 12px',
              borderRadius: '8px',
              border: '1px solid #cbd5e1',
              fontSize: '0.84rem'
            }}
          />
          {activeTab === 'submitted' && (
            <button
              onClick={exportDailyCSV}
              style={{
                background: '#10b981',
                color: '#ffffff',
                border: 'none',
                padding: '8px 14px',
                borderRadius: '8px',
                fontWeight: '700',
                fontSize: '0.82rem',
                cursor: 'pointer'
              }}
            >
              Export CSV
            </button>
          )}
          {activeTab === 'mailBlast' && (
            <button
              onClick={exportMailCSV}
              style={{
                background: '#10b981',
                color: '#ffffff',
                border: 'none',
                padding: '8px 14px',
                borderRadius: '8px',
                fontWeight: '700',
                fontSize: '0.82rem',
                cursor: 'pointer'
              }}
            >
              Export CSV
            </button>
          )}
        </div>
      </div>

      {/* TAB 1: PENDING EMPLOYEES */}
      {activeTab === 'pending' && (
        <div style={{ background: '#ffffff', borderRadius: '20px', padding: '1.5rem', border: '1px solid #e2e8f0' }}>
          <div style={{ marginBottom: '1rem', fontWeight: '700', fontSize: '1rem', color: '#dc2626', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <i className="fas fa-user-clock"></i>
            Active Employees with Pending Daily Report Submissions (Today: {teamOverview?.date || filterDate})
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table className="data-table" style={{ width: '100%', fontSize: '0.85rem' }}>
              <thead>
                <tr>
                  <th>EMPLOYEE</th>
                  <th>DEPARTMENT / TEAM</th>
                  <th>ATTENDANCE TODAY</th>
                  <th>CHECK-IN TIME</th>
                  <th>ASSIGNED SHIFT</th>
                  <th>STATUS</th>
                </tr>
              </thead>
              <tbody>
                {(!teamOverview?.pendingEmployees || teamOverview.pendingEmployees.length === 0) ? (
                  <tr>
                    <td colSpan="6" style={{ textAlign: 'center', padding: '2rem', color: '#16a34a', fontWeight: '700' }}>
                      🎉 Excellent! All active employees have submitted their daily reports!
                    </td>
                  </tr>
                ) : (
                  teamOverview.pendingEmployees.map(emp => (
                    <tr key={emp.email}>
                      <td>
                        <strong style={{ color: '#0a192f' }}>{emp.name}</strong>
                        <div style={{ fontSize: '0.72rem', color: '#64748b' }}>{emp.email} • {emp.empId}</div>
                      </td>
                      <td>{emp.team}</td>
                      <td>
                        <span style={{
                          background: emp.checkedIn ? '#dcfce7' : '#fee2e2',
                          color: emp.checkedIn ? '#15803d' : '#b91c1c',
                          padding: '3px 8px',
                          borderRadius: '6px',
                          fontWeight: '700'
                        }}>
                          {emp.checkedIn ? 'Present' : 'Not Checked In'}
                        </span>
                      </td>
                      <td>{emp.checkInTime}</td>
                      <td>{emp.shift}</td>
                      <td>
                        <span style={{
                          background: '#fef2f2',
                          color: '#dc2626',
                          border: '1px solid #fecaca',
                          padding: '3px 8px',
                          borderRadius: '6px',
                          fontWeight: '700',
                          fontSize: '0.74rem'
                        }}>
                          Pending Daily Report
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: SUBMITTED DAILY REPORTS */}
      {activeTab === 'submitted' && (
        <div style={{ background: '#ffffff', borderRadius: '20px', padding: '1.5rem', border: '1px solid #e2e8f0' }}>
          <div style={{ overflowX: 'auto' }}>
            <table className="data-table" style={{ width: '100%', fontSize: '0.85rem' }}>
              <thead>
                <tr>
                  <th>DATE & TIME</th>
                  <th>EMPLOYEE</th>
                  <th>TEAM</th>
                  <th>CONNECTED CALLS</th>
                  <th>&gt;3 MIN</th>
                  <th>GROUPS CREATED</th>
                  <th>MEMBERS</th>
                  <th>CONVERSIONS</th>
                  <th>REVENUE (₹6K)</th>
                  <th>REMARKS</th>
                </tr>
              </thead>
              <tbody>
                {dailyReports.length === 0 ? (
                  <tr>
                    <td colSpan="10" style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8' }}>
                      No daily reports found for selected date.
                    </td>
                  </tr>
                ) : (
                  dailyReports.map(r => (
                    <tr key={r._id}>
                      <td>
                        <strong>{r.reportDate}</strong>
                        <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>{r.reportTime}</div>
                      </td>
                      <td>
                        <strong>{r.employeeName}</strong>
                        <div style={{ fontSize: '0.72rem', color: '#64748b' }}>{r.employeeId}</div>
                      </td>
                      <td>{r.teamName}</td>
                      <td><strong>{r.connectedCalls}</strong></td>
                      <td>{r.callsAbove3Min}</td>
                      <td>{r.groupsCreated}</td>
                      <td>{r.membersInGroups}</td>
                      <td>
                        <span style={{
                          background: r.todayConversions > 0 ? '#dcfce7' : '#f1f5f9',
                          color: r.todayConversions > 0 ? '#15803d' : '#64748b',
                          padding: '3px 8px',
                          borderRadius: '6px',
                          fontWeight: '800'
                        }}>
                          {r.todayConversions}
                        </span>
                      </td>
                      <td style={{ color: '#2563eb', fontWeight: '800' }}>
                        ₹{(r.revenue || 0).toLocaleString('en-IN')}
                      </td>
                      <td style={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {r.remarks || '—'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: MAIL BLAST REPORTS */}
      {activeTab === 'mailBlast' && (
        <div style={{ background: '#ffffff', borderRadius: '20px', padding: '1.5rem', border: '1px solid #e2e8f0' }}>
          <div style={{ overflowX: 'auto' }}>
            <table className="data-table" style={{ width: '100%', fontSize: '0.85rem' }}>
              <thead>
                <tr>
                  <th>DATE & TIME</th>
                  <th>EMPLOYEE</th>
                  <th>TARGET TYPE</th>
                  <th>COLLEGE / RECIPIENTS</th>
                  <th>TEMPLATE</th>
                  <th>EMAILS SENT</th>
                  <th>RESPONSES</th>
                  <th>BOUNCES</th>
                  <th>STATUS</th>
                </tr>
              </thead>
              <tbody>
                {mailBlastReports.length === 0 ? (
                  <tr>
                    <td colSpan="9" style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8' }}>
                      No mail blast reports found for selected date.
                    </td>
                  </tr>
                ) : (
                  mailBlastReports.map(m => (
                    <tr key={m._id}>
                      <td>
                        <strong>{m.reportDate}</strong>
                        <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>{m.reportTime}</div>
                      </td>
                      <td>
                        <strong>{m.employeeName}</strong>
                        <div style={{ fontSize: '0.72rem', color: '#64748b' }}>{m.employeeId}</div>
                      </td>
                      <td>{m.targetType}</td>
                      <td>{m.collegeName || 'Random Audience'}</td>
                      <td>{m.templateUsed}</td>
                      <td><strong>{m.emailsSent}</strong></td>
                      <td style={{ color: '#16a34a', fontWeight: '700' }}>{m.responsesReceived}</td>
                      <td style={{ color: '#ef4444' }}>{m.bounceCount}</td>
                      <td>
                        <span style={{
                          background: m.status === 'Completed' ? '#dcfce7' : '#fef3c7',
                          color: m.status === 'Completed' ? '#15803d' : '#b45309',
                          padding: '3px 8px',
                          borderRadius: '6px',
                          fontWeight: '700'
                        }}>
                          {m.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}

export default ManagerReportsView
