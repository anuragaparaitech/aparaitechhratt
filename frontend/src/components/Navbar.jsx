import React from 'react'
import { Capacitor } from '@capacitor/core'

function Navbar({
  currentUser,
  onLogout,
  onToggleMobileMenu,
  portalMode,
  onTogglePortal,
  canSwitchPortal,
  onOpenNotifications,
  onOpenProfile,
  onOpenChangePin
}) {
  const isAdmin = currentUser.role === 'admin'
  const isManager = currentUser.role === 'manager' || currentUser.role === 'hr'
  const isNative = Capacitor.isNativePlatform()
  const [deferredPrompt, setDeferredPrompt] = React.useState(null)

  React.useEffect(() => {
    const handleBeforeInstall = (e) => {
      e.preventDefault()
      setDeferredPrompt(e)
    }
    window.addEventListener('beforeinstallprompt', handleBeforeInstall)
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstall)
  }, [])

  const handleInstallApp = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt()
      const { outcome } = await deferredPrompt.userChoice
      if (outcome === 'accepted') {
        setDeferredPrompt(null)
      }
    } else {
      alert(
        '💻 To Install Aparaitech Desktop App:\n\n' +
        '1. Look at your Chrome address bar (top right) and click the "Install" icon (laptop with arrow icon).\n' +
        'OR\n' +
        '2. Click Chrome menu (⋮) -> "Save and share" -> "Install Aparaitech Work Portal".\n\n' +
        'This opens the portal in a dedicated standalone window with desktop shortcut!'
      )
    }
  }
  
  const getRoleLabel = () => {
    if (isAdmin) return 'Super Admin'
    if (currentUser.email?.toLowerCase() === 'anunand2004@gmail.com' || String(currentUser.empId) === '7017' || String(currentUser.empId) === 'AP7017') return 'Software & HR Lead'
    if (currentUser.role === 'hr') return 'HR Manager'
    if (isManager) return currentUser.role === 'hr' ? 'HR Manager' : 'Team Manager'
    if (currentUser.department === 'Development' || currentUser.designation?.toLowerCase().includes('software')) {
      return currentUser.designation || 'Software Engineer'
    }
    return `${currentUser.department || 'BDA'} Associate`
  }

  const currentHour = new Date().getHours()
  const hasUrgentAlert = currentHour >= 19

  return (
    <div className="navbar" style={{
      background: '#0a192f',
      borderBottom: '1px solid rgba(255,255,255,0.08)',
      padding: 'calc(env(safe-area-inset-top, 0px) + 0.85rem) 1.5rem 0.85rem 1.5rem',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      color: '#ffffff',
      gap: '0.75rem',
      width: '100%',
      boxSizing: 'border-box',
      flexWrap: 'wrap'
    }}>
      <div className="logo-area" style={{ display: 'flex', alignItems: 'center', gap: '10px', fontWeight: '800', fontSize: '1.05rem', letterSpacing: '-0.02em', minWidth: 0 }}>
        {/* Mobile Hamburger Toggle */}
        <button
          className="mobile-hamburger-btn"
          onClick={onToggleMobileMenu}
          aria-label="Toggle navigation menu"
          style={{
            background: 'rgba(255, 255, 255, 0.1)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            color: '#ffffff',
            width: '38px',
            height: '38px',
            borderRadius: '10px',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.1rem',
            cursor: 'pointer',
            padding: 0,
            flexShrink: 0
          }}
        >
          <i className="fas fa-bars"></i>
        </button>

        <div style={{
          width: '40px',
          height: '40px',
          borderRadius: '12px',
          background: 'radial-gradient(circle at 30% 30%, #ffffff 0%, #f1f5f9 60%, #cbd5e1 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 4px 14px rgba(0, 0, 0, 0.25), inset 0 1px 2px rgba(255, 255, 255, 0.8)',
          border: '1.5px solid rgba(255, 255, 255, 0.4)',
          flexShrink: 0,
          padding: '3px'
        }}>
          <img
            src="/aparaitech-logo.png"
            alt="Aparaitech Logo"
            style={{ width: '100%', height: '100%', objectFit: 'contain' }}
          />
        </div>
        <div style={{ minWidth: 0, overflow: 'hidden' }}>
          <div style={{
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            fontWeight: '900',
            letterSpacing: '0.04em',
            fontSize: '1.05rem',
            background: 'linear-gradient(135deg, #ffffff 40%, #5eead4 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            APARAITECH
          </div>
          <div style={{
            fontSize: '0.66rem',
            color: '#2dd4bf',
            fontWeight: '700',
            letterSpacing: '0.06em',
            whiteSpace: 'nowrap',
            textTransform: 'uppercase',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}>
            <span>SOFTWARE COMPANY</span>
            <span style={{
              display: 'inline-block',
              width: '6px',
              height: '6px',
              borderRadius: '50%',
              background: '#22c55e',
              boxShadow: '0 0 8px #22c55e'
            }}></span>
          </div>
        </div>
      </div>

      {/* Middle: Portal Switcher (For Management/Anurag, HR & Admin) */}
      {canSwitchPortal && (
        <div className="portal-switcher-header" style={{
          display: 'flex',
          alignItems: 'center',
          background: 'rgba(255, 255, 255, 0.08)',
          borderRadius: '12px',
          padding: '3px',
          border: '1px solid rgba(255, 255, 255, 0.14)',
          gap: '3px',
          boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.2)'
        }}>
          <button
            onClick={() => onTogglePortal('software')}
            title="Switch to Software Development Portal"
            style={{
              background: portalMode === 'software' ? 'linear-gradient(135deg, #2563eb, #1d4ed8)' : 'transparent',
              color: portalMode === 'software' ? '#ffffff' : '#94a3b8',
              border: 'none',
              borderRadius: '9px',
              padding: '6px 12px',
              fontSize: '0.78rem',
              fontWeight: '700',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'all 0.2s ease',
              boxShadow: portalMode === 'software' ? '0 2px 8px rgba(37,99,235,0.45)' : 'none'
            }}
          >
            <i className="fas fa-laptop-code"></i>
            <span>Software Portal</span>
          </button>
          <button
            onClick={() => onTogglePortal('bda')}
            title="Switch to BDA Calling / Sales Portal"
            style={{
              background: portalMode === 'bda' ? 'linear-gradient(135deg, #059669, #047857)' : 'transparent',
              color: portalMode === 'bda' ? '#ffffff' : '#94a3b8',
              border: 'none',
              borderRadius: '9px',
              padding: '6px 12px',
              fontSize: '0.78rem',
              fontWeight: '700',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'all 0.2s ease',
              boxShadow: portalMode === 'bda' ? '0 2px 8px rgba(5,150,105,0.45)' : 'none'
            }}
          >
            <i className="fas fa-headset"></i>
            <span>BDA Portal</span>
          </button>
          <button
            onClick={() => onTogglePortal('hr')}
            title="Switch to Human Resources (HR) Operations Portal"
            style={{
              background: portalMode === 'hr' ? 'linear-gradient(135deg, #7c3aed, #6d28d9)' : 'transparent',
              color: portalMode === 'hr' ? '#ffffff' : '#94a3b8',
              border: 'none',
              borderRadius: '9px',
              padding: '6px 12px',
              fontSize: '0.78rem',
              fontWeight: '700',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'all 0.2s ease',
              boxShadow: portalMode === 'hr' ? '0 2px 8px rgba(124,58,237,0.45)' : 'none'
            }}
          >
            <i className="fas fa-users-cog"></i>
            <span>HR Portal</span>
          </button>
        </div>
      )}

      {/* Right User Actions */}
      <div className="user-info" style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexShrink: 0 }}>
        {/* Notification Bell Button */}
        <button
          onClick={onOpenNotifications}
          title="Notification Center & Shift Alerts"
          style={{
            position: 'relative',
            background: 'rgba(255, 255, 255, 0.08)',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            color: '#38bdf8',
            width: '38px',
            height: '38px',
            borderRadius: '10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            fontSize: '1rem',
            flexShrink: 0,
            transition: 'all 0.2s ease'
          }}
        >
          <i className="fas fa-bell"></i>
          {hasUrgentAlert && (
            <span style={{
              position: 'absolute',
              top: '5px',
              right: '5px',
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: '#ef4444',
              boxShadow: '0 0 8px #ef4444',
              border: '1.5px solid #0a192f'
            }}></span>
          )}
        </button>

        {/* Profile Quick Button */}
        {onOpenProfile && (
          <button
            onClick={onOpenProfile}
            title="View My Profile & Credentials"
            style={{
              background: 'rgba(56, 189, 248, 0.15)',
              border: '1px solid rgba(56, 189, 248, 0.35)',
              color: '#7dd3fc',
              padding: '7px 11px',
              borderRadius: '9px',
              fontWeight: '700',
              fontSize: '0.78rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              whiteSpace: 'nowrap'
            }}
          >
            <i className="fas fa-user-circle"></i>
            <span>Profile</span>
          </button>
        )}

        {/* Edit PIN Quick Button */}
        {onOpenChangePin && (
          <button
            onClick={onOpenChangePin}
            title="Change 4-Digit Passcode PIN"
            style={{
              background: 'rgba(37, 99, 235, 0.22)',
              border: '1px solid rgba(147, 197, 253, 0.4)',
              color: '#93c5fd',
              padding: '7px 11px',
              borderRadius: '9px',
              fontWeight: '700',
              fontSize: '0.78rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              whiteSpace: 'nowrap'
            }}
          >
            <i className="fas fa-th"></i>
            <span>Edit PIN</span>
          </button>
        )}

        {/* User Pill (Clickable to open profile) */}
        <div
          onClick={onOpenProfile}
          title="Click to view full Profile & Credentials"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '0.85rem',
            cursor: onOpenProfile ? 'pointer' : 'default',
            padding: '4px 8px',
            borderRadius: '10px',
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            transition: 'background 0.2s ease'
          }}
        >
          <i className="fas fa-user-circle" style={{ fontSize: '1.35rem', color: '#38bdf8', flexShrink: 0 }}></i>
          <div className="navbar-user-text">
            <div style={{ fontWeight: '700', color: '#ffffff', lineHeight: 1.2, whiteSpace: 'nowrap' }}>
              {currentUser.name}
            </div>
            <div style={{ fontSize: '0.7rem', color: '#94a3b8', whiteSpace: 'nowrap' }}>
              {getRoleLabel()} {currentUser.empId ? `• ${currentUser.empId}` : ''}
            </div>
          </div>
        </div>

        {!isNative && (
          <>
            <a
              href="/aparaitech-hrms.apk"
              download="Aparaitech-HRMS.apk"
              className="download-apk-navbar-btn"
              title="Download latest Aparaitech Android App (.APK)"
              style={{
                textDecoration: 'none',
                background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.2), rgba(5, 150, 105, 0.25))',
                color: '#34d399',
                border: '1px solid rgba(52, 211, 153, 0.4)',
                padding: '7px 12px',
                borderRadius: '8px',
                fontWeight: '700',
                fontSize: '0.8rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                whiteSpace: 'nowrap'
              }}
            >
              <i className="fab fa-android"></i>
              <span>APK</span>
            </a>
            <button
              className="install-app-btn"
              onClick={handleInstallApp}
              title="Install Aparaitech Work Portal on your desktop"
              style={{
                background: 'linear-gradient(135deg, rgba(37, 99, 235, 0.25), rgba(29, 78, 216, 0.25))',
                color: '#60a5fa',
                border: '1px solid rgba(96, 165, 250, 0.4)',
                padding: '7px 12px',
                borderRadius: '8px',
                fontWeight: '700',
                fontSize: '0.8rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                whiteSpace: 'nowrap'
              }}
            >
              <i className="fas fa-download"></i>
              <span>Install App</span>
            </button>
          </>
        )}

        <button
          className="logout-btn"
          onClick={onLogout}
          title="Sign out of portal"
          style={{
            background: 'rgba(239, 68, 68, 0.15)',
            color: '#f87171',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            padding: '7px 12px',
            borderRadius: '8px',
            fontWeight: '600',
            fontSize: '0.8rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            whiteSpace: 'nowrap'
          }}
        >
          <i className="fas fa-sign-out-alt"></i>
          <span className="logout-text">Logout</span>
        </button>
      </div>
    </div>
  )
}

export default Navbar
