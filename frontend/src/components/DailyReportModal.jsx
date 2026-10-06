import React, { useState, useEffect } from 'react'
import { reportsAPI } from '../services/api'

function DailyReportModal({ isOpen, onClose, currentUser, onSuccess, showToast, targetEmployee, initialReport }) {
  const isAdmin = currentUser?.role === 'admin'

  const [formData, setFormData] = useState({
    connectedCalls: 0,
    callsAbove3Min: 0,
    groupsCreated: 0,
    membersInGroups: 0,
    onboardingConversions: 0,
    finalizeConversions: 0,
    fullConversions: 0,
    todayConversions: 0,
    remarks: ''
  })
  const [loading, setLoading] = useState(false)
  const [existingReport, setExistingReport] = useState(null)
  const [autoInfo, setAutoInfo] = useState({
    date: '',
    time: ''
  })
  const [reportDate, setReportDate] = useState('')

  const isLocked = Boolean(existingReport && !isAdmin)

  const activeEmployeeEmail = initialReport?.employeeEmail || targetEmployee?.email || currentUser?.email
  const activeEmployeeName = initialReport?.employeeName || targetEmployee?.name || currentUser?.name
  const activeEmployeeId = initialReport?.employeeId || targetEmployee?.empId || currentUser?.empId
  const activeEmployeeTeam = initialReport?.teamName || targetEmployee?.department || currentUser?.department

  const loadReportForDate = async (targetDate) => {
    try {
      const res = await reportsAPI.getTodayStatus(targetDate, activeEmployeeEmail)
      if (res.success && res.report) {
        setExistingReport(res.report)
        setFormData({
          connectedCalls: res.report.connectedCalls || 0,
          callsAbove3Min: res.report.callsAbove3Min || 0,
          groupsCreated: res.report.groupsCreated || 0,
          membersInGroups: res.report.membersInGroups || 0,
          onboardingConversions: res.report.onboardingConversions ?? 0,
          finalizeConversions: res.report.finalizeConversions ?? 0,
          fullConversions: res.report.fullConversions ?? (res.report.todayConversions && !res.report.onboardingConversions && !res.report.finalizeConversions ? res.report.todayConversions : 0),
          todayConversions: res.report.todayConversions || 0,
          remarks: res.report.remarks || ''
        })
      } else {
        setExistingReport(null)
        setFormData({
          connectedCalls: 0,
          callsAbove3Min: 0,
          groupsCreated: 0,
          membersInGroups: 0,
          onboardingConversions: 0,
          finalizeConversions: 0,
          fullConversions: 0,
          todayConversions: 0,
          remarks: ''
        })
      }
    } catch (err) {
      console.warn('Could not load report status for date:', targetDate, err.message)
    }
  }

  // Format today's date and time in IST (Asia/Kolkata)
  useEffect(() => {
    if (isOpen && currentUser) {
      if (initialReport) {
        setExistingReport(initialReport)
        setReportDate(initialReport.reportDate || '')
        setFormData({
          connectedCalls: initialReport.connectedCalls || 0,
          callsAbove3Min: initialReport.callsAbove3Min || 0,
          groupsCreated: initialReport.groupsCreated || 0,
          membersInGroups: initialReport.membersInGroups || 0,
          onboardingConversions: initialReport.onboardingConversions ?? 0,
          finalizeConversions: initialReport.finalizeConversions ?? 0,
          fullConversions: initialReport.fullConversions ?? (initialReport.todayConversions && !initialReport.onboardingConversions && !initialReport.finalizeConversions ? initialReport.todayConversions : 0),
          todayConversions: initialReport.todayConversions || 0,
          remarks: initialReport.remarks || ''
        })
        setAutoInfo({
          date: initialReport.reportDate || '',
          time: initialReport.reportTime || ''
        })
        return
      }

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
      setReportDate(dateStr)
      loadReportForDate(dateStr)
    }
  }, [isOpen, currentUser, initialReport])

  const handleDateChange = (e) => {
    const newDate = e.target.value
    if (newDate) {
      setReportDate(newDate)
      loadReportForDate(newDate)
    }
  }

  if (!isOpen || !currentUser) return null

  const handleChange = (e) => {
    if (isLocked) return
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: name === 'remarks' ? value : Math.max(0, parseInt(value, 10) || 0)
    }))
  }

  const normalizeConversionVal = (val, rate) => {
    const num = Math.max(0, parseInt(val, 10) || 0)
    if (num >= rate) {
      return num % rate === 0 ? num / rate : Math.round(num / rate)
    }
    return num
  }

  const onbCount = normalizeConversionVal(formData.onboardingConversions, 1500)
  const finCount = normalizeConversionVal(formData.finalizeConversions, 4500)
  const fullCount = normalizeConversionVal(formData.fullConversions, 6000)
  const totalConversions = onbCount + finCount + fullCount
  const revenueEst = (onbCount * 1500) + (finCount * 4500) + (fullCount * 6000)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (isLocked) {
      if (showToast) {
        showToast('🔒 Daily report has already been submitted for this date and cannot be modified. Only administrators can edit submitted reports.', '#dc2626')
      } else {
        alert('🔒 Daily report has already been submitted for this date and cannot be modified. Only administrators can edit submitted reports.')
      }
      return
    }

    setLoading(true)
    try {
      const payload = {
        ...formData,
        reportDate,
        onboardingConversions: onbCount,
        finalizeConversions: finCount,
        fullConversions: fullCount,
        todayConversions: totalConversions
      }
      if (isAdmin && (initialReport?.employeeEmail || targetEmployee?.email)) {
        payload.employeeEmail = initialReport?.employeeEmail || targetEmployee?.email
      }

      let res
      if (isAdmin && existingReport?._id) {
        res = await reportsAPI.updateByAdmin(existingReport._id, payload)
      } else {
        res = await reportsAPI.submitDaily(payload)
      }

      if (res.success) {
        if (showToast) {
          showToast(`✅ ${res.message || 'Daily report saved successfully!'}`, '#16a34a')
        } else {
          alert(`✅ ${res.message || 'Daily report saved successfully!'}`)
        }
        if (onSuccess) onSuccess(res.data)
        onClose()
      }
    } catch (err) {
      console.error(err)
      const errTxt = err.response?.data?.message || err.message || 'Submission failed'
      if (showToast) {
        showToast(`❌ ${errTxt}`, '#dc2626')
      } else {
        alert(`❌ ${errTxt}`)
      }
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

        {/* Status Alert Banners */}
        {isLocked && (
          <div style={{
            background: '#fef2f2',
            borderLeft: '4px solid #ef4444',
            padding: '12px 16px',
            margin: '1rem 1.5rem 0',
            borderRadius: '8px',
            fontSize: '0.82rem',
            color: '#991b1b',
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}>
            <i className="fas fa-lock" style={{ fontSize: '1.2rem', color: '#dc2626' }}></i>
            <div>
              <div style={{ fontWeight: '800' }}>🔒 Daily Report Submitted & Locked</div>
              <div style={{ marginTop: '2px', color: '#b91c1c' }}>
                Your daily report for <strong>{reportDate}</strong> was already submitted (filed at {existingReport.reportTime}). Employees cannot modify a submitted report. Please contact an Administrator if any corrections are needed.
              </div>
            </div>
          </div>
        )}

        {isAdmin && existingReport && (
          <div style={{
            background: '#eff6ff',
            borderLeft: '4px solid #3b82f6',
            padding: '12px 16px',
            margin: '1rem 1.5rem 0',
            borderRadius: '8px',
            fontSize: '0.82rem',
            color: '#1e40af',
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}>
            <i className="fas fa-user-shield" style={{ fontSize: '1.2rem', color: '#2563eb' }}></i>
            <div>
              <div style={{ fontWeight: '800' }}>👑 Administrator Edit Mode</div>
              <div style={{ marginTop: '2px', color: '#1d4ed8' }}>
                Editing daily report for <strong>{activeEmployeeName}</strong> on <strong>{reportDate}</strong>. As an admin, you have permission to modify and save corrections.
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ padding: '1.5rem' }}>
          {/* Section: Auto-Filled Details & Date Selector */}
          <div style={{
            background: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: '12px',
            padding: '1rem',
            marginBottom: '1.25rem',
            fontSize: '0.85rem'
          }}>
            <div style={{ fontWeight: '700', color: '#0a192f', marginBottom: '8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <i className="fas fa-id-badge" style={{ color: '#2563eb' }}></i> Employee Information
              </div>
              <span style={{ fontSize: '0.72rem', color: '#2563eb', fontWeight: '600' }}>
                📅 You can change the date below to view other dates
              </span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '8px', color: '#475569', alignItems: 'center' }}>
              <div><strong>Name:</strong> {activeEmployeeName}</div>
              <div><strong>Emp ID:</strong> {activeEmployeeId}</div>
              <div><strong>Email:</strong> {activeEmployeeEmail}</div>
              <div><strong>Team:</strong> {activeEmployeeTeam}</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <strong>Date:</strong>
                <input
                  type="date"
                  value={reportDate}
                  onChange={handleDateChange}
                  style={{
                    padding: '3px 8px',
                    borderRadius: '6px',
                    border: '1.5px solid #2563eb',
                    background: '#eff6ff',
                    fontSize: '0.82rem',
                    fontWeight: '700',
                    color: '#1e40af',
                    cursor: 'pointer'
                  }}
                  title="Select any particular date to view or submit daily report"
                />
              </div>
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
                disabled={isLocked}
                required
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: '10px',
                  border: '1px solid #cbd5e1',
                  background: isLocked ? '#f1f5f9' : '#ffffff',
                  cursor: isLocked ? 'not-allowed' : 'text',
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
                disabled={isLocked}
                required
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: '10px',
                  border: '1px solid #cbd5e1',
                  background: isLocked ? '#f1f5f9' : '#ffffff',
                  cursor: isLocked ? 'not-allowed' : 'text',
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
                disabled={isLocked}
                required
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: '10px',
                  border: '1px solid #cbd5e1',
                  background: isLocked ? '#f1f5f9' : '#ffffff',
                  cursor: isLocked ? 'not-allowed' : 'text',
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
                disabled={isLocked}
                required
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: '10px',
                  border: '1px solid #cbd5e1',
                  background: isLocked ? '#f1f5f9' : '#ffffff',
                  cursor: isLocked ? 'not-allowed' : 'text',
                  fontSize: '0.95rem',
                  boxSizing: 'border-box'
                }}
              />
            </div>
          </div>

          {/* Product Conversions & Split Revenue Model */}
          <div style={{
            marginBottom: '1.25rem',
            background: '#f8fafc',
            border: '1.5px solid #e2e8f0',
            borderRadius: '12px',
            padding: '14px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px', flexWrap: 'wrap', gap: '6px' }}>
              <label style={{ fontSize: '0.84rem', fontWeight: '700', color: '#0f172a', margin: 0 }}>
                🎯 Product Conversions Split (₹6,000 Model) <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <div style={{
                background: '#eff6ff',
                border: '1px solid #bfdbfe',
                borderRadius: '8px',
                padding: '3px 10px',
                fontSize: '0.78rem',
                fontWeight: '700',
                color: '#1d4ed8'
              }}>
                Total: {totalConversions} conversions
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '10px', marginBottom: '12px' }}>
              {/* 1st Part Onboarding */}
              <div style={{ background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '10px', padding: '9px 10px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: '700', color: '#0369a1' }}>1st Onboarding</span>
                  <span style={{ fontSize: '0.68rem', fontWeight: '800', background: '#e0f2fe', color: '#0284c7', padding: '1px 5px', borderRadius: '4px' }}>₹1,500/student</span>
                </div>
                <input
                  type="number"
                  name="onboardingConversions"
                  min="0"
                  value={formData.onboardingConversions}
                  onChange={handleChange}
                  disabled={isLocked}
                  placeholder="Count (e.g. 1)"
                  style={{
                    width: '100%',
                    padding: '8px 10px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    background: isLocked ? '#f1f5f9' : '#ffffff',
                    cursor: isLocked ? 'not-allowed' : 'text',
                    fontSize: '1rem',
                    fontWeight: '700',
                    color: '#0f172a',
                    boxSizing: 'border-box'
                  }}
                />
                <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '4px', textAlign: 'right', fontWeight: '600' }}>
                  = ₹{(onbCount * 1500).toLocaleString('en-IN')}
                </div>
                {parseInt(formData.onboardingConversions, 10) >= 1500 && (
                  <div style={{ fontSize: '0.68rem', color: '#0284c7', marginTop: '2px', fontWeight: '700', textAlign: 'right' }}>
                    ⚡ Converted to {onbCount} student{onbCount > 1 ? 's' : ''}
                  </div>
                )}
              </div>

              {/* 2nd Part Finalize */}
              <div style={{ background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '10px', padding: '9px 10px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: '700', color: '#7c3aed' }}>2nd Finalize</span>
                  <span style={{ fontSize: '0.68rem', fontWeight: '800', background: '#ede9fe', color: '#7c3aed', padding: '1px 5px', borderRadius: '4px' }}>₹4,500/student</span>
                </div>
                <input
                  type="number"
                  name="finalizeConversions"
                  min="0"
                  value={formData.finalizeConversions}
                  onChange={handleChange}
                  disabled={isLocked}
                  placeholder="Count (e.g. 1)"
                  style={{
                    width: '100%',
                    padding: '8px 10px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    background: isLocked ? '#f1f5f9' : '#ffffff',
                    cursor: isLocked ? 'not-allowed' : 'text',
                    fontSize: '1rem',
                    fontWeight: '700',
                    color: '#0f172a',
                    boxSizing: 'border-box'
                  }}
                />
                <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '4px', textAlign: 'right', fontWeight: '600' }}>
                  = ₹{(finCount * 4500).toLocaleString('en-IN')}
                </div>
                {parseInt(formData.finalizeConversions, 10) >= 4500 && (
                  <div style={{ fontSize: '0.68rem', color: '#7c3aed', marginTop: '2px', fontWeight: '700', textAlign: 'right' }}>
                    ⚡ Converted to {finCount} student{finCount > 1 ? 's' : ''}
                  </div>
                )}
              </div>

              {/* 3rd Option Full Payment */}
              <div style={{ background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '10px', padding: '9px 10px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: '700', color: '#15803d' }}>3rd Full Pay</span>
                  <span style={{ fontSize: '0.68rem', fontWeight: '800', background: '#dcfce7', color: '#16a34a', padding: '1px 5px', borderRadius: '4px' }}>₹6,000/student</span>
                </div>
                <input
                  type="number"
                  name="fullConversions"
                  min="0"
                  value={formData.fullConversions}
                  onChange={handleChange}
                  disabled={isLocked}
                  placeholder="Count (e.g. 1)"
                  style={{
                    width: '100%',
                    padding: '8px 10px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    background: isLocked ? '#f1f5f9' : '#ffffff',
                    cursor: isLocked ? 'not-allowed' : 'text',
                    fontSize: '1rem',
                    fontWeight: '700',
                    color: '#0f172a',
                    boxSizing: 'border-box'
                  }}
                />
                <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '4px', textAlign: 'right', fontWeight: '600' }}>
                  = ₹{(fullCount * 6000).toLocaleString('en-IN')}
                </div>
                {parseInt(formData.fullConversions, 10) >= 6000 && (
                  <div style={{ fontSize: '0.68rem', color: '#16a34a', marginTop: '2px', fontWeight: '700', textAlign: 'right' }}>
                    ⚡ Converted to {fullCount} student{fullCount > 1 ? 's' : ''}
                  </div>
                )}
              </div>
            </div>

            {/* Live Calculated Revenue Banner */}
            <div style={{
              background: 'linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%)',
              borderRadius: '10px',
              padding: '10px 14px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              color: '#ffffff',
              flexWrap: 'wrap',
              gap: '8px',
              boxShadow: '0 4px 10px rgba(37, 99, 235, 0.2)'
            }}>
              <div>
                <div style={{ fontSize: '0.75rem', fontWeight: '600', opacity: 0.9 }}>
                  Total Today's Revenue Recorded:
                </div>
                <div style={{ fontSize: '0.7rem', opacity: 0.8 }}>
                  ({onbCount} student{onbCount !== 1 ? 's' : ''} × ₹1.5k) + ({finCount} × ₹4.5k) + ({fullCount} × ₹6k)
                </div>
              </div>
              <div style={{ fontSize: '1.25rem', fontWeight: '900', letterSpacing: '-0.3px' }}>
                ₹{revenueEst.toLocaleString('en-IN')}
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
              disabled={isLocked}
              placeholder="e.g. Conducted webinar, 3 high-intent student leads follow up scheduled tomorrow..."
              style={{
                width: '100%',
                padding: '10px 12px',
                borderRadius: '10px',
                border: '1px solid #cbd5e1',
                background: isLocked ? '#f1f5f9' : '#ffffff',
                cursor: isLocked ? 'not-allowed' : 'text',
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
              {isLocked ? 'Close' : 'Cancel'}
            </button>
            {isLocked ? (
              <button
                type="button"
                disabled
                title="Only administrators can edit submitted reports"
                style={{
                  padding: '10px 22px',
                  borderRadius: '10px',
                  border: '1px solid #cbd5e1',
                  background: '#94a3b8',
                  color: '#ffffff',
                  fontWeight: '700',
                  cursor: 'not-allowed',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                <i className="fas fa-lock"></i> Report Locked (Submitted)
              </button>
            ) : (
              <button
                type="submit"
                disabled={loading}
                style={{
                  padding: '10px 24px',
                  borderRadius: '10px',
                  border: 'none',
                  background: isAdmin && existingReport
                    ? 'linear-gradient(135deg, #1d4ed8 0%, #1e40af 100%)'
                    : 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
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
                    <i className="fas fa-spinner fa-spin"></i> Saving...
                  </>
                ) : isAdmin && existingReport ? (
                  <>
                    <i className="fas fa-save"></i> Save Changes (Admin Update)
                  </>
                ) : (
                  <>
                    <i className="fas fa-paper-plane"></i> Submit Daily Report
                  </>
                )}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  )
}

export default DailyReportModal
