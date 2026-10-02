import mongoose from 'mongoose'

const HolidaySchema = new mongoose.Schema({
  holidayName: {
    type: String,
    required: true,
    trim: true
  },
  holidayDate: {
    type: String,
    required: true // Format: YYYY-MM-DD
  },
  holidayType: {
    type: String,
    enum: ['National Holiday', 'Company Holiday', 'Festival Holiday', 'Optional Holiday'],
    required: true
  },
  description: {
    type: String,
    trim: true
  },
  branch: {
    type: String,
    default: 'All Branches'
  },
  department: {
    type: String,
    default: 'All Departments'
  },
  appliesTo: {
    type: String,
    enum: ['All Employees', 'Selected Employees'],
    default: 'All Employees'
  },
  employeeIds: {
    type: [String], // Array of employee emails
    default: []
  },
  isPaidHoliday: {
    type: String,
    enum: ['Yes', 'No'],
    default: 'Yes'
  },
  createdBy: {
    type: String // Admin email
  }
}, {
  timestamps: true
})

const Holiday = mongoose.model('Holiday', HolidaySchema)
export default Holiday
