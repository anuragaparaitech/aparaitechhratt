import Project from '../models/Project.js'

// @desc    Get all projects (with optional filters)
// @route   GET /api/projects
// @access  Private
export const getAllProjects = async (req, res) => {
  try {
    const { status, category, search, myProjects } = req.query
    const query = {}

    if (status && status !== 'all') {
      query.status = status
    }
    if (category && category !== 'all') {
      query.category = category
    }
    if (search && search.trim()) {
      query.$or = [
        { title: { $regex: search.trim(), $options: 'i' } },
        { code: { $regex: search.trim(), $options: 'i' } },
        { description: { $regex: search.trim(), $options: 'i' } }
      ]
    }
    if (myProjects === 'true' && req.user) {
      query.$or = [
        { 'assignedTeam.email': req.user.email.toLowerCase() },
        { leadEmail: req.user.email.toLowerCase() }
      ]
    }

    let projects = await Project.find(query).sort({ updatedAt: -1 })

    // If database has 0 projects, seed initial core software projects
    if (projects.length === 0 && !search && !status && !category && myProjects !== 'true') {
      const defaultProjects = [
        {
          title: 'Aparaitech Enterprise Work & Attendance Portal',
          code: 'PRJ-HRMS',
          description: 'High-availability cross-platform workforce management system featuring biometric face recognition, geofencing, daily work logs, and performance tracking.',
          category: 'Web & Mobile App',
          techStack: ['React', 'Node.js', 'Express', 'MongoDB', 'Capacitor', 'Vite'],
          repositoryUrl: 'https://github.com/anuragaparaitech/aparaitechhratt',
          leadName: 'Anurag Nand',
          leadEmail: 'anunand2004@gmail.com',
          deadline: '2026-12-31',
          status: 'Active',
          progressPercentage: 85,
          assignedTeam: [
            { empId: '7017', name: 'Anurag Nand', email: 'anunand2004@gmail.com', role: 'Technical Lead' },
            { empId: '7101', name: 'Rutik Yadav', email: 'rutikyadav2004@gmail.com', role: 'Full Stack Developer' },
            { empId: '7102', name: 'Pavan Mali', email: 'pavanmali0281@gmail.com', role: 'Frontend Engineer' },
            { empId: '7044', name: 'Vivek Jagtap', email: 'letsmailvivek100@gmail.com', role: 'Backend Developer' },
            { empId: '7056', name: 'Mahesh Kadam', email: 'kadammahesh803@gmail.com', role: 'QA & DevOps' }
          ],
          milestones: [
            { title: 'Core Biometric & Geofence Engine', targetDate: '2026-08-15', status: 'Completed', completedAt: new Date('2026-08-14') },
            { title: 'AI Lead Desk & Analytics Sync', targetDate: '2026-09-30', status: 'Completed', completedAt: new Date('2026-09-28') },
            { title: 'Software Engineering Work Portal v2.0', targetDate: '2026-10-15', status: 'In Progress' },
            { title: 'Full Cloud CI/CD & Automated Backups', targetDate: '2026-11-30', status: 'Pending' }
          ],
          comments: [
            { senderName: 'Anurag Nand', senderEmail: 'anunand2004@gmail.com', text: 'Software Engineering portal modules integrated. Next sprint focuses on automated report reminders.', createdAt: new Date() }
          ]
        },
        {
          title: 'Aparaitech Learning Management System (LMS)',
          code: 'PRJ-LMS',
          description: 'Educational technology platform delivering structured engineering bootcamps, automated assignments grading, and student certification.',
          category: 'Web Application',
          techStack: ['Next.js', 'React', 'Node.js', 'PostgreSQL', 'TailwindCSS'],
          repositoryUrl: 'https://github.com/anuragaparaitech/lms-portal',
          leadName: 'Anurag Nand',
          leadEmail: 'anunand2004@gmail.com',
          deadline: '2026-11-20',
          status: 'In Progress',
          progressPercentage: 60,
          assignedTeam: [
            { empId: '7017', name: 'Anurag Nand', email: 'anunand2004@gmail.com', role: 'Technical Lead' },
            { empId: '7101', name: 'Rutik Yadav', email: 'rutikyadav2004@gmail.com', role: 'Full Stack Developer' },
            { empId: '7044', name: 'Vivek Jagtap', email: 'letsmailvivek100@gmail.com', role: 'Backend Developer' }
          ],
          milestones: [
            { title: 'Course Content Management & Video Player', targetDate: '2026-09-10', status: 'Completed', completedAt: new Date('2026-09-08') },
            { title: 'Student Quiz & Code Playground', targetDate: '2026-10-25', status: 'In Progress' },
            { title: 'Certificates Generation with Verification Hash', targetDate: '2026-11-15', status: 'Pending' }
          ]
        },
        {
          title: 'AI Data Distribution & Auto Calling Engine',
          code: 'PRJ-AI-CRM',
          description: 'Intelligent lead scoring, call queue balancer, and real-time revenue pipeline tracking for commercial business operations.',
          category: 'AI & Data Services',
          techStack: ['Python', 'FastAPI', 'Node.js', 'MongoDB', 'Chart.js'],
          repositoryUrl: 'https://github.com/anuragaparaitech/ai-calling-engine',
          leadName: 'Anurag Nand',
          leadEmail: 'anunand2004@gmail.com',
          deadline: '2026-10-30',
          status: 'Active',
          progressPercentage: 90,
          assignedTeam: [
            { empId: '7017', name: 'Anurag Nand', email: 'anunand2004@gmail.com', role: 'Technical Lead' },
            { empId: '7102', name: 'Pavan Mali', email: 'pavanmali0281@gmail.com', role: 'Frontend Engineer' }
          ],
          milestones: [
            { title: 'Dynamic Weighted Queue Algorithm', targetDate: '2026-09-01', status: 'Completed', completedAt: new Date('2026-08-30') },
            { title: 'Live Calling Desk UI with Conversion Flow', targetDate: '2026-10-02', status: 'Completed', completedAt: new Date('2026-10-01') },
            { title: 'WhatsApp Webhook Automation', targetDate: '2026-10-28', status: 'In Progress' }
          ]
        }
      ]

      await Project.insertMany(defaultProjects)
      projects = await Project.find(query).sort({ updatedAt: -1 })
    }

    res.json({ success: true, count: projects.length, data: projects })
  } catch (error) {
    console.error('getAllProjects error:', error)
    res.status(500).json({ success: false, message: 'Server error retrieving projects', error: error.message })
  }
}

