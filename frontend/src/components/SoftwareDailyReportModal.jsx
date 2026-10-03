import React, { useState, useEffect } from 'react'
import { reportsAPI } from '../services/api'

function SoftwareDailyReportModal({ isOpen, onClose, currentUser, showToast, onReportSubmitted }) {
  const [loading, setLoading] = useState(false)
  const [tasksCompleted, setTasksCompleted] = useState('')
  const [tasksInProgress, setTasksInProgress] = useState('')
  const [tasksPending, setTasksPending] = useState('')
  const [hoursWorked, setHoursWorked] = useState('4')
  const [blockers, setBlockers] = useState('')
  const [planTomorrow, setPlanTomorrow] = useState('')
  const [githubPrs, setGithubPrs] = useState('')
  const [isExisting, setIsExisting] = useState(false)

  const todayStr = new Date().toISOString().split('T')[0]
  const currentTime = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })

  useEffect(() => {
    if (isOpen && currentUser) {
      loadTodayReport()
    }
  }, [isOpen, currentUser])

  const loadTodayReport = async () => {
    try {
      const res = await reportsAPI.getTodayStatus(todayStr, currentUser.email)
      if (res.hasSubmitted && res.report) {
        setIsExisting(true)
        setTasksCompleted(res.report.tasksCompleted || '')
        setTasksInProgress(res.report.tasksInProgress || '')
        setTasksPending(res.report.tasksPending || '')
        setHoursWorked(String(res.report.hoursWorked || 4))
        setBlockers(res.report.blockers || '')
        setPlanTomorrow(res.report.planTomorrow || '')
        setGithubPrs(res.report.githubPrs || '')
      } else {
        setIsExisting(false)
      }
    } catch (err) {
      console.error('Error checking today report:', err)
    }
  }

  if (!isOpen) return null

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!tasksCompleted.trim() && !tasksInProgress.trim()) {
      showToast('⚠️ Please enter tasks completed or currently in progress', '#f59e0b')
      return
    }

    setLoading(true)
    try {
      const payload = {
        reportType: 'software',
        tasksCompleted: tasksCompleted.trim(),
        tasksInProgress: tasksInProgress.trim(),
        tasksPending: tasksPending.trim(),
        hoursWorked: Number(hoursWorked) || 4,
        blockers: blockers.trim(),
        planTomorrow: planTomorrow.trim(),
        githubPrs: githubPrs.trim(),
        reportDate: todayStr
      }

      const res = await reportsAPI.submitDaily(payload)
      if (res.success) {
        showToast(isExisting ? '✅ Software Daily Report updated successfully!' : '🚀 Software Daily Report submitted successfully!', '#10b981')
        if (onReportSubmitted) onReportSubmitted(res.data)
        onClose()
      } else {
        showToast(`❌ ${res.message || 'Failed to submit report'}`, '#ef4444')
      }
    } catch (err) {
      console.error('Submit report error:', err)
      showToast(`❌ ${err.response?.data?.message || err.message}`, '#ef4444')
    } finally {
      setLoading(false)
    }
  }

  return (
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
        maxWidth: '680px',
        width: '100%',
        maxHeight: '92vh',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        border: '1px solid #e2e8f0',
        overflow: 'hidden',
        animation: 'modalSlideUp 0.25s ease-out'
      }}>
        {/* Header */}
        <div style={{
          padding: '1.25rem 1.75rem',
          background: 'linear-gradient(135deg, #0a192f 0%, #1e3a8a 100%)',
          color: '#ffffff',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #2563eb, #38bdf8)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.2rem',
              color: '#ffffff'
            }}>
              <i className="fas fa-clipboard-check"></i>
            </div>
            <div>
              <div style={{ fontSize: '1.1rem', fontWeight: '800' }}>
                {isExisting ? 'Edit Software Daily Report' : 'Software Daily Work Report'}
              </div>
              <div style={{ fontSize: '0.75rem', color: '#93c5fd' }}>
                Shift 1 (07:00 AM - 11:00 AM) • Deadline: 07:00 PM Daily
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'rgba(255, 255, 255, 0.1)',
              border: 'none',
              color: '#ffffff',
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              fontSize: '1rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            ✕
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} style={{ overflowY: 'auto', padding: '1.5rem 1.75rem', display: 'flex', flexDirection: 'column', gap: '1.15rem' }}>
          {/* Auto-filled Information Banner */}
          <div style={{
            background: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: '12px',
            padding: '12px 16px',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
            gap: '10px',
            fontSize: '0.8rem'
          }}>
            <div>
              <span style={{ color: '#64748b', display: 'block', fontSize: '0.7rem' }}>EMPLOYEE</span>
              <strong style={{ color: '#0f172a' }}>{currentUser.name}</strong>
            </div>
            <div>
              <span style={{ color: '#64748b', display: 'block', fontSize: '0.7rem' }}>EMP ID</span>
              <strong style={{ color: '#2563eb' }}>{currentUser.empId || 'AP-EMP'}</strong>
            </div>
            <div>
              <span style={{ color: '#64748b', display: 'block', fontSize: '0.7rem' }}>TEAM</span>
              <strong style={{ color: '#059669' }}>Software Development</strong>
            </div>
            <div>
              <span style={{ color: '#64748b', display: 'block', fontSize: '0.7rem' }}>DATE & TIME</span>
              <strong style={{ color: '#0f172a' }}>{todayStr} ({currentTime})</strong>
            </div>
          </div>

          {/* 1. Tasks Completed Today */}
          <div>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '700', color: '#1e293b', marginBottom: '6px' }}>
              <i className="fas fa-check-circle" style={{ color: '#10b981', marginRight: '6px' }}></i>
              Tasks Completed Today <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <textarea
              rows={3}
              placeholder="List the features, bug fixes, or components you built or completed today..."
              value={tasksCompleted}
              onChange={(e) => setTasksCompleted(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '10px 14px',
                borderRadius: '10px',
                border: '1.5px solid #cbd5e1',
                fontSize: '0.88rem',
                outline: 'none',
                fontFamily: 'inherit',
                resize: 'vertical',
                background: '#ffffff'
              }}
            />
          </div>

          {/* 2. Tasks In Progress */}
          <div>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '700', color: '#1e293b', marginBottom: '6px' }}>
              <i className="fas fa-spinner" style={{ color: '#3b82f6', marginRight: '6px' }}></i>
              Tasks In Progress
            </label>
            <textarea
              rows={2}
              placeholder="What are you currently coding or debugging?"
              value={tasksInProgress}
              onChange={(e) => setTasksInProgress(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 14px',
                borderRadius: '10px',
                border: '1.5px solid #cbd5e1',
                fontSize: '0.88rem',
                outline: 'none',
                fontFamily: 'inherit',
                resize: 'vertical',
                background: '#ffffff'
              }}
            />
          </div>

          {/* 3. Tasks Pending & Hours Worked Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '14px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '700', color: '#1e293b', marginBottom: '6px' }}>
                <i className="fas fa-clock" style={{ color: '#f59e0b', marginRight: '6px' }}></i>
                Tasks Pending / Backlog
              </label>
              <input
                type="text"
                placeholder="Pending code reviews, tests..."
                value={tasksPending}
                onChange={(e) => setTasksPending(e.target.value)}
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  borderRadius: '10px',
                  border: '1.5px solid #cbd5e1',
                  fontSize: '0.88rem',
                  outline: 'none'
                }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '700', color: '#1e293b', marginBottom: '6px' }}>
                <i className="fas fa-hourglass-half" style={{ color: '#6366f1', marginRight: '6px' }}></i>
                Hours Worked
              </label>
              <input
                type="number"
                step="0.5"
                min="1"
                max="16"
                value={hoursWorked}
                onChange={(e) => setHoursWorked(e.target.value)}
                required
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  borderRadius: '10px',
                  border: '1.5px solid #cbd5e1',
                  fontSize: '0.88rem',
                  outline: 'none'
                }}
              />
            </div>
          </div>

          {/* 4. Blockers / Challenges */}
          <div>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '700', color: '#1e293b', marginBottom: '6px' }}>
              <i className="fas fa-exclamation-triangle" style={{ color: '#ef4444', marginRight: '6px' }}></i>
              Blockers / Challenges Faced
            </label>
            <input
              type="text"
              placeholder="Any technical blockers, API dependencies, or credentials needed? (None if all smooth)"
              value={blockers}
              onChange={(e) => setBlockers(e.target.value)}
              style={{
                width: '100%',
                padding: '9px 12px',
                borderRadius: '10px',
                border: '1.5px solid #cbd5e1',
                fontSize: '0.88rem',
                outline: 'none'
              }}
            />
          </div>

          {/* 5. Plan for Tomorrow */}
          <div>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '700', color: '#1e293b', marginBottom: '6px' }}>
              <i className="fas fa-calendar-plus" style={{ color: '#8b5cf6', marginRight: '6px' }}></i>
              Plan for Tomorrow <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <textarea
              rows={2}
              placeholder="What modules or milestones will you tackle in tomorrow's shift?"
              value={planTomorrow}
              onChange={(e) => setPlanTomorrow(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '10px 14px',
                borderRadius: '10px',
                border: '1.5px solid #cbd5e1',
                fontSize: '0.88rem',
                outline: 'none',
                fontFamily: 'inherit',
                resize: 'vertical'
              }}
            />
          </div>

          {/* 6. GitHub PRs / Commit links (Optional) */}
          <div>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '700', color: '#1e293b', marginBottom: '6px' }}>
              <i className="fab fa-github" style={{ color: '#0f172a', marginRight: '6px' }}></i>
              GitHub PRs / Commits / Branches (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. PR #42 or commit hash 92639c9"
              value={githubPrs}
              onChange={(e) => setGithubPrs(e.target.value)}
              style={{
                width: '100%',
                padding: '9px 12px',
                borderRadius: '10px',
                border: '1.5px solid #cbd5e1',
                fontSize: '0.88rem',
                outline: 'none'
              }}
            />
          </div>

          {/* Footer Submit Buttons */}
          <div style={{
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '12px',
            marginTop: '0.5rem',
            paddingTop: '1rem',
            borderTop: '1px solid #f1f5f9'
          }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: '10px 18px',
                borderRadius: '10px',
                border: '1.5px solid #cbd5e1',
                background: '#ffffff',
                color: '#475569',
                fontWeight: '700',
                fontSize: '0.85rem',
                cursor: 'pointer'
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              style={{
                padding: '10px 24px',
                borderRadius: '10px',
                border: 'none',
                background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
                color: '#ffffff',
                fontWeight: '800',
                fontSize: '0.88rem',
                cursor: loading ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: '0 4px 12px rgba(37, 99, 235, 0.3)'
              }}
            >
              {loading ? (
                <>
                  <i className="fas fa-circle-notch fa-spin"></i> Saving Report...
                </>
              ) : (
                <>
                  <i className="fas fa-paper-plane"></i> {isExisting ? 'Update Report' : 'Submit Daily Report'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default SoftwareDailyReportModal
