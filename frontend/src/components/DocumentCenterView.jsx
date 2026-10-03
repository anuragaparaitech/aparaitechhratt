import React, { useState } from 'react'

function DocumentCenterView({ currentUser, showToast }) {
  const [selectedDoc, setSelectedDoc] = useState(null)
  const [activeCategory, setActiveCategory] = useState('all')

  const documentsList = [
    {
      id: 'offer-letter',
      title: 'Official Corporate Appointment & Offer Letter',
      category: 'credentials',
      type: 'Offer Letter',
      issuedDate: currentUser.joinDate || 'January 15, 2026',
      badge: 'Certified & Verified',
      icon: 'fa-file-signature',
      color: '#2563eb',
      description: 'Official corporate contract of appointment certifying roles, responsibilities, compensation structure, and NDA compliance with Aparaitech Software.'
    },
    {
      id: 'id-card',
      title: 'Company Digital Identity Card & Biometric Credential',
      category: 'credentials',
      type: 'Identity Card',
      issuedDate: currentUser.joinDate || 'January 15, 2026',
      badge: 'Active Credential',
      icon: 'fa-id-card',
      color: '#059669',
      description: 'High-security digital employee pass with scannable barcode, employee serial number, designation, and verified facial biometric status.'
    },
    {
      id: 'lor',
      title: 'Letter of Recommendation (Executive LOR)',
      category: 'credentials',
      type: 'Recommendation',
      issuedDate: 'September 30, 2026',
      badge: 'Approved by Managing Director',
      icon: 'fa-award',
      color: '#7c3aed',
      description: 'Executive recommendation certifying technical problem-solving ability, software engineering impact, and dedication to team deliverables.'
    },
    {
      id: 'experience-letter',
      title: 'Work Experience & Service Certificate',
      category: 'credentials',
      type: 'Experience Letter',
      issuedDate: 'October 01, 2026',
      badge: 'Formal Certificate',
      icon: 'fa-certificate',
      color: '#d97706',
      description: 'Formal statement of tenure, engineering accomplishments, technology stacks mastered, and active employment standing.'
    },
    {
      id: 'internship-cert',
      title: 'Software Engineering Training & Bootcamp Certificate',
      category: 'credentials',
      type: 'Certificate',
      issuedDate: 'October 02, 2026',
      badge: 'Honors Certified',
      icon: 'fa-graduation-cap',
      color: '#0284c7',
      description: 'Official certification verifying proficiency in Full Stack React, Node.js API development, MongoDB database architecture, and mobile deployment.'
    },
    {
      id: 'company-policies',
      title: 'Aparaitech Corporate Policies & Governance v2.4',
      category: 'governance',
      type: 'Company Policy',
      issuedDate: 'January 01, 2026',
      badge: 'Active Policy',
      icon: 'fa-book',
      color: '#475569',
      description: 'Comprehensive operational guidelines covering attendance discipline, data security expectations, shift schedules, and workplace ethics.'
    },
    {
      id: 'employee-handbook',
      title: 'Software Developer Handbook & Engineering Culture',
      category: 'governance',
      type: 'Handbook',
      issuedDate: 'February 10, 2026',
      badge: 'Developer Guide',
      icon: 'fa-book-open',
      color: '#0891b2',
      description: 'Standard operating manual covering git workflows, code reviews, PR templates, deployment gates, and daily standup expectations.'
    },
    {
      id: 'project-architecture',
      title: 'System Architecture & Technical Specifications',
      category: 'technical',
      type: 'Architecture Doc',
      issuedDate: 'March 15, 2026',
      badge: 'Engineering Spec',
      icon: 'fa-network-wired',
      color: '#4f46e5',
      description: 'High-level architectural blueprint of Aparaitech Cloud APIs, MongoDB schema relationships, Capacitor mobile bridge, and microservices.'
    }
  ]

  const filteredDocs = documentsList.filter(d => {
    if (activeCategory === 'all') return true
    return d.category === activeCategory
  })

  const handlePrint = () => {
    window.print()
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', width: '100%' }}>
      {/* Header Banner */}
      <div style={{
        background: 'linear-gradient(135deg, #0a192f 0%, #1e3a8a 100%)',
        borderRadius: '20px',
        padding: '1.75rem 2rem',
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
            <i className="fas fa-file-contract"></i> OFFICIAL CREDENTIALS & VAULT
          </div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: '900', margin: '0 0 4px 0', letterSpacing: '-0.02em' }}>
            Document Centre & Verified Letters
          </h1>
          <p style={{ margin: 0, fontSize: '0.82rem', color: '#93c5fd' }}>
            Instant digital access to official appointment letters, digital ID card pass, recommendation certificates, and company handbooks.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={() => setSelectedDoc(documentsList[1])} // Open ID Card
            style={{
              background: 'linear-gradient(135deg, #10b981, #059669)',
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
              boxShadow: '0 4px 12px rgba(16, 185, 129, 0.35)'
            }}
          >
            <i className="fas fa-id-card"></i>
            View Digital ID Card
          </button>
        </div>
      </div>

      {/* Category Pills */}
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
        {[
          { id: 'all', label: 'All Documents' },
          { id: 'credentials', label: '📜 Employment Letters & Credentials' },
          { id: 'governance', label: '📖 Company Policies & Handbooks' },
          { id: 'technical', label: '📐 Technical & Engineering Docs' }
        ].map(cat => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            style={{
              background: activeCategory === cat.id ? '#0a192f' : '#ffffff',
              color: activeCategory === cat.id ? '#ffffff' : '#475569',
              border: `1.5px solid ${activeCategory === cat.id ? '#0a192f' : '#e2e8f0'}`,
              borderRadius: '10px',
              padding: '8px 16px',
              fontSize: '0.8rem',
              fontWeight: '700',
              cursor: 'pointer',
              transition: 'all 0.15s'
            }}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Documents Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
        gap: '1.25rem'
      }}>
        {filteredDocs.map(doc => (
          <div
            key={doc.id}
            style={{
              background: '#ffffff',
              borderRadius: '18px',
              border: '1px solid #e2e8f0',
              padding: '1.4rem',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              gap: '12px',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
              transition: 'transform 0.2s, box-shadow 0.2s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)'
              e.currentTarget.style.boxShadow = '0 8px 18px -4px rgba(0, 0, 0, 0.1)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)'
              e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.05)'
            }}
          >
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <div style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '12px',
                  background: `${doc.color}15`,
                  color: doc.color,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.2rem'
                }}>
                  <i className={`fas ${doc.icon}`}></i>
                </div>
                <span style={{
                  fontSize: '0.72rem',
                  fontWeight: '800',
                  color: doc.color,
                  background: `${doc.color}12`,
                  padding: '3px 10px',
                  borderRadius: '999px'
                }}>
                  {doc.badge}
                </span>
              </div>

              <h3 style={{ margin: '0 0 6px 0', fontSize: '1.05rem', fontWeight: '800', color: '#0f172a', lineHeight: 1.35 }}>
                {doc.title}
              </h3>
              <p style={{ margin: 0, fontSize: '0.8rem', color: '#64748b', lineHeight: 1.5 }}>
                {doc.description}
              </p>
            </div>

            <div style={{
              paddingTop: '12px',
              borderTop: '1px solid #f1f5f9',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div style={{ fontSize: '0.72rem', color: '#64748b' }}>
                Issued: <strong>{doc.issuedDate}</strong>
              </div>

              <button
                onClick={() => setSelectedDoc(doc)}
                style={{
                  background: '#0a192f',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '7px 14px',
                  fontSize: '0.78rem',
                  fontWeight: '700',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <i className="fas fa-eye"></i> View & Print
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Document Preview & Printable Modal */}
      {selectedDoc && (
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
            maxWidth: selectedDoc.id === 'id-card' ? '440px' : '720px',
            width: '100%',
            maxHeight: '92vh',
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            border: '1px solid #e2e8f0'
          }}>
            {/* Action Bar */}
            <div style={{
              padding: '1rem 1.5rem',
              background: '#0a192f',
              color: '#ffffff',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div style={{ fontWeight: '800', fontSize: '0.9rem' }}>
                {selectedDoc.title}
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  onClick={handlePrint}
                  style={{
                    background: '#2563eb',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '6px 14px',
                    fontSize: '0.78rem',
                    fontWeight: '700',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <i className="fas fa-print"></i> Print / PDF
                </button>
                <button
                  onClick={() => setSelectedDoc(null)}
                  style={{
                    background: 'rgba(255, 255, 255, 0.1)',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '8px',
                    width: '30px',
                    height: '30px',
                    cursor: 'pointer'
                  }}
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Document Content */}
            <div style={{ padding: '2rem' }}>
              {selectedDoc.id === 'id-card' ? (
                /* ── DIGITAL EMPLOYEE ID CARD ── */
                <div style={{
                  background: 'linear-gradient(135deg, #0a192f 0%, #1e3a8a 100%)',
                  borderRadius: '20px',
                  color: '#ffffff',
                  padding: '2rem 1.75rem',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  textAlign: 'center',
                  boxShadow: '0 15px 30px rgba(0, 0, 0, 0.3)',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  position: 'relative'
                }}>
                  <div style={{ fontSize: '0.75rem', color: '#38bdf8', fontWeight: '800', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '8px' }}>
                    APARAITECH SOFTWARE COMPANY
                  </div>

                  <div style={{
                    width: '90px',
                    height: '90px',
                    borderRadius: '50%',
                    background: '#ffffff',
                    border: '3px solid #38bdf8',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: '900',
                    fontSize: '2.2rem',
                    color: '#0a192f',
                    marginBottom: '12px',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)'
                  }}>
                    {currentUser.name ? currentUser.name.charAt(0).toUpperCase() : 'A'}
                  </div>

                  <h2 style={{ margin: '0 0 2px 0', fontSize: '1.25rem', fontWeight: '900' }}>
                    {currentUser.name}
                  </h2>
                  <div style={{ fontSize: '0.82rem', color: '#93c5fd', fontWeight: '600', marginBottom: '1rem' }}>
                    {currentUser.designation || 'Software Developer'} • {currentUser.department || 'Development'}
                  </div>

                  <div style={{
                    width: '100%',
                    background: 'rgba(255, 255, 255, 0.08)',
                    borderRadius: '12px',
                    padding: '12px',
                    fontSize: '0.78rem',
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '8px',
                    textAlign: 'left',
                    marginBottom: '1rem'
                  }}>
                    <div>
                      <span style={{ color: '#94a3b8', display: 'block', fontSize: '0.68rem' }}>EMPLOYEE ID</span>
                      <strong>{currentUser.empId || 'AP-EMP'}</strong>
                    </div>
                    <div>
                      <span style={{ color: '#94a3b8', display: 'block', fontSize: '0.68rem' }}>BLOOD GROUP</span>
                      <strong>B+ Positive</strong>
                    </div>
                    <div>
                      <span style={{ color: '#94a3b8', display: 'block', fontSize: '0.68rem' }}>SHIFT SCHEDULE</span>
                      <strong>Shift 1 (07:00 AM - 11:00 AM)</strong>
                    </div>
                    <div>
                      <span style={{ color: '#94a3b8', display: 'block', fontSize: '0.68rem' }}>FACE BIOMETRIC</span>
                      <strong style={{ color: '#34d399' }}>✓ Enrolled & Verified</strong>
                    </div>
                  </div>

                  {/* Mock Barcode */}
                  <div style={{
                    background: '#ffffff',
                    padding: '8px 16px',
                    borderRadius: '8px',
                    width: '80%',
                    color: '#000000',
                    fontFamily: 'monospace',
                    letterSpacing: '4px',
                    fontWeight: '900',
                    fontSize: '0.9rem'
                  }}>
                    ||| | |||| | || | ||||
                  </div>
                  <div style={{ fontSize: '0.65rem', color: '#94a3b8', marginTop: '4px' }}>
                    SECURE AUTHORIZED CREDENTIAL
                  </div>
                </div>
              ) : (
                /* ── FORMAL LETTERHEAD VIEW ── */
                <div style={{
                  background: '#ffffff',
                  border: '1px solid #e2e8f0',
                  padding: '2.5rem',
                  borderRadius: '12px',
                  fontFamily: 'Georgia, serif',
                  color: '#1e293b',
                  lineHeight: 1.7
                }}>
                  {/* Header */}
                  <div style={{ borderBottom: '2px solid #0a192f', paddingBottom: '1rem', marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <div style={{ fontSize: '1.4rem', fontWeight: '900', color: '#0a192f', letterSpacing: '-0.02em' }}>
                        APARAITECH SOFTWARE (OPC) PVT. LTD.
                      </div>
                      <div style={{ fontSize: '0.78rem', color: '#64748b' }}>
                        Enterprise Tech Solutions & Workforce Operations • Hinjawadi Phase 1, Pune 411057
                      </div>
                    </div>
                    <div style={{ textAlign: 'right', fontSize: '0.75rem', color: '#64748b' }}>
                      <div>Ref: AP/HR/{selectedDoc.type.replace(/\s+/g, '-').toUpperCase()}</div>
                      <div>Date: {selectedDoc.issuedDate}</div>
                    </div>
                  </div>

                  {/* Body Content */}
                  <div style={{ marginBottom: '1.5rem' }}>
                    <p>To,</p>
                    <p style={{ fontWeight: 'bold', margin: '4px 0' }}>{currentUser.name}</p>
                    <p style={{ margin: 0 }}>Employee ID: {currentUser.empId || 'AP-EMP'}</p>
                    <p style={{ margin: 0 }}>Department: {currentUser.department || 'Development'}</p>
                  </div>

                  <h3 style={{ textAlign: 'center', textDecoration: 'underline', color: '#0a192f', marginBottom: '1.25rem' }}>
                    SUBJECT: {selectedDoc.title.toUpperCase()}
                  </h3>

                  <p>
                    This is an official communication issued by the Management and Human Resources Division of Aparaitech Software (OPC) Private Limited certifying that <strong>{currentUser.name}</strong> is an actively engaged software professional holding the position of <strong>{currentUser.designation || 'Software Developer'}</strong>.
                  </p>

                  <p>
                    During the tenure with Aparaitech Software, {currentUser.name} has demonstrated exemplary problem-solving skills, accountability towards daily work logs, and adherence to company coding conventions and security protocols.
                  </p>

                  <p>
                    All intellectual property, source repositories, and daily project deliverables created during this engagement remain verified under corporate confidentiality agreements.
                  </p>

                  {/* Signatures */}
                  <div style={{ marginTop: '3rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                    <div>
                      <div style={{ borderBottom: '1px solid #0f172a', width: '160px', marginBottom: '4px' }}></div>
                      <div style={{ fontWeight: 'bold', fontSize: '0.85rem' }}>Anurag Patil</div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Managing Director</div>
                      <div style={{ fontSize: '0.72rem', color: '#64748b' }}>Aparaitech Software</div>
                    </div>

                    <div style={{
                      border: '2px solid #059669',
                      borderRadius: '50%',
                      width: '75px',
                      height: '75px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      textAlign: 'center',
                      fontSize: '0.62rem',
                      fontWeight: '800',
                      color: '#059669',
                      transform: 'rotate(-10deg)'
                    }}>
                      OFFICIAL<br />SEAL<br />VERIFIED
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default DocumentCenterView
