import Task from '../models/Task.js'
import Employee from '../models/Employee.js'
import Project from '../models/Project.js'

// Helper to check if the user is authorized to assign / edit / delete tasks
// Strictly blocks Vivek Jagtap (7044) and Mahesh Kadam (7056 / AP7056)
// Only Anurag Nand (anunand2004@gmail.com / 7017) and Super Admin (role: 'admin') are permitted
const canUserAssignTasks = (user) => {
  if (!user) return false
  const email = (user.email || '').toLowerCase().trim()
  const empId = String(user.empId || '').trim()

  // Explicitly block Vivek Jagtap and Mahesh Kadam
  if (
    email === 'letsmailvivek100@gmail.com' ||
    empId === '7044' ||
    empId === 'AP7044' ||
    email === 'kadammahesh803@gmail.com' ||
    ((empId === '7056' || empId === 'AP7056') && email !== 'anunand2004@gmail.com')
  ) {
    return false
  }

  // Only Anurag Nand and Super Admin are permitted
  return (
    user.role === 'admin' ||
    email === 'anunand2004@gmail.com' ||
    empId === '7017' ||
    empId === 'AP7017'
  )
}

// @desc    Create a new task (Manager/Admin/Lead/Dev)
// @route   POST /api/tasks
// @access  Private
export const createTask = async (req, res) => {
  try {
    // Only Anurag and Super Admin are authorized to assign tasks to developers
    if (!canUserAssignTasks(req.user)) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: Only Anurag and Administrators are authorized to assign tasks to developers'
      })
    }

    const {
      title,
      description,
      assignedToEmail,
      deadline,
      priority,
      teamName,
      projectId,
      projectName,
      category,
      estimatedHours
    } = req.body

    if (!title || !description || !assignedToEmail || !deadline) {
      return res.status(400).json({ success: false, message: 'Title, description, assignedToEmail, and deadline are required' })
    }

    const assignedEmp = await Employee.findOne({ email: assignedToEmail.toLowerCase() })
    const assignedName = assignedEmp ? assignedEmp.name : assignedToEmail
    const assignedId = assignedEmp ? assignedEmp.empId : 'AP-EMP'

    let resolvedProjectName = projectName || 'Aparaitech Core'
    if (projectId && !projectName) {
      const proj = await Project.findById(projectId)
      if (proj) resolvedProjectName = proj.title
    }

    const task = new Task({
      title,
      description,
      assignedToEmail: assignedToEmail.toLowerCase(),
      assignedToName: assignedName,
      assignedToId: assignedId,
      assignedByEmail: req.user.email.toLowerCase(),
      assignedByName: req.user.name,
      teamName: teamName || (assignedEmp ? assignedEmp.department : 'Development'),
      projectId: projectId || null,
      projectName: resolvedProjectName,
      category: category || 'Feature',
      estimatedHours: estimatedHours ? Number(estimatedHours) : 4,
      deadline,
      priority: priority || 'Medium',
      status: 'To Do',
      history: [{
        action: `Task created and assigned to ${assignedName}`,
        performedBy: req.user.name,
        timestamp: new Date()
      }]
    })

    await task.save()
    res.status(201).json({ success: true, message: 'Task created successfully', data: task })
  } catch (error) {
    console.error('createTask error:', error)
    res.status(500).json({ success: false, message: 'Server error creating task', error: error.message })
  }
}

// @desc    Get tasks assigned to logged-in employee
// @route   GET /api/tasks/my-tasks
// @access  Private
export const getMyTasks = async (req, res) => {
  try {
    const tasks = await Task.find({ assignedToEmail: req.user.email.toLowerCase() }).sort({ createdAt: -1 })
    res.json({ success: true, data: tasks })
  } catch (error) {
    console.error('getMyTasks error:', error)
    res.status(500).json({ success: false, message: 'Server error fetching tasks', error: error.message })
  }
}

// @desc    Get all tasks with optional filters
// @route   GET /api/tasks
// @access  Private
export const getAllTasks = async (req, res) => {
  try {
    const { status, team, priority, category, projectId, assignedTo } = req.query
    const query = {}

    if (status && status !== 'all') {
      if (status === 'Pending') {
        query.status = { $in: ['Pending', 'To Do'] }
      } else if (status === 'Completed' || status === 'Done') {
        query.status = { $in: ['Completed', 'Done'] }
      } else {
        query.status = status
      }
    }
    if (team && team !== 'all') query.teamName = team
    if (priority && priority !== 'all') query.priority = priority
    if (category && category !== 'all') query.category = category
    if (projectId && projectId !== 'all') query.projectId = projectId
    if (assignedTo && assignedTo !== 'all') query.assignedToEmail = assignedTo.toLowerCase()

    let tasks = await Task.find(query).sort({ createdAt: -1 })

    res.json({ success: true, count: tasks.length, data: tasks })
  } catch (error) {
    console.error('getAllTasks error:', error)
    res.status(500).json({ success: false, message: 'Server error fetching tasks', error: error.message })
  }
}

