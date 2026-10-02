import mongoose from 'mongoose'

const MailBlastReportSchema = new mongoose.Schema({
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
  emailsSent: {
    type: Number,
    required: true,
    default: 0,
    min: 0
  },
  targetType: {
    type: String,
    enum: ['Random', 'College-wise'],
    default: 'Random',
    required: true
  },
  collegeName: {
    type: String,
    default: '',
    trim: true
  },
  templateUsed: {
    type: String,
    default: '',
    trim: true
  },
  responsesReceived: {
    type: Number,
    default: 0,
    min: 0
  },
  bounceCount: {
    type: Number,
    default: 0,
    min: 0
  },
  status: {
    type: String,
    enum: ['Completed', 'Pending'],
    default: 'Completed'
  },
  remarks: {
    type: String,
    default: '',
    trim: true
  }
}, {
  timestamps: true
})

MailBlastReportSchema.index({ reportDate: -1, employeeEmail: 1 })
MailBlastReportSchema.index({ reportDate: -1, collegeName: 1 })

const MailBlastReport = mongoose.model('MailBlastReport', MailBlastReportSchema)
export default MailBlastReport
