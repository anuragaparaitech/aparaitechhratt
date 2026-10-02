import express from 'express'
import { protect } from '../middleware/auth.js'
import { createTask, getMyTasks, getAllTasks, updateTaskStatus, addTaskComment } from '../controllers/taskController.js'

const router = express.Router()

router.use(protect)

router.post('/', createTask)
router.get('/my-tasks', getMyTasks)
router.get('/', getAllTasks)
router.put('/:id/status', updateTaskStatus)
router.post('/:id/comments', addTaskComment)

export default router
