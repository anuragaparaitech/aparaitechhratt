import React, { useState, useEffect } from 'react'
import { taskAPI, employeeAPI, projectAPI } from '../services/api'

const STATUS_COLUMNS = [
  { id: 'To Do', label: 'To Do', color: '#64748b', bg: '#f1f5f9', icon: 'fa-clipboard-list' },
  { id: 'In Progress', label: 'In Progress', color: '#2563eb', bg: '#eff6ff', icon: 'fa-spinner fa-spin' },
  { id: 'In Review', label: 'In Review', color: '#8b5cf6', bg: '#f5f3ff', icon: 'fa-eye' },
  { id: 'Done', label: 'Done', color: '#10b981', bg: '#ecfdf5', icon: 'fa-check-circle' }
]

const PRIORITY_BADGES = {
  Urgent: { color: '#ef4444', bg: '#fef2f2', border: '#fecaca', icon: 'fa-bolt' },
  High: { color: '#f97316', bg: '#fff7ed', border: '#fed7aa', icon: 'fa-arrow-up' },
  Medium: { color: '#2563eb', bg: '#eff6ff', border: '#bfdbfe', icon: 'fa-minus' },
  Low: { color: '#64748b', bg: '#f8fafc', border: '#e2e8f0', icon: 'fa-arrow-down' }
}

