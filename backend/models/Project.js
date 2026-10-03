import mongoose from 'mongoose'

const projectMilestoneSchema = new mongoose.Schema({
  title: { type: String, required: true },
  targetDate: { type: String, required: true },
  status: { type: String, enum: ['Pending', 'In Progress', 'Completed'], default: 'Pending' },
  completedAt: { type: Date, default: null }
})

const projectCommentSchema = new mongoose.Schema({
  senderName: { type: String, required: true },
  senderEmail: { type: String, required: true },
  text: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
})

const projectFileSchema = new mongoose.Schema({
  name: { type: String, required: true },
  url: { type: String, required: true },
  uploadedBy: { type: String },
  uploadedAt: { type: Date, default: Date.now }
})

const projectSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  code: {
    type: String,
    required: true,
    trim: true,
    uppercase: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  category: {
    type: String,
    default: 'Web Application'
  },
  techStack: [{
    type: String
  }],
  repositoryUrl: {
    type: String,
    default: 'https://github.com/anuragaparaitech/aparaitechhratt'
  },
  assignedTeam: [{
    empId: String,
    name: String,
    email: String,
    role: String
  }],
  leadName: {
    type: String,
    default: 'Anurag Nand'
  },
  leadEmail: {
    type: String,
    default: 'anunand2004@gmail.com'
  },
  startDate: {
    type: String,
    default: () => new Date().toISOString().split('T')[0]
  },
  deadline: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['Planning', 'Active', 'In Progress', 'In Review', 'Completed', 'On Hold'],
    default: 'Active'
  },
  progressPercentage: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  milestones: [projectMilestoneSchema],
  files: [projectFileSchema],
  comments: [projectCommentSchema],
  createdBy: {
    type: String,
    default: 'Management'
  }
}, {
  timestamps: true
})

const Project = mongoose.models.Project || mongoose.model('Project', projectSchema)
export default Project
