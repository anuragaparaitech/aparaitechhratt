import React from 'react'

function Navbar({ currentUser, onLogout }) {
  const isAdmin = currentUser.role === 'admin'
  
  return (
    <div className="navbar">
      <div className="logo-area">
        <i className="fas fa-chart-line" style={{ marginRight: '8px' }}></i>
        Aparaitech HRMS
      </div>
      <div className="user-info">
        <span>
          <i className="fas fa-user-circle" style={{ marginRight: '6px' }}></i>
          {currentUser.name} ({isAdmin ? 'Admin' : currentUser.department})
        </span>
        <button className="logout-btn" onClick={onLogout}>
          <i className="fas fa-sign-out-alt" style={{ marginRight: '6px' }}></i>
          Logout
        </button>
      </div>
    </div>
  )
}

export default Navbar
