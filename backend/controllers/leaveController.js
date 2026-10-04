import Leave from '../models/Leave.js'

// @desc    Apply for leave (Employee)
// @route   POST /api/leaves/apply
// @access  Private
export const applyLeave = async (req, res) => {
  try {
    const { leaveType, startDate, endDate, totalDays, reason } = req.body

    if (!startDate || !endDate || !reason) {
      return res.status(400).json({ success: false, message: 'Start date, end date, and reason are required' })
    }

    const leave = new Leave({
      employeeId: req.user.empId || 'AP-EMP',
      employeeName: req.user.name,
      employeeEmail: req.user.email.toLowerCase(),
      teamName: req.user.department || 'BDA',
      leaveType: leaveType || 'Casual Leave',
      startDate,
      endDate,
      totalDays: Number(totalDays) || 1,
      reason
    })

    await leave.save()
    res.status(201).json({ success: true, message: 'Leave application submitted successfully', data: leave })
  } catch (error) {
    console.error('applyLeave error:', error)
    res.status(500).json({ success: false, message: 'Server error applying for leave', error: error.message })
  }
}

// @desc    Get logged in user's leaves
// @route   GET /api/leaves/my-leaves
// @access  Private
export const getMyLeaves = async (req, res) => {
  try {
    const leaves = await Leave.find({ employeeEmail: req.user.email.toLowerCase() }).sort({ createdAt: -1 })
    res.json({ success: true, data: leaves })
  } catch (error) {
    console.error('getMyLeaves error:', error)
    res.status(500).json({ success: false, message: 'Server error fetching leaves', error: error.message })
  }
}

// @desc    Get all leaves (Manager/Admin)
// @route   GET /api/leaves
// @access  Private (Manager/Admin)
export const getAllLeaves = async (req, res) => {
  try {
    const { status, team } = req.query
    const query = {}

    if (status && status !== 'all') {
      query.status = status
    }
    if (team && team !== 'all') {
      query.teamName = team
    }

    const leaves = await Leave.find(query).sort({ createdAt: -1 })
    res.json({ success: true, data: leaves })
  } catch (error) {
    console.error('getAllLeaves error:', error)
    res.status(500).json({ success: false, message: 'Server error fetching leaves', error: error.message })
  }
}

// @desc    Approve or Reject leave (Manager/Admin)
// @route   PUT /api/leaves/:id/status
// @access  Private (Manager/Admin)
export const updateLeaveStatus = async (req, res) => {
  try {
    const { status, managerComments } = req.body
    if (!['Approved', 'Rejected'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' })
    }

    const leave = await Leave.findById(req.params.id)
    if (!leave) {
      return res.status(404).json({ success: false, message: 'Leave application not found' })
    }

    leave.status = status
    leave.reviewedBy = req.user.name
    leave.reviewedAt = new Date()
    if (managerComments) leave.managerComments = managerComments

    await leave.save()
    res.json({ success: true, message: `Leave application marked as ${status}`, data: leave })
  } catch (error) {
    console.error('updateLeaveStatus error:', error)
    res.status(500).json({ success: false, message: 'Server error updating leave', error: error.message })
  }
}

// @desc    Cancel/Delete a leave application
// @route   DELETE /api/leaves/:id
// @access  Private
export const deleteLeave = async (req, res) => {
  try {
    const leave = await Leave.findById(req.params.id)
    if (!leave) {
      return res.status(404).json({ success: false, message: 'Leave application not found' })
    }

    const isOwner = leave.employeeEmail === req.user.email.toLowerCase()
    const isAdminOrManager = req.user.role === 'admin' || req.user.role === 'manager' || req.user.role === 'hr'

    if (!isAdminOrManager && (!isOwner || leave.status !== 'Pending')) {
      return res.status(403).json({ success: false, message: 'Only pending requests can be cancelled by employee' })
    }

    await Leave.findByIdAndDelete(req.params.id)
    res.json({ success: true, message: 'Leave application cancelled successfully' })
  } catch (error) {
    console.error('deleteLeave error:', error)
    res.status(500).json({ success: false, message: 'Server error cancelling leave', error: error.message })
  }
}

