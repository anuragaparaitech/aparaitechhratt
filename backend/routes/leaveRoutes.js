import express from 'express'
import { protect, adminOnly } from '../middleware/auth.js'
import { applyLeave, getMyLeaves, getAllLeaves, updateLeaveStatus, deleteLeave } from '../controllers/leaveController.js'

const router = express.Router()

router.use(protect)

router.post('/apply', applyLeave)
router.get('/my-leaves', getMyLeaves)
router.get('/', getAllLeaves)
router.put('/:id/status', updateLeaveStatus)
router.delete('/:id', deleteLeave)

export default router

