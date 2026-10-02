import Holiday from '../models/Holiday.js'
import Employee from '../models/Employee.js'
import { sendHolidayEmail } from '../services/emailService.js'

// GET /api/holidays
export const getHolidays = async (req, res) => {
  const { year, month } = req.query
  console.log(`[API Request] GET /api/holidays received. Query:`, req.query)
  
  try {
    let query = {}
    
    if (year) {
      // Matches the year prefix, e.g. "2026-"
      query.holidayDate = new RegExp(`^${year}-`)
      
      if (month) {
        // Matches year and month, e.g. "2026-07-"
        const formattedMonth = month.padStart(2, '0')
        query.holidayDate = new RegExp(`^${year}-${formattedMonth}-`)
      }
    }
    
    const holidays = await Holiday.find(query).sort({ holidayDate: 1 })
    console.log(`[API Success] GET /api/holidays retrieved: ${holidays.length} holidays.`)
    res.status(200).json({ holidays })
  } catch (error) {
    console.error(`[API Error] GET /api/holidays failed:`, error.stack)
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

// GET /api/holidays/today
export const getHolidayToday = async (req, res) => {
  const { email } = req.query
  const todayStr = new Date().toISOString().split('T')[0]
  
  try {
    let query = { holidayDate: todayStr }
    
    const holiday = await Holiday.findOne(query)
    if (!holiday) {
      return res.status(200).json({ isHoliday: false, holiday: null })
    }
    
    // Check if the holiday applies to this specific employee
    if (email && holiday.appliesTo === 'Selected Employees') {
      const emailLower = email.toLowerCase()
      const isIncluded = holiday.employeeIds.some(empEmail => empEmail.toLowerCase() === emailLower)
      if (!isIncluded) {
        return res.status(200).json({ isHoliday: false, holiday: null })
      }
    }
    
    res.status(200).json({ isHoliday: true, holiday })
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

// GET /api/holidays/upcoming
export const getUpcomingHolidays = async (req, res) => {
  const { email } = req.query
  const todayStr = new Date().toISOString().split('T')[0]
  
  try {
    // Find holidays scheduled for today or in the future
    const allUpcoming = await Holiday.find({ holidayDate: { $gte: todayStr } }).sort({ holidayDate: 1 })
    
    let filteredHolidays = allUpcoming
    
    // Filter if it applies to specific employee
    if (email) {
      const emailLower = email.toLowerCase()
      filteredHolidays = allUpcoming.filter(holiday => {
        if (holiday.appliesTo === 'All Employees') return true
        return holiday.employeeIds.some(empEmail => empEmail.toLowerCase() === emailLower)
      })
    }
    
    res.status(200).json({ holidays: filteredHolidays })
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

// POST /api/holidays (Admin Only)
export const createHoliday = async (req, res) => {
  const { holidayName, holidayDate, holidayType, description, branch, department, appliesTo, employeeIds, isPaidHoliday, createdBy } = req.body
  
  try {
    // Check if a holiday already exists on this date
    const existing = await Holiday.findOne({ holidayDate })
    if (existing) {
      return res.status(400).json({ message: `A holiday named "${existing.holidayName}" is already declared for this date.` })
    }
    
    const newHoliday = new Holiday({
      holidayName,
      holidayDate,
      holidayType,
      description,
      branch: branch || 'All Branches',
      department: department || 'All Departments',
      appliesTo: appliesTo || 'All Employees',
      employeeIds: employeeIds || [],
      isPaidHoliday: isPaidHoliday || 'Yes',
      createdBy
    })
    
    await newHoliday.save()
    
    // Asynchronously send announcement emails to affected employees
    const triggerEmails = async () => {
      try {
        let targets = []
        if (newHoliday.appliesTo === 'All Employees') {
          // Fetch all active employees
          targets = await Employee.find({ role: 'employee', status: 'active' })
        } else {
          // Fetch selected employees by email checklist
          const emailsLower = newHoliday.employeeIds.map(e => e.toLowerCase())
          targets = await Employee.find({ email: { $in: emailsLower }, status: 'active' })
        }
        
        for (const employee of targets) {
          await sendHolidayEmail(employee, newHoliday)
        }
      } catch (err) {
        console.error('Non-blocking holiday announcement email error:', err.message)
      }
    }
    
    triggerEmails()
    
    res.status(201).json({ message: 'Holiday created successfully', holiday: newHoliday })
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

// PUT /api/holidays/:id (Admin Only)
export const updateHoliday = async (req, res) => {
  const { id } = req.params
  const updates = req.body
  
  try {
    const holiday = await Holiday.findById(id)
    if (!holiday) {
      return res.status(404).json({ message: 'Holiday not found' })
    }
    
    // If date is being changed, make sure there's no conflict
    if (updates.holidayDate && updates.holidayDate !== holiday.holidayDate) {
      const existing = await Holiday.findOne({ holidayDate: updates.holidayDate })
      if (existing) {
        return res.status(400).json({ message: `Conflict: A holiday named "${existing.holidayName}" exists on this new date.` })
      }
    }
    
    Object.assign(holiday, updates)
    await holiday.save()
    
    res.status(200).json({ message: 'Holiday updated successfully', holiday })
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

// DELETE /api/holidays/:id (Admin Only)
export const deleteHoliday = async (req, res) => {
  const { id } = req.params
  
  try {
    const holiday = await Holiday.findById(id)
    if (!holiday) {
      return res.status(404).json({ message: 'Holiday not found' })
    }
    
    await Holiday.deleteOne({ _id: id })
    res.status(200).json({ message: 'Holiday deleted successfully' })
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}
