import React, { useState } from 'react'

const PAYMENT_OPTIONS = [
  {
    id: 'onboarding',
    title: '1st Part: Onboarding Payment',
    amount: 1500,
    amountDisplay: '₹1,500',
    description: 'Initial onboarding fee. Starts the 7-day follow-up pipeline for remaining ₹4,500.',
    color: '#0284c7',
    badge: 'Stage 1'
  },
  {
    id: 'finalize',
    title: '2nd Part: Finalize Payment',
    amount: 4500,
    amountDisplay: '₹4,500',
    description: 'Final clearance payment completing the ₹6,000 product conversion.',
    color: '#16a34a',
    badge: 'Stage 2'
  },
  {
    id: 'full',
    title: 'Complete 1-Time Full Payment',
    amount: 6000,
    amountDisplay: '₹6,000',
    description: '100% full product payment paid in a single transaction.',
    color: '#7c3aed',
    badge: 'Full'
  }
]

export default function ConversionDataFillModal({ isOpen, onClose, currentUser, onSuccess, showToast }) {
  const [formData, setFormData] = useState({
    candidateName: '',
    candidateEmail: '',
    candidatePhone: '',
    collegeName: '',
    paymentType: 'onboarding',
    paymentUtr: '',
    remarks: '',
    receiptUrl: '',
    receiptName: ''
  })
  const [submitting, setSubmitting] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [filePreview, setFilePreview] = useState(null)
  const [fileType, setFileType] = useState('') // 'image' | 'pdf'
  const [fileLoading, setFileLoading] = useState(false)

  if (!isOpen) return null

  const selectedOpt = PAYMENT_OPTIONS.find(p => p.id === formData.paymentType) || PAYMENT_OPTIONS[0]

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    if (errorMsg) setErrorMsg('')
  }

  const handleFileChange = (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Limit to 10MB
    if (file.size > 10 * 1024 * 1024) {
      setErrorMsg('Receipt file size must be less than 10 MB.')
      return
    }

    setFileLoading(true)
    setErrorMsg('')
    const isImg = file.type.startsWith('image/')
    const isPdf = file.type === 'application/pdf'
    setFileType(isImg ? 'image' : isPdf ? 'pdf' : 'other')

    const reader = new FileReader()
    reader.onload = (event) => {
      const base64Data = event.target.result
      setFormData(prev => ({
        ...prev,
        receiptUrl: base64Data,
        receiptName: file.name
      }))
      setFilePreview(base64Data)
      setFileLoading(false)
    }
    reader.onerror = () => {
      setErrorMsg('Failed to read receipt file.')
      setFileLoading(false)
    }
    reader.readAsDataURL(file)
  }

  const handleRemoveFile = () => {
    setFormData(prev => ({
      ...prev,
      receiptUrl: '',
      receiptName: ''
    }))
    setFilePreview(null)
    setFileType('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErrorMsg('')

    if (!formData.candidateName.trim()) {
      setErrorMsg('Candidate Name is required.')
      return
    }
    if (!formData.candidateEmail.trim() || !formData.candidateEmail.includes('@')) {
      setErrorMsg('Valid Candidate Email ID is required.')
      return
    }
    if (!formData.candidatePhone.trim() || formData.candidatePhone.length < 10) {
      setErrorMsg('Valid 10-digit Mobile Number is required.')
      return
    }
    if (!formData.collegeName.trim()) {
      setErrorMsg('College Name is required.')
      return
    }
    if (!formData.paymentUtr.trim()) {
      setErrorMsg('Payment UTR / Transaction Reference ID is required.')
      return
    }

    try {
      setSubmitting(true)
      const token = localStorage.getItem('token')
      const res = await fetch('/api/conversions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      })

      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.message || 'Failed to submit conversion data')
      }

      if (showToast) {
        showToast(data.message || 'Product conversion logged successfully!', 'success')
      } else {
        alert(data.message || 'Product conversion logged successfully!')
      }

      setFormData({
        candidateName: '',
        candidateEmail: '',
        candidatePhone: '',
        collegeName: '',
        paymentType: 'onboarding',
        paymentUtr: '',
        remarks: '',
        receiptUrl: '',
        receiptName: ''
      })
      setFilePreview(null)
      setFileType('')

      if (onSuccess) onSuccess(data.conversion)
      onClose()
    } catch (err) {
      setErrorMsg(err.message || 'Network error submitting conversion')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(10, 25, 47, 0.75)',
      backdropFilter: 'blur(6px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 99999,
      padding: '1rem'
    }}>
      <div style={{
        background: '#ffffff',
        borderRadius: '20px',
        width: '100%',
        maxWidth: '560px',
        maxHeight: '92vh',
        overflowY: 'auto',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        border: '1px solid #e2e8f0',
        padding: '1.75rem'
      }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem' }}>
          <div>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '4px 10px',
              borderRadius: '999px',
              background: '#eff6ff',
              color: '#2563eb',
              fontSize: '0.75rem',
              fontWeight: '700',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              marginBottom: '6px'
            }}>
              ✨ Onboarding & Conversions Pipeline
            </div>
            <h2 style={{ margin: 0, fontSize: '1.4rem', fontWeight: '800', color: '#0a192f' }}>
              Log Product Conversion
            </h2>
            <p style={{ margin: '4px 0 0', fontSize: '0.85rem', color: '#64748b' }}>
              Fill in candidate details to record ₹6,000 product sales in 1 or 2 parts.
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              background: '#f1f5f9',
              border: 'none',
              borderRadius: '50%',
              width: '34px',
              height: '34px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.1rem',
              color: '#64748b'
            }}
          >
            ✕
          </button>
        </div>

        {errorMsg && (
          <div style={{
            background: '#fef2f2',
            border: '1px solid #fecaca',
            color: '#dc2626',
            padding: '10px 14px',
            borderRadius: '10px',
            fontSize: '0.85rem',
            marginBottom: '1rem',
            fontWeight: '600'
          }}>
            ⚠️ {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Payment Selection Options */}
          <div style={{ marginBottom: '1.25rem' }}>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '700', color: '#334155', marginBottom: '8px' }}>
              Select Payment Stage *
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '8px' }}>
              {PAYMENT_OPTIONS.map(opt => {
                const isSelected = formData.paymentType === opt.id
                return (
                  <div
                    key={opt.id}
                    onClick={() => setFormData(p => ({ ...p, paymentType: opt.id }))}
                    style={{
                      border: isSelected ? `2px solid ${opt.color}` : '1px solid #cbd5e1',
                      borderRadius: '12px',
                      padding: '10px 14px',
                      cursor: 'pointer',
                      background: isSelected ? '#f8fafc' : '#ffffff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      transition: 'all 0.15s'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <input
                        type="radio"
                        name="paymentType"
                        value={opt.id}
                        checked={isSelected}
                        onChange={handleChange}
                        style={{ accentColor: opt.color, cursor: 'pointer' }}
                      />
                      <div>
                        <div style={{ fontSize: '0.9rem', fontWeight: '700', color: '#0f172a' }}>
                          {opt.title}
                        </div>
                        <div style={{ fontSize: '0.74rem', color: '#64748b' }}>
                          {opt.description}
                        </div>
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <span style={{
                        display: 'inline-block',
                        padding: '4px 10px',
                        borderRadius: '8px',
                        background: opt.color,
                        color: '#ffffff',
                        fontWeight: '800',
                        fontSize: '0.88rem'
                      }}>
                        {opt.amountDisplay}
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Candidate Details Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#334155', marginBottom: '4px' }}>
                Candidate Full Name *
              </label>
              <input
                type="text"
                name="candidateName"
                value={formData.candidateName}
                onChange={handleChange}
                placeholder="e.g. Rahul Sharma"
                required
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  borderRadius: '10px',
                  border: '1px solid #cbd5e1',
                  fontSize: '0.88rem',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#334155', marginBottom: '4px' }}>
                Candidate Email ID *
              </label>
              <input
                type="email"
                name="candidateEmail"
                value={formData.candidateEmail}
                onChange={handleChange}
                placeholder="rahul.sharma@gmail.com"
                required
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  borderRadius: '10px',
                  border: '1px solid #cbd5e1',
                  fontSize: '0.88rem',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#334155', marginBottom: '4px' }}>
                Mobile Number *
              </label>
              <input
                type="tel"
                name="candidatePhone"
                value={formData.candidatePhone}
                onChange={handleChange}
                placeholder="9876543210"
                maxLength={10}
                required
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  borderRadius: '10px',
                  border: '1px solid #cbd5e1',
                  fontSize: '0.88rem',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#334155', marginBottom: '4px' }}>
                College Name *
              </label>
              <input
                type="text"
                name="collegeName"
                value={formData.collegeName}
                onChange={handleChange}
                placeholder="e.g. COEP Pune / MIT World Peace"
                required
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  borderRadius: '10px',
                  border: '1px solid #cbd5e1',
                  fontSize: '0.88rem',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
            </div>
          </div>

          {/* Payment UTR Field */}
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#334155', marginBottom: '4px' }}>
              Payment UTR / Transaction Reference ID *
            </label>
            <input
              type="text"
              name="paymentUtr"
              value={formData.paymentUtr}
              onChange={handleChange}
              placeholder="e.g. UPI/123456789012 or IMPS-493821"
              required
              style={{
                width: '100%',
                padding: '9px 12px',
                borderRadius: '10px',
                border: '1px solid #cbd5e1',
                fontSize: '0.88rem',
                outline: 'none',
                boxSizing: 'border-box',
                fontFamily: 'monospace'
              }}
            />
            <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '4px' }}>
              Enter the bank transaction UTR or receipt number proving the {selectedOpt.amountDisplay} payment.
            </div>
          </div>

          {/* Payment Receipt / Screenshot Upload Section */}
          <div style={{ marginBottom: '1.15rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
              <label style={{ fontSize: '0.82rem', fontWeight: '700', color: '#1e293b', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span>📸 Payment Screenshot / Receipt Proof</span>
                <span style={{ fontSize: '0.72rem', fontWeight: '600', color: '#0284c7', background: '#e0f2fe', padding: '1px 6px', borderRadius: '4px' }}>
                  Recommended
                </span>
              </label>
              {filePreview && (
                <button
                  type="button"
                  onClick={handleRemoveFile}
                  style={{
                    border: 'none',
                    background: 'transparent',
                    color: '#ef4444',
                    fontSize: '0.75rem',
                    fontWeight: '700',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  <i className="fas fa-trash-alt"></i> Remove
                </button>
              )}
            </div>

            {!filePreview ? (
              <label style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '16px 20px',
                border: '2px dashed #93c5fd',
                borderRadius: '12px',
                background: '#f8fafc',
                cursor: 'pointer',
                transition: 'all 0.2s',
                textAlign: 'center'
              }}>
                <input
                  type="file"
                  accept="image/png, image/jpeg, image/jpg, image/webp, application/pdf"
                  onChange={handleFileChange}
                  style={{ display: 'none' }}
                />
                <div style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '50%',
                  background: '#dbeafe',
                  color: '#2563eb',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.25rem',
                  marginBottom: '8px'
                }}>
                  <i className="fas fa-file-invoice-dollar"></i>
                </div>
                <div style={{ fontSize: '0.86rem', fontWeight: '700', color: '#1e40af', marginBottom: '2px' }}>
                  Click to Upload Payment Screenshot or Receipt
                </div>
                <div style={{ fontSize: '0.73rem', color: '#64748b' }}>
                  Supports UPI payment screenshot, Bank slip, or Receipt (PNG, JPG, WEBP, PDF up to 10MB)
                </div>
              </label>
            ) : (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '12px',
                borderRadius: '12px',
                background: '#f0fdf4',
                border: '1.5px solid #86efac'
              }}>
                {fileType === 'image' ? (
                  <img
                    src={filePreview}
                    alt="Receipt Preview"
                    style={{
                      width: '64px',
                      height: '64px',
                      objectFit: 'cover',
                      borderRadius: '8px',
                      border: '1px solid #bbf7d0',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.06)'
                    }}
                  />
                ) : (
                  <div style={{
                    width: '64px',
                    height: '64px',
                    borderRadius: '8px',
                    background: '#e0f2fe',
                    color: '#0284c7',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.75rem'
                  }}>
                    <i className="fas fa-file-pdf"></i>
                  </div>
                )}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{
                    fontSize: '0.85rem',
                    fontWeight: '700',
                    color: '#166534',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                  }}>
                    ✓ {formData.receiptName || 'Payment Receipt Attached'}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: '#15803d', marginTop: '2px' }}>
                    Payment proof attached successfully. Admin & Team can verify receipt against UTR.
                  </div>
                </div>
                <label style={{
                  padding: '6px 12px',
                  borderRadius: '8px',
                  background: '#ffffff',
                  border: '1px solid #cbd5e1',
                  color: '#334155',
                  fontSize: '0.78rem',
                  fontWeight: '700',
                  cursor: 'pointer'
                }}>
                  Change
                  <input
                    type="file"
                    accept="image/png, image/jpeg, image/jpg, image/webp, application/pdf"
                    onChange={handleFileChange}
                    style={{ display: 'none' }}
                  />
                </label>
              </div>
            )}
          </div>

          {/* Remarks */}
          <div style={{ marginBottom: '1.25rem' }}>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#334155', marginBottom: '4px' }}>
              Remarks / Campaign Notes (Optional)
            </label>
            <input
              type="text"
              name="remarks"
              value={formData.remarks}
              onChange={handleChange}
              placeholder="e.g. Referred via Campus Outreach, Interested in Cloud track"
              style={{
                width: '100%',
                padding: '9px 12px',
                borderRadius: '10px',
                border: '1px solid #cbd5e1',
                fontSize: '0.88rem',
                outline: 'none',
                boxSizing: 'border-box'
              }}
            />
          </div>

          {/* Summary Box */}
          <div style={{
            background: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: '12px',
            padding: '12px 16px',
            marginBottom: '1.25rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <div>
              <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: '700', textTransform: 'uppercase' }}>
                Revenue to Credit
              </div>
              <div style={{ fontSize: '1.25rem', fontWeight: '900', color: selectedOpt.color }}>
                {selectedOpt.amountDisplay}
              </div>
            </div>
            {formData.paymentType === 'onboarding' && (
              <div style={{ textAlign: 'right', fontSize: '0.75rem', color: '#d97706', fontWeight: '600' }}>
                ⏳ 7-Day Follow-Up Due for ₹4,500
              </div>
            )}
          </div>

          {/* Submit Buttons */}
          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                flex: 1,
                padding: '11px',
                borderRadius: '10px',
                border: '1px solid #cbd5e1',
                background: '#ffffff',
                color: '#475569',
                fontWeight: '700',
                cursor: 'pointer'
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              style={{
                flex: 2,
                padding: '11px',
                borderRadius: '10px',
                border: 'none',
                background: submitting ? '#94a3b8' : 'linear-gradient(135deg, #0284c7, #2563eb)',
                color: '#ffffff',
                fontWeight: '800',
                fontSize: '0.95rem',
                cursor: submitting ? 'not-allowed' : 'pointer',
                boxShadow: '0 4px 12px rgba(37, 99, 235, 0.25)'
              }}
            >
              {submitting ? 'Recording Conversion...' : `Submit & Credit ${selectedOpt.amountDisplay}`}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
