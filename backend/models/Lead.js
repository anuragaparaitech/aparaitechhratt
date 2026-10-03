import mongoose from 'mongoose'

const leadSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  mobile: {
    type: String,
    trim: true,
    default: ''
  },
  cleanMobile: {
    type: String,
    trim: true,
    index: true,
    default: ''
  },
  email: {
    type: String,
    lowercase: true,
    trim: true,
    default: ''
  },
  college: {
    type: String,
    trim: true,
    default: 'Independent / Unspecified College'
  },
  domain: {
    type: String,
    trim: true,
    default: 'Web Development'
  },
  priority: {
    type: String,
    enum: ['Hot', 'Warm', 'Cold'],
    default: 'Warm'
  },
  priorityScore: {
    type: Number,
    default: 50
  },
  rawText: {
    type: String,
    default: ''
  },
  missingFields: {
    type: [String],
    default: []
  },
  isDuplicate: {
    type: Boolean,
    default: false
  },
  status: {
    type: String,
    enum: ['Not Called', 'Called', 'Interested', 'Not Interested'],
    default: 'Not Called',
    index: true
  },
  callNotes: {
    type: String,
    default: ''
  },
  calledAt: {
    type: Date
  },
  assignedTo: {
    empId: { type: String, default: '' },
    name: { type: String, default: '' },
    email: { type: String, lowercase: true, index: true },
    department: { type: String, default: 'BDA' }
  },
  assignedBy: {
    name: { type: String, default: 'Administrator' },
    email: { type: String, default: 'admin@aparaitech.com' }
  },
  assignedAt: {
    type: Date,
    default: Date.now
  },
  batchId: {
    type: String,
    index: true
  }
}, {
  timestamps: true
})

// Compound index for fast queries by assigned employee and status
leadSchema.index({ 'assignedTo.email': 1, status: 1, priority: 1 })
leadSchema.index({ college: 1, domain: 1 })

const Lead = mongoose.models.Lead || mongoose.model('Lead', leadSchema)

export default Lead
