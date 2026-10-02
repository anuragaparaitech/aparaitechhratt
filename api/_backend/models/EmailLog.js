import mongoose from 'mongoose'

const EmailLogSchema = new mongoose.Schema({
  recipient: {
    type: String,
    required: true,
    lowercase: true,
    trim: true
  },
  subject: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['success', 'failure'],
    required: true
  },
  errorMessage: {
    type: String
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
})

const EmailLog = mongoose.model('EmailLog', EmailLogSchema)
export default EmailLog
