import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import Employee from '../models/Employee.js'
import Attendance from '../models/Attendance.js'

const isServerless = process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME
const FACE_UPLOADS_DIR = isServerless
  ? path.join('/tmp', 'face-uploads')
  : path.join(__dirname, '..', 'face-uploads')

// Ensure directory exists
try {
  if (!fs.existsSync(FACE_UPLOADS_DIR)) {
    fs.mkdirSync(FACE_UPLOADS_DIR, { recursive: true })
  }
} catch (e) {
  console.warn('Filesystem notice (face-uploads):', e.message)
}

const findEmployeeByIdentifier = async (rawIdentifier) => {
  const idStr = (rawIdentifier || '').trim()
  if (!idStr) return null
  const normalizedEmail = idStr.toLowerCase()
  const upperEmpId = idStr.toUpperCase()

  const emailAliases = [normalizedEmail]
  if (normalizedEmail === 'sanikapanaskar19@gmail.com') {
    emailAliases.push('sanikapanskar19@gmail.com')
  } else if (normalizedEmail === 'sanikapanskar19@gmail.com') {
    emailAliases.push('sanikapanaskar19@gmail.com')
  }

  return await Employee.findOne({
    $or: [
      { email: { $in: emailAliases } },
      { empId: upperEmpId }
    ]
  })
}

// ────────────────────────────────────────────────────────────────────────────────
// POST /api/face/enroll
// Body: { email, imageDataUrl, enrolledBy }
// Saves base64 image to disk; updates Employee.faceImageUrl
// ────────────────────────────────────────────────────────────────────────────────
export const enrollFace = async (req, res) => {
  const { email, imageDataUrl, enrolledBy, faceDescriptor } = req.body

  if (!email || !imageDataUrl) {
    return res.status(400).json({ success: false, message: 'Email and image are required' })
  }

  // Basic MIME validation
  if (!imageDataUrl.startsWith('data:image/')) {
    return res.status(400).json({ success: false, message: 'Invalid image format. Must be a valid image data URL.' })
  }

  // Extract MIME type and validate
  const mimeMatch = imageDataUrl.match(/^data:(image\/[a-zA-Z+]+);base64,/)
  if (!mimeMatch) {
    return res.status(400).json({ success: false, message: 'Invalid image data URL format' })
  }
  const mimeType = mimeMatch[1]
  const allowedMimes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
  if (!allowedMimes.includes(mimeType)) {
    return res.status(400).json({ success: false, message: 'Only JPEG, PNG, and WebP images are allowed' })
  }

  try {
    const employee = await findEmployeeByIdentifier(email)
    if (!employee) {
      return res.status(404).json({ success: false, message: 'Employee not found' })
    }

    // Sanitize filename using empId
    const safeEmpId = employee.empId.replace(/[^a-zA-Z0-9_-]/g, '_')
    const ext = mimeType === 'image/png' ? 'png' : 'jpg'
    const filename = `face_${safeEmpId}.${ext}`
    const filePath = path.join(FACE_UPLOADS_DIR, filename)

    // Remove old face image if exists and different filename
    if (employee.faceImageUrl) {
      const oldFilename = path.basename(employee.faceImageUrl)
      const oldPath = path.join(FACE_UPLOADS_DIR, oldFilename)
      if (fs.existsSync(oldPath)) {
        fs.unlinkSync(oldPath)
      }
    }

    // Decode base64 and write file
    const base64Data = imageDataUrl.replace(/^data:image\/[a-zA-Z+]+;base64,/, '')
    const imageBuffer = Buffer.from(base64Data, 'base64')

    // Validate size (max 5MB)
    if (imageBuffer.length > 5 * 1024 * 1024) {
      return res.status(400).json({ success: false, message: 'Image size must be under 5MB' })
    }

    fs.writeFileSync(filePath, imageBuffer)

    // Update employee record
    const faceImageUrl = `/face-uploads/${filename}`
    employee.faceImageUrl = faceImageUrl
    employee.faceEnrolledAt = new Date()
    // Store face descriptor if provided (512-d ArcFace or 128-d legacy embedding)
    if (faceDescriptor && Array.isArray(faceDescriptor) && (faceDescriptor.length === 512 || faceDescriptor.length === 128)) {
      employee.faceDescriptor = faceDescriptor
      employee.faceEmbeddingModel = faceDescriptor.length === 512 ? 'arcface-512d' : 'face-api-128d'
    }
    await employee.save()

    console.log(`[Face Enroll] Face enrolled for ${employee.name} (${employee.email}) by ${enrolledBy || 'self'} [Model: ${employee.faceEmbeddingModel || 'arcface-512d'}]`)

    return res.status(200).json({
      success: true,
      message: 'Face enrolled successfully',
      faceImageUrl,
      faceEnrolledAt: employee.faceEnrolledAt,
      hasDescriptor: !!(employee.faceDescriptor && employee.faceDescriptor.length > 0),
      embeddingDimension: employee.faceDescriptor?.length || 0,
      embeddingModel: employee.faceEmbeddingModel || 'arcface-512d'
    })
  } catch (error) {
    console.error('[Face Enroll Error]', error.message)
    return res.status(500).json({ success: false, message: 'Server error during face enrollment', error: error.message })
  }
}