// @desc    Get single project by ID
// @route   GET /api/projects/:id
// @access  Private
export const getProjectById = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' })
    }
    res.json({ success: true, data: project })
  } catch (error) {
    console.error('getProjectById error:', error)
    res.status(500).json({ success: false, message: 'Server error retrieving project', error: error.message })
  }
}

// @desc    Create new project
// @route   POST /api/projects
// @access  Private (Admin, Lead, Manager)
export const createProject = async (req, res) => {
  try {
    const { title, code, description, category, techStack, repositoryUrl, deadline, assignedTeam, leadName, leadEmail } = req.body

    if (!title || !code || !description || !deadline) {
      return res.status(400).json({ success: false, message: 'Title, code, description, and deadline are required' })
    }

    const existing = await Project.findOne({ code: code.toUpperCase() })
    if (existing) {
      return res.status(400).json({ success: false, message: `Project code '${code.toUpperCase()}' is already in use` })
    }

    const project = new Project({
      title,
      code: code.toUpperCase(),
      description,
      category: category || 'Web Application',
      techStack: Array.isArray(techStack) ? techStack : (techStack ? techStack.split(',').map(s => s.trim()) : ['React', 'Node.js']),
      repositoryUrl: repositoryUrl || 'https://github.com/anuragaparaitech/aparaitechhratt',
      deadline,
      assignedTeam: Array.isArray(assignedTeam) ? assignedTeam : [],
      leadName: leadName || req.user?.name || 'Technical Lead',
      leadEmail: leadEmail || req.user?.email || 'anunand2004@gmail.com',
      createdBy: req.user?.name || 'Management'
    })

    await project.save()
    res.status(201).json({ success: true, message: 'Project created successfully', data: project })
  } catch (error) {
    console.error('createProject error:', error)
    res.status(500).json({ success: false, message: 'Server error creating project', error: error.message })
  }
}

