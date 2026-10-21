import React, { useState, useEffect } from 'react'
import { projectAPI, employeeAPI } from '../services/api'

function SoftwareProjectManager({ currentUser, showToast }) {
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [employees, setEmployees] = useState([])
  const [selectedProject, setSelectedProject] = useState(null)
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [isAddMilestoneOpen, setIsAddMilestoneOpen] = useState(false)

  // New Milestone Form
  const [milestoneTitle, setMilestoneTitle] = useState('')
  const [milestoneDate, setMilestoneDate] = useState('')

  // Project Comment Form
  const [commentText, setCommentText] = useState('')

  // New Project Form State
  const [newTitle, setNewTitle] = useState('')
  const [newCode, setNewCode] = useState('')
  const [newDesc, setNewDesc] = useState('')
  const [newCategory, setNewCategory] = useState('Web & Mobile App')
  const [newTechStack, setNewTechStack] = useState('React, Node.js, MongoDB, Vite')
  const [newRepoUrl, setNewRepoUrl] = useState('')
  const [newDeadline, setNewDeadline] = useState('')
  const [newAssignedTeam, setNewAssignedTeam] = useState([])
  const [creating, setCreating] = useState(false)

  // Edit Project Form State
  const [editingProject, setEditingProject] = useState(null)
  const [editForm, setEditForm] = useState({
    title: '',
    description: '',
    category: 'Web & Mobile App',
    techStack: '',
    repositoryUrl: '',
    deadline: '',
    status: 'Active',
    progressPercentage: 0,
    leadName: '',
    leadEmail: '',
    assignedTeam: []
  })
  const [updating, setUpdating] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const isManagerOrAdmin = currentUser?.role === 'admin' ||
    currentUser?.role === 'manager' ||
    currentUser?.email === 'anunand2004@gmail.com' ||
    String(currentUser?.empId) === '7017' ||
    String(currentUser?.empId) === 'AP7017'

  useEffect(() => {
    fetchProjects()
    fetchEmployees()
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

  const fetchEmployees = async () => {
    try {
      const res = await employeeAPI.getAll()
      if (res?.success) {
        setEmployees(res.data || [])
      }
    } catch (err) {
      console.error('Error fetching employees:', err)
    }
  }

  // Filter software developers and technical staff
  const availableDevs = employees.filter(e => {
    const dept = (e.department || '').toLowerCase()
    const desig = (e.designation || '').toLowerCase()
    const role = (e.role || '').toLowerCase()
    return (
      dept.includes('development') ||
      dept.includes('software') ||
      role === 'developer' ||
      role === 'intern' ||
      desig.includes('software') ||
      desig.includes('developer') ||
      desig.includes('engineer') ||
      desig.includes('intern')
    )
  })

  // Fallback to all active employees if no developers found
  const teamPool = availableDevs.length > 0 ? availableDevs : employees

  // Toggle member in New Project form
  const toggleNewMember = (emp) => {
    setNewAssignedTeam(prev => {
      const exists = prev.some(m => m.email?.toLowerCase() === emp.email?.toLowerCase())
      if (exists) {
        return prev.filter(m => m.email?.toLowerCase() !== emp.email?.toLowerCase())
      } else {
        return [...prev, {
          empId: emp.empId || 'DEV',
          name: emp.name,
          email: emp.email,
          role: emp.designation || 'Software Developer'
        }]
      }
    })
  }

  const updateNewMemberRole = (email, role) => {
    setNewAssignedTeam(prev => prev.map(m => m.email === email ? { ...m, role } : m))
  }

  // Toggle member in Edit Project form
  const toggleEditMember = (emp) => {
    setEditForm(prev => {
      const currentTeam = prev.assignedTeam || []
      const exists = currentTeam.some(m => m.email?.toLowerCase() === emp.email?.toLowerCase())
      let updated
      if (exists) {
        updated = currentTeam.filter(m => m.email?.toLowerCase() !== emp.email?.toLowerCase())
      } else {
        updated = [...currentTeam, {
          empId: emp.empId || 'DEV',
          name: emp.name,
          email: emp.email,
          role: emp.designation || 'Software Developer'
        }]
      }
      return { ...prev, assignedTeam: updated }
    })
  }

  const updateEditMemberRole = (email, role) => {
    setEditForm(prev => ({
      ...prev,
      assignedTeam: (prev.assignedTeam || []).map(m => m.email === email ? { ...m, role } : m)
    }))
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
        techStack: newTechStack ? newTechStack.split(',').map(s => s.trim()).filter(Boolean) : ['React', 'Node.js'],
        repositoryUrl: newRepoUrl.trim(),
        deadline: newDeadline,
        leadName: currentUser.name,
        leadEmail: currentUser.email,
        assignedTeam: newAssignedTeam
      })

      if (res.success) {
        showToast('🚀 Project created successfully with assigned team!', '#10b981')
        setProjects(prev => [res.data, ...prev])
        setIsCreateOpen(false)
        setNewTitle('')
        setNewCode('')
        setNewDesc('')
        setNewRepoUrl('')
        setNewDeadline('')
        setNewAssignedTeam([])
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

  // Open Edit Modal for a project
  const handleOpenEdit = (project, e) => {
    if (e) e.stopPropagation()
    setEditingProject(project)
    setEditForm({
      title: project.title || '',
      description: project.description || '',
      category: project.category || 'Web & Mobile App',
      techStack: Array.isArray(project.techStack) ? project.techStack.join(', ') : (project.techStack || ''),
      repositoryUrl: project.repositoryUrl || '',
      deadline: project.deadline || '',
      status: project.status || 'Active',
      progressPercentage: project.progressPercentage || 0,
      leadName: project.leadName || currentUser.name,
      leadEmail: project.leadEmail || currentUser.email,
      assignedTeam: Array.isArray(project.assignedTeam) ? [...project.assignedTeam] : []
    })
    setIsEditOpen(true)
  }

  const handleUpdateProject = async (e) => {
    e.preventDefault()
    if (!editingProject) return
    if (!editForm.title.trim() || !editForm.deadline) {
      showToast('⚠️ Project title and deadline are required', '#f59e0b')
      return
    }

    setUpdating(true)
    try {
      const payload = {
        title: editForm.title.trim(),
        description: editForm.description.trim(),
        category: editForm.category,
        techStack: editForm.techStack ? editForm.techStack.split(',').map(s => s.trim()).filter(Boolean) : [],
        repositoryUrl: editForm.repositoryUrl.trim(),
        deadline: editForm.deadline,
        status: editForm.status,
        progressPercentage: Number(editForm.progressPercentage) || 0,
        leadName: editForm.leadName,
        leadEmail: editForm.leadEmail,
        assignedTeam: editForm.assignedTeam || []
      }

      const res = await projectAPI.update(editingProject._id, payload)
      if (res.success) {
        showToast('✓ Project details updated successfully!', '#10b981')
        setProjects(prev => prev.map(p => p._id === editingProject._id ? res.data : p))
        if (selectedProject && selectedProject._id === editingProject._id) {
          setSelectedProject(res.data)
        }
        setIsEditOpen(false)
        setEditingProject(null)
      } else {
        showToast(`❌ ${res.message || 'Failed to update project'}`, '#ef4444')
      }
    } catch (err) {
      console.error('Update project error:', err)
      showToast(`❌ ${err.response?.data?.message || err.message}`, '#ef4444')
    } finally {
      setUpdating(false)
    }
  }

  const handleDeleteProject = async (projectId) => {
    if (!window.confirm('⚠️ Are you sure you want to delete this project? This action cannot be undone.')) {
      return
    }

    setDeleting(true)
    try {
      const res = await projectAPI.delete(projectId)
      if (res.success) {
        showToast('🗑️ Project deleted successfully', '#10b981')
        setProjects(prev => prev.filter(p => p._id !== projectId))
        if (selectedProject && selectedProject._id === projectId) {
          setSelectedProject(null)
        }
        setIsEditOpen(false)
        setEditingProject(null)
      } else {
        showToast(`❌ ${res.message || 'Failed to delete project'}`, '#ef4444')
      }
    } catch (err) {
      console.error('Delete project error:', err)
      showToast(`❌ ${err.response?.data?.message || err.message}`, '#ef4444')
    } finally {
      setDeleting(false)
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
            Monitor deliverables, technology stacks, sprint progress %, team assignments, and automated milestone completion.
          </p>
        </div>

        {isManagerOrAdmin && (
          <button
            onClick={() => {
              setNewAssignedTeam([])
              setIsCreateOpen(true)
            }}
            style={{
              background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
              color: '#ffffff',
              border: 'none',
              padding: '10px 20px',
              borderRadius: '12px',
              fontWeight: '800',
              fontSize: '0.86rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              boxShadow: '0 4px 12px rgba(37, 99, 235, 0.35)'
            }}
          >
            <i className="fas fa-plus"></i> New Project
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
          <div style={{ fontWeight: '700', fontSize: '1.05rem', color: '#334155' }}>No Active Projects Found</div>
          <p style={{ fontSize: '0.85rem', color: '#94a3b8', marginTop: '6px' }}>Click "+ New Project" above to create an enterprise software project and assign developers.</p>
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
            const team = project.assignedTeam || []

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
                    color: project.status === 'Completed' ? '#059669' : (project.status === 'In Progress' ? '#0284c7' : '#d97706'),
                    background: project.status === 'Completed' ? '#ecfdf5' : (project.status === 'In Progress' ? '#f0f9ff' : '#fffbeb'),
                    padding: '3px 10px',
                    borderRadius: '999px',
                    border: `1px solid ${project.status === 'Completed' ? '#a7f3d0' : (project.status === 'In Progress' ? '#bae6fd' : '#fde68a')}`
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

                {/* Assigned Team Members Row */}
                <div>
                  <div style={{ fontSize: '0.72rem', fontWeight: '800', color: '#475569', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <i className="fas fa-users" style={{ color: '#0284c7' }}></i> Assigned Team ({team.length})
                  </div>
                  {team.length > 0 ? (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                      {team.slice(0, 4).map((member, i) => (
                        <span
                          key={i}
                          style={{
                            background: '#f0f9ff',
                            color: '#0369a1',
                            border: '1px solid #bae6fd',
                            fontSize: '0.68rem',
                            fontWeight: '700',
                            padding: '2px 7px',
                            borderRadius: '4px'
                          }}
                        >
                          {member.name ? member.name.split(' ')[0] : 'Member'}
                          <span style={{ color: '#64748b', fontSize: '0.62rem', marginLeft: '3px' }}>({member.role || 'Dev'})</span>
                        </span>
                      ))}
                      {team.length > 4 && (
                        <span style={{ background: '#f1f5f9', color: '#475569', fontSize: '0.65rem', fontWeight: '700', padding: '2px 6px', borderRadius: '4px' }}>
                          +{team.length - 4} more
                        </span>
                      )}
                    </div>
                  ) : (
                    <span style={{ fontSize: '0.7rem', color: '#94a3b8', fontStyle: 'italic' }}>No members assigned yet</span>
                  )}
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

                {/* Footer: Lead, Target & Action Buttons */}
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  paddingTop: '10px',
                  borderTop: '1px solid #f1f5f9',
                  marginTop: 'auto'
                }}>
                  <div style={{ fontSize: '0.72rem', color: '#64748b' }}>
                    <div>Target: <strong>{project.deadline}</strong></div>
                  </div>

                  <div style={{ display: 'flex', gap: '6px' }}>
                    {isManagerOrAdmin && (
                      <button
                        onClick={(e) => handleOpenEdit(project, e)}
                        style={{
                          background: '#f8fafc',
                          color: '#0f172a',
                          border: '1px solid #cbd5e1',
                          borderRadius: '8px',
                          padding: '7px 11px',
                          fontSize: '0.76rem',
                          fontWeight: '700',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}
                        title="Edit Project Details"
                      >
                        <i className="fas fa-edit" style={{ color: '#0284c7' }}></i> Edit
                      </button>
                    )}

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
                      Open Project <i className="fas fa-arrow-right" style={{ fontSize: '0.7rem' }}></i>
                    </button>
                  </div>
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
            maxWidth: '720px',
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
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                  <span style={{ fontSize: '0.72rem', fontWeight: '800', color: '#2563eb', background: '#eff6ff', padding: '2px 8px', borderRadius: '6px' }}>
                    {selectedProject.code}
                  </span>
                  <span style={{ fontSize: '0.72rem', fontWeight: '700', color: '#64748b' }}>
                    Status: <strong style={{ color: '#0f172a' }}>{selectedProject.status}</strong>
                  </span>
                </div>
                <h3 style={{ margin: '4px 0 0 0', fontSize: '1.25rem', fontWeight: '900', color: '#0f172a' }}>
                  {selectedProject.title}
                </h3>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                {isManagerOrAdmin && (
                  <button
                    onClick={() => handleOpenEdit(selectedProject)}
                    style={{
                      background: '#0284c7',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: '8px',
                      padding: '7px 12px',
                      fontSize: '0.78rem',
                      fontWeight: '700',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '5px'
                    }}
                  >
                    <i className="fas fa-edit"></i> Edit Details
                  </button>
                )}
                <button
                  onClick={() => setSelectedProject(null)}
                  style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', width: '32px', height: '32px', cursor: 'pointer', fontWeight: '800' }}
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Content */}
            <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div style={{ fontSize: '0.88rem', color: '#475569', lineHeight: 1.5, background: '#f8fafc', padding: '12px 14px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                {selectedProject.description}
              </div>

              {/* Assigned Team Members Section */}
              <div style={{ background: '#f8fafc', borderRadius: '12px', padding: '12px 14px', border: '1px solid #e2e8f0' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <div style={{ fontSize: '0.8rem', fontWeight: '800', color: '#0f172a', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <i className="fas fa-users" style={{ color: '#0284c7' }}></i> Assigned Engineering Team ({selectedProject.assignedTeam?.length || 0})
                  </div>
                  {isManagerOrAdmin && (
                    <button
                      onClick={() => handleOpenEdit(selectedProject)}
                      style={{ background: 'none', border: 'none', color: '#0284c7', fontSize: '0.75rem', fontWeight: '700', cursor: 'pointer' }}
                    >
                      + Manage Team
                    </button>
                  )}
                </div>

                {selectedProject.assignedTeam && selectedProject.assignedTeam.length > 0 ? (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '8px' }}>
                    {selectedProject.assignedTeam.map((mem, i) => (
                      <div key={i} style={{ background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '8px', padding: '8px 10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: '#0284c7', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: '800' }}>
                          {mem.name ? mem.name[0] : 'U'}
                        </div>
                        <div style={{ minWidth: 0, flex: 1 }}>
                          <div style={{ fontSize: '0.8rem', fontWeight: '800', color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {mem.name}
                          </div>
                          <div style={{ fontSize: '0.68rem', color: '#0284c7', fontWeight: '600' }}>
                            {mem.role || 'Developer'}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{ fontSize: '0.78rem', color: '#94a3b8' }}>No team members assigned to this project yet. Use "Edit Details" to assign developers.</div>
                )}
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

      {/* ── CREATE PROJECT MODAL (With Team Assignment) ── */}
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
            maxWidth: '640px',
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
                  Initiate New Software Project
                </h3>
              </div>
              <button onClick={() => setIsCreateOpen(false)} style={{ background: '#f1f5f9', border: 'none', borderRadius: '8px', width: '32px', height: '32px', cursor: 'pointer', fontWeight: '800' }}>
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
                    placeholder="e.g. BYTALK App / Telemedicine Portal"
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
                    placeholder="AP-204"
                    value={newCode}
                    onChange={(e) => setNewCode(e.target.value)}
                    required
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '10px', border: '1.5px solid #cbd5e1', fontSize: '0.85rem', outline: 'none', textTransform: 'uppercase' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#334155', marginBottom: '4px' }}>
                  Description & Technical Scope
                </label>
                <textarea
                  rows={2}
                  placeholder="Outline key deliverables, tech architecture, and client objectives..."
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
                  placeholder="React, Node.js, Express, MongoDB, TailwindCSS, Vite"
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
                  placeholder="https://github.com/aparaitechAk-SoftwareTeam/..."
                  value={newRepoUrl}
                  onChange={(e) => setNewRepoUrl(e.target.value)}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '10px', border: '1.5px solid #cbd5e1', fontSize: '0.85rem', outline: 'none' }}
                />
              </div>

              {/* ── ASSIGN TEAM MEMBERS SECTION ── */}
              <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <label style={{ fontSize: '0.82rem', fontWeight: '800', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <i className="fas fa-user-plus" style={{ color: '#0284c7' }}></i> Assign Engineering Team Members ({newAssignedTeam.length})
                  </label>
                  <span style={{ fontSize: '0.72rem', color: '#64748b' }}>Select developers below</span>
                </div>

                <div style={{ maxHeight: '180px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {teamPool.map(emp => {
                    const isSelected = newAssignedTeam.some(m => m.email?.toLowerCase() === emp.email?.toLowerCase())
                    const memberObj = newAssignedTeam.find(m => m.email?.toLowerCase() === emp.email?.toLowerCase())

                    return (
                      <div
                        key={emp.email}
                        style={{
                          background: isSelected ? '#f0f9ff' : '#ffffff',
                          border: `1.5px solid ${isSelected ? '#0284c7' : '#e2e8f0'}`,
                          borderRadius: '8px',
                          padding: '6px 10px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          gap: '8px'
                        }}
                      >
                        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', flex: 1 }}>
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleNewMember(emp)}
                            style={{ accentColor: '#0284c7', width: '16px', height: '16px' }}
                          />
                          <div>
                            <strong style={{ fontSize: '0.8rem', color: '#0f172a' }}>{emp.name}</strong>
                            <span style={{ fontSize: '0.7rem', color: '#64748b', marginLeft: '6px' }}>({emp.empId}) • {emp.designation || 'Developer'}</span>
                          </div>
                        </label>

                        {isSelected && (
                          <input
                            type="text"
                            placeholder="Project Role"
                            value={memberObj?.role || 'Developer'}
                            onChange={(e) => updateNewMemberRole(emp.email, e.target.value)}
                            style={{ width: '130px', padding: '3px 8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.74rem' }}
                            title="Assign specific role in this project"
                          />
                        )}
                      </div>
                    )
                  })}
                </div>
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

      {/* ── EDIT PROJECT MODAL (Edit Details, Status, Team & Delete) ── */}
      {isEditOpen && editingProject && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(10, 25, 47, 0.75)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1200,
          padding: '1.25rem'
        }}>
          <div style={{
            background: '#ffffff',
            borderRadius: '20px',
            maxWidth: '660px',
            width: '100%',
            maxHeight: '92vh',
            overflowY: 'auto',
            padding: '1.75rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '1.25rem',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #f1f5f9', paddingBottom: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: '#f0f9ff', color: '#0284c7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <i className="fas fa-edit"></i>
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: '900', color: '#0f172a' }}>
                    Edit Project Details: {editingProject.code}
                  </h3>
                  <div style={{ fontSize: '0.72rem', color: '#64748b' }}>Update deliverables, assigned team, repository, or progress</div>
                </div>
              </div>
              <button onClick={() => setIsEditOpen(false)} style={{ background: '#f1f5f9', border: 'none', borderRadius: '8px', width: '32px', height: '32px', cursor: 'pointer', fontWeight: '800' }}>
                ✕
              </button>
            </div>

            <form onSubmit={handleUpdateProject} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#334155', marginBottom: '4px' }}>
                  Project Title <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <input
                  type="text"
                  value={editForm.title}
                  onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                  required
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '10px', border: '1.5px solid #cbd5e1', fontSize: '0.85rem', outline: 'none' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#334155', marginBottom: '4px' }}>
                  Description & Scope
                </label>
                <textarea
                  rows={2}
                  value={editForm.description}
                  onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '10px', border: '1.5px solid #cbd5e1', fontSize: '0.85rem', outline: 'none' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#334155', marginBottom: '4px' }}>
                    Status
                  </label>
                  <select
                    value={editForm.status}
                    onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '10px', border: '1.5px solid #cbd5e1', fontSize: '0.85rem', outline: 'none' }}
                  >
                    <option value="Planning">Planning</option>
                    <option value="Active">Active</option>
                    <option value="In Progress">In Progress</option>
                    <option value="In Review">In Review</option>
                    <option value="Completed">Completed</option>
                    <option value="On Hold">On Hold</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#334155', marginBottom: '4px' }}>
                    Target Launch Deadline <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <input
                    type="date"
                    value={editForm.deadline}
                    onChange={(e) => setEditForm({ ...editForm, deadline: e.target.value })}
                    required
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '10px', border: '1.5px solid #cbd5e1', fontSize: '0.85rem', outline: 'none' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#334155', marginBottom: '4px' }}>
                    Category
                  </label>
                  <select
                    value={editForm.category}
                    onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
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
                    Completion Progress: <strong>{editForm.progressPercentage}%</strong>
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={editForm.progressPercentage}
                    onChange={(e) => setEditForm({ ...editForm, progressPercentage: Number(e.target.value) })}
                    style={{ width: '100%', accentColor: '#0284c7', marginTop: '6px' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#334155', marginBottom: '4px' }}>
                  Tech Stack (comma separated)
                </label>
                <input
                  type="text"
                  value={editForm.techStack}
                  onChange={(e) => setEditForm({ ...editForm, techStack: e.target.value })}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '10px', border: '1.5px solid #cbd5e1', fontSize: '0.85rem', outline: 'none' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#334155', marginBottom: '4px' }}>
                  GitHub Repository URL
                </label>
                <input
                  type="url"
                  placeholder="https://github.com/aparaitechAk-SoftwareTeam/..."
                  value={editForm.repositoryUrl}
                  onChange={(e) => setEditForm({ ...editForm, repositoryUrl: e.target.value })}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '10px', border: '1.5px solid #cbd5e1', fontSize: '0.85rem', outline: 'none' }}
                />
              </div>

              {/* ── EDIT ASSIGNED TEAM MEMBERS ── */}
              <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <label style={{ fontSize: '0.82rem', fontWeight: '800', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <i className="fas fa-users-cog" style={{ color: '#0284c7' }}></i> Manage Assigned Team Members ({(editForm.assignedTeam || []).length})
                  </label>
                  <span style={{ fontSize: '0.72rem', color: '#64748b' }}>Check to assign/unassign</span>
                </div>

                <div style={{ maxHeight: '180px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {teamPool.map(emp => {
                    const currentTeam = editForm.assignedTeam || []
                    const isSelected = currentTeam.some(m => m.email?.toLowerCase() === emp.email?.toLowerCase())
                    const memberObj = currentTeam.find(m => m.email?.toLowerCase() === emp.email?.toLowerCase())

                    return (
                      <div
                        key={emp.email}
                        style={{
                          background: isSelected ? '#f0f9ff' : '#ffffff',
                          border: `1.5px solid ${isSelected ? '#0284c7' : '#e2e8f0'}`,
                          borderRadius: '8px',
                          padding: '6px 10px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          gap: '8px'
                        }}
                      >
                        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', flex: 1 }}>
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleEditMember(emp)}
                            style={{ accentColor: '#0284c7', width: '16px', height: '16px' }}
                          />
                          <div>
                            <strong style={{ fontSize: '0.8rem', color: '#0f172a' }}>{emp.name}</strong>
                            <span style={{ fontSize: '0.7rem', color: '#64748b', marginLeft: '6px' }}>({emp.empId}) • {emp.designation || 'Developer'}</span>
                          </div>
                        </label>

                        {isSelected && (
                          <input
                            type="text"
                            placeholder="Project Role"
                            value={memberObj?.role || 'Developer'}
                            onChange={(e) => updateEditMemberRole(emp.email, e.target.value)}
                            style={{ width: '130px', padding: '3px 8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.74rem' }}
                            title="Assign specific role in this project"
                          />
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.5rem', paddingTop: '10px', borderTop: '1px solid #f1f5f9' }}>
                <button
                  type="button"
                  onClick={() => handleDeleteProject(editingProject._id)}
                  disabled={deleting}
                  style={{
                    background: '#fef2f2',
                    color: '#dc2626',
                    border: '1px solid #fecaca',
                    borderRadius: '8px',
                    padding: '8px 14px',
                    fontWeight: '700',
                    fontSize: '0.8rem',
                    cursor: deleting ? 'not-allowed' : 'pointer'
                  }}
                >
                  <i className="fas fa-trash-alt"></i> {deleting ? 'Deleting...' : 'Delete Project'}
                </button>

                <div style={{ display: 'flex', gap: '10px' }}>
                  <button
                    type="button"
                    onClick={() => setIsEditOpen(false)}
                    style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#ffffff', color: '#64748b', fontWeight: '700', cursor: 'pointer' }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={updating}
                    style={{ padding: '8px 20px', borderRadius: '8px', border: 'none', background: '#0284c7', color: '#ffffff', fontWeight: '800', cursor: 'pointer' }}
                  >
                    {updating ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default SoftwareProjectManager
