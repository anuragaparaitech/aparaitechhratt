import express from 'express'
import { protect } from '../middleware/auth.js'
import {
  getRepoOverview,
  getRepoCommits,
  getRepoPulls,
  getRepoBranches,
  getRepoIssues
} from '../controllers/repoController.js'

const router = express.Router()

router.use(protect)

router.get('/overview', getRepoOverview)
router.get('/commits', getRepoCommits)
router.get('/pulls', getRepoPulls)
router.get('/branches', getRepoBranches)
router.get('/issues', getRepoIssues)

export default router