// ────────────────────────────────────────────────────────────────────────────────
// GET /api/face/:email
// Returns the enrolled face image URL for a given employee email
// ────────────────────────────────────────────────────────────────────────────────
export const getEnrolledFace = async (req, res) => {
  const { email } = req.params

  try {
    const rawTarget = decodeURIComponent(email).trim()
    const employee = await findEmployeeByIdentifier(rawTarget)
    if (!employee) {
      return res.status(404).json({ success: false, message: 'Employee not found' })
    }

    if (!employee.faceImageUrl) {
      return res.status(200).json({
        success: true,
        enrolled: false,
        faceImageUrl: null,
        faceEnrolledAt: null
      })
    }

    return res.status(200).json({
      success: true,
      enrolled: true,
      faceImageUrl: employee.faceImageUrl,
      faceEnrolledAt: employee.faceEnrolledAt,
      hasDescriptor: !!(employee.faceDescriptor && employee.faceDescriptor.length > 0),
      embeddingDimension: employee.faceDescriptor?.length || 0,
      embeddingModel: employee.faceEmbeddingModel || (employee.faceDescriptor?.length === 512 ? 'arcface-512d' : 'face-api-128d'),
      faceDescriptor: employee.faceDescriptor || null,
      employeeName: employee.name,
      empId: employee.empId
    })
  } catch (error) {
    console.error('[Face Get Error]', error.message)
    return res.status(500).json({ success: false, message: 'Server error', error: error.message })
  }
}

// ────────────────────────────────────────────────────────────────────────────────
// DELETE /api/face/:email
// Admin-only: Resets (deletes) enrolled face for an employee
// ────────────────────────────────────────────────────────────────────────────────
export const resetFace = async (req, res) => {
  const { email } = req.params

  try {
    const rawTarget = decodeURIComponent(email).trim()
    const employee = await findEmployeeByIdentifier(rawTarget)
    if (!employee) {
      return res.status(404).json({ success: false, message: 'Employee not found' })
    }

    if (!employee.faceImageUrl) {
      return res.status(200).json({ success: true, message: 'No enrolled face to reset' })
    }

    // Delete file from disk
    const filename = path.basename(employee.faceImageUrl)
    const filePath = path.join(FACE_UPLOADS_DIR, filename)
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath)
    }

    // Clear DB fields
    employee.faceImageUrl = undefined
    employee.faceEnrolledAt = undefined
    employee.faceDescriptor = undefined
    employee.faceEmbeddingModel = undefined
    await employee.save()

    console.log(`[Face Reset] Face data cleared for ${employee.name} (${employee.email})`)

    return res.status(200).json({ success: true, message: `Face data reset for ${employee.name}` })
  } catch (error) {
    console.error('[Face Reset Error]', error.message)
    return res.status(500).json({ success: false, message: 'Server error', error: error.message })
  }
}

