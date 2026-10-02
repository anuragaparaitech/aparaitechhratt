import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { API_URL, messageAPI } from '../services/api'

function EmployeeInbox({ currentUser, showToast, onUnreadUpdate }) {
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(false)
  const [selectedMessage, setSelectedMessage] = useState(null)
  const [tab, setTab] = useState('inbox') // 'inbox' | 'archived'
  const [search, setSearch] = useState('')
  const [priorityFilter, setPriorityFilter] = useState('all') // 'all' | 'urgent' | 'important' | 'normal'

  useEffect(() => {
    fetchMessages()
  }, [])

  const fetchMessages = async () => {
    setLoading(true)
    try {
      const res = await messageAPI.getEmployeeMessages()
      if (res.success) {
        setMessages(res.data || [])
        if (onUnreadUpdate) {
          onUnreadUpdate(res.unreadCount || 0)
        }
      }
    } catch (err) {
      console.error(err)
      showToast('❌ Failed to fetch inbox messages', '#dc2626')
    } finally {
      setLoading(false)
    }
  }

  const handleReadMessage = async (msg) => {
    setSelectedMessage(msg)
    
    // Call read API if unread
    if (!msg.isRead) {
      try {
        const res = await messageAPI.markAsRead(msg._id)
        if (res.success) {
          fetchMessages()
        }
      } catch (err) {
        console.error('Failed to mark message as read:', err)
      }
    }
  }

  const handleToggleArchive = async (e, msgId) => {
    e.stopPropagation()
    try {
      const res = await messageAPI.toggleArchive(msgId)
      if (res.success) {
        showToast(res.message || 'Archive updated', '#22c55e')
        fetchMessages()
        if (selectedMessage && selectedMessage._id === msgId) {
          setSelectedMessage(null)
        }
      }
    } catch (err) {
      console.error('Failed to toggle archive:', err)
      showToast('❌ Failed to update archive status', '#dc2626')
    }
  }

  // Filter messages based on Active/Archived tab, Priority filter, and Search query
  const filteredMessages = messages.filter(msg => {
    const isArchived = !!msg.isArchived
    if (tab === 'inbox' && isArchived) return false
    if (tab === 'archived' && !isArchived) return false

    if (priorityFilter !== 'all') {
      const msgPriority = (msg.priority || 'normal').toLowerCase()
      if (msgPriority !== priorityFilter) return false
    }

    if (search.trim()) {
      const q = search.toLowerCase()
      const subjectMatch = (msg.subject || '').toLowerCase().includes(q)
      const senderMatch = (msg.sender || '').toLowerCase().includes(q)
      const dateMatch = (msg.createdAt || '').toLowerCase().includes(q)
      if (!subjectMatch && !senderMatch && !dateMatch) return false
    }

    return true
  })

  const renderPriorityBadge = (priority = 'normal') => {
    const p = priority.toLowerCase()
    if (p === 'urgent') {
      return (
        <span style={{
          background: '#fee2e2',
          color: '#ef4444',
          border: '1px solid #fca5a5',
          padding: '2px 8px',
          borderRadius: '6px',
          fontSize: '0.72rem',
          fontWeight: '800',
          display: 'inline-flex',
          alignItems: 'center',
          gap: '4px'
        }}>
          <i className="fas fa-exclamation-triangle"></i> Urgent
        </span>
      )
    }
    if (p === 'important') {
      return (
        <span style={{
          background: '#ffedd5',
          color: '#f97316',
          border: '1px solid #fdba74',
          padding: '2px 8px',
          borderRadius: '6px',
          fontSize: '0.72rem',
          fontWeight: '800',
          display: 'inline-flex',
          alignItems: 'center',
          gap: '4px'
        }}>
          <i className="fas fa-star"></i> Important
        </span>
      )
    }
    return (
      <span style={{
        background: '#f1f5f9',
        color: '#64748b',
        padding: '2px 8px',
        borderRadius: '6px',
        fontSize: '0.72rem',
        fontWeight: '600'
      }}>
        Normal
      </span>
    )
  }

  const activeCount = messages.filter(m => !m.isArchived).length
  const archivedCount = messages.filter(m => !!m.isArchived).length

  return (
    <div className="employee-inbox" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', width: '100%' }}>
      {/* Top Card */}
      <div style={{
        background: '#ffffff',
        borderRadius: '20px',
        padding: '1.5rem',
        border: '1px solid #e2e8f0',
        boxShadow: '0 4px 20px -2px rgba(0, 0, 0, 0.03)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.25rem' }}>
          <div>
            <h2 style={{ margin: 0, fontSize: '1.35rem', fontWeight: '800', color: '#0a192f', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <i className="fas fa-inbox" style={{ color: '#2563eb' }}></i>
              Administrative Message Centre
            </h2>
            <p style={{ margin: '4px 0 0', fontSize: '0.84rem', color: '#64748b' }}>
              Official executive directives, compliance announcements, and direct notices
            </p>
          </div>
          <button
            onClick={fetchMessages}
            style={{
              background: '#f1f5f9',
              color: '#334155',
              border: '1px solid #cbd5e1',
              padding: '8px 16px',
              borderRadius: '10px',
              fontWeight: '700',
              fontSize: '0.82rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <i className={`fas fa-sync-alt ${loading ? 'fa-spin' : ''}`}></i> Refresh Inbox
          </button>
        </div>

        {/* Tab & Filter Bar */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px',
          borderTop: '1px solid #f1f5f9',
          paddingTop: '1rem'
        }}>
          {/* Tabs */}
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={() => setTab('inbox')}
              style={{
                padding: '7px 16px',
                borderRadius: '8px',
                border: 'none',
                background: tab === 'inbox' ? '#0a192f' : '#f8fafc',
                color: tab === 'inbox' ? '#ffffff' : '#64748b',
                fontWeight: '700',
                fontSize: '0.82rem',
                cursor: 'pointer'
              }}
            >
              📥 Active Inbox ({activeCount})
            </button>
            <button
              onClick={() => setTab('archived')}
              style={{
                padding: '7px 16px',
                borderRadius: '8px',
                border: 'none',
                background: tab === 'archived' ? '#0a192f' : '#f8fafc',
                color: tab === 'archived' ? '#ffffff' : '#64748b',
                fontWeight: '700',
                fontSize: '0.82rem',
                cursor: 'pointer'
              }}
            >
              🗄️ Archived ({archivedCount})
            </button>
          </div>

          {/* Search & Priority Controls */}
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              style={{
                padding: '7px 12px',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                fontSize: '0.82rem',
                background: '#ffffff'
              }}
            >
              <option value="all">All Priorities</option>
              <option value="urgent">🔴 Urgent</option>
              <option value="important">🟠 Important</option>
              <option value="normal">⚪ Normal</option>
            </select>

            <div style={{ position: 'relative' }}>
              <input
                type="text"
                placeholder="Search subject, sender..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{
                  padding: '7px 12px 7px 32px',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  fontSize: '0.82rem',
                  minWidth: '200px'
                }}
              />
              <i className="fas fa-search" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', fontSize: '0.78rem' }}></i>
            </div>
          </div>
        </div>
      </div>

      {/* Messages Table Card */}
      <div style={{
        background: '#ffffff',
        borderRadius: '20px',
        padding: '1.5rem',
        border: '1px solid #e2e8f0',
        boxShadow: '0 4px 20px -2px rgba(0, 0, 0, 0.03)'
      }}>
        <div style={{ overflowX: 'auto' }}>
          <table className="data-table" style={{ width: '100%', fontSize: '0.85rem' }}>
            <thead>
              <tr>
                <th style={{ width: '80px' }}>STATUS</th>
                <th style={{ width: '100px' }}>PRIORITY</th>
                <th>SENDER</th>
                <th>SUBJECT</th>
                <th>ATTACHMENT</th>
                <th>DATE RECEIVED</th>
                <th style={{ width: '120px' }}>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '2.5rem', color: '#64748b' }}>
                    <i className="fas fa-spinner fa-spin" style={{ marginRight: '6px' }}></i> Loading inbox messages...
                  </td>
                </tr>
              ) : filteredMessages.length > 0 ? (
                filteredMessages.map(rec => {
                  const isUrgent = (rec.priority || '').toLowerCase() === 'urgent'
                  const isImportant = (rec.priority || '').toLowerCase() === 'important'
                  return (
                    <tr 
                      key={rec._id} 
                      style={{
                        fontWeight: rec.isRead ? 'normal' : 'bold',
                        cursor: 'pointer',
                        background: !rec.isRead 
                          ? (isUrgent ? '#fef2f2' : (isImportant ? '#fffbeb' : '#f8fafc')) 
                          : undefined
                      }}
                      onClick={() => handleReadMessage(rec)}
                    >
                      <td>
                        <span className={`status-badge ${rec.isRead ? 'status-quarter' : 'status-full'}`} style={!rec.isRead ? { background: '#dbeafe', color: '#1d4ed8' } : undefined}>
                          {rec.isRead ? 'Read' : 'New ✉️'}
                        </span>
                      </td>
                      <td>
                        {renderPriorityBadge(rec.priority)}
                      </td>
                      <td>
                        {rec.sender} {rec.isBroadcast && <span style={{ fontSize: '0.72rem', background: '#fef3c7', color: '#d97706', padding: '2px 6px', borderRadius: '4px', marginLeft: '6px' }}>All</span>}
                      </td>
                      <td>
                        <span style={{ color: isUrgent ? '#dc2626' : (isImportant ? '#ea580c' : '#0a192f'), fontWeight: !rec.isRead ? '800' : '600' }}>
                          {rec.subject}
                        </span>
                      </td>
                      <td>
                        {rec.attachmentUrl ? (
                          <span style={{ color: '#16a34a', fontWeight: '700' }}>📎 Attached</span>
                        ) : (
                          <span style={{ color: '#94a3b8' }}>None</span>
                        )}
                      </td>
                      <td>{new Date(rec.createdAt).toLocaleString('en-US', { timeZone: 'Asia/Kolkata' })}</td>
                      <td>
                        <div style={{ display: 'flex', gap: '6px' }}>
                          <button 
                            className="g-button"
                            style={{ padding: '5px 10px', fontSize: '0.78rem', background: '#2563eb' }}
                            onClick={(e) => {
                              e.stopPropagation()
                              handleReadMessage(rec)
                            }}
                          >
                            Open
                          </button>
                          <button
                            title={rec.isArchived ? 'Unarchive' : 'Archive'}
                            onClick={(e) => handleToggleArchive(e, rec._id)}
                            style={{
                              padding: '5px 10px',
                              fontSize: '0.78rem',
                              border: '1px solid #cbd5e1',
                              borderRadius: '8px',
                              background: '#f8fafc',
                              color: '#64748b',
                              cursor: 'pointer'
                            }}
                          >
                            <i className={rec.isArchived ? 'fas fa-box-open' : 'fas fa-archive'}></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })
              ) : (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '2.5rem', color: '#94a3b8' }}>
                    {tab === 'archived' ? 'No archived messages.' : 'Inbox is clean. No active messages.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Message Viewer Modal */}
      {selectedMessage && (
        <div className="modal-overlay" style={{ display: 'flex', zIndex: 1100 }}>
          <div className="modal-content" style={{ maxWidth: '620px', width: '100%', borderRadius: '24px', overflow: 'hidden' }}>
            <div style={{
              background: (selectedMessage.priority || '').toLowerCase() === 'urgent' 
                ? 'linear-gradient(135deg, #b91c1c, #7f1d1d)' 
                : 'linear-gradient(135deg, #0a192f, #1e3a8a)',
              padding: '1.5rem',
              color: 'white',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h3 style={{ margin: 0 }}>✉️ View Message</h3>
                {renderPriorityBadge(selectedMessage.priority)}
              </div>
              <button 
                onClick={() => setSelectedMessage(null)}
                style={{ background: 'transparent', border: 'none', color: 'white', fontSize: '1.2rem', cursor: 'pointer' }}
              >
                &times;
              </button>
            </div>
            
            <div style={{ padding: '1.75rem', display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <strong style={{ fontSize: '0.78rem', color: '#64748b', textTransform: 'uppercase' }}>From:</strong>
                  <p style={{ margin: '4px 0 0 0', fontWeight: 'bold' }}>
                    {selectedMessage.sender} {selectedMessage.isBroadcast && <span style={{ background: '#fef3c7', color: '#d97706', fontSize: '0.72rem', padding: '2px 6px', borderRadius: '4px', marginLeft: '6px' }}>Broadcast</span>}
                  </p>
                </div>

                <div>
                  <strong style={{ fontSize: '0.78rem', color: '#64748b', textTransform: 'uppercase' }}>Date & Time:</strong>
                  <p style={{ margin: '4px 0 0 0', fontSize: '0.9rem' }}>
                    {new Date(selectedMessage.createdAt).toLocaleString('en-US', { timeZone: 'Asia/Kolkata' })}
                  </p>
                </div>
              </div>

              <div>
                <strong style={{ fontSize: '0.78rem', color: '#64748b', textTransform: 'uppercase' }}>Subject:</strong>
                <p style={{ margin: '4px 0 0 0', fontWeight: 'bold', fontSize: '1.15rem', color: '#0a192f' }}>
                  {selectedMessage.subject}
                </p>
              </div>

              <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '1rem' }}>
                <strong style={{ fontSize: '0.78rem', color: '#64748b', textTransform: 'uppercase' }}>Message Body:</strong>
                <p style={{ margin: '8px 0 0 0', whiteSpace: 'pre-wrap', lineHeight: '1.6', color: '#334155', fontSize: '0.95rem' }}>
                  {selectedMessage.message}
                </p>
              </div>

              {selectedMessage.attachmentUrl && (
                <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
                  <div>
                    <strong style={{ fontSize: '0.78rem', color: '#64748b', textTransform: 'uppercase' }}>Attached File:</strong>
                    <p style={{ margin: '4px 0 0 0', fontSize: '0.9rem', color: '#16a34a', fontWeight: 'bold' }}>
                      📎 File Attached
                    </p>
                  </div>
                  <a 
                    href={selectedMessage.attachmentUrl} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="g-button success"
                    style={{ textDecoration: 'none', padding: '8px 16px', fontSize: '0.85rem' }}
                  >
                    <i className="fas fa-download"></i> View / Download File
                  </a>
                </div>
              )}
            </div>

            <div style={{ background: '#f8fafc', padding: '1rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #e2e8f0' }}>
              <button
                onClick={(e) => handleToggleArchive(e, selectedMessage._id)}
                style={{
                  background: 'transparent',
                  border: '1px solid #cbd5e1',
                  borderRadius: '8px',
                  padding: '8px 14px',
                  color: '#475569',
                  fontSize: '0.84rem',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                <i className={selectedMessage.isArchived ? 'fas fa-box-open' : 'fas fa-archive'} style={{ marginRight: '6px' }}></i>
                {selectedMessage.isArchived ? 'Unarchive Message' : 'Archive Message'}
              </button>

              <button
                className="g-button"
                onClick={() => setSelectedMessage(null)}
                style={{ background: '#0a192f', padding: '8px 20px' }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default EmployeeInbox
