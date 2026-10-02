import mongoose from 'mongoose'

const ActiveSessionSchema = new mongoose.Schema({
  employeeEmail: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  empId: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  department: {
    type: String,
    required: true
  },
  checkInTime: {
    type: String,
    required: true // Format: HH:MM
  },
  date: {
    type: String,
    required: true // Format: YYYY-MM-DD
  },
  shift: {
    type: String,
    default: 'shift_1'
  },
  latitude: {
    type: Number
  },
  longitude: {
    type: Number
  }
}, {
  timestamps: true
})

const ActiveSession = mongoose.model('ActiveSession', ActiveSessionSchema)
export default ActiveSession
