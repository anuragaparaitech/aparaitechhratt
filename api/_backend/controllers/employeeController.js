import Employee from '../models/Employee.js'
import Attendance from '../models/Attendance.js'
import ActiveSession from '../models/ActiveSession.js'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import bcrypt from 'bcryptjs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const isServerless = process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME || Boolean(process.env.NOW_REGION)
const PROFILE_UPLOADS_DIR = isServerless 
  ? path.join('/tmp', 'profile-uploads') 
  : path.join(__dirname, '..', 'profile-uploads')

try {
  if (!fs.existsSync(PROFILE_UPLOADS_DIR)) {
    fs.mkdirSync(PROFILE_UPLOADS_DIR, { recursive: true })
  }
} catch (e) {
  console.warn('Filesystem notice (profile-uploads):', e.message)
}

const DEFAULT_PWD = 'Aparaitech123@'

// Predefined Active Employees:
// - Software Developers -> Shift 1 (07:00 AM - 11:00 AM)
// - BDA / Sales Active Members -> Shift 2 (11:00 AM - 05:00 PM)
const activeEmployeesList = [
  { empId: 'AP7086', name: 'Disha Kale', email: 'kaledisha868@gmail.com', phone: '8767416802', department: 'BDA', designation: 'BDA', status: 'active', shift: 'shift_2' },
  { empId: 'AP7087', name: 'Nikita Maruti Survase', email: 'nikitasurvase2125@gmail.com', phone: '8055055645', dob: '2001-08-03', department: 'BDA', designation: 'BDA', status: 'active', shift: 'shift_2' },
  { empId: 'AP7088', name: 'Shweta Vijay Chougale', email: 'shwetachougale2004@gmail.com', phone: '8010252987', department: 'BDA', designation: 'BDA', status: 'active', shift: 'shift_2' },
  { empId: 'AP7089', name: 'Dnyaneshwari Sanjay Dandagawhal', email: 'dandagaehaldnyaneshwari@gmail.com', phone: '9307293946', department: 'BDA', designation: 'BDA', status: 'active', shift: 'shift_2' },
  { empId: 'AP7090', name: 'Sejal Milind Pethe', email: 'sejalpethe640@gmail.com', phone: '7058668138', department: 'BDA', designation: 'BDA', status: 'active', shift: 'shift_2' },
  { empId: 'AP7091', name: 'Anmol Mohan Ugale', email: 'anmolugale13@gmail.com', phone: '9021625125', department: 'BDA', designation: 'BDA', status: 'active', shift: 'shift_2' },
  { empId: 'AP7092', name: 'Shraddha Dipak Dhepe', email: 'shraddhadhepe610@gmail.com', phone: '8208591006', department: 'BDA', designation: 'BDA', status: 'active', shift: 'shift_2' },
  { empId: 'AP7093', name: 'Chetna Kishor Kothawade', email: 'chetnakothawade@gmail.com', phone: '7020855433', dob: '2004-06-12', department: 'BDA', designation: 'BDA', status: 'active', shift: 'shift_2' },
  { empId: 'AP7094', name: 'Shital Kantilal Bhade', email: 'shitalbhade74@gmail.com', phone: '8830292849', department: 'BDA', designation: 'BDA', status: 'active', shift: 'shift_2' },
  { empId: 'AP7095', name: 'Vaishnavi Deepak Patil', email: 'patilvaishnavi30102003@gmail.com', phone: '7709232088', department: 'BDA', designation: 'BDA', status: 'active', shift: 'shift_2' },
  { empId: 'AP7096', name: 'Ashvini Sanjay Rajput', email: 'rajputaashu204@gmail.com', phone: '9359549993', department: 'BDA', designation: 'BDA', status: 'active', shift: 'shift_2' },
  { empId: 'AP7097', name: 'Vikesh Kumar', email: 'kvikesh535@gmail.com', phone: '8793039515', department: 'BDA', designation: 'BDA', status: 'active', shift: 'shift_2' },
  { empId: 'AP7098', name: 'Hemant Pawar', email: 'hemantbp9172@gmail.com', phone: '9172948195', dob: '2001-04-02', department: 'BDA', designation: 'BDA', status: 'active', shift: 'shift_2' },
  { empId: 'AP7099', name: 'Arman Momin', email: 'armanmomin202@gmail.com', phone: '9322955240', dob: '2004-03-21', department: 'BDA', designation: 'BDA', status: 'active', shift: 'shift_2' },
  { empId: 'AP7100', name: 'Tanmay Bhapkar', email: 'bhapkartanmay88@gmail.com', phone: '9172875676', department: 'BDA', designation: 'BDA', status: 'active', shift: 'shift_2' },
  // Software Developers -> Shift 1 (07:00 AM - 11:00 AM)
  { empId: 'AP7101', name: 'Rutik Yadav', email: 'rutikyadav2004@gmail.com', phone: '7666921571', department: 'Development', designation: 'Software developer', status: 'active', shift: 'shift_1' },
  { empId: 'AP7102', name: 'Pavan Mali', email: 'pavanmali0281@gmail.com', phone: '7249830281', department: 'Development', designation: 'Software developer', status: 'active', shift: 'shift_1' },
  { empId: 'AP7017', name: 'Anurag Nand', email: 'anunand2004@gmail.com', department: 'Management', designation: 'Technical Lead & Management', role: 'manager', status: 'active', shift: 'shift_1' },
  { empId: 'AP7044', name: 'Vivek Jagtap', email: 'letsmailvivek100@gmail.com', department: 'Development', designation: 'Software developer', status: 'active', shift: 'shift_1' },
  { empId: 'AP7056', name: 'Mahesh Kadam', email: 'kadammahesh803@gmail.com', department: 'Development', designation: 'Software developer', status: 'active', shift: 'shift_1' },
  { empId: 'AP7103', name: 'Komal Mallikarjun Talwar', email: 'talwarkomalmk@gmail.com', phone: '9699248913', dob: '2004-07-17', department: 'BDA', designation: 'BDA', status: 'active', shift: 'shift_2' },
  { empId: 'AP7104', name: 'Sanika Panaskar', email: 'sanikapanskar19@gmail.com', phone: '9325069174', dob: '2004-06-05', department: 'BDA', designation: 'BDA', status: 'active', shift: 'shift_2' }
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
        plainPassword: adminPassword,
        passcode: '1234',
        department: 'Management',
        role: 'admin',
        status: 'active'
      })
      console.log('✅ Admin account seeded successfully!')
    }

    const hashedDefaultPassword = await bcrypt.hash(DEFAULT_PWD, salt)

    // 2. Only seed initial employees if they do not exist yet!
    // Never overwrite an existing employee's details because admin or user may have edited them.
    for (const emp of activeEmployeesList) {
      const query = {
        $or: [
          { email: emp.email.toLowerCase() },
          { empId: emp.empId }
        ]
      }

      const existingEmp = await Employee.findOne(query)
      if (!existingEmp) {
        await Employee.create({
          empId: emp.empId,
          name: emp.name,
          email: emp.email.toLowerCase(),
          password: hashedDefaultPassword,
          plainPassword: DEFAULT_PWD,
          passcode: '1234',
          department: emp.department || 'Development',
          designation: emp.designation || '',
          phone: emp.phone || '',
          dob: emp.dob || '',
          role: emp.role || 'employee',
          status: 'active',
          shift: emp.shift || (emp.department === 'Development' ? 'shift_1' : 'shift_2')
        })
      }
    }

    console.log('✅ Database seed check completed.')
  } catch (error) {
    console.error('❌ Seeding error:', error.message)
  }
}

