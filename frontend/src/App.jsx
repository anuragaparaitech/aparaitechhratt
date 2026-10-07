import React, { useState, useEffect, useRef } from 'react'
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
import MyCallingList from './components/MyCallingList'
import SplashScreen from './components/SplashScreen'
import { messageAPI } from './services/api'

// Software Portal Components
import SoftwareDashboard from './components/SoftwareDashboard'
import SoftwareTaskManager from './components/SoftwareTaskManager'
import SoftwareProjectManager from './components/SoftwareProjectManager'
import SoftwareReportsView from './components/SoftwareReportsView'
import CodeRepositoryView from './components/CodeRepositoryView'
import SoftwarePerformanceView from './components/SoftwarePerformanceView'
import LeaveManagementView from './components/LeaveManagementView'
import AnnouncementsView from './components/AnnouncementsView'
import SettingsView from './components/SettingsView'
import NotificationCenterModal from './components/NotificationCenterModal'
import SoftwareDailyReportModal from './components/SoftwareDailyReportModal'
import EmployeeProfileModal from './components/EmployeeProfileModal'
import ChangePinModal from './components/ChangePinModal'
import NotificationBanner from './components/NotificationBanner'
import { popNotification, requestNotificationPermission } from './services/notificationService'
import { leadsAPI, taskAPI } from './services/api'
import { useAutoRefresh, SYNC_EVENTS } from './utils/realtimeSync'

// ── Admin sidebar nav definition (BDA / Executive) ──────────────────────────
const ADMIN_NAV = [
  // 1. Executive Operations & Performance
  { id: 'overview',           icon: 'fa-tachometer-alt',      label: 'Executive Overview',      section: true,  group: 'Command Center' },
  { id: 'aiDataDistribution', icon: 'fa-brain',               label: 'AI Lead Distribution',    section: true,  group: 'Command Center' },
  { id: 'live',               icon: 'fa-eye',                 label: 'Live Check-Ins',          section: true,  group: 'Command Center' },
  { id: 'dailyReports',       icon: 'fa-clipboard-check',     label: 'Daily Working Reports',   section: true,  group: 'Command Center' },
  { id: 'mailBlast',          icon: 'fa-mail-bulk',           label: 'Mail Blast Campaigns',    section: true,  group: 'Command Center' },
  { id: 'pipeline',           icon: 'fa-funnel-dollar',       label: 'Onboarding & Pipeline (7-Day)', section: true,  group: 'Command Center' },
  { id: 'revenue',            icon: 'fa-rupee-sign',          label: 'Revenue & Conversions',   section: true,  group: 'Command Center' },
  { id: 'bdaSalary',          icon: 'fa-briefcase',           label: 'BDA Salary & Monthly Criteria', section: true, group: 'Command Center' },
  { id: 'internTarget',       icon: 'fa-bullseye',            label: 'Intern Monthly Targets',  section: true,  group: 'Command Center' },
  { id: 'messaging',          icon: 'fa-envelope',            label: 'Messaging Center',        section: false, tab: 'messaging', group: 'Command Center' },
  // 2. Workforce & Attendance Logs
  { id: 'employees',          icon: 'fa-users',               label: 'Employee Directory',      section: true,  group: 'Workforce & Logs' },
  { id: 'attendance',         icon: 'fa-calendar-check',      label: 'Attendance Logs',         section: true,  group: 'Workforce & Logs' },
  { id: 'leaves',             icon: 'fa-calendar-alt',        label: 'Leave Requests & Approvals', section: false, tab: 'leave', group: 'Workforce & Logs' },
  { id: 'overall',            icon: 'fa-chart-line',          label: 'Overall Analytics',       section: true,  group: 'Workforce & Logs' },
  { id: 'missing',            icon: 'fa-exclamation-triangle',label: 'Missing Checkouts',       section: true,  group: 'Workforce & Logs' },
  { id: 'autocheckout',       icon: 'fa-robot',               label: 'Auto Checkout Records',   section: true,  group: 'Workforce & Logs' },
  { id: 'holidays',           icon: 'fa-umbrella-beach',      label: 'Holiday Management',      section: true,  group: 'Workforce & Logs' },
  { id: 'data',               icon: 'fa-database',            label: 'Data Management',         section: true,  group: 'Workforce & Logs' },
  // 3. Employee Portal Preview
  { id: 'companyHub',         icon: 'fa-home',                label: 'Employee Portal View',    section: false, tab: 'companyHub', group: 'Portal Preview' },
]

// ── Software Team sidebar nav definition ────────────────────────────────────
const SOFTWARE_NAV = [
  // 1. Software Workspace
  { id: 'softwareDashboard',    icon: 'fa-laptop-code',     label: 'Software Dashboard',  group: 'Software Workspace' },
  { id: 'softwareTasks',        icon: 'fa-tasks',           label: 'Sprint Tasks Board',  group: 'Software Workspace' },
  { id: 'softwareProjects',     icon: 'fa-project-diagram', label: 'Projects Hub',        group: 'Software Workspace' },
  { id: 'softwareDailyReports', icon: 'fa-clipboard-check', label: 'Daily Work Reports',  group: 'Software Workspace' },
  { id: 'softwareRepos',        icon: 'fa-code-branch',     label: 'Code Repository',     group: 'Software Workspace' },
  { id: 'softwarePerformance',  icon: 'fa-chart-line',      label: 'Velocity & Metrics',  group: 'Software Workspace' },

  // 2. Attendance & HR Desk
  { id: 'attendance',           icon: 'fa-fingerprint',     label: 'Attendance & Punch',  group: 'Attendance & HR' },
  { id: 'softwareLeave',        icon: 'fa-calendar-alt',    label: 'Leave Management',    group: 'Attendance & HR' },

  // 3. Communications & Setup
  { id: 'softwareAnnouncements',icon: 'fa-bullhorn',        label: 'Announcements',       group: 'Communication' },
  { id: 'inbox',                icon: 'fa-inbox',           label: 'Message Centre',      group: 'Communication', badge: true },
  { id: 'softwareSettings',     icon: 'fa-cog',             label: 'Portal Settings',     group: 'Communication' },

  // 4. Leadership & Oversight (Anurag & Admin)
  { id: 'managerReports',       icon: 'fa-clipboard-list',  label: 'BDA Daily Reports',   group: 'Leadership & Oversight', requiresLeadership: true }
]

