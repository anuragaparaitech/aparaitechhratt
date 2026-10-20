import React, { useState, useEffect } from 'react'
import { subscribeInAppNotification } from '../services/notificationService'

function NotificationBanner() {
  const [currentNotif, setCurrentNotif] = useState(null)

  useEffect(() => {
    const unsubscribe = subscribeInAppNotification((notif) => {
      setCurrentNotif(notif)
    })
    return () => unsubscribe()
  }, [])

  useEffect(() => {
    if (currentNotif) {
      const timer = setTimeout(() => {
        setCurrentNotif(null)
      }, 7000)
      return () => clearTimeout(timer)
    }
  }, [currentNotif])

  if (!currentNotif) return null

  return (
    <div
      style={{
        position: 'fixed',
        top: 'calc(env(safe-area-inset-top, 0px) + 14px)',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 99999,
        width: '92%',
        maxWidth: '460px',
        animation: 'slideDownBounce 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
      }}
    >
      <div
        style={{
          background: 'rgba(10, 25, 47, 0.96)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          borderRadius: '16px',
          padding: '12px 16px',
          color: '#ffffff',
          boxShadow: '0 20px 35px -5px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.15)',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          borderLeft: '4px solid #38bdf8'
        }}
      >
        {/* App / Notification Icon */}
        <div
          style={{
            width: '40px',
            height: '40px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#ffffff',
            fontSize: '1.15rem',
            flexShrink: 0,
            boxShadow: '0 4px 10px rgba(37, 99, 235, 0.4)'
          }}
        >
          <i className="fas fa-bell fa-shake"></i>
        </div>

        {/* Text info */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '2px' }}>
            <span style={{ fontSize: '0.68rem', fontWeight: '800', color: '#38bdf8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              APARAITECH ALERT
            </span>
            <span style={{ fontSize: '0.65rem', color: '#94a3b8' }}>• Just now</span>
          </div>
          <div style={{ fontWeight: '800', fontSize: '0.88rem', color: '#ffffff', lineHeight: 1.2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {currentNotif.title}
          </div>
          <div style={{ fontSize: '0.78rem', color: '#cbd5e1', lineHeight: 1.3, marginTop: '3px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
            {currentNotif.body}
          </div>
        </div>

        {/* Action Button */}
        {currentNotif.onClick && (
          <button
            onClick={() => {
              currentNotif.onClick()
              setCurrentNotif(null)
            }}
            style={{
              background: '#2563eb',
              color: '#ffffff',
              border: 'none',
              borderRadius: '8px',
              padding: '6px 12px',
              fontSize: '0.78rem',
              fontWeight: '700',
              cursor: 'pointer',
              flexShrink: 0,
              boxShadow: '0 2px 8px rgba(37, 99, 235, 0.4)'
            }}
          >
            Open
          </button>
        )}

        {/* Dismiss Button */}
        <button
          onClick={() => setCurrentNotif(null)}
          aria-label="Dismiss notification"
          style={{
            background: 'none',
            border: 'none',
            color: '#94a3b8',
            fontSize: '1.1rem',
            cursor: 'pointer',
            padding: '4px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}
        >
          ✕
        </button>
      </div>

      <style>{`
        @keyframes slideDownBounce {
          0% {
            opacity: 0;
            transform: translate(-50%, -40px) scale(0.95);
          }
          60% {
            opacity: 1;
            transform: translate(-50%, 6px) scale(1.02);
          }
          100% {
            opacity: 1;
            transform: translate(-50%, 0) scale(1);
          }
        }
      `}</style>
    </div>
  )
}

export default NotificationBanner
