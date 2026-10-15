import React, { useState, useEffect } from 'react'
import { conversionsAPI } from '../services/api'
import ConversionDataFillModal from './ConversionDataFillModal'

// Reusable Official Pune Rubber Stamp Component matching Aparaitech Official Seal (Pune 411057)
export const AparaitechStamp = ({ size = 76, style = {} }) => (
  <div style={{ position: 'relative', width: size, height: size, display: 'inline-block', ...style }}>
    {/* Transparent Authentic Stamp Image */}
    <img
      src="/aparaitech_pune_stamp.png"
      alt="Aparaitech Software Pune 411057 Official Seal"
      style={{
        width: '100%',
        height: '100%',
        objectFit: 'contain',
        transform: 'rotate(-8deg)',
        filter: 'drop-shadow(0 2px 5px rgba(0,27,148,0.3))',
        display: 'block'
      }}
      onError={(e) => {
        e.target.style.display = 'none'
        const svgEl = e.target.nextElementSibling
        if (svgEl) svgEl.style.display = 'block'
      }}
    />
    {/* Precise Vector SVG Fallback */}
    <svg
      viewBox="0 0 320 320"
      width={size}
      height={size}
      style={{ display: 'none', transform: 'rotate(-8deg)', filter: 'drop-shadow(0 2px 4px rgba(0,27,148,0.25))' }}
    >
      <defs>
        <path id="stampArcTop" d="M 44,160 A 116,116 0 1,1 276,160" fill="none" />
        <path id="stampArcBottom" d="M 276,160 A 116,116 0 1,1 44,160" fill="none" />
      </defs>
      <g stroke="#001b94" fill="#001b94">
        <circle cx="160" cy="160" r="154" fill="#ffffff" fillOpacity="0.92" stroke="#001b94" strokeWidth="5" />
        <circle cx="160" cy="160" r="145" fill="none" stroke="#001b94" strokeWidth="2" />
        <circle cx="160" cy="160" r="92" fill="none" stroke="#001b94" strokeWidth="3.5" />
        <text fontFamily="'Arial Black', Impact, sans-serif" fontSize="30" fontWeight="900" fill="#001b94">
          <textPath href="#stampArcTop" startOffset="50%" textAnchor="middle">Aparaitech</textPath>
        </text>
        <text x="44" y="167" fontFamily="'Arial', sans-serif" fontSize="24" textAnchor="middle" fill="#001b94">★</text>
        <text x="276" y="167" fontFamily="'Arial', sans-serif" fontSize="24" textAnchor="middle" fill="#001b94">★</text>
        <text fontFamily="'Arial Black', Impact, sans-serif" fontSize="28" fontWeight="900" fill="#001b94">
          <textPath href="#stampArcBottom" startOffset="50%" textAnchor="middle">Software</textPath>
        </text>
        <text x="160" y="146" fontFamily="'Arial Black', Impact, Georgia, sans-serif" fontSize="52" fontWeight="900" textAnchor="middle" fill="#001b94">Pune</text>
        <text x="160" y="196" fontFamily="'Arial Black', Impact, sans-serif" fontSize="34" fontWeight="900" letterSpacing="2" textAnchor="middle" fill="#001b94">411057</text>
      </g>
    </svg>
  </div>
)

// Reusable 3D Isometric Cube Logo Component
export const AparaitechLogoCube = ({ size = 26 }) => (
  <svg width={size} height={size} viewBox="0 0 36 36" fill="none">
    <path d="M18 2L33 10.5V25.5L18 34L3 25.5V10.5L18 2Z" fill="#0D9488" stroke="#115E59" strokeWidth="2" />
    <path d="M18 2L33 10.5L18 19L3 10.5L18 2Z" fill="#14B8A6" />
    <path d="M18 19V34L3 25.5V10.5L18 19Z" fill="#0F766E" />
    <path d="M18 19L33 10.5V25.5L18 34V19Z" fill="#2DD4BF" />
  </svg>
)

// Reusable Crisp Vector Barcode Component
export const VectorBarcode = ({ height = 36, width = 200, color = '#000000' }) => (
  <svg width={width} height={height} viewBox="0 0 200 40" style={{ display: 'inline-block' }}>
    <rect x="0" y="0" width="3" height="40" fill={color} />
    <rect x="5" y="0" width="2" height="40" fill={color} />
    <rect x="10" y="0" width="5" height="40" fill={color} />
    <rect x="18" y="0" width="2" height="40" fill={color} />
    <rect x="23" y="0" width="4" height="40" fill={color} />
    <rect x="30" y="0" width="6" height="40" fill={color} />
    <rect x="39" y="0" width="2" height="40" fill={color} />
    <rect x="44" y="0" width="4" height="40" fill={color} />
    <rect x="52" y="0" width="3" height="40" fill={color} />
    <rect x="58" y="0" width="6" height="40" fill={color} />
    <rect x="67" y="0" width="2" height="40" fill={color} />
    <rect x="72" y="0" width="5" height="40" fill={color} />
    <rect x="80" y="0" width="3" height="40" fill={color} />
    <rect x="86" y="0" width="4" height="40" fill={color} />
    <rect x="93" y="0" width="6" height="40" fill={color} />
    <rect x="102" y="0" width="2" height="40" fill={color} />
    <rect x="107" y="0" width="5" height="40" fill={color} />
    <rect x="115" y="0" width="3" height="40" fill={color} />
    <rect x="121" y="0" width="4" height="40" fill={color} />
    <rect x="128" y="0" width="6" height="40" fill={color} />
    <rect x="137" y="0" width="2" height="40" fill={color} />
    <rect x="142" y="0" width="5" height="40" fill={color} />
    <rect x="150" y="0" width="3" height="40" fill={color} />
    <rect x="156" y="0" width="6" height="40" fill={color} />
    <rect x="165" y="0" width="3" height="40" fill={color} />
    <rect x="171" y="0" width="5" height="40" fill={color} />
    <rect x="179" y="0" width="2" height="40" fill={color} />
    <rect x="184" y="0" width="4" height="40" fill={color} />
    <rect x="191" y="0" width="6" height="40" fill={color} />
    <rect x="198" y="0" width="2" height="40" fill={color} />
  </svg>
)

