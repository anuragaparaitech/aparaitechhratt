import mongoose from 'mongoose'

const DailyReportSchema = new mongoose.Schema({
  employeeId: {
    type: String,
    required: true,
    trim: true
  },
  employeeEmail: {
    type: String,
    required: true,
    lowercase: true,
    trim: true
  },
  employeeName: {
    type: String,
    required: true,
    trim: true
  },
  teamName: {
    type: String,
    required: true,
    trim: true
  },
  reportType: {
    type: String,
    enum: ['bda', 'software'],
    default: 'bda'
  },
  reportDate: {
    type: String,
    required: true, // Format: YYYY-MM-DD
    trim: true
  },
  reportTime: {
    type: String,
    required: true, // Format: HH:MM or HH:MM AM/PM
    trim: true
  },

  // ── Software Engineering Specific Report Fields ─────────────────────────
  tasksCompleted: {
    type: String,
    default: ''
  },
  tasksInProgress: {
    type: String,
    default: ''
  },
  tasksPending: {
    type: String,
    default: ''
  },
  hoursWorked: {
    type: Number,
    default: 0
  },
  blockers: {
    type: String,
    default: ''
  },
  planTomorrow: {
    type: String,
    default: ''
  },
  githubPrs: {
    type: String,
    default: ''
  },

  // ── BDA / Sales Report Fields (Maintained with 100% backward compatibility) ─
  connectedCalls: {
    type: Number,
    default: 0,
    min: 0
  },
  callsAbove3Min: {
    type: Number,
    default: 0,
    min: 0
  },
  groupsCreated: {
    type: Number,
    default: 0,
    min: 0
  },
  membersInGroups: {
    type: Number,
    default: 0,
    min: 0
  },
  onboardingConversions: {
    type: Number,
    default: 0,
    min: 0
  },
  finalizeConversions: {
    type: Number,
    default: 0,
    min: 0
  },
  fullConversions: {
    type: Number,
    default: 0,
    min: 0
  },
  todayConversions: {
    type: Number,
    default: 0,
    min: 0
  },
  revenue: {
    type: Number,
    default: 0
  },
  remarks: {
    type: String,
    default: '',
    trim: true
  },
  updatedByAdmin: {
    type: String,
    default: null
  }
}, {
  timestamps: true
})

// Index for efficient search by date and email
DailyReportSchema.index({ reportDate: -1, employeeEmail: 1 })
DailyReportSchema.index({ reportDate: -1, teamName: 1 })
DailyReportSchema.index({ reportDate: -1, reportType: 1 })

const DailyReport = mongoose.model('DailyReport', DailyReportSchema)
export default DailyReport
