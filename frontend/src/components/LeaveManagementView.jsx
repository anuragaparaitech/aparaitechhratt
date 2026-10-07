import React, { useState, useEffect, useMemo } from 'react'
import { leaveAPI } from '../services/api'
import { emitSyncEvent, SYNC_EVENTS, useAutoRefresh } from '../utils/realtimeSync'

// Company Leave Policy Annual Quotas
const LEAVE_CATEGORIES = [
  { type: 'Casual Leave', quota: 12, color: '#2563eb', bg: '#eff6ff', border: '#bfdbfe', icon: 'fa-umbrella-beach', desc: 'Personal errands & urgent leaves' },
  { type: 'Sick Leave', quota: 7, color: '#10b981', bg: '#ecfdf5', border: '#a7f3d0', icon: 'fa-heartbeat', desc: 'Illness recovery & medical checkups' },
  { type: 'Privilege Leave', quota: 15, color: '#8b5cf6', bg: '#f5f3ff', border: '#ddd6fe', icon: 'fa-calendar-check', desc: 'Planned vacations & earned breaks' },
  { type: 'Emergency Leave', quota: 3, color: '#ef4444', bg: '#fef2f2', border: '#fecaca', icon: 'fa-bolt', desc: 'Family emergencies & urgent crises' }
]

