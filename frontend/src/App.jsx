import React, { useState, useEffect } from 'react'
import LoginScreen from './components/LoginScreen'
import Navbar from './components/Navbar'
import AdminPanel from './components/AdminPanel'
import EmployeePanel from './components/EmployeePanel'
import AdminMessagingCenter from './components/AdminMessagingCenter'
import EmployeeInbox from './components/EmployeeInbox'
import CompanyDashboard from './components/CompanyDashboard'
import PerformanceDashboard from './components/PerformanceDashboard'
import LeaderboardView from './components/LeaderboardView'
import RevenueTrackerView from './components/RevenueTrackerView'
import ManagerReportsView from './components/ManagerReportsView'
import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'https://aparaitech-software-attendance-protal-9l04.onrender.com'

// ── Admin sidebar nav definition ────────────────────────────────────────────
const ADMIN_NAV = [
  // 1. Executive Operations & Performance
  { id: 'overview',       icon: 'fa-tachometer-alt',      label: 'Executive Overview',      section: true,  group: 'Command Center' },
  { id: 'live',           icon: 'fa-eye',                 label: 'Live Check-Ins',          section: true,  group: 'Command Center' },
  { id: 'dailyReports',   icon: 'fa-clipboard-check',     label: 'Daily Working Reports',   section: true,  group: 'Command Center' },
  { id: 'mailBlast',      icon: 'fa-mail-bulk',           label: 'Mail Blast Campaigns',    section: true,  group: 'Command Center' },
  { id: 'revenue',        icon: 'fa-rupee-sign',          label: 'Revenue & Conversions',   section: true,  group: 'Command Center' },
  { id: 'messaging',      icon: 'fa-envelope',            label: 'Messaging Center',        section: false, tab: 'messaging', group: 'Command Center' },
  // 2. Workforce & Attendance Logs
  { id: 'employees',      icon: 'fa-users',               label: 'Employee Directory',      section: true,  group: 'Workforce & Logs' },
  { id: 'attendance',     icon: 'fa-calendar-check',      label: 'Attendance Logs',         section: true,  group: 'Workforce & Logs' },
  { id: 'overall',        icon: 'fa-chart-line',          label: 'Overall Analytics',       section: true,  group: 'Workforce & Logs' },
  { id: 'missing',        icon: 'fa-exclamation-triangle',label: 'Missing Checkouts',      section: true,  group: 'Workforce & Logs' },
  { id: 'autocheckout',   icon: 'fa-robot',               label: 'Auto Checkout Records',   section: true,  group: 'Workforce & Logs' },
  { id: 'holidays',       icon: 'fa-umbrella-beach',      label: 'Holiday Management',      section: true,  group: 'Workforce & Logs' },
  { id: 'data',           icon: 'fa-database',            label: 'Data Management',         section: true,  group: 'Workforce & Logs' },
  // 3. Employee Portal Preview
  { id: 'companyHub',     icon: 'fa-home',                label: 'Employee Portal View',    section: false, tab: 'companyHub', group: 'Portal Preview' },
]

