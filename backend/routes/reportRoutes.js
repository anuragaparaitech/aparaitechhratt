import express from 'express'
import { protect } from '../middleware/auth.js'
import {
  submitDailyReport,
  getDailyReports,
  getTodayDailyStatus,
  submitMailBlastReport,
  getMailBlastReports
} from '../controllers/reportController.js'

const router = express.Router()

// All report routes require valid authentication token
router.use(protect)

// Daily Reports
router.post('/daily', submitDailyReport)
router.get('/daily', getDailyReports)
router.get('/daily/today-status', getTodayDailyStatus)

// Mail Blast Reports
router.post('/mail-blast', submitMailBlastReport)
router.get('/mail-blast', getMailBlastReports)

export default router