export default function IdCardTab({ currentUser, showToast }) {
  const [conversions, setConversions] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterPayment, setFilterPayment] = useState('all')
  const [filterIdStatus, setFilterIdStatus] = useState('all')
  const [filterDueOnly, setFilterDueOnly] = useState(false)

  // Modals state
  const [selectedCandidate, setSelectedCandidate] = useState(null)
  const [isIdModalOpen, setIsIdModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [editData, setEditData] = useState(null)
  const [sendingMailId, setSendingMailId] = useState(null)
  const [sendingReminderId, setSendingReminderId] = useState(null)
  const [activeCardSide, setActiveCardSide] = useState('both') // 'front' | 'back' | 'both'

  // Fetch conversions
  const fetchConversions = async () => {
    try {
      setLoading(true)
      const res = await conversionsAPI.getAll()
      setConversions(res.data || [])
    } catch (err) {
      console.error('Error fetching candidate conversions:', err)
      if (showToast) showToast('Failed to load candidate onboarding records', '#ef4444')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchConversions()
  }, [])

  // Approve & Send ID Card Email
  const handleApproveAndSend = async (candidate) => {
    if (!candidate || !candidate._id) return
    try {
      setSendingMailId(candidate._id)
      const res = await conversionsAPI.sendIdCard(candidate._id, {
        designation: candidate.designation || 'Software Developer Intern',
        idCardNumber: candidate.idCardNumber || 'APT-IN-7081',
        candidatePhoto: candidate.candidatePhoto || ''
      })

      if (showToast) {
        showToast(res.message || `ID Card approved and sent to ${candidate.candidateEmail}!`, '#22c55e')
      } else {
        alert(res.message || 'ID Card sent successfully!')
      }

      // Update local state
      setConversions(prev => prev.map(c => c._id === candidate._id ? { ...c, idCardApproved: true, idCardSent: true, idCardSentAt: new Date() } : c))
      if (selectedCandidate?._id === candidate._id) {
        setSelectedCandidate(prev => ({ ...prev, idCardApproved: true, idCardSent: true, idCardSentAt: new Date() }))
      }
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Failed to send ID Card email'
      if (showToast) showToast(msg, '#ef4444')
      else alert(msg)
    } finally {
      setSendingMailId(null)
    }
  }

  // Send 7-Day Payment Due Reminder Email
  const handleSendPaymentReminder = async (candidate) => {
    if (!candidate || !candidate._id) return
    try {
      setSendingReminderId(candidate._id)
      const res = await conversionsAPI.sendPaymentReminder(candidate._id)

      if (showToast) {
        showToast(res.message || `Payment due reminder email sent to ${candidate.candidateEmail}!`, '#22c55e')
      } else {
        alert(res.message || 'Payment reminder sent successfully!')
      }

      setConversions(prev => prev.map(c => c._id === candidate._id ? { ...c, paymentReminderSent: true, paymentReminderSentAt: new Date() } : c))
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Failed to send payment reminder email'
      if (showToast) showToast(msg, '#ef4444')
      else alert(msg)
    } finally {
      setSendingReminderId(null)
    }
  }

  // Send batch reminders for all candidates with 7+ days due
  const handleSendAllDueReminders = async () => {
    const dueCandidates = conversions.filter(c => c.isDue)
    if (dueCandidates.length === 0) {
      if (showToast) showToast('No candidates currently due for 7-day payment reminder.', '#3b82f6')
      return
    }

    if (!window.confirm(`Are you sure you want to send 7-day payment due reminder emails to all ${dueCandidates.length} due candidate(s)?`)) {
      return
    }

    let successCount = 0
    for (const cand of dueCandidates) {
      try {
        await conversionsAPI.sendPaymentReminder(cand._id)
        successCount++
      } catch (e) {
        console.error('Failed reminder for', cand.candidateName, e)
      }
    }

    if (showToast) {
      showToast(`Dispatched ${successCount} payment reminder emails from hr.aparaitechh@gmail.com!`, '#22c55e')
    }
    fetchConversions()
  }

  // Filter records
  const filteredRecords = conversions.filter(item => {
    const s = search.toLowerCase()
    const matchesSearch = !s ||
      item.candidateName?.toLowerCase().includes(s) ||
      item.candidateEmail?.toLowerCase().includes(s) ||
      item.candidatePhone?.toLowerCase().includes(s) ||
      item.collegeName?.toLowerCase().includes(s) ||
      item.idCardNumber?.toLowerCase().includes(s) ||
      item.paymentUtr?.toLowerCase().includes(s)

    const matchesPayment = filterPayment === 'all' ||
      (filterPayment === 'onboarding' && item.paymentType === 'onboarding') ||
      (filterPayment === 'completed' && item.status === 'completed')

    const matchesId = filterIdStatus === 'all' ||
      (filterIdStatus === 'sent' && item.idCardSent) ||
      (filterIdStatus === 'pending' && !item.idCardSent)

    const matchesDue = !filterDueOnly || item.isDue

    return matchesSearch && matchesPayment && matchesId && matchesDue
  })

  // Calculations for KPIs
  const totalOnboarded = conversions.length
  const idCardsSentCount = conversions.filter(c => c.idCardSent).length
  const idCardsPendingCount = conversions.filter(c => !c.idCardSent).length
  const paymentDueCount = conversions.filter(c => c.isDue).length

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      
      {/* ── TOP BANNER & ACTION HEADER ─────────────────────────────────────── */}
      <div style={{
        background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 40%, #7c3aed 100%)',
        borderRadius: '18px',
        padding: '1.5rem 1.75rem',
        color: '#ffffff',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '1rem',
        boxShadow: '0 10px 25px rgba(49, 46, 129, 0.35)',
        border: '1px solid rgba(255, 255, 255, 0.12)'
      }}>
        <div>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            background: 'rgba(255, 255, 255, 0.15)',
            padding: '4px 12px',
            borderRadius: '20px',
            fontSize: '0.74rem',
            fontWeight: '800',
            letterSpacing: '0.6px',
            textTransform: 'uppercase',
            marginBottom: '8px'
          }}>
            <span>🪪 Official Credential Verification System</span>
            <span style={{ background: '#10b981', color: '#fff', padding: '1px 7px', borderRadius: '10px' }}>
              hr.aparaitechh@gmail.com
            </span>
          </div>
          <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: '900', letterSpacing: '-0.02em' }}>
            Candidate ID Card Generation & Onboarding Log
          </h2>
          <p style={{ margin: '4px 0 0', fontSize: '0.85rem', color: '#c7d2fe' }}>
            Store candidate data with photos, generate verified dual-sided internship ID cards, and dispatch 7-day milestone balance reminders.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <button
            onClick={() => {
              setEditData(null)
              setIsEditModalOpen(true)
            }}
            style={{
              background: '#ffffff',
              color: '#312e81',
              border: 'none',
              padding: '10px 18px',
              borderRadius: '10px',
              fontWeight: '800',
              fontSize: '0.86rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
              transition: 'all 0.2s'
            }}
          >
            <span>➕</span> New Candidate Onboarding
          </button>

          {paymentDueCount > 0 && (
            <button
              onClick={handleSendAllDueReminders}
              style={{
                background: '#f59e0b',
                color: '#ffffff',
                border: 'none',
                padding: '10px 16px',
                borderRadius: '10px',
                fontWeight: '800',
                fontSize: '0.86rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                boxShadow: '0 4px 12px rgba(245, 158, 11, 0.3)'
              }}
            >
              <span>⏰</span> Send All ({paymentDueCount}) Due Reminders
            </button>
          )}
        </div>
      </div>

      {/* ── KPI METRICS CARDS ────────────────────────────────────────────── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '1rem'
      }}>
        {/* Metric 1 */}
        <div style={{
          background: '#ffffff',
          borderRadius: '16px',
          padding: '1.2rem',
          border: '1px solid #e2e8f0',
          boxShadow: '0 2px 8px rgba(0,0,0,0.03)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748b', fontSize: '0.78rem', fontWeight: '700' }}>
            <span>TOTAL ONBOARDED CANDIDATES</span>
            <i className="fas fa-user-graduate" style={{ color: '#6366f1' }}></i>
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: '900', color: '#0f172a', marginTop: '6px' }}>
            {totalOnboarded}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '4px' }}>
            All candidate log records in system
          </div>
        </div>

        {/* Metric 2 */}
        <div style={{
          background: '#ffffff',
          borderRadius: '16px',
          padding: '1.2rem',
          border: '1px solid #e2e8f0',
          boxShadow: '0 2px 8px rgba(0,0,0,0.03)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748b', fontSize: '0.78rem', fontWeight: '700' }}>
            <span>ID CARDS APPROVED & SENT</span>
            <i className="fas fa-id-badge" style={{ color: '#10b981' }}></i>
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: '900', color: '#059669', marginTop: '6px' }}>
            {idCardsSentCount}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#16a34a', marginTop: '4px' }}>
            Dispatched via hr.aparaitechh@gmail.com
          </div>
        </div>

        {/* Metric 3 */}
        <div style={{
          background: '#ffffff',
          borderRadius: '16px',
          padding: '1.2rem',
          border: '1px solid #e2e8f0',
          boxShadow: '0 2px 8px rgba(0,0,0,0.03)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748b', fontSize: '0.78rem', fontWeight: '700' }}>
            <span>PENDING ID APPROVALS</span>
            <i className="fas fa-clock" style={{ color: '#8b5cf6' }}></i>
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: '900', color: '#7c3aed', marginTop: '6px' }}>
            {idCardsPendingCount}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '4px' }}>
            Ready to review, approve & email
          </div>
        </div>

        {/* Metric 4 */}
        <div style={{
          background: paymentDueCount > 0 ? '#fffbeb' : '#ffffff',
          borderRadius: '16px',
          padding: '1.2rem',
          border: paymentDueCount > 0 ? '1.5px solid #fde68a' : '1px solid #e2e8f0',
          boxShadow: '0 2px 8px rgba(0,0,0,0.03)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: paymentDueCount > 0 ? '#b45309' : '#64748b', fontSize: '0.78rem', fontWeight: '700' }}>
            <span>7-DAY PAYMENT REMINDERS DUE</span>
            <i className="fas fa-exclamation-circle" style={{ color: paymentDueCount > 0 ? '#d97706' : '#94a3b8' }}></i>
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: '900', color: paymentDueCount > 0 ? '#d97706' : '#0f172a', marginTop: '6px' }}>
            {paymentDueCount}
          </div>
          <div style={{ fontSize: '0.75rem', color: paymentDueCount > 0 ? '#b45309' : '#64748b', marginTop: '4px' }}>
            {paymentDueCount > 0 ? '₹4,500 balance clearance overdue' : 'All balances up-to-date'}
          </div>
        </div>
      </div>

      {/* ── FILTER CONTROLS BAR ─────────────────────────────────────────── */}
      <div style={{
        background: '#ffffff',
        borderRadius: '14px',
        padding: '14px 18px',
        border: '1px solid #e2e8f0',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '12px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: '1', minWidth: '260px' }}>
          <div style={{ position: 'relative', width: '100%' }}>
            <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }}>🔍</span>
            <input
              type="text"
              placeholder="Search candidate name, college, email, phone, ID number, UTR..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                width: '100%',
                padding: '9px 12px 9px 36px',
                borderRadius: '10px',
                border: '1px solid #cbd5e1',
                fontSize: '0.85rem',
                outline: 'none',
                boxSizing: 'border-box'
              }}
            />
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          {/* Payment filter */}
          <select
            value={filterPayment}
            onChange={(e) => setFilterPayment(e.target.value)}
            style={{
              padding: '8px 12px',
              borderRadius: '8px',
              border: '1px solid #cbd5e1',
              fontSize: '0.82rem',
              fontWeight: '600',
              color: '#334155',
              outline: 'none'
            }}
          >
            <option value="all">All Payment Stages</option>
            <option value="onboarding">Stage 1: Onboarding Only (₹1.5k)</option>
            <option value="completed">Stage 2: Full Paid (₹6k)</option>
          </select>

          {/* ID Status filter */}
          <select
            value={filterIdStatus}
            onChange={(e) => setFilterIdStatus(e.target.value)}
            style={{
              padding: '8px 12px',
              borderRadius: '8px',
              border: '1px solid #cbd5e1',
              fontSize: '0.82rem',
              fontWeight: '600',
              color: '#334155',
              outline: 'none'
            }}
          >
            <option value="all">All ID Card Statuses</option>
            <option value="pending">⏳ Pending ID Approval</option>
            <option value="sent">✅ ID Card Sent</option>
          </select>

          {/* Toggle 7-Day Due Only */}
          <button
            onClick={() => setFilterDueOnly(prev => !prev)}
            style={{
              padding: '8px 14px',
              borderRadius: '8px',
              border: filterDueOnly ? '1.5px solid #d97706' : '1px solid #cbd5e1',
              background: filterDueOnly ? '#fef3c7' : '#ffffff',
              color: filterDueOnly ? '#b45309' : '#475569',
              fontSize: '0.82rem',
              fontWeight: '700',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '5px'
            }}
          >
            <span>⏰</span> 7-Day Reminders Due
          </button>

          <button
            onClick={fetchConversions}
            title="Refresh list"
            style={{
              padding: '8px 12px',
              borderRadius: '8px',
              border: '1px solid #cbd5e1',
              background: '#f8fafc',
              cursor: 'pointer',
              color: '#475569',
              fontSize: '0.85rem'
            }}
          >
            🔄 Refresh
          </button>
        </div>
      </div>

      {/* ── CANDIDATE CARDS LIST ─────────────────────────────────────────── */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: '#64748b', fontSize: '0.95rem' }}>
          ⏳ Loading candidate onboarding records...
        </div>
      ) : filteredRecords.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '3.5rem',
          background: '#ffffff',
          borderRadius: '16px',
          border: '1px dashed #cbd5e1',
          color: '#64748b'
        }}>
          <div style={{ fontSize: '2rem', marginBottom: '8px' }}>🪪</div>
          <div style={{ fontSize: '1rem', fontWeight: '700', color: '#0f172a' }}>No Candidate Onboardings Found</div>
          <div style={{ fontSize: '0.84rem', marginTop: '4px' }}>
            {search || filterPayment !== 'all' || filterIdStatus !== 'all' || filterDueOnly
              ? 'Try adjusting your filters or search query.'
              : 'Click "+ New Candidate Onboarding" to record your first candidate with photo and generate an ID card.'}
          </div>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '12px' }}>
          {filteredRecords.map((cand) => {
            const hasPhoto = !!cand.candidatePhoto
            const photoSrc = hasPhoto ? cand.candidatePhoto : null
            const isDue = cand.isDue
            const isSent = cand.idCardSent

            return (
              <div
                key={cand._id}
                style={{
                  background: '#ffffff',
                  borderRadius: '16px',
                  border: isDue ? '1.5px solid #fcd34d' : '1px solid #e2e8f0',
                  padding: '16px 20px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '16px',
                  boxShadow: '0 2px 10px rgba(0,0,0,0.02)',
                  transition: 'all 0.2s'
                }}
              >
                {/* Left: Avatar + Details */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', minWidth: '280px', flex: '1.5' }}>
                  {/* Photo Thumbnail */}
                  <div style={{
                    width: '60px',
                    height: '60px',
                    borderRadius: '50%',
                    flexShrink: 0,
                    overflow: 'hidden',
                    border: '3px solid #8b5cf6',
                    boxShadow: '0 3px 8px rgba(139, 92, 246, 0.25)',
                    background: '#ede9fe',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    {photoSrc ? (
                      <img src={photoSrc} alt={cand.candidateName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <span style={{ fontSize: '1.5rem', color: '#7c3aed' }}>👤</span>
                    )}
                  </div>

                  {/* Info text */}
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                      <span style={{ fontSize: '1.05rem', fontWeight: '800', color: '#0f172a' }}>
                        {cand.candidateName}
                      </span>
                      <span style={{
                        background: '#ede9fe',
                        color: '#6d28d9',
                        fontSize: '0.72rem',
                        fontWeight: '700',
                        padding: '2px 8px',
                        borderRadius: '6px'
                      }}>
                        {cand.designation || 'Software Developer Intern'}
                      </span>
                      <span style={{
                        background: '#f1f5f9',
                        color: '#475569',
                        fontSize: '0.72rem',
                        fontWeight: '700',
                        padding: '2px 8px',
                        borderRadius: '6px',
                        fontFamily: 'monospace'
                      }}>
                        {cand.idCardNumber || 'APT-IN-7081'}
                      </span>
                    </div>

                    <div style={{ fontSize: '0.8rem', color: '#475569', marginTop: '3px' }}>
                      🏛️ <strong>{cand.collegeName}</strong>
                    </div>

                    <div style={{ fontSize: '0.76rem', color: '#64748b', marginTop: '3px', display: 'flex', gap: '14px', flexWrap: 'wrap' }}>
                      <span>✉️ {cand.candidateEmail}</span>
                      <span>📞 {cand.candidatePhone}</span>
                      <span>UTR: <code style={{ color: '#0f172a', fontWeight: '700' }}>{cand.paymentUtr}</code></span>
                    </div>
                  </div>
                </div>

                {/* Middle: Onboarding & Payment Status */}
                <div style={{ minWidth: '180px', flex: '1' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <span style={{
                      padding: '3px 10px',
                      borderRadius: '8px',
                      fontSize: '0.76rem',
                      fontWeight: '800',
                      background: cand.paymentType === 'onboarding' ? '#fef3c7' : '#dcfce7',
                      color: cand.paymentType === 'onboarding' ? '#b45309' : '#15803d'
                    }}>
                      {cand.paymentType === 'onboarding' ? '₹1.5k Onboarding (₹4.5k Due)' : '₹6,000 Full Paid'}
                    </span>

                    {/* ID Card Status Badge */}
                    <span style={{
                      padding: '3px 10px',
                      borderRadius: '8px',
                      fontSize: '0.74rem',
                      fontWeight: '800',
                      background: isSent ? '#dbeafe' : '#f3e8ff',
                      color: isSent ? '#1d4ed8' : '#7c3aed'
                    }}>
                      {isSent ? '✅ ID Card Sent' : '⏳ ID Pending Approval'}
                    </span>
                  </div>

                  <div style={{ fontSize: '0.74rem', color: '#64748b' }}>
                    Onboarded: <strong>{cand.onboardingDate}</strong>
                    {cand.paymentType === 'onboarding' && (
                      <span style={{ marginLeft: '6px' }}>
                        • Due: <strong style={{ color: isDue ? '#dc2626' : '#b45309' }}>{cand.dueDate}</strong>
                        {isDue && (
                          <span style={{
                            marginLeft: '6px',
                            background: '#fee2e2',
                            color: '#dc2626',
                            padding: '1px 6px',
                            borderRadius: '4px',
                            fontWeight: '800'
                          }}>
                            {cand.daysSinceOnboarding} days ago!
                          </span>
                        )}
                      </span>
                    )}
                  </div>
                </div>

                {/* Right: Actions */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                  {/* View ID Card */}
                  <button
                    onClick={() => {
                      setSelectedCandidate(cand)
                      setIsIdModalOpen(true)
                    }}
                    style={{
                      background: 'linear-gradient(135deg, #7c3aed, #6d28d9)',
                      color: '#ffffff',
                      border: 'none',
                      padding: '8px 14px',
                      borderRadius: '8px',
                      fontSize: '0.8rem',
                      fontWeight: '700',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '5px',
                      boxShadow: '0 2px 8px rgba(124, 58, 237, 0.25)'
                    }}
                  >
                    <span>🪪</span> View ID Card
                  </button>

                  {/* Edit Form */}
                  <button
                    onClick={() => {
                      setEditData(cand)
                      setIsEditModalOpen(true)
                    }}
                    style={{
                      background: '#ffffff',
                      border: '1px solid #cbd5e1',
                      color: '#334155',
                      padding: '8px 12px',
                      borderRadius: '8px',
                      fontSize: '0.8rem',
                      fontWeight: '700',
                      cursor: 'pointer'
                    }}
                  >
                    ✏️ Edit
                  </button>

                  {/* 7-Day Payment Reminder (for onboarding pending final) */}
                  {cand.status === 'onboarding_pending_final' && (
                    <button
                      onClick={() => handleSendPaymentReminder(cand)}
                      disabled={sendingReminderId === cand._id}
                      style={{
                        background: isDue ? '#fef3c7' : '#f8fafc',
                        border: isDue ? '1px solid #f59e0b' : '1px solid #cbd5e1',
                        color: isDue ? '#b45309' : '#475569',
                        padding: '8px 12px',
                        borderRadius: '8px',
                        fontSize: '0.8rem',
                        fontWeight: '700',
                        cursor: sendingReminderId === cand._id ? 'not-allowed' : 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '5px'
                      }}
                      title="Send 7-Day Payment Due Reminder email through hr.aparaitechh@gmail.com"
                    >
                      <span>⏰</span> {sendingReminderId === cand._id ? 'Sending...' : 'Send Reminder'}
                    </button>
                  )}
                </div>

              </div>
            )
          })}
        </div>
      )}

      {/* ── MODAL 1: VIEW & APPROVE ID CARD MODAL ───────────────────────── */}
      {isIdModalOpen && selectedCandidate && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.8)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 999999,
          padding: '1rem'
        }}>
          <div style={{
            background: '#ffffff',
            borderRadius: '22px',
            width: '100%',
            maxWidth: '780px',
            maxHeight: '94vh',
            overflowY: 'auto',
            padding: '2rem',
            boxShadow: '0 25px 60px rgba(0,0,0,0.3)',
            border: '1px solid #cbd5e1'
          }}>
            {/* Modal Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem' }}>
              <div>
                <span style={{
                  background: '#ede9fe',
                  color: '#6d28d9',
                  fontSize: '0.74rem',
                  fontWeight: '800',
                  padding: '3px 10px',
                  borderRadius: '12px',
                  textTransform: 'uppercase'
                }}>
                  Official Dual-Sided ID Card
                </span>
                <h2 style={{ margin: '6px 0 0', fontSize: '1.35rem', fontWeight: '900', color: '#0f172a' }}>
                  {selectedCandidate.candidateName} — {selectedCandidate.idCardNumber || 'APT-IN-7081'}
                </h2>
                <p style={{ margin: '3px 0 0', fontSize: '0.82rem', color: '#64748b' }}>
                  Verify front and back designs before approving and emailing through <strong>hr.aparaitechh@gmail.com</strong>.
                </p>
              </div>

              {/* Close Button */}
              <button
                onClick={() => setIsIdModalOpen(false)}
                style={{
                  background: '#f1f5f9',
                  border: 'none',
                  borderRadius: '50%',
                  width: '36px',
                  height: '36px',
                  fontSize: '1.2rem',
                  cursor: 'pointer',
                  color: '#64748b',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                ✕
              </button>
            </div>

            {/* Toggle Side view buttons */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginBottom: '1.5rem' }}>
              {['both', 'front', 'back'].map(side => (
                <button
                  key={side}
                  onClick={() => setActiveCardSide(side)}
                  style={{
                    padding: '6px 14px',
                    borderRadius: '20px',
                    border: activeCardSide === side ? '1px solid #7c3aed' : '1px solid #cbd5e1',
                    background: activeCardSide === side ? '#7c3aed' : '#ffffff',
                    color: activeCardSide === side ? '#ffffff' : '#475569',
                    fontSize: '0.78rem',
                    fontWeight: '700',
                    cursor: 'pointer',
                    textTransform: 'capitalize'
                  }}
                >
                  {side === 'both' ? 'Both Sides' : `${side} Side`}
                </button>
              ))}
            </div>

            {/* ID Cards Layout (Side by Side or Selected) */}
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              gap: '24px',
              flexWrap: 'wrap',
              marginBottom: '1.75rem'
            }}>
              
              {/* ── 1. FRONT CARD ── */}
              {(activeCardSide === 'both' || activeCardSide === 'front') && (
                <div style={{
                  width: '300px',
                  height: '520px',
                  borderRadius: '20px',
                  overflow: 'hidden',
                  background: '#ffffff',
                  boxShadow: '0 12px 35px rgba(0,0,0,0.18)',
                  border: '1px solid #cbd5e1',
                  display: 'flex',
                  flexDirection: 'column',
                  position: 'relative',
                  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
                }}>
                  {/* Top Lavender Curve */}
                  <div style={{
                    background: 'linear-gradient(135deg, #818cf8 0%, #a78bfa 100%)',
                    height: '140px',
                    padding: '18px 16px',
                    textAlign: 'center',
                    borderBottomLeftRadius: '50% 25px',
                    borderBottomRightRadius: '50% 25px',
                    position: 'relative'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                      <AparaitechLogoCube size={26} />
                      <span style={{ fontSize: '18px', fontWeight: '900', letterSpacing: '1px', color: '#000000' }}>
                        APARAITECH
                      </span>
                    </div>
                  </div>

                  {/* Circular Candidate Photo */}
                  <div style={{ textAlign: 'center', marginTop: '-55px', position: 'relative', zIndex: 2 }}>
                    <div style={{
                      width: '106px',
                      height: '106px',
                      borderRadius: '50%',
                      margin: '0 auto',
                      border: '4px solid #ffffff',
                      boxShadow: '0 6px 18px rgba(0,0,0,0.2)',
                      overflow: 'hidden',
                      background: '#ede9fe',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      {selectedCandidate.candidatePhoto ? (
                        <img
                          src={selectedCandidate.candidatePhoto}
                          alt={selectedCandidate.candidateName}
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                      ) : (
                        <span style={{ fontSize: '3rem', color: '#7c3aed' }}>👤</span>
                      )}
                    </div>
                  </div>

                  {/* Candidate Name */}
                  <div style={{ textAlign: 'center', padding: '10px 14px 2px 14px' }}>
                    <div style={{ fontSize: '17px', fontWeight: '900', color: '#0f172a', lineHeight: '1.2' }}>
                      {selectedCandidate.candidateName}
                    </div>
                  </div>

                  {/* Designation Pill */}
                  <div style={{ textAlign: 'center', margin: '8px 20px' }}>
                    <div style={{
                      background: '#c4b5fd',
                      color: '#1e1b4b',
                      fontSize: '12px',
                      fontWeight: '800',
                      padding: '6px 16px',
                      borderRadius: '20px',
                      display: 'inline-block'
                    }}>
                      {selectedCandidate.designation || 'Software Developer Intern'}
                    </div>
                  </div>

                  {/* Info List */}
                  <div style={{ padding: '12px 22px 6px 22px', fontSize: '12.5px', position: 'relative', flex: '1' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
                      <tbody>
                        <tr>
                          <td style={{ fontWeight: '800', color: '#000000', padding: '5px 0', width: '65px' }}>ID No</td>
                          <td style={{ color: '#0f172a', fontWeight: '700', padding: '5px 0' }}>
                            {selectedCandidate.idCardNumber || 'APT-IN-7081'}
                          </td>
                        </tr>
                        <tr>
                          <td style={{ fontWeight: '800', color: '#000000', padding: '5px 0' }}>Email</td>
                          <td style={{ color: '#0f172a', fontWeight: '500', padding: '5px 0', wordBreak: 'break-all' }}>
                            {selectedCandidate.candidateEmail}
                          </td>
                        </tr>
                        <tr>
                          <td style={{ fontWeight: '800', color: '#000000', padding: '5px 0' }}>Phone</td>
                          <td style={{ color: '#0f172a', fontWeight: '700', padding: '5px 0' }}>
                            {selectedCandidate.candidatePhone}
                          </td>
                        </tr>
                      </tbody>
                    </table>

                    {/* Blue Official Stamp on Bottom Right */}
                    <div style={{ position: 'absolute', right: '10px', bottom: '-4px' }}>
                      <AparaitechStamp size={78} />
                    </div>
                  </div>

                  {/* Barcode & Bottom Accents */}
                  <div style={{
                    background: '#ffffff',
                    textAlign: 'center',
                    padding: '8px 12px 14px 12px',
                    position: 'relative'
                  }}>
                    {/* Bottom corner lavender shapes */}
                    <div style={{ position: 'absolute', left: 0, bottom: 0, width: '36px', height: '36px', background: '#a78bfa', borderRadius: '0 30px 0 20px' }}></div>
                    <div style={{ position: 'absolute', right: 0, bottom: 0, width: '36px', height: '36px', background: '#a78bfa', borderRadius: '30px 0 20px 0' }}></div>

                    {/* Vector Barcode */}
                    <VectorBarcode height={38} width={220} />
                  </div>
                </div>
              )}

              {/* ── 2. BACK CARD ── */}
              {(activeCardSide === 'both' || activeCardSide === 'back') && (
                <div style={{
                  width: '300px',
                  height: '520px',
                  borderRadius: '20px',
                  overflow: 'hidden',
                  background: 'linear-gradient(180deg, #818cf8 0%, #7c3aed 100%)',
                  boxShadow: '0 12px 35px rgba(0,0,0,0.18)',
                  border: '1px solid #7c3aed',
                  color: '#ffffff',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
                }}>
                  {/* Top Header & Barcode Number */}
                  <div style={{ padding: '18px 16px 8px 16px', textAlign: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                      <AparaitechLogoCube size={24} />
                      <span style={{ fontSize: '18px', fontWeight: '900', letterSpacing: '1px', color: '#ffffff' }}>
                        APARAITECH
                      </span>
                    </div>
                    <div style={{ fontSize: '10px', color: '#ede9fe', fontFamily: 'monospace', marginTop: '4px', letterSpacing: '1px' }}>
                      {selectedCandidate.barcodeNumber || '2431000320445474'}
                    </div>
                  </div>

                  {/* Terms & Conditions Body */}
                  <div style={{ padding: '8px 20px', fontSize: '11px', lineHeight: '1.5' }}>
                    <div style={{
                      fontSize: '13px',
                      fontWeight: '900',
                      textTransform: 'uppercase',
                      letterSpacing: '0.8px',
                      marginBottom: '10px',
                      textAlign: 'center',
                      color: '#ffffff'
                    }}>
                      TERMS & CONDITIONS
                    </div>

                    <div style={{ marginBottom: '8px' }}>
                      • <strong>Identification:</strong> Carry the ID card at all times during working hours for identification purposes.
                    </div>

                    <div style={{ marginBottom: '10px' }}>
                      • <strong>Authorized Use:</strong> The ID card is strictly for official use and should not be shared or used for unauthorized purposes.
                    </div>

                    <div style={{
                      background: 'rgba(255, 255, 255, 0.15)',
                      borderRadius: '8px',
                      padding: '8px 12px',
                      marginBottom: '12px'
                    }}>
                      <div><strong>Join:</strong> {selectedCandidate.joinDate || selectedCandidate.onboardingDate}</div>
                      <div><strong>Expire:</strong> {selectedCandidate.expireDate || '15/04/2027'}</div>
                    </div>

                    <div style={{ fontSize: '9px', color: '#e0e7ff', lineHeight: '1.35', textAlign: 'center' }}>
                      122, Gera Imperial Rise, Hinjewadi Phase 2, Wipro Circle, Pune - 411057
                    </div>
                  </div>

                  {/* Bottom Cutout with Barcode */}
                  <div style={{
                    background: '#ffffff',
                    color: '#000000',
                    textAlign: 'center',
                    padding: '16px 14px 10px 14px',
                    clipPath: 'polygon(0 20%, 50% 0, 100% 20%, 100% 100%, 0 100%)'
                  }}>
                    <VectorBarcode height={34} width={210} color="#000000" />
                    <div style={{ fontSize: '10.5px', fontWeight: '800', color: '#475569', marginTop: '4px' }}>
                      info@ai.aparaitech.org
                    </div>
                  </div>
                </div>
              )}

            </div>

            {/* Modal Bottom Action Bar */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              paddingTop: '16px',
              borderTop: '1px solid #e2e8f0',
              flexWrap: 'wrap',
              gap: '12px'
            }}>
              <div style={{ fontSize: '0.82rem', color: '#64748b' }}>
                Sender: <strong>hr.aparaitechh@gmail.com</strong> • Status: {selectedCandidate.idCardSent ? '✅ Sent' : '⏳ Pending'}
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  onClick={() => {
                    setIsIdModalOpen(false)
                    setEditData(selectedCandidate)
                    setIsEditModalOpen(true)
                  }}
                  style={{
                    padding: '10px 16px',
                    borderRadius: '10px',
                    border: '1px solid #cbd5e1',
                    background: '#ffffff',
                    color: '#334155',
                    fontSize: '0.86rem',
                    fontWeight: '700',
                    cursor: 'pointer'
                  }}
                >
                  ✏️ Edit Details / Photo
                </button>

                <button
                  onClick={() => handleApproveAndSend(selectedCandidate)}
                  disabled={sendingMailId === selectedCandidate._id}
                  style={{
                    padding: '10px 22px',
                    borderRadius: '10px',
                    border: 'none',
                    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                    color: '#ffffff',
                    fontSize: '0.9rem',
                    fontWeight: '800',
                    cursor: sendingMailId === selectedCandidate._id ? 'not-allowed' : 'pointer',
                    boxShadow: '0 4px 14px rgba(16, 185, 129, 0.3)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <span>✉️</span>
                  {sendingMailId === selectedCandidate._id
                    ? 'Approving & Sending...'
                    : (selectedCandidate.idCardSent ? 'Resend ID Card Mail' : 'Approve & Send Mail')}
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* ── MODAL 2: EDIT / NEW ONBOARDING DATA WITH PHOTO MODAL ────────── */}
      {isEditModalOpen && (
        <ConversionDataFillModal
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false)
            setEditData(null)
          }}
          currentUser={currentUser}
          editData={editData}
          onSuccess={() => {
            fetchConversions()
            if (showToast) showToast('Onboarding data saved successfully!', '#22c55e')
          }}
          showToast={showToast}
        />
      )}

    </div>
  )
}
