import Lead from '../models/Lead.js'
import Employee from '../models/Employee.js'
import { processWithAIDataEngine, PREDEFINED_DOMAINS } from '../services/aiDataEngine.js'

// @desc    Admin: Process unstructured data with AI
// @route   POST /api/leads/ai-process
// @access  Private (Admin only)
export const processAIBulkData = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Access denied. Administrator privileges required.' })
    }

    const { rawData, options = {} } = req.body
    if (!rawData) {
      return res.status(400).json({ success: false, message: 'No raw data provided for AI processing.' })
    }

    const result = await processWithAIDataEngine(rawData, options)
    return res.status(200).json(result)
  } catch (err) {
    console.error('[AI Data Controller Error] processAIBulkData:', err)
    return res.status(500).json({
      success: false,
      message: 'Failed to process data with AI engine',
      error: err.message
    })
  }
}

// @desc    Admin: Assign clean, sorted leads to one or multiple employees, or all employees
// @route   POST /api/leads/assign
// @access  Private (Admin only)
export const assignLeadsToEmployee = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Access denied. Administrator privileges required.' })
    }

    const {
      employeeEmail,
      employeeId,
      employeeName,
      department,
      targetEmployees,
      employeeEmails,
      distributionMode = 'split',
      leads
    } = req.body

    if (!Array.isArray(leads) || leads.length === 0) {
      return res.status(400).json({ success: false, message: 'At least one lead is required to assign.' })
    }

    // Resolve target employee list
    let empsToAssign = []

    if (Array.isArray(targetEmployees) && targetEmployees.length > 0) {
      empsToAssign = targetEmployees
        .filter(e => e && e.email)
        .map(e => ({
          email: e.email.toLowerCase().trim(),
          name: e.name || e.email.split('@')[0],
          empId: e.empId || 'EMP',
          department: e.department || 'BDA'
        }))
    } else if (Array.isArray(employeeEmails) && employeeEmails.length > 0) {
      const cleanEmails = employeeEmails.filter(Boolean).map(e => e.toLowerCase().trim())
      let dbEmps = []
      try {
        dbEmps = await Employee.find({ email: { $in: cleanEmails } })
      } catch (e) {}
      const mapByEmail = new Map(dbEmps.map(e => [e.email.toLowerCase(), e]))
      empsToAssign = cleanEmails.map(email => {
        const emp = mapByEmail.get(email)
        return {
          email,
          name: emp?.name || email.split('@')[0],
          empId: emp?.empId || 'EMP',
          department: emp?.department || 'BDA'
        }
      })
    } else if (employeeEmail) {
      let emp = null
      try {
        emp = await Employee.findOne({ email: employeeEmail.toLowerCase() })
      } catch (e) {}
      empsToAssign = [{
        email: employeeEmail.toLowerCase(),
        name: employeeName || emp?.name || employeeEmail.split('@')[0],
        empId: employeeId || emp?.empId || 'EMP',
        department: department || emp?.department || 'BDA'
      }]
    }

    if (empsToAssign.length === 0) {
      return res.status(400).json({ success: false, message: 'At least one target employee is required to assign leads.' })
    }

    const mode = empsToAssign.length === 1 ? 'single' : (distributionMode === 'all' ? 'all' : 'split')
    const batchId = `BATCH-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`
    const now = new Date()

    const docsToInsert = []

    if (mode === 'all') {
      // Broadcast mode: assign all leads to every selected employee
      for (const emp of empsToAssign) {
        for (const l of leads) {
          docsToInsert.push({
            name: l.name || 'Prospective Lead',
            mobile: l.mobile || '',
            cleanMobile: l.cleanMobile || '',
            email: l.email ? l.email.toLowerCase() : '',
            college: l.college || 'Independent / Unspecified College',
            domain: l.domain || 'Web Development',
            priority: l.priority || 'Warm',
            priorityScore: l.priorityScore || 50,
            rawText: l.rawText || '',
            missingFields: Array.isArray(l.missingFields) ? l.missingFields : [],
            status: 'Not Called',
            callNotes: '',
            assignedTo: {
              empId: emp.empId,
              name: emp.name,
              email: emp.email,
              department: emp.department
            },
            assignedBy: {
              name: req.user.name || 'Administrator',
              email: req.user.email
            },
            assignedAt: now,
            batchId
          })
        }
      }
    } else {
      // 'split' (round-robin) or single employee: divide leads among employees
      leads.forEach((l, idx) => {
        const emp = empsToAssign[idx % empsToAssign.length]
        docsToInsert.push({
          name: l.name || 'Prospective Lead',
          mobile: l.mobile || '',
          cleanMobile: l.cleanMobile || '',
          email: l.email ? l.email.toLowerCase() : '',
          college: l.college || 'Independent / Unspecified College',
          domain: l.domain || 'Web Development',
          priority: l.priority || 'Warm',
          priorityScore: l.priorityScore || 50,
          rawText: l.rawText || '',
          missingFields: Array.isArray(l.missingFields) ? l.missingFields : [],
          status: 'Not Called',
          callNotes: '',
          assignedTo: {
            empId: emp.empId,
            name: emp.name,
            email: emp.email,
            department: emp.department
          },
          assignedBy: {
            name: req.user.name || 'Administrator',
            email: req.user.email
          },
          assignedAt: now,
          batchId
        })
      })
    }

    const inserted = await Lead.insertMany(docsToInsert)

    const breakdown = empsToAssign.map(emp => ({
      email: emp.email,
      name: emp.name,
      assignedCount: docsToInsert.filter(d => d.assignedTo.email === emp.email).length
    }))

    const message = empsToAssign.length === 1
      ? `Successfully assigned and distributed ${inserted.length} leads to ${empsToAssign[0].name}!`
      : `Successfully distributed ${inserted.length} leads to ${empsToAssign.length} employees (${mode === 'all' ? 'Sent to all' : 'Split evenly'})!`

    return res.status(201).json({
      success: true,
      message,
      count: inserted.length,
      batchId,
      distributionMode: mode,
      assignedEmployeesCount: empsToAssign.length,
      breakdown,
      assignedTo: empsToAssign.length === 1 ? {
        name: empsToAssign[0].name,
        email: empsToAssign[0].email
      } : undefined
    })
  } catch (err) {
    console.error('[AI Data Controller Error] assignLeadsToEmployee:', err)
    return res.status(500).json({
      success: false,
      message: 'Failed to assign leads to employee',
      error: err.message
    })
  }
}

