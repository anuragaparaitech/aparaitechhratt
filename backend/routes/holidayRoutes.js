import express from 'express'
import {
  getHolidays,
  getHolidayToday,
  getUpcomingHolidays,
  createHoliday,
  updateHoliday,
  deleteHoliday
} from '../controllers/holidayController.js'

const router = express.Router()

router.get('/', getHolidays)
router.get('/today', getHolidayToday)
router.get('/upcoming', getUpcomingHolidays)
router.post('/', createHoliday)
router.put('/:id', updateHoliday)
router.delete('/:id', deleteHoliday)

export default router
