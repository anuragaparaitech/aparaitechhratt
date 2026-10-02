import express from 'express'
import { protect, adminOnly } from '../middleware/auth.js'
import { getAnnouncements, createAnnouncement, deleteAnnouncement } from '../controllers/announcementController.js'

const router = express.Router()

router.use(protect)

router.get('/', getAnnouncements)
router.post('/', createAnnouncement)
router.delete('/:id', adminOnly, deleteAnnouncement)

export default router
