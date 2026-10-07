import React, { useState, useEffect, useRef } from 'react'
import { leadsAPI, reportsAPI } from '../services/api'
import { emitSyncEvent, SYNC_EVENTS, useAutoRefresh } from '../utils/realtimeSync'
import { playNotificationSound } from '../services/notificationService'

// Format Date & Time cleanly: e.g. "06 Oct 2026, 04:25 PM"
const formatDateTime = (dateVal) => {
  if (!dateVal) return null
  const d = new Date(dateVal)
  if (isNaN(d.getTime())) return null
  return d.toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  })
}

function MyCallingList({ currentUser, showToast }) {
  const [leads, setLeads] = useState([])
  const [stats, setStats] = useState(null)
  const [filterOptions, setFilterOptions] = useState({ colleges: [], domains: [] })
  const [loading, setLoading] = useState(false)
  const [isBackgroundSyncing, setIsBackgroundSyncing] = useState(false)
  const [lastSyncTime, setLastSyncTime] = useState(null)
  const prevLeadsCountRef = useRef(null)

  // Primary Roster Sub-Tab: 'active' (Pending Work) | 'history' (Worked On) | 'all' (Complete Roster)
  const [activeListTab, setActiveListTab] = useState('active')

  // Filters
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')
  const [collegeFilter, setCollegeFilter] = useState('All')
  const [domainFilter, setDomainFilter] = useState('All')
  const [priorityFilter, setPriorityFilter] = useState('All')

  // View mode: 'cards' | 'table'
  const [viewMode, setViewMode] = useState('cards')

  // Inline note editing state { [leadId]: noteText }
  const [activeNotes, setActiveNotes] = useState({})
  const [savingNoteId, setSavingNoteId] = useState(null)

  // Daily Calling Report Submission State
  const [dailyReportModalOpen, setDailyReportModalOpen] = useState(false)
  const [dailyReportConnected, setDailyReportConnected] = useState(0)
  const [dailyReportConversions, setDailyReportConversions] = useState(0)
  const [dailyReportCallsAbove3, setDailyReportCallsAbove3] = useState(0)
  const [dailyReportHours, setDailyReportHours] = useState(8)
  const [dailyReportRemarks, setDailyReportRemarks] = useState('')
  const [submittingReport, setSubmittingReport] = useState(false)
  const [todayReportStatus, setTodayReportStatus] = useState(null)

  const getTodayDateStr = () => {
    const d = new Date()
    const year = d.getFullYear()
    const month = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }

  const checkTodayReportStatus = async () => {
    try {
      const todayStr = getTodayDateStr()
      const res = await reportsAPI.getTodayStatus(todayStr, currentUser?.email)
      if (res?.success) {
        setTodayReportStatus(res)
        if (res.hasSubmitted && res.report) {
          setDailyReportConnected(res.report.connectedCalls || 0)
          setDailyReportConversions(res.report.todayConversions || 0)
          setDailyReportCallsAbove3(res.report.callsAbove3Min || 0)
          setDailyReportHours(res.report.hoursWorked || 8)
          setDailyReportRemarks(res.report.remarks || '')
        }
      }
    } catch (err) {
      console.warn('Error checking today daily report status:', err)
    }
  }

  const handleOpenDailyReportModal = () => {
    if (!todayReportStatus?.hasSubmitted) {
      setDailyReportConnected(stats?.todayCompleted ?? stats?.calledCount ?? 0)
      setDailyReportConversions(stats?.interestedCount ?? 0)
      setDailyReportCallsAbove3(0)
      setDailyReportHours(8)
      setDailyReportRemarks('')
    }
    setDailyReportModalOpen(true)
  }

  const handleSubmitDailyReport = async (e) => {
    e.preventDefault()
    setSubmittingReport(true)
    try {
      const todayStr = getTodayDateStr()
      const payload = {
        reportType: 'bda',
        reportDate: todayStr,
        connectedCalls: Number(dailyReportConnected) || 0,
        todayConversions: Number(dailyReportConversions) || 0,
        callsAbove3Min: Number(dailyReportCallsAbove3) || 0,
        hoursWorked: Number(dailyReportHours) || 8,
        remarks: dailyReportRemarks.trim()
      }
      const res = await reportsAPI.submitDaily(payload)
      if (res?.success || res?.data) {
        if (showToast) {
          showToast('🎉 आजचा दैनिक कॉलिंग रिपोर्ट ॲडमिनकडे यशस्वीरित्या सादर करण्यात आला!', '#16a34a')
        }
        emitSyncEvent(SYNC_EVENTS.DAILY_REPORT_SUBMITTED, {
          userEmail: currentUser?.email,
          reportDate: todayStr
        })
        setDailyReportModalOpen(false)
        await checkTodayReportStatus()
        fetchLeads(true)
      }
    } catch (err) {
      console.error('Error submitting daily report:', err)
      const msg = err.response?.data?.message || err.message || 'Failed to submit report'
      if (showToast) showToast(`❌ ${msg}`, '#dc2626')
    } finally {
      setSubmittingReport(false)
    }
  }

  const fetchLeads = async (isSilent = false) => {
    if (!isSilent) {
      setLoading(true)
    } else {
      setIsBackgroundSyncing(true)
    }
    try {
      const params = { tab: activeListTab }
      if (statusFilter !== 'All') params.status = statusFilter
      if (collegeFilter !== 'All') params.college = collegeFilter
      if (domainFilter !== 'All') params.domain = domainFilter
      if (priorityFilter !== 'All') params.priority = priorityFilter
      if (search) params.search = search

      const res = await leadsAPI.getMyCallingList(params)
      if (res.success) {
        const newLeads = res.leads || []

        // Detect newly assigned leads during live background updates
        if (prevLeadsCountRef.current !== null && newLeads.length > prevLeadsCountRef.current) {
          const diff = newLeads.length - prevLeadsCountRef.current
          playNotificationSound()
          if (showToast) {
            showToast(`🎉 ${diff} new company lead${diff > 1 ? 's' : ''} assigned to your desk!`, '#10b981')
          }
        }
        prevLeadsCountRef.current = newLeads.length

        setLeads(newLeads)
        setStats(res.stats || null)
        if (res.filters) setFilterOptions(res.filters)
        setLastSyncTime(new Date())

        // Prepopulate activeNotes safely without wiping user's unsaved in-progress typing
        setActiveNotes(prev => {
          const notesObj = { ...prev }
          newLeads.forEach(l => {
            if (notesObj[l._id] === undefined) {
              notesObj[l._id] = l.callNotes || ''
            }
          })
          return notesObj
        })
      }
    } catch (err) {
      console.error('Error fetching calling list:', err)
      const msg = err.response?.data?.message || err.message || 'Failed to load calling list'
      if (!isSilent && showToast) showToast(`❌ ${msg}`, '#dc2626')
    } finally {
      if (!isSilent) setLoading(false)
      setIsBackgroundSyncing(false)
    }
  }

  // Initial fetch & check today report status
  useEffect(() => {
    fetchLeads(false)
    checkTodayReportStatus()
  }, [activeListTab, statusFilter, collegeFilter, domainFilter, priorityFilter])

  // Real-time synchronization: Auto-refresh every 5 seconds, on focus/visibility, & on instant sync events
  useAutoRefresh(() => {
    fetchLeads(true)
    checkTodayReportStatus()
  }, {
    intervalMs: 5000,
    eventTypes: [SYNC_EVENTS.DATA_ASSIGNED, SYNC_EVENTS.DAILY_REPORT_SUBMITTED],
    onFocus: true,
    enabled: true
  })

  // Handle Search on Enter or submit
  const handleSearchSubmit = (e) => {
    e.preventDefault()
    fetchLeads(false)
  }

  // Update Status & Handle Moving to History vs Restoring to Active
  const handleStatusChange = async (leadId, newStatus) => {
    const currentLead = leads.find(l => l._id === leadId)
    const noteText = activeNotes[leadId] || currentLead?.callNotes || ''
    try {
      const res = await leadsAPI.updateStatus(leadId, { status: newStatus, callNotes: noteText })
      if (res.success) {
        if (activeListTab === 'active') {
          if (newStatus !== 'Not Called') {
            // Card disappears from active pending list and moves into History!
            setLeads(prev => prev.filter(l => l._id !== leadId))
            if (showToast) {
              showToast(`✅ "${currentLead?.name || 'Lead'}" वर काम पूर्ण झाले ("${newStatus}") आणि History मध्ये सुरक्षित हलवले गेले! 📜`, '#16a34a')
            }
          } else {
            setLeads(prev => prev.map(l => (l._id === leadId ? res.lead : l)))
          }
        } else if (activeListTab === 'history') {
          if (newStatus === 'Not Called') {
            // Restored back to Active Pending list!
            setLeads(prev => prev.filter(l => l._id !== leadId))
            if (showToast) {
              showToast(`🔄 "${currentLead?.name || 'Lead'}" चालू लिस्ट (Active Pending) मध्ये परत हलवले!`, '#0284c7')
            }
          } else {
            setLeads(prev => prev.map(l => (l._id === leadId ? res.lead : l)))
            if (showToast) showToast(`✅ Status updated to "${newStatus}"`, '#16a34a')
          }
        } else {
          // 'all' view
          setLeads(prev => prev.map(l => (l._id === leadId ? res.lead : l)))
          if (showToast) showToast(`✅ Status updated to "${newStatus}"`, '#16a34a')
        }

        // Refresh stats summary
        const resStats = await leadsAPI.getMyCallingSummary().catch(() => null)
        if (resStats?.success) setStats(resStats.stats)

        // Broadcast event so admin reports update in real-time
        emitSyncEvent(SYNC_EVENTS.LEAD_STATUS_UPDATED, { leadId, newStatus, userEmail: currentUser?.email })
      }
    } catch (err) {
      console.error(err)
      if (showToast) showToast('❌ Failed to update status', '#dc2626')
    }
  }

  // Quick action: Complete work and move directly to History
  const handleQuickComplete = (leadId, outcome = 'Called') => {
    return handleStatusChange(leadId, outcome)
  }

  // Save Inline Notes
  const handleSaveNote = async (leadId) => {
    const noteText = activeNotes[leadId] || ''
    setSavingNoteId(leadId)
    try {
      const res = await leadsAPI.updateStatus(leadId, { callNotes: noteText })
      if (res.success) {
        setLeads(prev => prev.map(l => (l._id === leadId ? res.lead : l)))
        if (showToast) showToast('💾 Remarks saved successfully!', '#16a34a')
        emitSyncEvent(SYNC_EVENTS.LEAD_STATUS_UPDATED, { leadId, userEmail: currentUser?.email })
      }
    } catch (err) {
      console.error(err)
      if (showToast) showToast('❌ Failed to save remarks', '#dc2626')
    } finally {
      setSavingNoteId(null)
    }
  }

  // Handle Click to Call
  const handleCallClick = async (lead) => {
    if (lead.status === 'Not Called') {
      if (showToast) {
        showToast(`📞 Calling ${lead.name}... moving to History as "Called"`, '#2563eb')
      }
      setTimeout(() => {
        handleStatusChange(lead._id, 'Called')
      }, 900)
    }
  }

  const pendingDisplayCount = stats?.pendingCount ?? leads.filter(l => l.status === 'Not Called').length
  const historyDisplayCount = stats?.historyCount ?? stats?.totalContacted ?? leads.filter(l => l.status !== 'Not Called').length
  const totalDisplayCount = stats?.totalAssigned ?? leads.length

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', width: '100%' }}>
      {/* ── Employee Header Banner ─────────────────────────────────── */}
      <div style={{
        background: 'linear-gradient(135deg, #0f172a 0%, #1e3a8a 50%, #2563eb 100%)',
        borderRadius: '20px',
        padding: '1.4rem 1.75rem',
        color: '#ffffff',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '1rem',
        boxShadow: '0 12px 28px -6px rgba(15, 23, 42, 0.4)',
        border: '1px solid rgba(255, 255, 255, 0.12)'
      }}>
        <div>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            background: 'rgba(56, 189, 248, 0.2)',
            border: '1px solid rgba(56, 189, 248, 0.4)',
            borderRadius: '999px',
            padding: '3px 12px',
            fontSize: '0.72rem',
            fontWeight: '800',
            letterSpacing: '0.06em',
            marginBottom: '6px',
            color: '#7dd3fc'
          }}>
            <i className="fas fa-headset"></i> COMPANY ASSIGN DATA
          </div>
          <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: '900', letterSpacing: '-0.02em' }}>
            Company Assign Data Desk
          </h1>
          <p style={{ margin: '4px 0 0', fontSize: '0.82rem', color: '#cbd5e1' }}>
            AI-Distributed calling roster with real-time assignment timestamps, work tracking, and automated history.
          </p>
        </div>

        {/* View Switcher & Live Sync Indicator */}
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ background: 'rgba(255, 255, 255, 0.15)', borderRadius: '10px', padding: '3px', display: 'flex', gap: '2px' }}>
            <button
              type="button"
              onClick={() => setViewMode('cards')}
              style={{
                padding: '6px 12px',
                borderRadius: '8px',
                border: 'none',
                background: viewMode === 'cards' ? '#ffffff' : 'transparent',
                color: viewMode === 'cards' ? '#1e3a8a' : '#ffffff',
                fontWeight: '700',
                fontSize: '0.75rem',
                cursor: 'pointer'
              }}
            >
              <i className="fas fa-th-large"></i> Cards
            </button>
            <button
              type="button"
              onClick={() => setViewMode('table')}
              style={{
                padding: '6px 12px',
                borderRadius: '8px',
                border: 'none',
                background: viewMode === 'table' ? '#ffffff' : 'transparent',
                color: viewMode === 'table' ? '#1e3a8a' : '#ffffff',
                fontWeight: '700',
                fontSize: '0.75rem',
                cursor: 'pointer'
              }}
            >
              <i className="fas fa-list"></i> Table
            </button>
          </div>

          {/* Real-time live sync indicator */}
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '7px',
            background: 'rgba(255, 255, 255, 0.12)',
            padding: '6px 12px',
            borderRadius: '10px',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            fontSize: '0.74rem',
            color: '#f8fafc',
            fontWeight: '600'
          }}>
            <span style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: isBackgroundSyncing ? '#38bdf8' : '#22c55e',
              boxShadow: isBackgroundSyncing ? '0 0 10px #38bdf8' : '0 0 8px #22c55e',
              display: 'inline-block',
              transition: 'all 0.3s'
            }} />
            <span>{isBackgroundSyncing ? 'Syncing...' : 'Live Auto-Sync'}</span>
            {lastSyncTime && (
              <span style={{ opacity: 0.75, fontSize: '0.7rem' }}>
                • {lastSyncTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
              </span>
            )}
          </div>

          <button
            type="button"
            onClick={() => fetchLeads(false)}
            title="Force refresh assigned leads"
            style={{
              padding: '8px 14px',
              borderRadius: '10px',
              border: '1px solid rgba(255, 255, 255, 0.25)',
              background: 'rgba(255, 255, 255, 0.15)',
              color: '#ffffff',
              fontWeight: '700',
              fontSize: '0.8rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'all 0.2s'
            }}
          >
            <i className={`fas fa-sync-alt ${loading || isBackgroundSyncing ? 'fa-spin' : ''}`}></i> Refresh
          </button>
        </div>
      </div>

      {/* ── Today's Calling Target & Shift Report Banner ─────────────── */}
      <div style={{
        background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
        borderRadius: '16px',
        padding: '16px 20px',
        border: '1px solid #334155',
        color: '#f8fafc',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        boxShadow: '0 4px 16px rgba(0,0,0,0.1)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{
                background: '#f59e0b',
                color: '#000000',
                fontWeight: '900',
                fontSize: '0.72rem',
                padding: '2px 8px',
                borderRadius: '6px',
                letterSpacing: '0.04em'
              }}>
                SHIFT TARGET
              </span>
              <span style={{ fontSize: '1.05rem', fontWeight: '800' }}>
                🎯 आजचे कॉलिंग टार्गेट व दैनिक शिफ्ट प्रोग्रेस
              </span>
            </div>
            <div style={{ fontSize: '0.78rem', color: '#94a3b8', marginTop: '3px' }}>
              दिलेले दैनंदिन कॉलिंग टार्गेट वेळेत पूर्ण करून दिवसाच्या अखेरीस ॲडमिनकडे दैनिक रिपोर्ट सादर करा.
            </div>
          </div>

          {/* Action Button: Submit Daily Calling Report */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {todayReportStatus?.hasSubmitted ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                <span style={{
                  background: '#065f46',
                  color: '#6ee7b7',
                  border: '1px solid #10b981',
                  borderRadius: '10px',
                  padding: '6px 12px',
                  fontSize: '0.78rem',
                  fontWeight: '800',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px'
                }}>
                  <i className="fas fa-check-double"></i> आजचा रिपोर्ट सादर केला आहे (Submitted)
                </span>
                <button
                  type="button"
                  onClick={handleOpenDailyReportModal}
                  style={{
                    background: 'rgba(255,255,255,0.15)',
                    border: '1px solid rgba(255,255,255,0.25)',
                    color: '#ffffff',
                    padding: '7px 14px',
                    borderRadius: '10px',
                    fontSize: '0.78rem',
                    fontWeight: '700',
                    cursor: 'pointer'
                  }}
                >
                  <i className="fas fa-edit"></i> रिपोर्ट अपडेट करा
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={handleOpenDailyReportModal}
                style={{
                  background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '12px',
                  padding: '10px 18px',
                  fontSize: '0.84rem',
                  fontWeight: '800',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  boxShadow: '0 4px 14px rgba(16, 185, 129, 0.35)'
                }}
              >
                <i className="fas fa-file-invoice"></i>
                <span>📋 दैनिक कॉलिंग रिपोर्ट सादर करा (Submit Report)</span>
              </button>
            )}
          </div>
        </div>

        {/* Target Progress Bar & Counter Pills */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
          gap: '10px',
          paddingTop: '6px',
          borderTop: '1px solid rgba(255,255,255,0.08)'
        }}>
          <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: '10px', padding: '8px 12px' }}>
            <div style={{ fontSize: '0.68rem', color: '#94a3b8', fontWeight: '700' }}>🎯 आजचे टार्गेट</div>
            <div style={{ fontSize: '1.25rem', fontWeight: '900', color: '#f8fafc' }}>
              {stats?.todayTarget ?? stats?.totalAssigned ?? 0}
            </div>
          </div>
          <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: '10px', padding: '8px 12px' }}>
            <div style={{ fontSize: '0.68rem', color: '#86efac', fontWeight: '700' }}>✅ पूर्ण झालेले (In History)</div>
            <div style={{ fontSize: '1.25rem', fontWeight: '900', color: '#4ade80' }}>
              {stats?.todayCompleted ?? stats?.calledCount ?? 0}
            </div>
          </div>
          <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: '10px', padding: '8px 12px' }}>
            <div style={{ fontSize: '0.68rem', color: '#fdba74', fontWeight: '700' }}>⏳ बाकी कॉल्स (Pending Cards)</div>
            <div style={{ fontSize: '1.25rem', fontWeight: '900', color: '#fb923c' }}>
              {stats?.todayPending ?? stats?.pendingCount ?? 0}
            </div>
          </div>
          <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: '10px', padding: '8px 12px' }}>
            <div style={{ fontSize: '0.68rem', color: '#7dd3fc', fontWeight: '700' }}>📈 शिफ्ट प्रोग्रेस</div>
            <div style={{ fontSize: '1.25rem', fontWeight: '900', color: '#38bdf8' }}>
              {stats?.todayRate ?? 0}%
            </div>
            <div style={{ width: '100%', background: 'rgba(255,255,255,0.1)', height: '4px', borderRadius: '2px', marginTop: '4px', overflow: 'hidden' }}>
              <div style={{ width: `${stats?.todayRate ?? 0}%`, background: '#38bdf8', height: '100%' }} />
            </div>
          </div>
        </div>
      </div>

      {/* ── Daily Calling Report Submission Modal ───────────────────── */}
      {dailyReportModalOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(15, 23, 42, 0.75)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: '16px'
        }}>
          <div style={{
            background: '#ffffff',
            borderRadius: '20px',
            width: '100%',
            maxWidth: '560px',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            border: '1px solid #e2e8f0',
            overflow: 'hidden'
          }}>
            {/* Modal Header */}
            <div style={{
              background: 'linear-gradient(135deg, #0f172a 0%, #1e3a8a 100%)',
              padding: '18px 22px',
              color: '#ffffff',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: '800' }}>
                  📋 दैनिक कॉलिंग रिपोर्ट (Daily Calling Report)
                </h3>
                <p style={{ margin: '4px 0 0', fontSize: '0.78rem', color: '#cbd5e1' }}>
                  दिनांक: {formatDateTime(new Date()) || 'Today'} • {currentUser?.name} ({currentUser?.department || 'BDA'})
                </p>
              </div>
              <button
                type="button"
                onClick={() => setDailyReportModalOpen(false)}
                style={{
                  background: 'rgba(255,255,255,0.15)',
                  border: 'none',
                  borderRadius: '50%',
                  width: '32px',
                  height: '32px',
                  color: '#ffffff',
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

            {/* Modal Body */}
            <form onSubmit={handleSubmitDailyReport} style={{ padding: '22px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* Notice */}
              <div style={{
                background: '#eff6ff',
                border: '1px solid #bfdbfe',
                borderRadius: '10px',
                padding: '10px 14px',
                fontSize: '0.8rem',
                color: '#1e40af',
                lineHeight: 1.4
              }}>
                <i className="fas fa-info-circle" style={{ marginRight: '6px' }}></i>
                हा रिपोर्ट थेट <strong>Admin AIDataDistributionCenter</strong> आणि लीडरशिप डॅशबोर्डवर त्वरित नोंदवला जाईल.
              </div>

              {/* Numerical Inputs Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#334155', marginBottom: '4px' }}>
                    📞 एकूण कनेक्टेड कॉल्स (Connected Calls) *
                  </label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={dailyReportConnected}
                    onChange={e => setDailyReportConnected(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '9px 12px',
                      borderRadius: '8px',
                      border: '1.5px solid #cbd5e1',
                      fontSize: '0.9rem',
                      fontWeight: '700',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#334155', marginBottom: '4px' }}>
                    🌟 इच्छुक / कन्वर्शन्स (Interested Conversions)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={dailyReportConversions}
                    onChange={e => setDailyReportConversions(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '9px 12px',
                      borderRadius: '8px',
                      border: '1.5px solid #cbd5e1',
                      fontSize: '0.9rem',
                      fontWeight: '700',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#334155', marginBottom: '4px' }}>
                    ⏱️ 3 मिनिटांपेक्षा जास्त कॉल्स (&gt;3 Min Calls)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={dailyReportCallsAbove3}
                    onChange={e => setDailyReportCallsAbove3(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '9px 12px',
                      borderRadius: '8px',
                      border: '1.5px solid #cbd5e1',
                      fontSize: '0.9rem',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#334155', marginBottom: '4px' }}>
                    🕒 कामाचे तास (Hours Worked)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="16"
                    value={dailyReportHours}
                    onChange={e => setDailyReportHours(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '9px 12px',
                      borderRadius: '8px',
                      border: '1.5px solid #cbd5e1',
                      fontSize: '0.9rem',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
              </div>

              {/* Remarks Textarea */}
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#334155', marginBottom: '4px' }}>
                  📝 आजचे कॉलिंग सारांश व रिमार्क (Work Remarks & Follow-ups) *
                </label>
                <textarea
                  rows="3"
                  required
                  placeholder="उदा. आज 30 विद्यार्थ्यांना कॉल केले. 4 विद्यार्थी Web Dev साठी इच्छुक असून उद्या Demo साठी येणार आहेत. 3 विद्यार्थ्यांनी फी सवलतीबाबत विचारणा केली..."
                  value={dailyReportRemarks}
                  onChange={e => setDailyReportRemarks(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: '8px',
                    border: '1.5px solid #cbd5e1',
                    fontSize: '0.85rem',
                    fontFamily: 'inherit',
                    resize: 'vertical',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              {/* Modal Buttons */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '6px' }}>
                <button
                  type="button"
                  onClick={() => setDailyReportModalOpen(false)}
                  style={{
                    padding: '10px 18px',
                    borderRadius: '10px',
                    border: '1px solid #cbd5e1',
                    background: '#ffffff',
                    color: '#475569',
                    fontWeight: '700',
                    fontSize: '0.84rem',
                    cursor: 'pointer'
                  }}
                >
                  रद्द करा (Cancel)
                </button>
                <button
                  type="submit"
                  disabled={submittingReport}
                  style={{
                    padding: '10px 22px',
                    borderRadius: '10px',
                    border: 'none',
                    background: 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)',
                    color: '#ffffff',
                    fontWeight: '800',
                    fontSize: '0.84rem',
                    cursor: submittingReport ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    boxShadow: '0 4px 12px rgba(22, 163, 74, 0.3)'
                  }}
                >
                  {submittingReport ? (
                    <>
                      <i className="fas fa-spinner fa-spin"></i>
                      <span>सादर करत आहे...</span>
                    </>
                  ) : (
                    <>
                      <i className="fas fa-paper-plane"></i>
                      <span>🚀 ॲडमिनला रिपोर्ट पाठवा (Submit Report)</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── My Progress KPI Cards ───────────────────────────────────── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
        gap: '12px'
      }}>
        {/* Total Assigned */}
        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '14px', padding: '14px', boxShadow: '0 2px 6px rgba(0,0,0,0.02)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.72rem', fontWeight: '800', color: '#64748b' }}>TOTAL ASSIGNED</span>
            <i className="fas fa-users" style={{ color: '#94a3b8' }}></i>
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: '900', color: '#0f172a', marginTop: '4px' }}>
            {stats?.totalAssigned || 0}
          </div>
          <div style={{ fontSize: '0.7rem', color: '#64748b', marginTop: '2px' }}>
            Overall target roster
          </div>
        </div>

        {/* Pending Calls */}
        <div style={{ background: '#ffffff', border: '1.5px solid #fed7aa', borderRadius: '14px', padding: '14px', boxShadow: '0 2px 6px rgba(0,0,0,0.02)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.72rem', fontWeight: '800', color: '#ea580c' }}>PENDING CALLS</span>
            <i className="fas fa-clock" style={{ color: '#ea580c' }}></i>
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: '900', color: '#ea580c', marginTop: '4px' }}>
            {stats?.pendingCount || 0}
          </div>
          <div style={{ fontSize: '0.7rem', color: '#ea580c', fontWeight: '600', marginTop: '2px' }}>
            Needs outreach
          </div>
        </div>

        {/* Called Count */}
        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '14px', padding: '14px', boxShadow: '0 2px 6px rgba(0,0,0,0.02)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.72rem', fontWeight: '800', color: '#2563eb' }}>TOTAL CALLED</span>
            <i className="fas fa-phone-alt" style={{ color: '#2563eb' }}></i>
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: '900', color: '#2563eb', marginTop: '4px' }}>
            {stats?.calledCount || 0}
          </div>
          <div style={{ fontSize: '0.7rem', color: '#64748b', marginTop: '2px' }}>
            Dialed & contacted
          </div>
        </div>

        {/* Interested Leads */}
        <div style={{ background: '#ffffff', border: '1.5px solid #bbf7d0', borderRadius: '14px', padding: '14px', boxShadow: '0 2px 6px rgba(0,0,0,0.02)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.72rem', fontWeight: '800', color: '#16a34a' }}>INTERESTED</span>
            <i className="fas fa-check-circle" style={{ color: '#16a34a' }}></i>
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: '900', color: '#16a34a', marginTop: '4px' }}>
            {stats?.interestedCount || 0}
          </div>
          <div style={{ fontSize: '0.7rem', color: '#16a34a', fontWeight: '600', marginTop: '2px' }}>
            High-intent conversions
          </div>
        </div>

        {/* Conversion Rate */}
        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '14px', padding: '14px', boxShadow: '0 2px 6px rgba(0,0,0,0.02)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.72rem', fontWeight: '800', color: '#0d9488' }}>CONVERSION %</span>
            <i className="fas fa-chart-line" style={{ color: '#0d9488' }}></i>
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: '900', color: '#0d9488', marginTop: '4px' }}>
            {stats?.conversionRate || 0}%
          </div>
          <div style={{ width: '100%', background: '#e2e8f0', height: '5px', borderRadius: '3px', marginTop: '6px', overflow: 'hidden' }}>
            <div style={{ width: `${stats?.conversionRate || 0}%`, background: '#0d9488', height: '100%' }} />
          </div>
        </div>
      </div>

      {/* ── Sub-Tab Navigation: Active (Pending) | History (Completed) | All ── */}
      <div style={{
        display: 'flex',
        gap: '8px',
        alignItems: 'center',
        background: '#ffffff',
        padding: '8px',
        borderRadius: '16px',
        border: '1px solid #e2e8f0',
        boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
        flexWrap: 'wrap'
      }}>
        {/* Tab 1: Active Pending Data */}
        <button
          type="button"
          onClick={() => setActiveListTab('active')}
          style={{
            flex: 1,
            minWidth: '200px',
            padding: '11px 16px',
            borderRadius: '12px',
            border: activeListTab === 'active' ? '2px solid #2563eb' : '1px solid transparent',
            background: activeListTab === 'active' ? '#eff6ff' : 'transparent',
            color: activeListTab === 'active' ? '#1d4ed8' : '#475569',
            fontWeight: '800',
            fontSize: '0.86rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            transition: 'all 0.15s'
          }}
        >
          <i className="fas fa-phone-volume" style={{ color: activeListTab === 'active' ? '#2563eb' : '#64748b' }}></i>
          <span>⚡ चालू डेटा (Active Pending)</span>
          <span style={{
            background: activeListTab === 'active' ? '#2563eb' : '#cbd5e1',
            color: '#ffffff',
            borderRadius: '999px',
            padding: '2px 9px',
            fontSize: '0.74rem',
            fontWeight: '800'
          }}>
            {pendingDisplayCount}
          </span>
        </button>

        {/* Tab 2: Calling History (Completed Work) */}
        <button
          type="button"
          onClick={() => setActiveListTab('history')}
          style={{
            flex: 1,
            minWidth: '200px',
            padding: '11px 16px',
            borderRadius: '12px',
            border: activeListTab === 'history' ? '2px solid #16a34a' : '1px solid transparent',
            background: activeListTab === 'history' ? '#f0fdf4' : 'transparent',
            color: activeListTab === 'history' ? '#15803d' : '#475569',
            fontWeight: '800',
            fontSize: '0.86rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            transition: 'all 0.15s'
          }}
        >
          <i className="fas fa-history" style={{ color: activeListTab === 'history' ? '#16a34a' : '#64748b' }}></i>
          <span>📜 इतिहास (Calling History)</span>
          <span style={{
            background: activeListTab === 'history' ? '#16a34a' : '#cbd5e1',
            color: '#ffffff',
            borderRadius: '999px',
            padding: '2px 9px',
            fontSize: '0.74rem',
            fontWeight: '800'
          }}>
            {historyDisplayCount}
          </span>
        </button>

        {/* Tab 3: All Assigned Data */}
        <button
          type="button"
          onClick={() => setActiveListTab('all')}
          style={{
            flex: 1,
            minWidth: '160px',
            padding: '11px 16px',
            borderRadius: '12px',
            border: activeListTab === 'all' ? '2px solid #0f172a' : '1px solid transparent',
            background: activeListTab === 'all' ? '#f1f5f9' : 'transparent',
            color: activeListTab === 'all' ? '#0f172a' : '#475569',
            fontWeight: '800',
            fontSize: '0.86rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            transition: 'all 0.15s'
          }}
        >
          <i className="fas fa-layer-group" style={{ color: activeListTab === 'all' ? '#0f172a' : '#64748b' }}></i>
          <span>📑 सर्व डेटा (All Leads)</span>
          <span style={{
            background: activeListTab === 'all' ? '#0f172a' : '#cbd5e1',
            color: '#ffffff',
            borderRadius: '999px',
            padding: '2px 9px',
            fontSize: '0.74rem',
            fontWeight: '800'
          }}>
            {totalDisplayCount}
          </span>
        </button>
      </div>

      {/* ── Interactive Filters Bar ─────────────────────────────────── */}
      <div className="section-card" style={{ padding: '1rem' }}>
        <form onSubmit={handleSearchSubmit} style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '10px',
          alignItems: 'center'
        }}>
          {/* Search box */}
          <div style={{ position: 'relative' }}>
            <input
              type="text"
              placeholder="🔍 Search name / phone / college"
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{
                width: '100%',
                padding: '9px 12px',
                borderRadius: '10px',
                border: '1.5px solid #cbd5e1',
                fontSize: '0.85rem',
                boxSizing: 'border-box'
              }}
            />
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              style={{
                width: '100%',
                padding: '9px 12px',
                borderRadius: '10px',
                border: '1.5px solid #cbd5e1',
                fontSize: '0.85rem',
                background: '#ffffff',
                boxSizing: 'border-box'
              }}
            >
              <option value="All">All Statuses</option>
              <option value="Not Called">⚪ Pending (Not Called)</option>
              <option value="Called">🔵 Called</option>
              <option value="Interested">🟢 Interested</option>
              <option value="Not Interested">🔴 Not Interested</option>
            </select>
          </div>

          {/* Priority Filter */}
          <div>
            <select
              value={priorityFilter}
              onChange={e => setPriorityFilter(e.target.value)}
              style={{
                width: '100%',
                padding: '9px 12px',
                borderRadius: '10px',
                border: '1.5px solid #cbd5e1',
                fontSize: '0.85rem',
                background: '#ffffff',
                boxSizing: 'border-box'
              }}
            >
              <option value="All">All Priorities</option>
              <option value="Hot">🔥 Hot Leads</option>
              <option value="Warm">⚡ Warm Leads</option>
              <option value="Cold">❄️ Cold Leads</option>
            </select>
          </div>

          {/* College Filter */}
          <div>
            <select
              value={collegeFilter}
              onChange={e => setCollegeFilter(e.target.value)}
              style={{
                width: '100%',
                padding: '9px 12px',
                borderRadius: '10px',
                border: '1.5px solid #cbd5e1',
                fontSize: '0.85rem',
                background: '#ffffff',
                boxSizing: 'border-box'
              }}
            >
              <option value="All">All Colleges ({filterOptions.colleges.length})</option>
              {filterOptions.colleges.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {/* Domain Filter */}
          <div>
            <select
              value={domainFilter}
              onChange={e => setDomainFilter(e.target.value)}
              style={{
                width: '100%',
                padding: '9px 12px',
                borderRadius: '10px',
                border: '1.5px solid #cbd5e1',
                fontSize: '0.85rem',
                background: '#ffffff',
                boxSizing: 'border-box'
              }}
            >
              <option value="All">All Domains</option>
              {filterOptions.domains.map(d => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>

          {/* Search Button */}
          <div style={{ display: 'flex', gap: '6px' }}>
            <button
              type="submit"
              style={{
                flex: 1,
                padding: '9px 14px',
                borderRadius: '10px',
                border: 'none',
                background: '#2563eb',
                color: '#ffffff',
                fontWeight: '700',
                fontSize: '0.85rem',
                cursor: 'pointer'
              }}
            >
              Filter
            </button>
            {(search || statusFilter !== 'All' || collegeFilter !== 'All' || domainFilter !== 'All' || priorityFilter !== 'All') && (
              <button
                type="button"
                onClick={() => {
                  setSearch('')
                  setStatusFilter('All')
                  setCollegeFilter('All')
                  setDomainFilter('All')
                  setPriorityFilter('All')
                }}
                style={{
                  padding: '9px 12px',
                  borderRadius: '10px',
                  border: '1px solid #cbd5e1',
                  background: '#f8fafc',
                  color: '#475569',
                  fontWeight: '700',
                  fontSize: '0.8rem',
                  cursor: 'pointer'
                }}
                title="Reset Filters"
              >
                Reset
              </button>
            )}
          </div>
        </form>
      </div>

      {/* ── CARD VIEW ──────────────────────────────────────────────── */}
      {viewMode === 'cards' && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(330px, 1fr))',
          gap: '14px'
        }}>
          {loading ? (
            <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '3.5rem', color: '#64748b' }}>
              <i className="fas fa-spinner fa-spin fa-2x"></i>
              <div style={{ marginTop: '10px', fontWeight: '700' }}>Loading company assigned data...</div>
            </div>
          ) : leads.length > 0 ? (
            leads.map(lead => {
              const telLink = lead.cleanMobile ? `tel:+91${lead.cleanMobile}` : null
              const isSaving = savingNoteId === lead._id
              const assignedFormatted = formatDateTime(lead.assignedAt || lead.createdAt)
              const workedFormatted = formatDateTime(lead.calledAt || lead.updatedAt)

              return (
                <div key={lead._id} style={{
                  background: '#ffffff',
                  borderRadius: '16px',
                  border: lead.status === 'Interested'
                    ? '2px solid #86efac'
                    : (lead.status === 'Not Called' ? '1.5px solid #fed7aa' : (lead.status === 'Called' ? '1.5px solid #bfdbfe' : '1.5px solid #fecaca')),
                  boxShadow: '0 4px 14px rgba(0, 0, 0, 0.04)',
                  padding: '16px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  gap: '12px',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  position: 'relative',
                  overflow: 'hidden'
                }}>
                  {/* Priority Indicator Ribbon */}
                  <div style={{
                    position: 'absolute',
                    top: 0,
                    right: 0,
                    padding: '3px 12px',
                    borderBottomLeftRadius: '10px',
                    fontSize: '0.7rem',
                    fontWeight: '800',
                    background: lead.priority === 'Hot' ? '#fee2e2' : (lead.priority === 'Warm' ? '#fef3c7' : '#f1f5f9'),
                    color: lead.priority === 'Hot' ? '#b91c1c' : (lead.priority === 'Warm' ? '#b45309' : '#475569')
                  }}>
                    {lead.priority === 'Hot' ? '🔥 Hot Lead' : (lead.priority === 'Warm' ? '⚡ Warm' : '❄️ Cold')}
                  </div>

                  <div>
                    {/* Candidate Name */}
                    <div style={{ fontSize: '1.05rem', fontWeight: '800', color: '#0f172a', marginBottom: '4px', paddingRight: '80px' }}>
                      {lead.name}
                    </div>

                    {/* College & Domain Badges + Batch ID */}
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '10px' }}>
                      <span style={{
                        background: '#f8fafc',
                        border: '1px solid #e2e8f0',
                        color: '#334155',
                        fontSize: '0.72rem',
                        fontWeight: '700',
                        padding: '2px 8px',
                        borderRadius: '6px'
                      }}>
                        <i className="fas fa-university" style={{ color: '#0284c7', marginRight: '4px' }}></i>
                        {lead.college}
                      </span>
                      <span style={{
                        background: '#eff6ff',
                        border: '1px solid #bfdbfe',
                        color: '#1d4ed8',
                        fontSize: '0.72rem',
                        fontWeight: '700',
                        padding: '2px 8px',
                        borderRadius: '6px'
                      }}>
                        <i className="fas fa-laptop-code" style={{ marginRight: '4px' }}></i>
                        {lead.domain}
                      </span>
                      {lead.batchId && (
                        <span style={{
                          background: '#f0f9ff',
                          border: '1px solid #bae6fd',
                          color: '#0369a1',
                          fontSize: '0.72rem',
                          fontWeight: '800',
                          padding: '2px 8px',
                          borderRadius: '6px'
                        }}>
                          <i className="fas fa-layer-group" style={{ marginRight: '4px' }}></i>
                          {lead.batchId}
                        </span>
                      )}
                    </div>

                    {/* ── Assignment Info & Work Status Timing Box ── */}
                    <div style={{
                      background: '#f8fafc',
                      border: '1px solid #e2e8f0',
                      borderRadius: '12px',
                      padding: '10px 12px',
                      marginBottom: '10px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '7px'
                    }}>
                      {/* Assigned Date & Time */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.76rem' }}>
                        <span style={{ color: '#64748b', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <i className="fas fa-calendar-alt" style={{ color: '#0284c7' }}></i>
                          <span>डेटा असाइन वेळ व तारीख (Assigned At):</span>
                        </span>
                        <span style={{ fontWeight: '800', color: '#0f172a' }}>
                          {assignedFormatted || 'Recent'}
                        </span>
                      </div>

                      {/* Work Done Status (काम झाले का नाही) with Date & Time */}
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        fontSize: '0.76rem',
                        paddingTop: '6px',
                        borderTop: '1px dashed #e2e8f0'
                      }}>
                        <span style={{ color: '#64748b', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <i className="fas fa-tasks" style={{ color: lead.status === 'Not Called' ? '#ea580c' : '#16a34a' }}></i>
                          <span>कामाची स्थिती (Work Status):</span>
                        </span>

                        {lead.status === 'Not Called' ? (
                          <span style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            padding: '3px 8px',
                            borderRadius: '6px',
                            background: '#fff7ed',
                            border: '1px solid #ffedd5',
                            color: '#c2410c',
                            fontWeight: '800',
                            fontSize: '0.72rem'
                          }}>
                            <i className="fas fa-clock"></i> ⏳ काम बाकी आहे (Pending)
                          </span>
                        ) : (
                          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '1px' }}>
                            <span style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                              padding: '2px 8px',
                              borderRadius: '6px',
                              background: lead.status === 'Interested' ? '#f0fdf4' : (lead.status === 'Called' ? '#eff6ff' : '#fef2f2'),
                              border: lead.status === 'Interested' ? '1px solid #86efac' : (lead.status === 'Called' ? '1px solid #bfdbfe' : '1px solid #fecaca'),
                              color: lead.status === 'Interested' ? '#15803d' : (lead.status === 'Called' ? '#1d4ed8' : '#b91c1c'),
                              fontWeight: '800',
                              fontSize: '0.72rem'
                            }}>
                              <i className="fas fa-check-circle"></i> ✅ काम झाले ({lead.status})
                            </span>
                            <span style={{ fontSize: '0.69rem', color: '#166534', fontWeight: '700' }}>
                              🕒 {workedFormatted || 'Done'}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Contact Channels */}
                    <div style={{
                      background: '#f8fafc',
                      borderRadius: '12px',
                      padding: '10px',
                      marginBottom: '10px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '6px'
                    }}>
                      {/* Mobile */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <i className="fas fa-phone" style={{ color: '#16a34a', fontSize: '0.85rem' }}></i>
                          <span style={{ fontWeight: '800', fontSize: '0.95rem', color: '#0f172a', fontFamily: 'monospace' }}>
                            {lead.mobile || 'No Mobile Available'}
                          </span>
                        </div>
                        {telLink && (
                          <a
                            href={telLink}
                            onClick={() => handleCallClick(lead)}
                            style={{
                              textDecoration: 'none',
                              background: '#16a34a',
                              color: '#ffffff',
                              padding: '5px 12px',
                              borderRadius: '8px',
                              fontSize: '0.75rem',
                              fontWeight: '800',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '5px',
                              boxShadow: '0 2px 6px rgba(22, 163, 74, 0.3)'
                            }}
                          >
                            <i className="fas fa-phone-alt"></i> Call
                          </a>
                        )}
                      </div>

                      {/* Email */}
                      {lead.email && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem', color: '#2563eb' }}>
                          <i className="fas fa-envelope"></i>
                          <a href={`mailto:${lead.email}`} style={{ color: '#2563eb', textDecoration: 'none' }}>
                            {lead.email}
                          </a>
                        </div>
                      )}
                    </div>

                    {/* Call Status Selector */}
                    <div style={{ marginBottom: '10px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                        <label style={{ fontSize: '0.72rem', fontWeight: '800', color: '#475569', textTransform: 'uppercase' }}>
                          Call Outcome Status:
                        </label>
                        {activeListTab === 'active' && (
                          <span style={{ fontSize: '0.67rem', color: '#0284c7', fontWeight: '700' }}>
                            (Selecting shifts card to History)
                          </span>
                        )}
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '6px' }}>
                        {[
                          { val: 'Not Called', label: '⚪ Not Called', bg: '#f1f5f9', color: '#475569', border: '#cbd5e1' },
                          { val: 'Called', label: '🔵 Called', bg: '#eff6ff', color: '#1d4ed8', border: '#bfdbfe' },
                          { val: 'Interested', label: '🟢 Interested', bg: '#f0fdf4', color: '#15803d', border: '#86efac' },
                          { val: 'Not Interested', label: '🔴 Not Interested', bg: '#fef2f2', color: '#b91c1c', border: '#fecaca' }
                        ].map(st => {
                          const isActive = lead.status === st.val
                          return (
                            <button
                              key={st.val}
                              type="button"
                              onClick={() => handleStatusChange(lead._id, st.val)}
                              style={{
                                padding: '6px 8px',
                                borderRadius: '8px',
                                border: isActive ? `2px solid ${st.color}` : `1px solid ${st.border}`,
                                background: isActive ? st.bg : '#ffffff',
                                color: st.color,
                                fontWeight: isActive ? '800' : '600',
                                fontSize: '0.75rem',
                                cursor: 'pointer',
                                transition: 'all 0.15s'
                              }}
                            >
                              {st.label}
                            </button>
                          )
                        })}
                      </div>
                    </div>

                    {/* Inline Call Remarks */}
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                        <label style={{ fontSize: '0.72rem', fontWeight: '800', color: '#475569', textTransform: 'uppercase' }}>
                          Remarks & Follow-up Notes:
                        </label>
                        {workedFormatted && (
                          <span style={{ fontSize: '0.68rem', color: '#94a3b8' }}>
                            Updated: {workedFormatted}
                          </span>
                        )}
                      </div>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <input
                          type="text"
                          placeholder="e.g. Wants demo Friday 4pm, interested in MERN"
                          value={activeNotes[lead._id] || ''}
                          onChange={e => {
                            const val = e.target.value
                            setActiveNotes(prev => ({ ...prev, [lead._id]: val }))
                          }}
                          onKeyDown={e => {
                            if (e.key === 'Enter') {
                              e.preventDefault()
                              handleSaveNote(lead._id)
                            }
                          }}
                          style={{
                            flex: 1,
                            padding: '7px 10px',
                            borderRadius: '8px',
                            border: '1px solid #cbd5e1',
                            fontSize: '0.8rem',
                            outline: 'none'
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => handleSaveNote(lead._id)}
                          disabled={isSaving}
                          style={{
                            padding: '7px 12px',
                            borderRadius: '8px',
                            border: 'none',
                            background: '#2563eb',
                            color: '#ffffff',
                            fontWeight: '700',
                            fontSize: '0.75rem',
                            cursor: isSaving ? 'not-allowed' : 'pointer'
                          }}
                        >
                          {isSaving ? <i className="fas fa-spinner fa-spin"></i> : 'Save'}
                        </button>
                      </div>
                    </div>

                    {/* Quick Complete / History Action Box */}
                    {activeListTab === 'active' ? (
                      <div style={{
                        marginTop: '10px',
                        padding: '10px 12px',
                        background: '#eff6ff',
                        borderRadius: '12px',
                        border: '1.5px dashed #93c5fd',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '8px'
                      }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontSize: '0.74rem', fontWeight: '800', color: '#1e40af', display: 'flex', alignItems: 'center', gap: '5px' }}>
                            <i className="fas fa-check-circle" style={{ color: '#2563eb' }}></i>
                            <span>काम पूर्ण करा • थेट History मध्ये पाठवा:</span>
                          </span>
                          <span style={{ fontSize: '0.67rem', color: '#2563eb', fontWeight: '700' }}>
                            (कार्ड गायब होईल)
                          </span>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px' }}>
                          <button
                            type="button"
                            onClick={() => handleQuickComplete(lead._id, 'Called')}
                            style={{
                              padding: '7px 4px',
                              borderRadius: '8px',
                              border: '1px solid #bfdbfe',
                              background: '#ffffff',
                              color: '#1d4ed8',
                              fontSize: '0.74rem',
                              fontWeight: '800',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: '4px',
                              boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
                            }}
                          >
                            <i className="fas fa-phone-alt"></i> कॉल झाला
                          </button>
                          <button
                            type="button"
                            onClick={() => handleQuickComplete(lead._id, 'Interested')}
                            style={{
                              padding: '7px 4px',
                              borderRadius: '8px',
                              border: '1px solid #86efac',
                              background: '#ffffff',
                              color: '#15803d',
                              fontSize: '0.74rem',
                              fontWeight: '800',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: '4px',
                              boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
                            }}
                          >
                            <i className="fas fa-check-circle"></i> इच्छुक
                          </button>
                          <button
                            type="button"
                            onClick={() => handleQuickComplete(lead._id, 'Not Interested')}
                            style={{
                              padding: '7px 4px',
                              borderRadius: '8px',
                              border: '1px solid #fecaca',
                              background: '#ffffff',
                              color: '#b91c1c',
                              fontSize: '0.74rem',
                              fontWeight: '800',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: '4px',
                              boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
                            }}
                          >
                            <i className="fas fa-times-circle"></i> नाही
                          </button>
                        </div>
                      </div>
                    ) : activeListTab === 'history' ? (
                      <div style={{
                        marginTop: '10px',
                        padding: '8px 12px',
                        background: '#f0fdf4',
                        borderRadius: '10px',
                        border: '1px solid #bbf7d0',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                      }}>
                        <span style={{ fontSize: '0.72rem', fontWeight: '800', color: '#15803d', display: 'flex', alignItems: 'center', gap: '5px' }}>
                          <i className="fas fa-archive"></i>
                          <span>History मध्ये सुरक्षित (काम पूर्ण)</span>
                        </span>
                        <button
                          type="button"
                          onClick={() => handleStatusChange(lead._id, 'Not Called')}
                          style={{
                            padding: '4px 10px',
                            borderRadius: '6px',
                            border: '1px solid #cbd5e1',
                            background: '#ffffff',
                            color: '#475569',
                            fontSize: '0.7rem',
                            fontWeight: '700',
                            cursor: 'pointer'
                          }}
                          title="Restore back to Active Pending list"
                        >
                          <i className="fas fa-undo"></i> चालू लिस्टमध्ये परत आणा
                        </button>
                      </div>
                    ) : null}
                  </div>
                </div>
              )
            })
          ) : activeListTab === 'active' ? (
            /* Empty State for Active (All worked leads moved to History) */
            <div style={{
              gridColumn: '1 / -1',
              textAlign: 'center',
              padding: '3.5rem 1.5rem',
              background: '#ffffff',
              borderRadius: '20px',
              border: '2px dashed #86efac',
              boxShadow: '0 4px 12px rgba(22, 163, 74, 0.05)'
            }}>
              <i className="fas fa-check-circle fa-3x" style={{ color: '#16a34a', marginBottom: '14px' }}></i>
              <h3 style={{ margin: 0, color: '#15803d', fontSize: '1.25rem', fontWeight: '900' }}>
                🎉 सर्व चालू काम पूर्ण झाले! (All Pending Calls Completed!)
              </h3>
              <p style={{ margin: '8px auto 16px', color: '#475569', fontSize: '0.86rem', maxWidth: '460px', lineHeight: 1.5 }}>
                ज्या डेटा वर काम झाले आहे ते सर्व कार्ड्स इतिहास (Calling History) मध्ये सुरक्षित हलवले गेले आहेत.
              </p>
              <button
                type="button"
                onClick={() => setActiveListTab('history')}
                style={{
                  padding: '10px 22px',
                  borderRadius: '12px',
                  border: 'none',
                  background: 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)',
                  color: '#ffffff',
                  fontWeight: '800',
                  fontSize: '0.86rem',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  boxShadow: '0 4px 14px rgba(22, 163, 74, 0.3)'
                }}
              >
                <i className="fas fa-history"></i> Calling History पहा ({historyDisplayCount} Calls Done)
              </button>
            </div>
          ) : activeListTab === 'history' ? (
            /* Empty State for History */
            <div style={{
              gridColumn: '1 / -1',
              textAlign: 'center',
              padding: '3.5rem 1.5rem',
              background: '#ffffff',
              borderRadius: '20px',
              border: '2px dashed #cbd5e1'
            }}>
              <i className="fas fa-history fa-3x" style={{ color: '#94a3b8', marginBottom: '14px' }}></i>
              <h3 style={{ margin: 0, color: '#1e293b', fontSize: '1.2rem', fontWeight: '800' }}>
                📜 अद्याप कोणताही इतिहास नाही (No Call History Yet)
              </h3>
              <p style={{ margin: '8px auto 16px', color: '#64748b', fontSize: '0.86rem', maxWidth: '460px', lineHeight: 1.5 }}>
                चालू डेटा टॅबमधील लीड्सवर कॉल करून किंवा स्टेटस निवडल्यास ते येथे इतिहासामध्ये दिसतील.
              </p>
              <button
                type="button"
                onClick={() => setActiveListTab('active')}
                style={{
                  padding: '10px 22px',
                  borderRadius: '12px',
                  border: 'none',
                  background: '#2563eb',
                  color: '#ffffff',
                  fontWeight: '800',
                  fontSize: '0.86rem',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  boxShadow: '0 4px 14px rgba(37, 99, 235, 0.3)'
                }}
              >
                <i className="fas fa-phone-volume"></i> चालू डेटा वर जा ({pendingDisplayCount} Pending Calls)
              </button>
            </div>
          ) : (
            /* General Empty State */
            <div style={{
              gridColumn: '1 / -1',
              textAlign: 'center',
              padding: '3.5rem',
              background: '#ffffff',
              borderRadius: '16px',
              border: '1px solid #e2e8f0'
            }}>
              <i className="fas fa-clipboard-check fa-3x" style={{ color: '#cbd5e1', marginBottom: '12px' }}></i>
              <h3 style={{ margin: 0, color: '#1e293b' }}>No Company Assigned Data Found</h3>
              <p style={{ margin: '6px 0 0', color: '#64748b', fontSize: '0.85rem' }}>
                You have no leads assigned under the selected filters.
              </p>
            </div>
          )}
        </div>
      )}

      {/* ── TABLE VIEW ──────────────────────────────────────────────── */}
      {viewMode === 'table' && (
        <div className="section-card">
          <div style={{ overflowX: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>CANDIDATE</th>
                  <th>MOBILE</th>
                  <th>COLLEGE & DOMAIN</th>
                  <th>BATCH ID</th>
                  <th>📅 ASSIGNED AT</th>
                  <th>WORK STATUS</th>
                  <th>📅 WORKED AT</th>
                  <th>OUTCOME</th>
                  <th>NOTES</th>
                  <th>ACTION</th>
                </tr>
              </thead>
              <tbody>
                {leads.length > 0 ? (
                  leads.map(lead => {
                    const isSaving = savingNoteId === lead._id
                    const assignedFormatted = formatDateTime(lead.assignedAt || lead.createdAt)
                    const workedFormatted = formatDateTime(lead.calledAt || lead.updatedAt)

                    return (
                      <tr key={lead._id}>
                        <td>
                          <strong>{lead.name}</strong>
                          <div>
                            <span style={{
                              background: lead.priority === 'Hot' ? '#fee2e2' : (lead.priority === 'Warm' ? '#fef3c7' : '#f1f5f9'),
                              color: lead.priority === 'Hot' ? '#b91c1c' : (lead.priority === 'Warm' ? '#b45309' : '#475569'),
                              padding: '1px 5px', borderRadius: '4px', fontSize: '0.68rem', fontWeight: '800'
                            }}>
                              {lead.priority}
                            </span>
                          </div>
                        </td>
                        <td>
                          <span style={{ fontFamily: 'monospace', fontWeight: '800', color: '#0f172a' }}>
                            {lead.mobile || '—'}
                          </span>
                          {lead.email && <div style={{ fontSize: '0.72rem', color: '#2563eb' }}>{lead.email}</div>}
                        </td>
                        <td>
                          <div style={{ fontSize: '0.8rem', fontWeight: '600' }}>{lead.college}</div>
                          <span style={{ background: '#eff6ff', color: '#1d4ed8', padding: '2px 7px', borderRadius: '4px', fontSize: '0.7rem', fontWeight: '700' }}>
                            {lead.domain}
                          </span>
                        </td>
                        <td>
                          {lead.batchId ? (
                            <span style={{
                              background: '#f0f9ff',
                              color: '#0369a1',
                              border: '1px solid #bae6fd',
                              padding: '2px 6px',
                              borderRadius: '4px',
                              fontSize: '0.68rem',
                              fontWeight: '800'
                            }}>
                              {lead.batchId}
                            </span>
                          ) : (
                            <span style={{ color: '#94a3b8', fontSize: '0.72rem' }}>—</span>
                          )}
                        </td>
                        <td style={{ fontSize: '0.75rem', color: '#0f172a', fontWeight: '700', whiteSpace: 'nowrap' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                            <i className="fas fa-calendar-alt" style={{ color: '#0284c7' }}></i>
                            <span>{assignedFormatted || '—'}</span>
                          </div>
                        </td>
                        <td>
                          {lead.status === 'Not Called' ? (
                            <span style={{
                              padding: '3px 8px',
                              borderRadius: '6px',
                              fontSize: '0.72rem',
                              fontWeight: '800',
                              background: '#fff7ed',
                              color: '#c2410c',
                              border: '1px solid #ffedd5',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                              whiteSpace: 'nowrap'
                            }}>
                              <i className="fas fa-clock"></i> ⏳ Pending (काम बाकी)
                            </span>
                          ) : (
                            <span style={{
                              padding: '3px 8px',
                              borderRadius: '6px',
                              fontSize: '0.72rem',
                              fontWeight: '800',
                              background: lead.status === 'Interested' ? '#f0fdf4' : (lead.status === 'Called' ? '#eff6ff' : '#fef2f2'),
                              color: lead.status === 'Interested' ? '#15803d' : (lead.status === 'Called' ? '#1d4ed8' : '#b91c1c'),
                              border: lead.status === 'Interested' ? '1px solid #86efac' : (lead.status === 'Called' ? '1px solid #bfdbfe' : '1px solid #fecaca'),
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                              whiteSpace: 'nowrap'
                            }}>
                              <i className="fas fa-check-circle"></i> ✅ Done ({lead.status})
                            </span>
                          )}
                        </td>
                        <td style={{ fontSize: '0.75rem', color: '#334155', fontWeight: '600', whiteSpace: 'nowrap' }}>
                          {lead.calledAt ? (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#166534' }}>
                              <i className="fas fa-history"></i>
                              <span>{workedFormatted}</span>
                            </div>
                          ) : (
                            <span style={{ color: '#94a3b8' }}>— Not Done Yet</span>
                          )}
                        </td>
                        <td>
                          <select
                            value={lead.status}
                            onChange={e => handleStatusChange(lead._id, e.target.value)}
                            style={{
                              padding: '5px 8px',
                              borderRadius: '6px',
                              fontSize: '0.75rem',
                              fontWeight: '700',
                              border: '1px solid #cbd5e1',
                              background: lead.status === 'Interested' ? '#f0fdf4' : (lead.status === 'Called' ? '#eff6ff' : (lead.status === 'Not Interested' ? '#fef2f2' : '#ffffff')),
                              color: lead.status === 'Interested' ? '#15803d' : (lead.status === 'Called' ? '#1d4ed8' : (lead.status === 'Not Interested' ? '#b91c1c' : '#475569'))
                            }}
                          >
                            <option value="Not Called">⚪ Not Called</option>
                            <option value="Called">🔵 Called</option>
                            <option value="Interested">🟢 Interested</option>
                            <option value="Not Interested">🔴 Not Interested</option>
                          </select>
                        </td>
                        <td style={{ minWidth: '180px' }}>
                          <div style={{ display: 'flex', gap: '4px' }}>
                            <input
                              type="text"
                              value={activeNotes[lead._id] || ''}
                              onChange={e => setActiveNotes({ ...activeNotes, [lead._id]: e.target.value })}
                              style={{ width: '100%', padding: '4px 6px', fontSize: '0.75rem', borderRadius: '4px', border: '1px solid #cbd5e1' }}
                            />
                            <button
                              type="button"
                              onClick={() => handleSaveNote(lead._id)}
                              disabled={isSaving}
                              style={{ padding: '4px 8px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: '4px', fontSize: '0.7rem', cursor: 'pointer' }}
                            >
                              Save
                            </button>
                          </div>
                        </td>
                        <td>
                          {lead.cleanMobile && (
                            <a
                              href={`tel:+91${lead.cleanMobile}`}
                              onClick={() => handleCallClick(lead)}
                              style={{
                                textDecoration: 'none',
                                background: '#16a34a',
                                color: '#ffffff',
                                padding: '5px 10px',
                                borderRadius: '6px',
                                fontSize: '0.72rem',
                                fontWeight: '700',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px'
                              }}
                            >
                              <i className="fas fa-phone-alt"></i> Call
                            </a>
                          )}
                        </td>
                      </tr>
                    )
                  })
                ) : (
                  <tr>
                    <td colSpan="10" style={{ textAlign: 'center', color: '#64748b', padding: '24px' }}>
                      {activeListTab === 'active'
                        ? '🎉 No pending leads! All worked leads have moved to Calling History.'
                        : (activeListTab === 'history'
                            ? '📜 No call history yet.'
                            : 'No calling leads match current filters.')}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}

export default MyCallingList
