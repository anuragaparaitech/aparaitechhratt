import express from 'express'
import { protect } from '../middleware/auth.js'
import {
  getAllProjects,
  getProjectById,
  createProject,
  updateProject,
  addMilestone,
  toggleMilestone,
  addProjectComment,
  deleteProject
} from '../controllers/projectController.js'

const router = express.Router()

router.use(protect)

router.get('/', getAllProjects)
router.post('/', createProject)
router.post('/create', createProject)
router.get('/:id', getProjectById)
router.put('/:id', updateProject)
router.delete('/:id', deleteProject)

router.post('/:id/milestones', addMilestone)
router.put('/:id/milestones/:milestoneId', toggleMilestone)
router.patch('/:id/milestones/:milestoneId', toggleMilestone)
router.post('/:id/comments', addProjectComment)

export default router
