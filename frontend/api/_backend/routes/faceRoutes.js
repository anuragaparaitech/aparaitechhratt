import express from 'express'
import {
  enrollFace,
  getEnrolledFace,
  resetFace,
  getAllFaceStatus,
  saveAttendancePhoto
} from '../controllers/faceController.js'

const router = express.Router()

// GET all employees with face enrollment status (admin)
router.get('/all-status', getAllFaceStatus)

// POST enroll or update a face (admin or self)
router.post('/enroll', enrollFace)

// POST save captured photo to an attendance record
router.post('/save-attendance-photo', saveAttendancePhoto)

// GET enrolled face for a specific employee
router.get('/:email', getEnrolledFace)

// DELETE reset enrolled face (admin)
router.delete('/:email', resetFace)

export default router
