import React, { useState, useEffect } from 'react'
import { attendanceAPI } from '../services/api'

function MarkAttendanceModal({ isOpen, onClose, employee, onAttendanceMarked, showToast }) {
  const getTodayStr = () => new Date().toISOString().split('T')[0]
  
  const [date, setDate] = useState(getTodayStr())
  const [checkIn, setCheckIn] = useState('')
  const [checkOut, setCheckOut] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (isOpen) {
      setDate(getTodayStr())
      setCheckIn('')
      setCheckOut('')
    }
  }, [isOpen])

  if (!isOpen || !employee) return null

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    
    try {
      await attendanceAPI.manualMark({
        email: employee.email,
        date,
        checkIn,
        checkOut
      })

      showToast(`✅ Attendance saved for ${employee.name}`, '#22c55e')
      onAttendanceMarked()
      onClose()
    } catch (err) {
      console.error(err)
      const errorMsg = err.response?.data?.message || 'Failed to save attendance'
      showToast(`❌ ${errorMsg}`, '#dc2626')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="modal" style={{ display: 'flex' }}>
      <div className="modal-content">
        <div className="modal-header">
          <h3><i className="fas fa-calendar-check" style={{ marginRight: '8px' }}></i> Manual Attendance Entry</h3>
          <button className="close-modal" onClick={onClose}>&times;</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label>Employee</label>
            <input type="text" className="auth-input" value={employee.name} readOnly />
          </div>
          <div className="input-group">
            <label>Date</label>
            <input 
              type="date" 
              className="auth-input" 
              value={date} 
              onChange={(e) => setDate(e.target.value)}
              required 
            />
          </div>
          <div className="input-group">
            <label>Check-In Time *</label>
            <input 
              type="time" 
              className="auth-input" 
              value={checkIn}
              onChange={(e) => setCheckIn(e.target.value)}
              required
            />
          </div>
          <div className="input-group">
            <label>Check-Out Time (optional)</label>
            <input 
              type="time" 
              className="auth-input" 
              value={checkOut}
              onChange={(e) => setCheckOut(e.target.value)}
            />
          </div>
          <button type="submit" className="auth-btn" disabled={loading}>
            {loading ? 'Saving...' : '📌 Save Attendance'}
          </button>
        </form>
      </div>
    </div>
  )
}

export default MarkAttendanceModal
