import React, { useState, useEffect } from 'react'
import { leaveAPI } from '../services/api'

function LeaveManagementView({ currentUser, showToast }) {
  const [myLeaves, setMyLeaves] = useState([])
  const [allLeaves, setAllLeaves] = useState([])
  const [loading, setLoading] = useState(true)
  const [isApplyOpen, setIsApplyOpen] = useState(false)
  const [activeTab, setActiveTab] = useState('myLeaves') // 'myLeaves' | 'approvals'

  // Apply form
  const [leaveType, setLeaveType] = useState('Casual Leave')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [reason, setReason] = useState('')
  const [applying, setApplying] = useState(false)

  const isManagerOrAdmin = currentUser.role === 'admin' || currentUser.role === 'manager' || currentUser.email === 'anunand2004@gmail.com'

  useEffect(() => {
    fetchLeaves()
  }, [])

  const fetchLeaves = async () => {
    setLoading(true)
    try {
      const myRes = await leaveAPI.getMyLeaves()
      if (myRes.success) setMyLeaves(myRes.data || [])

      if (isManagerOrAdmin) {
        const allRes = await leaveAPI.getAllLeaves()
        if (allRes.success) setAllLeaves(allRes.data || [])
      }
    } catch (err) {
      console.error('Error fetching leaves:', err)
      showToast('⚠️ Could not load leave records', '#f59e0b')
    } finally {
      setLoading(false)
    }
  }

  const handleApply = async (e) => {
    e.preventDefault()
    if (!startDate || !endDate || !reason.trim()) {
      showToast('⚠️ Please specify leave dates and reason', '#f59e0b')
      return
    }

    setApplying(true)
    try {
      const start = new Date(startDate)
      const end = new Date(endDate)
      const diffDays = Math.max(1, Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1)

      const payload = {
        leaveType,
        startDate,
        endDate,
        totalDays: diffDays,
        reason: reason.trim(),
        teamName: currentUser.department || 'Development'
      }

      const res = await leaveAPI.apply(payload)
      if (res.success) {
        showToast('🚀 Leave application submitted for manager approval', '#10b981')
        setMyLeaves(prev => [res.data, ...prev])
        setIsApplyOpen(false)
        setStartDate('')
        setEndDate('')
        setReason('')
      } else {
        showToast(`❌ ${res.message || 'Failed to submit application'}`, '#ef4444')
      }
    } catch (err) {
      console.error('Leave apply error:', err)
      showToast(`❌ ${err.response?.data?.message || err.message}`, '#ef4444')
    } finally {
      setApplying(false)
    }
  }

  const handleUpdateStatus = async (leaveId, status) => {
    try {
      const res = await leaveAPI.updateStatus(leaveId, {
        status,
        managerComments: `Reviewed by ${currentUser.name}`
      })
      if (res.success) {
        showToast(`✓ Leave application ${status}`, '#10b981')
        setAllLeaves(prev => prev.map(l => l._id === leaveId ? res.data : l))
      }
    } catch (err) {
      console.error('Error updating leave status:', err)
      showToast('❌ Failed to update status', '#ef4444')
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', width: '100%' }}>
      {/* Top Banner */}
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
            Submit time-off requests, monitor remaining allowance quotas, and review team approvals.
          </p>
        </div>

        <button
          onClick={() => setIsApplyOpen(true)}
          style={{
            background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
            color: '#ffffff',
            border: 'none',
            borderRadius: '12px',
            padding: '10px 18px',
            fontWeight: '800',
            fontSize: '0.85rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            boxShadow: '0 4px 12px rgba(37, 99, 235, 0.35)'
          }}
        >
          <i className="fas fa-plus-circle"></i>
          Apply for Leave
        </button>
      </div>

      {/* Leave Balances Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '1rem'
      }}>
        <div style={{ background: '#ffffff', borderRadius: '16px', padding: '1.25rem', border: '1px solid #e2e8f0', boxShadow: '0 2px 4px rgba(0,0,0,0.03)' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: '800', color: '#64748b', marginBottom: '6px' }}>CASUAL LEAVE</div>
          <div style={{ fontSize: '1.8rem', fontWeight: '900', color: '#2563eb' }}>8 <span style={{ fontSize: '0.85rem', color: '#94a3b8' }}>/ 12 days</span></div>
          <div style={{ fontSize: '0.7rem', color: '#10b981', marginTop: '4px' }}>4 days utilized this year</div>
        </div>

        <div style={{ background: '#ffffff', borderRadius: '16px', padding: '1.25rem', border: '1px solid #e2e8f0', boxShadow: '0 2px 4px rgba(0,0,0,0.03)' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: '800', color: '#64748b', marginBottom: '6px' }}>SICK LEAVE</div>
          <div style={{ fontSize: '1.8rem', fontWeight: '900', color: '#10b981' }}>5 <span style={{ fontSize: '0.85rem', color: '#94a3b8' }}>/ 7 days</span></div>
          <div style={{ fontSize: '0.7rem', color: '#64748b', marginTop: '4px' }}>Medical certificate if &gt;2 days</div>
        </div>

        <div style={{ background: '#ffffff', borderRadius: '16px', padding: '1.25rem', border: '1px solid #e2e8f0', boxShadow: '0 2px 4px rgba(0,0,0,0.03)' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: '800', color: '#64748b', marginBottom: '6px' }}>PRIVILEGE LEAVE</div>
          <div style={{ fontSize: '1.8rem', fontWeight: '900', color: '#8b5cf6' }}>12 <span style={{ fontSize: '0.85rem', color: '#94a3b8' }}>/ 15 days</span></div>
          <div style={{ fontSize: '0.7rem', color: '#64748b', marginTop: '4px' }}>Carried forward annually</div>
        </div>

        <div style={{ background: '#ffffff', borderRadius: '16px', padding: '1.25rem', border: '1px solid #e2e8f0', boxShadow: '0 2px 4px rgba(0,0,0,0.03)' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: '800', color: '#64748b', marginBottom: '6px' }}>EMERGENCY LEAVE</div>
          <div style={{ fontSize: '1.8rem', fontWeight: '900', color: '#ef4444' }}>3 <span style={{ fontSize: '0.85rem', color: '#94a3b8' }}>/ 3 days</span></div>
          <div style={{ fontSize: '0.7rem', color: '#10b981', marginTop: '4px' }}>Full quota intact</div>
        </div>
      </div>

      {/* Tab Switcher if Manager/Admin */}
      {isManagerOrAdmin && (
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={() => setActiveTab('myLeaves')}
            style={{
              padding: '8px 16px',
              borderRadius: '10px',
              border: 'none',
              background: activeTab === 'myLeaves' ? '#0a192f' : '#ffffff',
              color: activeTab === 'myLeaves' ? '#ffffff' : '#64748b',
              fontWeight: '800',
              fontSize: '0.82rem',
              cursor: 'pointer'
            }}
          >
            My Leave Requests ({myLeaves.length})
          </button>
          <button
            onClick={() => setActiveTab('approvals')}
            style={{
              padding: '8px 16px',
              borderRadius: '10px',
              border: 'none',
              background: activeTab === 'approvals' ? '#0a192f' : '#ffffff',
              color: activeTab === 'approvals' ? '#ffffff' : '#64748b',
              fontWeight: '800',
              fontSize: '0.82rem',
              cursor: 'pointer'
            }}
          >
            Team Approvals Desk ({allLeaves.filter(l => l.status === 'Pending').length} Pending)
          </button>
        </div>
      )}

      {/* Content Table */}
      <div style={{
        background: '#ffffff',
        borderRadius: '16px',
        border: '1px solid #e2e8f0',
        overflow: 'hidden',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)'
      }}>
        {loading ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>
            <i className="fas fa-circle-notch fa-spin" style={{ fontSize: '1.8rem', color: '#2563eb', marginBottom: '10px' }}></i>
            <div>Loading leave records...</div>
          </div>
        ) : activeTab === 'myLeaves' ? (
          /* MY LEAVES */
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '1.5px solid #e2e8f0', color: '#475569', fontWeight: '800' }}>
                <th style={{ padding: '12px 16px' }}>LEAVE TYPE</th>
                <th style={{ padding: '12px' }}>DATES</th>
                <th style={{ padding: '12px' }}>DAYS</th>
                <th style={{ padding: '12px' }}>REASON</th>
                <th style={{ padding: '12px' }}>STATUS</th>
                <th style={{ padding: '12px 16px' }}>REVIEWED BY</th>
              </tr>
            </thead>
            <tbody>
              {myLeaves.map(leave => (
                <tr key={leave._id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '12px 16px', fontWeight: '800', color: '#0f172a' }}>
                    {leave.leaveType}
                  </td>
                  <td style={{ padding: '12px', color: '#334155' }}>
                    {leave.startDate} to {leave.endDate}
                  </td>
                  <td style={{ padding: '12px', fontWeight: '700', color: '#2563eb' }}>
                    {leave.totalDays} day(s)
                  </td>
                  <td style={{ padding: '12px', color: '#64748b', maxWidth: '240px' }}>
                    {leave.reason}
                  </td>
                  <td style={{ padding: '12px' }}>
                    <span style={{
                      background: leave.status === 'Approved' ? '#ecfdf5' : (leave.status === 'Rejected' ? '#fef2f2' : '#eff6ff'),
                      color: leave.status === 'Approved' ? '#059669' : (leave.status === 'Rejected' ? '#ef4444' : '#2563eb'),
                      padding: '3px 10px',
                      borderRadius: '999px',
                      fontWeight: '800',
                      fontSize: '0.72rem'
                    }}>
                      {leave.status}
                    </span>
                  </td>
                  <td style={{ padding: '12px 16px', color: '#64748b' }}>
                    {leave.reviewedBy || 'Pending Review'}
                  </td>
                </tr>
              ))}
              {myLeaves.length === 0 && (
                <tr>
                  <td colSpan={6} style={{ padding: '2.5rem', textAlign: 'center', color: '#94a3b8' }}>
                    No personal leave requests submitted
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        ) : (
          /* TEAM APPROVALS (Manager View) */
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '1.5px solid #e2e8f0', color: '#475569', fontWeight: '800' }}>
                <th style={{ padding: '12px 16px' }}>EMPLOYEE</th>
                <th style={{ padding: '12px' }}>TYPE</th>
                <th style={{ padding: '12px' }}>DATES</th>
                <th style={{ padding: '12px' }}>DAYS</th>
                <th style={{ padding: '12px' }}>REASON</th>
                <th style={{ padding: '12px' }}>STATUS</th>
                <th style={{ padding: '12px 16px', textAlign: 'right' }}>ACTION</th>
              </tr>
            </thead>
            <tbody>
              {allLeaves.map(leave => (
                <tr key={leave._id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '12px 16px', fontWeight: '800', color: '#0f172a' }}>
                    {leave.employeeName}
                  </td>
                  <td style={{ padding: '12px', color: '#2563eb', fontWeight: '600' }}>
                    {leave.leaveType}
                  </td>
                  <td style={{ padding: '12px', color: '#334155' }}>
                    {leave.startDate} to {leave.endDate}
                  </td>
                  <td style={{ padding: '12px', fontWeight: '700' }}>
                    {leave.totalDays} day(s)
                  </td>
                  <td style={{ padding: '12px', color: '#64748b', maxWidth: '200px' }}>
                    {leave.reason}
                  </td>
                  <td style={{ padding: '12px' }}>
                    <span style={{
                      background: leave.status === 'Approved' ? '#ecfdf5' : (leave.status === 'Rejected' ? '#fef2f2' : '#eff6ff'),
                      color: leave.status === 'Approved' ? '#059669' : (leave.status === 'Rejected' ? '#ef4444' : '#2563eb'),
                      padding: '3px 10px',
                      borderRadius: '999px',
                      fontWeight: '800',
                      fontSize: '0.72rem'
                    }}>
                      {leave.status}
                    </span>
                  </td>
                  <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                    {leave.status === 'Pending' ? (
                      <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                        <button
                          onClick={() => handleUpdateStatus(leave._id, 'Approved')}
                          style={{ background: '#10b981', color: '#fff', border: 'none', borderRadius: '6px', padding: '5px 10px', fontSize: '0.75rem', fontWeight: '700', cursor: 'pointer' }}
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => handleUpdateStatus(leave._id, 'Rejected')}
                          style={{ background: '#ef4444', color: '#fff', border: 'none', borderRadius: '6px', padding: '5px 10px', fontSize: '0.75rem', fontWeight: '700', cursor: 'pointer' }}
                        >
                          Reject
                        </button>
                      </div>
                    ) : (
                      <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Processed</span>
                    )}
                  </td>
                </tr>
              ))}
              {allLeaves.length === 0 && (
                <tr>
                  <td colSpan={7} style={{ padding: '2.5rem', textAlign: 'center', color: '#94a3b8' }}>
                    No team leave records found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Apply Modal */}
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
              <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: '900', color: '#0f172a' }}>
                Apply for Time Off
              </h3>
              <button onClick={() => setIsApplyOpen(false)} style={{ background: '#f1f5f9', border: 'none', borderRadius: '8px', width: '32px', height: '32px', cursor: 'pointer' }}>
                ✕
              </button>
            </div>

            <form onSubmit={handleApply} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#334155', marginBottom: '4px' }}>
                  Leave Type
                </label>
                <select
                  value={leaveType}
                  onChange={(e) => setLeaveType(e.target.value)}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '10px', border: '1.5px solid #cbd5e1', fontSize: '0.85rem', outline: 'none' }}
                >
                  <option value="Casual Leave">Casual Leave</option>
                  <option value="Sick Leave">Sick Leave</option>
                  <option value="Privilege Leave">Privilege Leave</option>
                  <option value="Emergency Leave">Emergency Leave</option>
                  <option value="Exam Leave">Exam Leave</option>
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

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#334155', marginBottom: '4px' }}>
                  Reason for Leave <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <textarea
                  rows={3}
                  placeholder="Provide brief context for leave and work handover status..."
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
                  style={{ padding: '8px 20px', borderRadius: '8px', border: 'none', background: '#2563eb', color: '#ffffff', fontWeight: '800', cursor: 'pointer' }}
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
