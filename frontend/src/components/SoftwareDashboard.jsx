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

  // Live Auto-Refresh every 15 seconds, on tab focus, and on any sprint/attendance events
  useAutoRefresh(() => {
    loadDashboardData(true)
  }, {
    intervalMs: 15000,
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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', width: '100%' }}>

      {/* 1. Executive Profile & Shift Status Header */}
      <div style={{
        background: '#FFFFFF',
        borderRadius: '4px',
        border: '1px solid #E4E4E7',
        padding: '20px 24px',
        boxShadow: '0 1px 3px rgba(9, 9, 11, 0.05)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '16px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', maxWidth: '640px' }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '50%',
            background: '#09090B',
            color: '#38BDF8',
            border: '2px solid #0EA5E9',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 700,
            fontSize: '18px',
            flexShrink: 0
          }}>
            {currentUser?.name ? currentUser.name.charAt(0).toUpperCase() : 'U'}
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px', flexWrap: 'wrap' }}>
              <h1 style={{ fontSize: '18px', fontWeight: 600, color: '#09090B', margin: 0 }}>
                {currentUser.name}
              </h1>
              <span className="badge badge-brand" style={{ fontSize: '11px' }}>
                SOFTWARE ENGINEERING
              </span>
              <span className={`badge ${isCheckedIn ? (isCheckedOut ? 'badge-neutral' : 'badge-success') : 'badge-warning'}`} style={{ fontSize: '11px' }}>
                {isCheckedIn ? (isCheckedOut ? 'Shift Completed' : 'Checked In • Active') : 'Pending Punch-In'}
              </span>
            </div>
            <p style={{ margin: 0, fontSize: '13px', color: '#71717A', lineHeight: 1.4 }}>
              {currentUser.designation || 'Software Engineer'} • {currentUser.department || 'Development'} • ID: {currentUser.empId || 'N/A'} • Shift: 07:00 AM - 11:00 AM
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
          {onOpenProfile && (
            <button
              onClick={onOpenProfile}
              className="btn btn-secondary"
              style={{ fontSize: '13px', padding: '6px 12px' }}
            >
              <i className="fas fa-user-circle"></i>
              Profile
            </button>
          )}

          {onOpenPin && (
            <button
              onClick={onOpenPin}
              className="btn btn-secondary"
              style={{ fontSize: '13px', padding: '6px 12px' }}
            >
              <i className="fas fa-key"></i>
              Passcode
            </button>
          )}

          <button
            onClick={() => setIsAttendanceModalOpen(true)}
            className={`btn ${isCheckedIn ? (isCheckedOut ? 'btn-secondary' : 'btn-danger') : 'btn-primary'}`}
            style={{ fontSize: '13px', padding: '6px 14px' }}
            disabled={isCheckedOut}
          >
            <i className="fas fa-fingerprint"></i>
            {isCheckedIn ? (isCheckedOut ? 'Shift Complete' : 'Punch Out') : 'Punch In'}
          </button>

          <button
            onClick={() => setIsReportModalOpen(true)}
            className="btn btn-primary"
            style={{ fontSize: '13px', padding: '6px 14px' }}
          >
            <i className="fas fa-clipboard-check"></i>
            {todayReportSubmitted ? 'Edit Daily Report' : 'Submit Daily Report'}
          </button>
        </div>
      </div>

      {/* 2. Daily Work Report Deadline Alert Banner (Jira Warning Banner) */}
      {!todayReportSubmitted && (
        <div style={{
          background: '#FFF7D6',
          border: '1px solid #F5CD47',
          borderLeft: `4px solid ${isAfter7PM ? '#AE2E24' : '#E2B203'}`,
          borderRadius: '3px',
          padding: '12px 16px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <i
              className="fas fa-exclamation-triangle"
              style={{ fontSize: '16px', color: isAfter7PM ? '#AE2E24' : '#7F5F01' }}
            ></i>
            <div>
              <div style={{ fontWeight: 600, fontSize: '13px', color: isAfter7PM ? '#AE2E24' : '#7F5F01' }}>
                {isAfter7PM ? 'Daily Work Report Past Due (7:00 PM Deadline)' : 'Daily Work Report Submission Reminder (Due by 7:00 PM)'}
              </div>
              <div style={{ fontSize: '12px', color: '#7F5F01' }}>
                Record tasks completed today, active blockers, and tomorrow's sprint targets.
              </div>
            </div>
          </div>

          <button
            onClick={() => setIsReportModalOpen(true)}
            className="btn btn-primary"
            style={{ fontSize: '12px', padding: '5px 12px' }}
          >
            Submit Report Now
          </button>
        </div>
      )}

      {/* 3. Core Software Metrics & KPI Cards (Jira Flat Stat Tiles) */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
        gap: '12px'
      }}>
        <div
          onClick={() => onNavigate('tasks')}
          className="stat-card"
          style={{ cursor: 'pointer' }}
        >
          <div className="label">ACTIVE SPRINT TASKS</div>
          <div className="value">{tasks.length}</div>
          <div style={{ fontSize: '12px', color: '#71717A', marginTop: '6px', display: 'flex', gap: '8px' }}>
            <span style={{ color: '#216E4E', fontWeight: 600 }}>{myCompleted} Done</span>
            <span>•</span>
            <span style={{ color: '#0284C7', fontWeight: 600 }}>{myInProgress} In Progress</span>
          </div>
        </div>

        <div
          onClick={() => onNavigate('projects')}
          className="stat-card"
          style={{ cursor: 'pointer' }}
        >
          <div className="label">PROJECTS HUB</div>
          <div className="value">{projects.length}</div>
          <div style={{ fontSize: '12px', color: '#71717A', marginTop: '6px' }}>
            Enterprise codebases & milestones
          </div>
        </div>

        <div
          onClick={() => onNavigate('codeRepo')}
          className="stat-card"
          style={{ cursor: 'pointer' }}
        >
          <div className="label">COMMITS SYNCHRONIZED</div>
          <div className="value">142+</div>
          <div style={{ fontSize: '12px', color: '#0284C7', marginTop: '6px', fontWeight: 500 }}>
            Branch main • Synchronized
          </div>
        </div>

        <div
          onClick={() => onNavigate('performance')}
          className="stat-card"
          style={{ cursor: 'pointer' }}
        >
          <div className="label">SPRINT VELOCITY</div>
          <div className="value" style={{ color: '#09090B' }}>
            4.9 <span style={{ fontSize: '14px', color: '#71717A', fontWeight: 400 }}>/ 5.0</span>
          </div>
          <div style={{ fontSize: '12px', color: '#216E4E', marginTop: '6px', fontWeight: 600 }}>
            High reliability sprint delivery
          </div>
        </div>
      </div>

      {/* 4. Active Sprint Tasks Preview & Ongoing Projects Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '16px' }}>
        {/* Sprint Tasks Preview */}
        <div className="section-card" style={{ marginBottom: 0 }}>
          <div className="section-header">
            <h2>Active Sprint Tasks</h2>
            <button
              onClick={() => onNavigate('tasks')}
              className="btn btn-secondary"
              style={{ fontSize: '12px', padding: '4px 10px' }}
            >
              View Board
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {tasks.slice(0, 4).map(task => (
              <div
                key={task._id}
                onClick={() => onNavigate('tasks')}
                style={{
                  background: '#FFFFFF',
                  border: '1px solid #E4E4E7',
                  borderRadius: '4px',
                  padding: '10px 14px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  cursor: 'pointer',
                  transition: 'background 0.1s ease'
                }}
              >
                <div>
                  <div style={{ fontWeight: 600, fontSize: '13px', color: '#09090B', marginBottom: '2px' }}>
                    {task.title}
                  </div>
                  <div style={{ fontSize: '12px', color: '#71717A' }}>
                    Due: {task.deadline || 'Current Sprint'} • {task.projectName || 'Aparaitech Core'}
                  </div>
                </div>

                <span className={`badge ${task.status === 'Done' ? 'badge-success' : (task.status === 'In Progress' ? 'badge-brand' : 'badge-neutral')}`} style={{ fontSize: '11px' }}>
                  {task.status || 'To Do'}
                </span>
              </div>
            ))}

            {tasks.length === 0 && (
              <div style={{ padding: '24px 12px', textAlign: 'center', color: '#71717A', fontSize: '13px' }}>
                No active tasks assigned yet.
              </div>
            )}
          </div>
        </div>

        {/* Ongoing Projects Progress Widget */}
        <div className="section-card" style={{ marginBottom: 0 }}>
          <div className="section-header">
            <h2>Engineering Projects & Milestones</h2>
            <button
              onClick={() => onNavigate('projects')}
              className="btn btn-secondary"
              style={{ fontSize: '12px', padding: '4px 10px' }}
            >
              All Projects
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
                    background: '#FFFFFF',
                    border: '1px solid #E4E4E7',
                    borderRadius: '4px',
                    padding: '10px 14px',
                    cursor: 'pointer'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <strong style={{ fontSize: '13px', color: '#09090B', fontWeight: 600 }}>{proj.title}</strong>
                    <span style={{ fontSize: '12px', fontWeight: 600, color: '#0284C7' }}>{progress}%</span>
                  </div>
                  <div style={{ width: '100%', height: '5px', background: '#F4F4F5', borderRadius: '3px', overflow: 'hidden' }}>
                    <div style={{ width: `${progress}%`, height: '100%', background: '#0EA5E9', borderRadius: '3px' }} />
                  </div>
                  <div style={{ fontSize: '11px', color: '#71717A', marginTop: '4px' }}>
                    Code: <strong>{proj.code}</strong> • Deadline: {proj.deadline}
                  </div>
                </div>
              )
            })}

            {projects.length === 0 && (
              <div style={{ padding: '24px 12px', textAlign: 'center', color: '#626F86', fontSize: '13px' }}>
                No projects found.
              </div>
            )}
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