function App() {
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('aparaitech_current_user')
    return saved ? JSON.parse(saved) : null
  })

  const [toast, setToast] = useState(null)
  const [activeTab, setActiveTab] = useState(() => {
    const saved = localStorage.getItem('aparaitech_current_user')
    if (saved) {
      try {
        const u = JSON.parse(saved)
        return u.role === 'admin' ? 'adminPanel' : 'dashboard'
      } catch (e) {}
    }
    return 'dashboard'
  })

  // Admin sub-section (which section of AdminPanel to show)
  const [adminSection, setAdminSection] = useState('overview')
  const [unreadCount, setUnreadCount] = useState(0)

  const showToast = (message, bg = '#1e293b') => {
    setToast({ message, bg })
  }

  const isManagerOrAdmin = currentUser?.role === 'admin' || currentUser?.role === 'manager' || currentUser?.role === 'hr'

  // Reset tab selection when current user changes
  useEffect(() => {
    if (currentUser?.role === 'admin') {
      setActiveTab('adminPanel')
      setAdminSection('overview')
    } else {
      setActiveTab('dashboard')
    }
    fetchUnreadCount()
  }, [currentUser])

  // Periodic polling for unread messages (every 30 seconds)
  useEffect(() => {
    if (currentUser && currentUser.role !== 'admin') {
      const interval = setInterval(fetchUnreadCount, 30000)
      return () => clearInterval(interval)
    }
  }, [currentUser])

  const fetchUnreadCount = async () => {
    if (currentUser && currentUser.role !== 'admin') {
      try {
        const token = localStorage.getItem('aparaitech_token')
        const response = await axios.get(`${API_URL}/api/messages/employee`, {
          headers: { Authorization: `Bearer ${token}` }
        })
        if (response.data.success) {
          setUnreadCount(response.data.unreadCount || 0)
        }
      } catch (err) {
        console.error('Error fetching unread count:', err)
      }
    }
  }

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => {
        setToast(null)
      }, 2700)
      return () => clearTimeout(timer)
    }
  }, [toast])

  const handleLogin = (user) => {
    setCurrentUser(user)
    localStorage.setItem('aparaitech_current_user', JSON.stringify(user))
    if (user.role === 'admin') {
      setActiveTab('adminPanel')
      setAdminSection('overview')
    } else {
      setActiveTab('dashboard')
    }
    showToast(`🔓 Welcome back, ${user.name}!`, '#22c55e')
  }

  const handleLogout = () => {
    setCurrentUser(null)
    localStorage.removeItem('aparaitech_current_user')
    localStorage.removeItem('aparaitech_token')
    showToast('🔒 Signed out successfully', '#1e293b')
  }

  // Navigate to an admin section or top-level tab
  const handleAdminNav = (item) => {
    if (item.section) {
      setActiveTab('adminPanel')
      setAdminSection(item.id)
    } else {
      setActiveTab(item.tab)
    }
  }

  const isAdminNavActive = (item) => {
    if (item.section) return activeTab === 'adminPanel' && adminSection === item.id
    return activeTab === item.tab
  }

  const sidebarBtnStyle = (active) => ({
    background: active ? 'linear-gradient(135deg, #1e5a7a, #0f2b3d)' : 'transparent',
    color: active ? '#ffffff' : '#475569',
    border: 'none',
    borderRadius: '12px',
    padding: '10px 14px',
    textAlign: 'left',
    fontWeight: '600',
    fontSize: '0.84rem',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
    width: '100%',
  })

  return (
    <div style={{ background: 'linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)', minHeight: '100vh', width: '100%', overflowX: 'hidden' }}>
      {!currentUser ? (
        <LoginScreen onLogin={handleLogin} showToast={showToast} />
      ) : (
        <div className="app-container" style={{ display: 'block' }}>
          <Navbar currentUser={currentUser} onLogout={handleLogout} />

          <div className="main-layout" style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', width: '100%', padding: '1.5rem' }}>

            {/* ── Sidebar Navigation Card ──────────────────────────────── */}
            <div className="sidebar-card" style={{
              background: '#ffffff',
              borderRadius: '24px',
              padding: '1.5rem 1.2rem',
              width: '260px',
              minWidth: '260px',
              boxShadow: '0 10px 30px -10px rgba(0, 0, 0, 0.04), 0 1px 1px 0 rgba(0, 0, 0, 0.01)',
              border: '1px solid #e2e8f0',
              display: 'flex',
              flexDirection: 'column',
              gap: '4px',
              minHeight: '620px',
              height: 'fit-content'
            }}>

              {currentUser.role === 'admin' ? (
                <>
                  {/* Group 1: Command Center */}
                  <div style={{ fontWeight: '800', fontSize: '0.7rem', color: '#2563eb', textTransform: 'uppercase', paddingLeft: '0.4rem', marginBottom: '4px', letterSpacing: '0.08em' }}>
                    👑 Command Center
                  </div>

                  {ADMIN_NAV.filter(item => item.group === 'Command Center').map(item => (
                    <button
                      key={item.id}
                      id={`adminNav_${item.id}`}
                      className={`sidebar-nav-btn ${isAdminNavActive(item) ? 'active' : ''}`}
                      style={sidebarBtnStyle(isAdminNavActive(item))}
                      onClick={() => handleAdminNav(item)}
                    >
                      <i className={`fas ${item.icon}`} style={{ width: '16px', textAlign: 'center' }}></i>
                      {item.label}
                    </button>
                  ))}

                  {/* Group 2: Workforce & Logs */}
                  <div style={{ fontWeight: '800', fontSize: '0.7rem', color: '#64748b', textTransform: 'uppercase', paddingLeft: '0.4rem', margin: '10px 0 4px', letterSpacing: '0.08em' }}>
                    👥 Workforce & Logs
                  </div>

                  {ADMIN_NAV.filter(item => item.group === 'Workforce & Logs').map(item => (
                    <button
                      key={item.id}
                      id={`adminNav_${item.id}`}
                      className={`sidebar-nav-btn ${isAdminNavActive(item) ? 'active' : ''}`}
                      style={sidebarBtnStyle(isAdminNavActive(item))}
                      onClick={() => handleAdminNav(item)}
                    >
                      <i className={`fas ${item.icon}`} style={{ width: '16px', textAlign: 'center' }}></i>
                      {item.label}
                    </button>
                  ))}

                  {/* Group 3: Portal Preview */}
                  <div style={{ fontWeight: '800', fontSize: '0.7rem', color: '#059669', textTransform: 'uppercase', paddingLeft: '0.4rem', margin: '10px 0 4px', letterSpacing: '0.08em' }}>
                    🏢 Working Portal
                  </div>

                  {ADMIN_NAV.filter(item => item.group === 'Portal Preview').map(item => (
                    <button
                      key={item.id}
                      id={`adminNav_${item.id}`}
                      className={`sidebar-nav-btn ${isAdminNavActive(item) ? 'active' : ''}`}
                      style={sidebarBtnStyle(isAdminNavActive(item))}
                      onClick={() => handleAdminNav(item)}
                    >
                      <i className={`fas ${item.icon}`} style={{ width: '16px', textAlign: 'center' }}></i>
                      {item.label}
                    </button>
                  ))}
                </>
              ) : (
                <>
                  {/* Employee & Manager Navigation */}
                  <div style={{ fontWeight: '800', fontSize: '0.72rem', color: '#2563eb', textTransform: 'uppercase', paddingLeft: '0.6rem', marginBottom: '8px', letterSpacing: '0.08em' }}>
                    📌 Portal Navigation
                  </div>

                  <button
                    className={`sidebar-nav-btn ${activeTab === 'dashboard' ? 'active' : ''}`}
                    style={sidebarBtnStyle(activeTab === 'dashboard')}
                    onClick={() => setActiveTab('dashboard')}
                  >
                    <i className="fas fa-th-large" style={{ width: '16px', textAlign: 'center' }}></i>
                    Working Dashboard
                  </button>

                  <button
                    className={`sidebar-nav-btn ${activeTab === 'attendance' ? 'active' : ''}`}
                    style={sidebarBtnStyle(activeTab === 'attendance')}
                    onClick={() => setActiveTab('attendance')}
                  >
                    <i className="fas fa-fingerprint" style={{ width: '16px', textAlign: 'center' }}></i>
                    Attendance & Punch
                  </button>

                  <button
                    className={`sidebar-nav-btn ${activeTab === 'performance' ? 'active' : ''}`}
                    style={sidebarBtnStyle(activeTab === 'performance')}
                    onClick={() => setActiveTab('performance')}
                  >
                    <i className="fas fa-chart-line" style={{ width: '16px', textAlign: 'center' }}></i>
                    My Performance
                  </button>

                  <button
                    className={`sidebar-nav-btn ${activeTab === 'leaderboard' ? 'active' : ''}`}
                    style={sidebarBtnStyle(activeTab === 'leaderboard')}
                    onClick={() => setActiveTab('leaderboard')}
                  >
                    <i className="fas fa-trophy" style={{ width: '16px', textAlign: 'center' }}></i>
                    Leaderboard
                  </button>

                  <button
                    className={`sidebar-nav-btn ${activeTab === 'revenue' ? 'active' : ''}`}
                    style={sidebarBtnStyle(activeTab === 'revenue')}
                    onClick={() => setActiveTab('revenue')}
                  >
                    <i className="fas fa-rupee-sign" style={{ width: '16px', textAlign: 'center' }}></i>
                    Revenue Tracker
                  </button>

                  {/* Manager / HR Exclusive Navigation Item */}
                  {isManagerOrAdmin && (
                    <button
                      className={`sidebar-nav-btn ${activeTab === 'managerReports' ? 'active' : ''}`}
                      style={sidebarBtnStyle(activeTab === 'managerReports')}
                      onClick={() => setActiveTab('managerReports')}
                    >
                      <i className="fas fa-file-invoice" style={{ width: '16px', textAlign: 'center' }}></i>
                      Team Reports Hub
                    </button>
                  )}

                  <button
                    id="employeeInboxTab"
                    className={`sidebar-nav-btn ${activeTab === 'inbox' ? 'active' : ''}`}
                    style={{ ...sidebarBtnStyle(activeTab === 'inbox'), position: 'relative' }}
                    onClick={() => setActiveTab('inbox')}
                  >
                    <i className="fas fa-inbox" style={{ width: '16px', textAlign: 'center' }}></i>
                    Message Centre
                    {unreadCount > 0 && (
                      <span style={{
                        background: '#ef4444',
                        color: 'white',
                        borderRadius: '9999px',
                        padding: '2px 8px',
                        fontSize: '0.7rem',
                        fontWeight: 'bold',
                        position: 'absolute',
                        right: '15px'
                      }}>
                        {unreadCount}
                      </span>
                    )}
                  </button>
                </>
              )}
            </div>

            {/* ── Main Content Pane ────────────────────────────────────── */}
            <div className="content-pane" style={{ flex: 1, minWidth: '320px' }}>

              {/* 1. Admin Panel: Comprehensive Executive Control Center (Default for Admin) */}
              {activeTab === 'adminPanel' && currentUser.role === 'admin' && (
                <AdminPanel
                  currentUser={currentUser}
                  showToast={showToast}
                  activeSection={adminSection}
                  onSectionChange={(newSec) => {
                    setAdminSection(newSec)
                    setActiveTab('adminPanel')
                  }}
                />
              )}

              {/* 2. Employee Working Dashboard (Default for Employee / Manager) */}
              {(activeTab === 'dashboard' || activeTab === 'companyHub') && (
                <CompanyDashboard
                  currentUser={currentUser}
                  onNavigate={(targetTab) => {
                    if (currentUser.role === 'admin') {
                      if (targetTab === 'attendance' || targetTab === 'dashboard') {
                        setActiveTab('adminPanel')
                        setAdminSection('overview')
                      } else if (targetTab === 'performance') {
                        setActiveTab('adminPanel')
                        setAdminSection('dailyReports')
                      } else if (targetTab === 'leaderboard') {
                        setActiveTab('leaderboard')
                      } else if (targetTab === 'revenue') {
                        setActiveTab('adminPanel')
                        setAdminSection('revenue')
                      } else if (targetTab === 'messaging') {
                        setActiveTab('messaging')
                      } else if (targetTab === 'inbox') {
                        setActiveTab('messaging')
                      } else {
                        setActiveTab(targetTab)
                      }
                    } else {
                      setActiveTab(targetTab)
                    }
                  }}
                  showToast={showToast}
                  unreadMessagesCount={unreadCount}
                />
              )}

              {/* 3. Employee Attendance Panel (Existing Face Verification & Geofence intact) */}
              {activeTab === 'attendance' && (
                <EmployeePanel
                  currentUser={currentUser}
                  setCurrentUser={(updatedUser) => {
                    setCurrentUser(updatedUser)
                    localStorage.setItem('aparaitech_current_user', JSON.stringify(updatedUser))
                  }}
                  showToast={showToast}
                />
              )}

              {/* 4. Performance Dashboard */}
              {activeTab === 'performance' && (
                <PerformanceDashboard
                  currentUser={currentUser}
                  showToast={showToast}
                />
              )}

              {/* 5. Live Leaderboard */}
              {activeTab === 'leaderboard' && (
                <LeaderboardView
                  currentUser={currentUser}
                  showToast={showToast}
                />
              )}

              {/* 6. Revenue Tracker */}
              {activeTab === 'revenue' && (
                <RevenueTrackerView
                  currentUser={currentUser}
                  showToast={showToast}
                />
              )}

              {/* 7. Manager / HR Team Reports Hub */}
              {activeTab === 'managerReports' && (
                <ManagerReportsView
                  currentUser={currentUser}
                  showToast={showToast}
                />
              )}

              {/* 8. Admin: Messaging Center */}
              {activeTab === 'messaging' && currentUser.role === 'admin' && (
                <AdminMessagingCenter
                  currentUser={currentUser}
                  showToast={showToast}
                />
              )}

              {/* 9. Employee / Manager: Inbox */}
              {activeTab === 'inbox' && (
                <EmployeeInbox
                  currentUser={currentUser}
                  showToast={showToast}
                  onUnreadUpdate={setUnreadCount}
                />
              )}
            </div>
          </div>
        </div>
      )}

      {toast && (
        <div
          className="toast"
          style={{
            background: toast.bg,
            position: 'fixed',
            bottom: '25px',
            left: '50%',
            transform: 'translateX(-50%)',
            color: 'white',
            padding: '12px 28px',
            borderRadius: '60px',
            zIndex: 2000,
            fontWeight: 500,
            boxShadow: '0 8px 20px rgba(0,0,0,0.3)',
            animation: 'fadeInOut 2.5s ease'
          }}
        >
          {toast.message}
        </div>
      )}
    </div>
  )
}

export default App