function SoftwareTaskManager({ currentUser, showToast }) {
  const [tasks, setTasks] = useState([])
  const [employees, setEmployees] = useState([])
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState('kanban') // 'kanban' or 'list'

  // Filter states
  const [search, setSearch] = useState('')
  const [priorityFilter, setPriorityFilter] = useState('all')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [projectFilter, setProjectFilter] = useState('all')

  // Modals
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [selectedTask, setSelectedTask] = useState(null)
  const [commentText, setCommentText] = useState('')
  const [attachmentName, setAttachmentName] = useState('')
  const [attachmentUrl, setAttachmentUrl] = useState('')
  const [isAddingAttachment, setIsAddingAttachment] = useState(false)

  // Form states for creating task
  const [newTitle, setNewTitle] = useState('')
  const [newDesc, setNewDesc] = useState('')
  const [newAssignee, setNewAssignee] = useState('')
  const [newPriority, setNewPriority] = useState('Medium')
  const [newCategory, setNewCategory] = useState('Feature')
  const [newProject, setNewProject] = useState('')
  const [newDeadline, setNewDeadline] = useState(() => {
    const d = new Date()
    d.setDate(d.getDate() + 3)
    return d.toISOString().split('T')[0]
  })
  const [newHours, setNewHours] = useState('4')
  const [submitting, setSubmitting] = useState(false)

  // Only Anurag and Super Admin are authorized to assign tasks to developers.
  // Vivek Jagtap and Mahesh Kadam are strictly developers and cannot assign tasks.
  const userEmail = currentUser?.email?.toLowerCase().trim() || ''
  const userEmpId = String(currentUser?.empId || '').trim()

  const isBlocked = (
    userEmail === 'letsmailvivek100@gmail.com' ||
    userEmpId === '7044' ||
    userEmpId === 'AP7044' ||
    userEmail === 'kadammahesh803@gmail.com' ||
    ((userEmpId === '7056' || userEmpId === 'AP7056') && userEmail !== 'anunand2004@gmail.com')
  )

  const isAnuragOrAdmin = !isBlocked && Boolean(
    currentUser && (
      currentUser.role === 'admin' ||
      userEmail === 'anunand2004@gmail.com' ||
      userEmpId === '7017' ||
      userEmpId === 'AP7017'
    )
  )

  useEffect(() => {
    fetchTasks()
    fetchAuxiliaryData()
  }, [])

  const fetchTasks = async () => {
    setLoading(true)
    try {
      const res = await taskAPI.getAllTasks()
      if (res.success) {
        setTasks(res.data || [])
      }
    } catch (err) {
      console.error('Error fetching tasks:', err)
      showToast('⚠️ Could not load sprint tasks', '#f59e0b')
    } finally {
      setLoading(false)
    }
  }

  const fetchAuxiliaryData = async () => {
    try {
      const [empRes, projRes] = await Promise.allSettled([
        employeeAPI.getAll(),
        projectAPI.getAll()
      ])
      if (empRes.status === 'fulfilled' && empRes.value.employees) {
        setEmployees(empRes.value.employees)
      }
      if (projRes.status === 'fulfilled' && projRes.value.data) {
        setProjects(projRes.value.data)
      }
    } catch (err) {
      console.error('Auxiliary data fetch error:', err)
    }
  }

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      const res = await taskAPI.updateStatus(taskId, { status: newStatus })
      if (res.success) {
        showToast(`✓ Task moved to ${newStatus}`, '#10b981')
        setTasks(prev => prev.map(t => t._id === taskId ? res.data : t))
        if (selectedTask && selectedTask._id === taskId) {
          setSelectedTask(res.data)
        }
      }
    } catch (err) {
      console.error('Error updating status:', err)
      showToast('❌ Failed to update status', '#ef4444')
    }
  }

  const handleCreateTask = async (e) => {
    e.preventDefault()
    if (!isAnuragOrAdmin) {
      showToast('⛔ Only Anurag and Administrators are authorized to assign tasks to developers', '#ef4444')
      return
    }
    if (!newTitle.trim() || !newAssignee) {
      showToast('⚠️ Please enter task title and assignee', '#f59e0b')
      return
    }

    setSubmitting(true)
    try {
      const selectedProjObj = projects.find(p => p._id === newProject || p.code === newProject)
      const res = await taskAPI.create({
        title: newTitle.trim(),
        description: newDesc.trim() || 'No additional description provided.',
        assignedToEmail: newAssignee,
        deadline: newDeadline,
        priority: newPriority,
        category: newCategory,
        projectId: selectedProjObj ? selectedProjObj._id : null,
        projectName: selectedProjObj ? selectedProjObj.title : 'Aparaitech Core',
        estimatedHours: Number(newHours) || 4,
        teamName: 'Development'
      })

      if (res.success) {
        showToast('🚀 Task created and assigned successfully!', '#10b981')
        setTasks(prev => [res.data, ...prev])
        setIsCreateOpen(false)
        // Reset
        setNewTitle('')
        setNewDesc('')
      } else {
        showToast(`❌ ${res.message || 'Failed to create task'}`, '#ef4444')
      }
    } catch (err) {
      console.error('Create task error:', err)
      showToast(`❌ ${err.response?.data?.message || err.message}`, '#ef4444')
    } finally {
      setSubmitting(false)
    }
  }

  const handleAddComment = async (e) => {
    e.preventDefault()
    if (!commentText.trim() || !selectedTask) return

    try {
      const res = await taskAPI.addComment(selectedTask._id, { text: commentText.trim() })
      if (res.success) {
        showToast('💬 Comment posted', '#10b981')
        setSelectedTask(res.data)
        setTasks(prev => prev.map(t => t._id === selectedTask._id ? res.data : t))
        setCommentText('')
      }
    } catch (err) {
      console.error('Comment error:', err)
      showToast('❌ Failed to add comment', '#ef4444')
    }
  }

  const handleAddAttachment = async (e) => {
    e.preventDefault()
    if (!attachmentName.trim() || !attachmentUrl.trim() || !selectedTask) return

    try {
      const res = await taskAPI.addAttachment(selectedTask._id, {
        name: attachmentName.trim(),
        url: attachmentUrl.trim()
      })
      if (res.success) {
        showToast('📎 Attachment added to task', '#10b981')
        setSelectedTask(res.data)
        setTasks(prev => prev.map(t => t._id === selectedTask._id ? res.data : t))
        setAttachmentName('')
        setAttachmentUrl('')
        setIsAddingAttachment(false)
      }
    } catch (err) {
      console.error('Attachment error:', err)
      showToast('❌ Failed to add attachment', '#ef4444')
    }
  }

  const filteredTasks = tasks.filter(task => {
    if (search.trim()) {
      const s = search.toLowerCase()
      const match = (
        (task.title && task.title.toLowerCase().includes(s)) ||
        (task.description && task.description.toLowerCase().includes(s)) ||
        (task.assignedToName && task.assignedToName.toLowerCase().includes(s))
      )
      if (!match) return false
    }
    if (priorityFilter !== 'all' && task.priority !== priorityFilter) return false
    if (categoryFilter !== 'all' && task.category !== categoryFilter) return false
    if (projectFilter !== 'all' && task.projectName !== projectFilter) return false
    return true
  })

  // Normalize task status helper
  const normalizeStatus = (status) => {
    if (status === 'Pending') return 'To Do'
    if (status === 'Completed') return 'Done'
    return status || 'To Do'
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
            <i className="fas fa-layer-group"></i> AGILE SPRINT BOARD
          </div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: '900', margin: '0 0 4px 0', letterSpacing: '-0.02em' }}>
            Software Tasks & Sprint Management
          </h1>
          <p style={{ margin: 0, fontSize: '0.82rem', color: '#93c5fd' }}>
            Track developer workload, feature delivery, code review cycles, and bug fixes across all sprints.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          {/* View mode toggle */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.12)',
            borderRadius: '10px',
            padding: '3px',
            display: 'flex',
            border: '1px solid rgba(255, 255, 255, 0.2)'
          }}>
            <button
              onClick={() => setViewMode('kanban')}
              style={{
                background: viewMode === 'kanban' ? '#ffffff' : 'transparent',
                color: viewMode === 'kanban' ? '#0a192f' : '#ffffff',
                border: 'none',
                borderRadius: '7px',
                padding: '6px 12px',
                fontSize: '0.78rem',
                fontWeight: '700',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <i className="fas fa-columns"></i> Kanban
            </button>
            <button
              onClick={() => setViewMode('list')}
              style={{
                background: viewMode === 'list' ? '#ffffff' : 'transparent',
                color: viewMode === 'list' ? '#0a192f' : '#ffffff',
                border: 'none',
                borderRadius: '7px',
                padding: '6px 12px',
                fontSize: '0.78rem',
                fontWeight: '700',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <i className="fas fa-list"></i> List
            </button>
          </div>

          {isAnuragOrAdmin && (
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
              Assign Task
            </button>
          )}
        </div>
      </div>

      {/* Filter Toolbar */}
      <div style={{
        background: '#ffffff',
        borderRadius: '16px',
        padding: '0.85rem 1.25rem',
        border: '1px solid #e2e8f0',
        display: 'flex',
        gap: '12px',
        alignItems: 'center',
        flexWrap: 'wrap'
      }}>
        <div style={{ position: 'relative', flex: 1, minWidth: '200px' }}>
          <i className="fas fa-search" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }}></i>
          <input
            type="text"
            placeholder="Search tasks, descriptions, assignees..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              width: '100%',
              padding: '8px 12px 8px 36px',
              borderRadius: '10px',
              border: '1.5px solid #cbd5e1',
              fontSize: '0.82rem',
              outline: 'none'
            }}
          />
        </div>

        <select
          value={priorityFilter}
          onChange={(e) => setPriorityFilter(e.target.value)}
          style={{
            padding: '8px 12px',
            borderRadius: '10px',
            border: '1.5px solid #cbd5e1',
            fontSize: '0.82rem',
            outline: 'none',
            color: '#334155'
          }}
        >
          <option value="all">All Priorities</option>
          <option value="Urgent">⚡ Urgent</option>
          <option value="High">🔴 High</option>
          <option value="Medium">🔵 Medium</option>
          <option value="Low">⚪ Low</option>
        </select>

        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          style={{
            padding: '8px 12px',
            borderRadius: '10px',
            border: '1.5px solid #cbd5e1',
            fontSize: '0.82rem',
            outline: 'none',
            color: '#334155'
          }}
        >
          <option value="all">All Categories</option>
          <option value="Feature">✨ Feature</option>
          <option value="Bug">🐞 Bug</option>
          <option value="Refactor">🔨 Refactor</option>
          <option value="DevOps">🚀 DevOps</option>
          <option value="Documentation">📚 Docs</option>
        </select>
      </div>

      {/* Main Task View */}
      {loading ? (
        <div style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>
          <i className="fas fa-circle-notch fa-spin" style={{ fontSize: '1.8rem', color: '#2563eb', marginBottom: '10px' }}></i>
          <div>Loading sprint tasks...</div>
        </div>
      ) : viewMode === 'kanban' ? (
        /* ── KANBAN BOARD ── */
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: '1rem',
          alignItems: 'start'
        }}>
          {STATUS_COLUMNS.map(col => {
            const colTasks = filteredTasks.filter(t => normalizeStatus(t.status) === col.id)
            return (
              <div
                key={col.id}
                style={{
                  background: '#f8fafc',
                  borderRadius: '16px',
                  border: '1px solid #e2e8f0',
                  padding: '1rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '10px',
                  minHeight: '400px'
                }}
              >
                {/* Column Header */}
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  paddingBottom: '8px',
                  borderBottom: `2px solid ${col.color}`
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '800', fontSize: '0.85rem', color: '#0f172a' }}>
                    <i className={`fas ${col.icon}`} style={{ color: col.color }}></i>
                    {col.label}
                  </div>
                  <span style={{
                    background: col.bg,
                    color: col.color,
                    borderRadius: '999px',
                    padding: '2px 8px',
                    fontSize: '0.72rem',
                    fontWeight: '800'
                  }}>
                    {colTasks.length}
                  </span>
                </div>

                {/* Column Cards */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {colTasks.map(task => {
                    const pBadge = PRIORITY_BADGES[task.priority] || PRIORITY_BADGES.Medium
                    return (
                      <div
                        key={task._id}
                        onClick={() => setSelectedTask(task)}
                        style={{
                          background: '#ffffff',
                          borderRadius: '12px',
                          padding: '12px 14px',
                          border: '1px solid #e2e8f0',
                          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.03)',
                          cursor: 'pointer',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '8px',
                          transition: 'transform 0.15s, box-shadow 0.15s'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.transform = 'translateY(-2px)'
                          e.currentTarget.style.boxShadow = '0 6px 14px rgba(0, 0, 0, 0.08)'
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.transform = 'translateY(0)'
                          e.currentTarget.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.03)'
                        }}
                      >
                        {/* Tags Header */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '6px' }}>
                          <span style={{
                            fontSize: '0.68rem',
                            fontWeight: '800',
                            padding: '2px 8px',
                            borderRadius: '6px',
                            background: pBadge.bg,
                            color: pBadge.color,
                            border: `1px solid ${pBadge.border}`,
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}>
                            <i className={`fas ${pBadge.icon}`}></i> {task.priority || 'Medium'}
                          </span>

                          <span style={{
                            fontSize: '0.68rem',
                            fontWeight: '700',
                            color: '#64748b',
                            background: '#f1f5f9',
                            padding: '2px 6px',
                            borderRadius: '4px'
                          }}>
                            {task.category || 'Feature'}
                          </span>
                        </div>

                        {/* Title */}
                        <div style={{ fontWeight: '800', fontSize: '0.88rem', color: '#0f172a', lineHeight: 1.35 }}>
                          {task.title}
                        </div>

                        {/* Project Name */}
                        <div style={{ fontSize: '0.72rem', color: '#2563eb', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <i className="fas fa-folder-open"></i> {task.projectName || 'Aparaitech Core'}
                        </div>

                        {/* Footer: Assignee & Deadline */}
                        <div style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          paddingTop: '6px',
                          borderTop: '1px solid #f1f5f9',
                          fontSize: '0.72rem',
                          color: '#64748b'
                        }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <div style={{
                              width: '22px',
                              height: '22px',
                              borderRadius: '50%',
                              background: '#2563eb',
                              color: '#ffffff',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontWeight: '700',
                              fontSize: '0.65rem'
                            }}>
                              {task.assignedToName ? task.assignedToName.charAt(0).toUpperCase() : 'U'}
                            </div>
                            <span style={{ fontWeight: '600', color: '#334155' }}>
                              {task.assignedToName ? task.assignedToName.split(' ')[0] : 'Dev'}
                            </span>
                          </div>

                          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <i className="far fa-calendar-alt"></i>
                            <span>{task.deadline}</span>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                  {colTasks.length === 0 && (
                    <div style={{ padding: '2rem 1rem', textAlign: 'center', color: '#94a3b8', fontSize: '0.78rem' }}>
                      No tasks in this lane
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        /* ── LIST VIEW ── */
        <div style={{
          background: '#ffffff',
          borderRadius: '16px',
          border: '1px solid #e2e8f0',
          overflow: 'hidden',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)'
        }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '1.5px solid #e2e8f0', color: '#475569', fontWeight: '800' }}>
                <th style={{ padding: '12px 16px' }}>TASK</th>
                <th style={{ padding: '12px' }}>PROJECT</th>
                <th style={{ padding: '12px' }}>ASSIGNEE</th>
                <th style={{ padding: '12px' }}>STATUS</th>
                <th style={{ padding: '12px' }}>PRIORITY</th>
                <th style={{ padding: '12px' }}>DEADLINE</th>
                <th style={{ padding: '12px 16px', textAlign: 'right' }}>ACTION</th>
              </tr>
            </thead>
            <tbody>
              {filteredTasks.map(task => {
                const normStatus = normalizeStatus(task.status)
                const col = STATUS_COLUMNS.find(c => c.id === normStatus) || STATUS_COLUMNS[0]
                const pBadge = PRIORITY_BADGES[task.priority] || PRIORITY_BADGES.Medium
                return (
                  <tr
                    key={task._id}
                    onClick={() => setSelectedTask(task)}
                    style={{ borderBottom: '1px solid #f1f5f9', cursor: 'pointer', transition: 'background 0.15s' }}
                    onMouseEnter={(e) => e.currentTarget.style.background = '#f8fafc'}
                    onMouseLeave={(e) => e.currentTarget.style.background = '#ffffff'}
                  >
                    <td style={{ padding: '12px 16px', fontWeight: '700', color: '#0f172a' }}>
                      {task.title}
                    </td>
                    <td style={{ padding: '12px', color: '#2563eb', fontWeight: '600' }}>
                      {task.projectName || 'Aparaitech Core'}
                    </td>
                    <td style={{ padding: '12px', color: '#334155' }}>
                      {task.assignedToName}
                    </td>
                    <td style={{ padding: '12px' }}>
                      <span style={{
                        background: col.bg,
                        color: col.color,
                        padding: '3px 10px',
                        borderRadius: '999px',
                        fontWeight: '700',
                        fontSize: '0.72rem'
                      }}>
                        {normStatus}
                      </span>
                    </td>
                    <td style={{ padding: '12px' }}>
                      <span style={{
                        background: pBadge.bg,
                        color: pBadge.color,
                        border: `1px solid ${pBadge.border}`,
                        padding: '2px 8px',
                        borderRadius: '6px',
                        fontSize: '0.72rem',
                        fontWeight: '700'
                      }}>
                        {task.priority || 'Medium'}
                      </span>
                    </td>
                    <td style={{ padding: '12px', color: '#64748b' }}>
                      {task.deadline}
                    </td>
                    <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          setSelectedTask(task)
                        }}
                        style={{
                          background: '#eff6ff',
                          color: '#2563eb',
                          border: 'none',
                          borderRadius: '8px',
                          padding: '6px 12px',
                          fontWeight: '700',
                          fontSize: '0.75rem',
                          cursor: 'pointer'
                        }}
                      >
                        Inspect
                      </button>
                    </td>
                  </tr>
                )
              })}
              {filteredTasks.length === 0 && (
                <tr>
                  <td colSpan={7} style={{ padding: '2.5rem', textAlign: 'center', color: '#94a3b8' }}>
                    No tasks match the active filters
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Task Details Drawer / Modal */}
      {selectedTask && (
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
            {/* Modal Header */}
            <div style={{
              padding: '1.25rem 1.5rem',
              borderBottom: '1px solid #e2e8f0',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              background: '#f8fafc'
            }}>
              <div>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '6px' }}>
                  <span style={{
                    fontSize: '0.72rem',
                    fontWeight: '800',
                    padding: '2px 8px',
                    borderRadius: '6px',
                    background: (PRIORITY_BADGES[selectedTask.priority] || PRIORITY_BADGES.Medium).bg,
                    color: (PRIORITY_BADGES[selectedTask.priority] || PRIORITY_BADGES.Medium).color
                  }}>
                    {selectedTask.priority || 'Medium'} Priority
                  </span>
                  <span style={{ fontSize: '0.72rem', fontWeight: '700', color: '#2563eb', background: '#eff6ff', padding: '2px 8px', borderRadius: '6px' }}>
                    {selectedTask.projectName || 'Aparaitech Core'}
                  </span>
                </div>
                <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: '900', color: '#0f172a' }}>
                  {selectedTask.title}
                </h3>
              </div>
              <button
                onClick={() => setSelectedTask(null)}
                style={{
                  background: '#ffffff',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  width: '32px',
                  height: '32px',
                  fontSize: '1rem',
                  cursor: 'pointer'
                }}
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {/* Status Switcher Bar */}
              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: '800', color: '#64748b', display: 'block', marginBottom: '8px', textTransform: 'uppercase' }}>
                  Current Task Status
                </label>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {STATUS_COLUMNS.map(col => {
                    const isActive = normalizeStatus(selectedTask.status) === col.id
                    return (
                      <button
                        key={col.id}
                        type="button"
                        onClick={() => handleStatusChange(selectedTask._id, col.id)}
                        style={{
                          background: isActive ? col.color : '#ffffff',
                          color: isActive ? '#ffffff' : '#475569',
                          border: `1.5px solid ${isActive ? col.color : '#cbd5e1'}`,
                          borderRadius: '8px',
                          padding: '6px 14px',
                          fontSize: '0.78rem',
                          fontWeight: '800',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          boxShadow: isActive ? '0 2px 8px rgba(0, 0, 0, 0.15)' : 'none'
                        }}
                      >
                        <i className={`fas ${col.icon}`}></i> {col.label}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Description */}
              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: '800', color: '#64748b', display: 'block', marginBottom: '6px', textTransform: 'uppercase' }}>
                  Task Scope & Instructions
                </label>
                <div style={{ background: '#f8fafc', padding: '12px 14px', borderRadius: '10px', fontSize: '0.88rem', color: '#1e293b', lineHeight: 1.5, whiteSpace: 'pre-wrap' }}>
                  {selectedTask.description}
                </div>
              </div>

              {/* Task Meta Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '12px', background: '#f8fafc', padding: '12px 14px', borderRadius: '12px', fontSize: '0.78rem' }}>
                <div>
                  <span style={{ color: '#64748b', display: 'block' }}>ASSIGNED TO</span>
                  <strong style={{ color: '#0f172a' }}>{selectedTask.assignedToName}</strong>
                </div>
                <div>
                  <span style={{ color: '#64748b', display: 'block' }}>ASSIGNED BY</span>
                  <strong style={{ color: '#0f172a' }}>{selectedTask.assignedByName}</strong>
                </div>
                <div>
                  <span style={{ color: '#64748b', display: 'block' }}>DEADLINE</span>
                  <strong style={{ color: '#ef4444' }}>📅 {selectedTask.deadline}</strong>
                </div>
                <div>
                  <span style={{ color: '#64748b', display: 'block' }}>ESTIMATED HOURS</span>
                  <strong style={{ color: '#2563eb' }}>⏱️ {selectedTask.estimatedHours || 4} hrs</strong>
                </div>
              </div>

              {/* Attachments Section */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <label style={{ fontSize: '0.75rem', fontWeight: '800', color: '#64748b', textTransform: 'uppercase' }}>
                    📎 Attachments & File Links ({selectedTask.attachments?.length || 0})
                  </label>
                  <button
                    type="button"
                    onClick={() => setIsAddingAttachment(v => !v)}
                    style={{ background: 'none', border: 'none', color: '#2563eb', fontWeight: '700', fontSize: '0.75rem', cursor: 'pointer' }}
                  >
                    + Add Attachment
                  </button>
                </div>

                {isAddingAttachment && (
                  <form onSubmit={handleAddAttachment} style={{ display: 'flex', gap: '8px', marginBottom: '10px' }}>
                    <input
                      type="text"
                      placeholder="Title (e.g. Figma Design, API Doc)"
                      value={attachmentName}
                      onChange={(e) => setAttachmentName(e.target.value)}
                      required
                      style={{ flex: 1, padding: '6px 10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.8rem' }}
                    />
                    <input
                      type="url"
                      placeholder="https://..."
                      value={attachmentUrl}
                      onChange={(e) => setAttachmentUrl(e.target.value)}
                      required
                      style={{ flex: 2, padding: '6px 10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.8rem' }}
                    />
                    <button type="submit" style={{ background: '#2563eb', color: '#fff', border: 'none', borderRadius: '8px', padding: '6px 12px', fontSize: '0.78rem', fontWeight: '700', cursor: 'pointer' }}>
                      Add
                    </button>
                  </form>
                )}

                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {selectedTask.attachments && selectedTask.attachments.length > 0 ? (
                    selectedTask.attachments.map((att, idx) => (
                      <a
                        key={idx}
                        href={att.url}
                        target="_blank"
                        rel="noreferrer"
                        style={{
                          background: '#f1f5f9',
                          padding: '8px 12px',
                          borderRadius: '8px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          textDecoration: 'none',
                          color: '#2563eb',
                          fontSize: '0.8rem',
                          fontWeight: '600'
                        }}
                      >
                        <span><i className="fas fa-link" style={{ marginRight: '6px' }}></i> {att.name}</span>
                        <i className="fas fa-external-link-alt" style={{ fontSize: '0.7rem' }}></i>
                      </a>
                    ))
                  ) : (
                    <div style={{ fontSize: '0.78rem', color: '#94a3b8' }}>No attachments linked.</div>
                  )}
                </div>
              </div>

              {/* Comments Discussion Feed */}
              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: '800', color: '#64748b', display: 'block', marginBottom: '8px', textTransform: 'uppercase' }}>
                  💬 Task Discussion & Notes ({selectedTask.comments?.length || 0})
                </label>

                <div style={{ maxHeight: '180px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '10px' }}>
                  {selectedTask.comments && selectedTask.comments.length > 0 ? (
                    selectedTask.comments.map((c, i) => (
                      <div key={i} style={{ background: '#f8fafc', padding: '8px 12px', borderRadius: '8px', fontSize: '0.82rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
                          <strong style={{ color: '#0f172a' }}>{c.senderName}</strong>
                          <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>{new Date(c.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                        <div style={{ color: '#334155' }}>{c.text}</div>
                      </div>
                    ))
                  ) : (
                    <div style={{ fontSize: '0.78rem', color: '#94a3b8' }}>No comments yet.</div>
                  )}
                </div>

                <form onSubmit={handleAddComment} style={{ display: 'flex', gap: '8px' }}>
                  <input
                    type="text"
                    placeholder="Type an update or comment..."
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    style={{ flex: 1, padding: '8px 12px', borderRadius: '8px', border: '1.5px solid #cbd5e1', fontSize: '0.82rem', outline: 'none' }}
                  />
                  <button
                    type="submit"
                    style={{ background: '#0a192f', color: '#ffffff', border: 'none', borderRadius: '8px', padding: '8px 16px', fontWeight: '700', fontSize: '0.8rem', cursor: 'pointer' }}
                  >
                    Reply
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Task Modal - Only accessible to Anurag & Admin */}
      {isCreateOpen && isAnuragOrAdmin && (
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
                  <i className="fas fa-plus"></i>
                </div>
                <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: '900', color: '#0f172a' }}>
                  Assign New Software Task
                </h3>
              </div>
              <button onClick={() => setIsCreateOpen(false)} style={{ background: '#f1f5f9', border: 'none', borderRadius: '8px', width: '32px', height: '32px', cursor: 'pointer' }}>
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateTask} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#334155', marginBottom: '4px' }}>
                  Task Title <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Build Biometric Authentication Modal"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  required
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '10px', border: '1.5px solid #cbd5e1', fontSize: '0.85rem', outline: 'none' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#334155', marginBottom: '4px' }}>
                  Description & Tech Specs
                </label>
                <textarea
                  rows={3}
                  placeholder="Describe acceptance criteria, API endpoints, or UI guidelines..."
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '10px', border: '1.5px solid #cbd5e1', fontSize: '0.85rem', outline: 'none', resize: 'vertical' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#334155', marginBottom: '4px' }}>
                    Assignee Developer <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <select
                    value={newAssignee}
                    onChange={(e) => setNewAssignee(e.target.value)}
                    required
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '10px', border: '1.5px solid #cbd5e1', fontSize: '0.85rem', outline: 'none' }}
                  >
                    <option value="">Select Developer...</option>
                    {employees.filter(e => e.department === 'Development' || e.department === 'Management').map(e => (
                      <option key={e._id || e.email} value={e.email}>
                        {e.name} ({e.designation || 'Software Dev'})
                      </option>
                    ))}
                    {/* Fallback list if employees not yet loaded */}
                    {employees.length === 0 && (
                      <>
                        <option value="anunand2004@gmail.com">Anurag Nand (Technical Lead)</option>
                        <option value="rutikyadav2004@gmail.com">Rutik Yadav (Full Stack)</option>
                        <option value="pavanmali0281@gmail.com">Pavan Mali (Frontend)</option>
                        <option value="letsmailvivek100@gmail.com">Vivek Jagtap (Backend)</option>
                        <option value="kadammahesh803@gmail.com">Mahesh Kadam (DevOps)</option>
                      </>
                    )}
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#334155', marginBottom: '4px' }}>
                    Project Hub
                  </label>
                  <select
                    value={newProject}
                    onChange={(e) => setNewProject(e.target.value)}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '10px', border: '1.5px solid #cbd5e1', fontSize: '0.85rem', outline: 'none' }}
                  >
                    <option value="">Aparaitech Core</option>
                    {projects.map(p => (
                      <option key={p._id} value={p._id}>{p.code}: {p.title}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#334155', marginBottom: '4px' }}>
                    Priority
                  </label>
                  <select
                    value={newPriority}
                    onChange={(e) => setNewPriority(e.target.value)}
                    style={{ width: '100%', padding: '8px 10px', borderRadius: '10px', border: '1.5px solid #cbd5e1', fontSize: '0.82rem', outline: 'none' }}
                  >
                    <option value="Urgent">⚡ Urgent</option>
                    <option value="High">🔴 High</option>
                    <option value="Medium">🔵 Medium</option>
                    <option value="Low">⚪ Low</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#334155', marginBottom: '4px' }}>
                    Category
                  </label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    style={{ width: '100%', padding: '8px 10px', borderRadius: '10px', border: '1.5px solid #cbd5e1', fontSize: '0.82rem', outline: 'none' }}
                  >
                    <option value="Feature">✨ Feature</option>
                    <option value="Bug">🐞 Bug</option>
                    <option value="Refactor">🔨 Refactor</option>
                    <option value="DevOps">🚀 DevOps</option>
                    <option value="Documentation">📚 Docs</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#334155', marginBottom: '4px' }}>
                    Est. Hours
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="80"
                    value={newHours}
                    onChange={(e) => setNewHours(e.target.value)}
                    style={{ width: '100%', padding: '8px 10px', borderRadius: '10px', border: '1.5px solid #cbd5e1', fontSize: '0.82rem', outline: 'none' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#334155', marginBottom: '4px' }}>
                  Sprint Target Deadline
                </label>
                <input
                  type="date"
                  value={newDeadline}
                  onChange={(e) => setNewDeadline(e.target.value)}
                  required
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '10px', border: '1.5px solid #cbd5e1', fontSize: '0.85rem', outline: 'none' }}
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
                  disabled={submitting}
                  style={{ padding: '8px 20px', borderRadius: '8px', border: 'none', background: '#2563eb', color: '#ffffff', fontWeight: '800', cursor: 'pointer' }}
                >
                  {submitting ? 'Assigning...' : 'Assign Task'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default SoftwareTaskManager
