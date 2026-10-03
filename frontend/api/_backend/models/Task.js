import mongoose from 'mongoose'

const taskCommentSchema = new mongoose.Schema({
  senderName: { type: String, required: true },
  senderEmail: { type: String, required: true },
  text: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
})

const taskAttachmentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  url: { type: String, required: true },
  uploadedAt: { type: Date, default: Date.now }
})

const taskHistorySchema = new mongoose.Schema({
  action: { type: String, required: true },
  performedBy: { type: String, required: true },
  timestamp: { type: Date, default: Date.now }
})

const taskSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  assignedToEmail: {
    type: String,
    required: true,
    lowercase: true,
    trim: true
  },
  assignedToName: {
    type: String,
    required: true
  },
  assignedToId: {
    type: String,
    default: 'AP-EMP'
  },
  assignedByEmail: {
    type: String,
    required: true
  },
  assignedByName: {
    type: String,
    required: true
  },
  teamName: {
    type: String,
    default: 'Development'
  },
  projectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    default: null
  },
  projectName: {
    type: String,
    default: 'Aparaitech Core'
  },
  category: {
    type: String,
    enum: ['Feature', 'Bug', 'Refactor', 'Documentation', 'DevOps', 'General'],
    default: 'Feature'
  },
  deadline: {
    type: String,
    required: true
  },
  priority: {
    type: String,
    enum: ['Low', 'Medium', 'High', 'Urgent', 'Normal', 'Important'],
    default: 'Medium'
  },
  status: {
    type: String,
    enum: ['To Do', 'In Progress', 'In Review', 'Done', 'Pending', 'Completed'],
    default: 'To Do'
  },
  estimatedHours: {
    type: Number,
    default: 4
  },
  actualHours: {
    type: Number,
    default: 0
  },
  attachments: [taskAttachmentSchema],
  history: [taskHistorySchema],
  comments: [taskCommentSchema],
  completionNotes: {
    type: String,
    default: ''
  },
  completedAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
})

const Task = mongoose.models.Task || mongoose.model('Task', taskSchema)
export default Task
