import express from 'express'
import { protect } from '../middleware/auth.js'
import {
  processAIBulkData,
  assignLeadsToEmployee,
  getAdminStatsAndLeads,
  getMyCallingList,
  updateLeadStatusAndNotes,
  deleteLead
} from '../controllers/leadController.js'

const router = express.Router()

// All lead routes require authentication
router.use(protect)

// Admin AI processing & distribution
router.post('/ai-process', processAIBulkData)
router.post('/process', processAIBulkData)
router.post('/assign', assignLeadsToEmployee)
router.get('/admin-stats', getAdminStatsAndLeads)

// Employee Calling List
router.get('/my-calling-list', getMyCallingList)
router.get('/my-leads', getMyCallingList)

// Lead update & deletion
router.patch('/:id/status', updateLeadStatusAndNotes)
router.put('/:id/status', updateLeadStatusAndNotes)
router.delete('/:id', deleteLead)

export default router
