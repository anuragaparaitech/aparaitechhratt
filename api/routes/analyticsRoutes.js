import express from 'express'
import { protect } from '../middleware/auth.js'
import {
  getMyPerformance,
  getLeaderboard,
  getRevenueTracker,
  getTeamOverview
} from '../controllers/analyticsController.js'

const router = express.Router()

router.use(protect)

router.get('/my-performance', getMyPerformance)
router.get('/leaderboard', getLeaderboard)
router.get('/revenue', getRevenueTracker)
router.get('/team-overview', getTeamOverview)

export default router
