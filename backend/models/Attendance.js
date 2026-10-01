import mongoose from 'mongoose'

const AttendanceSchema = new mongoose.Schema({
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
    lowercase: true
  },
  department: {
    type: String,
    required: true
  },
  date: {
    type: String,
    required: true // Format: YYYY-MM-DD
  },
  checkIn: {
    type: String,
    required: true // Format: HH:MM
  },
  checkOut: {
    type: String // Format: HH:MM
  },
  workingHours: {
    type: String
  },
  status: {
    type: String,
    enum: ['full-day', 'half-day', 'quarter-day', 'pending', 'worked-on-holiday', 'holiday'],
    default: 'pending'
  },
  statusReason: {
    type: String
  },
  markedBy: {
    type: String,
    enum: ['Employee', 'Admin'],
    default: 'Employee'
  },
  adminCheckInEmailSent: {
    type: Boolean,
    default: false
  },
  adminCheckOutEmailSent: {
    type: Boolean,
    default: false
  },
  logoutType: {
    type: String,
    enum: ['Normal', 'Admin Physical Logout', 'Auto Checkout'],
    default: 'Normal'
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  // Face Verification Fields (optional — added by webcam feature, safe to be absent)
  checkInPhoto: {
    type: String // URL path to check-in captured photo
  },
  checkOutPhoto: {
    type: String // URL path to check-out captured photo
  },
  faceVerified: {
    type: Boolean,
    default: null // null = not verified (no face system), true = verified, false = failed
  },
  faceScore: {
    type: Number // Similarity score 0-100
  },
  faceVerifiedAt: {
    type: Date // Timestamp of verification
  }
}, {
  timestamps: true
})

const Attendance = mongoose.model('Attendance', AttendanceSchema)
export default Attendance