// ── HR Operations sidebar nav definition ────────────────────────────────────
const HR_NAV = [
  // 1. HR Command Center
  { id: 'overview',     icon: 'fa-tachometer-alt',  label: 'HR Overview',               group: 'HR Command Center', section: true },
  { id: 'employees',    icon: 'fa-users',           label: 'Workforce Directory',       group: 'HR Command Center', section: true },
  { id: 'leaves',       icon: 'fa-calendar-alt',    label: 'Leave Approvals Desk',      group: 'HR Command Center', section: false, tab: 'leave' },
  { id: 'dailyReports', icon: 'fa-clipboard-check', label: 'All Daily Work Reports',    group: 'HR Command Center', section: true },
  { id: 'bdaSalary',    icon: 'fa-briefcase',       label: 'BDA Salary & Monthly Criteria', group: 'HR Command Center', section: true },
  { id: 'internTarget', icon: 'fa-bullseye',        label: 'Intern Monthly Targets',    group: 'HR Command Center', section: true },

  // 2. Attendance & Workforce Logs
  { id: 'live',         icon: 'fa-eye',             label: 'Live Check-Ins',            group: 'Attendance & Workforce', section: true },
  { id: 'attendance',   icon: 'fa-calendar-check',  label: 'Attendance Logs',           group: 'Attendance & Workforce', section: true },
  { id: 'overall',      icon: 'fa-chart-line',      label: 'Attendance Analytics',      group: 'Attendance & Workforce', section: true },
  { id: 'missing',      icon: 'fa-exclamation-triangle', label: 'Missing Checkouts',     group: 'Attendance & Workforce', section: true },
  { id: 'autocheckout', icon: 'fa-robot',           label: 'Auto Checkout Records',     group: 'Attendance & Workforce', section: true },
  { id: 'holidays',     icon: 'fa-umbrella-beach',  label: 'Holiday Management',        group: 'Attendance & Workforce', section: true },

  // 3. HR Communications & Policies
  { id: 'announcements',icon: 'fa-bullhorn',        label: 'HR Announcements',          group: 'HR Communications', section: false, tab: 'announcements' },
  { id: 'messaging',    icon: 'fa-envelope',        label: 'HR Messaging Center',       group: 'HR Communications', section: false, tab: 'messaging' },
]

