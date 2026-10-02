import React, { useState, useEffect } from 'react'
import { reportsAPI, analyticsAPI, attendanceAPI } from '../services/api'
import { SHIFTS, GEOFENCE } from '../utils/shiftsAndGeo'
import DailyReportModal from './DailyReportModal'
import MailBlastModal from './MailBlastModal'
import ConversionDataFillModal from './ConversionDataFillModal'

function CompanyDashboard({ currentUser, onNavigate, showToast, unreadMessagesCount = 0 }) {
  const [loading, setLoading] = useState(true)
  const [todayReportStatus, setTodayReportStatus] = useState({ submitted: false, report: null })
  const [performance, setPerformance] = useState(null)
  const [miniLeaderboard, setMiniLeaderboard] = useState([])
  const [todayAttendance, setTodayAttendance] = useState(null)
  const [activeSession, setActiveSession] = useState(null)
  const [teamOverview, setTeamOverview] = useState(null)

  // Modals
  const [dailyModalOpen, setDailyModalOpen] = useState(false)
  const [mailBlastModalOpen, setMailBlastModalOpen] = useState(false)
  const [conversionModalOpen, setConversionModalOpen] = useState(false)

  const isManagerOrAdmin = currentUser?.role === 'admin' || currentUser?.role === 'manager' || currentUser?.role === 'hr'

  const fetchData = async () => {
    setLoading(true)
    try {
      const todayStr = new Date().toISOString().split('T')[0]

      // 1. Fetch Today's Daily Report status
      const statusRes = await reportsAPI.getTodayStatus().catch(() => ({ submitted: false }))
      setTodayReportStatus(statusRes)

      // 2. Fetch My Performance
      const perfRes = await analyticsAPI.getMyPerformance().catch(() => null)
      if (perfRes?.success) {
        setPerformance(perfRes.data)
      }

      // 3. Fetch Mini Leaderboard (Top 3 for today/month)
      const leadRes = await analyticsAPI.getLeaderboard('month').catch(() => null)
      if (leadRes?.success && leadRes.data?.byConversions) {
        setMiniLeaderboard(leadRes.data.byConversions.slice(0, 3))
      }

      // 4. Fetch Attendance status for today
      const attData = await attendanceAPI.getAll({ email: currentUser.email }).catch(() => null)
      if (attData) {
        const records = Array.isArray(attData) ? attData : (attData.data || attData.records || [])
        const todayRec = records.find(r => r.date === todayStr)
        setTodayAttendance(todayRec || null)

        const sessions = Array.isArray(attData) ? [] : (attData.liveSessions || [])
        const userSession = sessions.find(s => s.employeeEmail === currentUser.email)
        setActiveSession(userSession || null)
      }

      // 5. If manager/admin, fetch team overview
      if (isManagerOrAdmin) {
        const teamRes = await analyticsAPI.getTeamOverview().catch(() => null)
        if (teamRes?.success) {
          setTeamOverview(teamRes.data)
        }
      }
    } catch (err) {
      console.error('Dashboard load error:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
    const interval = setInterval(fetchData, 45000)
    return () => clearInterval(interval)
  }, [currentUser?.email])

  // Check 7 PM Reminder condition
  const now = new Date()
  const currentHour = now.getHours()
  const isPastEveningReminder = currentHour >= 19 // Past 7 PM

  const userShiftKey = currentUser?.shift || (currentUser?.department === 'Development' ? 'shift_1' : 'shift_2')
  const userShift = SHIFTS[userShiftKey] || SHIFTS.shift_1

  const todayRevenue = (performance?.today?.todayConversions || 0) * 6000
  const monthlyRevenue = performance?.monthly?.totalRevenue || 0

  return (
    <div className="company-dashboard" style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      
      {/* ── 1. WELCOME HERO BANNER ───────────────────────────────────────────── */}
      <div style={{
        background: 'linear-gradient(135deg, #0a192f 0%, #1e3a8a 50%, #2563eb 100%)',
        borderRadius: '24px',
        padding: '2rem 2.25rem',
        color: '#ffffff',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '1.5rem',
        boxShadow: '0 20px 35px -10px rgba(10, 25, 47, 0.3)',
        border: '1px solid rgba(255, 255, 255, 0.1)'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
            <span style={{
              background: 'rgba(255, 255, 255, 0.15)',
              backdropFilter: 'blur(8px)',
              padding: '4px 12px',
              borderRadius: '20px',
              fontSize: '0.75rem',
              fontWeight: '700',
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              color: '#93c5fd'
            }}>
              {currentUser.role === 'admin' ? 'Super Admin' : (currentUser.role === 'manager' ? 'Team Manager' : 'Business Development Associate')}
            </span>
            <span style={{
              background: '#22c55e',
              color: '#ffffff',
              padding: '3px 10px',
              borderRadius: '20px',
              fontSize: '0.72rem',
              fontWeight: '700'
            }}>
              Portal Active
            </span>
          </div>
          <h1 style={{ margin: 0, fontSize: '1.85rem', fontWeight: '800', letterSpacing: '-0.03em' }}>
            Welcome, {currentUser.name}! 👋
          </h1>
          <p style={{ margin: '6px 0 0', fontSize: '0.92rem', color: '#cbd5e1' }}>
            Aparaitech Software Operations & Working Hub • {currentUser.department || 'Business Development'} Team
          </p>
        </div>

        {/* Quick Hub Stats Pill */}
        <div style={{
          display: 'flex',
          gap: '1.25rem',
          background: 'rgba(255, 255, 255, 0.08)',
          backdropFilter: 'blur(10px)',
          padding: '12px 20px',
          borderRadius: '16px',
          border: '1px solid rgba(255, 255, 255, 0.12)'
        }}>
          <div>
            <div style={{ fontSize: '0.7rem', color: '#93c5fd', textTransform: 'uppercase', fontWeight: '600' }}>Your Revenue</div>
            <div style={{ fontSize: '1.35rem', fontWeight: '800', color: '#38bdf8' }}>
              ₹{monthlyRevenue.toLocaleString('en-IN')}
            </div>
          </div>
          <div style={{ width: '1px', background: 'rgba(255, 255, 255, 0.15)' }} />
          <div>
            <div style={{ fontSize: '0.7rem', color: '#93c5fd', textTransform: 'uppercase', fontWeight: '600' }}>Target Done</div>
            <div style={{ fontSize: '1.35rem', fontWeight: '800', color: '#4ade80' }}>
              {performance?.targets?.achievedPercent || 0}%
            </div>
          </div>
        </div>
      </div>

      {/* ── 2. REMINDER / NOTIFICATION ALERTS ─────────────────────────────────── */}
      {!todayReportStatus.submitted && (
        <div style={{
          background: isPastEveningReminder ? '#fef2f2' : '#fffbeb',
          borderLeft: `5px solid ${isPastEveningReminder ? '#ef4444' : '#f59e0b'}`,
          borderRadius: '16px',
          padding: '14px 20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.03)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{
              width: '42px',
              height: '42px',
              borderRadius: '12px',
              background: isPastEveningReminder ? '#fee2e2' : '#fef3c7',
              color: isPastEveningReminder ? '#dc2626' : '#d97706',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.25rem'
            }}>
              <i className={isPastEveningReminder ? 'fas fa-bell fa-shake' : 'fas fa-exclamation-circle'}></i>
            </div>
            <div>
              <div style={{ fontWeight: '700', fontSize: '0.95rem', color: isPastEveningReminder ? '#991b1b' : '#92400e' }}>
                {isPastEveningReminder 
                  ? '⚠️ Critical Alert: Today\'s Daily Report is Pending! (Past 7:00 PM)' 
                  : 'Daily Report Reminder'}
              </div>
              <div style={{ fontSize: '0.82rem', color: isPastEveningReminder ? '#b91c1c' : '#b45309' }}>
                Please record your connected calls, calls &gt;3min, groups created, and conversions for today.
              </div>
            </div>
          </div>
          <button
            onClick={() => setDailyModalOpen(true)}
            style={{
              background: isPastEveningReminder ? '#ef4444' : '#f59e0b',
              color: '#ffffff',
              border: 'none',
              padding: '9px 18px',
              borderRadius: '10px',
              fontWeight: '700',
              fontSize: '0.85rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: '0 4px 10px rgba(0,0,0,0.1)'
            }}
          >
            <i className="fas fa-edit"></i> Submit Daily Report Now
          </button>
        </div>
      )}

      {/* Manager/Admin Alert: Team Pending Reports */}
      {isManagerOrAdmin && teamOverview && teamOverview.metrics?.reportsPending > 0 && (
        <div style={{
          background: '#f0f9ff',
          borderLeft: '5px solid #0284c7',
          borderRadius: '16px',
          padding: '14px 20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{
              width: '42px',
              height: '42px',
              borderRadius: '12px',
              background: '#e0f2fe',
              color: '#0284c7',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.25rem'
            }}>
              <i className="fas fa-user-clock"></i>
            </div>
            <div>
              <div style={{ fontWeight: '700', fontSize: '0.95rem', color: '#0369a1' }}>
                Manager Oversight: {teamOverview.metrics.reportsPending} Employees Have Not Submitted Reports
              </div>
              <div style={{ fontSize: '0.82rem', color: '#075985' }}>
                {teamOverview.metrics.reportsSubmitted} submitted • {teamOverview.metrics.checkedInToday} checked in today • Today's Company Revenue: ₹{(teamOverview.metrics.todayRevenue || 0).toLocaleString('en-IN')}
              </div>
            </div>
          </div>
          <button
            onClick={() => onNavigate('managerReports')}
            style={{
              background: '#0284c7',
              color: '#ffffff',
              border: 'none',
              padding: '9px 18px',
              borderRadius: '10px',
              fontWeight: '700',
              fontSize: '0.85rem',
              cursor: 'pointer'
            }}
          >
            Review Pending List
          </button>
        </div>
      )}

      {/* ── 3. ATTENDANCE & QUICK ACTION TOOLBAR ─────────────────────────────── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 290px), 1fr))',
        gap: '1.25rem'
      }}>
        {/* Attendance Status Card */}
        <div style={{
          background: '#ffffff',
          borderRadius: '20px',
          padding: '1.5rem',
          border: '1px solid #e2e8f0',
          boxShadow: '0 4px 20px -2px rgba(0, 0, 0, 0.03)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between'
        }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '700', fontSize: '1rem', color: '#0a192f' }}>
                <i className="fas fa-fingerprint" style={{ color: '#2563eb' }}></i>
                Today's Attendance Status
              </div>
              <span style={{
                background: activeSession ? '#dcfce7' : (todayAttendance?.checkOut ? '#e0f2fe' : '#f1f5f9'),
                color: activeSession ? '#15803d' : (todayAttendance?.checkOut ? '#0369a1' : '#64748b'),
                fontSize: '0.76rem',
                fontWeight: '700',
                padding: '4px 10px',
                borderRadius: '20px'
              }}>
                {activeSession ? '🟢 Checked In (Working)' : (todayAttendance?.checkOut ? '🔵 Completed' : '⚪ Not Checked In')}
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', margin: '14px 0', fontSize: '0.85rem' }}>
              <div style={{ background: '#f8fafc', padding: '10px 14px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                <div style={{ color: '#64748b', fontSize: '0.75rem', fontWeight: '600' }}>CHECK-IN TIME</div>
                <div style={{ fontWeight: '700', fontSize: '0.98rem', color: '#0a192f', marginTop: '2px' }}>
                  {activeSession ? activeSession.checkInTime : (todayAttendance?.checkIn || '—')}
                </div>
              </div>
              <div style={{ background: '#f8fafc', padding: '10px 14px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                <div style={{ color: '#64748b', fontSize: '0.75rem', fontWeight: '600' }}>CHECK-OUT TIME</div>
                <div style={{ fontWeight: '700', fontSize: '0.98rem', color: '#0a192f', marginTop: '2px' }}>
                  {todayAttendance?.checkOut || '—'}
                </div>
              </div>
            </div>

            <div style={{ fontSize: '0.8rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <i className="fas fa-clock" style={{ color: '#2563eb' }}></i>
              Shift: <strong>{userShift.name} ({userShift.startTime} - {userShift.endTime})</strong>
            </div>
            <div style={{ fontSize: '0.8rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px' }}>
              <i className="fas fa-map-marker-alt" style={{ color: '#ef4444' }}></i>
              Geofence: <strong>{GEOFENCE.name} (200m)</strong>
            </div>
          </div>

          <div style={{ marginTop: '16px', display: 'flex', gap: '10px' }}>
            <button
              onClick={() => onNavigate('attendance')}
              style={{
                flex: 1,
                background: 'linear-gradient(135deg, #1e5a7a 0%, #0f2b3d 100%)',
                color: '#ffffff',
                border: 'none',
                padding: '10px',
                borderRadius: '10px',
                fontWeight: '600',
                fontSize: '0.84rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px'
              }}
            >
              <i className="fas fa-camera"></i> Face Punch & Logs
            </button>
          </div>
        </div>

        {/* Working Actions Card */}
        <div style={{
          background: '#ffffff',
          borderRadius: '20px',
          padding: '1.5rem',
          border: '1px solid #e2e8f0',
          boxShadow: '0 4px 20px -2px rgba(0, 0, 0, 0.03)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between'
        }}>
          <div>
            <div style={{ fontWeight: '700', fontSize: '1rem', color: '#0a192f', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <i className="fas fa-bolt" style={{ color: '#f59e0b' }}></i>
              Working Portal Quick Actions
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              {/* Daily Report Button */}
              <button
                onClick={() => setDailyModalOpen(true)}
                style={{
                  background: '#f0fdf4',
                  border: '1px solid #bbf7d0',
                  borderRadius: '12px',
                  padding: '14px 12px',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.2s',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '4px'
                }}
              >
                <div style={{ color: '#16a34a', fontSize: '1.25rem' }}>
                  <i className="fas fa-file-invoice"></i>
                </div>
                <div style={{ fontWeight: '700', fontSize: '0.88rem', color: '#14532d' }}>Daily Report</div>
                <div style={{ fontSize: '0.72rem', color: '#166534' }}>
                  {todayReportStatus.submitted ? '✅ Submitted (Edit)' : '⏳ Submit Today\'s Form'}
                </div>
              </button>

              {/* Mail Blast Report Button */}
              <button
                onClick={() => setMailBlastModalOpen(true)}
                style={{
                  background: '#f0f9ff',
                  border: '1px solid #bae6fd',
                  borderRadius: '12px',
                  padding: '14px 12px',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.2s',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '4px'
                }}
              >
                <div style={{ color: '#0284c7', fontSize: '1.25rem' }}>
                  <i className="fas fa-mail-bulk"></i>
                </div>
                <div style={{ fontWeight: '700', fontSize: '0.88rem', color: '#0c4a6e' }}>Mail Blast</div>
                <div style={{ fontSize: '0.72rem', color: '#0369a1' }}>Log email campaign metrics</div>
              </button>

              {/* Message Centre Button */}
              <button
                onClick={() => onNavigate(currentUser.role === 'admin' ? 'messaging' : 'inbox')}
                style={{
                  background: '#fdf4ff',
                  border: '1px solid #f5d0fe',
                  borderRadius: '12px',
                  padding: '14px 12px',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.2s',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '4px',
                  position: 'relative'
                }}
              >
                <div style={{ color: '#a855f7', fontSize: '1.25rem' }}>
                  <i className="fas fa-comment-dots"></i>
                </div>
                <div style={{ fontWeight: '700', fontSize: '0.88rem', color: '#581c87' }}>Message Centre</div>
                <div style={{ fontSize: '0.72rem', color: '#7e22ce' }}>
                  {unreadMessagesCount > 0 ? `${unreadMessagesCount} unread` : 'Inbox & Alerts'}
                </div>
                {unreadMessagesCount > 0 && (
                  <span style={{
                    position: 'absolute',
                    top: '10px',
                    right: '10px',
                    background: '#ef4444',
                    color: '#ffffff',
                    borderRadius: '12px',
                    padding: '2px 8px',
                    fontSize: '0.7rem',
                    fontWeight: '800'
                  }}>
                    {unreadMessagesCount}
                  </span>
                )}
              </button>

              {/* Full Performance Button */}
              <button
                onClick={() => onNavigate('performance')}
                style={{
                  background: '#fefce8',
                  border: '1px solid #fef08a',
                  borderRadius: '12px',
                  padding: '14px 12px',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.2s',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '4px'
                }}
              >
                <div style={{ color: '#ca8a04', fontSize: '1.25rem' }}>
                  <i className="fas fa-chart-pie"></i>
                </div>
                <div style={{ fontWeight: '700', fontSize: '0.88rem', color: '#713f12' }}>My Performance</div>
                <div style={{ fontSize: '0.72rem', color: '#854d0e' }}>Detailed call & lead graphs</div>
              </button>

              {/* Log Product Conversion Button */}
              <button
                onClick={() => setConversionModalOpen(true)}
                style={{
                  background: 'linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 100%)',
                  border: '1.5px solid #86efac',
                  borderRadius: '12px',
                  padding: '12px 14px',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.2s',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '4px',
                  gridColumn: '1 / -1'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ color: '#16a34a', fontSize: '1.25rem' }}>
                    <i className="fas fa-hand-holding-usd"></i>
                  </div>
                  <span style={{ background: '#dcfce7', color: '#15803d', fontSize: '0.72rem', fontWeight: '800', padding: '2px 8px', borderRadius: '6px' }}>
                    ₹1.5k Onboarding • ₹4.5k Final • ₹6k Full
                  </span>
                </div>
                <div style={{ fontWeight: '800', fontSize: '0.92rem', color: '#14532d' }}>
                  + Fill Candidate Onboarding / Product Sale Data
                </div>
                <div style={{ fontSize: '0.74rem', color: '#166534' }}>
                  Log candidate contact, college, payment UTR, and immediately add revenue.
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── 4. MY PERFORMANCE KPI SUMMARY CARDS ──────────────────────────────── */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: '700', color: '#0a192f' }}>
            <i className="fas fa-tachometer-alt" style={{ marginRight: '8px', color: '#2563eb' }}></i>
            My Performance Snapshot
          </h3>
          <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Calculated in real-time</span>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1rem'
        }}>
          {/* Card 1: Connected Calls */}
          <div style={{
            background: '#ffffff',
            borderRadius: '16px',
            padding: '1.25rem',
            border: '1px solid #e2e8f0',
            boxShadow: '0 2px 10px rgba(0,0,0,0.02)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#64748b', fontSize: '0.78rem', fontWeight: '600' }}>
              <span>CONNECTED CALLS</span>
              <i className="fas fa-phone-alt" style={{ color: '#2563eb' }}></i>
            </div>
            <div style={{ fontSize: '1.8rem', fontWeight: '800', color: '#0a192f', marginTop: '6px' }}>
              {performance?.today?.connectedCalls || 0}
            </div>
            <div style={{ fontSize: '0.76rem', color: '#64748b', marginTop: '4px' }}>
              This month: <strong>{performance?.monthly?.totalCalls || 0}</strong> • &gt;3min: {performance?.today?.callsAbove3Min || 0}
            </div>
          </div>

          {/* Card 2: Groups Created & Members */}
          <div style={{
            background: '#ffffff',
            borderRadius: '16px',
            padding: '1.25rem',
            border: '1px solid #e2e8f0',
            boxShadow: '0 2px 10px rgba(0,0,0,0.02)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#64748b', fontSize: '0.78rem', fontWeight: '600' }}>
              <span>GROUPS CREATED</span>
              <i className="fas fa-users" style={{ color: '#059669' }}></i>
            </div>
            <div style={{ fontSize: '1.8rem', fontWeight: '800', color: '#0a192f', marginTop: '6px' }}>
              {performance?.today?.groupsCreated || 0}
            </div>
            <div style={{ fontSize: '0.76rem', color: '#64748b', marginTop: '4px' }}>
              Total members: <strong>{performance?.today?.membersInGroups || 0}</strong> (Month: {performance?.monthly?.totalGroups || 0})
            </div>
          </div>

          {/* Card 3: Today's Conversions */}
          <div style={{
            background: '#ffffff',
            borderRadius: '16px',
            padding: '1.25rem',
            border: '1px solid #e2e8f0',
            boxShadow: '0 2px 10px rgba(0,0,0,0.02)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#64748b', fontSize: '0.78rem', fontWeight: '600' }}>
              <span>CONVERSIONS</span>
              <i className="fas fa-award" style={{ color: '#d97706' }}></i>
            </div>
            <div style={{ fontSize: '1.8rem', fontWeight: '800', color: '#0a192f', marginTop: '6px' }}>
              {performance?.today?.todayConversions || 0}
            </div>
            <div style={{ fontSize: '0.76rem', color: '#64748b', marginTop: '4px' }}>
              Monthly total: <strong>{performance?.monthly?.totalConversions || 0}</strong> candidates
            </div>
          </div>

          {/* Card 4: Revenue Tracker */}
          <div style={{
            background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)',
            borderRadius: '16px',
            padding: '1.25rem',
            border: '1px solid #bfdbfe',
            boxShadow: '0 2px 10px rgba(37, 99, 235, 0.08)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#1e40af', fontSize: '0.78rem', fontWeight: '700' }}>
              <span>REVENUE GENERATED</span>
              <i className="fas fa-rupee-sign" style={{ color: '#2563eb' }}></i>
            </div>
            <div style={{ fontSize: '1.8rem', fontWeight: '900', color: '#1d4ed8', marginTop: '6px' }}>
              ₹{todayRevenue.toLocaleString('en-IN')}
            </div>
            <div style={{ fontSize: '0.76rem', color: '#1e40af', marginTop: '4px' }}>
              ₹6,000/conv • Month: <strong>₹{monthlyRevenue.toLocaleString('en-IN')}</strong>
            </div>
          </div>
        </div>
      </div>

      {/* ── 5. MINI LEADERBOARD & REVENUE PREVIEW ROW ────────────────────────── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 290px), 1fr))',
        gap: '1.25rem'
      }}>
        {/* Leaderboard Card */}
        <div style={{
          background: '#ffffff',
          borderRadius: '20px',
          padding: '1.5rem',
          border: '1px solid #e2e8f0',
          boxShadow: '0 4px 20px -2px rgba(0, 0, 0, 0.03)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <div style={{ fontWeight: '700', fontSize: '1rem', color: '#0a192f', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <i className="fas fa-trophy" style={{ color: '#eab308' }}></i>
              Top Performers (This Month)
            </div>
            <button
              onClick={() => onNavigate('leaderboard')}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#2563eb',
                fontWeight: '700',
                fontSize: '0.8rem',
                cursor: 'pointer'
              }}
            >
              View Full Leaderboard ↗
            </button>
          </div>

          {miniLeaderboard.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '1.5rem', color: '#94a3b8', fontSize: '0.85rem' }}>
              No conversion records submitted yet this month. Be the first!
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {miniLeaderboard.map((item, idx) => (
                <div
                  key={item._id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '10px 14px',
                    borderRadius: '12px',
                    background: idx === 0 ? '#fefce8' : '#f8fafc',
                    border: `1px solid ${idx === 0 ? '#fef08a' : '#e2e8f0'}`
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{
                      width: '28px',
                      height: '28px',
                      borderRadius: '50%',
                      background: idx === 0 ? '#eab308' : (idx === 1 ? '#94a3b8' : '#cd7f32'),
                      color: '#ffffff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: '800',
                      fontSize: '0.8rem'
                    }}>
                      {idx + 1}
                    </span>
                    <div>
                      <div style={{ fontWeight: '700', fontSize: '0.88rem', color: '#0a192f' }}>
                        {item.name}
                      </div>
                      <div style={{ fontSize: '0.74rem', color: '#64748b' }}>
                        {item.team || 'BDA'} • {item.totalCalls || 0} calls
                      </div>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontWeight: '800', fontSize: '0.92rem', color: '#2563eb' }}>
                      {item.totalConversions} Convs
                    </div>
                    <div style={{ fontSize: '0.74rem', color: '#16a34a', fontWeight: '600' }}>
                      ₹{(item.totalRevenue || 0).toLocaleString('en-IN')}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Revenue Tracker Widget */}
        <div style={{
          background: '#ffffff',
          borderRadius: '20px',
          padding: '1.5rem',
          border: '1px solid #e2e8f0',
          boxShadow: '0 4px 20px -2px rgba(0, 0, 0, 0.03)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between'
        }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <div style={{ fontWeight: '700', fontSize: '1rem', color: '#0a192f', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <i className="fas fa-chart-line" style={{ color: '#16a34a' }}></i>
                Revenue Tracker Summary
              </div>
              <button
                onClick={() => onNavigate('revenue')}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#2563eb',
                  fontWeight: '700',
                  fontSize: '0.8rem',
                  cursor: 'pointer'
                }}
              >
                Detailed Breakdown ↗
              </button>
            </div>

            <div style={{
              background: '#f8fafc',
              borderRadius: '14px',
              padding: '1rem',
              border: '1px solid #e2e8f0',
              marginBottom: '1rem'
            }}>
              <div style={{ fontSize: '0.8rem', color: '#64748b' }}>Conversion Multiplier Formula</div>
              <div style={{ fontSize: '1.1rem', fontWeight: '800', color: '#0a192f', margin: '4px 0' }}>
                1 Confirmed Product = ₹6,000 Revenue
              </div>
              <div style={{ fontSize: '0.78rem', color: '#475569' }}>
                Every product conversion recorded in your daily report automatically accrues ₹6,000 towards your and the company's verified portfolio.
              </div>
            </div>

            {/* Target Progress Bar */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', marginBottom: '6px' }}>
                <span style={{ fontWeight: '600', color: '#475569' }}>Monthly Target Goal (10 Convs = ₹60,000)</span>
                <span style={{ fontWeight: '800', color: '#2563eb' }}>
                  {performance?.monthly?.totalConversions || 0} / 10
                </span>
              </div>
              <div style={{
                height: '10px',
                borderRadius: '5px',
                background: '#e2e8f0',
                overflow: 'hidden'
              }}>
                <div style={{
                  height: '100%',
                  width: `${Math.min(100, ((performance?.monthly?.totalConversions || 0) / 10) * 100)}%`,
                  background: 'linear-gradient(90deg, #2563eb, #10b981)',
                  borderRadius: '5px',
                  transition: 'width 0.5s ease-out'
                }} />
              </div>
            </div>
          </div>

          <div style={{ marginTop: '16px', display: 'flex', gap: '10px' }}>
            <button
              onClick={() => setDailyModalOpen(true)}
              style={{
                flex: 1,
                background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
                color: '#ffffff',
                border: 'none',
                padding: '10px',
                borderRadius: '10px',
                fontWeight: '700',
                fontSize: '0.84rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px'
              }}
            >
              <i className="fas fa-plus-circle"></i> Log Today's Conversions
            </button>
          </div>
        </div>
      </div>

      {/* ── MODALS ──────────────────────────────────────────────────────────── */}
      <DailyReportModal
        isOpen={dailyModalOpen}
        onClose={() => setDailyModalOpen(false)}
        currentUser={currentUser}
        onSuccess={() => fetchData()}
        showToast={showToast}
      />

      <MailBlastModal
        isOpen={mailBlastModalOpen}
        onClose={() => setMailBlastModalOpen(false)}
        currentUser={currentUser}
        onSuccess={() => fetchData()}
        showToast={showToast}
      />

      {conversionModalOpen && (
        <ConversionDataFillModal
          isOpen={conversionModalOpen}
          onClose={() => setConversionModalOpen(false)}
          currentUser={currentUser}
          onSuccess={() => fetchData()}
          showToast={showToast}
        />
      )}
    </div>
  )
}

export default CompanyDashboard
