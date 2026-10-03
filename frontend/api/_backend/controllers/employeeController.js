import Employee from '../models/Employee.js'
import Attendance from '../models/Attendance.js'
import ActiveSession from '../models/ActiveSession.js'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import bcrypt from 'bcryptjs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const PROFILE_UPLOADS_DIR = path.join(__dirname, '..', 'profile-uploads')

if (!fs.existsSync(PROFILE_UPLOADS_DIR)) {
  fs.mkdirSync(PROFILE_UPLOADS_DIR, { recursive: true })
}

const DEFAULT_PWD = 'Aparaitech123@'

// Predefined Active Employees:
// - Software Developers -> Shift 1 (07:00 AM - 11:00 AM)
// - BDA / Sales Active Members -> Shift 2 (11:00 AM - 05:00 PM)
const activeEmployeesList = [
  { empId: '7086', name: 'Disha Kale', email: 'kaledisha868@gmail.com', phone: '8767416802', department: 'BDA', designation: 'BDA', status: 'active', shift: 'shift_2' },
  { empId: '7087', name: 'Nikita Maruti Survase', email: 'nikitasurvase2125@gmail.com', phone: '8055055645', department: 'BDA', designation: 'BDA', status: 'active', shift: 'shift_2' },
  { empId: '7088', name: 'Shweta Vijay Chougale', email: 'shwetachougale2004@gmail.com', phone: '8010252987', department: 'BDA', designation: 'BDA', status: 'active', shift: 'shift_2' },
  { empId: '7089', name: 'Dnyaneshwari Sanjay Dandagawhal', email: 'dandagaehaldnyaneshwari@gmail.com', phone: '9307293946', department: 'BDA', designation: 'BDA', status: 'active', shift: 'shift_2' },
  { empId: '7090', name: 'Sejal Milind Pethe', email: 'sejalpethe640@gmail.com', phone: '7058668138', department: 'BDA', designation: 'BDA', status: 'active', shift: 'shift_2' },
  { empId: '7091', name: 'Anmol Mohan Ugale', email: 'anmolugale13@gmail.com', phone: '9021625125', department: 'BDA', designation: 'BDA', status: 'active', shift: 'shift_2' },
  { empId: '7092', name: 'Shraddha Dipak Dhepe', email: 'shraddhadhepe610@gmail.com', phone: '8208591006', department: 'BDA', designation: 'BDA', status: 'active', shift: 'shift_2' },
  { empId: '7093', name: 'Chetna Kishor Kothawade', email: 'chetnakothawade@gmail.com', phone: '7020855433', department: 'BDA', designation: 'BDA', status: 'active', shift: 'shift_2' },
  { empId: '7094', name: 'Shital Kantilal Bhade', email: 'shitalbhade74@gmail.com', phone: '8830292849', department: 'BDA', designation: 'BDA', status: 'active', shift: 'shift_2' },
  { empId: '7095', name: 'Vaishnavi Deepak Patil', email: 'patilvaishnavi30102003@gmail.com', phone: '7709232088', department: 'BDA', designation: 'BDA', status: 'active', shift: 'shift_2' },
  { empId: '7096', name: 'Ashvini Sanjay Rajput', email: 'rajputashu204@gmail.com', phone: '9359549993', department: 'BDA', designation: 'BDA', status: 'active', shift: 'shift_2' },
  { empId: '7097', name: 'Vikesh Kumar', email: 'kvikesh535@gmail.com', phone: '8793039515', department: 'BDA', designation: 'BDA', status: 'active', shift: 'shift_2' },
  { empId: '7098', name: 'Hemant Pawar', email: 'hemantbp9172@gmail.com', phone: '9172948195', department: 'BDA', designation: 'BDA', status: 'active', shift: 'shift_2' },
  { empId: '7099', name: 'Arman Momin', email: 'armanmomin202@gmail.com', phone: '9322955240', department: 'BDA', designation: 'BDA', status: 'active', shift: 'shift_2' },
  { empId: '7100', name: 'Tanmay Bhapkar', email: 'bhapkartanmay88@gmail.com', phone: '9172875676', department: 'BDA', designation: 'BDA', status: 'active', shift: 'shift_2' },
  // Software Developers -> Shift 1 (07:00 AM - 11:00 AM)
  { empId: '7101', name: 'Rutik Yadav', email: 'rutikyadav2004@gmail.com', phone: '7666921571', department: 'Development', designation: 'Software developer', status: 'active', shift: 'shift_1' },
  { empId: '7102', name: 'Pavan Mali', email: 'pavanmali0281@gmail.com', phone: '7249830281', department: 'Development', designation: 'Software developer', status: 'active', shift: 'shift_1' },
  { empId: '7017', name: 'Anurag Nand', email: 'anunand2004@gmail.com', department: 'Management', designation: 'Technical Lead & Management', role: 'manager', status: 'active', shift: 'shift_1' },
  { empId: '7044', name: 'Vivek Jagtap', email: 'letsmailvivek100@gmail.com', department: 'Development', designation: 'Software developer', status: 'active', shift: 'shift_1' },
  { empId: '7056', name: 'Mahesh Kadam', email: 'kadammahesh803@gmail.com', department: 'Development', designation: 'Software developer', status: 'active', shift: 'shift_1' },
  { empId: '7103', name: 'Liza', email: 'liza@aparaitech.com', department: 'BDA', designation: 'BDA Associate', status: 'active', shift: 'shift_2' }
]