// @desc    Update task status (Drag-and-drop or select)
// @route   PUT /api/tasks/:id/status
// @access  Private
export const updateTaskStatus = async (req, res) => {
  try {
    const { status, completionNotes, actualHours } = req.body
    const validStatuses = ['To Do', 'Pending', 'In Progress', 'In Review', 'Done', 'Completed']
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: `Invalid status '${status}'` })
    }

    const task = await Task.findById(req.params.id)
    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' })
    }

    const isAssigned = task.assignedToEmail === req.user.email.toLowerCase()
    const isManager = req.user.role === 'admin' || req.user.role === 'manager' || req.user.role === 'hr'
    if (!isAssigned && !isManager) {
      return res.status(403).json({ success: false, message: 'Not authorized to update this task' })
    }

    const prevStatus = task.status
    task.status = status
    if (completionNotes) task.completionNotes = completionNotes
    if (actualHours !== undefined) task.actualHours = Number(actualHours)

    if (status === 'Completed' || status === 'Done') {
      task.completedAt = new Date()
    } else {
      task.completedAt = null
    }

    task.history.push({
      action: `Status moved from '${prevStatus}' to '${status}'`,
      performedBy: req.user.name,
      timestamp: new Date()
    })

    await task.save()
    res.json({ success: true, message: `Task status updated to ${status}`, data: task })
  } catch (error) {
    console.error('updateTaskStatus error:', error)
    res.status(500).json({ success: false, message: 'Server error updating task', error: error.message })
  }
}

// @desc    Update full task details (Edit modal)
// @route   PUT /api/tasks/:id
// @access  Private
export const updateTask = async (req, res) => {
  try {
    if (!canUserAssignTasks(req.user)) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: Only Anurag and Administrators are authorized to edit or reassign tasks'
      })
    }

    const task = await Task.findById(req.params.id)
    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' })
    }

    const {
      title,
      description,
      priority,
      category,
      deadline,
      status,
      assignedToEmail,
      projectId,
      projectName,
      estimatedHours,
      actualHours
    } = req.body

    if (title) task.title = title
    if (description) task.description = description
    if (priority) task.priority = priority
    if (category) task.category = category
    if (deadline) task.deadline = deadline
    if (status) task.status = status
    if (estimatedHours !== undefined) task.estimatedHours = Number(estimatedHours)
    if (actualHours !== undefined) task.actualHours = Number(actualHours)

    if (projectId) task.projectId = projectId
    if (projectName) task.projectName = projectName

    if (assignedToEmail && assignedToEmail.toLowerCase() !== task.assignedToEmail) {
      const newEmp = await Employee.findOne({ email: assignedToEmail.toLowerCase() })
      task.assignedToEmail = assignedToEmail.toLowerCase()
      task.assignedToName = newEmp ? newEmp.name : assignedToEmail
      task.assignedToId = newEmp ? newEmp.empId : task.assignedToId
    }

    task.history.push({
      action: `Task updated by ${req.user.name}`,
      performedBy: req.user.name,
      timestamp: new Date()
    })

    await task.save()
    res.json({ success: true, message: 'Task updated successfully', data: task })
  } catch (error) {
    console.error('updateTask error:', error)
    res.status(500).json({ success: false, message: 'Server error updating task', error: error.message })
  }
}

// @desc    Add comment to task
// @route   POST /api/tasks/:id/comments
// @access  Private
export const addTaskComment = async (req, res) => {
  try {
    const { text } = req.body
    if (!text || !text.trim()) {
      return res.status(400).json({ success: false, message: 'Comment text is required' })
    }

    const task = await Task.findById(req.params.id)
    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' })
    }

    task.comments.push({
      senderName: req.user.name,
      senderEmail: req.user.email.toLowerCase(),
      text: text.trim(),
      createdAt: new Date()
    })

    await task.save()
    res.json({ success: true, message: 'Comment added successfully', data: task })
  } catch (error) {
    console.error('addTaskComment error:', error)
    res.status(500).json({ success: false, message: 'Server error adding comment', error: error.message })
  }
}

// @desc    Add attachment / file link to task
// @route   POST /api/tasks/:id/attachments
// @access  Private
export const addTaskAttachment = async (req, res) => {
  try {
    const { name, url } = req.body
    if (!name || !url) {
      return res.status(400).json({ success: false, message: 'Attachment name and URL are required' })
    }

    const task = await Task.findById(req.params.id)
    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' })
    }

    task.attachments.push({
      name,
      url,
      uploadedAt: new Date()
    })

    await task.save()
    res.json({ success: true, message: 'Attachment added successfully', data: task })
  } catch (error) {
    console.error('addTaskAttachment error:', error)
    res.status(500).json({ success: false, message: 'Server error adding attachment', error: error.message })
  }
}

// @desc    Delete task (Admin / Manager)
// @route   DELETE /api/tasks/:id
// @access  Private
export const deleteTask = async (req, res) => {
  try {
    if (!canUserAssignTasks(req.user)) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: Only Anurag and Administrators are authorized to delete tasks'
      })
    }

    const task = await Task.findByIdAndDelete(req.params.id)
    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' })
    }

    res.json({ success: true, message: 'Task deleted successfully' })
  } catch (error) {
    console.error('deleteTask error:', error)
    res.status(500).json({ success: false, message: 'Server error deleting task', error: error.message })
  }
}
