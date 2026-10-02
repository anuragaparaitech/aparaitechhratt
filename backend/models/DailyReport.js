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
  connectedCalls: {
    type: Number,
    required: true,
    default: 0,
    min: 0
  },
  callsAbove3Min: {
    type: Number,
    required: true,
    default: 0,
    min: 0
  },
  groupsCreated: {
    type: Number,
    required: true,
    default: 0,
    min: 0
  },
  membersInGroups: {
    type: Number,
    required: true,
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
    required: true,
    default: 0,
    min: 0
  },
  revenue: {
    type: Number,
    required: true,
    default: 0 // Computed based on onboarding (1500) + finalize (4500) + full (6000)
  },
  remarks: {
    type: String,
    default: '',
    trim: true
  }
}, {
  timestamps: true
})

// Index for efficient search by date and email
DailyReportSchema.index({ reportDate: -1, employeeEmail: 1 })
DailyReportSchema.index({ reportDate: -1, teamName: 1 })

const DailyReport = mongoose.model('DailyReport', DailyReportSchema)
export default DailyReport