// ────────────────────────────────────────────────────────────────────────────────
// GET /api/face/all-status
// Admin: Returns all employees with their face enrollment status
// ────────────────────────────────────────────────────────────────────────────────
export const getAllFaceStatus = async (req, res) => {
  try {
    const employees = await Employee.find({ role: 'employee' })
      .select('empId name email department faceImageUrl faceEnrolledAt faceDescriptor faceEmbeddingModel status')
      .sort({ name: 1 })

    const result = employees.map(e => ({
      empId: e.empId,
      name: e.name,
      email: e.email,
      department: e.department,
      status: e.status,
      enrolled: !!e.faceImageUrl,
      faceImageUrl: e.faceImageUrl || null,
      faceEnrolledAt: e.faceEnrolledAt || null,
      hasDescriptor: !!(e.faceDescriptor && e.faceDescriptor.length > 0),
      embeddingDimension: e.faceDescriptor?.length || 0,
      embeddingModel: e.faceEmbeddingModel || (e.faceDescriptor?.length === 512 ? 'arcface-512d' : 'face-api-128d')
    }))

    return res.status(200).json({ success: true, employees: result })
  } catch (error) {
    console.error('[Face All Status Error]', error.message)
    return res.status(500).json({ success: false, message: 'Server error', error: error.message })
  }
}

// ────────────────────────────────────────────────────────────────────────────────
// POST /api/face/save-attendance-photo
// Saves photo URL and verification result to an attendance record
// Body: { email, date, photoType, imageDataUrl, faceVerified, faceScore, faceAlgorithm, cosineSimilarity, antiSpoofPassed, livenessScore }
// ────────────────────────────────────────────────────────────────────────────────
export const saveAttendancePhoto = async (req, res) => {
  const {
    email,
    date,
    photoType,
    imageDataUrl,
    faceVerified,
    faceScore,
    faceAlgorithm,
    cosineSimilarity,
    antiSpoofPassed,
    livenessScore
  } = req.body

  if (!email || !date || !imageDataUrl || !photoType) {
    return res.status(400).json({ success: false, message: 'email, date, photoType and imageDataUrl are required' })
  }

  try {
    // Save image to attendance-photos folder
    const attendancePhotosDir = isServerless
      ? path.join('/tmp', 'attendance-photos')
      : path.join(FACE_UPLOADS_DIR, '..', 'attendance-photos')
    try {
      if (!fs.existsSync(attendancePhotosDir)) {
        fs.mkdirSync(attendancePhotosDir, { recursive: true })
      }
    } catch (e) {}

    const employee = await findEmployeeByIdentifier(email)
    const empEmail = employee ? employee.email : email.toLowerCase()
    const safeEmail = empEmail.replace(/[^a-zA-Z0-9]/g, '_')
    const timestamp = Date.now()
    const filename = `${photoType}_${safeEmail}_${timestamp}.jpg`
    const filePath = path.join(attendancePhotosDir, filename)

    const base64Data = imageDataUrl.replace(/^data:image\/[a-zA-Z+]+;base64,/, '')
    const imageBuffer = Buffer.from(base64Data, 'base64')
    fs.writeFileSync(filePath, imageBuffer)

    const photoUrl = `/attendance-photos/${filename}`

    // Update attendance record
    const record = await Attendance.findOne({ 
      $or: [
        { employeeEmail: empEmail, date },
        { employeeEmail: email.toLowerCase(), date }
      ]
    })
    if (record) {
      if (photoType === 'checkin') {
        record.checkInPhoto = photoUrl
      } else {
        record.checkOutPhoto = photoUrl
      }
      if (faceVerified !== undefined) record.faceVerified = faceVerified
      if (faceScore !== undefined) record.faceScore = faceScore
      if (faceAlgorithm) record.faceAlgorithm = faceAlgorithm
      if (cosineSimilarity !== undefined) record.cosineSimilarity = cosineSimilarity
      if (antiSpoofPassed !== undefined) record.antiSpoofPassed = antiSpoofPassed
      if (livenessScore !== undefined) record.livenessScore = livenessScore
      record.faceVerifiedAt = new Date()
      await record.save()
    }

    return res.status(200).json({ success: true, photoUrl, message: 'Photo saved successfully' })
  } catch (error) {
    console.error('[Save Attendance Photo Error]', error.message)
    return res.status(500).json({ success: false, message: 'Server error', error: error.message })
  }
}