function App() {
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('aparaitech_current_user')
    return saved ? JSON.parse(saved) : null
  })

  // Permission helpers: Anurag (Management/Lead), HR, and Super Admin can switch portals.
  // Vivek and Mahesh are strictly software developers and stay in the software portal.
  const isAnuragOrSuperAdmin = (u) => {
    if (!u) return false
    const email = u.email?.toLowerCase().trim() || ''
    const empId = String(u.empId || '').trim()
    const isBlocked = (
      email === 'letsmailvivek100@gmail.com' ||
      empId === '7044' ||
      empId === 'AP7044' ||
      email === 'kadammahesh803@gmail.com' ||
      ((empId === '7056' || empId === 'AP7056') && email !== 'anunand2004@gmail.com')
    )
    return !isBlocked && (
      u.role === 'admin' ||
      u.role === 'hr' ||
      email === 'anunand2004@gmail.com' ||
      empId === '7017' ||
      empId === 'AP7017'
    )
  }

  const canSwitchPortal = isAnuragOrSuperAdmin(currentUser)

  const getInitialPortalMode = (user) => {
    if (!user) return 'bda'
    const saved = localStorage.getItem('aparaitech_portal_mode')
    if (saved && ['software', 'bda', 'hr'].includes(saved) && (user.role === 'admin' || user.role === 'hr' || user.email?.toLowerCase() === 'anunand2004@gmail.com' || String(user.empId) === '7017' || String(user.empId) === 'AP7017')) {
      return saved
    }
    if (user.role === 'hr') return 'hr'
    // Anurag Nand default is Software Portal with HR & BDA access
    if (user.email?.toLowerCase() === 'anunand2004@gmail.com' || String(user.empId) === '7017' || String(user.empId) === 'AP7017') {
      return 'software'
    }
    if (user.role === 'admin') {
      return 'hr'
    }
    const isDev = (
      user.department === 'Development' ||
      user.department === 'Software' ||
      user.role === 'developer' ||
      user.role === 'intern' ||
      user.designation?.toLowerCase().includes('software') ||
      user.designation?.toLowerCase().includes('developer')
    )
    return isDev ? 'software' : 'bda'
  }

  // Active portal mode ('software' vs 'bda' vs 'hr')
  const [portalMode, setPortalMode] = useState(() => {
    const saved = localStorage.getItem('aparaitech_current_user')
    if (saved) {
      try {
        const u = JSON.parse(saved)
        return getInitialPortalMode(u)
      } catch (e) {}
    }
    return 'bda'
  })

  const [toast, setToast] = useState(null)
  const [activeTab, setActiveTab] = useState(() => {
    const saved = localStorage.getItem('aparaitech_current_user')
    if (saved) {
      try {
        const u = JSON.parse(saved)
        const mode = getInitialPortalMode(u)
        if (mode === 'software') return 'softwareDashboard'
        return u.role === 'admin' ? 'adminPanel' : 'dashboard'
      } catch (e) {}
    }
    return 'dashboard'
  })

  // Admin sub-section (which section of AdminPanel to show)
  const [adminSection, setAdminSection] = useState('overview')
  const [unreadCount, setUnreadCount] = useState(0)
  const [assignedLeadsCount, setAssignedLeadsCount] = useState(0)
  const [assignedTasksCount, setAssignedTasksCount] = useState(0)
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false)
  const [showSplash, setShowSplash] = useState(true)
  const [isNotifModalOpen, setIsNotifModalOpen] = useState(false)
  const [isGlobalReportModalOpen, setIsGlobalReportModalOpen] = useState(false)
  const [isGlobalProfileOpen, setIsGlobalProfileOpen] = useState(false)
  const [isGlobalPinOpen, setIsGlobalPinOpen] = useState(false)

  const showToast = (message, bg = '#1e293b') => {
    setToast({ message, bg })
  }

  const isManagerOrAdmin = currentUser?.role === 'admin' || currentUser?.role === 'manager' || currentUser?.role === 'hr' || currentUser?.email?.toLowerCase() === 'anunand2004@gmail.com' || String(currentUser?.empId) === '7017' || String(currentUser?.empId) === 'AP7017'

  // Reset tab selection when current user changes
  useEffect(() => {
    if (currentUser) {
      const mode = getInitialPortalMode(currentUser)
      setPortalMode(mode)
      if (mode === 'software') {
        setActiveTab('softwareDashboard')
      } else if (currentUser.role === 'admin') {
        setActiveTab('adminPanel')
        setAdminSection('overview')
      } else {
        setActiveTab('dashboard')
      }
      fetchUnreadCount()
      checkAssignedData()
    }
  }, [currentUser])

  const prevUnreadRef = useRef(null)
  const prevLeadsCountRef = useRef(null)
  const prevTasksCountRef = useRef(null)
  const hasNotified7PMTodayRef = useRef(false)

  // 07:00 PM Daily Report Notification Checker (runs every 60s)
  useEffect(() => {
    if (!currentUser) return
    const check7PM = () => {
      const now = new Date()
      const hours = now.getHours()
      // If 7:00 PM or later (19:00 - 23:59) and haven't triggered this session
      if (hours >= 19 && !hasNotified7PMTodayRef.current) {
        hasNotified7PMTodayRef.current = true
        popNotification({
          title: '📝 07:00 PM Work Report Deadline',
          body: '07:00 PM deadline reached! Please submit your daily engineering / work report.',
          tag: 'daily-report-deadline',
          onClick: () => {
            if (portalMode === 'software') {
              setIsGlobalReportModalOpen(true)
            } else {
              setActiveTab('dailyReports')
            }
          }
        })
      }
    }

    check7PM()
    const interval = setInterval(check7PM, 60000)
    return () => clearInterval(interval)
  }, [currentUser, portalMode])

  const fetchUnreadCount = async () => {
    if (currentUser && currentUser.role !== 'admin') {
      try {
        const response = await messageAPI.getEmployeeMessages()
        if (response.success) {
          const count = response.unreadCount || 0
          if (prevUnreadRef.current !== null && count > prevUnreadRef.current) {
            popNotification({
              title: '💬 New Leadership Message',
              body: `You have ${count} unread message${count > 1 ? 's' : ''} waiting in Message Centre.`,
              tag: 'unread-message',
              onClick: () => setActiveTab('inbox')
            })
          }
          prevUnreadRef.current = count
          setUnreadCount(count)
        }
      } catch (err) {
        console.error('Error fetching unread count:', err)
      }
    }
  }

  const checkAssignedData = async () => {
    if (!currentUser) return

    // 1. Check for BDA / calling leads assignment
    if (currentUser.role !== 'admin' && portalMode === 'bda') {
      try {
        const res = await leadsAPI.getMyCallingSummary()
        if (res?.success && res.stats) {
          const total = res.stats.totalAssigned || 0
          const pending = res.stats.pendingCount || 0
          if (prevLeadsCountRef.current !== null && total > prevLeadsCountRef.current) {
            const diff = total - prevLeadsCountRef.current
            popNotification({
              title: '📋 New Company Leads Assigned',
              body: `Admin assigned ${diff} new calling lead${diff > 1 ? 's' : ''} to your desk! Check Company Assign Data.`,
              tag: 'new-leads-assigned',
              onClick: () => setActiveTab('callingList')
            })
            showToast(`🚀 ${diff} new company leads assigned to your desk!`, '#0d9488')
          }
          prevLeadsCountRef.current = total
          setAssignedLeadsCount(pending > 0 ? pending : total)
        }
      } catch (err) {
        // Background check safe ignore
      }
    }

    // 2. Check for Software team task assignments
    if (portalMode === 'software' && currentUser.role !== 'admin') {
      try {
        const res = await taskAPI.getMyTasks()
        if (res?.success && Array.isArray(res.data)) {
          const count = res.data.length
          if (prevTasksCountRef.current !== null && count > prevTasksCountRef.current) {
            const diff = count - prevTasksCountRef.current
            popNotification({
              title: '💻 New Sprint Task Assigned',
              body: `${diff} new sprint task${diff > 1 ? 's' : ''} assigned to your board!`,
              tag: 'new-task-assigned',
              onClick: () => setActiveTab('softwareTasks')
            })
            showToast(`🚀 New sprint task assigned!`, '#2563eb')
          }
          prevTasksCountRef.current = count
          const pendingTasks = res.data.filter(t => t.status !== 'Done' && t.status !== 'Completed').length
          setAssignedTasksCount(pendingTasks)
        }
      } catch (err) {
        // Background check safe ignore
      }
    }
  }

  // Periodic and event-driven auto-refresh (leads, tasks, messages) every 15 seconds, on tab focus, and on sync events
  useAutoRefresh(() => {
    fetchUnreadCount()
    checkAssignedData()
  }, {
    intervalMs: 15000,
    eventTypes: [
      SYNC_EVENTS.DATA_ASSIGNED,
      SYNC_EVENTS.TASK_ASSIGNED,
      SYNC_EVENTS.MESSAGE_SENT,
      SYNC_EVENTS.LEAD_STATUS_UPDATED
    ],
    onFocus: true,
    enabled: Boolean(currentUser)
  })

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
    // Request notification permission smoothly on user action
    requestNotificationPermission()
    const mode = getInitialPortalMode(user)
    setPortalMode(mode)
    if (mode === 'software') {
      setActiveTab('softwareDashboard')
    } else if (user.role === 'admin') {
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

  const handleTogglePortal = (mode) => {
    setPortalMode(mode)
    localStorage.setItem('aparaitech_portal_mode', mode)
    if (mode === 'software') {
      setActiveTab('softwareDashboard')
    } else if (mode === 'hr') {
      setActiveTab('adminPanel')
      setAdminSection('overview')
    } else {
      if (currentUser?.role === 'admin') {
        setActiveTab('adminPanel')
        setAdminSection('overview')
      } else {
        setActiveTab('dashboard')
      }
    }
    const modeName = mode === 'software' ? 'Software Team' : (mode === 'hr' ? 'Human Resources (HR)' : 'BDA Calling')
    showToast(`Switched to ${modeName} Portal`, '#2563eb')
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
            portalMode={portalMode}
            onTogglePortal={handleTogglePortal}
            canSwitchPortal={canSwitchPortal}
            onOpenNotifications={() => setIsNotifModalOpen(true)}
            onOpenProfile={() => setIsGlobalProfileOpen(true)}
            onOpenChangePin={() => setIsGlobalPinOpen(true)}
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

              {/* Portal Mode Switcher in Desktop Sidebar for Management & Admin */}
              {canSwitchPortal && (
                <div style={{
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '14px',
                  padding: '4px',
                  display: 'flex',
                  gap: '4px',
                  marginBottom: '1rem'
                }}>
                  <button
                    onClick={() => handleTogglePortal('software')}
                    style={{
                      flex: 1,
                      padding: '8px 8px',
                      borderRadius: '10px',
                      border: 'none',
                      fontSize: '0.74rem',
                      fontWeight: '700',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '5px',
                      background: portalMode === 'software' ? 'linear-gradient(135deg, #2563eb, #1d4ed8)' : 'transparent',
                      color: portalMode === 'software' ? '#ffffff' : '#64748b',
                      boxShadow: portalMode === 'software' ? '0 2px 8px rgba(37,99,235,0.3)' : 'none',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <i className="fas fa-laptop-code"></i>
                    Software
                  </button>
                  <button
                    onClick={() => handleTogglePortal('bda')}
                    style={{
                      flex: 1,
                      padding: '8px 8px',
                      borderRadius: '10px',
                      border: 'none',
                      fontSize: '0.74rem',
                      fontWeight: '700',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '5px',
                      background: portalMode === 'bda' ? 'linear-gradient(135deg, #059669, #047857)' : 'transparent',
                      color: portalMode === 'bda' ? '#ffffff' : '#64748b',
                      boxShadow: portalMode === 'bda' ? '0 2px 8px rgba(5,150,105,0.3)' : 'none',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <i className="fas fa-headset"></i>
                    BDA
                  </button>
                  <button
                    onClick={() => handleTogglePortal('hr')}
                    style={{
                      flex: 1,
                      padding: '8px 8px',
                      borderRadius: '10px',
                      border: 'none',
                      fontSize: '0.74rem',
                      fontWeight: '700',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '5px',
                      background: portalMode === 'hr' ? 'linear-gradient(135deg, #7c3aed, #6d28d9)' : 'transparent',
                      color: portalMode === 'hr' ? '#ffffff' : '#64748b',
                      boxShadow: portalMode === 'hr' ? '0 2px 8px rgba(124,58,237,0.3)' : 'none',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <i className="fas fa-users-cog"></i>
                    HR
                  </button>
                </div>
              )}

              {/* MODE 1: HR OPERATIONS WORKSPACE */}
              {portalMode === 'hr' ? (
                <>
                  {/* HR Group 1: Command Center */}
                  <div style={{ fontWeight: '800', fontSize: '0.7rem', color: '#7c3aed', textTransform: 'uppercase', paddingLeft: '0.4rem', marginBottom: '4px', letterSpacing: '0.08em' }}>
                    👑 HR Command Center
                  </div>
                  {HR_NAV.filter(item => item.group === 'HR Command Center').map(item => (
                    <button
                      key={item.id}
                      className={`sidebar-nav-btn ${isAdminNavActive(item) ? 'active' : ''}`}
                      style={sidebarBtnStyle(isAdminNavActive(item))}
                      onClick={() => handleAdminNav(item)}
                    >
                      <i className={`fas ${item.icon}`} style={{ width: '16px', textAlign: 'center' }}></i>
                      {item.label}
                    </button>
                  ))}

                  {/* HR Group 2: Attendance & Workforce */}
                  <div style={{ fontWeight: '800', fontSize: '0.7rem', color: '#64748b', textTransform: 'uppercase', paddingLeft: '0.4rem', margin: '10px 0 4px', letterSpacing: '0.08em' }}>
                    ⏱️ Attendance & Workforce
                  </div>
                  {HR_NAV.filter(item => item.group === 'Attendance & Workforce').map(item => (
                    <button
                      key={item.id}
                      className={`sidebar-nav-btn ${isAdminNavActive(item) ? 'active' : ''}`}
                      style={sidebarBtnStyle(isAdminNavActive(item))}
                      onClick={() => handleAdminNav(item)}
                    >
                      <i className={`fas ${item.icon}`} style={{ width: '16px', textAlign: 'center' }}></i>
                      {item.label}
                    </button>
                  ))}

                  {/* HR Group 3: Communications & Policies */}
                  <div style={{ fontWeight: '800', fontSize: '0.7rem', color: '#059669', textTransform: 'uppercase', paddingLeft: '0.4rem', margin: '10px 0 4px', letterSpacing: '0.08em' }}>
                    📢 Communications
                  </div>
                  {HR_NAV.filter(item => item.group === 'HR Communications').map(item => (
                    <button
                      key={item.id}
                      className={`sidebar-nav-btn ${isAdminNavActive(item) ? 'active' : ''}`}
                      style={sidebarBtnStyle(isAdminNavActive(item))}
                      onClick={() => handleAdminNav(item)}
                    >
                      <i className={`fas ${item.icon}`} style={{ width: '16px', textAlign: 'center' }}></i>
                      {item.label}
                    </button>
                  ))}
                </>
              ) : portalMode === 'software' ? (
                <>
                  {/* Group 1: Software Workspace */}
                  <div style={{ fontWeight: '800', fontSize: '0.7rem', color: '#2563eb', textTransform: 'uppercase', paddingLeft: '0.4rem', marginBottom: '4px', letterSpacing: '0.08em' }}>
                    💻 Software Workspace
                  </div>
                  {SOFTWARE_NAV.filter(item => item.group === 'Software Workspace').map(item => (
                    <button
                      key={item.id}
                      className={`sidebar-nav-btn ${activeTab === item.id ? 'active' : ''}`}
                      style={{ ...sidebarBtnStyle(activeTab === item.id), position: 'relative' }}
                      onClick={() => setActiveTab(item.id)}
                    >
                      <i className={`fas ${item.icon}`} style={{ width: '16px', textAlign: 'center' }}></i>
                      <span style={{ flex: 1 }}>{item.label}</span>
                      {item.id === 'softwareTasks' && assignedTasksCount > 0 && (
                        <span style={{
                          background: '#2563eb',
                          color: '#ffffff',
                          borderRadius: '9999px',
                          padding: '2px 8px',
                          fontSize: '0.7rem',
                          fontWeight: '800'
                        }}>
                          {assignedTasksCount}
                        </span>
                      )}
                    </button>
                  ))}

                  {/* Group 2: Attendance & HR */}
                  <div style={{ fontWeight: '800', fontSize: '0.7rem', color: '#64748b', textTransform: 'uppercase', paddingLeft: '0.4rem', margin: '12px 0 4px', letterSpacing: '0.08em' }}>
                    ⏱️ Attendance & HR Desk
                  </div>
                  {SOFTWARE_NAV.filter(item => item.group === 'Attendance & HR').map(item => (
                    <button
                      key={item.id}
                      className={`sidebar-nav-btn ${activeTab === item.id ? 'active' : ''}`}
                      style={sidebarBtnStyle(activeTab === item.id)}
                      onClick={() => setActiveTab(item.id)}
                    >
                      <i className={`fas ${item.icon}`} style={{ width: '16px', textAlign: 'center' }}></i>
                      {item.label}
                    </button>
                  ))}

                  {/* Group 3: Communication & Settings */}
                  <div style={{ fontWeight: '800', fontSize: '0.7rem', color: '#059669', textTransform: 'uppercase', paddingLeft: '0.4rem', margin: '12px 0 4px', letterSpacing: '0.08em' }}>
                    💬 Communication & Setup
                  </div>
                  {SOFTWARE_NAV.filter(item => item.group === 'Communication').map(item => (
                    <button
                      key={item.id}
                      className={`sidebar-nav-btn ${activeTab === item.id ? 'active' : ''}`}
                      style={{ ...sidebarBtnStyle(activeTab === item.id), position: 'relative' }}
                      onClick={() => setActiveTab(item.id)}
                    >
                      <i className={`fas ${item.icon}`} style={{ width: '16px', textAlign: 'center' }}></i>
                      {item.label}
                      {item.badge && unreadCount > 0 && (
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
                  ))}

                  {/* Group 4: Leadership & Oversight (Anurag & Admin) */}
                  {(currentUser.role === 'admin' || currentUser.email?.toLowerCase() === 'anunand2004@gmail.com' || String(currentUser.empId) === '7017' || String(currentUser.empId) === 'AP7017') && (
                    <>
                      <div style={{ fontWeight: '800', fontSize: '0.7rem', color: '#0d9488', textTransform: 'uppercase', paddingLeft: '0.4rem', margin: '12px 0 4px', letterSpacing: '0.08em' }}>
                        📊 Leadership & Oversight
                      </div>
                      <button
                        className={`sidebar-nav-btn ${activeTab === 'managerReports' ? 'active' : ''}`}
                        style={sidebarBtnStyle(activeTab === 'managerReports')}
                        onClick={() => setActiveTab('managerReports')}
                      >
                        <i className="fas fa-file-invoice" style={{ width: '16px', textAlign: 'center' }}></i>
                        BDA Daily Reports
                      </button>
                      <button
                        className="sidebar-nav-btn"
                        style={{ ...sidebarBtnStyle(false), background: 'rgba(124,58,237,0.08)', color: '#7c3aed', marginTop: '4px' }}
                        onClick={() => handleTogglePortal('hr')}
                      >
                        <i className="fas fa-users-cog" style={{ width: '16px', textAlign: 'center' }}></i>
                        HR Operations Hub
                      </button>
                    </>
                  )}
                </>
              ) : (
                /* MODE 3: BDA / CALLING TEAM WORKSPACE */
                (currentUser.role === 'admin' || isAnuragOrSuperAdmin(currentUser)) ? (
                  <>
                    {/* Admin Group 1: Command Center */}
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

                    {/* Admin Group 2: Workforce & Logs */}
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

                    {/* Admin Group 3: Portal Preview */}
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
                    {/* BDA Employee & Manager Navigation */}
                    <div style={{ fontWeight: '800', fontSize: '0.72rem', color: '#059669', textTransform: 'uppercase', paddingLeft: '0.6rem', marginBottom: '8px', letterSpacing: '0.08em' }}>
                      💼 BDA Calling Portal
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
                      className={`sidebar-nav-btn ${activeTab === 'callingList' ? 'active' : ''}`}
                      style={{ ...sidebarBtnStyle(activeTab === 'callingList'), position: 'relative' }}
                      onClick={() => setActiveTab('callingList')}
                    >
                      <i className="fas fa-headset" style={{ width: '16px', textAlign: 'center' }}></i>
                      <span style={{ flex: 1 }}>Company Assign Data</span>
                      {assignedLeadsCount > 0 && (
                        <span style={{
                          background: '#0d9488',
                          color: '#ffffff',
                          borderRadius: '9999px',
                          padding: '2px 8px',
                          fontSize: '0.7rem',
                          fontWeight: '800'
                        }}>
                          {assignedLeadsCount}
                        </span>
                      )}
                    </button>

                    <button
                      className={`sidebar-nav-btn ${activeTab === 'leave' || activeTab === 'softwareLeave' ? 'active' : ''}`}
                      style={sidebarBtnStyle(activeTab === 'leave' || activeTab === 'softwareLeave')}
                      onClick={() => setActiveTab('leave')}
                    >
                      <i className="fas fa-calendar-alt" style={{ width: '16px', textAlign: 'center' }}></i>
                      Leave Management
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
                          marginLeft: 'auto'
                        }}>
                          {unreadCount}
                        </span>
                      )}
                    </button>
                  </>
                )
              )}
            </div>

            {/* ── Main Content Pane ────────────────────────────────────── */}
            <div className="content-pane" style={{ flex: 1, minWidth: '320px' }}>

              {/* ────────────────── HR PORTAL VIEWS ────────────────── */}
              {portalMode === 'hr' && (
                <>
                  {/* 1. AdminPanel in HR Mode */}
                  {activeTab === 'adminPanel' && (
                    <AdminPanel
                      currentUser={currentUser}
                      showToast={showToast}
                      activeSection={adminSection}
                      onSectionChange={(newSec) => {
                        setAdminSection(newSec)
                        setActiveTab('adminPanel')
                      }}
                      isHRMode={true}
                    />
                  )}

                  {/* 2. Organization-Wide Leave Approvals Desk */}
                  {(activeTab === 'leave' || activeTab === 'softwareLeave') && (
                    <LeaveManagementView
                      currentUser={currentUser}
                      showToast={showToast}
                    />
                  )}

                  {/* 3. HR Announcements Broadcast */}
                  {(activeTab === 'announcements' || activeTab === 'softwareAnnouncements') && (
                    <AnnouncementsView
                      currentUser={currentUser}
                      showToast={showToast}
                    />
                  )}

                  {/* 4. HR Messaging Center */}
                  {activeTab === 'messaging' && (
                    <AdminMessagingCenter
                      currentUser={currentUser}
                      showToast={showToast}
                    />
                  )}

                  {/* 5. Team Reports Hub */}
                  {activeTab === 'managerReports' && (
                    <ManagerReportsView
                      currentUser={currentUser}
                      showToast={showToast}
                    />
                  )}
                </>
              )}

              {/* ────────────────── SOFTWARE PORTAL VIEWS ────────────────── */}
              {portalMode === 'software' && (
                <>
                  {/* 1. Software Dashboard */}
                  {activeTab === 'softwareDashboard' && (
                    <SoftwareDashboard
                      currentUser={currentUser}
                      onNavigate={setActiveTab}
                      showToast={showToast}
                      onOpenProfile={() => setIsGlobalProfileOpen(true)}
                      onOpenPin={() => setIsGlobalPinOpen(true)}
                    />
                  )}

                  {/* 2. Sprint Tasks Kanban & List */}
                  {activeTab === 'softwareTasks' && (
                    <SoftwareTaskManager
                      currentUser={currentUser}
                      showToast={showToast}
                    />
                  )}

                  {/* 3. Projects Management Hub */}
                  {activeTab === 'softwareProjects' && (
                    <SoftwareProjectManager
                      currentUser={currentUser}
                      showToast={showToast}
                    />
                  )}

                  {/* 4. Daily Work Reports */}
                  {activeTab === 'softwareDailyReports' && (
                    <SoftwareReportsView
                      currentUser={currentUser}
                      showToast={showToast}
                    />
                  )}

                  {/* 5. Code Repository Integration (GitHub) */}
                  {activeTab === 'softwareRepos' && (
                    <CodeRepositoryView
                      currentUser={currentUser}
                      showToast={showToast}
                    />
                  )}

                  {/* 6. Software Developer Performance Dashboard */}
                  {activeTab === 'softwarePerformance' && (
                    <SoftwarePerformanceView
                      currentUser={currentUser}
                      showToast={showToast}
                    />
                  )}

                  {/* 7. Attendance & Punch (Face recognition, GPS, Master terminal preserved) */}
                  {activeTab === 'attendance' && (
                    <EmployeePanel
                      currentUser={currentUser}
                      setCurrentUser={(updatedUser) => {
                        setCurrentUser(updatedUser)
                        localStorage.setItem('aparaitech_current_user', JSON.stringify(updatedUser))
                      }}
                      showToast={showToast}
                      onNavigate={(tab) => setActiveTab(tab)}
                    />
                  )}

                  {/* 8. Leave Management */}
                  {(activeTab === 'softwareLeave' || activeTab === 'leave') && (
                    <LeaveManagementView
                      currentUser={currentUser}
                      showToast={showToast}
                    />
                  )}

                  {/* 10. Announcements */}
                  {activeTab === 'softwareAnnouncements' && (
                    <AnnouncementsView
                      currentUser={currentUser}
                      showToast={showToast}
                    />
                  )}

                  {/* 11. Message Centre */}
                  {activeTab === 'inbox' && (
                    currentUser.role === 'admin' ? (
                      <AdminMessagingCenter
                        currentUser={currentUser}
                        showToast={showToast}
                      />
                    ) : (
                      <EmployeeInbox
                        currentUser={currentUser}
                        showToast={showToast}
                        onUnreadUpdate={setUnreadCount}
                      />
                    )
                  )}

                  {/* 12. Settings */}
                  {activeTab === 'softwareSettings' && (
                    <SettingsView
                      currentUser={currentUser}
                      onLogout={handleLogout}
                      showToast={showToast}
                    />
                  )}

                  {/* 13. BDA Daily Reports (For Leadership: Anurag & Admin) */}
                  {(activeTab === 'managerReports' || activeTab === 'bdaDailyReports') && (
                    <ManagerReportsView
                      currentUser={currentUser}
                      showToast={showToast}
                    />
                  )}
                </>
              )}

              {/* ────────────────── BDA / SALES PORTAL VIEWS ────────────────── */}
              {portalMode === 'bda' && (
                <>
                  {/* 1. Admin Panel: Comprehensive Executive Control Center (Default for Admin) */}
                  {activeTab === 'adminPanel' && (currentUser.role === 'admin' || isAnuragOrSuperAdmin(currentUser)) && (
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
                        if (currentUser.role === 'admin' || isAnuragOrSuperAdmin(currentUser)) {
                          if (targetTab === 'attendance' || targetTab === 'dashboard') {
                            setActiveTab('adminPanel')
                            setAdminSection('overview')
                          } else if (targetTab === 'performance') {
                            setActiveTab('adminPanel')
                            setAdminSection('dailyReports')
                          } else if (targetTab === 'leaderboard') {
                            setActiveTab('performance')
                          } else if (targetTab === 'revenue') {
                            setActiveTab('adminPanel')
                            setAdminSection('revenue')
                          } else if (targetTab === 'messaging') {
                            setActiveTab('messaging')
                          } else if (targetTab === 'inbox') {
                            setActiveTab('messaging')
                          } else if (targetTab === 'callingList') {
                            setActiveTab('adminPanel')
                            setAdminSection('aiDataDistribution')
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
                      onNavigate={(tab) => setActiveTab(tab)}
                    />
                  )}

                  {/* 3.1. Company Assign Data (AI Distributed Calling Desk) */}
                  {activeTab === 'callingList' && (
                    <MyCallingList
                      currentUser={currentUser}
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

                  {/* 5. Revenue Tracker */}
                  {activeTab === 'revenue' && (
                    <RevenueTrackerView
                      currentUser={currentUser}
                      showToast={showToast}
                    />
                  )}

                  {/* 6.1. Leave Management (BDA & All Employees) */}
                  {(activeTab === 'leave' || activeTab === 'softwareLeave') && (
                    <LeaveManagementView
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
                  {activeTab === 'messaging' && (currentUser.role === 'admin' || isAnuragOrSuperAdmin(currentUser)) && (
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
                </>
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
                        {currentUser.name} ({portalMode === 'software' ? 'Software Portal' : (portalMode === 'hr' ? 'HR Portal' : 'BDA Portal')})
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

                  {/* Portal Switcher for Mobile Drawer (Management & Admin) */}
                  {canSwitchPortal && (
                    <div style={{
                      background: '#f1f5f9',
                      border: '1px solid #cbd5e1',
                      borderRadius: '12px',
                      padding: '4px',
                      display: 'flex',
                      gap: '4px',
                      marginBottom: '1rem'
                    }}>
                      <button
                        onClick={() => {
                          handleTogglePortal('software')
                          setMobileDrawerOpen(false)
                        }}
                        style={{
                          flex: 1,
                          padding: '8px 6px',
                          borderRadius: '8px',
                          border: 'none',
                          fontSize: '0.74rem',
                          fontWeight: '700',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '5px',
                          background: portalMode === 'software' ? 'linear-gradient(135deg, #2563eb, #1d4ed8)' : 'transparent',
                          color: portalMode === 'software' ? '#ffffff' : '#64748b'
                        }}
                      >
                        <i className="fas fa-laptop-code"></i> Software
                      </button>
                      <button
                        onClick={() => {
                          handleTogglePortal('bda')
                          setMobileDrawerOpen(false)
                        }}
                        style={{
                          flex: 1,
                          padding: '8px 6px',
                          borderRadius: '8px',
                          border: 'none',
                          fontSize: '0.74rem',
                          fontWeight: '700',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '5px',
                          background: portalMode === 'bda' ? 'linear-gradient(135deg, #059669, #047857)' : 'transparent',
                          color: portalMode === 'bda' ? '#ffffff' : '#64748b'
                        }}
                      >
                        <i className="fas fa-headset"></i> BDA
                      </button>
                      <button
                        onClick={() => {
                          handleTogglePortal('hr')
                          setMobileDrawerOpen(false)
                        }}
                        style={{
                          flex: 1,
                          padding: '8px 6px',
                          borderRadius: '8px',
                          border: 'none',
                          fontSize: '0.74rem',
                          fontWeight: '700',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '5px',
                          background: portalMode === 'hr' ? 'linear-gradient(135deg, #7c3aed, #6d28d9)' : 'transparent',
                          color: portalMode === 'hr' ? '#ffffff' : '#64748b'
                        }}
                      >
                        <i className="fas fa-users-cog"></i> HR
                      </button>
                    </div>
                  )}

                  {/* MOBILE DRAWER: HR MODE */}
                  {portalMode === 'hr' ? (
                    <>
                      <div style={{ fontWeight: '800', fontSize: '0.72rem', color: '#7c3aed', textTransform: 'uppercase', paddingLeft: '0.6rem', marginBottom: '6px', letterSpacing: '0.08em' }}>
                        👑 HR Command Center
                      </div>
                      {HR_NAV.filter(item => item.group === 'HR Command Center').map(item => (
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

                      <div style={{ fontWeight: '800', fontSize: '0.72rem', color: '#64748b', textTransform: 'uppercase', paddingLeft: '0.6rem', margin: '10px 0 6px', letterSpacing: '0.08em' }}>
                        ⏱️ Attendance & Workforce
                      </div>
                      {HR_NAV.filter(item => item.group === 'Attendance & Workforce').map(item => (
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

                      <div style={{ fontWeight: '800', fontSize: '0.72rem', color: '#059669', textTransform: 'uppercase', paddingLeft: '0.6rem', margin: '10px 0 6px', letterSpacing: '0.08em' }}>
                        📢 Communications
                      </div>
                      {HR_NAV.filter(item => item.group === 'HR Communications').map(item => (
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
                  ) : portalMode === 'software' ? (
                    <>
                      <div style={{ fontWeight: '800', fontSize: '0.72rem', color: '#2563eb', textTransform: 'uppercase', paddingLeft: '0.6rem', marginBottom: '6px', letterSpacing: '0.08em' }}>
                        💻 Software Workspace
                      </div>
                      {SOFTWARE_NAV.filter(item => item.group === 'Software Workspace').map(item => (
                        <button
                          key={item.id}
                          className={`sidebar-nav-btn ${activeTab === item.id ? 'active' : ''}`}
                          style={sidebarBtnStyle(activeTab === item.id)}
                          onClick={() => {
                            setActiveTab(item.id)
                            setMobileDrawerOpen(false)
                          }}
                        >
                          <i className={`fas ${item.icon}`} style={{ width: '18px', textAlign: 'center' }}></i>
                          {item.label}
                        </button>
                      ))}

                      <div style={{ fontWeight: '800', fontSize: '0.72rem', color: '#64748b', textTransform: 'uppercase', paddingLeft: '0.6rem', margin: '10px 0 6px', letterSpacing: '0.08em' }}>
                        ⏱️ Attendance & HR Desk
                      </div>
                      {SOFTWARE_NAV.filter(item => item.group === 'Attendance & HR').map(item => (
                        <button
                          key={item.id}
                          className={`sidebar-nav-btn ${activeTab === item.id ? 'active' : ''}`}
                          style={sidebarBtnStyle(activeTab === item.id)}
                          onClick={() => {
                            setActiveTab(item.id)
                            setMobileDrawerOpen(false)
                          }}
                        >
                          <i className={`fas ${item.icon}`} style={{ width: '18px', textAlign: 'center' }}></i>
                          {item.label}
                        </button>
                      ))}

                      <div style={{ fontWeight: '800', fontSize: '0.72rem', color: '#059669', textTransform: 'uppercase', paddingLeft: '0.6rem', margin: '10px 0 6px', letterSpacing: '0.08em' }}>
                        💬 Communication & Setup
                      </div>
                      {SOFTWARE_NAV.filter(item => item.group === 'Communication').map(item => (
                        <button
                          key={item.id}
                          className={`sidebar-nav-btn ${activeTab === item.id ? 'active' : ''}`}
                          style={{ ...sidebarBtnStyle(activeTab === item.id), position: 'relative' }}
                          onClick={() => {
                            setActiveTab(item.id)
                            setMobileDrawerOpen(false)
                          }}
                        >
                          <i className={`fas ${item.icon}`} style={{ width: '18px', textAlign: 'center' }}></i>
                          {item.label}
                          {item.badge && unreadCount > 0 && (
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
                      ))}

                      {/* Leadership & Oversight in Mobile Drawer */}
                      {(currentUser.role === 'admin' || currentUser.email?.toLowerCase() === 'anunand2004@gmail.com' || String(currentUser.empId) === '7017' || String(currentUser.empId) === 'AP7017') && (
                        <>
                          <div style={{ fontWeight: '800', fontSize: '0.72rem', color: '#0d9488', textTransform: 'uppercase', paddingLeft: '0.6rem', margin: '10px 0 6px', letterSpacing: '0.08em' }}>
                            📊 Leadership & Oversight
                          </div>
                          <button
                            className={`sidebar-nav-btn ${activeTab === 'managerReports' ? 'active' : ''}`}
                            style={sidebarBtnStyle(activeTab === 'managerReports')}
                            onClick={() => {
                              setActiveTab('managerReports')
                              setMobileDrawerOpen(false)
                            }}
                          >
                            <i className="fas fa-file-invoice" style={{ width: '18px', textAlign: 'center' }}></i>
                            BDA Daily Reports
                          </button>
                          <button
                            className="sidebar-nav-btn"
                            style={{ ...sidebarBtnStyle(false), background: 'rgba(124,58,237,0.08)', color: '#7c3aed', marginTop: '4px' }}
                            onClick={() => {
                              handleTogglePortal('hr')
                              setMobileDrawerOpen(false)
                            }}
                          >
                            <i className="fas fa-users-cog" style={{ width: '18px', textAlign: 'center' }}></i>
                            HR Operations Hub
                          </button>
                        </>
                      )}
                    </>
                  ) : (
                    /* MOBILE DRAWER: BDA MODE */
                    (currentUser.role === 'admin' || isAnuragOrSuperAdmin(currentUser)) ? (
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
                        <div style={{ fontWeight: '800', fontSize: '0.72rem', color: '#059669', textTransform: 'uppercase', paddingLeft: '0.6rem', marginBottom: '8px', letterSpacing: '0.08em' }}>
                          💼 BDA Calling Portal
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
                          className={`sidebar-nav-btn ${activeTab === 'callingList' ? 'active' : ''}`}
                          style={{ ...sidebarBtnStyle(activeTab === 'callingList'), position: 'relative' }}
                          onClick={() => {
                            setActiveTab('callingList')
                            setMobileDrawerOpen(false)
                          }}
                        >
                          <i className="fas fa-headset" style={{ width: '18px', textAlign: 'center' }}></i>
                          <span style={{ flex: 1 }}>Company Assign Data</span>
                          {assignedLeadsCount > 0 && (
                            <span style={{
                              background: '#0d9488',
                              color: '#ffffff',
                              borderRadius: '9999px',
                              padding: '2px 8px',
                              fontSize: '0.7rem',
                              fontWeight: '800'
                            }}>
                              {assignedLeadsCount}
                            </span>
                          )}
                        </button>

                        <button
                          className={`sidebar-nav-btn ${activeTab === 'leave' || activeTab === 'softwareLeave' ? 'active' : ''}`}
                          style={sidebarBtnStyle(activeTab === 'leave' || activeTab === 'softwareLeave')}
                          onClick={() => {
                            setActiveTab('leave')
                            setMobileDrawerOpen(false)
                          }}
                        >
                          <i className="fas fa-calendar-alt" style={{ width: '18px', textAlign: 'center' }}></i>
                          Leave Management
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
                    )
                  )}

                  <div style={{ marginTop: 'auto', paddingTop: '1.25rem', borderTop: '1px solid #f1f5f9', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <button
                      onClick={() => {
                        setMobileDrawerOpen(false)
                        setIsGlobalProfileOpen(true)
                      }}
                      style={{
                        width: '100%',
                        background: 'rgba(56, 189, 248, 0.12)',
                        color: '#0284c7',
                        border: '1px solid rgba(56, 189, 248, 0.3)',
                        padding: '10px 14px',
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
                      <i className="fas fa-user-circle"></i> My Profile & Credentials
                    </button>

                    <button
                      onClick={() => {
                        setMobileDrawerOpen(false)
                        setIsGlobalPinOpen(true)
                      }}
                      style={{
                        width: '100%',
                        background: 'rgba(37, 99, 235, 0.12)',
                        color: '#2563eb',
                        border: '1px solid rgba(37, 99, 235, 0.3)',
                        padding: '10px 14px',
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
                      <i className="fas fa-th"></i> Edit 4-Digit PIN
                    </button>

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
            {portalMode === 'hr' ? (
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
                  className={`bottom-nav-item ${activeTab === 'adminPanel' && adminSection === 'employees' ? 'active' : ''}`}
                  onClick={() => {
                    setActiveTab('adminPanel')
                    setAdminSection('employees')
                  }}
                >
                  <i className="fas fa-users"></i>
                  <span>Staff</span>
                </button>

                <button
                  className={`bottom-nav-item ${activeTab === 'adminPanel' && adminSection === 'attendance' ? 'active' : ''}`}
                  onClick={() => {
                    setActiveTab('adminPanel')
                    setAdminSection('attendance')
                  }}
                >
                  <i className="fas fa-calendar-check"></i>
                  <span>Punches</span>
                </button>

                <button
                  className={`bottom-nav-item ${activeTab === 'leave' || activeTab === 'softwareLeave' ? 'active' : ''}`}
                  onClick={() => setActiveTab('leave')}
                >
                  <i className="fas fa-calendar-alt"></i>
                  <span>Leaves</span>
                </button>

                <button
                  className="bottom-nav-item"
                  onClick={() => setMobileDrawerOpen(true)}
                >
                  <i className="fas fa-bars"></i>
                  <span>Menu</span>
                </button>
              </>
            ) : portalMode === 'software' ? (
              <>
                <button
                  className={`bottom-nav-item ${activeTab === 'softwareDashboard' ? 'active' : ''}`}
                  onClick={() => setActiveTab('softwareDashboard')}
                >
                  <i className="fas fa-laptop-code"></i>
                  <span>Home</span>
                </button>

                <button
                  className={`bottom-nav-item ${activeTab === 'softwareTasks' ? 'active' : ''}`}
                  onClick={() => setActiveTab('softwareTasks')}
                >
                  <i className="fas fa-tasks"></i>
                  <span>Tasks</span>
                </button>

                <button
                  className={`bottom-nav-item ${activeTab === 'softwareDailyReports' ? 'active' : ''}`}
                  onClick={() => setActiveTab('softwareDailyReports')}
                >
                  <i className="fas fa-clipboard-check"></i>
                  <span>Reports</span>
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
                  <span>Menu</span>
                </button>
              </>
            ) : (
              (currentUser.role === 'admin' || isAnuragOrSuperAdmin(currentUser)) ? (
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
                    className={`bottom-nav-item ${activeTab === 'adminPanel' && adminSection === 'aiDataDistribution' ? 'active' : ''}`}
                    onClick={() => {
                      setActiveTab('adminPanel')
                      setAdminSection('aiDataDistribution')
                    }}
                  >
                    <i className="fas fa-brain"></i>
                    <span>AI Leads</span>
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
                    className={`bottom-nav-item ${activeTab === 'callingList' ? 'active' : ''}`}
                    onClick={() => setActiveTab('callingList')}
                    style={{ position: 'relative' }}
                  >
                    <i className="fas fa-headset"></i>
                    <span>Assign Data</span>
                    {assignedLeadsCount > 0 && (
                      <span style={{
                        position: 'absolute',
                        top: '4px',
                        right: 'calc(50% - 18px)',
                        background: '#0d9488',
                        color: '#ffffff',
                        borderRadius: '9999px',
                        padding: '1px 5px',
                        fontSize: '0.62rem',
                        fontWeight: '800',
                        minWidth: '15px',
                        textAlign: 'center'
                      }}>
                        {assignedLeadsCount}
                      </span>
                    )}
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
              )
            )}
          </nav>
        </div>
      )}

      {/* ── Shift & Daily Report Notification Center Modal ── */}
      <NotificationCenterModal
        isOpen={isNotifModalOpen}
        onClose={() => setIsNotifModalOpen(false)}
        currentUser={currentUser}
        onNavigate={(tab) => {
          setIsNotifModalOpen(false)
          if (tab === 'attendance') setActiveTab('attendance')
          else if (tab === 'tasks') setActiveTab(portalMode === 'software' ? 'softwareTasks' : 'dashboard')
          else setActiveTab(tab)
        }}
        onOpenReportModal={() => {
          setIsNotifModalOpen(false)
          setIsGlobalReportModalOpen(true)
        }}
      />

      {/* ── Global Quick Action Software Daily Report Modal ── */}
      {isGlobalReportModalOpen && (
        <SoftwareDailyReportModal
          isOpen={isGlobalReportModalOpen}
          onClose={() => setIsGlobalReportModalOpen(false)}
          currentUser={currentUser}
          onSuccess={() => {
            setIsGlobalReportModalOpen(false)
            showToast('🚀 Software daily report submitted successfully!', '#10b981')
          }}
        />
      )}

      {/* ── Global Employee Profile Modal ── */}
      <EmployeeProfileModal
        isOpen={isGlobalProfileOpen}
        onClose={() => setIsGlobalProfileOpen(false)}
        employee={currentUser}
        isAdmin={currentUser?.role === 'admin'}
        showToast={showToast}
        onUpdated={(updated) => {
          if (updated) {
            const nextUser = { ...currentUser, ...updated }
            setCurrentUser(nextUser)
            localStorage.setItem('aparaitech_current_user', JSON.stringify(nextUser))
          }
        }}
      />

      {/* ── Global 4-Digit Passcode PIN Modal ── */}
      <ChangePinModal
        isOpen={isGlobalPinOpen}
        onClose={() => setIsGlobalPinOpen(false)}
        email={currentUser?.email}
        showToast={showToast}
        onPinUpdated={(newPin) => {
          const nextUser = { ...currentUser, passcode: newPin }
          setCurrentUser(nextUser)
          localStorage.setItem('aparaitech_current_user', JSON.stringify(nextUser))
        }}
      />

      {/* Toast Alert */}
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

      {/* Heads-up floating notification banner */}
      <NotificationBanner />
    </div>
  )
}

export default App
