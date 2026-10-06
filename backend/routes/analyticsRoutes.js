import express from 'express'
import { protect } from '../middleware/auth.js'
import {
  getMyPerformance,
  getLeaderboard,
  getRevenueTracker,
  getTeamOverview,
  getInternTarget,
  setInternTarget,
  getBdaSalaryCriteria,
  updateBdaSalaryCriteria,
  updateEmployeeTenureMonth
} from '../controllers/analyticsController.js'

const router = express.Router()

router.use(protect)

router.get('/my-performance', getMyPerformance)
router.get('/leaderboard', getLeaderboard)
router.get('/revenue', getRevenueTracker)
router.get('/team-overview', getTeamOverview)
router.get('/target', getInternTarget)
router.post('/target', setInternTarget)
router.get('/bda-salary-criteria', getBdaSalaryCriteria)
router.post('/bda-salary-criteria', updateBdaSalaryCriteria)
router.post('/bda-employee-tenure', updateEmployeeTenureMonth)

export default router
