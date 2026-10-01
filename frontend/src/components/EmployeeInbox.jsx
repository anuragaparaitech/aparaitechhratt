import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { API_URL } from '../services/api'

function EmployeeInbox({ currentUser, showToast, onUnreadUpdate }) {
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(false)
  const [selectedMessage, setSelectedMessage] = useState(null) // Modal details

  useEffect(() => {
    fetchMessages()
  }, [])

  const fetchMessages = async () => {
    setLoading(false)
    try {
      const token = localStorage.getItem('aparaitech_token')
      const res = await axios.get(`${API_URL}/api/messages/employee`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (res.data.success) {
        setMessages(res.data.data || [])
        if (onUnreadUpdate) {
          onUnreadUpdate(res.data.unreadCount || 0)
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
    
    // Call read API only if the message is unread
    if (!msg.isRead) {
      try {
        const token = localStorage.getItem('aparaitech_token')
        const res = await axios.put(`${API_URL}/api/messages/${msg._id}/read`, {}, {
          headers: { Authorization: `Bearer ${token}` }
        })
        if (res.data.success) {
          // Re-fetch messages locally to refresh states and badge counts
          fetchMessages()
        }
      } catch (err) {
        console.error('Failed to mark message as read:', err)
      }
    }
  }

  return (
    <div className="employee-inbox">
      <div className="section-card">
        <div className="section-header">
          <h2><i className="fas fa-inbox" style={{ marginRight: '8px' }}></i> Administrative Message Inbox</h2>
          <button className="g-button" onClick={fetchMessages} style={{ background: '#1e5a7a' }}>
            <i className="fas fa-sync-alt"></i> Refresh
          </button>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>STATUS</th>
                <th>SENDER</th>
                <th>SUBJECT</th>
                <th>ATTACHMENT</th>
                <th>RECEIVED DATE & TIME</th>
                <th>ACTION</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '20px', color: '#64748b' }}>
                    <i className="fas fa-spinner fa-spin" style={{ marginRight: '6px' }}></i> Loading inbox messages...
                  </td>
                </tr>
              ) : messages.length > 0 ? (
                messages.map(rec => (
                  <tr 
                    key={rec._id} 
                    style={{ fontWeight: rec.isRead ? 'normal' : 'bold', cursor: 'pointer', background: rec.isRead ? undefined : '#f8fafc' }}
                    onClick={() => handleReadMessage(rec)}
                  >
                    <td>
                      <span className={`status-badge ${rec.isRead ? 'status-quarter' : 'status-full'}`} style={!rec.isRead ? { background: '#dbeafe', color: '#1d4ed8' } : undefined}>
                        {rec.isRead ? 'Read' : 'New ✉️'}
                      </span>
                    </td>
                    <td>
                      {rec.sender} {rec.isBroadcast && <span style={{ fontSize: '0.75rem', background: '#fef3c7', color: '#d97706', padding: '2px 6px', borderRadius: '4px', marginLeft: '6px' }}>Broadcast</span>}
                    </td>
                    <td>{rec.subject}</td>
                    <td>
                      {rec.attachmentUrl ? (
                        <span style={{ color: '#16a34a' }}>📎 Yes</span>
                      ) : (
                        <span style={{ color: '#94a3b8' }}>None</span>
                      )}
                    </td>
                    <td>{new Date(rec.createdAt).toLocaleString('en-US', { timeZone: 'Asia/Kolkata' })}</td>
                    <td>
                      <button 
                        className="g-button"
                        style={{ padding: '6px 12px', fontSize: '0.8rem', background: '#1e5a7a' }}
                        onClick={(e) => {
                          e.stopPropagation()
                          handleReadMessage(rec)
                        }}
                      >
                        Open
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '20px', color: '#64748b' }}>
                    Inbox is empty. No messages received from Admin.
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
          <div className="modal-content" style={{ maxWidth: '600px', width: '100%', borderRadius: '24px', overflow: 'hidden' }}>
            <div style={{
              background: 'linear-gradient(135deg, #1e3a8a, #0f172a)',
              padding: '1.5rem',
              color: 'white',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <h3 style={{ margin: 0 }}>✉️ View Message</h3>
              <button 
                onClick={() => setSelectedMessage(null)}
                style={{ background: 'transparent', border: 'none', color: 'white', fontSize: '1.2rem', cursor: 'pointer' }}
              >
                &times;
              </button>
            </div>
            
            <div style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
              <div>
                <strong style={{ fontSize: '0.8rem', color: '#64748b', textTransform: 'uppercase' }}>From:</strong>
                <p style={{ margin: '4px 0 0 0', fontWeight: 'bold' }}>
                  {selectedMessage.sender} {selectedMessage.isBroadcast && <span style={{ background: '#fef3c7', color: '#d97706', fontSize: '0.75rem', padding: '2px 6px', borderRadius: '4px', marginLeft: '6px' }}>Broadcast</span>}
                </p>
              </div>

              <div>
                <strong style={{ fontSize: '0.8rem', color: '#64748b', textTransform: 'uppercase' }}>Sent Time:</strong>
                <p style={{ margin: '4px 0 0 0' }}>
                  {new Date(selectedMessage.createdAt).toLocaleString('en-US', { timeZone: 'Asia/Kolkata' })}
                </p>
              </div>

              <div>
                <strong style={{ fontSize: '0.8rem', color: '#64748b', textTransform: 'uppercase' }}>Subject:</strong>
                <p style={{ margin: '4px 0 0 0', fontWeight: 'bold', fontSize: '1.1rem' }}>{selectedMessage.subject}</p>
              </div>

              <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '1rem' }}>
                <strong style={{ fontSize: '0.8rem', color: '#64748b', textTransform: 'uppercase' }}>Message Body:</strong>
                <p style={{ margin: '8px 0 0 0', whiteSpace: 'pre-wrap', lineHeight: '1.6', color: '#334155' }}>
                  {selectedMessage.message}
                </p>
              </div>

              {selectedMessage.attachmentUrl && (
                <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
                  <div>
                    <strong style={{ fontSize: '0.8rem', color: '#64748b', textTransform: 'uppercase' }}>File Attachment:</strong>
                    <p style={{ margin: '4px 0 0 0', fontSize: '0.9rem', color: '#16a34a', fontWeight: 'bold' }}>
                      📎 Attachment File Included
                    </p>
                  </div>
                  <a 
                    href={selectedMessage.attachmentUrl} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="g-button success"
                    style={{ textDecoration: 'none', padding: '8px 16px', fontSize: '0.85rem' }}
                  >
                    <i className="fas fa-download"></i> Download Attachment
                  </a>
                </div>
              )}
            </div>

            <div style={{ background: '#f1f5f9', padding: '1rem', textAlign: 'right' }}>
              <button className="g-button" onClick={() => setSelectedMessage(null)} style={{ background: '#475569' }}>
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
