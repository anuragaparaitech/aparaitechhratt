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
import SplashScreen from './components/SplashScreen'
import { messageAPI } from './services/api'

// ── Admin sidebar nav definition ────────────────────────────────────────────
const ADMIN_NAV = [
  // 1. Executive Operations & Performance
  { id: 'overview',       icon: 'fa-tachometer-alt',      label: 'Executive Overview',      section: true,  group: 'Command Center' },
  { id: 'live',           icon: 'fa-eye',                 label: 'Live Check-Ins',          section: true,  group: 'Command Center' },
  { id: 'dailyReports',   icon: 'fa-clipboard-check',     label: 'Daily Working Reports',   section: true,  group: 'Command Center' },
  { id: 'mailBlast',      icon: 'fa-mail-bulk',           label: 'Mail Blast Campaigns',    section: true,  group: 'Command Center' },
  { id: 'pipeline',       icon: 'fa-funnel-dollar',       label: 'Onboarding & Pipeline (7-Day)', section: true,  group: 'Command Center' },
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
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false)
  const [showSplash, setShowSplash] = useState(true)

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
        const response = await messageAPI.getEmployeeMessages()
        if (response.success) {
          setUnreadCount(response.unreadCount || 0)
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
      {showSplash && <SplashScreen onFinish={() => setShowSplash(false)} />}
      {!currentUser ? (
        <LoginScreen onLogin={handleLogin} showToast={showToast} />
      ) : (
        <div className="app-container" style={{ display: 'block' }}>
          <Navbar
            currentUser={currentUser}
            onLogout={handleLogout}
            onToggleMobileMenu={() => setMobileDrawerOpen(prev => !prev)}
          />

          <div className="main-layout" style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', width: '100%', padding: '1.5rem' }}>

            {/* ── Desktop Sidebar Navigation Card (Hidden on mobile <1024px) ─────────────────── */}
            <div className="sidebar-card desktop-sidebar" style={{
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

          {/* ── Mobile Slide-Out Drawer Navigation ────────────────────────── */}
          {mobileDrawerOpen && (
            <div className="mobile-drawer-overlay" onClick={() => setMobileDrawerOpen(false)}>
              <div className="mobile-drawer" onClick={(e) => e.stopPropagation()}>
                <div style={{
                  padding: '1.25rem 1.4rem',
                  background: '#0a192f',
                  color: '#ffffff',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{
                      width: '34px',
                      height: '34px',
                      borderRadius: '9px',
                      background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#ffffff'
                    }}>
                      <i className="fas fa-building"></i>
                    </div>
                    <div>
                      <div style={{ fontWeight: '800', fontSize: '0.95rem' }}>Aparaitech Software</div>
                      <div style={{ fontSize: '0.72rem', color: '#93c5fd' }}>
                        {currentUser.name} ({currentUser.role})
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => setMobileDrawerOpen(false)}
                    aria-label="Close navigation"
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

                <div style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '4px', flex: 1, overflowY: 'auto' }}>
                  {currentUser.role === 'admin' ? (
                    <>
                      <div style={{ fontWeight: '800', fontSize: '0.7rem', color: '#2563eb', textTransform: 'uppercase', paddingLeft: '0.4rem', marginBottom: '4px', letterSpacing: '0.08em' }}>
                        👑 Command Center
                      </div>
                      {ADMIN_NAV.filter(item => item.group === 'Command Center').map(item => (
                        <button
                          key={item.id}
                          className={`sidebar-nav-btn ${isAdminNavActive(item) ? 'active' : ''}`}
                          style={sidebarBtnStyle(isAdminNavActive(item))}
                          onClick={() => {
                            handleAdminNav(item)
                            setMobileDrawerOpen(false)
                          }}
                        >
                          <i className={`fas ${item.icon}`} style={{ width: '18px', textAlign: 'center' }}></i>
                          {item.label}
                        </button>
                      ))}

                      <div style={{ fontWeight: '800', fontSize: '0.7rem', color: '#64748b', textTransform: 'uppercase', paddingLeft: '0.4rem', margin: '10px 0 4px', letterSpacing: '0.08em' }}>
                        👥 Workforce & Logs
                      </div>
                      {ADMIN_NAV.filter(item => item.group === 'Workforce & Logs').map(item => (
                        <button
                          key={item.id}
                          className={`sidebar-nav-btn ${isAdminNavActive(item) ? 'active' : ''}`}
                          style={sidebarBtnStyle(isAdminNavActive(item))}
                          onClick={() => {
                            handleAdminNav(item)
                            setMobileDrawerOpen(false)
                          }}
                        >
                          <i className={`fas ${item.icon}`} style={{ width: '18px', textAlign: 'center' }}></i>
                          {item.label}
                        </button>
                      ))}

                      <div style={{ fontWeight: '800', fontSize: '0.7rem', color: '#059669', textTransform: 'uppercase', paddingLeft: '0.4rem', margin: '10px 0 4px', letterSpacing: '0.08em' }}>
                        🏢 Working Portal
                      </div>
                      {ADMIN_NAV.filter(item => item.group === 'Portal Preview').map(item => (
                        <button
                          key={item.id}
                          className={`sidebar-nav-btn ${isAdminNavActive(item) ? 'active' : ''}`}
                          style={sidebarBtnStyle(isAdminNavActive(item))}
                          onClick={() => {
                            handleAdminNav(item)
                            setMobileDrawerOpen(false)
                          }}
                        >
                          <i className={`fas ${item.icon}`} style={{ width: '18px', textAlign: 'center' }}></i>
                          {item.label}
                        </button>
                      ))}
                    </>
                  ) : (
                    <>
                      <div style={{ fontWeight: '800', fontSize: '0.72rem', color: '#2563eb', textTransform: 'uppercase', paddingLeft: '0.6rem', marginBottom: '8px', letterSpacing: '0.08em' }}>
                        📌 Portal Navigation
                      </div>

                      <button
                        className={`sidebar-nav-btn ${activeTab === 'dashboard' ? 'active' : ''}`}
                        style={sidebarBtnStyle(activeTab === 'dashboard')}
                        onClick={() => {
                          setActiveTab('dashboard')
                          setMobileDrawerOpen(false)
                        }}
                      >
                        <i className="fas fa-th-large" style={{ width: '18px', textAlign: 'center' }}></i>
                        Working Dashboard
                      </button>

                      <button
                        className={`sidebar-nav-btn ${activeTab === 'attendance' ? 'active' : ''}`}
                        style={sidebarBtnStyle(activeTab === 'attendance')}
                        onClick={() => {
                          setActiveTab('attendance')
                          setMobileDrawerOpen(false)
                        }}
                      >
                        <i className="fas fa-fingerprint" style={{ width: '18px', textAlign: 'center' }}></i>
                        Attendance & Punch
                      </button>

                      <button
                        className={`sidebar-nav-btn ${activeTab === 'performance' ? 'active' : ''}`}
                        style={sidebarBtnStyle(activeTab === 'performance')}
                        onClick={() => {
                          setActiveTab('performance')
                          setMobileDrawerOpen(false)
                        }}
                      >
                        <i className="fas fa-chart-line" style={{ width: '18px', textAlign: 'center' }}></i>
                        My Performance
                      </button>

                      <button
                        className={`sidebar-nav-btn ${activeTab === 'leaderboard' ? 'active' : ''}`}
                        style={sidebarBtnStyle(activeTab === 'leaderboard')}
                        onClick={() => {
                          setActiveTab('leaderboard')
                          setMobileDrawerOpen(false)
                        }}
                      >
                        <i className="fas fa-trophy" style={{ width: '18px', textAlign: 'center' }}></i>
                        Leaderboard
                      </button>

                      <button
                        className={`sidebar-nav-btn ${activeTab === 'revenue' ? 'active' : ''}`}
                        style={sidebarBtnStyle(activeTab === 'revenue')}
                        onClick={() => {
                          setActiveTab('revenue')
                          setMobileDrawerOpen(false)
                        }}
                      >
                        <i className="fas fa-rupee-sign" style={{ width: '18px', textAlign: 'center' }}></i>
                        Revenue Tracker
                      </button>

                      {isManagerOrAdmin && (
                        <button
                          className={`sidebar-nav-btn ${activeTab === 'managerReports' ? 'active' : ''}`}
                          style={sidebarBtnStyle(activeTab === 'managerReports')}
                          onClick={() => {
                            setActiveTab('managerReports')
                            setMobileDrawerOpen(false)
                          }}
                        >
                          <i className="fas fa-file-invoice" style={{ width: '18px', textAlign: 'center' }}></i>
                          Team Reports Hub
                        </button>
                      )}

                      <button
                        className={`sidebar-nav-btn ${activeTab === 'inbox' ? 'active' : ''}`}
                        style={{ ...sidebarBtnStyle(activeTab === 'inbox'), position: 'relative' }}
                        onClick={() => {
                          setActiveTab('inbox')
                          setMobileDrawerOpen(false)
                        }}
                      >
                        <i className="fas fa-inbox" style={{ width: '18px', textAlign: 'center' }}></i>
                        Message Centre
                        {unreadCount > 0 && (
                          <span style={{
                            background: '#ef4444',
                            color: 'white',
                            borderRadius: '9999px',
                            padding: '2px 8px',
                            fontSize: '0.7rem',
                            fontWeight: 'bold',
                            marginLeft: 'auto'
                          }}>
                            {unreadCount}
                          </span>
                        )}
                      </button>
                    </>
                  )}

                  <div style={{ marginTop: 'auto', paddingTop: '1.25rem', borderTop: '1px solid #f1f5f9' }}>
                    <button
                      onClick={() => {
                        setMobileDrawerOpen(false)
                        handleLogout()
                      }}
                      style={{
                        width: '100%',
                        background: '#fef2f2',
                        color: '#ef4444',
                        border: '1px solid #fecaca',
                        padding: '11px 14px',
                        borderRadius: '10px',
                        fontWeight: '700',
                        fontSize: '0.85rem',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px'
                      }}
                    >
                      <i className="fas fa-sign-out-alt"></i> Sign Out
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── Mobile Sticky Bottom Navigation Bar (<1024px) ─────────────────── */}
          <nav className="bottom-nav-bar mobile-bottom-nav">
            {currentUser.role === 'admin' ? (
              <>
                <button
                  className={`bottom-nav-item ${activeTab === 'adminPanel' && adminSection === 'overview' ? 'active' : ''}`}
                  onClick={() => {
                    setActiveTab('adminPanel')
                    setAdminSection('overview')
                  }}
                >
                  <i className="fas fa-tachometer-alt"></i>
                  <span>Overview</span>
                </button>

                <button
                  className={`bottom-nav-item ${activeTab === 'adminPanel' && adminSection === 'live' ? 'active' : ''}`}
                  onClick={() => {
                    setActiveTab('adminPanel')
                    setAdminSection('live')
                  }}
                >
                  <i className="fas fa-eye"></i>
                  <span>Live</span>
                </button>

                <button
                  className={`bottom-nav-item ${activeTab === 'adminPanel' && adminSection === 'dailyReports' ? 'active' : ''}`}
                  onClick={() => {
                    setActiveTab('adminPanel')
                    setAdminSection('dailyReports')
                  }}
                >
                  <i className="fas fa-clipboard-check"></i>
                  <span>Reports</span>
                </button>

                <button
                  className={`bottom-nav-item ${activeTab === 'adminPanel' && adminSection === 'revenue' ? 'active' : ''}`}
                  onClick={() => {
                    setActiveTab('adminPanel')
                    setAdminSection('revenue')
                  }}
                >
                  <i className="fas fa-rupee-sign"></i>
                  <span>Revenue</span>
                </button>

                <button
                  className="bottom-nav-item"
                  onClick={() => setMobileDrawerOpen(true)}
                >
                  <i className="fas fa-bars"></i>
                  <span>Menu</span>
                </button>
              </>
            ) : (
              <>
                <button
                  className={`bottom-nav-item ${activeTab === 'dashboard' ? 'active' : ''}`}
                  onClick={() => setActiveTab('dashboard')}
                >
                  <i className="fas fa-th-large"></i>
                  <span>Home</span>
                </button>

                <button
                  className={`bottom-nav-item ${activeTab === 'attendance' ? 'active' : ''}`}
                  onClick={() => setActiveTab('attendance')}
                >
                  <i className="fas fa-fingerprint"></i>
                  <span>Punch</span>
                </button>

                <button
                  className={`bottom-nav-item ${activeTab === 'performance' ? 'active' : ''}`}
                  onClick={() => setActiveTab('performance')}
                >
                  <i className="fas fa-chart-line"></i>
                  <span>Metrics</span>
                </button>

                <button
                  className={`bottom-nav-item ${activeTab === 'leaderboard' ? 'active' : ''}`}
                  onClick={() => setActiveTab('leaderboard')}
                >
                  <i className="fas fa-trophy"></i>
                  <span>Ranks</span>
                </button>

                <button
                  className={`bottom-nav-item ${activeTab === 'inbox' ? 'active' : ''}`}
                  onClick={() => setActiveTab('inbox')}
                  style={{ position: 'relative' }}
                >
                  <i className="fas fa-inbox"></i>
                  <span>Inbox</span>
                  {unreadCount > 0 && (
                    <span style={{
                      position: 'absolute',
                      top: '4px',
                      right: 'calc(50% - 16px)',
                      background: '#ef4444',
                      color: '#ffffff',
                      borderRadius: '9999px',
                      padding: '1px 5px',
                      fontSize: '0.62rem',
                      fontWeight: 'bold',
                      lineHeight: 1
                    }}>
                      {unreadCount}
                    </span>
                  )}
                </button>

                <button
                  className="bottom-nav-item"
                  onClick={() => setMobileDrawerOpen(true)}
                >
                  <i className="fas fa-ellipsis-h"></i>
                  <span>More</span>
                </button>
              </>
            )}
          </nav>
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