// @desc    Update project details
// @route   PUT /api/projects/:id
// @access  Private
export const updateProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' })
    }

    const { title, description, category, techStack, repositoryUrl, deadline, status, progressPercentage, assignedTeam, leadName, leadEmail } = req.body

    if (title) project.title = title
    if (description) project.description = description
    if (category) project.category = category
    if (techStack) project.techStack = Array.isArray(techStack) ? techStack : techStack.split(',').map(s => s.trim())
    if (repositoryUrl !== undefined) project.repositoryUrl = repositoryUrl
    if (deadline) project.deadline = deadline
    if (status) project.status = status
    if (progressPercentage !== undefined) project.progressPercentage = Number(progressPercentage)
    if (assignedTeam) project.assignedTeam = assignedTeam
    if (leadName) project.leadName = leadName
    if (leadEmail) project.leadEmail = leadEmail

    await project.save()
    res.json({ success: true, message: 'Project updated successfully', data: project })
  } catch (error) {
    console.error('updateProject error:', error)
    res.status(500).json({ success: false, message: 'Server error updating project', error: error.message })
  }
}

// @desc    Add milestone to project
// @route   POST /api/projects/:id/milestones
// @access  Private
export const addMilestone = async (req, res) => {
  try {
    const { title, targetDate, status } = req.body
    if (!title || !targetDate) {
      return res.status(400).json({ success: false, message: 'Milestone title and target date are required' })
    }

    const project = await Project.findById(req.params.id)
    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' })
    }

    project.milestones.push({
      title,
      targetDate,
      status: status || 'Pending',
      completedAt: status === 'Completed' ? new Date() : null
    })

    // Auto-update progress
    const total = project.milestones.length
    const completed = project.milestones.filter(m => m.status === 'Completed').length
    if (total > 0) {
      project.progressPercentage = Math.round((completed / total) * 100)
    }

    await project.save()
    res.json({ success: true, message: 'Milestone added successfully', data: project })
  } catch (error) {
    console.error('addMilestone error:', error)
    res.status(500).json({ success: false, message: 'Server error adding milestone', error: error.message })
  }
}

// @desc    Toggle or update milestone status
// @route   PUT /api/projects/:id/milestones/:milestoneId
// @access  Private
export const toggleMilestone = async (req, res) => {
  try {
    const { status } = req.body
    const project = await Project.findById(req.params.id)
    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' })
    }

    const milestone = project.milestones.id(req.params.milestoneId)
    if (!milestone) {
      return res.status(404).json({ success: false, message: 'Milestone not found' })
    }

    milestone.status = status || (milestone.status === 'Completed' ? 'Pending' : 'Completed')
    milestone.completedAt = milestone.status === 'Completed' ? new Date() : null

    // Recalculate progress percentage
    const total = project.milestones.length
    const completed = project.milestones.filter(m => m.status === 'Completed').length
    if (total > 0) {
      project.progressPercentage = Math.round((completed / total) * 100)
    }

    await project.save()
    res.json({ success: true, message: `Milestone updated to ${milestone.status}`, data: project })
  } catch (error) {
    console.error('toggleMilestone error:', error)
    res.status(500).json({ success: false, message: 'Server error updating milestone', error: error.message })
  }
}

// @desc    Add comment to project
// @route   POST /api/projects/:id/comments
// @access  Private
export const addProjectComment = async (req, res) => {
  try {
    const { text } = req.body
    if (!text || !text.trim()) {
      return res.status(400).json({ success: false, message: 'Comment text is required' })
    }

    const project = await Project.findById(req.params.id)
    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' })
    }

    project.comments.push({
      senderName: req.user.name,
      senderEmail: req.user.email.toLowerCase(),
      text: text.trim(),
      createdAt: new Date()
    })

    await project.save()
    res.json({ success: true, message: 'Comment added successfully', data: project })
  } catch (error) {
    console.error('addProjectComment error:', error)
    res.status(500).json({ success: false, message: 'Server error adding comment', error: error.message })
  }
}

// @desc    Delete project
// @route   DELETE /api/projects/:id
// @access  Private (Admin / Manager)
export const deleteProject = async (req, res) => {
  try {
    const isAuthorized = req.user.role === 'admin' || req.user.role === 'manager'
    if (!isAuthorized) {
      return res.status(403).json({ success: false, message: 'Only administrators or managers can delete projects' })
    }

    const project = await Project.findByIdAndDelete(req.params.id)
    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' })
    }

    res.json({ success: true, message: 'Project deleted successfully' })
  } catch (error) {
    console.error('deleteProject error:', error)
    res.status(500).json({ success: false, message: 'Server error deleting project', error: error.message })
  }
}