// @desc    Admin: Get distribution statistics, employee metrics, and master lead list
// @route   GET /api/leads/admin-stats
// @access  Private (Admin only)
export const getAdminStatsAndLeads = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Access denied. Administrator privileges required.' })
    }

    const { employeeEmail, status, college, domain, priority, search, limit = 50, page = 1 } = req.query

    const filter = {}
    if (employeeEmail) filter['assignedTo.email'] = employeeEmail.toLowerCase()
    if (status && status !== 'All') filter.status = status
    if (college && college !== 'All') filter.college = college
    if (domain && domain !== 'All') filter.domain = domain
    if (priority && priority !== 'All') filter.priority = priority

    if (search) {
      const searchRegex = { $regex: search, $options: 'i' }
      filter.$or = [
        { name: searchRegex },
        { mobile: searchRegex },
        { email: searchRegex },
        { college: searchRegex },
        { domain: searchRegex },
        { 'assignedTo.name': searchRegex }
      ]
    }

    const totalLeads = await Lead.countDocuments()
    const notCalledCount = await Lead.countDocuments({ status: 'Not Called' })
    const calledCount = await Lead.countDocuments({ status: 'Called' })
    const interestedCount = await Lead.countDocuments({ status: 'Interested' })
    const notInterestedCount = await Lead.countDocuments({ status: 'Not Interested' })
    const completedCalls = calledCount + interestedCount + notInterestedCount
    const overallConversionRate = completedCalls > 0 ? Math.round((interestedCount / completedCalls) * 100) : 0

    const employeeAggregation = await Lead.aggregate([
      {
        $group: {
          _id: '$assignedTo.email',
          employeeName: { $first: '$assignedTo.name' },
          empId: { $first: '$assignedTo.empId' },
          department: { $first: '$assignedTo.department' },
          totalAssigned: { $sum: 1 },
          notCalledCount: {
            $sum: { $cond: [{ $eq: ['$status', 'Not Called'] }, 1, 0] }
          },
          calledCount: {
            $sum: { $cond: [{ $eq: ['$status', 'Called'] }, 1, 0] }
          },
          interestedCount: {
            $sum: { $cond: [{ $eq: ['$status', 'Interested'] }, 1, 0] }
          },
          notInterestedCount: {
            $sum: { $cond: [{ $eq: ['$status', 'Not Interested'] }, 1, 0] }
          }
        }
      },
      { $sort: { totalAssigned: -1 } }
    ])

    const employeeBreakdown = employeeAggregation.map(emp => {
      const finished = emp.calledCount + emp.interestedCount + emp.notInterestedCount
      const rate = finished > 0 ? Math.round((emp.interestedCount / finished) * 100) : 0
      return {
        email: emp._id,
        name: emp.employeeName || emp._id,
        empId: emp.empId || 'EMP',
        department: emp.department || 'BDA',
        totalAssigned: emp.totalAssigned,
        pendingCount: emp.notCalledCount,
        calledCount: emp.calledCount,
        interestedCount: emp.interestedCount,
        notInterestedCount: emp.notInterestedCount,
        completedCount: finished,
        conversionRate: rate
      }
    })

    const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10)
    const [leads, filteredCount] = await Promise.all([
      Lead.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit, 10)),
      Lead.countDocuments(filter)
    ])

    return res.status(200).json({
      success: true,
      stats: {
        totalLeads,
        notCalledCount,
        calledCount,
        interestedCount,
        notInterestedCount,
        completedCalls,
        conversionRate: overallConversionRate
      },
      employeeBreakdown,
      domains: PREDEFINED_DOMAINS,
      leads,
      pagination: {
        total: filteredCount,
        page: parseInt(page, 10),
        limit: parseInt(limit, 10),
        pages: Math.ceil(filteredCount / parseInt(limit, 10))
      }
    })
  } catch (err) {
    console.error('[AI Data Controller Error] getAdminStatsAndLeads:', err)
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch admin lead statistics',
      error: err.message
    })
  }
}

