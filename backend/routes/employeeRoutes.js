import express from 'express'
import { 
  getAllEmployees, 
  addEmployee, 
  deleteEmployee, 
  toggleEmployeeStatus,
  deleteAllEmployees,
  updateEmployee
} from '../controllers/employeeController.js'

const router = express.Router()

router.get('/', getAllEmployees)
router.post('/', addEmployee)
router.put('/:email', updateEmployee)
router.delete('/', deleteAllEmployees)
router.delete('/:email', deleteEmployee)
router.post('/toggle-status', toggleEmployeeStatus)

export default router
