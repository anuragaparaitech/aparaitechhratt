import React, { useState, useEffect } from 'react'
import { projectAPI } from '../services/api'

function SoftwareProjectManager({ currentUser, showToast }) {
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedProject, setSelectedProject] = useState(null)
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [isAddMilestoneOpen, setIsAddMilestoneOpen] = useState(false)

  // New Milestone Form
  const [milestoneTitle, setMilestoneTitle] = useState('')
  const [milestoneDate, setMilestoneDate] = useState('')

  // Project Comment Form
  const [commentText, setCommentText] = useState('')

  // New Project Form
  const [newTitle, setNewTitle] = useState('')
  const [newCode, setNewCode] = useState('')
  const [newDesc, setNewDesc] = useState('')
  const [newCategory, setNewCategory] = useState('Web & Mobile App')
  const [newTechStack, setNewTechStack] = useState('React, Node.js, MongoDB, Capacitor')
  const [newRepoUrl, setNewRepoUrl] = useState('https://github.com/anuragaparaitech/aparaitechhratt')
  const [newDeadline, setNewDeadline] = useState('')
  const [creating, setCreating] = useState(false)

  const isManagerOrAdmin = currentUser.role === 'admin' || currentUser.role === 'manager' || currentUser.email === 'anunand2004@gmail.com'

  useEffect(() => {
    fetchProjects()
  }, [])

  const fetchProjects = async () => {
    setLoading(true)
    try {
      const res = await projectAPI.getAll()
      if (res.success) {
        setProjects(res.data || [])
      }
    } catch (err) {
      console.error('Error fetching projects:', err)
      showToast('⚠️ Could not load projects', '#f59e0b')
    } finally {
      setLoading(false)
    }
  }

  const handleToggleMilestone = async (projectId, milestoneId, currentStatus) => {
    const nextStatus = currentStatus === 'Completed' ? 'Pending' : 'Completed'
    try {
      const res = await projectAPI.toggleMilestone(projectId, milestoneId, { status: nextStatus })
      if (res.success) {
        showToast(`✓ Milestone marked as ${nextStatus}`, '#10b981')
        setProjects(prev => prev.map(p => p._id === projectId ? res.data : p))
        if (selectedProject && selectedProject._id === projectId) {
          setSelectedProject(res.data)
        }
      }
    } catch (err) {
      console.error('Toggle milestone error:', err)
      showToast('❌ Failed to update milestone', '#ef4444')
    }
  }

  const handleAddMilestone = async (e) => {
    e.preventDefault()
    if (!milestoneTitle.trim() || !milestoneDate || !selectedProject) return

    try {
      const res = await projectAPI.addMilestone(selectedProject._id, {
        title: milestoneTitle.trim(),
        targetDate: milestoneDate,
        status: 'Pending'
      })
      if (res.success) {
        showToast('🎯 Milestone added to project', '#10b981')
        setSelectedProject(res.data)
        setProjects(prev => prev.map(p => p._id === selectedProject._id ? res.data : p))
        setMilestoneTitle('')
        setMilestoneDate('')
        setIsAddMilestoneOpen(false)
      }
    } catch (err) {
      console.error('Add milestone error:', err)
      showToast('❌ Failed to add milestone', '#ef4444')
    }
  }

  const handleAddComment = async (e) => {
    e.preventDefault()
    if (!commentText.trim() || !selectedProject) return

    try {
      const res = await projectAPI.addComment(selectedProject._id, {
        text: commentText.trim()
      })
      if (res.success) {
        showToast('💬 Comment posted to project', '#10b981')
        setSelectedProject(res.data)
        setProjects(prev => prev.map(p => p._id === selectedProject._id ? res.data : p))
        setCommentText('')
      }
    } catch (err) {
      console.error('Comment error:', err)
      showToast('❌ Failed to add comment', '#ef4444')
    }
  }

  const handleCreateProject = async (e) => {
    e.preventDefault()
    if (!newTitle.trim() || !newCode.trim() || !newDeadline) {
      showToast('⚠️ Please enter project title, code, and deadline', '#f59e0b')
      return
    }

    setCreating(true)
    try {
      const res = await projectAPI.create({
        title: newTitle.trim(),
        code: newCode.trim().toUpperCase(),
        description: newDesc.trim() || 'Software development project for Aparaitech Software.',
        category: newCategory,
        techStack: newTechStack.split(',').map(s => s.trim()),
        repositoryUrl: newRepoUrl.trim(),
        deadline: newDeadline,
        leadName: currentUser.name,
        leadEmail: currentUser.email
      })

      if (res.success) {
        showToast('🚀 Project created successfully!', '#10b981')
        setProjects(prev => [res.data, ...prev])
        setIsCreateOpen(false)
        setNewTitle('')
        setNewCode('')
        setNewDesc('')
      } else {
        showToast(`❌ ${res.message || 'Failed to create project'}`, '#ef4444')
      }
    } catch (err) {
      console.error('Create project error:', err)
      showToast(`❌ ${err.response?.data?.message || err.message}`, '#ef4444')
    } finally {
      setCreating(false)
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
            <i className="fas fa-cubes"></i> ENTERPRISE PROJECT MANAGEMENT
          </div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: '900', margin: '0 0 4px 0', letterSpacing: '-0.02em' }}>
            Software Projects & Engineering Milestones
          </h1>
          <p style={{ margin: 0, fontSize: '0.82rem', color: '#93c5fd' }}>
            Monitor deliverables, technology stacks, sprint progress %, and automated milestone completion.
          </p>
        </div>

        {isManagerOrAdmin && (
          <button
            onClick={() => setIsCreateOpen(true)}
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
            Create New Project
          </button>
        )}
      </div>

      {/* Projects Grid */}
      {loading ? (
        <div style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>
          <i className="fas fa-circle-notch fa-spin" style={{ fontSize: '1.8rem', color: '#2563eb', marginBottom: '10px' }}></i>
          <div>Loading software projects...</div>
        </div>
      ) : projects.length === 0 ? (
        <div style={{ padding: '3.5rem 1.5rem', textAlign: 'center', color: '#64748b', background: '#fff', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
          <i className="fas fa-folder-open" style={{ fontSize: '2.5rem', color: '#94a3b8', marginBottom: '1rem' }}></i>
          <div style={{ fontWeight: '700', fontSize: '1rem', color: '#334155' }}>No Active Projects Found</div>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '1.25rem'
        }}>
          {projects.map(project => {
            const completedCount = project.milestones ? project.milestones.filter(m => m.status === 'Completed').length : 0
            const totalCount = project.milestones ? project.milestones.length : 0
            const progress = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : (project.progressPercentage || 0)

            return (
              <div
                key={project._id}
                style={{
                  background: '#ffffff',
                  borderRadius: '18px',
                  border: '1px solid #e2e8f0',
                  padding: '1.4rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  position: 'relative'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-3px)'
                  e.currentTarget.style.boxShadow = '0 10px 20px -5px rgba(0, 0, 0, 0.1)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)'
                  e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.05)'
                }}
              >
                {/* Header: Code & Status */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{
                    fontSize: '0.72rem',
                    fontWeight: '800',
                    color: '#2563eb',
                    background: '#eff6ff',
                    border: '1px solid #bfdbfe',
                    padding: '3px 8px',
                    borderRadius: '6px'
                  }}>
                    {project.code}
                  </span>

                  <span style={{
                    fontSize: '0.72rem',
                    fontWeight: '800',
                    color: project.status === 'Completed' ? '#059669' : '#2563eb',
                    background: project.status === 'Completed' ? '#ecfdf5' : '#eff6ff',
                    padding: '3px 10px',
                    borderRadius: '999px'
                  }}>
                    ● {project.status}
                  </span>
                </div>

                {/* Title & Description */}
                <div>
                  <h3 style={{ margin: '0 0 6px 0', fontSize: '1.05rem', fontWeight: '900', color: '#0f172a', lineHeight: 1.3 }}>
                    {project.title}
                  </h3>
                  <p style={{ margin: 0, fontSize: '0.8rem', color: '#64748b', lineHeight: 1.45, maxHeight: '48px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {project.description}
                  </p>
                </div>

                {/* Tech Stack Chips */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {project.techStack && project.techStack.map((tech, idx) => (
                    <span
                      key={idx}
                      style={{
                        background: '#f1f5f9',
                        color: '#475569',
                        fontSize: '0.68rem',
                        fontWeight: '700',
                        padding: '2px 8px',
                        borderRadius: '6px'
                      }}
                    >
                      {tech}
                    </span>
                  ))}
                </div>

                {/* Progress Bar */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', fontWeight: '800', marginBottom: '4px' }}>
                    <span style={{ color: '#475569' }}>Completion Progress</span>
                    <span style={{ color: '#2563eb' }}>{progress}%</span>
                  </div>
                  <div style={{ width: '100%', height: '8px', background: '#f1f5f9', borderRadius: '999px', overflow: 'hidden' }}>
                    <div style={{
                      width: `${progress}%`,
                      height: '100%',
                      background: progress === 100 ? '#10b981' : 'linear-gradient(90deg, #2563eb, #38bdf8)',
                      borderRadius: '999px',
                      transition: 'width 0.3s ease'
                    }} />
                  </div>
                  <div style={{ fontSize: '0.7rem', color: '#94a3b8', marginTop: '4px' }}>
                    {completedCount} of {totalCount} milestones completed
                  </div>
                </div>

                {/* Footer: Lead, Deadline & View button */}
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  paddingTop: '10px',
                  borderTop: '1px solid #f1f5f9',
                  marginTop: 'auto'
                }}>
                  <div style={{ fontSize: '0.72rem', color: '#64748b' }}>
                    <div>Lead: <strong style={{ color: '#334155' }}>{project.leadName || 'Anurag Nand'}</strong></div>
                    <div>Target: <strong>{project.deadline}</strong></div>
                  </div>

                  <button
                    onClick={() => setSelectedProject(project)}
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
                    Milestones <i className="fas fa-arrow-right" style={{ fontSize: '0.7rem' }}></i>
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Project Details & Milestones Drawer/Modal */}
      {selectedProject && (
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
            maxWidth: '680px',
            width: '100%',
            maxHeight: '92vh',
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            border: '1px solid #e2e8f0'
          }}>
            {/* Header */}
            <div style={{
              padding: '1.25rem 1.5rem',
              background: '#f8fafc',
              borderBottom: '1px solid #e2e8f0',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start'
            }}>
              <div>
                <span style={{ fontSize: '0.72rem', fontWeight: '800', color: '#2563eb', background: '#eff6ff', padding: '2px 8px', borderRadius: '6px' }}>
                  {selectedProject.code}
                </span>
                <h3 style={{ margin: '4px 0 0 0', fontSize: '1.2rem', fontWeight: '900', color: '#0f172a' }}>
                  {selectedProject.title}
                </h3>
              </div>
              <button
                onClick={() => setSelectedProject(null)}
                style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', width: '32px', height: '32px', cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>

            {/* Content */}
            <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div style={{ fontSize: '0.88rem', color: '#475569', lineHeight: 1.5, background: '#f8fafc', padding: '12px 14px', borderRadius: '10px' }}>
                {selectedProject.description}
              </div>

              {/* Milestones Checklist */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <label style={{ fontSize: '0.8rem', fontWeight: '800', color: '#0f172a', textTransform: 'uppercase' }}>
                    🎯 Project Deliverables & Milestones ({selectedProject.milestones?.length || 0})
                  </label>
                  <button
                    onClick={() => setIsAddMilestoneOpen(v => !v)}
                    style={{ background: '#eff6ff', color: '#2563eb', border: 'none', borderRadius: '6px', padding: '5px 10px', fontSize: '0.75rem', fontWeight: '700', cursor: 'pointer' }}
                  >
                    + Add Milestone
                  </button>
                </div>

                {isAddMilestoneOpen && (
                  <form onSubmit={handleAddMilestone} style={{ display: 'flex', gap: '8px', marginBottom: '12px', background: '#f8fafc', padding: '10px', borderRadius: '10px' }}>
                    <input
                      type="text"
                      placeholder="Milestone title..."
                      value={milestoneTitle}
                      onChange={(e) => setMilestoneTitle(e.target.value)}
                      required
                      style={{ flex: 2, padding: '7px 10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.82rem' }}
                    />
                    <input
                      type="date"
                      value={milestoneDate}
                      onChange={(e) => setMilestoneDate(e.target.value)}
                      required
                      style={{ flex: 1, padding: '7px 10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.82rem' }}
                    />
                    <button type="submit" style={{ background: '#2563eb', color: '#fff', border: 'none', borderRadius: '8px', padding: '7px 14px', fontSize: '0.78rem', fontWeight: '700', cursor: 'pointer' }}>
                      Add
                    </button>
                  </form>
                )}

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {selectedProject.milestones && selectedProject.milestones.length > 0 ? (
                    selectedProject.milestones.map((milestone) => {
                      const isDone = milestone.status === 'Completed'
                      return (
                        <div
                          key={milestone._id}
                          onClick={() => handleToggleMilestone(selectedProject._id, milestone._id, milestone.status)}
                          style={{
                            padding: '10px 14px',
                            borderRadius: '10px',
                            background: isDone ? '#ecfdf5' : '#ffffff',
                            border: `1.5px solid ${isDone ? '#a7f3d0' : '#e2e8f0'}`,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            cursor: 'pointer',
                            transition: 'all 0.15s'
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <div style={{
                              width: '20px',
                              height: '20px',
                              borderRadius: '6px',
                              border: `2px solid ${isDone ? '#10b981' : '#cbd5e1'}`,
                              background: isDone ? '#10b981' : 'transparent',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              color: '#fff',
                              fontSize: '0.7rem'
                            }}>
                              {isDone && <i className="fas fa-check"></i>}
                            </div>
                            <span style={{
                              fontSize: '0.85rem',
                              fontWeight: '700',
                              color: isDone ? '#065f46' : '#1e293b',
                              textDecoration: isDone ? 'line-through' : 'none'
                            }}>
                              {milestone.title}
                            </span>
                          </div>

                          <span style={{ fontSize: '0.72rem', color: isDone ? '#059669' : '#64748b', fontWeight: '600' }}>
                            📅 {milestone.targetDate}
                          </span>
                        </div>
                      )
                    })
                  ) : (
                    <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>No milestones created yet.</div>
                  )}
                </div>
              </div>

              {/* Discussion & Updates */}
              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: '800', color: '#0f172a', display: 'block', marginBottom: '8px', textTransform: 'uppercase' }}>
                  💬 Project Updates & Notes
                </label>

                <div style={{ maxHeight: '160px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '10px' }}>
                  {selectedProject.comments && selectedProject.comments.length > 0 ? (
                    selectedProject.comments.map((c, i) => (
                      <div key={i} style={{ background: '#f8fafc', padding: '8px 12px', borderRadius: '8px', fontSize: '0.82rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
                          <strong style={{ color: '#0f172a' }}>{c.senderName}</strong>
                          <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>{new Date(c.createdAt).toLocaleDateString()}</span>
                        </div>
                        <div style={{ color: '#334155' }}>{c.text}</div>
                      </div>
                    ))
                  ) : (
                    <div style={{ fontSize: '0.78rem', color: '#94a3b8' }}>No updates logged yet.</div>
                  )}
                </div>

                <form onSubmit={handleAddComment} style={{ display: 'flex', gap: '8px' }}>
                  <input
                    type="text"
                    placeholder="Log a technical update or announcement..."
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    style={{ flex: 1, padding: '8px 12px', borderRadius: '8px', border: '1.5px solid #cbd5e1', fontSize: '0.82rem', outline: 'none' }}
                  />
                  <button type="submit" style={{ background: '#0a192f', color: '#ffffff', border: 'none', borderRadius: '8px', padding: '8px 16px', fontWeight: '700', fontSize: '0.8rem', cursor: 'pointer' }}>
                    Post
                  </button>
                </form>
              </div>

              {/* Link to GitHub */}
              {selectedProject.repositoryUrl && (
                <div style={{ background: '#f1f5f9', padding: '10px 14px', borderRadius: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.82rem', fontWeight: '700', color: '#0f172a' }}>
                    <i className="fab fa-github" style={{ fontSize: '1.1rem' }}></i>
                    <span>Repository: {selectedProject.repositoryUrl.replace('https://github.com/', '')}</span>
                  </div>
                  <a
                    href={selectedProject.repositoryUrl}
                    target="_blank"
                    rel="noreferrer"
                    style={{ background: '#2563eb', color: '#fff', textDecoration: 'none', padding: '5px 12px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: '700' }}
                  >
                    Open Repo ↗
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Create Project Modal */}
      {isCreateOpen && (
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
            maxHeight: '90vh',
            overflowY: 'auto',
            padding: '1.75rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '1.25rem',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #f1f5f9', paddingBottom: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: '#eff6ff', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <i className="fas fa-folder-plus"></i>
                </div>
                <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: '900', color: '#0f172a' }}>
                  Initiate New Project
                </h3>
              </div>
              <button onClick={() => setIsCreateOpen(false)} style={{ background: '#f1f5f9', border: 'none', borderRadius: '8px', width: '32px', height: '32px', cursor: 'pointer' }}>
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateProject} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#334155', marginBottom: '4px' }}>
                    Project Title <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Aparaitech AI Code Reviewer"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    required
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '10px', border: '1.5px solid #cbd5e1', fontSize: '0.85rem', outline: 'none' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#334155', marginBottom: '4px' }}>
                    Code <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="PRJ-AICODE"
                    value={newCode}
                    onChange={(e) => setNewCode(e.target.value)}
                    required
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '10px', border: '1.5px solid #cbd5e1', fontSize: '0.85rem', outline: 'none', textTransform: 'uppercase' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#334155', marginBottom: '4px' }}>
                  Description & Business Goals
                </label>
                <textarea
                  rows={3}
                  placeholder="Outline key deliverables, client architecture, and scope..."
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '10px', border: '1.5px solid #cbd5e1', fontSize: '0.85rem', outline: 'none' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#334155', marginBottom: '4px' }}>
                    Category
                  </label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '10px', border: '1.5px solid #cbd5e1', fontSize: '0.85rem', outline: 'none' }}
                  >
                    <option value="Web & Mobile App">Web & Mobile App</option>
                    <option value="Web Application">Web Application</option>
                    <option value="Mobile App (APK/iOS)">Mobile App</option>
                    <option value="AI & Data Services">AI & Data Services</option>
                    <option value="Cloud Architecture">Cloud Architecture</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#334155', marginBottom: '4px' }}>
                    Target Launch Deadline <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <input
                    type="date"
                    value={newDeadline}
                    onChange={(e) => setNewDeadline(e.target.value)}
                    required
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '10px', border: '1.5px solid #cbd5e1', fontSize: '0.85rem', outline: 'none' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#334155', marginBottom: '4px' }}>
                  Tech Stack (comma separated)
                </label>
                <input
                  type="text"
                  placeholder="React, Node.js, Express, MongoDB, TailwindCSS"
                  value={newTechStack}
                  onChange={(e) => setNewTechStack(e.target.value)}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '10px', border: '1.5px solid #cbd5e1', fontSize: '0.85rem', outline: 'none' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#334155', marginBottom: '4px' }}>
                  GitHub Repository URL
                </label>
                <input
                  type="url"
                  placeholder="https://github.com/anuragaparaitech/..."
                  value={newRepoUrl}
                  onChange={(e) => setNewRepoUrl(e.target.value)}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '10px', border: '1.5px solid #cbd5e1', fontSize: '0.85rem', outline: 'none' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '0.5rem', paddingTop: '10px', borderTop: '1px solid #f1f5f9' }}>
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#ffffff', color: '#64748b', fontWeight: '700', cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  style={{ padding: '8px 20px', borderRadius: '8px', border: 'none', background: '#2563eb', color: '#ffffff', fontWeight: '800', cursor: 'pointer' }}
                >
                  {creating ? 'Creating...' : 'Create Project'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default SoftwareProjectManager
