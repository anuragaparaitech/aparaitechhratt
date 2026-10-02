import express from 'express'
import {
  createConversion,
  getConversions,
  finalizePayment,
  getAdminAlerts
} from '../controllers/productConversionController.js'
import { protect } from '../middleware/auth.js'

const router = express.Router()

router.post('/', protect, createConversion)
router.get('/', protect, getConversions)
router.patch('/:id/finalize', protect, finalizePayment)
router.get('/admin-alerts', protect, getAdminAlerts)

export default router