// @desc    Employee: Get personal calling list and progress
// @route   GET /api/leads/my-calling-list
// @access  Private (Employee / Authenticated User)
export const getMyCallingList = async (req, res) => {
  try {
    const userEmail = req.user.email.toLowerCase()
    const { status, college, domain, priority, search } = req.query

    const filter = { 'assignedTo.email': userEmail }

    if (status && status !== 'All') {
      filter.status = status
    }
    if (college && college !== 'All') {
      filter.college = college
    }
    if (domain && domain !== 'All') {
      filter.domain = domain
    }
    if (priority && priority !== 'All') {
      filter.priority = priority
    }

    if (search) {
      const searchRegex = { $regex: search, $options: 'i' }
      filter.$or = [
        { name: searchRegex },
        { mobile: searchRegex },
        { email: searchRegex },
        { college: searchRegex },
        { domain: searchRegex }
      ]
    }

    const [totalAssigned, pendingCount, calledCount, interestedCount, notInterestedCount] = await Promise.all([
      Lead.countDocuments({ 'assignedTo.email': userEmail }),
      Lead.countDocuments({ 'assignedTo.email': userEmail, status: 'Not Called' }),
      Lead.countDocuments({ 'assignedTo.email': userEmail, status: 'Called' }),
      Lead.countDocuments({ 'assignedTo.email': userEmail, status: 'Interested' }),
      Lead.countDocuments({ 'assignedTo.email': userEmail, status: 'Not Interested' })
    ])

    const totalContacted = calledCount + interestedCount + notInterestedCount
    const conversionRate = totalContacted > 0 ? Math.round((interestedCount / totalContacted) * 100) : 0

    const leads = await Lead.find(filter).sort({ priorityScore: -1, createdAt: -1 })

    const uniqueColleges = await Lead.distinct('college', { 'assignedTo.email': userEmail })
    const uniqueDomains = await Lead.distinct('domain', { 'assignedTo.email': userEmail })

    return res.status(200).json({
      success: true,
      stats: {
        totalAssigned,
        pendingCount,
        calledCount,
        interestedCount,
        notInterestedCount,
        totalContacted,
        conversionRate
      },
      filters: {
        colleges: uniqueColleges.filter(Boolean),
        domains: uniqueDomains.filter(Boolean)
      },
      count: leads.length,
      leads
    })
  } catch (err) {
    console.error('[AI Data Controller Error] getMyCallingList:', err)
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch personal calling list',
      error: err.message
    })
  }
}

// @desc    Update lead call status and notes
// @route   PATCH /api/leads/:id/status
// @access  Private (Assigned Employee or Admin)
export const updateLeadStatusAndNotes = async (req, res) => {
  try {
    const { id } = req.params
    const { status, callNotes } = req.body

    const lead = await Lead.findById(id)
    if (!lead) {
      return res.status(404).json({ success: false, message: 'Lead not found.' })
    }

    const isAdmin = req.user.role === 'admin'
    const isOwner = lead.assignedTo?.email === req.user.email.toLowerCase()

    if (!isAdmin && !isOwner) {
      return res.status(403).json({ success: false, message: 'Access denied. You can only update leads assigned to you.' })
    }

    if (status && ['Not Called', 'Called', 'Interested', 'Not Interested'].includes(status)) {
      lead.status = status
      if (status !== 'Not Called') {
        lead.calledAt = new Date()
      }
    }

    if (callNotes !== undefined) {
      lead.callNotes = callNotes
    }

    await lead.save()

    return res.status(200).json({
      success: true,
      message: `Lead status updated to "${lead.status}" successfully!`,
      lead
    })
  } catch (err) {
    console.error('[AI Data Controller Error] updateLeadStatusAndNotes:', err)
    return res.status(500).json({
      success: false,
      message: 'Failed to update lead status',
      error: err.message
    })
  }
}

// @desc    Admin: Delete a lead
// @route   DELETE /api/leads/:id
// @access  Private (Admin only)
export const deleteLead = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Access denied. Administrator privileges required.' })
    }

    const { id } = req.params
    const deleted = await Lead.findByIdAndDelete(id)
    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Lead not found.' })
    }

    return res.status(200).json({
      success: true,
      message: 'Lead deleted successfully!'
    })
  } catch (err) {
    console.error('[AI Data Controller Error] deleteLead:', err)
    return res.status(500).json({
      success: false,
      message: 'Failed to delete lead',
      error: err.message
    })
  }
}
