import express from 'express'
import { protect } from '../middleware/auth.js'
import {
  createTask,
  getMyTasks,
  getAllTasks,
  updateTaskStatus,
  updateTask,
  addTaskComment,
  addTaskAttachment,
  deleteTask
} from '../controllers/taskController.js'

const router = express.Router()

router.use(protect)

router.get('/my-tasks', getMyTasks)
router.get('/', getAllTasks)
router.post('/', createTask)
router.post('/create', createTask)
router.put('/:id', updateTask)
router.put('/:id/status', updateTaskStatus)
router.patch('/:id/status', updateTaskStatus)
router.post('/:id/comments', addTaskComment)
router.post('/:id/attachments', addTaskAttachment)
router.delete('/:id', deleteTask)

export default router
