import express from 'express'
import { 
  getAttendanceRecords, 
  checkIn, 
  checkOut, 
  manualMark, 
  deleteRecord, 
  clearAll,
  getMissingCheckouts,
  performManualCheckout,
  triggerCheckInReminders,
  triggerCheckOutReminders,
  triggerAutoCheckout,
  triggerTestEmail
} from '../controllers/attendanceController.js'
import { protect } from '../middleware/auth.js'

const router = express.Router()

router.get('/', protect, getAttendanceRecords)
router.get('/missing-checkout', getMissingCheckouts)
router.post('/check-in', checkIn)
router.post('/check-out', checkOut)
router.post('/manual', manualMark)
router.post('/manual-checkout', performManualCheckout)
router.post('/reminders/check-in', triggerCheckInReminders)
router.post('/reminders/check-out', triggerCheckOutReminders)
router.post('/reminders/auto-checkout', triggerAutoCheckout)
router.post('/test-email', triggerTestEmail)
router.delete('/', clearAll)
router.delete('/:id', deleteRecord)

export default router
