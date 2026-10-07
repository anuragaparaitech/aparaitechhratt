import React, { useState, useEffect } from 'react'
import { analyticsAPI, reportsAPI } from '../services/api'
import { useAutoRefresh, SYNC_EVENTS } from '../utils/realtimeSync'
import DailyReportModal from './DailyReportModal'
import MailBlastModal from './MailBlastModal'

function PerformanceDashboard({ currentUser, showToast }) {
  const [loading, setLoading] = useState(true)
  const [perfData, setPerfData] = useState(null)
  const [dailyHistory, setDailyHistory] = useState([])
  const [mailHistory, setMailHistory] = useState([])
  const [activeTab, setActiveTab] = useState('overview') // 'overview' | 'dailyLogs' | 'mailLogs'
  const [dailyModalOpen, setDailyModalOpen] = useState(false)
  const [mailModalOpen, setMailModalOpen] = useState(false)

  const isManagerOrAdmin = currentUser?.role === 'admin' || currentUser?.role === 'manager' || currentUser?.role === 'hr'

  const fetchPerformance = async (isSilent = false) => {
    if (!isSilent) setLoading(true)
    try {
      const pRes = await analyticsAPI.getMyPerformance()
      if (pRes?.success) setPerfData(pRes.data)

      const dRes = await reportsAPI.getDaily()
      if (dRes?.success) setDailyHistory(dRes.data || [])

      const mRes = await reportsAPI.getMailBlast()
      if (mRes?.success) setMailHistory(mRes.data || [])
    } catch (err) {
      console.error('Performance fetch error:', err)
      if (!isSilent) showToast('❌ Failed to load performance data', '#dc2626')
    } finally {
      if (!isSilent) setLoading(false)
    }
  }

  useEffect(() => {
    fetchPerformance(false)
  }, [])

  // Auto-refresh performance data every 15 seconds, on focus, and on reports/conversions events
  useAutoRefresh(() => {
    fetchPerformance(true)
  }, {
    intervalMs: 15000,
    eventTypes: [SYNC_EVENTS.DAILY_REPORT_SUBMITTED, SYNC_EVENTS.CONVERSION_UPDATED],
    onFocus: true,
    enabled: true
  })

  // Export Daily Reports to CSV
  const exportDailyToCSV = () => {
    if (dailyHistory.length === 0) {
      showToast('⚠️ No records to export', '#f59e0b')
      return
    }
    const headers = ['Date', 'Time', 'Employee Name', 'Emp ID', 'Team', 'Connected Calls', 'Calls >3m', 'Groups Created', 'Members', 'Conversions', 'Revenue (INR)', 'Remarks']
    const rows = dailyHistory.map(r => [
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
    link.setAttribute('download', `Aparaitech_Daily_Reports_${new Date().toISOString().split('T')[0]}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    showToast('📊 Daily reports exported to CSV', '#22c55e')
  }

  // Export Mail Blast Reports to CSV
  const exportMailToCSV = () => {
    if (mailHistory.length === 0) {
      showToast('⚠️ No mail blast records to export', '#f59e0b')
      return
    }
    const headers = ['Date', 'Time', 'Employee Name', 'Emp ID', 'Team', 'Emails Sent', 'Target Type', 'College Name', 'Template', 'Responses', 'Bounces', 'Status', 'Remarks']
    const rows = mailHistory.map(r => [
      r.reportDate,
      r.reportTime,
      `"${r.employeeName}"`,
      r.employeeId,
      r.teamName,
      r.emailsSent,
      r.targetType,
      `"${r.collegeName || ''}"`,
      `"${r.templateUsed || ''}"`,
      r.responsesReceived,
      r.bounceCount,
      r.status,
      `"${(r.remarks || '').replace(/"/g, '""')}"`
    ])
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n')
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement('a')
    link.setAttribute('href', encodedUri)
    link.setAttribute('download', `Aparaitech_Mail_Blast_${new Date().toISOString().split('T')[0]}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    showToast('📊 Mail blast reports exported to CSV', '#22c55e')
  }

  const monthlyRev = perfData?.monthly?.totalRevenue || 0
  const monthlyConvs = perfData?.monthly?.totalConversions || 0
  const targetPercent = perfData?.targets?.achievedPercent || 0

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', width: '100%' }}>
      {/* Top Header Card */}
      <div style={{
        background: '#ffffff',
        borderRadius: '20px',
        padding: '1.5rem 1.75rem',
        border: '1px solid #e2e8f0',
        boxShadow: '0 4px 20px -2px rgba(0, 0, 0, 0.03)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '1rem'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '12px',
              background: '#eff6ff',
              color: '#2563eb',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.2rem'
            }}>
              <i className="fas fa-chart-line"></i>
            </div>
            <div>
              <h2 style={{ margin: 0, fontSize: '1.35rem', fontWeight: '800', color: '#0a192f' }}>
                My Performance & Growth Dashboard
              </h2>
              <p style={{ margin: '2px 0 0', fontSize: '0.82rem', color: '#64748b' }}>
                Comprehensive tracking of calls, outreach campaigns, candidate admissions, and earnings
              </p>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={() => setDailyModalOpen(true)}
            style={{
              background: '#2563eb',
              color: '#ffffff',
              border: 'none',
              padding: '9px 16px',
              borderRadius: '10px',
              fontWeight: '700',
              fontSize: '0.84rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <i className="fas fa-plus"></i> Submit Daily Report
          </button>
          <button
            onClick={() => setMailModalOpen(true)}
            style={{
              background: '#0284c7',
              color: '#ffffff',
              border: 'none',
              padding: '9px 16px',
              borderRadius: '10px',
              fontWeight: '700',
              fontSize: '0.84rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <i className="fas fa-envelope-open-text"></i> Submit Mail Blast
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid #e2e8f0', paddingBottom: '8px' }}>
        <button
          onClick={() => setActiveTab('overview')}
          style={{
            padding: '8px 18px',
            borderRadius: '10px',
            border: 'none',
            background: activeTab === 'overview' ? '#1e293b' : '#f1f5f9',
            color: activeTab === 'overview' ? '#ffffff' : '#64748b',
            fontWeight: '700',
            fontSize: '0.84rem',
            cursor: 'pointer'
          }}
        >
          <i className="fas fa-columns" style={{ marginRight: '6px' }}></i> Performance Metrics
        </button>

        <button
          onClick={() => setActiveTab('dailyLogs')}
          style={{
            padding: '8px 18px',
            borderRadius: '10px',
            border: 'none',
            background: activeTab === 'dailyLogs' ? '#1e293b' : '#f1f5f9',
            color: activeTab === 'dailyLogs' ? '#ffffff' : '#64748b',
            fontWeight: '700',
            fontSize: '0.84rem',
            cursor: 'pointer'
          }}
        >
          <i className="fas fa-clipboard-list" style={{ marginRight: '6px' }}></i> Daily Reports History ({dailyHistory.length})
        </button>

        <button
          onClick={() => setActiveTab('mailLogs')}
          style={{
            padding: '8px 18px',
            borderRadius: '10px',
            border: 'none',
            background: activeTab === 'mailLogs' ? '#1e293b' : '#f1f5f9',
            color: activeTab === 'mailLogs' ? '#ffffff' : '#64748b',
            fontWeight: '700',
            fontSize: '0.84rem',
            cursor: 'pointer'
          }}
        >
          <i className="fas fa-mail-bulk" style={{ marginRight: '6px' }}></i> Mail Blast Records ({mailHistory.length})
        </button>
      </div>

      {/* TAB CONTENT 1: OVERVIEW METRICS */}
      {activeTab === 'overview' && (
        <>
          {/* Target & Revenue Progress */}
          <div style={{
            background: 'linear-gradient(135deg, #0a192f 0%, #1e3a8a 100%)',
            borderRadius: '20px',
            padding: '1.75rem',
            color: '#ffffff',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: '1.5rem',
            border: '1px solid rgba(255,255,255,0.1)'
          }}>
            <div>
              <div style={{ fontSize: '0.8rem', color: '#93c5fd', textTransform: 'uppercase', fontWeight: '700' }}>
                Monthly Product Conversions
              </div>
              <div style={{ fontSize: '2.4rem', fontWeight: '900', color: '#ffffff', margin: '6px 0' }}>
                {monthlyConvs} <span style={{ fontSize: '1rem', color: '#93c5fd', fontWeight: '500' }}>/ 10 Target</span>
              </div>
              <div style={{ fontSize: '0.82rem', color: '#cbd5e1', marginBottom: '12px' }}>
                Target Completion: <strong>{targetPercent}%</strong>
              </div>
              <div style={{ height: '8px', background: 'rgba(255,255,255,0.2)', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{
                  height: '100%',
                  width: `${targetPercent}%`,
                  background: 'linear-gradient(90deg, #38bdf8, #4ade80)',
                  borderRadius: '4px'
                }} />
              </div>
            </div>

            <div>
              <div style={{ fontSize: '0.8rem', color: '#93c5fd', textTransform: 'uppercase', fontWeight: '700' }}>
                Total Revenue Contribution
              </div>
              <div style={{ fontSize: '2.4rem', fontWeight: '900', color: '#4ade80', margin: '6px 0' }}>
                ₹{monthlyRev.toLocaleString('en-IN')}
              </div>
              <div style={{ fontSize: '0.82rem', color: '#cbd5e1' }}>
                Accrued @ ₹6,000 per verified product conversion
              </div>
              <div style={{
                background: 'rgba(255,255,255,0.08)',
                padding: '8px 12px',
                borderRadius: '10px',
                marginTop: '12px',
                fontSize: '0.78rem',
                color: '#bae6fd'
              }}>
                ⭐ Today's Revenue: ₹{((perfData?.today?.todayConversions || 0) * 6000).toLocaleString('en-IN')}
              </div>
            </div>

            <div>
              <div style={{ fontSize: '0.8rem', color: '#93c5fd', textTransform: 'uppercase', fontWeight: '700' }}>
                Email Outreach Impact
              </div>
              <div style={{ fontSize: '2.4rem', fontWeight: '900', color: '#38bdf8', margin: '6px 0' }}>
                {perfData?.mailBlast?.responseRate || 0}% <span style={{ fontSize: '1rem', color: '#93c5fd', fontWeight: '500' }}>Response Rate</span>
              </div>
              <div style={{ fontSize: '0.82rem', color: '#cbd5e1' }}>
                Emails Sent: <strong>{perfData?.mailBlast?.totalSent || 0}</strong> • Responses: <strong>{perfData?.mailBlast?.totalResponses || 0}</strong>
              </div>
              <div style={{
                background: 'rgba(255,255,255,0.08)',
                padding: '8px 12px',
                borderRadius: '10px',
                marginTop: '12px',
                fontSize: '0.78rem',
                color: '#bae6fd'
              }}>
                Bounces: {perfData?.mailBlast?.totalBounces || 0}
              </div>
            </div>
          </div>

          {/* 7-Day Performance Trend Chart */}
          <div style={{
            background: '#ffffff',
            borderRadius: '20px',
            padding: '1.5rem',
            border: '1px solid #e2e8f0',
            boxShadow: '0 4px 20px -2px rgba(0, 0, 0, 0.03)'
          }}>
            <h3 style={{ margin: '0 0 1rem', fontSize: '1.1rem', fontWeight: '700', color: '#0a192f' }}>
              <i className="fas fa-chart-bar" style={{ marginRight: '8px', color: '#2563eb' }}></i>
              Recent 7-Day Activity & Conversion Trend
            </h3>

            {(!perfData?.trends || perfData.trends.length === 0) ? (
              <div style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8', fontSize: '0.88rem' }}>
                No recent submission history to plot. Submit daily reports to unlock trends.
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: `repeat(${perfData.trends.length}, 1fr)`, gap: '12px', alignItems: 'end', minHeight: '180px', paddingTop: '20px' }}>
                {perfData.trends.map((t, idx) => (
                  <div key={idx} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                    <div style={{ fontSize: '0.75rem', fontWeight: '700', color: '#2563eb' }}>
                      {t.calls} calls
                    </div>
                    <div style={{
                      width: '100%',
                      maxWidth: '50px',
                      height: `${Math.max(25, Math.min(130, t.calls * 3))}px`,
                      background: t.conversions > 0 ? 'linear-gradient(180deg, #10b981 0%, #059669 100%)' : 'linear-gradient(180deg, #3b82f6 0%, #1d4ed8 100%)',
                      borderRadius: '8px 8px 0 0',
                      transition: 'height 0.3s'
                    }} />
                    <div style={{ fontSize: '0.72rem', color: '#64748b', textAlign: 'center' }}>
                      {t.date.split('-').slice(1).join('/')}
                    </div>
                    {t.conversions > 0 && (
                      <span style={{ fontSize: '0.68rem', fontWeight: '800', background: '#dcfce7', color: '#15803d', padding: '2px 6px', borderRadius: '4px' }}>
                        +{t.conversions} conv
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}

      {/* TAB CONTENT 2: DAILY REPORTS LOGS */}
      {activeTab === 'dailyLogs' && (
        <div style={{
          background: '#ffffff',
          borderRadius: '20px',
          padding: '1.5rem',
          border: '1px solid #e2e8f0',
          boxShadow: '0 4px 20px -2px rgba(0, 0, 0, 0.03)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '10px' }}>
            <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: '700', color: '#0a192f' }}>
              Daily Working Reports Log
            </h3>
            <button
              onClick={exportDailyToCSV}
              style={{
                background: '#10b981',
                color: '#ffffff',
                border: 'none',
                padding: '8px 16px',
                borderRadius: '8px',
                fontWeight: '700',
                fontSize: '0.8rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <i className="fas fa-file-excel"></i> Export to CSV
            </button>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table className="data-table" style={{ width: '100%', fontSize: '0.85rem' }}>
              <thead>
                <tr>
                  <th>DATE & TIME</th>
                  <th>EMPLOYEE</th>
                  <th>CALLS</th>
                  <th>&gt;3 MIN</th>
                  <th>GROUPS</th>
                  <th>MEMBERS</th>
                  <th>CONVERSIONS</th>
                  <th>REVENUE</th>
                  <th>REMARKS</th>
                </tr>
              </thead>
              <tbody>
                {dailyHistory.length === 0 ? (
                  <tr>
                    <td colSpan="9" style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8' }}>
                      No daily reports found.
                    </td>
                  </tr>
                ) : (
                  dailyHistory.map(r => (
                    <tr key={r._id}>
                      <td>
                        <strong>{r.reportDate}</strong>
                        <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>{r.reportTime}</div>
                      </td>
                      <td>
                        <div>{r.employeeName}</div>
                        <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>{r.employeeId} • {r.teamName}</div>
                      </td>
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
                          fontWeight: '700'
                        }}>
                          {r.todayConversions}
                        </span>
                      </td>
                      <td style={{ color: '#2563eb', fontWeight: '700' }}>
                        ₹{(r.revenue || 0).toLocaleString('en-IN')}
                      </td>
                      <td style={{ maxWidth: '200px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
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

      {/* TAB CONTENT 3: MAIL BLAST LOGS */}
      {activeTab === 'mailLogs' && (
        <div style={{
          background: '#ffffff',
          borderRadius: '20px',
          padding: '1.5rem',
          border: '1px solid #e2e8f0',
          boxShadow: '0 4px 20px -2px rgba(0, 0, 0, 0.03)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '10px' }}>
            <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: '700', color: '#0a192f' }}>
              Mail Blast Outreach Records
            </h3>
            <button
              onClick={exportMailToCSV}
              style={{
                background: '#10b981',
                color: '#ffffff',
                border: 'none',
                padding: '8px 16px',
                borderRadius: '8px',
                fontWeight: '700',
                fontSize: '0.8rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <i className="fas fa-file-excel"></i> Export to CSV
            </button>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table className="data-table" style={{ width: '100%', fontSize: '0.85rem' }}>
              <thead>
                <tr>
                  <th>DATE & TIME</th>
                  <th>EMPLOYEE</th>
                  <th>TARGET TYPE</th>
                  <th>COLLEGE / AUDIENCE</th>
                  <th>TEMPLATE</th>
                  <th>EMAILS SENT</th>
                  <th>RESPONSES</th>
                  <th>BOUNCES</th>
                  <th>STATUS</th>
                </tr>
              </thead>
              <tbody>
                {mailHistory.length === 0 ? (
                  <tr>
                    <td colSpan="9" style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8' }}>
                      No mail blast reports recorded.
                    </td>
                  </tr>
                ) : (
                  mailHistory.map(m => (
                    <tr key={m._id}>
                      <td>
                        <strong>{m.reportDate}</strong>
                        <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>{m.reportTime}</div>
                      </td>
                      <td>
                        <div>{m.employeeName}</div>
                        <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>{m.employeeId}</div>
                      </td>
                      <td>
                        <span style={{
                          background: m.targetType === 'College-wise' ? '#eff6ff' : '#f1f5f9',
                          color: m.targetType === 'College-wise' ? '#2563eb' : '#475569',
                          padding: '3px 8px',
                          borderRadius: '6px',
                          fontWeight: '600'
                        }}>
                          {m.targetType}
                        </span>
                      </td>
                      <td style={{ maxWidth: '180px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {m.collegeName || 'Random Audience'}
                      </td>
                      <td style={{ maxWidth: '180px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {m.templateUsed || 'Standard'}
                      </td>
                      <td><strong>{m.emailsSent}</strong></td>
                      <td style={{ color: '#16a34a', fontWeight: '700' }}>{m.responsesReceived}</td>
                      <td style={{ color: '#ef4444' }}>{m.bounceCount}</td>
                      <td>
                        <span style={{
                          background: m.status === 'Completed' ? '#dcfce7' : '#fef3c7',
                          color: m.status === 'Completed' ? '#15803d' : '#b45309',
                          padding: '3px 8px',
                          borderRadius: '6px',
                          fontWeight: '700',
                          fontSize: '0.74rem'
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

      {/* MODALS */}
      <DailyReportModal
        isOpen={dailyModalOpen}
        onClose={() => setDailyModalOpen(false)}
        currentUser={currentUser}
        onSuccess={() => fetchPerformance()}
        showToast={showToast}
      />

      <MailBlastModal
        isOpen={mailModalOpen}
        onClose={() => setMailModalOpen(false)}
        currentUser={currentUser}
        onSuccess={() => fetchPerformance()}
        showToast={showToast}
      />
    </div>
  )
}

export default PerformanceDashboard
