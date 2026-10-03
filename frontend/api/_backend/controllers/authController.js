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
    
    // Hash new password using bcrypt and save plainPassword for Administrator access
    const salt = await bcrypt.genSalt(10)
    employee.password = await bcrypt.hash(newPassword, salt)
    employee.plainPassword = newPassword
    await employee.save()
    console.log(`✅ Password updated and hashed successfully for ${email}`)
    
    res.status(200).json({ message: 'Password updated successfully' })
  } catch (error) {
    console.error(`💥 Change password error for ${email}:`, error.message)
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

// 4-digit Passcode Login (PIN Pad Authentication)
export const passcodeLogin = async (req, res) => {
  const { email, passcode } = req.body
  try {
    const query = email ? { email: email.toLowerCase() } : {}
    const employee = await Employee.findOne(query)

    if (!employee) {
      return res.status(404).json({ success: false, message: 'Employee account not found' })
    }

    if (employee.status !== 'active') {
      return res.status(403).json({ success: false, message: 'Account is deactivated' })
    }

    const expectedPasscode = employee.passcode || '1234'
    if (String(passcode) !== String(expectedPasscode)) {
      return res.status(401).json({ success: false, message: 'Invalid 4-digit passcode PIN' })
    }

    const jwtSecret = process.env.JWT_SECRET || 'aparaitech_hrms_default_secret_key_2026'
    const token = jwt.sign(
      { id: employee._id, userId: employee._id, email: employee.email, role: employee.role },
      jwtSecret,
      { expiresIn: '30d' }
    )

    res.json({
      success: true,
      message: 'Passcode verified successfully',
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
    console.error('passcodeLogin error:', error)
    res.status(500).json({ success: false, message: 'Passcode login error', error: error.message })
  }
}

// Forgot Password - Request 6-digit OTP
export const forgotPassword = async (req, res) => {
  const { email } = req.body
  try {
    const employee = await Employee.findOne({ email: (email || '').toLowerCase() })
    if (!employee) {
      return res.status(404).json({ success: false, message: 'Employee with this email does not exist' })
    }

    // Generate random 6-digit OTP
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString()
    employee.resetOtp = {
      code: otpCode,
      expiresAt: new Date(Date.now() + 15 * 60 * 1000) // 15 minutes
    }
    await employee.save()

    console.log(`🔑 OTP generated for ${employee.email}: ${otpCode}`)

    res.json({
      success: true,
      message: `Verification OTP generated and sent to ${email}`,
      otpPreview: process.env.NODE_ENV !== 'production' ? otpCode : undefined
    })
  } catch (error) {
    console.error('forgotPassword error:', error)
    res.status(500).json({ success: false, message: 'Error generating reset OTP', error: error.message })
  }
}

// Verify OTP & Set New Password
export const verifyOtpAndReset = async (req, res) => {
  const { email, otp, newPassword } = req.body
  try {
    const employee = await Employee.findOne({ email: (email || '').toLowerCase() })
    if (!employee) {
      return res.status(404).json({ success: false, message: 'Employee not found' })
    }

    if (!employee.resetOtp || !employee.resetOtp.code) {
      return res.status(400).json({ success: false, message: 'No reset request found. Request a new OTP.' })
    }

    if (new Date() > new Date(employee.resetOtp.expiresAt)) {
      return res.status(400).json({ success: false, message: 'OTP has expired. Please request a new one.' })
    }

    if (String(employee.resetOtp.code) !== String(otp).trim()) {
      return res.status(400).json({ success: false, message: 'Invalid OTP code' })
    }

    // Set new password and plainPassword for Administrator access
    const salt = await bcrypt.genSalt(10)
    employee.password = await bcrypt.hash(newPassword, salt)
    employee.plainPassword = newPassword
    employee.resetOtp = undefined
    await employee.save()

    res.json({ success: true, message: 'Password reset successfully. You can now login with your new password.' })
  } catch (error) {
    console.error('verifyOtpAndReset error:', error)
    res.status(500).json({ success: false, message: 'Error resetting password', error: error.message })
  }
}

// Change 4-digit PIN / Passcode
export const changePasscode = async (req, res) => {
  const { email, oldPasscode, newPasscode } = req.body
  const targetEmail = (req.user?.email || email || '').toLowerCase().trim()
  
  if (!targetEmail) {
    return res.status(400).json({ success: false, message: 'Employee email is required' })
  }

  const cleanPin = String(newPasscode || '').trim()
  if (!cleanPin || cleanPin.length !== 4 || !/^\d{4}$/.test(cleanPin)) {
    return res.status(400).json({ success: false, message: 'Passcode PIN must be exactly 4 numeric digits (0-9)' })
  }

  try {
    const employee = await Employee.findOne({ email: targetEmail })
    if (!employee) {
      return res.status(404).json({ success: false, message: 'Employee not found' })
    }

    // If oldPasscode is provided, verify it (unless admin)
    const isAdmin = req.user?.role === 'admin'
    if (!isAdmin && oldPasscode && String(oldPasscode).trim() !== String(employee.passcode || '1234')) {
      return res.status(400).json({ success: false, message: 'Current 4-digit PIN is incorrect' })
    }

    employee.passcode = cleanPin
    await employee.save()

    res.json({
      success: true,
      message: '4-Digit PIN updated successfully',
      passcode: employee.passcode
    })
  } catch (error) {
    console.error('changePasscode error:', error)
    res.status(500).json({ success: false, message: 'Server error updating passcode PIN', error: error.message })
  }
}

// Update Profile
export const updateProfile = async (req, res) => {
  try {
    const { phone, address, emergencyContact, profileImageUrl, passcode } = req.body
    const employee = await Employee.findOne({ email: req.user.email.toLowerCase() })

    if (!employee) {
      return res.status(404).json({ success: false, message: 'Employee not found' })
    }

    if (phone !== undefined) employee.phone = phone
    if (address !== undefined) employee.address = address
    if (emergencyContact !== undefined) employee.emergencyContact = emergencyContact
    if (profileImageUrl !== undefined) employee.profileImageUrl = profileImageUrl
    if (passcode !== undefined && passcode.length === 4) employee.passcode = passcode

    await employee.save()
    res.json({ success: true, message: 'Profile updated successfully', user: employee })
  } catch (error) {
    console.error('updateProfile error:', error)
    res.status(500).json({ success: false, message: 'Error updating profile', error: error.message })
  }
}

