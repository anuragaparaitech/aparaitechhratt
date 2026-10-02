import React, { useState, useEffect } from 'react'
import { employeeAPI, API_URL } from '../services/api'
import axios from 'axios'

function AdminMessagingCenter({ currentUser, showToast }) {
  const [employees, setEmployees] = useState([])
  const [activeSubTab, setActiveSubTab] = useState('single') // 'single' | 'broadcast' | 'history'
  
  // Individual Message Form States
  const [selectedEmpIds, setSelectedEmpIds] = useState([])
  const [singleSearch, setSingleSearch] = useState('')
  const [subject, setSubject] = useState('')
  const [message, setMessage] = useState('')
  const [attachment, setAttachment] = useState(null)
  const [attachmentName, setAttachmentName] = useState('')
  const [priority, setPriority] = useState('normal') // 'normal' | 'important' | 'urgent'
  const [scheduleMode, setScheduleMode] = useState('now') // 'now' | 'later'
  const [scheduledFor, setScheduledFor] = useState('')
  const [sending, setSending] = useState(false)

  // Broadcast Message Form States
  const [broadcastSubject, setBroadcastSubject] = useState('')
  const [broadcastMessage, setBroadcastMessage] = useState('')
  const [broadcastAttachment, setBroadcastAttachment] = useState(null)
  const [broadcastAttachmentName, setBroadcastAttachmentName] = useState('')
  const [broadcastPriority, setBroadcastPriority] = useState('normal')
  const [broadcastTeam, setBroadcastTeam] = useState('All') // 'All' | 'BDA' | 'Development' | 'HR' | 'Management'
  const [broadcastScheduleMode, setBroadcastScheduleMode] = useState('now')
  const [broadcastScheduledFor, setBroadcastScheduledFor] = useState('')
  const [broadcasting, setBroadcasting] = useState(false)
  const [broadcastResult, setBroadcastResult] = useState(null) // { total, sent, failed }

  // History States
  const [history, setHistory] = useState([])
  const [histSearch, setHistSearch] = useState('')
  const [histType, setHistType] = useState('all') // 'all' | 'individual' | 'broadcast'
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [loadingHistory, setLoadingHistory] = useState(false)

  useEffect(() => {
    fetchEmployees()
    if (activeSubTab === 'history') {
      fetchHistory()
    }
  }, [activeSubTab, page, histType])

  const fetchEmployees = async () => {
    try {
      const data = await employeeAPI.getAll()
      setEmployees(data.employees || [])
    } catch (err) {
      console.error(err)
      showToast('❌ Failed to fetch employee directory', '#dc2626')
    }
  }

  const fetchHistory = async () => {
    setLoadingHistory(true)
    try {
      const token = localStorage.getItem('aparaitech_token')
      const res = await axios.get(`${API_URL}/api/messages/admin/history`, {
        params: { search: histSearch, type: histType, page, limit: 8 },
        headers: { Authorization: `Bearer ${token}` }
      })
      if (res.data.success) {
        setHistory(res.data.data || [])
        setTotalPages(res.data.pagination?.pages || 1)
      }
    } catch (err) {
      console.error(err)
      showToast('❌ Failed to load messaging history', '#dc2626')
    } finally {
      setLoadingHistory(false)
    }
  }

  const handleFileChange = (e, type) => {
    const file = e.target.files[0]
    if (!file) return

    if (file.size > 5 * 1024 * 1024) {
      alert('File size exceeds the 5MB limit.')
      return
    }

    const allowedTypes = ['application/pdf', 'image/png', 'image/jpeg', 'image/jpg']
    if (!allowedTypes.includes(file.type)) {
      alert('Only PDF, JPG, and PNG files are allowed.')
      return
    }

    const reader = new FileReader()
    reader.onloadend = () => {
      if (type === 'single') {
        setAttachment(reader.result)
        setAttachmentName(file.name)
      } else {
        setBroadcastAttachment(reader.result)
        setBroadcastAttachmentName(file.name)
      }
    }
    reader.readAsDataURL(file)
  }

  const handleSendSingle = async (e) => {
    e.preventDefault()
    if (selectedEmpIds.length === 0) {
      showToast('⚠️ Please select at least one recipient employee', '#eab308')
      return
    }
    if (!subject.trim() || !message.trim()) {
      showToast('⚠️ Subject and Message are required', '#eab308')
      return
    }

    if (!window.confirm('Are you sure you want to send this message and email?')) return

    setSending(true)
    try {
      const token = localStorage.getItem('aparaitech_token')
      const payload = {
        subject,
        message,
        attachment,
        priority,
        scheduledFor: scheduleMode === 'later' ? scheduledFor : null
      }
      
      let res
      if (selectedEmpIds.length === 1) {
        res = await axios.post(
          `${API_URL}/api/messages/send/${selectedEmpIds[0]}`,
          payload,
          { headers: { Authorization: `Bearer ${token}` } }
        )
      } else {
        res = await axios.post(
          `${API_URL}/api/messages/send-bulk`,
          { employeeIds: selectedEmpIds, ...payload },
          { headers: { Authorization: `Bearer ${token}` } }
        )
      }
      
      if (res.data.success) {
        if (res.data.emailSent) {
          showToast('✉️ Message(s) & Email(s) delivered successfully!', '#22c55e')
        } else {
          showToast('⚠️ Message(s) saved in-app, but email delivery failed.', '#eab308')
        }
        setSubject('')
        setMessage('')
        setAttachment(null)
        setAttachmentName('')
        setSelectedEmpIds([])
      } else {
        showToast('❌ Failed to save message.', '#dc2626')
      }
    } catch (err) {
      console.error(err)
      const errText = err.response?.data?.message || 'Failed to send message'
      showToast(`❌ ${errText}`, '#dc2626')
    } finally {
      setSending(false)
    }
  }

  const handleBroadcast = async (e) => {
    e.preventDefault()
    if (!broadcastSubject.trim() || !broadcastMessage.trim()) {
      showToast('⚠️ Subject and Message are required', '#eab308')
      return
    }

    const confirmMsg = broadcastTeam === 'All'
      ? '⚠️ WARNING: You are broadcasting this message to ALL active employees. Proceed?'
      : `⚠️ WARNING: You are broadcasting this message to team "${broadcastTeam}". Proceed?`

    if (!window.confirm(confirmMsg)) return

    setBroadcasting(true)
    setBroadcastResult(null)
    try {
      const token = localStorage.getItem('aparaitech_token')
      const res = await axios.post(
        `${API_URL}/api/messages/broadcast`,
        {
          subject: broadcastSubject,
          message: broadcastMessage,
          attachment: broadcastAttachment,
          priority: broadcastPriority,
          targetTeam: broadcastTeam,
          scheduledFor: broadcastScheduleMode === 'later' ? broadcastScheduledFor : null
        },
        { headers: { Authorization: `Bearer ${token}` } }
      )

      if (res.data.success) {
        showToast('📢 Broadcast completed successfully!', '#22c55e')
        setBroadcastResult({
          total: res.data.totalEmployees,
          sent: res.data.sentCount,
          failed: res.data.failedCount
        })
        setBroadcastSubject('')
        setBroadcastMessage('')
        setBroadcastAttachment(null)
        setBroadcastAttachmentName('')
      }
    } catch (err) {
      console.error(err)
      const errText = err.response?.data?.message || 'Failed to complete broadcast'
      showToast(`❌ ${errText}`, '#dc2626')
    } finally {
      setBroadcasting(false)
    }
  }

  // Filter employees by search keyword (excluding admin)
  const filteredEmps = employees.filter(emp => {
    if (emp.role === 'admin') return false
    const query = singleSearch.toLowerCase()
    return (
      (emp.name || '').toLowerCase().includes(query) ||
      (emp.empId || '').toLowerCase().includes(query) ||
      (emp.email || '').toLowerCase().includes(query) ||
      (emp.department || '').toLowerCase().includes(query)
    )
  })

  // Selected Names display string helper
  const selectedNamesString = employees
    .filter(emp => selectedEmpIds.includes(emp._id))
    .map(emp => emp.name)
    .join(', ')

  // Toggle selection for an employee ID
  const handleToggleSelect = (id) => {
    setSelectedEmpIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    )
  }

  // Select all employees matching the active filter
  const handleSelectAll = () => {
    const allFilteredIds = filteredEmps.map(emp => emp._id)
    setSelectedEmpIds(allFilteredIds)
  }

  // Clear all selections
  const handleClearSelection = () => {
    setSelectedEmpIds([])
  }

  return (
    <div className="messaging-center">
      {/* Sub Tabs Navigation */}
      <div className="section-card" style={{ marginBottom: '1.5rem', padding: '1rem 1.5rem', borderRadius: '20px' }}>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <button 
            className={`g-button ${activeSubTab === 'single' ? 'success' : ''}`}
            style={{ background: activeSubTab === 'single' ? undefined : '#475569' }}
            onClick={() => setActiveSubTab('single')}
          >
            <i className="fas fa-paper-plane" style={{ marginRight: '6px' }}></i> Send to Employee
          </button>
          <button 
            className={`g-button ${activeSubTab === 'broadcast' ? 'success' : ''}`}
            style={{ background: activeSubTab === 'broadcast' ? undefined : '#475569' }}
            onClick={() => setActiveSubTab('broadcast')}
          >
            <i className="fas fa-bullhorn" style={{ marginRight: '6px' }}></i> Broadcast Message
          </button>
          <button 
            className={`g-button ${activeSubTab === 'history' ? 'success' : ''}`}
            style={{ background: activeSubTab === 'history' ? undefined : '#475569' }}
            onClick={() => setActiveSubTab('history')}
          >
            <i className="fas fa-history" style={{ marginRight: '6px' }}></i> Message History
          </button>
        </div>
      </div>

      {/* 1. Send Message to Single Employee */}
      {activeSubTab === 'single' && (
        <div className="section-card">
          <div className="section-header">
            <h2><i className="fas fa-envelope-open-text" style={{ marginRight: '8px' }}></i> Send Message to Employee</h2>
          </div>

          <form onSubmit={handleSendSingle} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontWeight: 'bold', fontSize: '0.95rem', color: '#334155' }}>
                Select Recipient Employee(s):
              </label>
              
              {/* Search Box above the list */}
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center', marginBottom: '5px' }}>
                <input 
                  type="text"
                  className="filter-input"
                  placeholder="🔍 Search by Name, ID, Email, or Department..."
                  value={singleSearch}
                  onChange={(e) => setSingleSearch(e.target.value)}
                  style={{ flex: 1, minWidth: '240px' }}
                />
                
                {/* Select All / Clear Selection Controls */}
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button 
                    type="button" 
                    className="g-button"
                    style={{ background: '#1e5a7a', fontSize: '0.8rem', padding: '8px 12px' }}
                    onClick={handleSelectAll}
                  >
                    Select All ({filteredEmps.length})
                  </button>
                  <button 
                    type="button" 
                    className="g-button"
                    style={{ background: '#64748b', fontSize: '0.8rem', padding: '8px 12px' }}
                    onClick={handleClearSelection}
                  >
                    Clear Selection
                  </button>
                </div>
              </div>

              {/* Scrollable Checkbox List Box */}
              <div style={{ 
                maxHeight: '220px', 
                overflowY: 'auto', 
                border: '2px solid #e2e8f0', 
                borderRadius: '16px', 
                padding: '12px', 
                background: '#f8fafc',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px'
              }}>
                {filteredEmps.length > 0 ? (
                  filteredEmps.map(emp => {
                    const isSelected = selectedEmpIds.includes(emp._id)
                    return (
                      <div 
                        key={emp._id} 
                        style={{
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: '12px',
                          padding: '10px 14px',
                          borderRadius: '12px',
                          background: isSelected ? '#eff6ff' : '#ffffff',
                          border: isSelected ? '1px solid #3b82f6' : '1px solid #e2e8f0',
                          cursor: 'pointer',
                          transition: 'all 0.15s ease-in-out',
                          boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
                        }}
                        onClick={() => handleToggleSelect(emp._id)}
                      >
                        <input 
                          type="checkbox" 
                          checked={isSelected}
                          onChange={(e) => {
                            e.stopPropagation()
                            handleToggleSelect(emp._id)
                          }}
                          style={{ width: '17px', height: '17px', cursor: 'pointer' }}
                        />
                        <div style={{ fontSize: '0.88rem', color: '#1e293b', flex: 1, display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                          <span style={{ fontWeight: 'bold' }}>{emp.name}</span>
                          <span style={{ color: '#64748b' }}>|</span>
                          <span style={{ fontWeight: '600', color: '#1e5a7a' }}>{emp.empId}</span>
                          <span style={{ color: '#64748b' }}>|</span>
                          <span style={{ color: '#475569' }}>{emp.department || 'No Department'}</span>
                          <span style={{ color: '#64748b' }}>|</span>
                          <span style={{ color: '#64748b', fontStyle: 'italic' }}>{emp.email}</span>
                        </div>
                      </div>
                    )
                  })
                ) : (
                  <div style={{ textAlign: 'center', color: '#64748b', padding: '15px 0' }}>
                    No Employees Found
                  </div>
                )}
              </div>

              {/* Selected List details box */}
              {selectedEmpIds.length > 0 && (
                <div style={{ 
                  marginTop: '6px', 
                  background: '#f1f5f9', 
                  borderRadius: '12px', 
                  padding: '10px 14px', 
                  borderLeft: '4px solid #1e5a7a', 
                  fontSize: '0.85rem' 
                }}>
                  <strong style={{ color: '#1e293b' }}>
                    Sending message to: {selectedEmpIds.length} employee{selectedEmpIds.length > 1 ? 's' : ''} selected.
                  </strong>
                  <div style={{ marginTop: '4px', color: '#475569', wordBreak: 'break-word', overflowY: 'auto', maxHeight: '50px' }}>
                    {selectedNamesString}
                  </div>
                </div>
              )}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontWeight: 'bold', fontSize: '0.9rem', color: '#64748b' }}>Subject:</label>
              <input 
                type="text"
                className="filter-input"
                placeholder="Enter email subject"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                required
                style={{ width: '100%' }}
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontWeight: 'bold', fontSize: '0.9rem', color: '#64748b' }}>Message Content:</label>
              <textarea 
                className="filter-input"
                placeholder="Write your email and in-app message content here..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                required
                style={{ width: '100%', minHeight: '120px', padding: '10px', fontFamily: 'inherit' }}
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontWeight: 'bold', fontSize: '0.9rem', color: '#64748b' }}>Attachment (Optional PDF/PNG/JPG - Max 5MB):</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                <input 
                  type="file"
                  onChange={(e) => handleFileChange(e, 'single')}
                  accept=".pdf,image/png,image/jpeg,image/jpg"
                  style={{ display: 'none' }}
                  id="singleFile"
                />
                <label 
                  htmlFor="singleFile"
                  className="g-button"
                  style={{ background: '#475569', fontSize: '0.85rem', cursor: 'pointer' }}
                >
                  <i className="fas fa-upload" style={{ marginRight: '6px' }}></i> Choose File
                </label>
                {attachmentName && (
                  <span style={{ fontSize: '0.9rem', color: '#16a34a', fontWeight: 'bold' }}>
                    📎 {attachmentName}
                  </span>
                )}
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontWeight: 'bold', fontSize: '0.9rem', color: '#64748b' }}>Priority Level:</label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                  style={{
                    padding: '9px 12px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.88rem',
                    background: '#ffffff'
                  }}
                >
                  <option value="normal">⚪ Normal Priority</option>
                  <option value="important">🟠 Important Priority</option>
                  <option value="urgent">🔴 Urgent Priority</option>
                </select>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontWeight: 'bold', fontSize: '0.9rem', color: '#64748b' }}>Delivery Timing:</label>
                <select
                  value={scheduleMode}
                  onChange={(e) => setScheduleMode(e.target.value)}
                  style={{
                    padding: '9px 12px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.88rem',
                    background: '#ffffff'
                  }}
                >
                  <option value="now">⚡ Send Immediately</option>
                  <option value="later">⏰ Schedule for Later</option>
                </select>
              </div>

              {scheduleMode === 'later' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontWeight: 'bold', fontSize: '0.9rem', color: '#64748b' }}>Schedule Date & Time:</label>
                  <input
                    type="datetime-local"
                    value={scheduledFor}
                    onChange={(e) => setScheduledFor(e.target.value)}
                    style={{
                      padding: '8px 12px',
                      borderRadius: '8px',
                      border: '1px solid #cbd5e1',
                      fontSize: '0.88rem'
                    }}
                  />
                </div>
              )}
            </div>

            <button 
              type="submit"
              className="g-button success"
              disabled={sending}
              style={{ marginTop: '10px', width: 'fit-content' }}
            >
              {sending ? (
                <span><i className="fas fa-spinner fa-spin" style={{ marginRight: '6px' }}></i> Sending Message...</span>
              ) : (
                <span><i className="fas fa-paper-plane" style={{ marginRight: '6px' }}></i> Send Message</span>
              )}
            </button>
          </form>
        </div>
      )}

      {/* 2. Broadcast Message Section */}
      {activeSubTab === 'broadcast' && (
        <div className="section-card" style={{ borderLeft: '4px solid #d97706' }}>
          <div className="section-header">
            <h2><i className="fas fa-bullhorn" style={{ color: '#d97706', marginRight: '8px' }}></i> Broadcast message to all active employees</h2>
          </div>

          <form onSubmit={handleBroadcast} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontWeight: 'bold', fontSize: '0.9rem', color: '#64748b' }}>Subject:</label>
              <input 
                type="text"
                className="filter-input"
                placeholder="Enter broadcast subject"
                value={broadcastSubject}
                onChange={(e) => setBroadcastSubject(e.target.value)}
                required
                style={{ width: '100%' }}
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontWeight: 'bold', fontSize: '0.9rem', color: '#64748b' }}>Message Content:</label>
              <textarea 
                className="filter-input"
                placeholder="Write message to send to everyone..."
                value={broadcastMessage}
                onChange={(e) => setBroadcastMessage(e.target.value)}
                required
                style={{ width: '100%', minHeight: '120px', padding: '10px', fontFamily: 'inherit' }}
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontWeight: 'bold', fontSize: '0.9rem', color: '#64748b' }}>Attachment (Optional PDF/PNG/JPG - Max 5MB):</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                <input 
                  type="file"
                  onChange={(e) => handleFileChange(e, 'broadcast')}
                  accept=".pdf,image/png,image/jpeg,image/jpg"
                  style={{ display: 'none' }}
                  id="broadcastFile"
                />
                <label 
                  htmlFor="broadcastFile"
                  className="g-button"
                  style={{ background: '#475569', fontSize: '0.85rem', cursor: 'pointer' }}
                >
                  <i className="fas fa-upload" style={{ marginRight: '6px' }}></i> Choose File
                </label>
                {broadcastAttachmentName && (
                  <span style={{ fontSize: '0.9rem', color: '#16a34a', fontWeight: 'bold' }}>
                    📎 {broadcastAttachmentName}
                  </span>
                )}
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontWeight: 'bold', fontSize: '0.9rem', color: '#64748b' }}>Recipient Audience:</label>
                <select
                  value={broadcastTeam}
                  onChange={(e) => setBroadcastTeam(e.target.value)}
                  style={{
                    padding: '9px 12px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.88rem',
                    background: '#ffffff'
                  }}
                >
                  <option value="All">👥 All Active Employees</option>
                  <option value="BDA">📈 Business Development (BDA)</option>
                  <option value="Development">💻 Software Development</option>
                  <option value="HR">🤝 Human Resources (HR)</option>
                  <option value="Management">🏢 Leadership / Management</option>
                </select>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontWeight: 'bold', fontSize: '0.9rem', color: '#64748b' }}>Priority Level:</label>
                <select
                  value={broadcastPriority}
                  onChange={(e) => setBroadcastPriority(e.target.value)}
                  style={{
                    padding: '9px 12px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.88rem',
                    background: '#ffffff'
                  }}
                >
                  <option value="normal">⚪ Normal Priority</option>
                  <option value="important">🟠 Important Priority</option>
                  <option value="urgent">🔴 Urgent Priority</option>
                </select>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontWeight: 'bold', fontSize: '0.9rem', color: '#64748b' }}>Delivery Timing:</label>
                <select
                  value={broadcastScheduleMode}
                  onChange={(e) => setBroadcastScheduleMode(e.target.value)}
                  style={{
                    padding: '9px 12px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.88rem',
                    background: '#ffffff'
                  }}
                >
                  <option value="now">⚡ Send Immediately</option>
                  <option value="later">⏰ Schedule for Later</option>
                </select>
              </div>

              {broadcastScheduleMode === 'later' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontWeight: 'bold', fontSize: '0.9rem', color: '#64748b' }}>Schedule Date & Time:</label>
                  <input
                    type="datetime-local"
                    value={broadcastScheduledFor}
                    onChange={(e) => setBroadcastScheduledFor(e.target.value)}
                    style={{
                      padding: '8px 12px',
                      borderRadius: '8px',
                      border: '1px solid #cbd5e1',
                      fontSize: '0.88rem'
                    }}
                  />
                </div>
              )}
            </div>

            <button 
              type="submit"
              className="g-button danger"
              disabled={broadcasting}
              style={{ marginTop: '10px', background: '#d97706', width: 'fit-content' }}
            >
              {broadcasting ? (
                <span><i className="fas fa-spinner fa-spin" style={{ marginRight: '6px' }}></i> Broadcasting...</span>
              ) : (
                <span><i className="fas fa-bullhorn" style={{ marginRight: '6px' }}></i> Send to All</span>
              )}
            </button>
          </form>

          {/* Broadcast Result Summary Card */}
          {broadcastResult && (
            <div className="employee-stats-summary" style={{ background: '#fef3c7', borderRadius: '16px', padding: '1.2rem', marginTop: '1.5rem', display: 'flex', gap: '2.5rem', flexWrap: 'wrap', color: '#92400e' }}>
              <div>
                <strong style={{ fontSize: '0.8rem', color: '#b45309', textTransform: 'uppercase' }}>Total Recipient Employees</strong>
                <br />
                <span style={{ fontSize: '1.4rem', fontWeight: 800 }}>{broadcastResult.total}</span>
              </div>
              <div>
                <strong style={{ fontSize: '0.8rem', color: '#15803d', textTransform: 'uppercase' }}>Sent Successfully</strong>
                <br />
                <span style={{ fontSize: '1.4rem', fontWeight: 800, color: '#16a34a' }}>{broadcastResult.sent}</span>
              </div>
              <div>
                <strong style={{ fontSize: '0.8rem', color: '#b91c1c', textTransform: 'uppercase' }}>Failed Deliveries</strong>
                <br />
                <span style={{ fontSize: '1.4rem', fontWeight: 800, color: '#dc2626' }}>{broadcastResult.failed}</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 3. Admin Message History */}
      {activeSubTab === 'history' && (
        <div className="section-card">
          <div className="section-header">
            <h2><i className="fas fa-history" style={{ marginRight: '8px' }}></i> Admin Message History</h2>
            <div className="filter-bar">
              <input 
                type="text"
                className="filter-input"
                placeholder="🔍 Search subject/message..."
                value={histSearch}
                onChange={(e) => setHistSearch(e.target.value)}
                style={{ width: '220px' }}
              />
              <select 
                className="filter-input"
                value={histType}
                onChange={(e) => {
                  setHistType(e.target.value)
                  setPage(1)
                }}
              >
                <option value="all">All Types</option>
                <option value="individual">Individual</option>
                <option value="broadcast">Broadcasts</option>
              </select>
              <button className="g-button" onClick={fetchHistory} style={{ background: '#1e5a7a' }}>
                Search
              </button>
            </div>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>DATE & TIME</th>
                  <th>RECIPIENT NAME</th>
                  <th>TYPE</th>
                  <th>SUBJECT</th>
                  <th>ATTACHMENT</th>
                  <th>DELIVERY STATUS</th>
                </tr>
              </thead>
              <tbody>
                {loadingHistory ? (
                  <tr>
                    <td colSpan="6" style={{ textAlign: 'center', padding: '20px', color: '#64748b' }}>
                      <i className="fas fa-spinner fa-spin" style={{ marginRight: '6px' }}></i> Loading history logs...
                    </td>
                  </tr>
                ) : history.length > 0 ? (
                  history.map(rec => (
                    <tr key={rec._id}>
                      <td>{new Date(rec.createdAt).toLocaleString('en-US', { timeZone: 'Asia/Kolkata' })}</td>
                      <td>
                        {rec.isBroadcast ? (
                          <span style={{ fontWeight: 'bold', color: '#d97706' }}>Broadcast (All Active)</span>
                        ) : (
                          rec.recipientEmployeeId ? `${rec.recipientEmployeeId.name} (${rec.recipientEmployeeId.empId})` : 'Unknown Employee'
                        )}
                      </td>
                      <td>
                        <span className={`status-badge ${rec.isBroadcast ? 'status-half' : 'status-full'}`}>
                          {rec.isBroadcast ? 'Broadcast' : 'Individual'}
                        </span>
                      </td>
                      <td>{rec.subject}</td>
                      <td>
                        {rec.attachmentUrl ? (
                          <a 
                            href={rec.attachmentUrl} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            style={{ color: '#1e5a7a', fontWeight: 'bold', textDecoration: 'underline' }}
                          >
                            Download 📎
                          </a>
                        ) : (
                          <span style={{ color: '#94a3b8' }}>None</span>
                        )}
                      </td>
                      <td>
                        <span className={`status-badge ${rec.deliveryStatus === 'delivered' ? 'status-full' : 'status-quarter'}`} style={rec.deliveryStatus === 'failed' ? { background: '#fee2e2', color: '#b91c1c' } : undefined}>
                          {rec.deliveryStatus === 'delivered' ? 'Delivered' : 'Failed'}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" style={{ textAlign: 'center', padding: '20px', color: '#64748b' }}>
                      No message history matches current search filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginTop: '1.5rem', alignItems: 'center' }}>
              <button 
                className="g-button"
                style={{ background: '#475569', padding: '6px 12px', fontSize: '0.8rem' }}
                disabled={page === 1}
                onClick={() => setPage(p => Math.max(1, p - 1))}
              >
                Previous
              </button>
              <span style={{ fontSize: '0.9rem', fontWeight: 'bold', color: '#1e293b' }}>
                Page {page} of {totalPages}
              </span>
              <button 
                className="g-button"
                style={{ background: '#475569', padding: '6px 12px', fontSize: '0.8rem' }}
                disabled={page === totalPages}
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              >
                Next
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default AdminMessagingCenter
