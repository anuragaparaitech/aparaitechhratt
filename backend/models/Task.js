import mongoose from 'mongoose'

const taskCommentSchema = new mongoose.Schema({
  senderName: { type: String, required: true },
  senderEmail: { type: String, required: true },
  text: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
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
    default: 'BDA'
  },
  deadline: {
    type: String,
    required: true
  },
  priority: {
    type: String,
    enum: ['Normal', 'Important', 'Urgent'],
    default: 'Normal'
  },
  status: {
    type: String,
    enum: ['Pending', 'In Progress', 'Completed'],
    default: 'Pending'
  },
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

const Task = mongoose.model('Task', taskSchema)
export default Task
