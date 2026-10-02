import Task from '../models/Task.js'
import Employee from '../models/Employee.js'

// @desc    Create a new task (Manager/Admin)
// @route   POST /api/tasks
// @access  Private (Manager/Admin)
export const createTask = async (req, res) => {
  try {
    const { title, description, assignedToEmail, deadline, priority, teamName } = req.body

    if (!title || !description || !assignedToEmail || !deadline) {
      return res.status(400).json({ success: false, message: 'Title, description, assignedToEmail, and deadline are required' })
    }

    const assignedEmp = await Employee.findOne({ email: assignedToEmail.toLowerCase() })
    const assignedName = assignedEmp ? assignedEmp.name : assignedToEmail
    const assignedId = assignedEmp ? assignedEmp.empId : 'AP-EMP'

    const task = new Task({
      title,
      description,
      assignedToEmail: assignedToEmail.toLowerCase(),
      assignedToName: assignedName,
      assignedToId: assignedId,
      assignedByEmail: req.user.email.toLowerCase(),
      assignedByName: req.user.name,
      teamName: teamName || (assignedEmp ? assignedEmp.department : 'BDA'),
      deadline,
      priority: priority || 'Normal',
      status: 'Pending'
    })

    await task.save()
    res.status(201).json({ success: true, message: 'Task assigned successfully', data: task })
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

// @desc    Get all tasks (Manager/Admin)
// @route   GET /api/tasks
// @access  Private (Manager/Admin)
export const getAllTasks = async (req, res) => {
  try {
    const { status, team, assignedTo } = req.query
    const query = {}

    if (status && status !== 'all') query.status = status
    if (team && team !== 'all') query.teamName = team
    if (assignedTo) query.assignedToEmail = assignedTo.toLowerCase()

    const tasks = await Task.find(query).sort({ createdAt: -1 })
    res.json({ success: true, data: tasks })
  } catch (error) {
    console.error('getAllTasks error:', error)
    res.status(500).json({ success: false, message: 'Server error fetching tasks', error: error.message })
  }
}

// @desc    Update task status (Employee or Manager)
// @route   PUT /api/tasks/:id/status
// @access  Private
export const updateTaskStatus = async (req, res) => {
  try {
    const { status, completionNotes } = req.body
    if (!['Pending', 'In Progress', 'Completed'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' })
    }

    const task = await Task.findById(req.params.id)
    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' })
    }

    // Check permission: assigned user, manager, or admin
    const isAssigned = task.assignedToEmail === req.user.email.toLowerCase()
    const isManager = req.user.role === 'admin' || req.user.role === 'manager' || req.user.role === 'hr'
    if (!isAssigned && !isManager) {
      return res.status(403).json({ success: false, message: 'Not authorized to update this task' })
    }

    task.status = status
    if (completionNotes) task.completionNotes = completionNotes
    if (status === 'Completed') {
      task.completedAt = new Date()
    } else {
      task.completedAt = null
    }

    await task.save()
    res.json({ success: true, message: `Task status updated to ${status}`, data: task })
  } catch (error) {
    console.error('updateTaskStatus error:', error)
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
