import React, { useState, useEffect } from 'react'
import { leadsAPI } from '../services/api'

function MyCallingList({ currentUser, showToast }) {
  const [leads, setLeads] = useState([])
  const [stats, setStats] = useState(null)
  const [filterOptions, setFilterOptions] = useState({ colleges: [], domains: [] })
  const [loading, setLoading] = useState(false)

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

  const fetchLeads = async () => {
    setLoading(true)
    try {
      const params = {}
      if (statusFilter !== 'All') params.status = statusFilter
      if (collegeFilter !== 'All') params.college = collegeFilter
      if (domainFilter !== 'All') params.domain = domainFilter
      if (priorityFilter !== 'All') params.priority = priorityFilter
      if (search) params.search = search

      const res = await leadsAPI.getMyCallingList(params)
      if (res.success) {
        setLeads(res.leads || [])
        setStats(res.stats || null)
        if (res.filters) setFilterOptions(res.filters)

        // Prepopulate activeNotes
        const notesObj = {}
        ;(res.leads || []).forEach(l => {
          notesObj[l._id] = l.callNotes || ''
        })
        setActiveNotes(notesObj)
      }
    } catch (err) {
      console.error('Error fetching calling list:', err)
      const msg = err.response?.data?.message || err.message || 'Failed to load calling list'
      if (showToast) showToast(`❌ ${msg}`, '#dc2626')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchLeads()
  }, [statusFilter, collegeFilter, domainFilter, priorityFilter])

  // Handle Search on Enter or debounce
  const handleSearchSubmit = (e) => {
    e.preventDefault()
    fetchLeads()
  }

  // Update Status
  const handleStatusChange = async (leadId, newStatus) => {
    try {
      const res = await leadsAPI.updateStatus(leadId, { status: newStatus })
      if (res.success) {
        setLeads(prev => prev.map(l => (l._id === leadId ? res.lead : l)))
        if (showToast) showToast(`✅ Status updated to "${newStatus}"`, '#16a34a')
        // Refresh stats
        const resStats = await leadsAPI.getMyCallingList({})
        if (resStats.success) setStats(resStats.stats)
      }
    } catch (err) {
      console.error(err)
      if (showToast) showToast('❌ Failed to update status', '#dc2626')
    }
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
    // If not called yet, prompt to mark as Called
    if (lead.status === 'Not Called') {
      setTimeout(() => {
        handleStatusChange(lead._id, 'Called')
      }, 1000)
    }
  }

  const completionPercent = stats?.totalAssigned > 0
    ? Math.round(((stats.calledCount + stats.interestedCount + stats.notInterestedCount) / stats.totalAssigned) * 100)
    : 0

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
            Company Assign Data ({leads.length} Leads)
          </h1>
          <p style={{ margin: '4px 0 0', fontSize: '0.82rem', color: '#cbd5e1' }}>
            Assigned company leads with direct dialer, outcome tracking, and live conversion analytics.
          </p>
        </div>

        {/* View Switcher & Refresh */}
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
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

          <button
            type="button"
            onClick={fetchLeads}
            style={{
              padding: '8px 14px',
              borderRadius: '10px',
              border: '1px solid rgba(255, 255, 255, 0.25)',
              background: 'rgba(255, 255, 255, 0.12)',
              color: '#ffffff',
              fontWeight: '700',
              fontSize: '0.8rem',
              cursor: 'pointer'
            }}
          >
            <i className={`fas fa-sync-alt ${loading ? 'fa-spin' : ''}`}></i> Refresh
          </button>
        </div>
      </div>

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
          gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
          gap: '14px'
        }}>
          {loading ? (
            <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '3rem', color: '#64748b' }}>
              <i className="fas fa-spinner fa-spin fa-2x"></i>
              <div style={{ marginTop: '10px', fontWeight: '600' }}>Loading company assigned data...</div>
            </div>
          ) : leads.length > 0 ? (
            leads.map(lead => {
              const telLink = lead.cleanMobile ? `tel:+91${lead.cleanMobile}` : null
              const isSaving = savingNoteId === lead._id

              return (
                <div key={lead._id} style={{
                  background: '#ffffff',
                  borderRadius: '16px',
                  border: lead.status === 'Interested'
                    ? '2px solid #86efac'
                    : (lead.status === 'Not Called' ? '1.5px solid #fed7aa' : '1px solid #e2e8f0'),
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

                    {/* College & Domain Badges */}
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
                      <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: '800', color: '#475569', textTransform: 'uppercase', marginBottom: '4px' }}>
                        Call Outcome Status:
                      </label>
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
                        {lead.calledAt && (
                          <span style={{ fontSize: '0.68rem', color: '#94a3b8' }}>
                            Last updated: {new Date(lead.calledAt).toLocaleDateString('en-IN')}
                          </span>
                        )}
                      </div>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <input
                          type="text"
                          placeholder="e.g. 3rd year student, wants MERN webinar, follow up Friday"
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
                  </div>
                </div>
              )
            })
          ) : (
            <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '3.5rem', background: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
              <i className="fas fa-clipboard-check fa-3x" style={{ color: '#cbd5e1', marginBottom: '12px' }}></i>
              <h3 style={{ margin: 0, color: '#1e293b' }}>No Company Assigned Data Found</h3>
              <p style={{ margin: '6px 0 0', color: '#64748b', fontSize: '0.85rem' }}>
                You have no leads assigned under the selected filters. Check with your administrator to assign company data.
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
                  <th>EMAIL</th>
                  <th>COLLEGE</th>
                  <th>DOMAIN</th>
                  <th>PRIORITY</th>
                  <th>STATUS</th>
                  <th>NOTES</th>
                  <th>ACTION</th>
                </tr>
              </thead>
              <tbody>
                {leads.length > 0 ? (
                  leads.map(lead => {
                    const isSaving = savingNoteId === lead._id
                    return (
                      <tr key={lead._id}>
                        <td><strong>{lead.name}</strong></td>
                        <td>
                          <span style={{ fontFamily: 'monospace', fontWeight: '800', color: '#0f172a' }}>
                            {lead.mobile || '—'}
                          </span>
                        </td>
                        <td>{lead.email || '—'}</td>
                        <td>{lead.college}</td>
                        <td>
                          <span style={{ background: '#eff6ff', color: '#1d4ed8', padding: '2px 7px', borderRadius: '4px', fontSize: '0.72rem', fontWeight: '700' }}>
                            {lead.domain}
                          </span>
                        </td>
                        <td>
                          <span style={{
                            background: lead.priority === 'Hot' ? '#fee2e2' : (lead.priority === 'Warm' ? '#fef3c7' : '#f1f5f9'),
                            color: lead.priority === 'Hot' ? '#b91c1c' : (lead.priority === 'Warm' ? '#b45309' : '#475569'),
                            padding: '2px 7px', borderRadius: '4px', fontSize: '0.72rem', fontWeight: '800'
                          }}>
                            {lead.priority}
                          </span>
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
                    <td colSpan="9" style={{ textAlign: 'center', color: '#64748b', padding: '24px' }}>
                      No calling leads match current filters.
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
