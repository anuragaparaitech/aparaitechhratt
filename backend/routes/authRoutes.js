import express from 'express'
import {
  login,
  changePassword,
  passcodeLogin,
  forgotPassword,
  verifyOtpAndReset,
  updateProfile
} from '../controllers/authController.js'
import { protect } from '../middleware/auth.js'

const router = express.Router()

router.post('/login', login)
router.post('/passcode-login', passcodeLogin)
router.post('/forgot-password', forgotPassword)
router.post('/verify-otp', verifyOtpAndReset)
router.post('/change-password', changePassword)
router.put('/profile', protect, updateProfile)

export default router

