import React, { useState, useEffect } from 'react'
import { analyticsAPI } from '../services/api'
import { useAutoRefresh, SYNC_EVENTS } from '../utils/realtimeSync'

function RevenueTrackerView({ currentUser, showToast }) {
  const [loading, setLoading] = useState(true)
  const [revenueData, setRevenueData] = useState(null)
  const [filterTeam, setFilterTeam] = useState('all')

  const fetchRevenue = async (isSilent = false) => {
    if (!isSilent) setLoading(true)
    try {
      const res = await analyticsAPI.getRevenueTracker()
      if (res?.success) {
        setRevenueData(res.data)
      }
    } catch (err) {
      console.error('Revenue tracker error:', err)
      if (!isSilent) showToast('❌ Failed to load revenue tracking data', '#dc2626')
    } finally {
      if (!isSilent) setLoading(false)
    }
  }

  useEffect(() => {
    fetchRevenue(false)
  }, [])

  // Live Auto-Refresh every 5 seconds, on window focus, and on CONVERSION_UPDATED / DAILY_REPORT_SUBMITTED events
  useAutoRefresh(() => {
    fetchRevenue(true)
  }, {
    intervalMs: 5000,
    eventTypes: [SYNC_EVENTS.CONVERSION_UPDATED, SYNC_EVENTS.DAILY_REPORT_SUBMITTED],
    onFocus: true,
    enabled: true
  })

  const summary = revenueData?.summary || {}
  const employeeBreakdown = revenueData?.employeeBreakdown || []
  const teamBreakdown = revenueData?.teamBreakdown || []
  const monthlyTrends = revenueData?.monthlyTrends || []

  const filteredEmployees = filterTeam === 'all'
    ? employeeBreakdown
    : employeeBreakdown.filter(e => e.team === filterTeam)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', width: '100%' }}>
      {/* Header Banner */}
      <div style={{
        background: 'linear-gradient(135deg, #0a192f 0%, #065f46 50%, #059669 100%)',
        borderRadius: '24px',
        padding: '2rem 2.25rem',
        color: '#ffffff',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '1rem',
        boxShadow: '0 20px 35px -10px rgba(6, 95, 70, 0.3)'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <span style={{
              background: 'rgba(255,255,255,0.15)',
              padding: '4px 12px',
              borderRadius: '20px',
              fontSize: '0.74rem',
              fontWeight: '700',
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              color: '#a7f3d0'
            }}>
              💰 Financial Analytics
            </span>
          </div>
          <h1 style={{ margin: 0, fontSize: '1.85rem', fontWeight: '800', letterSpacing: '-0.02em' }}>
            Aparaitech Software Revenue Tracker
          </h1>
          <p style={{ margin: '6px 0 0', fontSize: '0.9rem', color: '#d1fae5' }}>
            Commercial yield tracking at ₹6,000 per confirmed product conversion
          </p>
        </div>

        <div style={{
          background: 'rgba(255, 255, 255, 0.12)',
          backdropFilter: 'blur(10px)',
          padding: '14px 22px',
          borderRadius: '16px',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          textAlign: 'right'
        }}>
          <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: '#a7f3d0', fontWeight: '700' }}>
            Unit Rate per Product
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: '900', color: '#ffffff', margin: '2px 0' }}>
            ₹6,000 INR
          </div>
          <div style={{ fontSize: '0.72rem', color: '#d1fae5' }}>
            Standard Product Revenue Model
          </div>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '1rem'
      }}>
        {/* Total Revenue */}
        <div style={{
          background: '#ffffff',
          borderRadius: '18px',
          padding: '1.5rem',
          border: '1px solid #e2e8f0',
          boxShadow: '0 4px 15px rgba(0,0,0,0.02)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#64748b', fontSize: '0.78rem', fontWeight: '700' }}>
            <span>TOTAL RECORDED REVENUE</span>
            <i className="fas fa-wallet" style={{ color: '#059669' }}></i>
          </div>
          <div style={{ fontSize: '2.1rem', fontWeight: '900', color: '#059669', margin: '8px 0 4px' }}>
            ₹{(summary.totalRevenue || 0).toLocaleString('en-IN')}
          </div>
          <div style={{ fontSize: '0.78rem', color: '#64748b' }}>
            Cumulative across all validated reports
          </div>
        </div>

        {/* Total Conversions */}
        <div style={{
          background: '#ffffff',
          borderRadius: '18px',
          padding: '1.5rem',
          border: '1px solid #e2e8f0',
          boxShadow: '0 4px 15px rgba(0,0,0,0.02)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#64748b', fontSize: '0.78rem', fontWeight: '700' }}>
            <span>TOTAL CONVERSIONS</span>
            <i className="fas fa-user-graduate" style={{ color: '#2563eb' }}></i>
          </div>
          <div style={{ fontSize: '2.1rem', fontWeight: '900', color: '#0a192f', margin: '8px 0 4px' }}>
            {summary.totalConversions || 0}
          </div>
          <div style={{ fontSize: '0.78rem', color: '#64748b' }}>
            Students onboarded & registered
          </div>
        </div>

        {/* Current Month Revenue */}
        <div style={{
          background: '#ffffff',
          borderRadius: '18px',
          padding: '1.5rem',
          border: '1px solid #e2e8f0',
          boxShadow: '0 4px 15px rgba(0,0,0,0.02)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#64748b', fontSize: '0.78rem', fontWeight: '700' }}>
            <span>CURRENT MONTH REVENUE</span>
            <i className="fas fa-calendar-alt" style={{ color: '#d97706' }}></i>
          </div>
          <div style={{ fontSize: '2.1rem', fontWeight: '900', color: '#d97706', margin: '8px 0 4px' }}>
            ₹{(summary.currentMonthRevenue || 0).toLocaleString('en-IN')}
          </div>
          <div style={{ fontSize: '0.78rem', color: '#64748b' }}>
            This month: <strong>{summary.currentMonthConversions || 0}</strong> conversions
          </div>
        </div>

        {/* Contributing Associates */}
        <div style={{
          background: '#ffffff',
          borderRadius: '18px',
          padding: '1.5rem',
          border: '1px solid #e2e8f0',
          boxShadow: '0 4px 15px rgba(0,0,0,0.02)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#64748b', fontSize: '0.78rem', fontWeight: '700' }}>
            <span>ACTIVE GENERATORS</span>
            <i className="fas fa-users-cog" style={{ color: '#7c3aed' }}></i>
          </div>
          <div style={{ fontSize: '2.1rem', fontWeight: '900', color: '#0a192f', margin: '8px 0 4px' }}>
            {employeeBreakdown.length}
          </div>
          <div style={{ fontSize: '0.78rem', color: '#64748b' }}>
            Associates with logged conversions
          </div>
        </div>
      </div>

      {/* Monthly Revenue Progression Trend */}
      <div style={{
        background: '#ffffff',
        borderRadius: '20px',
        padding: '1.5rem',
        border: '1px solid #e2e8f0',
        boxShadow: '0 4px 20px -2px rgba(0, 0, 0, 0.03)'
      }}>
        <h3 style={{ margin: '0 0 1rem', fontSize: '1.1rem', fontWeight: '700', color: '#0a192f' }}>
          <i className="fas fa-chart-area" style={{ marginRight: '8px', color: '#059669' }}></i>
          Monthly Revenue Progression Trend
        </h3>

        {monthlyTrends.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8' }}>
            No monthly trend data recorded yet.
          </div>
        ) : (
          <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', alignItems: 'flex-end', paddingTop: '1rem' }}>
            {monthlyTrends.map(m => (
              <div key={m.month} style={{ flex: 1, minWidth: '120px', background: '#f8fafc', padding: '14px', borderRadius: '14px', border: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: '0.78rem', fontWeight: '700', color: '#64748b' }}>{m.month}</div>
                <div style={{ fontSize: '1.4rem', fontWeight: '900', color: '#059669', margin: '4px 0' }}>
                  ₹{(m.revenue || 0).toLocaleString('en-IN')}
                </div>
                <div style={{ fontSize: '0.76rem', color: '#475569' }}>
                  {m.conversions} conversions (@ ₹6k)
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Official Monthly Revenue Benchmarks & Criteria */}
      <div style={{
        background: '#ffffff',
        borderRadius: '20px',
        padding: '1.5rem',
        border: '1.5px solid #a7f3d0',
        boxShadow: '0 4px 20px -2px rgba(0, 0, 0, 0.03)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '8px' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: '800', color: '#064e3b', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <i className="fas fa-bullseye" style={{ color: '#059669' }}></i>
              Official Monthly Revenue & Salary Criteria Benchmarks
            </h3>
            <p style={{ margin: '3px 0 0', fontSize: '0.8rem', color: '#64748b' }}>
              Tenure-based monthly targets for revenue achievement and associate evaluation
            </p>
          </div>
          <span style={{ fontSize: '0.74rem', background: '#ecfdf5', color: '#065f46', padding: '4px 12px', borderRadius: '12px', fontWeight: '800', border: '1px solid #a7f3d0' }}>
            ● ADMIN CRITERIA PERSISTED
          </span>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '12px'
        }}>
          {[
            { label: 'Month 1', target: '₹42,000', convs: '7 Convs', onTarget: '36%', below: '26%', excess: '+8%' },
            { label: 'Month 2', target: '₹60,000', convs: '10 Convs', onTarget: '30%', below: '25%', excess: '+8%' },
            { label: 'Month 3', target: '₹72,000', convs: '12 Convs', onTarget: '30%', below: '25%', excess: '+8%' },
            { label: 'Month 4+', target: '₹90,000', convs: '15 Convs', onTarget: '30%', below: '25%', excess: '+8%' }
          ].map((item, idx) => (
            <div key={idx} style={{ background: '#f8fafc', padding: '12px 14px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <strong style={{ color: '#064e3b', fontSize: '0.85rem' }}>{item.label}</strong>
                <span style={{ fontSize: '0.72rem', color: '#2563eb', fontWeight: '800' }}>{item.convs}</span>
              </div>
              <div style={{ fontSize: '1.25rem', fontWeight: '900', color: '#0a192f', marginBottom: '6px' }}>
                {item.target}
              </div>
              <div style={{ fontSize: '0.72rem', color: '#64748b' }}>
                On-target: <strong style={{ color: '#059669' }}>{item.onTarget}</strong> • Below: <strong style={{ color: '#dc2626' }}>{item.below}</strong> • Excess: <strong style={{ color: '#d97706' }}>{item.excess}</strong>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Team Breakdown & Employee Breakdown */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 300px), 1fr))',
        gap: '1.25rem'
      }}>
        {/* Team-wise Breakdown */}
        <div style={{
          background: '#ffffff',
          borderRadius: '20px',
          padding: '1.5rem',
          border: '1px solid #e2e8f0',
          boxShadow: '0 4px 20px -2px rgba(0, 0, 0, 0.03)'
        }}>
          <h3 style={{ margin: '0 0 1rem', fontSize: '1.1rem', fontWeight: '700', color: '#0a192f' }}>
            <i className="fas fa-sitemap" style={{ marginRight: '8px', color: '#2563eb' }}></i>
            Team-wise Revenue Generation
          </h3>

          <div style={{ overflowX: 'auto' }}>
            <table className="data-table" style={{ width: '100%', fontSize: '0.85rem' }}>
              <thead>
                <tr>
                  <th>TEAM</th>
                  <th>CONVERSIONS</th>
                  <th>REVENUE (₹)</th>
                  <th>REPORTS</th>
                </tr>
              </thead>
              <tbody>
                {teamBreakdown.length === 0 ? (
                  <tr>
                    <td colSpan="4" style={{ textAlign: 'center', padding: '1.5rem', color: '#94a3b8' }}>
                      No team data available.
                    </td>
                  </tr>
                ) : (
                  teamBreakdown.map(t => (
                    <tr key={t._id}>
                      <td><strong style={{ color: '#0a192f' }}>{t._id || 'BDA'}</strong></td>
                      <td>
                        <span style={{ background: '#dcfce7', color: '#15803d', padding: '3px 8px', borderRadius: '6px', fontWeight: '700' }}>
                          {t.conversions}
                        </span>
                      </td>
                      <td style={{ color: '#059669', fontWeight: '800' }}>
                        ₹{(t.revenue || 0).toLocaleString('en-IN')}
                      </td>
                      <td>{t.reports} submissions</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Employee-wise Revenue Breakdown */}
        <div style={{
          background: '#ffffff',
          borderRadius: '20px',
          padding: '1.5rem',
          border: '1px solid #e2e8f0',
          boxShadow: '0 4px 20px -2px rgba(0, 0, 0, 0.03)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '8px' }}>
            <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: '700', color: '#0a192f' }}>
              <i className="fas fa-user-tag" style={{ marginRight: '8px', color: '#7c3aed' }}></i>
              Associate Portfolio Revenue
            </h3>
            {teamBreakdown.length > 0 && (
              <select
                value={filterTeam}
                onChange={(e) => setFilterTeam(e.target.value)}
                style={{
                  padding: '6px 12px',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  fontSize: '0.8rem'
                }}
              >
                <option value="all">All Teams</option>
                {teamBreakdown.map(t => (
                  <option key={t._id} value={t._id}>{t._id}</option>
                ))}
              </select>
            )}
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table className="data-table" style={{ width: '100%', fontSize: '0.85rem' }}>
              <thead>
                <tr>
                  <th>EMPLOYEE</th>
                  <th>TEAM</th>
                  <th>CONVERSIONS</th>
                  <th>REVENUE EARNED</th>
                </tr>
              </thead>
              <tbody>
                {filteredEmployees.length === 0 ? (
                  <tr>
                    <td colSpan="4" style={{ textAlign: 'center', padding: '1.5rem', color: '#94a3b8' }}>
                      No associate revenue logged yet.
                    </td>
                  </tr>
                ) : (
                  filteredEmployees.map(emp => (
                    <tr key={emp._id}>
                      <td>
                        <strong style={{ color: '#0a192f' }}>{emp.name}</strong>
                        <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>{emp.empId}</div>
                      </td>
                      <td>{emp.team}</td>
                      <td>
                        <span style={{ background: '#dcfce7', color: '#15803d', padding: '3px 8px', borderRadius: '6px', fontWeight: '700' }}>
                          {emp.conversions}
                        </span>
                      </td>
                      <td style={{ color: '#059669', fontWeight: '800', fontSize: '0.95rem' }}>
                        ₹{(emp.revenue || 0).toLocaleString('en-IN')}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}

export default RevenueTrackerView
