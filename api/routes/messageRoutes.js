import express from 'express'
import {
  sendMessageToEmployee,
  sendBulkMessages,
  broadcastMessage,
  getAdminMessageHistory,
  getEmployeeMessages,
  markMessageAsRead,
  toggleArchiveMessage
} from '../controllers/messageController.js'
import { protect, adminOnly } from '../middleware/auth.js'

const router = express.Router()

// Employee routes
router.get('/employee', protect, getEmployeeMessages)
router.put('/:id/read', protect, markMessageAsRead)
router.put('/:id/archive', protect, toggleArchiveMessage)

// Admin routes
router.post('/send/:employeeId', protect, adminOnly, sendMessageToEmployee)
router.post('/send-bulk', protect, adminOnly, sendBulkMessages)
router.post('/broadcast', protect, adminOnly, broadcastMessage)
router.get('/admin/history', protect, adminOnly, getAdminMessageHistory)

export default router
