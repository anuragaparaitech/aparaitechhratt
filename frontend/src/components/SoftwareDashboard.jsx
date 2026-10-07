import React, { useState, useEffect } from 'react'
import { taskAPI, projectAPI, reportsAPI, attendanceAPI } from '../services/api'
import { useAutoRefresh, SYNC_EVENTS } from '../utils/realtimeSync'
import SoftwareDailyReportModal from './SoftwareDailyReportModal'
import MarkAttendanceModal from './MarkAttendanceModal'

function SoftwareDashboard({ currentUser, onNavigate, showToast, onOpenProfile, onOpenPin }) {
  const [tasks, setTasks] = useState([])
  const [projects, setProjects] = useState([])
  const [todayReportSubmitted, setTodayReportSubmitted] = useState(false)
  const [todayAttendance, setTodayAttendance] = useState(null)
  const [isReportModalOpen, setIsReportModalOpen] = useState(false)
  const [isAttendanceModalOpen, setIsAttendanceModalOpen] = useState(false)
  const [loading, setLoading] = useState(true)

  const todayStr = new Date().toISOString().split('T')[0]
  const currentHour = new Date().getHours()
  const isAfter7PM = currentHour >= 19

  useEffect(() => {
    loadDashboardData(false)
  }, [currentUser?.email])

  // Live Auto-Refresh every 5 seconds, on tab focus, and on any sprint/attendance events
  useAutoRefresh(() => {
    loadDashboardData(true)
  }, {
    intervalMs: 5000,
    eventTypes: [
      SYNC_EVENTS.TASK_ASSIGNED,
      SYNC_EVENTS.TASK_UPDATED,
      SYNC_EVENTS.ATTENDANCE_UPDATED,
      SYNC_EVENTS.DAILY_REPORT_SUBMITTED
    ],
    onFocus: true,
    enabled: true
  })

  const loadDashboardData = async (isSilent = false) => {
    if (!isSilent) setLoading(true)
    try {
      const [tRes, pRes, rRes, aRes] = await Promise.allSettled([
        taskAPI.getMyTasks(),
        projectAPI.getAll(),
        reportsAPI.getTodayStatus(todayStr, currentUser.email),
        attendanceAPI.getTodayStatus(currentUser.email, todayStr)
      ])

      if (tRes.status === 'fulfilled' && tRes.value.success) setTasks(tRes.value.data || [])
      if (pRes.status === 'fulfilled' && pRes.value.data) setProjects(pRes.value.data || [])
      if (rRes.status === 'fulfilled' && rRes.value.hasSubmitted) setTodayReportSubmitted(true)
      if (aRes.status === 'fulfilled' && aRes.value.data) setTodayAttendance(aRes.value.data)
    } catch (err) {
      console.error('SoftwareDashboard load error:', err)
    } finally {
      if (!isSilent) setLoading(false)
    }
  }

  const myCompleted = tasks.filter(t => t.status === 'Done' || t.status === 'Completed').length
  const myPending = tasks.filter(t => t.status === 'To Do' || t.status === 'Pending').length
  const myInProgress = tasks.filter(t => t.status === 'In Progress' || t.status === 'In Review').length

  const isCheckedIn = Boolean(todayAttendance && todayAttendance.checkIn)
  const isCheckedOut = Boolean(todayAttendance && todayAttendance.checkOut)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', width: '100%' }}>
      {/* 1. Executive Welcome & Shift Status Banner */}
      <div style={{
        background: 'linear-gradient(135deg, #0a192f 0%, #1e3a8a 50%, #0369a1 100%)',
        borderRadius: '24px',
        padding: '2rem 2.25rem',
        color: '#ffffff',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '1.25rem',
        boxShadow: '0 15px 35px -5px rgba(10, 25, 47, 0.35)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Ambient glow */}
        <div style={{ position: 'absolute', right: '-50px', top: '-50px', width: '250px', height: '250px', background: 'radial-gradient(circle, rgba(56, 189, 248, 0.25) 0%, transparent 70%)', pointerEvents: 'none' }} />

        <div style={{ zIndex: 1, maxWidth: '650px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '4px 12px', background: 'rgba(56, 189, 248, 0.15)', borderRadius: '999px', fontSize: '0.75rem', fontWeight: '800', color: '#38bdf8', marginBottom: '10px' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#38bdf8', boxShadow: '0 0 8px #38bdf8' }} />
            SOFTWARE TEAM WORK PORTAL • SHIFT 1 (07:00 AM - 11:00 AM)
          </div>
          <h1 style={{ fontSize: '1.85rem', fontWeight: '900', margin: '0 0 6px 0', letterSpacing: '-0.02em' }}>
            Welcome back, {currentUser.name}! 💻
          </h1>
          <p style={{ margin: 0, fontSize: '0.9rem', color: '#bfdbfe', lineHeight: 1.5 }}>
            {currentUser.designation || 'Software Engineer'} • {currentUser.department || 'Development'} • Status: {isCheckedIn ? (isCheckedOut ? 'Completed Shift' : 'Checked In (Active)') : 'Pending Check-In'}
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap', zIndex: 1 }}>
          {onOpenProfile && (
            <button
              onClick={onOpenProfile}
              style={{
                background: 'rgba(255, 255, 255, 0.15)',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                color: '#ffffff',
                borderRadius: '12px',
                padding: '12px 16px',
                fontWeight: '800',
                fontSize: '0.88rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                backdropFilter: 'blur(8px)'
              }}
            >
              <i className="fas fa-user-circle" style={{ color: '#38bdf8' }}></i>
              My Profile
            </button>
          )}

          {onOpenPin && (
            <button
              onClick={onOpenPin}
              style={{
                background: 'linear-gradient(135deg, #059669, #047857)',
                color: '#ffffff',
                border: 'none',
                borderRadius: '12px',
                padding: '12px 16px',
                fontWeight: '800',
                fontSize: '0.88rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: '0 4px 14px rgba(5, 150, 105, 0.35)'
              }}
            >
              <i className="fas fa-th"></i>
              Edit PIN
            </button>
          )}

          <button
            onClick={() => setIsAttendanceModalOpen(true)}
            style={{
              background: isCheckedIn ? (isCheckedOut ? '#475569' : '#e11d48') : 'linear-gradient(135deg, #10b981, #059669)',
              color: '#ffffff',
              border: 'none',
              borderRadius: '12px',
              padding: '12px 20px',
              fontWeight: '800',
              fontSize: '0.88rem',
              cursor: isCheckedOut ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              boxShadow: '0 4px 14px rgba(0, 0, 0, 0.25)',
              transition: 'all 0.2s'
            }}
            disabled={isCheckedOut}
          >
            <i className="fas fa-fingerprint"></i>
            {isCheckedIn ? (isCheckedOut ? 'Shift Completed ✓' : 'Punch Out (Exit)') : 'Punch In (Face + GPS)'}
          </button>

          <button
            onClick={() => setIsReportModalOpen(true)}
            style={{
              background: todayReportSubmitted ? '#0284c7' : 'linear-gradient(135deg, #2563eb, #1d4ed8)',
              color: '#ffffff',
              border: 'none',
              borderRadius: '12px',
              padding: '12px 20px',
              fontWeight: '800',
              fontSize: '0.88rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              boxShadow: '0 4px 14px rgba(37, 99, 235, 0.4)'
            }}
          >
            <i className="fas fa-clipboard-check"></i>
            {todayReportSubmitted ? 'Edit Today\'s Report' : 'Submit Daily Report'}
          </button>
        </div>
      </div>

      {/* 2. 7:00 PM Daily Work Report Deadline Alert Banner */}
      {!todayReportSubmitted && (
        <div style={{
          background: isAfter7PM ? '#fef2f2' : '#eff6ff',
          border: `1.5px solid ${isAfter7PM ? '#fca5a5' : '#bfdbfe'}`,
          borderRadius: '16px',
          padding: '1rem 1.4rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              background: isAfter7PM ? '#ef4444' : '#2563eb',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.1rem',
              flexShrink: 0
            }}>
              <i className="fas fa-bell"></i>
            </div>
            <div>
              <div style={{ fontWeight: '800', fontSize: '0.9rem', color: isAfter7PM ? '#991b1b' : '#1e3a8a' }}>
                {isAfter7PM ? '⚠️ Daily Work Report Past Due (7:00 PM Deadline)' : '📋 Daily Work Report Reminder (Due by 7:00 PM)'}
              </div>
              <div style={{ fontSize: '0.78rem', color: isAfter7PM ? '#b91c1c' : '#3b82f6' }}>
                Record your tasks completed today, active blockers, and tomorrow's engineering sprint plan.
              </div>
            </div>
          </div>

          <button
            onClick={() => setIsReportModalOpen(true)}
            style={{
              background: isAfter7PM ? '#ef4444' : '#2563eb',
              color: '#ffffff',
              border: 'none',
              borderRadius: '10px',
              padding: '8px 18px',
              fontWeight: '800',
              fontSize: '0.82rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            Submit Report Now →
          </button>
        </div>
      )}

      {/* 3. Core Software Metrics & KPI Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
        gap: '1rem'
      }}>
        <div
          onClick={() => onNavigate('tasks')}
          style={{
            background: '#ffffff',
            borderRadius: '18px',
            padding: '1.25rem',
            border: '1px solid #e2e8f0',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
            cursor: 'pointer',
            transition: 'transform 0.15s, box-shadow 0.15s'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)'
            e.currentTarget.style.boxShadow = '0 8px 18px -4px rgba(0, 0, 0, 0.1)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)'
            e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.05)'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.78rem', fontWeight: '800', color: '#64748b' }}>ACTIVE SPRINT TASKS</span>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#eff6ff', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <i className="fas fa-tasks"></i>
            </div>
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: '900', color: '#0f172a' }}>{tasks.length}</div>
          <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '4px', display: 'flex', gap: '8px' }}>
            <span style={{ color: '#10b981', fontWeight: '700' }}>✓ {myCompleted} Done</span>
            <span>•</span>
            <span style={{ color: '#2563eb', fontWeight: '700' }}>⏳ {myInProgress} Active</span>
          </div>
        </div>

        <div
          onClick={() => onNavigate('projects')}
          style={{
            background: '#ffffff',
            borderRadius: '18px',
            padding: '1.25rem',
            border: '1px solid #e2e8f0',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
            cursor: 'pointer',
            transition: 'transform 0.15s, box-shadow 0.15s'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)'
            e.currentTarget.style.boxShadow = '0 8px 18px -4px rgba(0, 0, 0, 0.1)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)'
            e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.05)'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.78rem', fontWeight: '800', color: '#64748b' }}>PROJECTS HUB</span>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#ecfdf5', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <i className="fas fa-cubes"></i>
            </div>
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: '900', color: '#059669' }}>{projects.length}</div>
          <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '4px' }}>
            Enterprise codebases & milestones
          </div>
        </div>

        <div
          onClick={() => onNavigate('codeRepo')}
          style={{
            background: '#ffffff',
            borderRadius: '18px',
            padding: '1.25rem',
            border: '1px solid #e2e8f0',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
            cursor: 'pointer',
            transition: 'transform 0.15s, box-shadow 0.15s'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)'
            e.currentTarget.style.boxShadow = '0 8px 18px -4px rgba(0, 0, 0, 0.1)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)'
            e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.05)'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.78rem', fontWeight: '800', color: '#64748b' }}>GITHUB COMMITS</span>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#f8fafc', color: '#0f172a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <i className="fab fa-github"></i>
            </div>
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: '900', color: '#0f172a' }}>142+</div>
          <div style={{ fontSize: '0.72rem', color: '#2563eb', marginTop: '4px' }}>
            Branch main • Synced
          </div>
        </div>

        <div
          onClick={() => onNavigate('performance')}
          style={{
            background: '#ffffff',
            borderRadius: '18px',
            padding: '1.25rem',
            border: '1px solid #e2e8f0',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
            cursor: 'pointer',
            transition: 'transform 0.15s, box-shadow 0.15s'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)'
            e.currentTarget.style.boxShadow = '0 8px 18px -4px rgba(0, 0, 0, 0.1)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)'
            e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.05)'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.78rem', fontWeight: '800', color: '#64748b' }}>VELOCITY SCORE</span>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#fefce8', color: '#eab308', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <i className="fas fa-star"></i>
            </div>
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: '900', color: '#eab308' }}>4.9 <span style={{ fontSize: '0.9rem', color: '#64748b' }}>/ 5.0</span></div>
          <div style={{ fontSize: '0.72rem', color: '#10b981', marginTop: '4px' }}>
            High reliability sprint delivery
          </div>
        </div>
      </div>

      {/* 4. Active Sprint Tasks Preview & Ongoing Projects Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '1.25rem' }}>
        {/* Sprint Tasks Preview */}
        <div style={{
          background: '#ffffff',
          borderRadius: '18px',
          border: '1px solid #e2e8f0',
          padding: '1.5rem',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: '900', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <i className="fas fa-clipboard-list" style={{ color: '#2563eb' }}></i>
              My Active Sprint Tasks
            </h3>
            <button
              onClick={() => onNavigate('tasks')}
              style={{ background: 'none', border: 'none', color: '#2563eb', fontWeight: '700', fontSize: '0.8rem', cursor: 'pointer' }}
            >
              View Board →
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {tasks.slice(0, 4).map(task => (
              <div
                key={task._id}
                onClick={() => onNavigate('tasks')}
                style={{
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '12px',
                  padding: '10px 14px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  cursor: 'pointer'
                }}
              >
                <div>
                  <div style={{ fontWeight: '700', fontSize: '0.85rem', color: '#0f172a', marginBottom: '2px' }}>
                    {task.title}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: '#64748b' }}>
                    📅 Due: {task.deadline} • {task.projectName || 'Aparaitech Core'}
                  </div>
                </div>

                <span style={{
                  background: task.status === 'Done' ? '#ecfdf5' : (task.status === 'In Progress' ? '#eff6ff' : '#f1f5f9'),
                  color: task.status === 'Done' ? '#059669' : (task.status === 'In Progress' ? '#2563eb' : '#475569'),
                  padding: '3px 10px',
                  borderRadius: '999px',
                  fontSize: '0.7rem',
                  fontWeight: '800'
                }}>
                  {task.status || 'To Do'}
                </span>
              </div>
            ))}

            {tasks.length === 0 && (
              <div style={{ padding: '2rem 1rem', textAlign: 'center', color: '#94a3b8', fontSize: '0.82rem' }}>
                No active tasks assigned yet.
              </div>
            )}
          </div>
        </div>

        {/* Ongoing Projects Progress Widget */}
        <div style={{
          background: '#ffffff',
          borderRadius: '18px',
          border: '1px solid #e2e8f0',
          padding: '1.5rem',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: '900', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <i className="fas fa-layer-group" style={{ color: '#059669' }}></i>
              Engineering Projects & Milestones
            </h3>
            <button
              onClick={() => onNavigate('projects')}
              style={{ background: 'none', border: 'none', color: '#059669', fontWeight: '700', fontSize: '0.8rem', cursor: 'pointer' }}
            >
              All Projects →
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {projects.slice(0, 3).map(proj => {
              const completedCount = proj.milestones ? proj.milestones.filter(m => m.status === 'Completed').length : 0
              const totalCount = proj.milestones ? proj.milestones.length : 0
              const progress = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : (proj.progressPercentage || 0)

              return (
                <div
                  key={proj._id}
                  onClick={() => onNavigate('projects')}
                  style={{
                    background: '#f8fafc',
                    border: '1px solid #e2e8f0',
                    borderRadius: '12px',
                    padding: '10px 14px',
                    cursor: 'pointer'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <strong style={{ fontSize: '0.85rem', color: '#0f172a' }}>{proj.title}</strong>
                    <span style={{ fontSize: '0.75rem', fontWeight: '800', color: '#2563eb' }}>{progress}%</span>
                  </div>
                  <div style={{ width: '100%', height: '6px', background: '#e2e8f0', borderRadius: '999px', overflow: 'hidden' }}>
                    <div style={{ width: `${progress}%`, height: '100%', background: '#2563eb', borderRadius: '999px' }} />
                  </div>
                  <div style={{ fontSize: '0.7rem', color: '#64748b', marginTop: '4px' }}>
                    Code: <strong>{proj.code}</strong> • Deadline: {proj.deadline}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Attendance Punch Modal */}
      <MarkAttendanceModal
        isOpen={isAttendanceModalOpen}
        onClose={() => {
          setIsAttendanceModalOpen(false)
          loadDashboardData()
        }}
        currentUser={currentUser}
        showToast={showToast}
        todayRecord={todayAttendance}
      />

      {/* Daily Report Submission Modal */}
      <SoftwareDailyReportModal
        isOpen={isReportModalOpen}
        onClose={() => {
          setIsReportModalOpen(false)
          loadDashboardData()
        }}
        currentUser={currentUser}
        showToast={showToast}
        onReportSubmitted={() => {
          setTodayReportSubmitted(true)
          loadDashboardData()
        }}
      />
    </div>
  )
}

export default SoftwareDashboard