function LeaveManagementView({ currentUser, showToast }) {
  const [myLeaves, setMyLeaves] = useState([])
  const [allLeaves, setAllLeaves] = useState([])
  const [loading, setLoading] = useState(true)
  const [isApplyOpen, setIsApplyOpen] = useState(false)
  const [activeTab, setActiveTab] = useState('myLeaves') // 'myLeaves' | 'approvals'

  // Filters
  const [statusFilter, setStatusFilter] = useState('all')
  const [typeFilter, setTypeFilter] = useState('all')
  const [teamFilter, setTeamFilter] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')

  // Apply form
  const [leaveType, setLeaveType] = useState('Casual Leave')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [reason, setReason] = useState('')
  const [applying, setApplying] = useState(false)
  const [cancellingId, setCancellingId] = useState(null)

  const isManagerOrAdmin = (
    currentUser?.role === 'admin' ||
    currentUser?.role === 'manager' ||
    currentUser?.role === 'hr' ||
    currentUser?.email?.toLowerCase() === 'anunand2004@gmail.com' ||
    String(currentUser?.empId) === '7017' ||
    String(currentUser?.empId) === 'AP7017'
  )

  useEffect(() => {
    fetchLeaves(false)
  }, [])

  // Auto-refresh leave statuses every 5 seconds, on tab focus, and on instant LEAVE_UPDATED events
  useAutoRefresh(() => {
    fetchLeaves(true)
  }, {
    intervalMs: 5000,
    eventTypes: [SYNC_EVENTS.LEAVE_UPDATED],
    onFocus: true,
    enabled: true
  })

  const fetchLeaves = async (isSilent = false) => {
    if (!isSilent) setLoading(true)
    try {
      const myRes = await leaveAPI.getMyLeaves()
      if (myRes?.success) setMyLeaves(myRes.data || [])

      if (isManagerOrAdmin) {
        const allRes = await leaveAPI.getAllLeaves()
        if (allRes?.success) setAllLeaves(allRes.data || [])
      }
    } catch (err) {
      console.error('Error fetching leaves:', err)
      if (!isSilent && showToast) showToast('⚠️ Could not load leave records', '#f59e0b')
    } finally {
      if (!isSilent) setLoading(false)
    }
  }

  // Calculated Days difference
  const calculatedDays = useMemo(() => {
    if (!startDate || !endDate) return 1
    const s = new Date(startDate)
    const e = new Date(endDate)
    if (isNaN(s.getTime()) || isNaN(e.getTime()) || e < s) return 1
    return Math.max(1, Math.ceil((e - s) / (1000 * 60 * 60 * 24)) + 1)
  }, [startDate, endDate])

  // Handle Apply for leave
  const handleApply = async (e) => {
    e.preventDefault()
    if (!startDate || !endDate || !reason.trim()) {
      if (showToast) showToast('⚠️ Please specify leave dates and reason', '#f59e0b')
      return
    }

    setApplying(true)
    try {
      const payload = {
        leaveType,
        startDate,
        endDate,
        totalDays: calculatedDays,
        reason: reason.trim(),
        teamName: currentUser?.department || (currentUser?.role === 'developer' || currentUser?.role === 'intern' ? 'Software' : 'BDA')
      }

      const res = await leaveAPI.apply(payload)
      if (res?.success) {
        if (showToast) showToast('🚀 Leave application submitted for manager approval', '#10b981')
        setMyLeaves(prev => [res.data, ...prev])
        if (isManagerOrAdmin) {
          setAllLeaves(prev => [res.data, ...prev])
        }
        setIsApplyOpen(false)
        setStartDate('')
        setEndDate('')
        setReason('')
        emitSyncEvent(SYNC_EVENTS.LEAVE_UPDATED, { leaveId: res.data?._id, action: 'applied', userEmail: currentUser?.email })
      } else {
        if (showToast) showToast(`❌ ${res?.message || 'Failed to submit application'}`, '#ef4444')
      }
    } catch (err) {
      console.error('Leave apply error:', err)
      if (showToast) showToast(`❌ ${err.response?.data?.message || err.message}`, '#ef4444')
    } finally {
      setApplying(false)
    }
  }

  // Handle cancel pending leave
  const handleCancelLeave = async (leaveId) => {
    if (!window.confirm('Are you sure you want to cancel this leave application?')) return
    setCancellingId(leaveId)
    try {
      const res = await leaveAPI.cancel(leaveId)
      if (res?.success) {
        if (showToast) showToast('✓ Leave application cancelled successfully', '#10b981')
        setMyLeaves(prev => prev.filter(l => l._id !== leaveId))
        setAllLeaves(prev => prev.filter(l => l._id !== leaveId))
        emitSyncEvent(SYNC_EVENTS.LEAVE_UPDATED, { leaveId, action: 'cancelled', userEmail: currentUser?.email })
      } else {
        if (showToast) showToast(`❌ ${res?.message || 'Could not cancel leave'}`, '#ef4444')
      }
    } catch (err) {
      console.error('Error cancelling leave:', err)
      if (showToast) showToast('❌ Failed to cancel leave application', '#ef4444')
    } finally {
      setCancellingId(null)
    }
  }

  // Handle Manager/Admin Approve or Reject
  const handleUpdateStatus = async (leaveId, status) => {
    try {
      const res = await leaveAPI.updateStatus(leaveId, {
        status,
        managerComments: `Reviewed by ${currentUser?.name || 'Management'}`
      })
      if (res?.success) {
        if (showToast) showToast(`✓ Leave application marked as ${status}`, '#10b981')
        setAllLeaves(prev => prev.map(l => l._id === leaveId ? res.data : l))
        setMyLeaves(prev => prev.map(l => l._id === leaveId ? res.data : l))
        emitSyncEvent(SYNC_EVENTS.LEAVE_UPDATED, { leaveId, status, userEmail: currentUser?.email })
      }
    } catch (err) {
      console.error('Error updating leave status:', err)
      if (showToast) showToast('❌ Failed to update status', '#ef4444')
    }
  }

  // Filtered lists
  const filteredMyLeaves = useMemo(() => {
    return myLeaves.filter(l => {
      const matchStatus = statusFilter === 'all' || l.status === statusFilter
      const matchType = typeFilter === 'all' || l.leaveType === typeFilter
      return matchStatus && matchType
    })
  }, [myLeaves, statusFilter, typeFilter])

  const filteredAllLeaves = useMemo(() => {
    return allLeaves.filter(l => {
      const matchStatus = statusFilter === 'all' || l.status === statusFilter
      const matchType = typeFilter === 'all' || l.leaveType === typeFilter
      const matchTeam = teamFilter === 'all' || (l.teamName || '').toLowerCase().includes(teamFilter.toLowerCase())
      const matchQuery = !searchQuery.trim() || (
        (l.employeeName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (l.employeeId || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (l.reason || '').toLowerCase().includes(searchQuery.toLowerCase())
      )
      return matchStatus && matchType && matchTeam && matchQuery
    })
  }, [allLeaves, statusFilter, typeFilter, teamFilter, searchQuery])

  // Real-time dynamic stats
  const myApprovedCount = myLeaves.filter(l => l.status === 'Approved').length
  const myPendingCount = myLeaves.filter(l => l.status === 'Pending').length
  const myRejectedCount = myLeaves.filter(l => l.status === 'Rejected').length

  const allApprovedCount = allLeaves.filter(l => l.status === 'Approved').length
  const allPendingCount = allLeaves.filter(l => l.status === 'Pending').length
  const allRejectedCount = allLeaves.filter(l => l.status === 'Rejected').length

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', width: '100%' }}>
      {/* ── Top Hero Banner ── */}
      <div style={{
        background: 'linear-gradient(135deg, #0a192f 0%, #1e3a8a 100%)',
        borderRadius: '20px',
        padding: '1.5rem 1.75rem',
        color: '#ffffff',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '1rem',
        boxShadow: '0 10px 25px -5px rgba(10, 25, 47, 0.3)'
      }}>
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '3px 10px', background: 'rgba(56, 189, 248, 0.15)', borderRadius: '999px', fontSize: '0.72rem', fontWeight: '700', color: '#38bdf8', marginBottom: '6px' }}>
            <i className="fas fa-umbrella-beach"></i> WORKFORCE ATTENDANCE & LEAVES
          </div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: '900', margin: '0 0 4px 0', letterSpacing: '-0.02em' }}>
            Leave Management & Balances
          </h1>
          <p style={{ margin: 0, fontSize: '0.82rem', color: '#93c5fd' }}>
            Submit time-off requests, track real-time quota balances, and review organizational leave approvals.
          </p>
        </div>

        <button
          onClick={() => setIsApplyOpen(true)}
          style={{
            background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
            color: '#ffffff',
            border: 'none',
            borderRadius: '12px',
            padding: '10px 20px',
            fontWeight: '800',
            fontSize: '0.86rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            boxShadow: '0 4px 14px rgba(37, 99, 235, 0.4)'
          }}
        >
          <i className="fas fa-plus-circle"></i>
          Apply for Leave
        </button>
      </div>

      {/* ── 1. Dynamic Leave Quotas Grid (Calculated from Real Database Leaves) ── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '1rem'
      }}>
        {LEAVE_CATEGORIES.map(cat => {
          // Dynamic calculation strictly from user's real approved/pending leaves
          const approvedDays = myLeaves
            .filter(l => l.leaveType === cat.type && l.status === 'Approved')
            .reduce((sum, l) => sum + (Number(l.totalDays) || 1), 0)

          const pendingDays = myLeaves
            .filter(l => l.leaveType === cat.type && l.status === 'Pending')
            .reduce((sum, l) => sum + (Number(l.totalDays) || 1), 0)

          const remainingDays = Math.max(0, cat.quota - approvedDays)
          const usedPercent = Math.min(100, Math.round((approvedDays / cat.quota) * 100))

          return (
            <div
              key={cat.type}
              style={{
                background: '#ffffff',
                borderRadius: '16px',
                padding: '1.25rem',
                border: `1px solid ${cat.border}`,
                boxShadow: '0 2px 6px rgba(0, 0, 0, 0.03)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                gap: '10px'
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span style={{ fontSize: '0.74rem', fontWeight: '800', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    {cat.type}
                  </span>
                  <div style={{ width: '28px', height: '28px', borderRadius: '8px', background: cat.bg, color: cat.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.85rem' }}>
                    <i className={`fas ${cat.icon}`}></i>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
                  <span style={{ fontSize: '1.85rem', fontWeight: '900', color: cat.color, lineHeight: 1 }}>
                    {remainingDays}
                  </span>
                  <span style={{ fontSize: '0.82rem', color: '#94a3b8', fontWeight: '700' }}>
                    / {cat.quota} days left
                  </span>
                </div>

                <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '6px' }}>
                  {cat.desc}
                </div>
              </div>

              <div>
                {/* Visual Progress Bar */}
                <div style={{ width: '100%', height: '6px', background: '#f1f5f9', borderRadius: '999px', overflow: 'hidden', margin: '6px 0' }}>
                  <div style={{ width: `${usedPercent}%`, height: '100%', background: cat.color, borderRadius: '999px', transition: 'width 0.3s' }} />
                </div>

                <div style={{ fontSize: '0.7rem', color: approvedDays > 0 ? cat.color : '#64748b', fontWeight: '600' }}>
                  {approvedDays > 0 ? (
                    `${approvedDays} day(s) utilized${pendingDays > 0 ? ` • ${pendingDays} pending` : ''}`
                  ) : (
                    pendingDays > 0 ? `${pendingDays} day(s) awaiting approval` : 'Full quota available (0 used)'
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* ── 2. Real-Time Overview Metrics Bar ── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
        gap: '0.85rem'
      }}>
        <div style={{ background: '#ffffff', borderRadius: '12px', padding: '12px 16px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#eff6ff', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem' }}>
            <i className="fas fa-file-alt"></i>
          </div>
          <div>
            <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: '700' }}>
              {activeTab === 'myLeaves' ? 'MY APPLICATIONS' : 'TOTAL TEAM LEAVES'}
            </div>
            <div style={{ fontSize: '1.25rem', fontWeight: '900', color: '#0f172a' }}>
              {activeTab === 'myLeaves' ? myLeaves.length : allLeaves.length}
            </div>
          </div>
        </div>

        <div style={{ background: '#ffffff', borderRadius: '12px', padding: '12px 16px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#ecfdf5', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem' }}>
            <i className="fas fa-check-circle"></i>
          </div>
          <div>
            <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: '700' }}>APPROVED LEAVES</div>
            <div style={{ fontSize: '1.25rem', fontWeight: '900', color: '#10b981' }}>
              {activeTab === 'myLeaves' ? myApprovedCount : allApprovedCount}
            </div>
          </div>
        </div>

        <div style={{ background: '#ffffff', borderRadius: '12px', padding: '12px 16px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#fffbeb', color: '#f59e0b', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem' }}>
            <i className="fas fa-clock"></i>
          </div>
          <div>
            <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: '700' }}>PENDING DECISION</div>
            <div style={{ fontSize: '1.25rem', fontWeight: '900', color: '#f59e0b' }}>
              {activeTab === 'myLeaves' ? myPendingCount : allPendingCount}
            </div>
          </div>
        </div>

        <div style={{ background: '#ffffff', borderRadius: '12px', padding: '12px 16px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#fef2f2', color: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem' }}>
            <i className="fas fa-times-circle"></i>
          </div>
          <div>
            <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: '700' }}>REJECTED / CLOSED</div>
            <div style={{ fontSize: '1.25rem', fontWeight: '900', color: '#ef4444' }}>
              {activeTab === 'myLeaves' ? myRejectedCount : allRejectedCount}
            </div>
          </div>
        </div>
      </div>

      {/* ── 3. Tab Switcher & Filter Controls ── */}
      <div style={{
        background: '#ffffff',
        borderRadius: '16px',
        padding: '14px 16px',
        border: '1px solid #e2e8f0',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '12px'
      }}>
        {/* Tab Buttons */}
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={() => setActiveTab('myLeaves')}
            style={{
              padding: '8px 16px',
              borderRadius: '10px',
              border: 'none',
              background: activeTab === 'myLeaves' ? '#0a192f' : '#f1f5f9',
              color: activeTab === 'myLeaves' ? '#ffffff' : '#64748b',
              fontWeight: '800',
              fontSize: '0.82rem',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <i className="fas fa-user"></i>
            My Leave Requests ({myLeaves.length})
          </button>

          {isManagerOrAdmin && (
            <button
              onClick={() => setActiveTab('approvals')}
              style={{
                padding: '8px 16px',
                borderRadius: '10px',
                border: 'none',
                background: activeTab === 'approvals' ? '#0a192f' : '#f1f5f9',
                color: activeTab === 'approvals' ? '#ffffff' : '#64748b',
                fontWeight: '800',
                fontSize: '0.82rem',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <i className="fas fa-tasks"></i>
              Team Approvals Desk
              {allPendingCount > 0 && (
                <span style={{
                  background: '#ef4444',
                  color: '#ffffff',
                  borderRadius: '999px',
                  padding: '2px 7px',
                  fontSize: '0.68rem',
                  fontWeight: 'bold',
                  marginLeft: '4px'
                }}>
                  {allPendingCount}
                </span>
              )}
            </button>
          )}
        </div>

        {/* Dynamic Filters */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{
              padding: '7px 12px',
              borderRadius: '8px',
              border: '1.5px solid #cbd5e1',
              fontSize: '0.78rem',
              fontWeight: '600',
              color: '#334155',
              outline: 'none',
              cursor: 'pointer'
            }}
          >
            <option value="all">All Statuses</option>
            <option value="Pending">Pending Review</option>
            <option value="Approved">Approved</option>
            <option value="Rejected">Rejected</option>
          </select>

          {/* Type Filter */}
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            style={{
              padding: '7px 12px',
              borderRadius: '8px',
              border: '1.5px solid #cbd5e1',
              fontSize: '0.78rem',
              fontWeight: '600',
              color: '#334155',
              outline: 'none',
              cursor: 'pointer'
            }}
          >
            <option value="all">All Categories</option>
            <option value="Casual Leave">Casual Leave</option>
            <option value="Sick Leave">Sick Leave</option>
            <option value="Privilege Leave">Privilege Leave</option>
            <option value="Emergency Leave">Emergency Leave</option>
            <option value="Exam Leave">Exam Leave</option>
          </select>

          {/* Team Filter for Manager */}
          {activeTab === 'approvals' && (
            <select
              value={teamFilter}
              onChange={(e) => setTeamFilter(e.target.value)}
              style={{
                padding: '7px 12px',
                borderRadius: '8px',
                border: '1.5px solid #cbd5e1',
                fontSize: '0.78rem',
                fontWeight: '600',
                color: '#334155',
                outline: 'none',
                cursor: 'pointer'
              }}
            >
              <option value="all">All Departments</option>
              <option value="BDA">BDA Team</option>
              <option value="Software">Software Team</option>
              <option value="Management">Management</option>
            </select>
          )}

          {/* Search query in Approvals */}
          {activeTab === 'approvals' && (
            <input
              type="text"
              placeholder="Search employee / reason..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                padding: '7px 12px',
                borderRadius: '8px',
                border: '1.5px solid #cbd5e1',
                fontSize: '0.78rem',
                outline: 'none',
                width: '180px'
              }}
            />
          )}

          <button
            onClick={fetchLeaves}
            title="Refresh Leave Records"
            style={{
              background: '#f8fafc',
              border: '1px solid #cbd5e1',
              borderRadius: '8px',
              padding: '7px 10px',
              cursor: 'pointer',
              color: '#475569'
            }}
          >
            <i className="fas fa-sync-alt"></i>
          </button>
        </div>
      </div>

      {/* ── 4. Main Records Table ── */}
      <div style={{
        background: '#ffffff',
        borderRadius: '16px',
        border: '1px solid #e2e8f0',
        overflow: 'hidden',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)'
      }}>
        {loading ? (
          <div style={{ padding: '3.5rem 1rem', textAlign: 'center', color: '#64748b' }}>
            <i className="fas fa-circle-notch fa-spin" style={{ fontSize: '2rem', color: '#2563eb', marginBottom: '12px' }}></i>
            <div style={{ fontWeight: '700', fontSize: '0.92rem' }}>Loading dynamic leave records...</div>
          </div>
        ) : activeTab === 'myLeaves' ? (
          /* ── Tab A: My Personal Leaves ── */
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem', textAlign: 'left', minWidth: '680px' }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '1.5px solid #e2e8f0', color: '#475569', fontWeight: '800' }}>
                  <th style={{ padding: '14px 16px' }}>LEAVE TYPE</th>
                  <th style={{ padding: '14px 12px' }}>DURATION</th>
                  <th style={{ padding: '14px 12px' }}>DAYS</th>
                  <th style={{ padding: '14px 12px' }}>REASON & DETAILS</th>
                  <th style={{ padding: '14px 12px' }}>STATUS</th>
                  <th style={{ padding: '14px 12px' }}>REVIEWED BY</th>
                  <th style={{ padding: '14px 16px', textAlign: 'right' }}>ACTION</th>
                </tr>
              </thead>
              <tbody>
                {filteredMyLeaves.map(leave => (
                  <tr key={leave._id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '14px 16px', fontWeight: '800', color: '#0f172a' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{
                          width: '8px',
                          height: '8px',
                          borderRadius: '50%',
                          background: leave.status === 'Approved' ? '#10b981' : (leave.status === 'Rejected' ? '#ef4444' : '#f59e0b')
                        }} />
                        {leave.leaveType}
                      </div>
                    </td>
                    <td style={{ padding: '14px 12px', color: '#334155', fontWeight: '600' }}>
                      {leave.startDate} <span style={{ color: '#94a3b8' }}>to</span> {leave.endDate}
                    </td>
                    <td style={{ padding: '14px 12px', fontWeight: '800', color: '#2563eb' }}>
                      {leave.totalDays} day{Number(leave.totalDays) > 1 ? 's' : ''}
                    </td>
                    <td style={{ padding: '14px 12px', color: '#475569', maxWidth: '240px', lineHeight: 1.4 }}>
                      <div>{leave.reason}</div>
                      {leave.managerComments && (
                        <div style={{ fontSize: '0.72rem', color: '#64748b', fontStyle: 'italic', marginTop: '2px' }}>
                          Manager note: {leave.managerComments}
                        </div>
                      )}
                    </td>
                    <td style={{ padding: '14px 12px' }}>
                      <span style={{
                        background: leave.status === 'Approved' ? '#ecfdf5' : (leave.status === 'Rejected' ? '#fef2f2' : '#fffbeb'),
                        color: leave.status === 'Approved' ? '#059669' : (leave.status === 'Rejected' ? '#ef4444' : '#d97706'),
                        border: `1px solid ${leave.status === 'Approved' ? '#a7f3d0' : (leave.status === 'Rejected' ? '#fecaca' : '#fde68a')}`,
                        padding: '4px 12px',
                        borderRadius: '999px',
                        fontWeight: '800',
                        fontSize: '0.72rem',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '5px'
                      }}>
                        <i className={`fas ${leave.status === 'Approved' ? 'fa-check' : (leave.status === 'Rejected' ? 'fa-times' : 'fa-hourglass-half')}`}></i>
                        {leave.status}
                      </span>
                    </td>
                    <td style={{ padding: '14px 12px', color: '#64748b', fontSize: '0.78rem' }}>
                      {leave.reviewedBy ? (
                        <div>
                          <strong style={{ color: '#0f172a', display: 'block' }}>{leave.reviewedBy}</strong>
                          <span style={{ fontSize: '0.7rem' }}>
                            {leave.reviewedAt ? new Date(leave.reviewedAt).toLocaleDateString() : 'Reviewed'}
                          </span>
                        </div>
                      ) : (
                        <span style={{ color: '#94a3b8' }}>Pending Review</span>
                      )}
                    </td>
                    <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                      {leave.status === 'Pending' ? (
                        <button
                          onClick={() => handleCancelLeave(leave._id)}
                          disabled={cancellingId === leave._id}
                          style={{
                            background: '#fee2e2',
                            color: '#b91c1c',
                            border: '1px solid #fecaca',
                            borderRadius: '8px',
                            padding: '5px 12px',
                            fontSize: '0.72rem',
                            fontWeight: '700',
                            cursor: 'pointer'
                          }}
                        >
                          {cancellingId === leave._id ? 'Cancelling...' : 'Cancel Request'}
                        </button>
                      ) : (
                        <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>Processed</span>
                      )}
                    </td>
                  </tr>
                ))}

                {filteredMyLeaves.length === 0 && (
                  <tr>
                    <td colSpan={7} style={{ padding: '3.5rem 1rem', textAlign: 'center', color: '#94a3b8' }}>
                      <div style={{ fontSize: '2rem', marginBottom: '8px', opacity: 0.5 }}>🏖️</div>
                      <div style={{ fontWeight: '700', color: '#64748b', fontSize: '0.92rem' }}>
                        No personal leave records found
                      </div>
                      <div style={{ fontSize: '0.76rem', color: '#94a3b8', marginTop: '4px' }}>
                        Click "Apply for Leave" above to submit your time-off request.
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        ) : (
          /* ── Tab B: Team Approvals Desk (Manager / Admin View) ── */
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem', textAlign: 'left', minWidth: '820px' }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '1.5px solid #e2e8f0', color: '#475569', fontWeight: '800' }}>
                  <th style={{ padding: '14px 16px' }}>APPLICANT</th>
                  <th style={{ padding: '14px 12px' }}>DEPARTMENT</th>
                  <th style={{ padding: '14px 12px' }}>CATEGORY</th>
                  <th style={{ padding: '14px 12px' }}>DATES & DAYS</th>
                  <th style={{ padding: '14px 12px' }}>REASON</th>
                  <th style={{ padding: '14px 12px' }}>STATUS</th>
                  <th style={{ padding: '14px 16px', textAlign: 'right' }}>LEADERSHIP ACTION</th>
                </tr>
              </thead>
              <tbody>
                {filteredAllLeaves.map(leave => (
                  <tr key={leave._id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '14px 16px' }}>
                      <strong style={{ color: '#0f172a', display: 'block', fontSize: '0.86rem' }}>
                        {leave.employeeName}
                      </strong>
                      <span style={{ fontSize: '0.72rem', color: '#64748b' }}>
                        {leave.employeeId || 'AP-EMP'} • {leave.employeeEmail}
                      </span>
                    </td>
                    <td style={{ padding: '14px 12px' }}>
                      <span style={{
                        background: (leave.teamName || '').toLowerCase().includes('soft') ? '#eff6ff' : '#ecfdf5',
                        color: (leave.teamName || '').toLowerCase().includes('soft') ? '#2563eb' : '#059669',
                        padding: '3px 8px',
                        borderRadius: '6px',
                        fontWeight: '700',
                        fontSize: '0.72rem'
                      }}>
                        {leave.teamName || 'BDA'}
                      </span>
                    </td>
                    <td style={{ padding: '14px 12px', fontWeight: '700', color: '#334155' }}>
                      {leave.leaveType}
                    </td>
                    <td style={{ padding: '14px 12px' }}>
                      <div style={{ fontWeight: '600', color: '#0f172a' }}>
                        {leave.startDate} <span style={{ color: '#94a3b8' }}>to</span> {leave.endDate}
                      </div>
                      <div style={{ fontSize: '0.72rem', color: '#2563eb', fontWeight: '700' }}>
                        {leave.totalDays} day{Number(leave.totalDays) > 1 ? 's' : ''}
                      </div>
                    </td>
                    <td style={{ padding: '14px 12px', color: '#475569', maxWidth: '240px', lineHeight: 1.4 }}>
                      {leave.reason}
                    </td>
                    <td style={{ padding: '14px 12px' }}>
                      <span style={{
                        background: leave.status === 'Approved' ? '#ecfdf5' : (leave.status === 'Rejected' ? '#fef2f2' : '#fffbeb'),
                        color: leave.status === 'Approved' ? '#059669' : (leave.status === 'Rejected' ? '#ef4444' : '#d97706'),
                        border: `1px solid ${leave.status === 'Approved' ? '#a7f3d0' : (leave.status === 'Rejected' ? '#fecaca' : '#fde68a')}`,
                        padding: '3px 10px',
                        borderRadius: '999px',
                        fontWeight: '800',
                        fontSize: '0.72rem'
                      }}>
                        {leave.status}
                      </span>
                    </td>
                    <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                      {leave.status === 'Pending' ? (
                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                          <button
                            onClick={() => handleUpdateStatus(leave._id, 'Approved')}
                            style={{
                              background: '#10b981',
                              color: '#ffffff',
                              border: 'none',
                              borderRadius: '8px',
                              padding: '6px 12px',
                              fontSize: '0.74rem',
                              fontWeight: '700',
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                              boxShadow: '0 2px 6px rgba(16, 185, 129, 0.3)'
                            }}
                          >
                            <i className="fas fa-check"></i> Approve
                          </button>
                          <button
                            onClick={() => handleUpdateStatus(leave._id, 'Rejected')}
                            style={{
                              background: '#ef4444',
                              color: '#ffffff',
                              border: 'none',
                              borderRadius: '8px',
                              padding: '6px 12px',
                              fontSize: '0.74rem',
                              fontWeight: '700',
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                              boxShadow: '0 2px 6px rgba(239, 68, 68, 0.3)'
                            }}
                          >
                            <i className="fas fa-times"></i> Reject
                          </button>
                        </div>
                      ) : (
                        <div style={{ fontSize: '0.74rem', color: '#64748b' }}>
                          Reviewed by <strong>{leave.reviewedBy || 'Manager'}</strong>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}

                {filteredAllLeaves.length === 0 && (
                  <tr>
                    <td colSpan={7} style={{ padding: '3.5rem 1rem', textAlign: 'center', color: '#94a3b8' }}>
                      <div style={{ fontSize: '2rem', marginBottom: '8px', opacity: 0.5 }}>👥</div>
                      <div style={{ fontWeight: '700', color: '#64748b', fontSize: '0.92rem' }}>
                        No organizational leave records matching filters
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── 5. Apply for Leave Modal ── */}
      {isApplyOpen && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(10, 25, 47, 0.75)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1100,
          padding: '1.25rem'
        }}>
          <div style={{
            background: '#ffffff',
            borderRadius: '20px',
            maxWidth: '520px',
            width: '100%',
            padding: '1.75rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '1.25rem',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #f1f5f9', paddingBottom: '12px' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.18rem', fontWeight: '900', color: '#0f172a' }}>
                  Apply for Time Off
                </h3>
                <span style={{ fontSize: '0.74rem', color: '#64748b' }}>
                  Submitting on behalf of: <strong>{currentUser?.name}</strong> ({currentUser?.department || 'Operations'})
                </span>
              </div>
              <button
                onClick={() => setIsApplyOpen(false)}
                style={{ background: '#f1f5f9', border: 'none', borderRadius: '8px', width: '32px', height: '32px', cursor: 'pointer', fontWeight: 'bold' }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleApply} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#334155', marginBottom: '4px' }}>
                  Leave Category
                </label>
                <select
                  value={leaveType}
                  onChange={(e) => setLeaveType(e.target.value)}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '10px', border: '1.5px solid #cbd5e1', fontSize: '0.85rem', outline: 'none' }}
                >
                  <option value="Casual Leave">Casual Leave (12 days annual quota)</option>
                  <option value="Sick Leave">Sick Leave (7 days annual quota)</option>
                  <option value="Privilege Leave">Privilege Leave (15 days annual quota)</option>
                  <option value="Emergency Leave">Emergency Leave (3 days annual quota)</option>
                  <option value="Exam Leave">Exam / Academic Leave</option>
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#334155', marginBottom: '4px' }}>
                    Start Date <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    required
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '10px', border: '1.5px solid #cbd5e1', fontSize: '0.85rem', outline: 'none' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#334155', marginBottom: '4px' }}>
                    End Date <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    required
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '10px', border: '1.5px solid #cbd5e1', fontSize: '0.85rem', outline: 'none' }}
                  />
                </div>
              </div>

              {/* Dynamic Duration Preview */}
              {startDate && endDate && (
                <div style={{
                  padding: '8px 12px',
                  background: '#eff6ff',
                  border: '1px solid #bfdbfe',
                  borderRadius: '10px',
                  fontSize: '0.78rem',
                  color: '#1d4ed8',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}>
                  <i className="fas fa-info-circle"></i>
                  Total Leave Duration: <strong>{calculatedDays} calendar day(s)</strong>
                </div>
              )}

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#334155', marginBottom: '4px' }}>
                  Reason for Leave & Handover Details <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <textarea
                  rows={3}
                  placeholder="Provide brief context for leave and note any client / task handovers..."
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  required
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '10px', border: '1.5px solid #cbd5e1', fontSize: '0.85rem', outline: 'none' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '0.5rem', paddingTop: '10px', borderTop: '1px solid #f1f5f9' }}>
                <button
                  type="button"
                  onClick={() => setIsApplyOpen(false)}
                  style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#ffffff', color: '#64748b', fontWeight: '700', cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={applying}
                  style={{
                    padding: '8px 22px',
                    borderRadius: '8px',
                    border: 'none',
                    background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
                    color: '#ffffff',
                    fontWeight: '800',
                    cursor: 'pointer',
                    boxShadow: '0 2px 8px rgba(37, 99, 235, 0.3)'
                  }}
                >
                  {applying ? 'Submitting...' : 'Submit Application'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default LeaveManagementView
