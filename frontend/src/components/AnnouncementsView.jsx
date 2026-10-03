import React, { useState, useEffect } from 'react'
import { announcementAPI } from '../services/api'

function AnnouncementsView({ currentUser, showToast }) {
  const [announcements, setAnnouncements] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeCategory, setActiveCategory] = useState('All')
  const [isComposeOpen, setIsComposeOpen] = useState(false)

  // Compose Form
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [category, setCategory] = useState('Team')
  const [targetTeam, setTargetTeam] = useState('Development')
  const [priority, setPriority] = useState('Normal')
  const [isPinned, setIsPinned] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const isManagerOrAdmin = currentUser.role === 'admin' || currentUser.role === 'manager' || currentUser.email === 'anunand2004@gmail.com'

  useEffect(() => {
    fetchAnnouncements()
  }, [])

  const fetchAnnouncements = async () => {
    setLoading(true)
    try {
      const res = await announcementAPI.getAll()
      if (res.success) {
        setAnnouncements(res.data || [])
      }
    } catch (err) {
      console.error('Error fetching announcements:', err)
      // Provide initial fallback announcements if empty
      setAnnouncements([
        {
          _id: 'ann-1',
          title: '🚀 Release of Aparaitech Work Portal v2.0 for Software Engineers',
          content: 'We are thrilled to launch the dedicated Software Team Work Portal! Developers, interns, and engineers can now manage their daily work, sprint tasks, milestones, GitHub commits, and daily reports from this unified desktop & mobile portal.',
          category: 'Team',
          targetTeam: 'Development',
          priority: 'Urgent',
          isPinned: true,
          postedBy: 'Anurag Nand (Technical Lead)',
          createdAt: new Date().toISOString()
        },
        {
          _id: 'ann-2',
          title: '⏰ Shift 1 Timing & 7:00 PM Daily Work Report Reminders',
          content: 'All Software Developers and Interns are reminded of Shift 1 timing (07:00 AM - 11:00 AM). Please ensure your Daily Work Report is submitted before the 07:00 PM deadline every evening with today’s completed tasks, hours, and tomorrow’s plan.',
          category: 'Policy',
          targetTeam: 'Development',
          priority: 'Important',
          isPinned: true,
          postedBy: 'Management',
          createdAt: new Date(Date.now() - 3600000 * 24).toISOString()
        },
        {
          _id: 'ann-3',
          title: '🏆 October Engineering Sprint Goal: Capacitor Android Mobile Build Sync',
          content: 'Great work on rebuilding the native Android APK with immersive styling and overscroll control. The APK is now accessible for direct download from the mobile button on your dashboard.',
          category: 'Technical',
          targetTeam: 'Development',
          priority: 'Normal',
          isPinned: false,
          postedBy: 'Administrator',
          createdAt: new Date(Date.now() - 3600000 * 48).toISOString()
        }
      ])
    } finally {
      setLoading(false)
    }
  }

  const handleCompose = async (e) => {
    e.preventDefault()
    if (!title.trim() || !content.trim()) {
      showToast('⚠️ Title and content are required', '#f59e0b')
      return
    }

    setSubmitting(true)
    try {
      const res = await announcementAPI.create({
        title: title.trim(),
        content: content.trim(),
        category,
        targetTeam,
        priority,
        isPinned,
        postedBy: currentUser.name
      })

      if (res.success) {
        showToast('📢 Announcement published successfully!', '#10b981')
        setAnnouncements(prev => [res.data, ...prev])
        setIsComposeOpen(false)
        setTitle('')
        setContent('')
      } else {
        showToast(`❌ ${res.message || 'Failed to post announcement'}`, '#ef4444')
      }
    } catch (err) {
      console.error('Compose announcement error:', err)
      showToast(`❌ ${err.response?.data?.message || err.message}`, '#ef4444')
    } finally {
      setSubmitting(false)
    }
  }

  const filteredAnnouncements = announcements.filter(a => {
    if (activeCategory === 'All') return true
    return a.category === activeCategory
  })

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
            <i className="fas fa-bullhorn"></i> COMPANY & TEAM NOTICES
          </div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: '900', margin: '0 0 4px 0', letterSpacing: '-0.02em' }}>
            Official Bulletins & Technical Updates
          </h1>
          <p style={{ margin: 0, fontSize: '0.82rem', color: '#93c5fd' }}>
            Corporate holiday schedules, software engineering milestones, and security updates.
          </p>
        </div>

        {isManagerOrAdmin && (
          <button
            onClick={() => setIsComposeOpen(true)}
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
            <i className="fas fa-pen-alt"></i>
            Post Announcement
          </button>
        )}
      </div>

      {/* Category Pills */}
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
        {['All', 'Team', 'Company', 'Technical', 'Policy', 'Holiday'].map(cat => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            style={{
              background: activeCategory === cat ? '#0a192f' : '#ffffff',
              color: activeCategory === cat ? '#ffffff' : '#64748b',
              border: `1.5px solid ${activeCategory === cat ? '#0a192f' : '#e2e8f0'}`,
              borderRadius: '10px',
              padding: '7px 16px',
              fontSize: '0.8rem',
              fontWeight: '700',
              cursor: 'pointer',
              transition: 'all 0.15s'
            }}
          >
            {cat === 'All' ? 'All Bulletins' : `${cat} Notices`}
          </button>
        ))}
      </div>

      {/* Announcements Feed */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {loading ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>
            <i className="fas fa-circle-notch fa-spin" style={{ fontSize: '1.8rem', color: '#2563eb', marginBottom: '10px' }}></i>
            <div>Loading bulletins...</div>
          </div>
        ) : filteredAnnouncements.map((ann) => {
          const isUrgent = ann.priority === 'Urgent'
          const isImportant = ann.priority === 'Important'

          return (
            <div
              key={ann._id}
              style={{
                background: '#ffffff',
                borderRadius: '16px',
                border: ann.isPinned ? '2px solid #2563eb' : '1px solid #e2e8f0',
                padding: '1.4rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '10px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
                position: 'relative'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {ann.isPinned && (
                    <span style={{ background: '#eff6ff', color: '#2563eb', padding: '2px 8px', borderRadius: '4px', fontSize: '0.7rem', fontWeight: '800' }}>
                      📌 PINNED
                    </span>
                  )}
                  <span style={{
                    background: isUrgent ? '#fef2f2' : (isImportant ? '#fff7ed' : '#f8fafc'),
                    color: isUrgent ? '#ef4444' : (isImportant ? '#ea580c' : '#475569'),
                    border: `1px solid ${isUrgent ? '#fecaca' : (isImportant ? '#fed7aa' : '#e2e8f0')}`,
                    padding: '2px 8px',
                    borderRadius: '999px',
                    fontSize: '0.7rem',
                    fontWeight: '800'
                  }}>
                    {ann.priority || 'Normal'}
                  </span>
                  <span style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: '700' }}>
                    {ann.category} Bulletin
                  </span>
                </div>

                <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
                  📅 {new Date(ann.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                </div>
              </div>

              <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: '800', color: '#0f172a', lineHeight: 1.35 }}>
                {ann.title}
              </h3>

              <div style={{ fontSize: '0.85rem', color: '#334155', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
                {ann.content}
              </div>

              <div style={{ paddingTop: '8px', borderTop: '1px solid #f1f5f9', fontSize: '0.72rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <i className="fas fa-user-circle" style={{ color: '#2563eb' }}></i>
                <span>Issued by <strong>{ann.postedBy}</strong></span>
              </div>
            </div>
          )
        })}
      </div>

      {/* Compose Modal */}
      {isComposeOpen && (
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
            maxWidth: '560px',
            width: '100%',
            padding: '1.75rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '1.25rem',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #f1f5f9', paddingBottom: '12px' }}>
              <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: '900', color: '#0f172a' }}>
                Post Team Bulletin
              </h3>
              <button onClick={() => setIsComposeOpen(false)} style={{ background: '#f1f5f9', border: 'none', borderRadius: '8px', width: '32px', height: '32px', cursor: 'pointer' }}>
                ✕
              </button>
            </div>

            <form onSubmit={handleCompose} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#334155', marginBottom: '4px' }}>
                  Headline <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Critical Backend API Maintenance at 11:00 PM"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '10px', border: '1.5px solid #cbd5e1', fontSize: '0.85rem', outline: 'none' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#334155', marginBottom: '4px' }}>
                  Message Content <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <textarea
                  rows={4}
                  placeholder="Write announcement details..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  required
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '10px', border: '1.5px solid #cbd5e1', fontSize: '0.85rem', outline: 'none', resize: 'vertical' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#334155', marginBottom: '4px' }}>
                    Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '10px', border: '1.5px solid #cbd5e1', fontSize: '0.82rem', outline: 'none' }}
                  >
                    <option value="Team">Team Bulletin</option>
                    <option value="Company">Company Wide</option>
                    <option value="Technical">Technical Update</option>
                    <option value="Policy">Policy Update</option>
                    <option value="Holiday">Holiday Notice</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#334155', marginBottom: '4px' }}>
                    Priority
                  </label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value)}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '10px', border: '1.5px solid #cbd5e1', fontSize: '0.82rem', outline: 'none' }}
                  >
                    <option value="Normal">Normal</option>
                    <option value="Important">Important</option>
                    <option value="Urgent">Urgent / Action Required</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input
                  type="checkbox"
                  id="pinCheck"
                  checked={isPinned}
                  onChange={(e) => setIsPinned(e.target.checked)}
                />
                <label htmlFor="pinCheck" style={{ fontSize: '0.82rem', color: '#334155', cursor: 'pointer', fontWeight: '600' }}>
                  Pin this announcement to the top of the feed
                </label>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '0.5rem', paddingTop: '10px', borderTop: '1px solid #f1f5f9' }}>
                <button
                  type="button"
                  onClick={() => setIsComposeOpen(false)}
                  style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#ffffff', color: '#64748b', fontWeight: '700', cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  style={{ padding: '8px 20px', borderRadius: '8px', border: 'none', background: '#2563eb', color: '#ffffff', fontWeight: '800', cursor: 'pointer' }}
                >
                  {submitting ? 'Publishing...' : 'Publish Announcement'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default AnnouncementsView
