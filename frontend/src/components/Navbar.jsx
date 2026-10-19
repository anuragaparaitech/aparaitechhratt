import React, { useState, useEffect } from 'react'
import { Capacitor } from '@capacitor/core'
import { API_URL } from '../services/api'

/**
 * Atlassian Jira / ADS Global Header Component
 * Clean, Professional, Enterprise Work Management Header
 */
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
  const [deferredPrompt, setDeferredPrompt] = useState(null)
  const [searchFocused, setSearchFocused] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
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
        '💻 Install Aparaitech Desktop App:\n\n' +
        '1. Look at your Chrome address bar (top right) and click the "Install" icon.\n' +
        'OR\n' +
        '2. Click Chrome menu (⋮) -> "Save and share" -> "Install Aparaitech Work Portal".'
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

  // User initials for Atlassian Avatar
  const getInitials = (name) => {
    if (!name) return 'AP'
    const parts = name.trim().split(' ')
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase()
    return name.slice(0, 2).toUpperCase()
  }

  return (
    <header
      className="navbar"
      style={{
        height: '56px',
        background: '#0C66E4',
        borderBottom: '1px solid #0055CC',
        padding: '0 1rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        color: '#FFFFFF',
        position: 'sticky',
        top: 0,
        zIndex: 1000,
        boxShadow: '0 1px 3px rgba(9, 30, 66, 0.15)'
      }}
    >
      {/* ── Left Section: 9-Dot App Switcher + Brand Logo + Mode Selector ──────── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        {/* Mobile Hamburger Menu Toggle */}
        <button
          className="mobile-hamburger-btn"
          onClick={onToggleMobileMenu}
          aria-label="Toggle navigation menu"
          style={{
            background: 'transparent',
            border: 'none',
            color: '#FFFFFF',
            width: '32px',
            height: '32px',
            borderRadius: '3px',
            display: 'none',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1rem',
            cursor: 'pointer',
            padding: 0
          }}
        >
          <i className="fas fa-bars"></i>
        </button>

        {/* Atlassian 9-Dot Grid App Switcher */}
        <div
          title="Aparaitech Apps & Workspaces"
          style={{
            width: '32px',
            height: '32px',
            borderRadius: '3px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            color: '#FFFFFF',
            fontSize: '0.95rem'
          }}
        >
          <i className="fas fa-th"></i>
        </div>

        {/* Corporate Brand: Logo + Jira-Style Badge */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
          <div
            style={{
              width: '28px',
              height: '28px',
              borderRadius: '3px',
              background: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '2px',
              boxShadow: '0 1px 2px rgba(0, 0, 0, 0.1)'
            }}
          >
            <img
              src="/aparaitech-logo.png"
              alt="Aparaitech Logo"
              style={{ width: '100%', height: '100%', objectFit: 'contain' }}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
            <span style={{ fontWeight: '700', fontSize: '15px', letterSpacing: '-0.01em', color: '#FFFFFF' }}>
              Aparaitech
            </span>
            <span
              style={{
                fontSize: '10px',
                fontWeight: '700',
                textTransform: 'uppercase',
                background: 'rgba(255, 255, 255, 0.22)',
                color: '#FFFFFF',
                padding: '1px 5px',
                borderRadius: '3px',
                letterSpacing: '0.04em'
              }}
            >
              Work Management
            </span>
          </div>
        </div>

        {/* Jira-Style Top Navigation Tabs (For Multi-Portal Users) */}
        {canSwitchPortal && (
          <nav
            className="portal-switcher-header"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '2px',
              marginLeft: '12px'
            }}
          >
            <button
              onClick={() => onTogglePortal('software')}
              style={{
                background: portalMode === 'software' ? 'rgba(255, 255, 255, 0.24)' : 'transparent',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: '3px',
                padding: '6px 10px',
                fontSize: '13px',
                fontWeight: portalMode === 'software' ? '600' : '400',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '5px'
              }}
            >
              <i className="fas fa-laptop-code" style={{ fontSize: '12px' }}></i>
              <span>Software</span>
            </button>

            <button
              onClick={() => onTogglePortal('bda')}
              style={{
                background: portalMode === 'bda' ? 'rgba(255, 255, 255, 0.24)' : 'transparent',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: '3px',
                padding: '6px 10px',
                fontSize: '13px',
                fontWeight: portalMode === 'bda' ? '600' : '400',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '5px'
              }}
            >
              <i className="fas fa-headset" style={{ fontSize: '12px' }}></i>
              <span>BDA Operations</span>
            </button>

            <button
              onClick={() => onTogglePortal('hr')}
              style={{
                background: portalMode === 'hr' ? 'rgba(255, 255, 255, 0.24)' : 'transparent',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: '3px',
                padding: '6px 10px',
                fontSize: '13px',
                fontWeight: portalMode === 'hr' ? '600' : '400',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '5px'
              }}
            >
              <i className="fas fa-users-cog" style={{ fontSize: '12px' }}></i>
              <span>HR Desk</span>
            </button>
          </nav>
        )}
      </div>

      {/* ── Center Section: Jira Global Search Box ─────────────────────────────── */}
      <div
        className="jira-global-search"
        style={{
          display: 'flex',
          alignItems: 'center',
          position: 'relative'
        }}
      >
        <div
          style={{
            position: 'absolute',
            left: '10px',
            color: searchFocused ? '#626F86' : 'rgba(255, 255, 255, 0.75)',
            fontSize: '12px',
            pointerEvents: 'none'
          }}
        >
          <i className="fas fa-search"></i>
        </div>
        <input
          type="text"
          placeholder="Search issues, people, reports..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onFocus={() => setSearchFocused(true)}
          onBlur={() => setSearchFocused(false)}
          style={{
            background: searchFocused ? '#FFFFFF' : 'rgba(255, 255, 255, 0.18)',
            border: searchFocused ? '1px solid #388BFF' : '1px solid rgba(255, 255, 255, 0.25)',
            color: searchFocused ? '#172B4D' : '#FFFFFF',
            borderRadius: '3px',
            height: '32px',
            padding: '0 10px 0 30px',
            fontSize: '13px',
            width: searchFocused ? '260px' : '200px',
            transition: 'all 0.15s ease',
            outline: 'none',
            boxShadow: searchFocused ? '0 2px 4px rgba(9, 30, 66, 0.15)' : 'none'
          }}
        />
      </div>

      {/* ── Right Section: Notifications + Actions + User Profile ─────────────── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
        {/* Native Android APK link */}
        {!isNative && (
          <a
            href="/aparaitech-hrms.apk"
            download="Aparaitech-HRMS.apk"
            title="Download latest Aparaitech Android App (.APK)"
            style={{
              textDecoration: 'none',
              background: 'rgba(255, 255, 255, 0.15)',
              color: '#FFFFFF',
              border: 'none',
              padding: '6px 10px',
              borderRadius: '3px',
              fontWeight: '500',
              fontSize: '12px',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '5px'
            }}
          >
            <i className="fab fa-android"></i>
            <span>APK</span>
          </a>
        )}

        {/* Desktop App PWA Install */}
        {!isNative && (
          <button
            onClick={handleInstallApp}
            title="Install Desktop Work Application"
            style={{
              background: 'rgba(255, 255, 255, 0.15)',
              color: '#FFFFFF',
              border: 'none',
              padding: '6px 10px',
              borderRadius: '3px',
              fontWeight: '500',
              fontSize: '12px',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '5px'
            }}
          >
            <i className="fas fa-download"></i>
            <span>Desktop</span>
          </button>
        )}

        {/* Notification Bell with Lozenge Dot */}
        <button
          onClick={onOpenNotifications}
          title="Notification Center & Shift Alerts"
          style={{
            position: 'relative',
            background: 'transparent',
            border: 'none',
            color: '#FFFFFF',
            width: '32px',
            height: '32px',
            borderRadius: '3px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            fontSize: '14px'
          }}
        >
          <i className="fas fa-bell"></i>
          {hasUrgentAlert && (
            <span
              style={{
                position: 'absolute',
                top: '5px',
                right: '5px',
                width: '7px',
                height: '7px',
                borderRadius: '50%',
                background: '#EF4444',
                border: '1.5px solid #0C66E4'
              }}
            />
          )}
        </button>

        {/* User Profile Summary (Atlassian Avatar Style) */}
        <div
          onClick={onOpenProfile}
          title="Click to view Account Settings & Profile"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            cursor: onOpenProfile ? 'pointer' : 'default',
            padding: '3px 8px',
            borderRadius: '3px',
            transition: 'background 0.15s ease'
          }}
        >
          {currentUser.profileImageUrl ? (
            <div
              style={{
                width: '28px',
                height: '28px',
                borderRadius: '50%',
                overflow: 'hidden',
                border: '1.5px solid #FFFFFF',
                flexShrink: 0
              }}
            >
              <img
                src={
                  currentUser.profileImageUrl.startsWith('data:') || currentUser.profileImageUrl.startsWith('http')
                    ? currentUser.profileImageUrl
                    : `${API_URL}${currentUser.profileImageUrl.startsWith('/') ? '' : '/'}${currentUser.profileImageUrl}`
                }
                alt={currentUser.name}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                onError={(e) => { e.target.style.display = 'none'; }}
              />
            </div>
          ) : (
            <div
              style={{
                width: '28px',
                height: '28px',
                borderRadius: '50%',
                background: '#0052CC',
                border: '1.5px solid #FFFFFF',
                color: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '11px',
                fontWeight: '700',
                flexShrink: 0
              }}
            >
              {getInitials(currentUser.name)}
            </div>
          )}

          <div className="navbar-user-text" style={{ lineHeight: 1.2 }}>
            <div style={{ fontWeight: '600', color: '#FFFFFF', fontSize: '13px', whiteSpace: 'nowrap' }}>
              {currentUser.name}
            </div>
            <div style={{ fontSize: '11px', color: 'rgba(255, 255, 255, 0.75)', whiteSpace: 'nowrap' }}>
              {getRoleLabel()}
            </div>
          </div>
        </div>

        {/* Change PIN Shortcut */}
        {onOpenChangePin && (
          <button
            onClick={onOpenChangePin}
            title="Update 4-Digit Passcode PIN"
            style={{
              background: 'transparent',
              border: 'none',
              color: 'rgba(255, 255, 255, 0.85)',
              width: '32px',
              height: '32px',
              borderRadius: '3px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              fontSize: '13px'
            }}
          >
            <i className="fas fa-key"></i>
          </button>
        )}

        {/* Log out Button */}
        <button
          onClick={onLogout}
          title="Sign out of portal"
          style={{
            background: 'rgba(255, 255, 255, 0.15)',
            border: 'none',
            color: '#FFFFFF',
            padding: '6px 10px',
            borderRadius: '3px',
            fontWeight: '500',
            fontSize: '12px',
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '5px',
            marginLeft: '4px'
          }}
        >
          <i className="fas fa-sign-out-alt"></i>
          <span className="logout-text">Log out</span>
        </button>
      </div>
    </header>
  )
}

export default Navbar
