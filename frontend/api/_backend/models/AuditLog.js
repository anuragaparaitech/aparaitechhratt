import mongoose from 'mongoose'

const AuditLogSchema = new mongoose.Schema({
  action: {
    type: String,
    required: true,
    enum: ['MANUAL_CHECKOUT', 'CHECKIN_REMINDER_CRON', 'CHECKOUT_REMINDER_CRON', 'MANUAL_WEBHOOK_TRIGGER', 'SYSTEM_AUTO_CHECKOUT']
  },
  details: {
    type: String,
    required: true
  },
  performedBy: {
    type: String,
    required: true,
    default: 'SYSTEM'
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
})

const AuditLog = mongoose.model('AuditLog', AuditLogSchema)
export default AuditLog
