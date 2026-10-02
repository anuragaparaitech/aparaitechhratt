import React, { useState, useEffect } from 'react'

export default function ConversionPipelineView({ currentUser, showToast, onOpenAddModal }) {
  const [conversions, setConversions] = useState([])
  const [summary, setSummary] = useState(null)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterTab, setFilterTab] = useState('all') // 'all' | 'due' | 'pending' | 'completed'

  // Finalize Payment Modal State
  const [finalizeModalOpen, setFinalizeModalOpen] = useState(false)
  const [activeCandidate, setActiveCandidate] = useState(null)
  const [finalizeUtr, setFinalizeUtr] = useState('')
  const [finalizeRemarks, setFinalizeRemarks] = useState('')
  const [finalizing, setFinalizing] = useState(false)
  const [finalizeError, setFinalizeError] = useState('')
  const [finalizeReceiptUrl, setFinalizeReceiptUrl] = useState('')
  const [finalizeReceiptName, setFinalizeReceiptName] = useState('')
  const [finalizeFilePreview, setFinalizeFilePreview] = useState(null)
  const [finalizeFileType, setFinalizeFileType] = useState('')

  // Receipt Preview Modal State
  const [viewingReceipt, setViewingReceipt] = useState(null)

  const fetchConversions = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('token')
      const res = await fetch(`/api/conversions?search=${encodeURIComponent(search)}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      const result = await res.json()
      if (result.success) {
        setConversions(result.data || [])
        setSummary(result.summary || null)
      }
    } catch (err) {
      console.error('Error fetching conversions:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchConversions()
  }, [search])

  const handleOpenFinalize = (candidate) => {
    setActiveCandidate(candidate)
    setFinalizeUtr('')
    setFinalizeRemarks('')
    setFinalizeError('')
    setFinalizeReceiptUrl('')
    setFinalizeReceiptName('')
    setFinalizeFilePreview(null)
    setFinalizeFileType('')
    setFinalizeModalOpen(true)
  }

  const handleFinalizeFileChange = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 10 * 1024 * 1024) {
      setFinalizeError('File size must be under 10MB.')
      return
    }
    const isImg = file.type.startsWith('image/')
    setFinalizeFileType(isImg ? 'image' : 'pdf')
    const reader = new FileReader()
    reader.onload = (ev) => {
      setFinalizeReceiptUrl(ev.target.result)
      setFinalizeReceiptName(file.name)
      setFinalizeFilePreview(ev.target.result)
    }
    reader.readAsDataURL(file)
  }

  const handleFinalizeSubmit = async (e) => {
    e.preventDefault()
    if (!finalizeUtr.trim()) {
      setFinalizeError('Please enter the Finalize Payment UTR / Transaction Reference.')
      return
    }

    try {
      setFinalizing(true)
      const token = localStorage.getItem('token')
      const res = await fetch(`/api/conversions/${activeCandidate._id}/finalize`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          finalizeUtr: finalizeUtr.trim(),
          remarks: finalizeRemarks.trim(),
          finalizeReceiptUrl,
          finalizeReceiptName
        })
      })

      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.message || 'Failed to finalize payment')
      }

      if (showToast) {
        showToast(data.message || 'Finalize payment of ₹4,500 recorded!', 'success')
      } else {
        alert(data.message || 'Finalize payment recorded!')
      }

      setFinalizeModalOpen(false)
      setActiveCandidate(null)
      fetchConversions()
    } catch (err) {
      setFinalizeError(err.message || 'Error recording finalize payment')
    } finally {
      setFinalizing(false)
    }
  }

  // Filter list
  const filteredList = conversions.filter(item => {
    if (filterTab === 'due') return item.isDue
    if (filterTab === 'pending') return item.status === 'onboarding_pending_final'
    if (filterTab === 'completed') return item.status === 'completed'
    return true
  })

  const dueFollowUpCount = summary?.dueFollowUpsCount || conversions.filter(c => c.isDue).length

  return (
    <div style={{ padding: '0.5rem 0' }}>
      {/* ⚠️ HIGH PRIORITY 7-DAY FOLLOW-UP ALERT BANNER */}
      {dueFollowUpCount > 0 && (
        <div style={{
          background: 'linear-gradient(135deg, #fef3c7 0%, #fee2e2 100%)',
          border: '2px solid #f87171',
          borderRadius: '16px',
          padding: '1.25rem 1.5rem',
          marginBottom: '1.5rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem',
          boxShadow: '0 4px 12px rgba(239, 68, 68, 0.1)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <span style={{ fontSize: '2rem' }}>🔔</span>
            <div>
              <div style={{ fontWeight: '800', color: '#991b1b', fontSize: '1.05rem' }}>
                7-Day Finalize Payment Follow-Up Alert ({dueFollowUpCount} Candidates Due!)
              </div>
              <div style={{ color: '#7f1d1d', fontSize: '0.85rem', marginTop: '2px' }}>
                These candidates were onboarded 7+ days ago with ₹1,500 initial payment. Please follow up to collect the remaining <strong>₹4,500</strong> to complete the ₹6,000 product conversion.
              </div>
            </div>
          </div>
          <button
            onClick={() => setFilterTab('due')}
            style={{
              background: '#b91c1c',
              color: '#ffffff',
              border: 'none',
              padding: '10px 18px',
              borderRadius: '10px',
              fontWeight: '800',
              fontSize: '0.85rem',
              cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(185, 28, 28, 0.3)'
            }}
          >
            Review {dueFollowUpCount} Due Follow-Ups →
          </button>
        </div>
      )}

      {/* Top Header & Actions */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: '800', color: '#0a192f' }}>
            Product Conversions & Onboarding Pipeline
          </h2>
          <p style={{ margin: '4px 0 0', fontSize: '0.85rem', color: '#64748b' }}>
            Track 2-part product payments (₹1.5k Onboarding + ₹4.5k Finalize) & full payments (₹6k).
          </p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={fetchConversions}
            style={{
              padding: '9px 14px',
              borderRadius: '10px',
              border: '1px solid #cbd5e1',
              background: '#ffffff',
              color: '#475569',
              fontWeight: '700',
              fontSize: '0.85rem',
              cursor: 'pointer'
            }}
          >
            🔄 Refresh
          </button>
          {onOpenAddModal && (
            <button
              onClick={onOpenAddModal}
              style={{
                padding: '9px 16px',
                borderRadius: '10px',
                border: 'none',
                background: 'linear-gradient(135deg, #0284c7, #2563eb)',
                color: '#ffffff',
                fontWeight: '800',
                fontSize: '0.88rem',
                cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(37, 99, 235, 0.25)'
              }}
            >
              + Log New Conversion
            </button>
          )}
        </div>
      </div>

      {/* KPI Metric Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '1rem',
        marginBottom: '1.5rem'
      }}>
        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '1.25rem' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: '700', color: '#64748b', textTransform: 'uppercase' }}>
            Total Pipeline Revenue
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: '900', color: '#10b981', margin: '4px 0 2px' }}>
            ₹{(summary?.totalRevenue || 0).toLocaleString('en-IN')}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
            From all verified product conversions
          </div>
        </div>

        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '1.25rem' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: '700', color: '#0284c7', textTransform: 'uppercase' }}>
            1st Part: Onboardings
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: '900', color: '#0284c7', margin: '4px 0 2px' }}>
            {summary?.onboardingCount || 0}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
            Credited at ₹1,500 each
          </div>
        </div>

        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '1.25rem' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: '700', color: '#d97706', textTransform: 'uppercase' }}>
            Pending Finalize (₹4.5k)
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: '900', color: '#d97706', margin: '4px 0 2px' }}>
            {summary?.pendingFinalizeCount || 0}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
            Awaiting 2nd installment
          </div>
        </div>

        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '1.25rem' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: '700', color: '#7c3aed', textTransform: 'uppercase' }}>
            Completed Full (₹6k)
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: '900', color: '#7c3aed', margin: '4px 0 2px' }}>
            {(summary?.fullPaymentCount || 0) + (summary?.finalizedCount || 0)}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
            Full ₹6,000 product cleared
          </div>
        </div>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '12px',
        marginBottom: '1rem',
        background: '#ffffff',
        padding: '12px 16px',
        borderRadius: '14px',
        border: '1px solid #e2e8f0'
      }}>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {[
            { id: 'all', label: `All Conversions (${conversions.length})` },
            { id: 'due', label: `⚠️ 7-Day Due (${dueFollowUpCount})`, highlight: dueFollowUpCount > 0 },
            { id: 'pending', label: `Pending Finalize (${summary?.pendingFinalizeCount || 0})` },
            { id: 'completed', label: `Completed Full (${(summary?.fullPaymentCount || 0) + (summary?.finalizedCount || 0)})` }
          ].map(tab => {
            const isActive = filterTab === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => setFilterTab(tab.id)}
                style={{
                  padding: '7px 14px',
                  borderRadius: '8px',
                  border: isActive ? '1px solid #2563eb' : '1px solid #e2e8f0',
                  background: isActive ? '#2563eb' : (tab.highlight ? '#fee2e2' : '#f8fafc'),
                  color: isActive ? '#ffffff' : (tab.highlight ? '#dc2626' : '#475569'),
                  fontWeight: '700',
                  fontSize: '0.82rem',
                  cursor: 'pointer'
                }}
              >
                {tab.label}
              </button>
            )
          })}
        </div>

        <div style={{ minWidth: '240px' }}>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search candidate, phone, college, UTR..."
            style={{
              width: '100%',
              padding: '8px 12px',
              borderRadius: '8px',
              border: '1px solid #cbd5e1',
              fontSize: '0.84rem',
              outline: 'none',
              boxSizing: 'border-box'
            }}
          />
        </div>
      </div>

      {/* Candidates Table */}
      <div style={{
        background: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: '16px',
        overflow: 'hidden',
        boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
      }}>
        {loading ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: '#64748b', fontSize: '0.9rem' }}>
            Loading product conversion records...
          </div>
        ) : filteredList.length === 0 ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>
            <div style={{ fontSize: '2rem', marginBottom: '8px' }}>📋</div>
            <div style={{ fontWeight: '700', fontSize: '1rem', color: '#0f172a' }}>No conversion records found</div>
            <div style={{ fontSize: '0.82rem', marginTop: '4px' }}>
              {search ? 'Try clearing your search query.' : 'Use "+ Log New Conversion" to add candidate onboarding details.'}
            </div>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem', textAlign: 'left' }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#64748b', fontSize: '0.75rem', textTransform: 'uppercase' }}>
                  <th style={{ padding: '12px 16px' }}>Candidate</th>
                  <th style={{ padding: '12px 16px' }}>Contact & College</th>
                  <th style={{ padding: '12px 16px' }}>Payment Stage</th>
                  <th style={{ padding: '12px 16px' }}>UTR / Reference</th>
                  <th style={{ padding: '12px 16px' }}>Onboarding Date</th>
                  <th style={{ padding: '12px 16px' }}>7-Day Status</th>
                  <th style={{ padding: '12px 16px' }}>Logged By</th>
                  <th style={{ padding: '12px 16px', textAlign: 'right' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredList.map((item) => {
                  const isPendingFinal = item.status === 'onboarding_pending_final'
                  const isDue = item.isDue
                  return (
                    <tr
                      key={item._id}
                      style={{
                        borderBottom: '1px solid #f1f5f9',
                        backgroundColor: isDue ? '#fffbeb' : '#ffffff',
                        transition: 'background 0.1s'
                      }}
                    >
                      {/* Candidate */}
                      <td style={{ padding: '14px 16px' }}>
                        <div style={{ fontWeight: '800', color: '#0f172a', fontSize: '0.92rem' }}>
                          {item.candidateName}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                          ID: {item._id.substring(item._id.length - 6).toUpperCase()}
                        </div>
                      </td>

                      {/* Contact & College */}
                      <td style={{ padding: '14px 16px' }}>
                        <div style={{ fontWeight: '600', color: '#334155' }}>📞 {item.candidatePhone}</div>
                        <div style={{ fontSize: '0.78rem', color: '#64748b' }}>✉️ {item.candidateEmail}</div>
                        <div style={{ fontSize: '0.78rem', color: '#0284c7', fontWeight: '600', marginTop: '2px' }}>
                          🏫 {item.collegeName}
                        </div>
                      </td>

                      {/* Payment Stage */}
                      <td style={{ padding: '14px 16px' }}>
                        {item.paymentType === 'onboarding' ? (
                          <div>
                            <span style={{
                              display: 'inline-block',
                              padding: '3px 8px',
                              borderRadius: '6px',
                              background: '#e0f2fe',
                              color: '#0284c7',
                              fontWeight: '800',
                              fontSize: '0.75rem'
                            }}>
                              Stage 1: Onboarding
                            </span>
                            <div style={{ fontWeight: '800', color: '#0f172a', marginTop: '4px' }}>
                              Paid: ₹{item.amount?.toLocaleString('en-IN')}
                            </div>
                            {isPendingFinal && (
                              <div style={{ fontSize: '0.72rem', color: '#d97706', fontWeight: '700' }}>
                                Pending: ₹4,500
                              </div>
                            )}
                          </div>
                        ) : item.paymentType === 'finalize' ? (
                          <div>
                            <span style={{
                              display: 'inline-block',
                              padding: '3px 8px',
                              borderRadius: '6px',
                              background: '#dcfce7',
                              color: '#16a34a',
                              fontWeight: '800',
                              fontSize: '0.75rem'
                            }}>
                              Stage 2: Finalize
                            </span>
                            <div style={{ fontWeight: '800', color: '#0f172a', marginTop: '4px' }}>
                              Paid: ₹{item.amount?.toLocaleString('en-IN')}
                            </div>
                          </div>
                        ) : (
                          <div>
                            <span style={{
                              display: 'inline-block',
                              padding: '3px 8px',
                              borderRadius: '6px',
                              background: '#f3e8ff',
                              color: '#7c3aed',
                              fontWeight: '800',
                              fontSize: '0.75rem'
                            }}>
                              Full Payment (₹6k)
                            </span>
                            <div style={{ fontWeight: '800', color: '#16a34a', marginTop: '4px' }}>
                              Total: ₹6,000
                            </div>
                          </div>
                        )}
                      </td>

                      {/* UTR & Receipt Proof */}
                      <td style={{ padding: '14px 16px', fontFamily: 'monospace', fontSize: '0.82rem' }}>
                        <div style={{ color: '#0f172a', fontWeight: '700' }}>{item.paymentUtr}</div>
                        {item.finalizeUtr && (
                          <div style={{ fontSize: '0.72rem', color: '#16a34a', marginTop: '2px' }}>
                            Fin: {item.finalizeUtr}
                          </div>
                        )}
                        <div style={{ marginTop: '6px', display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                          {item.receiptUrl ? (
                            <button
                              type="button"
                              onClick={() => setViewingReceipt({
                                url: item.receiptUrl,
                                name: item.receiptName || 'Payment Receipt Proof',
                                candidate: item.candidateName,
                                stage: item.paymentType === 'onboarding' ? '1st Part Onboarding (₹1,500)' : item.paymentType === 'finalize' ? '2nd Part Finalize (₹4,500)' : 'Complete Full Payment (₹6,000)',
                                utr: item.paymentUtr,
                                date: item.onboardingDate
                              })}
                              style={{
                                padding: '3px 8px',
                                borderRadius: '6px',
                                background: '#eff6ff',
                                border: '1px solid #93c5fd',
                                color: '#1d4ed8',
                                fontSize: '0.72rem',
                                fontWeight: '700',
                                cursor: 'pointer',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px'
                              }}
                              title="Click to view payment screenshot/receipt proof"
                            >
                              <i className="fas fa-file-invoice-dollar"></i> View Receipt
                            </button>
                          ) : (
                            <span style={{ fontSize: '0.7rem', color: '#94a3b8', fontStyle: 'italic', fontFamily: 'sans-serif' }}>
                              No receipt attached
                            </span>
                          )}
                          {item.finalizeReceiptUrl && (
                            <button
                              type="button"
                              onClick={() => setViewingReceipt({
                                url: item.finalizeReceiptUrl,
                                name: item.finalizeReceiptName || 'Finalize Payment Receipt Proof',
                                candidate: item.candidateName,
                                stage: '2nd Part Finalize Payment (₹4,500)',
                                utr: item.finalizeUtr,
                                date: item.finalizeDate || item.onboardingDate
                              })}
                              style={{
                                padding: '3px 8px',
                                borderRadius: '6px',
                                background: '#ecfdf5',
                                border: '1px solid #86efac',
                                color: '#15803d',
                                fontSize: '0.72rem',
                                fontWeight: '700',
                                cursor: 'pointer',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px'
                              }}
                              title="Click to view finalize payment screenshot/receipt proof"
                            >
                              <i className="fas fa-check-double"></i> Fin Receipt
                            </button>
                          )}
                        </div>
                      </td>

                      {/* Onboarding Date */}
                      <td style={{ padding: '14px 16px' }}>
                        <div style={{ fontWeight: '600', color: '#334155' }}>{item.onboardingDate}</div>
                        <div style={{ fontSize: '0.72rem', color: '#64748b' }}>
                          Due: {item.dueDate}
                        </div>
                      </td>

                      {/* 7-Day Follow-Up Status */}
                      <td style={{ padding: '14px 16px' }}>
                        {item.status === 'completed' ? (
                          <span style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            padding: '3px 8px',
                            borderRadius: '999px',
                            background: '#dcfce7',
                            color: '#15803d',
                            fontWeight: '700',
                            fontSize: '0.72rem'
                          }}>
                            ✓ Cleared ₹6,000
                          </span>
                        ) : isDue ? (
                          <span style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            padding: '3px 8px',
                            borderRadius: '999px',
                            background: '#fee2e2',
                            color: '#b91c1c',
                            fontWeight: '800',
                            fontSize: '0.72rem',
                            border: '1px solid #f87171'
                          }}>
                            ⚠️ Follow-Up Due ({item.daysSinceOnboarding}d)
                          </span>
                        ) : (
                          <span style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            padding: '3px 8px',
                            borderRadius: '999px',
                            background: '#fef3c7',
                            color: '#b45309',
                            fontWeight: '700',
                            fontSize: '0.72rem'
                          }}>
                            ⏳ Day {item.daysSinceOnboarding}/7
                          </span>
                        )}
                      </td>

                      {/* Logged By */}
                      <td style={{ padding: '14px 16px' }}>
                        <div style={{ fontWeight: '600', color: '#334155' }}>{item.loggedByName}</div>
                        <div style={{ fontSize: '0.72rem', color: '#64748b' }}>{item.teamName}</div>
                      </td>

                      {/* Actions */}
                      <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                        {isPendingFinal ? (
                          <button
                            onClick={() => handleOpenFinalize(item)}
                            style={{
                              padding: '6px 12px',
                              borderRadius: '8px',
                              border: 'none',
                              background: '#16a34a',
                              color: '#ffffff',
                              fontWeight: '800',
                              fontSize: '0.75rem',
                              cursor: 'pointer',
                              boxShadow: '0 2px 6px rgba(22, 163, 74, 0.25)'
                            }}
                          >
                            Mark Final (₹4.5k) ✓
                          </button>
                        ) : (
                          <span style={{ fontSize: '0.75rem', color: '#16a34a', fontWeight: '700' }}>
                            ✓ Full Paid
                          </span>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Finalize Payment Modal */}
      {finalizeModalOpen && activeCandidate && (
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
          zIndex: 999999,
          padding: '1rem'
        }}>
          <div style={{
            background: '#ffffff',
            borderRadius: '20px',
            width: '100%',
            maxWidth: '460px',
            padding: '1.75rem',
            border: '1px solid #e2e8f0',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: '800', color: '#0a192f' }}>
                Complete Finalize Payment
              </h3>
              <button
                onClick={() => setFinalizeModalOpen(false)}
                style={{
                  background: '#f1f5f9',
                  border: 'none',
                  borderRadius: '50%',
                  width: '32px',
                  height: '32px',
                  cursor: 'pointer'
                }}
              >
                ✕
              </button>
            </div>

            <div style={{ background: '#f8fafc', padding: '12px 14px', borderRadius: '12px', marginBottom: '1rem', border: '1px solid #e2e8f0' }}>
              <div style={{ fontWeight: '800', color: '#0f172a' }}>{activeCandidate.candidateName}</div>
              <div style={{ fontSize: '0.78rem', color: '#64748b' }}>
                📞 {activeCandidate.candidatePhone} • 🏫 {activeCandidate.collegeName}
              </div>
              <div style={{ marginTop: '8px', display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem' }}>
                <span style={{ color: '#0284c7', fontWeight: '700' }}>Initial Paid: ₹1,500</span>
                <span style={{ color: '#16a34a', fontWeight: '800' }}>Final Amount Due: ₹4,500</span>
              </div>
            </div>

            {finalizeError && (
              <div style={{ background: '#fef2f2', color: '#dc2626', padding: '8px 12px', borderRadius: '8px', fontSize: '0.82rem', marginBottom: '1rem', fontWeight: '600' }}>
                ⚠️ {finalizeError}
              </div>
            )}

            <form onSubmit={handleFinalizeSubmit}>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#334155', marginBottom: '4px' }}>
                  Finalize Payment UTR / Transaction ID *
                </label>
                <input
                  type="text"
                  value={finalizeUtr}
                  onChange={(e) => setFinalizeUtr(e.target.value)}
                  placeholder="e.g. UPI/987654321012"
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
              </div>

              {/* Finalize Payment Receipt Upload */}
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#334155', marginBottom: '4px' }}>
                  Finalize Payment Receipt / Screenshot (Optional)
                </label>
                {!finalizeFilePreview ? (
                  <label style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    padding: '10px 14px',
                    border: '1.5px dashed #cbd5e1',
                    borderRadius: '10px',
                    background: '#f8fafc',
                    cursor: 'pointer',
                    fontSize: '0.82rem',
                    color: '#475569'
                  }}>
                    <input
                      type="file"
                      accept="image/*,application/pdf"
                      onChange={handleFinalizeFileChange}
                      style={{ display: 'none' }}
                    />
                    <i className="fas fa-camera" style={{ color: '#2563eb' }}></i>
                    <span>Attach ₹4,500 receipt screenshot</span>
                  </label>
                ) : (
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '8px 12px',
                    background: '#f0fdf4',
                    border: '1px solid #86efac',
                    borderRadius: '8px'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', color: '#166534', fontWeight: '700' }}>
                      <i className="fas fa-check-circle"></i>
                      <span>{finalizeReceiptName || 'Receipt Attached'}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setFinalizeReceiptUrl('')
                        setFinalizeReceiptName('')
                        setFinalizeFilePreview(null)
                      }}
                      style={{ border: 'none', background: 'transparent', color: '#ef4444', fontSize: '0.75rem', cursor: 'pointer', fontWeight: '700' }}
                    >
                      Remove
                    </button>
                  </div>
                )}
              </div>

              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#334155', marginBottom: '4px' }}>
                  Closing Remarks (Optional)
                </label>
                <input
                  type="text"
                  value={finalizeRemarks}
                  onChange={(e) => setFinalizeRemarks(e.target.value)}
                  placeholder="e.g. Cleared via Google Pay, batch assigned"
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

              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  type="button"
                  onClick={() => setFinalizeModalOpen(false)}
                  style={{
                    flex: 1,
                    padding: '10px',
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
                  disabled={finalizing}
                  style={{
                    flex: 2,
                    padding: '10px',
                    borderRadius: '10px',
                    border: 'none',
                    background: '#16a34a',
                    color: '#ffffff',
                    fontWeight: '800',
                    cursor: finalizing ? 'not-allowed' : 'pointer'
                  }}
                >
                  {finalizing ? 'Recording...' : 'Confirm ₹4,500 Received ✓'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Receipt / Screenshot Full Preview Modal ── */}
      {viewingReceipt && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(15, 23, 42, 0.82)',
          backdropFilter: 'blur(6px)',
          zIndex: 999999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '16px'
        }}>
          <div style={{
            background: '#ffffff',
            borderRadius: '16px',
            maxWidth: '650px',
            width: '100%',
            maxHeight: '92vh',
            display: 'flex',
            flexDirection: 'column',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35)',
            overflow: 'hidden'
          }}>
            {/* Modal Header */}
            <div style={{
              padding: '14px 20px',
              borderBottom: '1px solid #e2e8f0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              background: '#f8fafc'
            }}>
              <div>
                <div style={{ fontWeight: '800', color: '#0f172a', fontSize: '1.05rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <i className="fas fa-file-invoice-dollar" style={{ color: '#2563eb' }}></i>
                  <span>Payment Receipt / Screenshot</span>
                </div>
                <div style={{ fontSize: '0.76rem', color: '#64748b', marginTop: '2px' }}>
                  Candidate: <strong>{viewingReceipt.candidate}</strong> • {viewingReceipt.stage}
                </div>
              </div>
              <button
                type="button"
                onClick={() => setViewingReceipt(null)}
                style={{
                  background: '#f1f5f9',
                  border: 'none',
                  borderRadius: '50%',
                  width: '32px',
                  height: '32px',
                  fontSize: '1rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#64748b'
                }}
              >
                ✕
              </button>
            </div>

            {/* Info Strip */}
            <div style={{
              padding: '10px 20px',
              background: '#eff6ff',
              borderBottom: '1px solid #bfdbfe',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              fontSize: '0.82rem'
            }}>
              <div>
                <span style={{ color: '#1e40af', fontWeight: '600' }}>UTR / Ref ID: </span>
                <code style={{ background: '#ffffff', padding: '2px 8px', borderRadius: '4px', border: '1px solid #cbd5e1', fontWeight: '800', color: '#0f172a' }}>
                  {viewingReceipt.utr}
                </code>
              </div>
              {viewingReceipt.date && (
                <div style={{ color: '#64748b', fontSize: '0.78rem' }}>
                  📅 {viewingReceipt.date}
                </div>
              )}
            </div>

            {/* Image / File Viewer Area */}
            <div style={{
              flex: 1,
              padding: '16px',
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              background: '#0f172a',
              minHeight: '300px'
            }}>
              {viewingReceipt.url.startsWith('data:image/') || viewingReceipt.url.match(/\.(jpeg|jpg|gif|png|webp)($|\?)/i) ? (
                <img
                  src={viewingReceipt.url}
                  alt={viewingReceipt.name || 'Payment Receipt'}
                  style={{
                    maxWidth: '100%',
                    maxHeight: '62vh',
                    objectFit: 'contain',
                    borderRadius: '8px',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.5)'
                  }}
                />
              ) : viewingReceipt.url.startsWith('data:application/pdf') ? (
                <iframe
                  src={viewingReceipt.url}
                  title="PDF Receipt"
                  style={{ width: '100%', height: '58vh', border: 'none', borderRadius: '8px', background: '#ffffff' }}
                />
              ) : (
                <div style={{ textAlign: 'center', padding: '20px', color: '#ffffff' }}>
                  <i className="fas fa-file-alt" style={{ fontSize: '3rem', color: '#94a3b8', marginBottom: '10px' }}></i>
                  <div style={{ fontWeight: '700' }}>{viewingReceipt.name || 'Document Receipt'}</div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div style={{
              padding: '12px 20px',
              borderTop: '1px solid #e2e8f0',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              background: '#ffffff'
            }}>
              <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                📄 {viewingReceipt.name || 'Receipt Document'}
              </span>
              <div style={{ display: 'flex', gap: '8px' }}>
                <a
                  href={viewingReceipt.url}
                  download={viewingReceipt.name || 'payment-receipt.png'}
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    padding: '8px 14px',
                    borderRadius: '8px',
                    background: '#2563eb',
                    color: '#ffffff',
                    fontWeight: '700',
                    fontSize: '0.82rem',
                    textDecoration: 'none',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <i className="fas fa-download"></i> Open / Download Full
                </a>
                <button
                  type="button"
                  onClick={() => setViewingReceipt(null)}
                  style={{
                    padding: '8px 14px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    background: '#ffffff',
                    color: '#475569',
                    fontWeight: '700',
                    fontSize: '0.82rem',
                    cursor: 'pointer'
                  }}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
