import React from 'react'

function Navbar({ currentUser, onLogout }) {
  const isAdmin = currentUser.role === 'admin'
  const isManager = currentUser.role === 'manager' || currentUser.role === 'hr'
  
  const getRoleLabel = () => {
    if (isAdmin) return 'Super Admin'
    if (isManager) return currentUser.role === 'hr' ? 'HR Manager' : 'Team Manager'
    return `${currentUser.department || 'BDA'} Associate`
  }

  return (
    <div className="navbar" style={{
      background: '#0a192f',
      borderBottom: '1px solid rgba(255,255,255,0.08)',
      padding: '0.85rem 1.75rem',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      color: '#ffffff'
    }}>
      <div className="logo-area" style={{ display: 'flex', alignItems: 'center', gap: '10px', fontWeight: '800', fontSize: '1.1rem', letterSpacing: '-0.02em' }}>
        <div style={{
          width: '32px',
          height: '32px',
          borderRadius: '8px',
          background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#ffffff'
        }}>
          <i className="fas fa-building"></i>
        </div>
        <div>
          <span>Aparaitech Software</span>
          <span style={{ fontSize: '0.72rem', color: '#93c5fd', display: 'block', fontWeight: '500', letterSpacing: '0.04em' }}>
            Company Working Portal
          </span>
        </div>
      </div>
      <div className="user-info" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem' }}>
          <i className="fas fa-user-circle" style={{ fontSize: '1.25rem', color: '#38bdf8' }}></i>
          <div>
            <div style={{ fontWeight: '700', color: '#ffffff' }}>{currentUser.name}</div>
            <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
              {getRoleLabel()} {currentUser.empId ? `• ${currentUser.empId}` : ''}
            </div>
          </div>
        </div>
        <button className="logout-btn" onClick={onLogout} style={{
          background: 'rgba(239, 68, 68, 0.15)',
          color: '#f87171',
          border: '1px solid rgba(239, 68, 68, 0.3)',
          padding: '6px 14px',
          borderRadius: '8px',
          fontWeight: '600',
          fontSize: '0.8rem',
          cursor: 'pointer'
        }}>
          <i className="fas fa-sign-out-alt" style={{ marginRight: '6px' }}></i>
          Logout
        </button>
      </div>
    </div>
  )
}

export default Navbar
