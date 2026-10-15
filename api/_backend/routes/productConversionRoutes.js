import express from 'express'
import {
  createConversion,
  getConversions,
  finalizePayment,
  getAdminAlerts,
  updateConversion,
  sendIdCard,
  sendPaymentReminder
} from '../controllers/productConversionController.js'
import { protect } from '../middleware/auth.js'

const router = express.Router()

router.post('/', protect, createConversion)
router.post('/create', protect, createConversion)
router.post('/log', protect, createConversion)
router.post('/add', protect, createConversion)
router.get('/', protect, getConversions)
router.put('/:id', protect, updateConversion)
router.patch('/:id/finalize', protect, finalizePayment)
router.get('/admin-alerts', protect, getAdminAlerts)

// ID Card Approval & Dispatch through hr.aparaitechh@gmail.com
router.post('/:id/send-id-card', protect, sendIdCard)

// 7-Day Payment Balance Due Reminder through hr.aparaitechh@gmail.com
router.post('/:id/send-payment-reminder', protect, sendPaymentReminder)

export default router
