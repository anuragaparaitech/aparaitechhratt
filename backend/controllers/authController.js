import Employee from '../models/Employee.js'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'

export const login = async (req, res) => {
  const { email, password } = req.body
  console.log(`🔑 Login request received for email: ${email}`)
  
  try {
    const employee = await Employee.findOne({ email: email.toLowerCase() })
    
    if (!employee) {
      console.warn(`❌ Login failed: User not found for email ${email}`)
      return res.status(401).json({ message: 'Invalid email or password' })
    }
    console.log(`👤 User found: ${employee.name} (${employee.role})`)
    
    if (employee.status !== 'active') {
      console.warn(`🚫 Login failed: Account ${email} is disabled`)
      return res.status(403).json({ message: 'Account is disabled. Please contact the administrator.' })
    }
    
    // Password comparison (bcrypt check with plain text fallback)
    let isMatch = false
    const isBcryptHash = (pwd) => /^\$2[ayb]\$.{56}$/.test(pwd)

    if (isBcryptHash(employee.password)) {
      isMatch = await bcrypt.compare(password, employee.password)
      console.log(`🔒 Bcrypt password comparison. Match result: ${isMatch}`)
    } else {
      isMatch = employee.password === password
      console.log(`📄 Plain text password comparison. Match result: ${isMatch}`)
      
      // Auto-migrate plain text password to hashed format in database on successful login
      if (isMatch) {
        try {
          const salt = await bcrypt.genSalt(10)
          employee.password = await bcrypt.hash(password, salt)
          await employee.save()
          console.log(`🔐 Migrated plain text password to bcrypt for ${employee.email}`)
        } catch (migErr) {
          console.error(`⚠️ Password migration error for ${employee.email}:`, migErr.message)
        }
      }
    }
    
    if (!isMatch) {
      console.warn(`❌ Login failed: Incorrect password for ${email}`)
      return res.status(401).json({ message: 'Invalid email or password' })
    }
    
    // JWT token generation
    const jwtSecret = process.env.JWT_SECRET || 'aparaitech_hrms_default_secret_key_2026'
    const token = jwt.sign(
      { id: employee._id, userId: employee._id, email: employee.email, role: employee.role },
      jwtSecret,
      { expiresIn: '30d' }
    )
    console.log(`🎫 JWT token generated successfully for ${email}`)
    
    res.status(200).json({
      message: 'Login successful',
      token,
      user: {
        id: employee._id,
        empId: employee.empId,
        name: employee.name,
        email: employee.email,
        department: employee.department,
        role: employee.role,
        status: employee.status
      }
    })
  } catch (error) {
    console.error(`💥 Authentication error for ${email}:`, error.message)
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

export const changePassword = async (req, res) => {
  const { email, oldPassword, newPassword } = req.body
  console.log(`🔒 Change password request received for: ${email}`)
  
  try {
    const employee = await Employee.findOne({ email: email.toLowerCase() })
    
    if (!employee) {
      console.warn(`❌ Change password failed: User not found for email ${email}`)
      return res.status(404).json({ message: 'Employee not found' })
    }
    
    // Validate current password
    let isMatch = false
    const isBcryptHash = (pwd) => /^\$2[ayb]\$.{56}$/.test(pwd)

    if (isBcryptHash(employee.password)) {
      isMatch = await bcrypt.compare(oldPassword, employee.password)
    } else {
      isMatch = employee.password === oldPassword
    }

    if (!isMatch) {
      console.warn(`❌ Change password failed: Incorrect current password for ${email}`)
      return res.status(400).json({ message: 'Current password incorrect' })
    }
    
    // Hash new password using bcrypt
    const salt = await bcrypt.genSalt(10)
    employee.password = await bcrypt.hash(newPassword, salt)
    await employee.save()
    console.log(`✅ Password updated and hashed successfully for ${email}`)
    
    res.status(200).json({ message: 'Password updated successfully' })
  } catch (error) {
    console.error(`💥 Change password error for ${email}:`, error.message)
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}
