import React, { useState, useEffect } from 'react'
import LoginScreen from './components/LoginScreen'
import Navbar from './components/Navbar'
import AdminPanel from './components/AdminPanel'
import EmployeePanel from './components/EmployeePanel'
import AdminMessagingCenter from './components/AdminMessagingCenter'
import EmployeeInbox from './components/EmployeeInbox'
import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'https://aparaitech-software-attendance-protal-9l04.onrender.com'

// ── Admin sidebar nav definition ────────────────────────────────────────────
// Each entry maps to a section rendered inside AdminPanel via the activeSection prop.
// 'tab' entries (messaging) render a separate top-level component instead.
const ADMIN_NAV = [
  { id: 'overview',       icon: 'fa-th-large',           label: 'Dashboard Overview',      section: true  },
  { id: 'overall',        icon: 'fa-chart-line',         label: 'Overall Attendance',      section: true  },
  { id: 'live',           icon: 'fa-eye',                label: 'Live Check-Ins',           section: true  },
  { id: 'employees',      icon: 'fa-users',              label: 'Employee Data',            section: true  },
  { id: 'attendance',     icon: 'fa-calendar-check',     label: 'Attendance Logs',          section: true  },
  { id: 'missing',        icon: 'fa-exclamation-triangle',label: 'Missing Checkouts',       section: true  },
  { id: 'autocheckout',   icon: 'fa-robot',              label: 'Auto Checkout Records',    section: true  },
  { id: 'holidays',       icon: 'fa-umbrella-beach',     label: 'Holiday Management',       section: true  },
  { id: 'data',           icon: 'fa-database',           label: 'Data Management',          section: true  },
  { id: 'messaging',      icon: 'fa-envelope',           label: 'Messaging Center',         section: false, tab: 'messaging' },
]

function App() {
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('aparaitech_current_user')
    return saved ? JSON.parse(saved) : null
  })

  const [toast, setToast] = useState(null)
  const [activeTab, setActiveTab] = useState('dashboard')
  // Admin sub-section (which section of AdminPanel to show)
  const [adminSection, setAdminSection] = useState('overview')
  const [unreadCount, setUnreadCount] = useState(0)

  const showToast = (message, bg = '#1e293b') => {
    setToast({ message, bg })
  }

  // Reset tab selection when current user changes
  useEffect(() => {
    setActiveTab('dashboard')
    setAdminSection('overview')
    fetchUnreadCount()
  }, [currentUser])

  // Periodic polling for unread messages (every 30 seconds)
  useEffect(() => {
    if (currentUser && currentUser.role === 'employee') {
      const interval = setInterval(fetchUnreadCount, 30000)
      return () => clearInterval(interval)
    }
  }, [currentUser])

  const fetchUnreadCount = async () => {
    if (currentUser && currentUser.role === 'employee') {
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
      setActiveTab('dashboard')
      setAdminSection(item.id)
    } else {
      setActiveTab(item.tab)
    }
  }

  // Helper: is this nav item currently active?
  const isAdminNavActive = (item) => {
    if (item.section) return activeTab === 'dashboard' && adminSection === item.id
    return activeTab === item.tab
  }

  const sidebarBtnStyle = (active) => ({
    background: active ? 'linear-gradient(135deg, #1e5a7a, #0f2b3d)' : 'transparent',
    color: active ? '#ffffff' : '#475569',
    border: 'none',
    borderRadius: '12px',
    padding: '13px 18px',
    textAlign: 'left',
    fontWeight: '600',
    fontSize: '0.88rem',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
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

          <div className="main-layout" style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', width: '100%' }}>

            {/* ── Sidebar Navigation Card ──────────────────────────────── */}
            <div className="sidebar-card" style={{
              background: '#ffffff',
              borderRadius: '24px',
              padding: '2rem 1.25rem',
              width: '260px',
              minWidth: '260px',
              boxShadow: '0 10px 30px -10px rgba(0, 0, 0, 0.04), 0 1px 1px 0 rgba(0, 0, 0, 0.01), 0 0 0 1px rgba(0, 0, 0, 0.01)',
              border: '1px solid #e2e8f0',
              display: 'flex',
              flexDirection: 'column',
              gap: '10px',
              minHeight: '620px',
              height: 'fit-content'
            }}>

              {currentUser.role === 'admin' ? (
                <>
                  {/* Admin: section label */}
                  <div style={{ fontWeight: '700', fontSize: '0.72rem', color: '#94a3b8', textTransform: 'uppercase', paddingLeft: '0.6rem', marginBottom: '14px', letterSpacing: '0.08em' }}>
                    📌 Admin Navigation
                  </div>

                  {ADMIN_NAV.map(item => (
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
                  {/* Employee: dashboard + inbox */}
                  <div style={{ fontWeight: '700', fontSize: '0.72rem', color: '#94a3b8', textTransform: 'uppercase', paddingLeft: '0.6rem', marginBottom: '14px', letterSpacing: '0.08em' }}>
                    📌 Navigation
                  </div>

                  <button
                    className={`sidebar-nav-btn ${activeTab === 'dashboard' ? 'active' : ''}`}
                    style={sidebarBtnStyle(activeTab === 'dashboard')}
                    onClick={() => setActiveTab('dashboard')}
                  >
                    <i className="fas fa-th-large" style={{ width: '16px', textAlign: 'center' }}></i>
                    Dashboard
                  </button>

                  <button
                    id="employeeInboxTab"
                    className={`sidebar-nav-btn ${activeTab === 'inbox' ? 'active' : ''}`}
                    style={{ ...sidebarBtnStyle(activeTab === 'inbox'), position: 'relative' }}
                    onClick={() => setActiveTab('inbox')}
                  >
                    <i className="fas fa-inbox" style={{ width: '16px', textAlign: 'center' }}></i>
                    Inbox
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

              {/* Admin: dashboard sections */}
              {activeTab === 'dashboard' && currentUser.role === 'admin' && (
                <AdminPanel
                  currentUser={currentUser}
                  showToast={showToast}
                  activeSection={adminSection}
                  onSectionChange={setAdminSection}
                />
              )}

              {/* Employee dashboard */}
              {activeTab === 'dashboard' && currentUser.role === 'employee' && (
                <EmployeePanel
                  currentUser={currentUser}
                  setCurrentUser={(updatedUser) => {
                    setCurrentUser(updatedUser)
                    localStorage.setItem('aparaitech_current_user', JSON.stringify(updatedUser))
                  }}
                  showToast={showToast}
                />
              )}

              {/* Admin: Messaging Center */}
              {activeTab === 'messaging' && currentUser.role === 'admin' && (
                <AdminMessagingCenter currentUser={currentUser} showToast={showToast} />
              )}

              {/* Employee: Inbox */}
              {activeTab === 'inbox' && currentUser.role === 'employee' && (
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
