import React, { useState, useEffect } from 'react'
import { reportsAPI } from '../services/api'

// Pre-defined list of common affiliated colleges for quick selection
const POPULAR_COLLEGES = [
  'COEP Technological University, Pune',
  'MIT World Peace University (MIT-WPU)',
  'Vishwakarma Institute of Technology (VIT Pune)',
  'Pimpri Chinchwad College of Engineering (PCCOE)',
  'Cummins College of Engineering for Women',
  'Sinhgad College of Engineering (SCOE)',
  'DY Patil College of Engineering, Akurdi',
  'AISSMS College of Engineering',
  'Bharati Vidyapeeth Deemed University, Pune',
  'JSPM Rajarshi Shahu College of Engineering',
  'Army Institute of Technology (AIT Pune)',
  'Symbiosis Institute of Technology (SIT Pune)',
  'Other / Custom College'
]

// Common templates
const POPULAR_TEMPLATES = [
  'Tech & BDA Product Outreach Drive',
  'Web & Cloud Engineering Product Outreach',
  'Corporate Training & Placement Offer',
  'College TPO Campus Connect Proposal',
  'Custom / Direct Outreach Template'
]

function MailBlastModal({ isOpen, onClose, currentUser, onSuccess, showToast }) {
  const [formData, setFormData] = useState({
    emailsSent: 0,
    targetType: 'Random',
    collegeName: '',
    templateUsed: POPULAR_TEMPLATES[0],
    responsesReceived: 0,
    bounceCount: 0,
    status: 'Completed',
    remarks: ''
  })
  const [loading, setLoading] = useState(false)
  const [customCollege, setCustomCollege] = useState('')
  const [autoInfo, setAutoInfo] = useState({ date: '', time: '' })

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
      setFormData({
        emailsSent: 0,
        targetType: 'Random',
        collegeName: '',
        templateUsed: POPULAR_TEMPLATES[0],
        responsesReceived: 0,
        bounceCount: 0,
        status: 'Completed',
        remarks: ''
      })
      setCustomCollege('')
    }
  }, [isOpen, currentUser])

  if (!isOpen || !currentUser) return null

  const handleChange = (e) => {
    const { name, value } = e.target
    if (['emailsSent', 'responsesReceived', 'bounceCount'].includes(name)) {
      setFormData(prev => ({
        ...prev,
        [name]: Math.max(0, parseInt(value, 10) || 0)
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    let finalCollege = formData.collegeName
    if (formData.targetType === 'College-wise') {
      if (formData.collegeName === 'Other / Custom College') {
        finalCollege = customCollege.trim()
      }
      if (!finalCollege) {
        showToast('⚠️ Please specify or select a college name for college-wise blast', '#f59e0b')
        setLoading(false)
        return
      }
    } else {
      finalCollege = ''
    }

    try {
      const payload = {
        ...formData,
        collegeName: finalCollege
      }
      const res = await reportsAPI.submitMailBlast(payload)
      if (res.success) {
        showToast(`✅ ${res.message || 'Mail blast report logged successfully!'}`, '#16a34a')
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
          background: 'linear-gradient(135deg, #0a192f 0%, #0369a1 100%)',
          padding: '1.25rem 1.75rem',
          borderRadius: '20px 20px 0 0',
          color: '#ffffff',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: '700', letterSpacing: '-0.02em' }}>
              <i className="fas fa-paper-plane" style={{ marginRight: '10px', color: '#38bdf8' }}></i>
              Mail Blast Campaign Report
            </h3>
            <p style={{ margin: '4px 0 0', fontSize: '0.82rem', color: '#bae6fd' }}>
              Aparaitech Outreach & Email Marketing Metrics
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
              <i className="fas fa-id-badge" style={{ color: '#0284c7' }}></i> Sender Auto-Filled Information
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '8px', color: '#475569' }}>
              <div><strong>Name:</strong> {currentUser.name}</div>
              <div><strong>Emp ID:</strong> {currentUser.empId || 'AP-EMP'}</div>
              <div><strong>Team:</strong> {currentUser.department || 'Outreach'}</div>
              <div><strong>Date:</strong> {autoInfo.date}</div>
              <div><strong>Time:</strong> {autoInfo.time}</div>
            </div>
          </div>

          {/* Section: Target Configuration */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '600', color: '#1e293b', marginBottom: '6px' }}>
                Target Type <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <select
                name="targetType"
                value={formData.targetType}
                onChange={handleChange}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: '10px',
                  border: '1px solid #cbd5e1',
                  fontSize: '0.92rem',
                  background: '#ffffff',
                  boxSizing: 'border-box'
                }}
              >
                <option value="Random">Random / Open Audience</option>
                <option value="College-wise">College-wise Targeted</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '600', color: '#1e293b', marginBottom: '6px' }}>
                Campaign Status <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: '10px',
                  border: '1px solid #cbd5e1',
                  fontSize: '0.92rem',
                  background: '#ffffff',
                  boxSizing: 'border-box'
                }}
              >
                <option value="Completed">Completed</option>
                <option value="Pending">In-Progress / Pending</option>
              </select>
            </div>
          </div>

          {/* Conditional College Dropdown */}
          {formData.targetType === 'College-wise' && (
            <div style={{ marginBottom: '1rem', background: '#f0fdf4', padding: '12px', borderRadius: '10px', border: '1px solid #bbf7d0' }}>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '600', color: '#166534', marginBottom: '6px' }}>
                Select Targeted College <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <select
                name="collegeName"
                value={formData.collegeName}
                onChange={handleChange}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: '10px',
                  border: '1px solid #86efac',
                  fontSize: '0.92rem',
                  marginBottom: formData.collegeName === 'Other / Custom College' ? '8px' : '0'
                }}
              >
                <option value="">-- Select College --</option>
                {POPULAR_COLLEGES.map(col => (
                  <option key={col} value={col}>{col}</option>
                ))}
              </select>

              {formData.collegeName === 'Other / Custom College' && (
                <input
                  type="text"
                  placeholder="Enter college or university name..."
                  value={customCollege}
                  onChange={(e) => setCustomCollege(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.9rem'
                  }}
                />
              )}
            </div>
          )}

          {/* Template Selection */}
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '600', color: '#1e293b', marginBottom: '6px' }}>
              Email Template Used <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <input
              type="text"
              name="templateUsed"
              list="templatesList"
              value={formData.templateUsed}
              onChange={handleChange}
              placeholder="Select or type template name..."
              required
              style={{
                width: '100%',
                padding: '10px 12px',
                borderRadius: '10px',
                border: '1px solid #cbd5e1',
                fontSize: '0.92rem'
              }}
            />
            <datalist id="templatesList">
              {POPULAR_TEMPLATES.map(t => (
                <option key={t} value={t} />
              ))}
            </datalist>
          </div>

          {/* Metrics: Sent, Responses, Bounces */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '10px', marginBottom: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', color: '#1e293b', marginBottom: '6px' }}>
                Total Emails Sent <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <input
                type="number"
                name="emailsSent"
                min="0"
                value={formData.emailsSent}
                onChange={handleChange}
                required
                style={{
                  width: '100%',
                  padding: '9px 10px',
                  borderRadius: '10px',
                  border: '1px solid #cbd5e1',
                  fontSize: '0.95rem',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', color: '#1e293b', marginBottom: '6px' }}>
                Responses Got
              </label>
              <input
                type="number"
                name="responsesReceived"
                min="0"
                value={formData.responsesReceived}
                onChange={handleChange}
                style={{
                  width: '100%',
                  padding: '9px 10px',
                  borderRadius: '10px',
                  border: '1px solid #cbd5e1',
                  fontSize: '0.95rem',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', color: '#1e293b', marginBottom: '6px' }}>
                Bounce Count
              </label>
              <input
                type="number"
                name="bounceCount"
                min="0"
                value={formData.bounceCount}
                onChange={handleChange}
                style={{
                  width: '100%',
                  padding: '9px 10px',
                  borderRadius: '10px',
                  border: '1px solid #cbd5e1',
                  fontSize: '0.95rem',
                  boxSizing: 'border-box'
                }}
              />
            </div>
          </div>

          {/* Remarks */}
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '600', color: '#1e293b', marginBottom: '6px' }}>
              Remarks & Campaign Notes
            </label>
            <textarea
              name="remarks"
              rows="2"
              value={formData.remarks}
              onChange={handleChange}
              placeholder="e.g. Sent in 2 batches of 250 via SendGrid, follow up slated for 48 hours..."
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
                background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
                color: '#ffffff',
                fontWeight: '700',
                cursor: loading ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: '0 4px 12px rgba(2, 132, 199, 0.3)'
              }}
            >
              {loading ? (
                <>
                  <i className="fas fa-spinner fa-spin"></i> Saving...
                </>
              ) : (
                <>
                  <i className="fas fa-check-circle"></i> Submit Mail Blast Report
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default MailBlastModal
