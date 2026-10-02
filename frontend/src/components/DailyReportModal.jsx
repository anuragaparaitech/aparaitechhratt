import React, { useState, useEffect } from 'react'
import { reportsAPI } from '../services/api'

function DailyReportModal({ isOpen, onClose, currentUser, onSuccess, showToast }) {
  const [formData, setFormData] = useState({
    connectedCalls: 0,
    callsAbove3Min: 0,
    groupsCreated: 0,
    membersInGroups: 0,
    todayConversions: 0,
    remarks: ''
  })
  const [loading, setLoading] = useState(false)
  const [existingReport, setExistingReport] = useState(null)
  const [autoInfo, setAutoInfo] = useState({
    date: '',
    time: ''
  })

  // Format today's date and time in IST (Asia/Kolkata)
  useEffect(() => {
    if (isOpen && currentUser) {
      const now = new Date()
      const kolkataStr = now.toLocaleString('en-US', { timeZone: 'Asia/Kolkata' })
      const kDate = new Date(kolkataStr)
      const year = kDate.getFullYear()
      const month = String(kDate.getMonth() + 1).padStart(2, '0')
      const day = String(kDate.getDate()).padStart(2, '0')
      const dateStr = `${year}-${month}-${day}`

      let hours = kDate.getHours()
      const minutes = String(kDate.getMinutes()).padStart(2, '0')
      const ampm = hours >= 12 ? 'PM' : 'AM'
      hours = hours % 12 || 12
      const timeStr = `${String(hours).padStart(2, '0')}:${minutes} ${ampm}`

      setAutoInfo({ date: dateStr, time: timeStr })

      // Check if user already submitted a report today
      reportsAPI.getTodayStatus().then(res => {
        if (res.success && res.report) {
          setExistingReport(res.report)
          setFormData({
            connectedCalls: res.report.connectedCalls || 0,
            callsAbove3Min: res.report.callsAbove3Min || 0,
            groupsCreated: res.report.groupsCreated || 0,
            membersInGroups: res.report.membersInGroups || 0,
            todayConversions: res.report.todayConversions || 0,
            remarks: res.report.remarks || ''
          })
        }
      }).catch(err => {
        console.warn('Could not load today status:', err.message)
      })
    }
  }, [isOpen, currentUser])

  if (!isOpen || !currentUser) return null

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: name === 'remarks' ? value : Math.max(0, parseInt(value, 10) || 0)
    }))
  }

  const revenueEst = (formData.todayConversions || 0) * 6000

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await reportsAPI.submitDaily(formData)
      if (res.success) {
        showToast(`✅ ${res.message || 'Daily report submitted successfully!'}`, '#16a34a')
        if (onSuccess) onSuccess(res.data)
        onClose()
      }
    } catch (err) {
      console.error(err)
      const errTxt = err.response?.data?.message || err.message || 'Submission failed'
      showToast(`❌ ${errTxt}`, '#dc2626')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="modal-overlay" style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(10, 25, 47, 0.75)',
      backdropFilter: 'blur(5px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1100,
      padding: '1rem'
    }}>
      <div className="modal-content" style={{
        background: '#ffffff',
        borderRadius: '20px',
        maxWidth: '580px',
        width: '100%',
        maxHeight: '92vh',
        overflowY: 'auto',
        boxShadow: '0 25px 50px -12px rgba(10, 25, 47, 0.25)',
        border: '1px solid #e2e8f0',
        animation: 'modalSlideUp 0.3s ease-out'
      }}>
        {/* Modal Header */}
        <div style={{
          background: 'linear-gradient(135deg, #0a192f 0%, #1e3a8a 100%)',
          padding: '1.25rem 1.75rem',
          borderRadius: '20px 20px 0 0',
          color: '#ffffff',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: '700', letterSpacing: '-0.02em' }}>
              <i className="fas fa-clipboard-check" style={{ marginRight: '10px', color: '#60a5fa' }}></i>
              Daily Working Report
            </h3>
            <p style={{ margin: '4px 0 0', fontSize: '0.82rem', color: '#93c5fd' }}>
              Aparaitech Software Performance Submission
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'rgba(255, 255, 255, 0.1)',
              border: 'none',
              color: '#ffffff',
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              cursor: 'pointer',
              fontSize: '1rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            ✕
          </button>
        </div>

        {/* Existing Report Alert */}
        {existingReport && (
          <div style={{
            background: '#ecfdf5',
            borderLeft: '4px solid #10b981',
            padding: '10px 16px',
            margin: '1rem 1.5rem 0',
            borderRadius: '6px',
            fontSize: '0.82rem',
            color: '#065f46'
          }}>
            <i className="fas fa-info-circle" style={{ marginRight: '6px' }}></i>
            You already submitted a report for today at <strong>{existingReport.reportTime}</strong>. Submitting again will update your figures.
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ padding: '1.5rem' }}>
          {/* Section: Auto-Filled Details */}
          <div style={{
            background: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: '12px',
            padding: '1rem',
            marginBottom: '1.25rem',
            fontSize: '0.85rem'
          }}>
            <div style={{ fontWeight: '700', color: '#0a192f', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <i className="fas fa-id-badge" style={{ color: '#2563eb' }}></i> Employee Auto-Filled Information
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '8px', color: '#475569' }}>
              <div><strong>Name:</strong> {currentUser.name}</div>
              <div><strong>Emp ID:</strong> {currentUser.empId || 'AP-EMP'}</div>
              <div><strong>Email:</strong> {currentUser.email}</div>
              <div><strong>Team:</strong> {currentUser.department || 'BDA'}</div>
              <div><strong>Date:</strong> {autoInfo.date}</div>
              <div><strong>Time:</strong> {autoInfo.time}</div>
            </div>
          </div>

          {/* Section: Performance Metrics */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '600', color: '#1e293b', marginBottom: '6px' }}>
                Total Connected Calls <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <input
                type="number"
                name="connectedCalls"
                min="0"
                value={formData.connectedCalls}
                onChange={handleChange}
                required
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: '10px',
                  border: '1px solid #cbd5e1',
                  fontSize: '0.95rem',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '600', color: '#1e293b', marginBottom: '6px' }}>
                Calls Above 3 Minutes <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <input
                type="number"
                name="callsAbove3Min"
                min="0"
                value={formData.callsAbove3Min}
                onChange={handleChange}
                required
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: '10px',
                  border: '1px solid #cbd5e1',
                  fontSize: '0.95rem',
                  boxSizing: 'border-box'
                }}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '600', color: '#1e293b', marginBottom: '6px' }}>
                Today Groups Created <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <input
                type="number"
                name="groupsCreated"
                min="0"
                value={formData.groupsCreated}
                onChange={handleChange}
                required
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: '10px',
                  border: '1px solid #cbd5e1',
                  fontSize: '0.95rem',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '600', color: '#1e293b', marginBottom: '6px' }}>
                Total Members in Groups <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <input
                type="number"
                name="membersInGroups"
                min="0"
                value={formData.membersInGroups}
                onChange={handleChange}
                required
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: '10px',
                  border: '1px solid #cbd5e1',
                  fontSize: '0.95rem',
                  boxSizing: 'border-box'
                }}
              />
            </div>
          </div>

          {/* Today's Conversion with Live Revenue Box */}
          <div style={{ marginBottom: '1.25rem' }}>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '600', color: '#1e293b', marginBottom: '6px' }}>
              Today's Conversions <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
              <input
                type="number"
                name="todayConversions"
                min="0"
                value={formData.todayConversions}
                onChange={handleChange}
                required
                style={{
                  flex: 1,
                  minWidth: '140px',
                  padding: '10px 12px',
                  borderRadius: '10px',
                  border: '1px solid #cbd5e1',
                  fontSize: '1rem',
                  fontWeight: '700',
                  color: '#0a192f',
                  boxSizing: 'border-box'
                }}
              />
              <div style={{
                background: '#eff6ff',
                border: '1px solid #bfdbfe',
                borderRadius: '10px',
                padding: '8px 14px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                flexShrink: 0
              }}>
                <span style={{ fontSize: '0.8rem', color: '#1e40af', fontWeight: '500' }}>Revenue (₹6,000/conv):</span>
                <span style={{ fontSize: '1.1rem', fontWeight: '800', color: '#2563eb' }}>
                  ₹{revenueEst.toLocaleString('en-IN')}
                </span>
              </div>
            </div>
          </div>

          {/* Remarks */}
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '600', color: '#1e293b', marginBottom: '6px' }}>
              Remarks / Highlights (Optional)
            </label>
            <textarea
              name="remarks"
              rows="3"
              value={formData.remarks}
              onChange={handleChange}
              placeholder="e.g. Conducted webinar, 3 high-intent student leads follow up scheduled tomorrow..."
              style={{
                width: '100%',
                padding: '10px 12px',
                borderRadius: '10px',
                border: '1px solid #cbd5e1',
                fontSize: '0.88rem',
                resize: 'vertical'
              }}
            />
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: '10px 20px',
                borderRadius: '10px',
                border: '1px solid #cbd5e1',
                background: '#f8fafc',
                color: '#475569',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              style={{
                padding: '10px 24px',
                borderRadius: '10px',
                border: 'none',
                background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
                color: '#ffffff',
                fontWeight: '700',
                cursor: loading ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: '0 4px 12px rgba(37, 99, 235, 0.3)'
              }}
            >
              {loading ? (
                <>
                  <i className="fas fa-spinner fa-spin"></i> Submitting...
                </>
              ) : (
                <>
                  <i className="fas fa-paper-plane"></i> {existingReport ? 'Update Report' : 'Submit Report'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default DailyReportModal
