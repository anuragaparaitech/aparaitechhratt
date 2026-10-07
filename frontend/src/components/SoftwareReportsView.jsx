import React, { useState, useEffect } from 'react'
import { reportsAPI } from '../services/api'
import { useAutoRefresh, SYNC_EVENTS } from '../utils/realtimeSync'
import * as XLSX from 'xlsx'
import SoftwareDailyReportModal from './SoftwareDailyReportModal'

function SoftwareReportsView({ currentUser, showToast }) {
  const [reports, setReports] = useState([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [dateFilter, setDateFilter] = useState('')
  const [devFilter, setDevFilter] = useState('')
  const [selectedReport, setSelectedReport] = useState(null)

  const isManagerOrAdmin = currentUser.role === 'admin' || currentUser.role === 'manager' || currentUser.email === 'anunand2004@gmail.com' || String(currentUser.empId) === '7017' || String(currentUser.empId) === 'AP7017'

  const fetchReports = async (isSilent = false) => {
    if (!isSilent) setLoading(true)
    try {
      const params = {
        reportType: 'software'
      }
      if (dateFilter) params.date = dateFilter
      if (devFilter) params.email = devFilter

      const res = await reportsAPI.getDaily(params)
      if (res.success) {
        setReports(res.data || [])
      }
    } catch (err) {
      console.error('Error fetching software reports:', err)
      if (!isSilent) showToast('⚠️ Could not load reports history', '#f59e0b')
    } finally {
      if (!isSilent) setLoading(false)
    }
  }

  useEffect(() => {
    fetchReports(false)
  }, [dateFilter, devFilter])

  // Live Auto-Refresh every 5 seconds, on window focus, and on DAILY_REPORT_SUBMITTED
  useAutoRefresh(() => {
    fetchReports(true)
  }, {
    intervalMs: 5000,
    eventTypes: [SYNC_EVENTS.DAILY_REPORT_SUBMITTED],
    onFocus: true,
    enabled: true
  })

  // Compute analytics
  const totalHours = reports.reduce((acc, r) => acc + (Number(r.hoursWorked) || 0), 0)
  const avgHours = reports.length > 0 ? (totalHours / reports.length).toFixed(1) : '4.0'
  const blockersCount = reports.filter(r => r.blockers && r.blockers.trim() && !r.blockers.toLowerCase().includes('none')).length

  const filteredReports = reports.filter(r => {
    if (!search.trim()) return true
    const s = search.toLowerCase()
    return (
      (r.employeeName && r.employeeName.toLowerCase().includes(s)) ||
      (r.tasksCompleted && r.tasksCompleted.toLowerCase().includes(s)) ||
      (r.tasksInProgress && r.tasksInProgress.toLowerCase().includes(s)) ||
      (r.blockers && r.blockers.toLowerCase().includes(s)) ||
      (r.planTomorrow && r.planTomorrow.toLowerCase().includes(s))
    )
  })

  const exportToExcel = () => {
    if (filteredReports.length === 0) {
      showToast('⚠️ No reports available to export', '#f59e0b')
      return
    }

    const dataToExport = filteredReports.map(r => ({
      'Report Date': r.reportDate,
      'Time Submitted': r.reportTime,
      'Employee Name': r.employeeName,
      'Employee ID': r.employeeId,
      'Team': r.teamName,
      'Hours Worked': r.hoursWorked || 4,
      'Tasks Completed': r.tasksCompleted || 'N/A',
      'Tasks In Progress': r.tasksInProgress || 'N/A',
      'Tasks Pending': r.tasksPending || 'N/A',
      'Blockers / Challenges': r.blockers || 'None',
      'Plan for Tomorrow': r.planTomorrow || 'N/A',
      'GitHub Reference': r.githubPrs || 'N/A'
    }))

    const ws = XLSX.utils.json_to_sheet(dataToExport)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Software Reports')
    XLSX.writeFile(wb, `Aparaitech_Software_Reports_${new Date().toISOString().split('T')[0]}.xlsx`)
    showToast('📊 Exported software reports to Excel!', '#10b981')
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', width: '100%' }}>
      {/* Header Banner */}
      <div style={{
        background: 'linear-gradient(135deg, #0a192f 0%, #1e3a8a 100%)',
        borderRadius: '20px',
        padding: '1.75rem 2rem',
        color: '#ffffff',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '1rem',
        boxShadow: '0 10px 25px -5px rgba(10, 25, 47, 0.3)'
      }}>
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '4px 12px', background: 'rgba(56, 189, 248, 0.15)', borderRadius: '999px', fontSize: '0.75rem', fontWeight: '700', color: '#38bdf8', marginBottom: '8px' }}>
            <i className="fas fa-terminal"></i> SOFTWARE ENGINEERING HUB
          </div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: '900', margin: '0 0 6px 0', letterSpacing: '-0.02em' }}>
            Daily Work Reports & Sprint Logs
          </h1>
          <p style={{ margin: 0, fontSize: '0.85rem', color: '#93c5fd', maxWidth: '600px' }}>
            Official daily engineering accountability logs, hours logged, blocker tracking, and tomorrow's roadmap.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <button
            onClick={() => setIsModalOpen(true)}
            style={{
              background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
              color: '#ffffff',
              border: 'none',
              borderRadius: '12px',
              padding: '11px 20px',
              fontWeight: '800',
              fontSize: '0.88rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              boxShadow: '0 4px 14px rgba(37, 99, 235, 0.4)'
            }}
          >
            <i className="fas fa-plus-circle"></i>
            Submit Today's Report
          </button>

          {isManagerOrAdmin && (
            <button
              onClick={exportToExcel}
              style={{
                background: 'rgba(255, 255, 255, 0.12)',
                color: '#ffffff',
                border: '1px solid rgba(255, 255, 255, 0.25)',
                borderRadius: '12px',
                padding: '11px 16px',
                fontWeight: '700',
                fontSize: '0.85rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <i className="fas fa-file-excel"></i>
              Export Excel
            </button>
          )}
        </div>
      </div>

      {/* KPI Analytics Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
        gap: '1rem'
      }}>
        <div style={{
          background: '#ffffff',
          borderRadius: '16px',
          padding: '1.25rem',
          border: '1px solid #e2e8f0',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.78rem', fontWeight: '700', color: '#64748b' }}>TOTAL REPORTS LOGGED</span>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#eff6ff', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <i className="fas fa-file-alt"></i>
            </div>
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: '900', color: '#0f172a' }}>{reports.length}</div>
          <div style={{ fontSize: '0.72rem', color: '#10b981', marginTop: '4px' }}>
            <i className="fas fa-check-double"></i> Verified engineering records
          </div>
        </div>

        <div style={{
          background: '#ffffff',
          borderRadius: '16px',
          padding: '1.25rem',
          border: '1px solid #e2e8f0',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.78rem', fontWeight: '700', color: '#64748b' }}>TOTAL HOURS LOGGED</span>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#ecfdf5', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <i className="fas fa-clock"></i>
            </div>
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: '900', color: '#059669' }}>{totalHours} hrs</div>
          <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '4px' }}>
            Avg {avgHours} hours / developer shift
          </div>
        </div>

        <div style={{
          background: '#ffffff',
          borderRadius: '16px',
          padding: '1.25rem',
          border: '1px solid #e2e8f0',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.78rem', fontWeight: '700', color: '#64748b' }}>REPORTED BLOCKERS</span>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#fef2f2', color: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <i className="fas fa-exclamation-triangle"></i>
            </div>
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: '900', color: blockersCount > 0 ? '#ef4444' : '#10b981' }}>
            {blockersCount}
          </div>
          <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '4px' }}>
            {blockersCount === 0 ? '✨ All sprints running clear' : '⚠️ Requires technical lead review'}
          </div>
        </div>

        <div style={{
          background: '#ffffff',
          borderRadius: '16px',
          padding: '1.25rem',
          border: '1px solid #e2e8f0',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.78rem', fontWeight: '700', color: '#64748b' }}>DEADLINE REMINDER</span>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#fdf4ff', color: '#a855f7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <i className="fas fa-bell"></i>
            </div>
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: '900', color: '#a855f7' }}>07:00 PM</div>
          <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '4px' }}>
            Automated notification daily
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div style={{
        background: '#ffffff',
        borderRadius: '16px',
        padding: '1rem 1.25rem',
        border: '1px solid #e2e8f0',
        display: 'flex',
        gap: '12px',
        alignItems: 'center',
        flexWrap: 'wrap'
      }}>
        <div style={{ position: 'relative', flex: 1, minWidth: '220px' }}>
          <i className="fas fa-search" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }}></i>
          <input
            type="text"
            placeholder="Search tasks completed, blockers, plan..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              width: '100%',
              padding: '9px 12px 9px 36px',
              borderRadius: '10px',
              border: '1.5px solid #cbd5e1',
              fontSize: '0.85rem',
              outline: 'none'
            }}
          />
        </div>

        <input
          type="date"
          value={dateFilter}
          onChange={(e) => setDateFilter(e.target.value)}
          style={{
            padding: '8px 12px',
            borderRadius: '10px',
            border: '1.5px solid #cbd5e1',
            fontSize: '0.85rem',
            outline: 'none',
            color: '#334155'
          }}
        />

        {dateFilter && (
          <button
            onClick={() => setDateFilter('')}
            style={{
              background: '#f1f5f9',
              border: 'none',
              borderRadius: '8px',
              padding: '8px 12px',
              fontSize: '0.8rem',
              cursor: 'pointer',
              color: '#64748b'
            }}
          >
            Clear Date
          </button>
        )}
      </div>

      {/* Reports Feed / Table */}
      <div style={{
        background: '#ffffff',
        borderRadius: '16px',
        border: '1px solid #e2e8f0',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
        overflow: 'hidden'
      }}>
        {loading ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>
            <i className="fas fa-circle-notch fa-spin" style={{ fontSize: '1.8rem', color: '#2563eb', marginBottom: '10px' }}></i>
            <div>Loading software daily reports...</div>
          </div>
        ) : filteredReports.length === 0 ? (
          <div style={{ padding: '3.5rem 1.5rem', textAlign: 'center', color: '#64748b' }}>
            <div style={{
              width: '60px',
              height: '60px',
              borderRadius: '50%',
              background: '#f1f5f9',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.5rem',
              color: '#94a3b8',
              marginBottom: '1rem'
            }}>
              <i className="fas fa-clipboard-list"></i>
            </div>
            <div style={{ fontWeight: '700', fontSize: '1rem', color: '#334155', marginBottom: '4px' }}>
              No Software Daily Reports Found
            </div>
            <div style={{ fontSize: '0.85rem', color: '#94a3b8', marginBottom: '1.25rem' }}>
              Submit your engineering activities for today to keep your sprint logs updated.
            </div>
            <button
              onClick={() => setIsModalOpen(true)}
              style={{
                background: '#2563eb',
                color: '#ffffff',
                border: 'none',
                borderRadius: '10px',
                padding: '9px 18px',
                fontWeight: '700',
                fontSize: '0.85rem',
                cursor: 'pointer'
              }}
            >
              Submit Today's Report
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', divideY: '1px solid #f1f5f9' }}>
            {filteredReports.map((report) => (
              <div
                key={report._id}
                style={{
                  padding: '1.25rem 1.5rem',
                  borderBottom: '1px solid #f1f5f9',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '10px',
                  transition: 'background 0.2s',
                  cursor: 'pointer'
                }}
                onClick={() => setSelectedReport(report)}
                onMouseEnter={(e) => e.currentTarget.style.background = '#f8fafc'}
                onMouseLeave={(e) => e.currentTarget.style.background = '#ffffff'}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{
                      width: '38px',
                      height: '38px',
                      borderRadius: '10px',
                      background: 'linear-gradient(135deg, #0a192f, #2563eb)',
                      color: '#ffffff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: '800',
                      fontSize: '0.9rem'
                    }}>
                      {report.employeeName ? report.employeeName.charAt(0).toUpperCase() : 'D'}
                    </div>
                    <div>
                      <div style={{ fontWeight: '800', fontSize: '0.92rem', color: '#0f172a' }}>
                        {report.employeeName}
                        <span style={{ fontSize: '0.75rem', fontWeight: '600', color: '#64748b', marginLeft: '8px' }}>
                          ({report.employeeId || 'AP-EMP'})
                        </span>
                      </div>
                      <div style={{ fontSize: '0.72rem', color: '#64748b' }}>
                        📅 {report.reportDate} • 🕒 {report.reportTime} • ⏱️ {report.hoursWorked || 4} hrs logged
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {report.blockers && report.blockers.trim() && !report.blockers.toLowerCase().includes('none') ? (
                      <span style={{
                        background: '#fef2f2',
                        color: '#ef4444',
                        border: '1px solid #fecaca',
                        borderRadius: '999px',
                        padding: '3px 10px',
                        fontSize: '0.72rem',
                        fontWeight: '700'
                      }}>
                        ⚠️ Blocker Reported
                      </span>
                    ) : (
                      <span style={{
                        background: '#ecfdf5',
                        color: '#059669',
                        border: '1px solid #a7f3d0',
                        borderRadius: '999px',
                        padding: '3px 10px',
                        fontSize: '0.72rem',
                        fontWeight: '700'
                      }}>
                        ✓ Normal Progress
                      </span>
                    )}
                    <span style={{ fontSize: '0.78rem', color: '#2563eb', fontWeight: '700' }}>
                      View Details →
                    </span>
                  </div>
                </div>

                <div style={{ fontSize: '0.85rem', color: '#334155', lineHeight: 1.5, background: '#f8fafc', padding: '10px 14px', borderRadius: '10px' }}>
                  <div style={{ fontWeight: '700', color: '#0f172a', marginBottom: '2px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <i className="fas fa-check" style={{ color: '#10b981', fontSize: '0.8rem' }}></i> Completed:
                  </div>
                  <div style={{ whiteSpace: 'pre-wrap' }}>{report.tasksCompleted || 'N/A'}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Selected Report Details Modal */}
      {selectedReport && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(10, 25, 47, 0.75)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1100,
          padding: '1.25rem'
        }}>
          <div style={{
            background: '#ffffff',
            borderRadius: '20px',
            maxWidth: '620px',
            width: '100%',
            maxHeight: '90vh',
            overflowY: 'auto',
            padding: '1.75rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '1.25rem',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid #f1f5f9', paddingBottom: '1rem' }}>
              <div>
                <h3 style={{ margin: '0 0 4px 0', fontSize: '1.2rem', fontWeight: '900', color: '#0f172a' }}>
                  {selectedReport.employeeName}'s Daily Log
                </h3>
                <div style={{ fontSize: '0.78rem', color: '#64748b' }}>
                  Date: <strong>{selectedReport.reportDate}</strong> • Submitted at: <strong>{selectedReport.reportTime}</strong>
                </div>
              </div>
              <button
                onClick={() => setSelectedReport(null)}
                style={{
                  background: '#f1f5f9',
                  border: 'none',
                  borderRadius: '8px',
                  width: '32px',
                  height: '32px',
                  fontSize: '1rem',
                  cursor: 'pointer'
                }}
              >
                ✕
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '0.88rem' }}>
              <div>
                <strong style={{ color: '#10b981', display: 'block', marginBottom: '4px' }}>
                  <i className="fas fa-check-circle"></i> Tasks Completed:
                </strong>
                <div style={{ background: '#f8fafc', padding: '10px 14px', borderRadius: '10px', whiteSpace: 'pre-wrap', color: '#1e293b' }}>
                  {selectedReport.tasksCompleted || 'None recorded'}
                </div>
              </div>

              <div>
                <strong style={{ color: '#3b82f6', display: 'block', marginBottom: '4px' }}>
                  <i className="fas fa-spinner"></i> Tasks In Progress:
                </strong>
                <div style={{ background: '#f8fafc', padding: '10px 14px', borderRadius: '10px', whiteSpace: 'pre-wrap', color: '#1e293b' }}>
                  {selectedReport.tasksInProgress || 'None'}
                </div>
              </div>

              <div>
                <strong style={{ color: '#ef4444', display: 'block', marginBottom: '4px' }}>
                  <i className="fas fa-exclamation-triangle"></i> Blockers / Challenges:
                </strong>
                <div style={{ background: '#fef2f2', border: '1px solid #fecaca', padding: '10px 14px', borderRadius: '10px', whiteSpace: 'pre-wrap', color: '#991b1b' }}>
                  {selectedReport.blockers || 'No blockers reported.'}
                </div>
              </div>

              <div>
                <strong style={{ color: '#8b5cf6', display: 'block', marginBottom: '4px' }}>
                  <i className="fas fa-calendar-plus"></i> Plan for Tomorrow:
                </strong>
                <div style={{ background: '#f8fafc', padding: '10px 14px', borderRadius: '10px', whiteSpace: 'pre-wrap', color: '#1e293b' }}>
                  {selectedReport.planTomorrow || 'N/A'}
                </div>
              </div>

              {selectedReport.githubPrs && (
                <div>
                  <strong style={{ color: '#0f172a', display: 'block', marginBottom: '4px' }}>
                    <i className="fab fa-github"></i> GitHub PR / Commit Reference:
                  </strong>
                  <div style={{ background: '#f8fafc', padding: '8px 12px', borderRadius: '10px', fontFamily: 'monospace', color: '#2563eb' }}>
                    {selectedReport.githubPrs}
                  </div>
                </div>
              )}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
              <button
                onClick={() => setSelectedReport(null)}
                style={{
                  background: '#0a192f',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '10px',
                  padding: '9px 20px',
                  fontWeight: '700',
                  fontSize: '0.85rem',
                  cursor: 'pointer'
                }}
              >
                Close View
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal for submission */}
      <SoftwareDailyReportModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        currentUser={currentUser}
        showToast={showToast}
        onReportSubmitted={() => {
          fetchReports()
        }}
      />
    </div>
  )
}

export default SoftwareReportsView