export const seedDatabase = async () => {
  try {
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@aparaitech.com'
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin123'

    // 1. Ensure the admin account always exists by checking email OR empId: 'ADMIN001'
    const adminExists = await Employee.findOne({
      $or: [
        { email: adminEmail.toLowerCase() },
        { empId: 'ADMIN001' }
      ]
    })

    const salt = await bcrypt.genSalt(10)

    if (!adminExists) {
      console.log(`🌱 Admin account not found. Seeding admin account: ${adminEmail}...`)
      const hashedAdminPassword = await bcrypt.hash(adminPassword, salt)
      await Employee.create({
        empId: 'ADMIN001',
        name: 'Administrator',
        email: adminEmail.toLowerCase(),
        password: hashedAdminPassword,
        department: 'Management',
        role: 'admin',
        status: 'active'
      })
      console.log('✅ Admin account seeded successfully!')
    } else {
      // If it exists but has a different email/password than configured in .env, update it so it matches .env!
      let needUpdate = false
      if (adminExists.email !== adminEmail.toLowerCase() || adminExists.role !== 'admin') {
        needUpdate = true
      } else {
        const isBcryptHash = (pwd) => /^\$2[ayb]\$.{56}$/.test(pwd)
        let isMatch = false
        if (isBcryptHash(adminExists.password)) {
          isMatch = await bcrypt.compare(adminPassword, adminExists.password)
        } else {
          isMatch = adminExists.password === adminPassword
        }
        if (!isMatch) needUpdate = true
      }

      if (needUpdate) {
        console.log(`🔄 Updating existing admin account to match configured .env values...`)
        adminExists.email = adminEmail.toLowerCase()
        adminExists.password = await bcrypt.hash(adminPassword, salt)
        adminExists.role = 'admin'
        await adminExists.save()
        console.log('✅ Admin account credentials updated successfully!')
      }
    }

    const hashedDefaultPassword = await bcrypt.hash(DEFAULT_PWD, salt)

    // 2. Upsert/seed active employees (7086-7102 + Anurag Nand, Vivek Jagtap, Mahesh)
    const activeEmails = []
    for (const emp of activeEmployeesList) {
      activeEmails.push(emp.email.toLowerCase())
      if (emp.email === 'anunand2004@gmail.com') {
        activeEmails.push('anunanad2004@gmail.com')
      }

      const query = {
        $or: [
          { email: emp.email.toLowerCase() },
          ...(emp.email === 'anunand2004@gmail.com' ? [{ email: 'anunanad2004@gmail.com' }] : []),
          { empId: emp.empId }
        ]
      }

      const existingEmp = await Employee.findOne(query)
      if (existingEmp) {
        existingEmp.status = 'active'
        existingEmp.name = emp.name
        existingEmp.email = emp.email.toLowerCase()
        if (emp.role) existingEmp.role = emp.role
        if (emp.phone) existingEmp.phone = emp.phone
        if (emp.department) existingEmp.department = emp.department
        if (emp.designation) existingEmp.designation = emp.designation
        existingEmp.shift = emp.shift || (existingEmp.department === 'Development' ? 'shift_1' : 'shift_2')
        await existingEmp.save()
      } else {
        await Employee.create({
          empId: emp.empId,
          name: emp.name,
          email: emp.email.toLowerCase(),
          password: hashedDefaultPassword,
          department: emp.department || 'Development',
          designation: emp.designation || '',
          phone: emp.phone || '',
          role: emp.role || 'employee',
          status: 'active',
          shift: emp.shift || (emp.department === 'Development' ? 'shift_1' : 'shift_2')
        })
      }
    }

    // 3. Remove only explicitly inactive employee records
    const deleteResult = await Employee.deleteMany({
      role: { $ne: 'admin' },
      status: 'inactive'
    })
    if (deleteResult.deletedCount > 0) {
      console.log(`🗑️ Removed ${deleteResult.deletedCount} inactive employee records from database.`)
    }

    console.log('✅ Employee sync completed: Active employees updated, inactive employees removed.')
  } catch (error) {
    console.error('❌ Seeding error:', error.message)
  }
}

