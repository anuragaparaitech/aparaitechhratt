import mongoose from 'mongoose'

const leaveSchema = new mongoose.Schema({
  employeeId: {
    type: String,
    required: true
  },
  employeeName: {
    type: String,
    required: true
  },
  employeeEmail: {
    type: String,
    required: true,
    lowercase: true,
    trim: true
  },
  teamName: {
    type: String,
    default: 'BDA'
  },
  leaveType: {
    type: String,
    enum: ['Casual Leave', 'Sick Leave', 'Privilege Leave', 'Emergency Leave', 'Exam Leave'],
    default: 'Casual Leave'
  },
  startDate: {
    type: String,
    required: true
  },
  endDate: {
    type: String,
    required: true
  },
  totalDays: {
    type: Number,
    default: 1
  },
  reason: {
    type: String,
    required: true,
    trim: true
  },
  status: {
    type: String,
    enum: ['Pending', 'Approved', 'Rejected'],
    default: 'Pending'
  },
  reviewedBy: {
    type: String,
    default: null
  },
  reviewedAt: {
    type: Date,
    default: null
  },
  managerComments: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
})

const Leave = mongoose.model('Leave', leaveSchema)
export default Leave
