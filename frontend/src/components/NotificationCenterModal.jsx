import React from 'react'

function NotificationCenterModal({ isOpen, onClose, currentUser, onNavigate, onOpenReportModal }) {
  if (!isOpen) return null

  const currentHour = new Date().getHours()
  const isAfter7PM = currentHour >= 19

  const notifications = [
    {
      id: 'notif-report',
      type: 'warning',
      icon: 'fa-clipboard-check',
      color: '#ef4444',
      bg: '#fef2f2',
      title: 'Daily Work Report Deadline Reminder',
      message: isAfter7PM
        ? '⚠️ Attention: It is past 07:00 PM. Please submit your software engineering daily report immediately.'
        : 'Daily report submission deadline is 07:00 PM. Record your completed tasks and blockers before shift ends.',
      actionText: 'Submit Report Now',
      action: () => {
        onClose()
        if (onOpenReportModal) onOpenReportModal()
      }
    },
    {
      id: 'notif-shift',
      type: 'info',
      icon: 'fa-fingerprint',
      color: '#2563eb',
      bg: '#eff6ff',
      title: 'Shift 1 Timing (07:00 AM - 11:00 AM)',
      message: 'Software Developers & Interns shift is active. Face recognition and GPS check-in status recorded.',
      actionText: 'Punch Desk',
      action: () => {
        onClose()
        if (onNavigate) onNavigate('attendance')
      }
    },
    {
      id: 'notif-tasks',
      type: 'primary',
      icon: 'fa-tasks',
      color: '#8b5cf6',
      bg: '#f5f3ff',
      title: 'Sprint Backlog & Tasks Review',
      message: 'Active sprint tasks assigned to your desk. Update status as you progress.',
      actionText: 'Open Sprint Board',
      action: () => {
        onClose()
        if (onNavigate) onNavigate('tasks')
      }
    }
  ]

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(10, 25, 47, 0.65)',
      backdropFilter: 'blur(6px)',
      display: 'flex',
      alignItems: 'flex-start',
      justifyContent: 'flex-end',
      zIndex: 1200,
      padding: '70px 20px 20px 20px'
    }}>
      <div style={{
        background: '#ffffff',
        borderRadius: '20px',
        maxWidth: '420px',
        width: '100%',
        boxShadow: '0 20px 40px -10px rgba(0, 0, 0, 0.25)',
        border: '1px solid #e2e8f0',
        overflow: 'hidden',
        animation: 'modalSlideUp 0.2s ease-out'
      }}>
        {/* Header */}
        <div style={{
          padding: '1rem 1.25rem',
          background: '#0a192f',
          color: '#ffffff',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '800', fontSize: '0.92rem' }}>
            <i className="fas fa-bell" style={{ color: '#38bdf8' }}></i>
            Notifications Hub
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'rgba(255, 255, 255, 0.1)',
              border: 'none',
              color: '#ffffff',
              borderRadius: '6px',
              width: '28px',
              height: '28px',
              cursor: 'pointer'
            }}
          >
            ✕
          </button>
        </div>

        {/* List */}
        <div style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '420px', overflowY: 'auto' }}>
          {notifications.map(n => (
            <div
              key={n.id}
              style={{
                background: n.bg,
                border: `1px solid ${n.color}25`,
                borderRadius: '12px',
                padding: '12px',
                display: 'flex',
                gap: '10px',
                alignItems: 'flex-start'
              }}
            >
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                background: n.color,
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.85rem',
                flexShrink: 0
              }}>
                <i className={`fas ${n.icon}`}></i>
              </div>

              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: '800', fontSize: '0.82rem', color: '#0f172a', marginBottom: '2px' }}>
                  {n.title}
                </div>
                <div style={{ fontSize: '0.75rem', color: '#475569', lineHeight: 1.4, marginBottom: '8px' }}>
                  {n.message}
                </div>
                {n.actionText && (
                  <button
                    onClick={n.action}
                    style={{
                      background: n.color,
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: '6px',
                      padding: '4px 10px',
                      fontSize: '0.72rem',
                      fontWeight: '700',
                      cursor: 'pointer'
                    }}
                  >
                    {n.actionText} →
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        <div style={{ padding: '10px 14px', borderTop: '1px solid #f1f5f9', textAlign: 'center', fontSize: '0.72rem', color: '#94a3b8' }}>
          Real-time synchronized with Aparaitech Cloud Engine
        </div>
      </div>
    </div>
  )
}

export default NotificationCenterModal