export const getAllEmployees = async (req, res) => {
  console.log(`[API Request] GET /api/employees received.`)
  try {
    await seedDatabase()
    const employees = await Employee.find({})
    console.log(`[API Success] GET /api/employees retrieved: ${employees.length} employees.`)
    res.status(200).json({ employees })
  } catch (error) {
    console.error(`[API Error] GET /api/employees failed:`, error.stack)
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

export const addEmployee = async (req, res) => {
  const { empId, name, email, department, password, joiningDate, phone, dob, shift } = req.body
  
  try {
    const existingEmail = await Employee.findOne({ email: email.toLowerCase() })
    if (existingEmail) {
      return res.status(400).json({ message: 'Email already exists' })
    }
    
    let finalEmpId = empId ? empId.trim() : ''
    
    if (finalEmpId) {
      const existingEmpId = await Employee.findOne({ empId: finalEmpId })
      if (existingEmpId) {
        return res.status(400).json({ message: 'Employee ID already exists' })
      }
    } else {
      // Generate sequential Employee ID
      const allEmployees = await Employee.find({})
      let maxId = 0
      allEmployees.forEach(e => {
        if (e.empId && e.empId.startsWith('AP')) {
          const num = parseInt(e.empId.replace('AP', ''))
          if (!isNaN(num) && num > maxId) maxId = num
        }
      })
      
      const newNum = maxId + 1
      finalEmpId = `AP${newNum}`
    }
    
    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(password || DEFAULT_PWD, salt)

    const newEmployee = new Employee({
      empId: finalEmpId,
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      department,
      role: 'employee',
      status: 'active',
      shift: shift || (department === 'Development' ? 'shift_1' : 'shift_2'),
      joinDate: joiningDate || new Date().toISOString().split('T')[0],
      phone: phone || '',
      dob: dob || ''
    })
    
    await newEmployee.save()
    res.status(201).json({ message: 'Employee added successfully', employee: newEmployee })
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

export const deleteEmployee = async (req, res) => {
  const { email } = req.params
  
  try {
    const employee = await Employee.findOne({ email: email.toLowerCase() })
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' })
    }
    
    // Delete employee, their attendance history, and active sessions
    await Employee.deleteOne({ email: email.toLowerCase() })
    await Attendance.deleteMany({ employeeEmail: email.toLowerCase() })
    await ActiveSession.deleteOne({ employeeEmail: email.toLowerCase() })
    
    res.status(200).json({ message: 'Employee and their logs deleted successfully' })
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

export const toggleEmployeeStatus = async (req, res) => {
  const { email } = req.body
  
  try {
    const employee = await Employee.findOne({ email: email.toLowerCase() })
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' })
    }
    
    employee.status = employee.status === 'active' ? 'inactive' : 'active'
    await employee.save()
    
    res.status(200).json({ message: `Employee status changed to ${employee.status}`, status: employee.status })
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

export const deleteAllEmployees = async (req, res) => {
  try {
    // Delete all except admins
    await Employee.deleteMany({ role: 'employee' })
    await Attendance.deleteMany({})
    await ActiveSession.deleteMany({})
    
    res.status(200).json({ message: 'All employees (except Admin) and attendance cleared successfully' })
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

export const updateEmployee = async (req, res) => {
  const { email } = req.params
  const { name, phone, designation, department, status, profileImageBase64, dob, shift } = req.body

  try {
    const employee = await Employee.findOne({ email: email.toLowerCase() })
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' })
    }

    if (name !== undefined) employee.name = name
    if (phone !== undefined) employee.phone = phone
    if (dob !== undefined) employee.dob = dob
    if (designation !== undefined) employee.designation = designation
    if (department !== undefined) employee.department = department
    if (status !== undefined) employee.status = status
    if (shift !== undefined) employee.shift = shift

    // Handle base64 profile image if provided
    if (profileImageBase64) {
      // Basic MIME validation
      if (!profileImageBase64.startsWith('data:image/')) {
        return res.status(400).json({ message: 'Invalid profile image format. Must be a valid image data URL.' })
      }

      const mimeMatch = profileImageBase64.match(/^data:(image\/[a-zA-Z+]+);base64,/)
      if (!mimeMatch) {
        return res.status(400).json({ message: 'Invalid profile image base64 format' })
      }

      const mimeType = mimeMatch[1]
      const allowedMimes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
      if (!allowedMimes.includes(mimeType)) {
        return res.status(400).json({ message: 'Only JPEG, PNG, and WebP profile images are allowed' })
      }

      const base64Data = profileImageBase64.replace(/^data:image\/[a-zA-Z+]+;base64,/, '')
      const imageBuffer = Buffer.from(base64Data, 'base64')

      if (imageBuffer.length > 5 * 1024 * 1024) {
        return res.status(400).json({ message: 'Profile image size must be under 5MB' })
      }

      // Sanitize filename using empId
      const safeEmpId = employee.empId.replace(/[^a-zA-Z0-9_-]/g, '_')
      const ext = mimeType === 'image/png' ? 'png' : 'jpg'
      const filename = `profile_${safeEmpId}_${Date.now()}.${ext}`
      const filePath = path.join(PROFILE_UPLOADS_DIR, filename)

      // Delete old profile image if it exists and is on disk
      if (employee.profileImageUrl) {
        const oldFilename = path.basename(employee.profileImageUrl)
        const oldPath = path.join(PROFILE_UPLOADS_DIR, oldFilename)
        if (fs.existsSync(oldPath)) {
          try {
            fs.unlinkSync(oldPath)
          } catch (err) {
            console.error('Failed to delete old profile image:', err.message)
          }
        }
      }

      fs.writeFileSync(filePath, imageBuffer)
      employee.profileImageUrl = `/profile-uploads/${filename}`
    }

    await employee.save()

    // Also update any live sessions for this employee to keep name/dept in sync
    try {
      await ActiveSession.updateMany({ employeeEmail: employee.email }, {
        $set: {
          name: employee.name,
          department: employee.department
        }
      })
    } catch (sessionErr) {
      console.error('Error updating live sessions:', sessionErr.message)
    }

    res.status(200).json({ message: 'Employee updated successfully', employee })
  } catch (error) {
    res.status(500).json({ message: 'Server error during employee update', error: error.message })
  }
}