export const getAllEmployees = async (req, res) => {
  try {
    const count = await Employee.countDocuments()
    if (count === 0) {
      await seedDatabase()
    }
    const employees = await Employee.find({})
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin123'
    const formattedEmployees = employees.map(emp => {
      const obj = emp.toObject ? emp.toObject() : { ...emp }
      if (!obj.passcode) obj.passcode = '1234'
      if (!obj.plainPassword) {
        obj.plainPassword = (obj.role === 'admin' || obj.email === 'admin@aparaitech.com') ? adminPassword : DEFAULT_PWD
      }
      return obj
    })
    res.status(200).json({ employees: formattedEmployees })
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
  const { 
    name, 
    email: newEmail, 
    empId: newEmpId,
    phone, 
    designation, 
    department, 
    status, 
    profileImageBase64, 
    dob, 
    shift, 
    password, 
    passcode 
  } = req.body

  try {
    const target = (email || '').trim().toLowerCase()
    const employee = await Employee.findOne({
      $or: [
        { email: target },
        { empId: target.toUpperCase() }
      ]
    })
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' })
    }

    const oldEmail = employee.email.toLowerCase()
    const oldEmpId = employee.empId

    // 1. If email is being changed
    if (newEmail && newEmail.trim().toLowerCase() !== oldEmail) {
      const normalizedNewEmail = newEmail.trim().toLowerCase()
      const conflict = await Employee.findOne({
        email: normalizedNewEmail,
        _id: { $ne: employee._id }
      })
      if (conflict) {
        return res.status(400).json({ message: `Email ${normalizedNewEmail} is already in use by ${conflict.name}` })
      }
      employee.email = normalizedNewEmail

      // Cascade email updates across other collections
      try {
        await Attendance.updateMany({ employeeEmail: oldEmail }, { $set: { employeeEmail: normalizedNewEmail } })
        await ActiveSession.updateMany({ employeeEmail: oldEmail }, { $set: { employeeEmail: normalizedNewEmail } })
        const db = employee.db
        if (db) {
          await db.collection('dailyreports').updateMany({ employeeEmail: oldEmail }, { $set: { employeeEmail: normalizedNewEmail } }).catch(() => {})
          await db.collection('leaves').updateMany({ employeeEmail: oldEmail }, { $set: { employeeEmail: normalizedNewEmail } }).catch(() => {})
          await db.collection('tasks').updateMany({ assignedTo: oldEmail }, { $set: { assignedTo: normalizedNewEmail } }).catch(() => {})
          await db.collection('messages').updateMany({ senderEmail: oldEmail }, { $set: { senderEmail: normalizedNewEmail } }).catch(() => {})
          await db.collection('messages').updateMany({ recipientEmail: oldEmail }, { $set: { recipientEmail: normalizedNewEmail } }).catch(() => {})
          await db.collection('leads').updateMany({ assignedToEmail: oldEmail }, { $set: { assignedToEmail: normalizedNewEmail } }).catch(() => {})
        }
      } catch (cascadeErr) {
        console.warn('Notice: cascade email update error:', cascadeErr.message)
      }
    }

    // 2. If empId is being changed
    if (newEmpId && newEmpId.trim().toUpperCase() !== oldEmpId) {
      const normalizedNewEmpId = newEmpId.trim().toUpperCase()
      const empConflict = await Employee.findOne({
        empId: normalizedNewEmpId,
        _id: { $ne: employee._id }
      })
      if (empConflict) {
        return res.status(400).json({ message: `Employee ID ${normalizedNewEmpId} is already in use by ${empConflict.name}` })
      }
      employee.empId = normalizedNewEmpId

      try {
        await Attendance.updateMany({ empId: oldEmpId }, { $set: { empId: normalizedNewEmpId } })
      } catch (cascadeErr) {
        console.warn('Notice: cascade empId update error:', cascadeErr.message)
      }
    }

    if (name !== undefined) employee.name = name.trim()
    if (phone !== undefined) employee.phone = phone.trim()
    if (dob !== undefined) {
      let normalizedDob = dob.trim()
      if (/^\d{2}\/\d{2}\/\d{4}$/.test(normalizedDob)) {
        const [d, m, y] = normalizedDob.split('/')
        normalizedDob = `${y}-${m}-${d}`
      }
      employee.dob = normalizedDob
    }
    if (designation !== undefined) employee.designation = designation.trim()
    if (department !== undefined) employee.department = department.trim()
    if (status !== undefined) employee.status = status
    if (shift !== undefined) employee.shift = shift
    if (password && password.trim()) {
      const salt = await bcrypt.genSalt(10)
      employee.password = await bcrypt.hash(password.trim(), salt)
      employee.plainPassword = password.trim()
    }
    if (passcode !== undefined && String(passcode).trim().length === 4) {
      employee.passcode = String(passcode).trim()
    }

    // Handle base64 profile image if provided
    if (profileImageBase64) {
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

      try {
        fs.writeFileSync(filePath, imageBuffer)
        employee.profileImageUrl = `/profile-uploads/${filename}`
      } catch (writeErr) {
        console.warn('Notice: profile image disk write skipped:', writeErr.message)
      }
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
