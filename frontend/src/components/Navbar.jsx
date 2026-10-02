import React from 'react'

function Navbar({ currentUser, onLogout, onToggleMobileMenu }) {
  const isAdmin = currentUser.role === 'admin'
  const isManager = currentUser.role === 'manager' || currentUser.role === 'hr'
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
    if (isManager) return currentUser.role === 'hr' ? 'HR Manager' : 'Team Manager'
    return `${currentUser.department || 'BDA'} Associate`
  }

  return (
    <div className="navbar" style={{
      background: '#0a192f',
      borderBottom: '1px solid rgba(255,255,255,0.08)',
      padding: '0.85rem 1.5rem',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      color: '#ffffff',
      gap: '0.75rem',
      width: '100%',
      boxSizing: 'border-box'
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
          width: '34px',
          height: '34px',
          borderRadius: '9px',
          background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#ffffff',
          flexShrink: 0
        }}>
          <i className="fas fa-building"></i>
        </div>
        <div style={{ minWidth: 0, overflow: 'hidden' }}>
          <div style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontWeight: '800' }}>
            Aparaitech Software
          </div>
          <span style={{ fontSize: '0.7rem', color: '#93c5fd', display: 'block', fontWeight: '500', letterSpacing: '0.03em', whiteSpace: 'nowrap' }}>
            Company Working Portal
          </span>
        </div>
      </div>

      <div className="user-info" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem' }}>
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
