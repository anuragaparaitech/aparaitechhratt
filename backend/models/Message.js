import mongoose from 'mongoose'

const MessageSchema = new mongoose.Schema({
  senderAdminId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee',
    required: true
  },
  recipientEmployeeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee',
    required: false // Null if it is a broadcast message
  },
  isBroadcast: {
    type: Boolean,
    default: false
  },
  subject: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  attachmentUrl: {
    type: String,
    default: null
  },
  deliveryStatus: {
    type: String,
    enum: ['delivered', 'failed', 'pending'],
    default: 'pending'
  },
  readBy: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee'
  }]
}, {
  timestamps: true
})

const Message = mongoose.model('Message', MessageSchema)
export default Message
