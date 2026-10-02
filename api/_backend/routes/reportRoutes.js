import express from 'express'
import { protect } from '../middleware/auth.js'
import {
  submitDailyReport,
  updateDailyReportByAdmin,
  getDailyReports,
  getTodayDailyStatus,
  submitMailBlastReport,
  getMailBlastReports,
  getCollegesList
} from '../controllers/reportController.js'

const router = express.Router()

// All report routes require valid authentication token
router.use(protect)

// Daily Reports
router.post('/daily', submitDailyReport)
router.put('/daily/:id', updateDailyReportByAdmin)
router.patch('/daily/:id', updateDailyReportByAdmin)
router.get('/daily', getDailyReports)
router.get('/daily/today-status', getTodayDailyStatus)
router.get('/today-status', getTodayDailyStatus)

// Robust aliases for direct /reports and /reports/submit calls
router.post('/', submitDailyReport)
router.get('/', getDailyReports)
router.post('/submit', submitDailyReport)
router.post('/submit-daily', submitDailyReport)

// Mail Blast Reports & College Dropdown
router.post('/mail-blast', submitMailBlastReport)
router.get('/mail-blast', getMailBlastReports)
router.get('/colleges', getCollegesList)

export default router
